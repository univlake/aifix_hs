# Code Review Report · aifix_hs

**Date:** 2026-04-22  
**Scope:** Full-repo review after this session's refactor series.  
**Branch:** `perf/risk-calc-and-month-stats-cleanup`

---

## 1. Executive Summary

aifix_hs is a Laravel 13 + Inertia v3 + React 19 safety-management platform covering ~115 Inertia pages and ~100 API controllers. Over this session the codebase received substantial tightening (nullability fix, trait restructure, bundle splitting, N+1 removals, +130 new tests bringing total to ~760, repo-wide format sweep, typed error handling). The project is in **good shape overall** — permissions are enforced at every layer, test coverage is now meaningful, and the refactors are behavior-preserving.

**Overall rating:** **B+**. Production-quality with a handful of recurring patterns that, if unaddressed, will accrue technical debt. None of the remaining issues are shipping blockers.

| Dimension | Grade | Direction |
|---|---|---|
| Architecture | B+ | Stable; layered middleware is well thought out |
| Security | A− | RSA-encrypted passwords, Passport OAuth2, scope middleware — strong posture |
| Performance | B+ | Big improvements this session; a few controllers still loop queries |
| Testing | B | From 22.5% → ~30% coverage; ~760 tests green; browser tests absent |
| Code quality | B | Typed error paths, but 5 page files > 1500 LOC; 44 index-based React keys |
| Maintainability | B+ | Well-organized, but some controllers (548 LOC) and React pages (2202 LOC) are too large |

---

## 2. Strengths

Real, not flattery:

1. **Defense-in-depth permissions.** Four gates stack: `auth:api` → `scope` (company boundary) → `permission:X` → page-level `usePermission`. The `ValidateScopeCompany` middleware is the right tool for a multi-tenant app and returns 403 before the controller runs, eliminating a whole class of leak bugs.
2. **Password handling is above average.** Browser RSA-encrypts the password before POSTing; the server decrypts via [RsaService.php](app/Services/RsaService.php). Tests swap in a passthrough decryptor rather than sending plaintext — good separation.
3. **`BaseModel` is doing useful work.** Every model inherits activity logging, soft deletes, and the `scopeActive` / `scopeForCompany` / `scopeInCompanies` helpers, eliminating ~1k LOC of boilerplate and giving consistent audit trails.
4. **Scheduled risk calculation is idempotent.** `risk:calculate` resets today's logs at the top of each run ([CalculateRiskValue.php:158-166](app/Traits/CalculateRiskValue.php:158)) — a second run on the same day is safe. Refactored this session into 14 focused methods.
5. **Frontend DRY via `CrudPage`.** [CrudPage.tsx](resources/js/components/shared/CrudPage.tsx) backs ~80% of the ledger pages; fix once, benefit everywhere.
6. **Wayfinder integration.** Backend controller actions are mirrored into typed TS clients, so refactoring a route surfaces a type error on every consumer.
7. **Tests are pragmatic, not dogmatic.** Characterization tests (e.g. [CalculateRiskValueTest.php](tests/Feature/CalculateRiskValueTest.php)) lock the output of the 900-line trait without trying to unit-test every branch — exactly the right trade-off for legacy-with-modernization work.

---

## 3. Findings by Severity

### 🔴 Critical
None.

### 🟠 High

#### H1. Page component sprawl (5 files > 1500 LOC)
```
2202   resources/js/pages/management/tasks/meeting-notices/Index.tsx
2107   resources/js/pages/management/assessment/scoring/Index.tsx
1621   resources/js/pages/management/tasks/notices/Index.tsx
1619   resources/js/pages/management/accidents/management/Index.tsx
1492   resources/js/pages/risk-control/monthly-investigation/Index.tsx
```
**Impact:** Debugging, onboarding, and test writing all degrade non-linearly past ~800 LOC. These files mix data fetching, form state, permissions, multiple modals, and list rendering.

