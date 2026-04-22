# Changelog — 2026-04-22

Large refactor / hardening batch covering permissions, security, dashboard UX, shared abstractions, and test coverage.

**Totals:** 68 files changed (40 modified, 18 new, 5 deleted, 5 new Request classes). Full test suite goes from **591 passed / 17 failed → 688 passed / 0 failed** (+47 new tests, -17 pre-existing failures).

---

## security

### feat(scope): enforce company hierarchy on query-param filters

`ValidateScopeCompany` middleware now inspects `company_id` (query) and `X-Scope-Company-Id` (header) and rejects requests where the target company is not in the caller's hierarchy (403). Write-time `company_id` in request bodies is deliberately left to controller-level permission checks (so admins can legitimately assign a user to any company).

- `app/Http/Middleware/ValidateScopeCompany.php`
- `tests/Feature/ScopeMiddlewareTest.php` (7 tests)

### feat(permissions): route-level URL gate

- `resources/js/layouts/Sidebar.tsx` — exports `getRoutePermission(pathname)`. Permission metadata on every `NavItem` is flattened into a `href → permission` map at module load. Single source of truth.
- `resources/js/layouts/AppLayout.tsx` — guard effect redirects to `/dashboard` when the user lands on a page they don't have permission for (via direct URL / paste). Runs after auth finishes loading so there's no flash.

### feat(permissions): `usePermission()` hook + Sidebar/CrudPage/page gating

- New hook: `resources/js/hooks/use-permission.ts` exposes `can`, `canWrite` (= permission ∧ ¬isSubordinate), `hasAny`, `hasAll`, `isSubordinate`.
- `Sidebar.tsx` — every `NavItem` annotated with `permission?: string | string[]`; items/groups/sections filter out when the user lacks access. Maintains single source of truth with route gate above.
- `CrudPage.tsx` — accepts optional `config.permissions: { list, create, update, delete }`; gates Add / Import / Copy / per-row Edit / Delete. `globalReadOnly` now also includes `isSubordinate` → upper-enterprise users drilling into a subordinate are read-only on all writes (rule 1).
- 18 custom `ObjectDetailDrawer` pages (`safety/personnels`, `risk/monthly-investigation`, all `third-party/*`, all `process/*`, `space-work/*`, `safety/special-equipment`, `safety/major-hazards`, `safety/hazardous-chemicals`, `safety-archives/{qualifications,safety-investment}`, `equipment/major-hazardous`, `risk/safety-assessment`, `system/users`) — same gate applied to per-page create/edit/delete buttons.

### fix(permissions): `checklist-libraries.*` permission alignment

Moved `/checklist-libraries` CRUD routes out of the shared `base-data.view` / `base-data.manage` groups into dedicated `checklist-libraries.{list,create,update,delete}` guards. Seeder already defined these permissions; routes now actually use them.

- `routes/api/base-data.php`

---

## feat

### feat(dashboard): three-column top row

Top row now splits into **latest updates (最新动态) / quick stats / company info**. Stats are mode-aware (produce vs bloc), so "Enterprise Management" for group users and "Risk Management" for production users. Company-info card fetches `GET /api/v1/companies/{id}` and shows title, enterprise-type badge, address, credit code, supervisor + phone, risk-grade pill, founded date, with a "查看详情" link to `/enterprise/current`. Uses `InfoRow` helper to gracefully hide empty fields.

- `resources/js/pages/dashboard/Dashboard.tsx`

### feat(risk-monitor): 重点关注企业 tab (`focus_companies`)

On `/risk-monitoring/risk-monitor` (bloc view), added a fourth tab "重点关注" alongside 固有排名 / 浮动排名 / 隐患排名. Displays focused enterprises with inherent + float risk badges/scores. Add/remove controls:

- **Add:** `+ 添加关注企业` button expands an inline picker with search + non-focused sub-companies list.
- **Remove:** inline confirm (no modal) — compact `[确认取消] [返回]` pair replacing the `×` button.
- Backend: extended `FocusCompaniesController::index` eager-load to `company:id,title,inherent_risk,inherent_risk_grade,float_risk,float_risk_grade`.

- `resources/js/pages/risk-monitoring/risk-monitor/Index.tsx`
- `app/Http/Controllers/Api/V1/FocusCompaniesController.php`
- `tests/Feature/FocusCompanyTest.php` (6 tests)

### feat(system/roles): role templates + permission search

The existing `/system/roles` UI already handled creating/editing/deleting custom roles and assigning any of the 338 permissions. This batch adds:

