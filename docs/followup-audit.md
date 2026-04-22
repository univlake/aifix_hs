# 后续完善 · 跟踪清单

> 基于 `docs/permissions-audit.md` 的权限改造已完成 Phase 1+2（Sidebar / CrudPage / scope 中间件）。本文跟踪用户 2026-04-22 提出的四个后续步骤。

---

## 步骤 1：补齐 Request 校验

### P0（立即修复）— 5 个 update 方法没有任何校验
| Controller | 状态 |
|---|---|
| `AccidentBulletinsController::update` | ✅ 已创建 `UpdateAccidentBulletinsRequest` 并连线 |
| `AssessDetectController::update` | ✅ 已创建 `UpdateAssessDetectRequest` 并连线 |
| `FilingPermissionsController::update` | ✅ 已创建 `UpdateFilingPermissionsRequest` 并连线 |
| `MonthStatisticsController::update` | ✅ 已创建 `UpdateMonthStatisticsRequest` 并连线 |
| `RegulationLibraryController::update` | ✅ 已创建 `UpdateRegulationLibraryRequest` 并连线 |

相关测试（58 tests）全部通过；`AccidentBulletin / AssessDetect / FilingPermission / MonthStatistic / RegulationLibrary` 五组测试均绿。

### 孤立 Request 类（审查结果）
| Class | 处理 |
|---|---|
| `UpdateOperationalTypeRequest` | ✅ 审查发现实际已在 `OperationalTypeController::update` 使用，非孤立。前一次 Explore 结果不准 |
| `UpdateSpecialTypeRequest` | ✅ 审查发现实际已在 `SpecialTypeController::update` 使用，非孤立 |

### P1（后续）— 118 处 inline `$request->validate()`
多为列表/自定义动作的 query filter（index / export / confirm / review 等），属于合理使用；仅当它出现在写操作上时再改为 FormRequest。不在本次批处理。

### 现状概览
- 总 Controller 文件：120
- 总公开方法：590
- 使用 FormRequest：155
- 使用 inline validate：118
- 无校验：317（几乎都是 show/index/destroy，写操作仅 5 处）
- 写操作 FormRequest 覆盖率：156/161 ≈ **97%**

---

## 步骤 2：补齐接口测试

### 覆盖率现状
- 测试文件：69
- API 端点总数：约 1048
- 已覆盖：约 236（≈ 22.5%）
- 未覆盖：约 812

### 高价值未覆盖（优先添加）
| 模块 | 端点 | 原因 |
|---|---|---|
| `focus-companies` | GET/POST/DELETE | **本次新增功能**，零测试 |
| `base-data` 类字典 CRUD (14 个类) | ALL | 权限系统依赖，但零测试 |
| `/permissions` | GET | 系统管理读取 |
| `/users/{id}/role` | PUT | 角色分配 |
| `/company-groups/*` | ALL | 集团企业分组功能 |
| `/companies-review-list` | GET | 审批列表 |
| `/upload/*` / `/upload/oss-*` | ALL | OSS 上传链路 |
| `/office-notifies` CRUD | ALL | 任务通知 |
| `/new-notifies` CRUD | ALL | 新通知 |
| `/meeting-notices/*` (除 notify/confirm) | POST/PUT/DELETE | 会议通知 |
| `/fire-equipment/copy`, `/fire-facilities/copy` | POST | 复制流程 |
| `/float-risk-logs`, `/inherent-risk-logs`, `/risk-max-values` | ALL | 风险预警核心数据 |
| `/risk-distribution-maps` (GET) | GET | 仅测了 create |
| `/information-drafts/dashboardPending` | GET | Dashboard 使用 |

### 可能过时的测试（待审）
| Test 文件 | 原因 |
|---|---|
| `BaseDataTest.php` | 仅测了部分字典，缺失 `checklist-libraries`（刚改过权限名） |
| `ExternalTrainingTest.php` | 侧栏已合并进 `/training/education`，路由是否还用？ |
| `OtherTrainingTest.php` | 同上 |
| `AssessDetectTest.php` | 无对应侧栏入口（但页面存在） |

---

## 步骤 3：可能未使用的接口 / 页面（待确认）