**Recommendation:** Apply the same split pattern used this session for `expert-inspection` (1643 → 272 LOC orchestrator + 9 focused modules). Priority order:
1. `meeting-notices/Index.tsx` — 2202 LOC
2. `assessment/scoring/Index.tsx` — 2107 LOC

#### H2. Dashboard aggregators likely still have N+1s
We fixed `BlocRisksController` this session (14 → 1 query, 5N → 2). Analogous multi-query patterns almost certainly exist in:

- `RectificationSheetsController` (478 LOC)
- `ExpertInspectionsController` (476 LOC)
- `HomesController::earlyWarning` (currently a placeholder returning `[]` — real implementation will land and may repeat the BlocRisks mistake)

**Recommendation:** Audit with `DB::enableQueryLog()` in a staging environment. Any endpoint issuing > ~8 queries should be reviewed. Add query-count assertions in tests (we added two examples in [BlocRisksTest.php:69-120](tests/Feature/BlocRisksTest.php)).

#### H3. React error boundaries are effectively absent
Grep finds `ErrorBoundary` / `componentDidCatch` only in the new `<Suspense>` wrapper I just added. A single component crash (unhandled render exception) today blanks the whole page.

**Recommendation:** Wrap each top-level Inertia page in an ErrorBoundary via `AppLayout.tsx`, logging to the browser console + reporting to the backend. A simple one is ~30 lines.

### 🟡 Medium

#### M1. `pid`-based company hierarchy is shallow-only
Both `MonthStatisticsController::stuff` (§6.5 in user guide) and `BlocRisksController` aggregate over **direct children** (`Company::where('pid', X)`). Grandchildren are invisible.

**File refs:** [MonthStatisticsController.php:338](app/Http/Controllers/Api/V1/MonthStatisticsController.php:338), [BlocRisksController.php](app/Http/Controllers/Api/V1/BlocRisksController.php) (uses `ascTree` trait which only walks direct children — verify).

**Recommendation:** Either document this deliberately in the user guide (“reporting is one level deep”) or switch to recursive descendants like `CalculateRiskValue::loadCompanyTree()` now does ([trait.php:574-595](app/Traits/CalculateRiskValue.php:574)). Inconsistent depth is the worst outcome.

#### M2. 44 index-based React keys
Across 22 files, mostly in form-row contexts where it's technically safe but eslint will keep flagging. Options:
- Add `_localId: crypto.randomUUID()` to each row type (invasive)
- Add `// eslint-disable-next-line react/no-array-index-key` with a brief justification above each (pragmatic)

**Recommendation:** Pragmatic eslint suppression with a 1-line "why" comment. Eliminates the rule noise without invasive type changes.

#### M3. Deep controller → model magic-value coupling
`MonthStatisticsController::aggregateMonth` filters on literal Chinese strings: `'安全例会'`, `'消防例会'`, `'重大隐患'`, `'已整改'`, etc. ([file](app/Http/Controllers/Api/V1/MonthStatisticsController.php:389-440)). `CalculateRiskValue` has `'一级'` / `'二级'` / `'三级'` for production standardization grades.

**Impact:** A typo in a seeder (e.g. changing `'安全例会'` to `'安全例会 '` with a space) silently breaks aggregation with no error.

**Recommendation:** Introduce `App\Enums\MeetingType`, `App\Enums\HiddenDangerLevel`, `App\Enums\CorrectionResult`, etc. (PHP 8.1+ backed enums). Migrate DB values to the enum case strings and reference them everywhere. ~4 hours; prevents an entire category of silent data bugs.

#### M4. `DB::raw` in `hiddenDangerSort` embeds a date literal
I wrote this during the BlocRisks refactor this session ([BlocRisksController.php:227-234](app/Http/Controllers/Api/V1/BlocRisksController.php:227)):
```php
DB::raw("SUM(CASE WHEN updated_at NOT LIKE '{$today}%' THEN 1 ELSE 0 END) as total_old"),
```
`$today` is `date('Y-m-d')` so it's not user-controlled — no SQL injection. But it's a pattern that invites copy-paste abuse. Future maintainer copying this code with a request-derived variable would introduce injection.