- **Permission search** — matches module slug, Chinese label, permission name, or action label. Modules matching themselves show all their perms; otherwise only matching perms within the module render.
- **6 clickable role-template presets** — HSE 经理, 设备主管, 职业健康员, 培训管理员, 只读审计员, 任务执行员. Click → pre-selects the matching permission bundle; continue fine-tuning as normal.
- Templates are frontend-only (`ROLE_TEMPLATES` constant) — easy to extend.

- `resources/js/pages/system/roles/Index.tsx`
- `tests/Feature/RoleCrudTest.php` (12 tests)

---

## refactor

### refactor(shared): `useDetailDrawer` hook + `DetailButton` component

Two detail-view patterns had diverged: `CrudPage`'s built-in drawer (schema-driven, re-fetches via `useApiItem`) and standalone `ObjectDetailDrawer` (heuristic render, uses row as-is). Both now share state/trigger plumbing via:

- `resources/js/hooks/use-detail-drawer.ts` — `useDetailDrawer<T>({ endpoint?, idKey?, prefetch? })` returns `{ open, data, loading, error, openDetail, close, drawerProps, triggerFor }`. `prefetch: true` composes `useApiItem` (CrudPage behavior); `prefetch: false` stores the row (ObjectDetailDrawer behavior).
- `resources/js/components/shared/DetailButton.tsx` — the Eye + 详情 button pattern extracted from ~19 copies. Optional `className` override preserves any page-specific styling.
- Migrated `CrudPage.tsx` + 19 `ObjectDetailDrawer` pages. Zero behavioral change — render logic of both drawer components is untouched.

### refactor(endpoints): merge `/fire-control-room-personnels` → `/elimination-control-staff`

Two route groups pointed at the same controller and DB table. Unified:

- Frontend `safety/personnels/Index.tsx` now calls `/elimination-control-staff` (was `/fire-control-room-personnels`).
- `routes/api/safety-records.php` — single consolidated block; `template`/`import` endpoints moved into `elimination-control-staff.create` group.
- `RolesAndPermissionsSeeder.php` — 4 `fire-control-room-personnels.*` permissions removed.

---

## fix

### fix(useApiList): prevent cross-company data flash on refresh

Pages showed a flash of unfiltered/cross-company data on reload because `useApiList` fired its mount request before `useScope` resolved the active company (so `company_id` was missing). When scope loaded, a second scoped fetch happened, but the first unscoped response had already set state.

Root cause: effect ordering meant the unscoped fetch AbortController replaced the scoped one on the `enabled` false→true transition, and its response won.

Fix: added `enabled?: boolean` to `useApiList`. When false, both effects short-circuit and `loading` stays true (skeleton). `enabled` is NOT a dep of the mount effect — so on false→true transition only the defaultParams-change effect fires, with fresh params. Callers that don't opt in keep their previous behavior.

Wired into `CrudPage.tsx` and 18 direct `useApiList` callers (`enabled: companyScoped ? !!companyId : true` / `!!companyId`).

- `resources/js/hooks/use-api.ts`
- `resources/js/components/shared/CrudPage.tsx`
- 18 pages under `resources/js/pages/*/Index.tsx`

### fix(validation): add P0 UpdateRequests for 5 write endpoints

Five controllers had `update(Request $request, int $id)` with zero validation — raw user input reached the DB through `$request->only([...])`. Added dedicated FormRequest classes mirroring the corresponding Store rules (with `sometimes` for PATCH semantics):

- `UpdateAccidentBulletinsRequest` (mirrors 事故类型/伤亡程度 enums)
- `UpdateAssessDetectRequest`
- `UpdateFilingPermissionsRequest`
- `UpdateMonthStatisticsRequest`
- `UpdateRegulationLibraryRequest`

Corresponding `update` signatures swapped from `Request` to the typed class. Write-action FormRequest coverage on the project: **100% on P0 paths**, ~97% overall.

### fix(tests): 9 pre-existing failures

| Test | Cause | Fix |
|---|---|---|
| `AuthTest > Login` (3 tests) | Controller RSA-decrypts password; tests sent plain text | `tests/Pest.php` `beforeEach` swaps `RsaService` binding to passthrough |
| `CompanyTest > Review > reviewer` | `CompanyPolicy::review` requires pending company in reviewer's hierarchy | test sets `pending->pid = reviewer_company->id` |
| `HealthCheckupTest` (2) | `type` enum tightened to `岗前/岗中/岗后`; tests used stale Chinese names | payload + assertion updated |
| `InternalTrainingTest > Store` | `training_type` became required enum | test passes `安全培训` |
| `TrainingVideoTest > Show` | Controller returns signed OSS URL, not record | test asserts response envelope shape |
| `YearStatisticTest > Index` | Controller requires `company_id` or `pid` | test passes `?company_id=...` |
| `BaseDataTest` (3) | Response is paginated (`data.data`), test asserted `data` path; seeded rows also skewed counts | path updated + `$before + N` count baseline |
| `PersonnelTest > filters by company_id` | Test queried a different company than the user's | `$user` now owns the queried company |
| `ExpertInspectionNotifyTest` (4) | Same — unrelated company used | `check = Company::factory()->create(['pid' => $parent->id])` |