### 前端页面疑似孤立（用户确认结果 2026-04-22）
| 页面 | 结论 |
|---|---|
| `/system/permissions` | ✅ 保留：Sidebar 实际有入口（Bloc 模式「系统管理」下），前次审计误判 |
| `/health/disease-report` | ✅ 保留：Sidebar 有独立入口，非 occupational-hazards 子集 |
| `/risk-monitoring/monthly-inspection` | ❌ 从清单清理（笔误；实际是 `/risk-control/monthly-inspection`） |

### 后端端点疑似冗余（用户确认结果 2026-04-22）

| 端点 | 决定 | 执行 |
|---|---|---|
| `/risk-max-values` (ALL) | 🗑️ **删除** | ✅ 路由 / Controller / Model / 2 个 FormRequest / seeder 权限 4 条 / Wayfinder TS / 对应测试 全部移除；迁移表保留（避免数据丢失，如需彻底清理可另写 drop migration） |
| `/bloc-comments` | 📝 **保留 TODO** | ✅ 已在 `BlocCommentsController.php` 顶部加 PHPDoc TODO 注释（计划为集团仪表盘「安全生产天数」卡片） |
| `/visible` (`visible.list`) | 🗑️ **删除** | ✅ 路由 / VisibleController / seeder 权限 1 条 / Wayfinder TS 全部移除 |
| `/fire-control-room-personnels` vs `/elimination-control-staff` | 🔄 **合并** | ✅ 前端 `safety/personnels/Index.tsx:536` 改用 `/elimination-control-staff`；路由文件两个 block 合成一个；seeder 权限 4 条移除；`template/import` 路径已添加到 elimination-control-staff group；controller/model/table 不变（它们本来就是同一套） |
| `/float-risk-logs`、`/inherent-risk-logs` | ✅ 保留（本轮已补测试） | — |
| `/base-data.manage` 下写操作 | ✅ 保留 | — （`/system/*-types/Index.tsx` 多个页面使用 CrudPage 调用） |
| `/safety-architectures` | ✅ 保留 | — （被 `Traits/CalculateRiskValue.php` 内部依赖） |
| `/occupational-health-safeties` | ✅ 保留 | — （被 `/safety-archives/qualifications/Index.tsx` 使用） |
| `/production-standardizations` | ✅ 保留 | — |

### 执行后遗留项
- `risk_max_values` 表本身未删除（数据安全考虑）。待用户后续明确确认后可写 drop migration 清理。
- `BlocCommentsController` 的 TODO 注释提醒未来集团仪表盘接入；如集团仪表盘最终不用，再一并清理。

---

## 步骤 4：承前未完成事项

参见 `docs/permissions-audit.md` 建议改动清单：
- ⬜ 19 个自定义 `ObjectDetailDrawer` 页面（`isSubordinate` 只读 + 权限按钮 gate）
- ⬜ 路由级 gate：无权用户直接访问页面 URL 时跳转 `/dashboard`
- ⬜ 角色模板 UI（item 9，明确推迟）

---

## 本次执行顺序

1. **步骤 1 · P0** — 创建 5 个缺失的 UpdateRequest → **✅ 完成**（58 tests 绿；2 个「孤立」误报已澄清）
2. **步骤 2 · 高价值测试** — 本轮完成：
   - ✅ `FocusCompanyTest.php`（6 tests）— `/focus-companies` CRUD + 风险字段 eager-load
   - ✅ `CompanyGroupTest.php`（7 tests）— 集团分组 CRUD + sync-kids
   - ✅ `UserRoleAssignmentTest.php`（4 tests）— `/users/{id}/role` 分配与校验
   - ✅ `PermissionListTest.php`（3 tests）— `/permissions` 权限列表
   - ✅ `RiskLogTest.php`（6 tests）— `/inherent-risk-logs`, `/float-risk-logs`, `/risk-max-values` 全部 CRUD
   - ✅ `FireCopyTest.php`（4 tests）— `/fire-equipment/copy`, `/fire-facilities/copy`
   - ✅ `UploadTest.php`（3 tests）— `/upload`
   - ✅ `ScopeMiddlewareTest.php`（7 tests，上一轮）— 企业范围中间件
   - ✅ 修复 `BaseDataTest.php`（3 个断言路径错误）
   - 已有但本轮调研后确认无需补：`MeetingTest.php`（23 tests，含 meeting-notices notify/confirm）、`OfficeNotifyTest.php`、`NewNotifyTest.php`
   - ⬜ OSS 上传 `/upload/oss-signature` / `/upload/multipart/*` 依赖真实 OSS 配置，需 mock，留待后续
   - **本轮新增 7 个测试文件，合计 40 新 tests，全部绿。**