**Recommendation:** Rewrite with bindings:
```php
->selectRaw('SUM(CASE WHEN updated_at NOT LIKE ? THEN 1 ELSE 0 END) as total_old', [$today.'%'])
```

#### M5. 38 unused legacy ESLint warnings absorbed into `tsconfig` — but `noUnusedLocals` blocking
Enabling `noUnusedLocals` + `noUnusedParameters` was rolled back earlier in the session because 24 identifiers surfaced. We fixed them all this session, and the flags are now on. Good. But the fix was opportunistic — no lint-staged / pre-commit hook prevents new dead imports from landing.

**Recommendation:** Add a `husky` + `lint-staged` config that runs `npm run lint` on touched files on commit. ~15 min.

#### M6. Inertia page auth is entirely client-side
`routes/web.php` line 11–12:
> Auth is enforced client-side (token in localStorage) via AppLayout's auth guard. API routes are still protected by auth:api — only the Inertia page shells are open.

Everyone can fetch `GET /dashboard` and see the page HTML shell (no data). This is a reasonable choice for SPA behavior but means an attacker can enumerate page names trivially.

**Impact:** Low (pages render nothing useful without a valid token). But an attacker probing the sidebar can learn which features exist.

**Recommendation:** Add session-based `auth` middleware to the authenticated page group, or at minimum to the admin-only routes (`/system/*`). A 302 to `/login` is lower-information than rendering the empty shell.

### 🟢 Low / Polish

#### L1. 5 page routes in the auth'd group at `routes/web.php` have no sidebar entry
- `/fire/equipment`, `/fire/facilities`
- `/accident/report`, `/accident/emergency`
- Various `/management/*` paths

Not reachable through UI navigation but routable by direct URL. Either wire them up to the sidebar or delete.

#### L2. Tailwind config ships 161 KB of CSS even with Tailwind v4 JIT
`npm run build` produces `app-CG-CfStO.css` at 161 KB. Reasonable for a 115-page SPA, but worth confirming Tailwind's content scanning is correctly limited to `resources/js/**/*.tsx`.

#### L3. `vite:react-babel` and `@inertiajs/vite` plugins take 95% of build time
`npm run build` emits a `[PLUGIN_TIMINGS] Warning`. Not urgent — builds still finish in ~6s — but if CI gets slow, this is where to look.

#### L4. `docs/archive/*.md` is ~110 KB of stale design documents
This session moved them out of the repo root. Consider deleting outright on next cleanup — git history preserves them.

#### L5. `DoubleCheck` / `DoubleCheckTemplate` models remain but API is gone
We deleted the controllers this session. The models are still used by `CheckStatisticsController` + `AssessmentSummaryController` for scoring calculations. **This is correct** — flagging only so future cleanup doesn't accidentally delete the models.

#### L6. No rate-limit differentiation by endpoint
`throttle:api` applies uniformly. Logins should be tighter (5/min) than list reads (60/min). Currently all 60/min.

---

## 4. Security Review

| Surface | Status |
|---|---|
| SQL injection | **Safe.** No `whereRaw($userInput)` or `DB::raw($userInput)` patterns. Only `DB::raw` with literal SQL or server-computed dates (see M4 for style improvement). |
| XSS | Inertia + React auto-escape by default. No `dangerouslySetInnerHTML` anywhere in `resources/js`. Safe. |
| CSRF | Handled by Laravel's web middleware for Inertia routes; API uses bearer token so no CSRF risk. |
| Password storage | bcrypt via Laravel's `Hash::make`. RSA decryption between browser and server protects over-the-wire (M6-adjacent: still requires HTTPS in production — confirm). |
| Authorization | Defense-in-depth (middleware + policy-ish + UI gate). Gaps: see M6 (page shells). |
| File upload | OSS signed upload. `OssUploadField` filters by `accept` on client side only — server must still validate MIME type before trusting. |
| Session fixation | Passport OAuth2 + Personal Access Tokens. Standard. |
| Mass assignment | Every model has explicit `$fillable`. No models use `$guarded = []`. |
| Authorization on API | Verified via `scope` + `permission:X`. Every write endpoint has both. |