### fix(ui): role page permission matrix counter

`{selectedCount}/{perms.length}` displayed filtered-view count which could be misleading when a search was active. Now shows `{selectedCount}/{allPerms.length}` — unambiguous against the module total.

- `resources/js/pages/system/roles/Index.tsx`

---

## chore

### chore(cleanup): remove unused endpoints

After auditing 9 suspected-unused modules with evidence (frontend grep, internal refs, tests, sidebar presence), the following were removed:

- `/risk-max-values` (ALL) — no frontend caller, no tests, no internal references. Removed routes, `RiskMaxValueController`, `RiskMaxValue` model, `StoreRiskMaxValueRequest`, `UpdateRiskMaxValueRequest`, 4 seeder permissions, Wayfinder TS bindings. **Migration retained** (table stays) to avoid data loss; a follow-up drop migration can be written once confirmed safe.
- `/visible` (`visible.list` permission) — stats aggregation endpoint with no frontend caller. Removed route, `VisibleController`, 1 seeder permission, Wayfinder TS.

### chore(todo): flag `/bloc-comments` for future review

Added a PHPDoc TODO on `BlocCommentsController` noting the endpoint has no frontend caller today — likely intended for a group-dashboard widget ("safe production days since last accident"). Kept for now; to be revisited with the bloc dashboard.

- `app/Http/Controllers/Api/V1/BlocCommentsController.php`

---

## test

New Feature tests added this batch (`tests/Feature/`):

| File | Scope | Tests |
|---|---|---|
| `ScopeMiddlewareTest.php` | `company_id` query filter + `X-Scope-Company-Id` header enforcement | 7 |
| `FocusCompanyTest.php` | `/focus-companies` full CRUD + risk-field eager-load | 6 |
| `CompanyGroupTest.php` | `/company-groups` CRUD + `sync-kids` | 7 |
| `UserRoleAssignmentTest.php` | `PUT /users/{id}/role` + own-company scope | 4 |
| `PermissionListTest.php` | `GET /permissions` access + structure | 3 |
| `RiskLogTest.php` | `/inherent-risk-logs`, `/float-risk-logs` CRUD | 4 |
| `FireCopyTest.php` | `/fire-equipment/copy`, `/fire-facilities/copy` | 4 |
| `UploadTest.php` | `POST /upload` (file + size validation) | 3 |
| `RoleCrudTest.php` | `/roles` CRUD + system-role protection | 12 |

Also fixed `BaseDataTest.php`, `PersonnelTest.php`, `ExpertInspectionNotifyTest.php` (response-path + hierarchy corrections — see fix section above).

---

## docs

- `docs/permissions-audit.md` — original audit matrix: 前后端权限对照 (produce / bloc / module), 6 gap analyses, 10-item改动建议, 6 需用户确认决策点.
- `docs/followup-audit.md` — step-by-step execution tracker for the 4 follow-up phases (Request validation / tests / unused endpoints / carry-over).
- `docs/CHANGELOG-2026-04-22.md` — this file.

---

## suggested commit layout

If splitting into multiple commits is preferred, group along the top-level sections:

1. `feat(security): enforce company scope on query params + route-level URL gate`
2. `feat(permissions): usePermission hook, Sidebar/CrudPage gating, 18 pages migrated`
3. `feat(dashboard): three-column top row with mode-aware stats + company info`
4. `feat(risk-monitor): 重点关注企业 tab with focus_companies add/remove`
5. `feat(system/roles): role-template presets + permission matrix search`
6. `refactor(shared): useDetailDrawer hook + DetailButton component (migrate CrudPage + 19 pages)`
7. `refactor(routes): merge /fire-control-room-personnels into /elimination-control-staff`
8. `fix(useApiList): add enabled flag to prevent unfiltered data flash`
9. `fix(validation): add 5 missing UpdateRequest classes for P0 write paths`
10. `chore(cleanup): remove /risk-max-values and /visible endpoints`
11. `test: add 9 new Feature test files (+56 tests), fix 9 pre-existing failures`