3. **步骤 3 · 标记清单** — **✅ 完成**。用户确认后执行：合并 1 组路径、删除 2 个端点、标记 1 个 TODO；3 个前端页面全部保留；共移除 6 条 permission 项 + 3 个 PHP 类 + 2 份 FormRequest + 2 份 Wayfinder TS，减少 2 个 TypeScript 错误（原本由已删除的生成文件产生）
4. **步骤 4 · 承前** — 🟡 大部分完成：
   - ✅ 18 个自定义 `ObjectDetailDrawer` 页面全部添加 `usePermission` gate（`canCreate/canUpdate/canDelete` 覆盖新增/编辑/删除按钮）：
     - system/users, safety/personnels, process/confined-space, risk/monthly-investigation, safety/special-equipment, safety/major-hazards, safety/hazardous-chemicals, safety-archives/safety-investment（2 个组件）, third-party/construction-units, third-party/design-units, third-party/technical-services, space-work/space-works, equipment/major-hazardous, process/key-hazardous, process/hazardous, space-work/three-togethers, risk/safety-assessment, safety-archives/qualifications
   - ✅ 路由级 gate 已实现：
     - `resources/js/layouts/Sidebar.tsx` 增加 `getRoutePermission(pathname)` 导出，基于既有 `navSections[].permission` 数据自动构建 `href → permission` 映射（单一事实源）
     - `resources/js/layouts/AppLayout.tsx` 在认证完成后检查当前 URL 对应权限；无权则 `router.visit('/dashboard')`
     - 未登记权限的路径（如 `/dashboard` 本身、公开页面）保持原行为
   - ✅ 角色模板 UI — 完成：
     - 调研发现 `/system/roles` 页面的核心 UI 早已存在（创建自定义角色 + 勾选 338 个权限 + 模块级全选 + 受保护的系统角色）
     - 本轮新增：
       - `tests/Feature/RoleCrudTest.php` — 12 个测试覆盖列表/创建/更新/删除权限流 + 系统角色保护（全部绿）
       - 权限矩阵加搜索框：可按模块或权限名/动作标签搜索（338 条权限不再靠肉眼扫）
       - **角色模板（presets）**：一键预选常用权限组合，可继续微调。预置 6 个：HSE 经理、设备主管、职业健康员、培训管理员、只读审计员、任务执行员
       - 模板按钮位于编辑弹窗顶部，点击即覆盖已选权限（不破坏现有勾选的手动逻辑）

5. **遗留测试修复** — **✅ 完成**（9 个历史失败全部修复，`638 passed / 0 failed`）：
   - `YearStatisticTest` — 控制器要求 `company_id` 或 `pid`，测试补传 `company_id`
   - `TrainingVideoTest > Show` — 控制器返回签名 URL（非记录），断言改为验证响应结构
   - `HealthCheckupTest` — 类型枚举从 `入职检查/在岗检查/离岗检查` 过时值更新为 `岗前/岗中/岗后`（控制器现在要求的）
   - `InternalTrainingTest > Store` — `training_type` 现在必填（`in:新员工培训,消防培训,安全培训`），测试补传
   - `CompanyTest > Review > reviewer approve` — `CompanyPolicy::review` 要求 pendingCompany 在 reviewer 的企业层级下，测试补设 `pid = reviewerCompany->id`
   - `AuthTest > Login` (3 tests) — 控制器使用 `RsaService::decrypt` 解密密码，测试发明文失败。在 `tests/Pest.php` 的 `beforeEach` 里用匿名类替换 `RsaService` binding 为 passthrough decryptor

每完成一项更新本文对应行。