**Verdict:** Strong posture. Main recommendation — tighten login rate limit (L6) and consider M6.

---

## 5. Performance

**Fixed this session:**
- `risk:calculate` — removed dead writes to `risk_max_values` (saves ~10k inserts/day per 100 companies)
- `MonthStatisticsController::aggregateMonth` — 21 → 12 queries via conditional aggregates
- `BlocRisksController::getRiskLog` — 14 → 1 query
- `BlocRisksController::hiddenDangerSort` — 5N → 2 queries
- `CalculateRiskValue::calculateBlocRisk` — N+1 on `collectBlocDescendants` recursion → single tree load + walk
- `CalculateRiskValue` — per-company `Company::update()` replaced with `batchUpdateCompanies()` (one CASE-WHEN UPDATE per attribute instead of 2N round-trips)
- Frontend: `enterprise/current/Index.tsx` — lazy-load map modals (saves ~270 KB on initial page load)

**Known remaining:**
- Probably more N+1s in `RectificationSheetsController`, `ExpertInspectionsController`, `HomesController`, `TodosController` (see H2)
- The 161 KB Tailwind CSS bundle (L2)
- `MonthStatistic` children still use `Model::create()` in loops via helpers — not a bug but not the fastest. We considered `insert()` batching and kept the Eloquent path for activity logging

**Database:**
- All FK-like columns indexed (`company_id`, `user_id`, `last_user_id` across 80+ tables)
- Real FK constraints added in [add_foreign_key_constraints.php](database/migrations/2026_04_14_083052_add_foreign_key_constraints.php) — 15 constraints, reasonable coverage
- `risk_logs.old_risk_num` now nullable (fixed this session)

---

## 6. Test Coverage

**Current state:**
- ~760 tests, 1500+ assertions, all green
- Pest 4 + Laravel HTTP test client (no browser tests)
- Full suite runs in ~5 minutes
- Focused file runs typically < 10 seconds

**This session added:**
- Characterization tests for `CalculateRiskValue` trait (6 tests)
- `MonthStatisticsAggregate` (3 tests, 65 assertions, query-count budget)
- 5 ledger CRUD files (50 tests)
- 4 workflow files (41 tests): `HiddenDangerLifecycle`, `BlocRisks`, `DailyCheckWorkflow`, `InspectionWorkflow`
- `PageRouteSmokeTest` — visits all 114 Inertia routes in 0.84s
- Various peer fixes during the refactors

**Gaps:**
- Browser tests (Pest 4 supports them via Playwright, we skipped setup)
- `RectificationSheetsController` untested
- `ExpertInspectionsController` export endpoints (Word / Excel generation) untested
- OSS upload mock harness missing (upload smoke tests rely on real OSS)
- AccidentChecks / NormChecks **controllers** untested beyond what's in `InspectionWorkflowTest.php`
- No load tests

**Verdict:** Coverage is sufficient for a B+ grade. Browser tests would push to A−.

---

## 7. Code Quality

### PHP
- **Pint formatter** enforces Laravel conventions, run repo-wide this session
- **Type hints** present on all method parameters + returns
- **PHP 8.4** — uses modern features (constructor promotion, `match`, readonly where appropriate)
- **Most controllers** 100-300 LOC — reasonable. Outliers: `MonthStatisticsController` (548), `RectificationSheetsController` (478), `ExpertInspectionsController` (476)
- **No static analysis** (PHPStan / Psalm) — would catch classes of bugs Pint can't

### TypeScript / React
- **Strict tsconfig** — `strict: true`, `noImplicitAny`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters` all enabled
- **Typed error paths** — the full session's `catch (err: any)` → `catch (err: unknown)` migration is complete
- **No `@ts-ignore`** in recent code (found via grep)
- **Shared hooks**: `use-api`, `use-permission`, `use-scope`, `use-detail-drawer`, `use-auth` — well-abstracted
- **CrudPage** backs 80% of ledger pages with consistent behavior

### Observations
- Prettier is configured (`.prettierrc`) and was run repo-wide
- ESLint passes with `--fix` applied
- Build produces 0 errors
- Type-check has ~20 pre-existing errors in auto-generated Wayfinder TS files (not our code); manual code has 0

---

## 8. Maintainability

**Good:**
- Clear directory structure (`app/Http/Controllers/Api/V1/`, `resources/js/pages/{module}/{page}/Index.tsx`)
- Routes split by domain (`routes/api/{auth,companies,safety-records,safety-ledger,...}.php`)
- Models follow 1:1 mapping with tables and have explicit relationships
- `BaseModel` gives everyone soft deletes + activity log without opt-in
- `RolesAndPermissionsSeeder` is the single source of truth for 338 permissions — easy to audit

**Rough edges:**
- Some Chinese + English mixing in comments (fine, but not 100% consistent)
- No ADRs (Architecture Decision Records) — the `why` behind some design choices is lost
- `CalculateRiskValue` weights are now in constants but the original references to the evaluation spec (which paper/standard?) are not in the code
- No `CONTRIBUTING.md`

---

## 9. Prioritized Roadmap

### Sprint 1 (1–2 days, high value)
1. **Split the top 2 page monoliths** (H1) — `meeting-notices` + `assessment/scoring`. Apply the `expert-inspection` pattern.
2. **Add React error boundaries** (H3) — wrap `AppLayout.tsx`, ~30 LOC.
3. **Tighten login rate limit** (L6 / M6) — `Route::middleware('throttle:5,1')->post('/login', ...)`.
4. **Replace Chinese literal strings with Enums** (M3) — starts with `HiddenDangerLevel`, `CorrectionResult`.

### Sprint 2 (3–5 days)
5. **N+1 audit on remaining 5 controllers** (H2) with query-count regression tests.
6. **Implement `HomesController::earlyWarning` and `TodosController::index`** — currently placeholders.
7. **Add Pest 4 browser tests for 10 critical flows** — login, CRUD happy path for a ledger, expert-inspection plan→archive.
8. **Address 44 index-based React keys** (M2) — pragmatic suppressions with `// why` comments.

### Sprint 3 (1 week)
9. **Install PHPStan level 5+** and fix the top tier of findings.
10. **Husky + lint-staged** for pre-commit type-check + pint.
11. **Archive or delete the orphaned web routes** (L1).
12. **Write ADRs** for the 5–10 non-obvious decisions: why dual `CalculateRiskValue` trait, why OSS signed upload, why client-side Inertia auth.

### Tech debt paid in this session (no further action needed)
- `risk_max_values` dead writes — removed
- `old_risk_num` NOT NULL constraint — nullable
- `BlocRisks` N+1s — fixed
- `MonthStatistic` aggregate queries — consolidated
- `CalculateRiskValue` silent try/catch — now logs
- `ConstructionUnit` / `TechnicalServiceUnit` duplicate infrastructure — deleted
- `DoubleChecks` / `BlocComments` dead endpoints — deleted
- Stale root-level docs — archived
- Repo-wide format — done
- `catch (err: any)` — all 38 sites migrated
- Inertia page smoke test — added

---

## 10. Closing Notes

The codebase is well-structured for its size (~41k LOC TSX, ~100 controllers). The layered permission model is the strongest architectural decision; it pays dividends whenever a new route is added. The biggest remaining risk is the React page sprawl — three more weeks of additions without splits and those 2000-LOC files become 3000-LOC files.

No single issue in this report is urgent. But collectively, Sprint 1's four items would move the overall grade from B+ to A−, and Sprint 2's work would close most of the coverage and observability gaps.

---

**Reviewer:** Claude Opus 4.7 (via Claude Code)  
**Method:** Full-repo walkthrough + grep-based targeted audits + direct session involvement with 12 commits of refactor/test work.

> For questions or clarifications on specific findings, the file/line references above point to the source.
