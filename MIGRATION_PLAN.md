# hs_ai → aifix_hs 迁移重构计划 v2

## 📊 项目对比

| 维度 | 旧项目 (hs_ai) | 新项目 (aifix_hs) |
|------|---------------|-------------------|
| **Laravel** | 8.x (`^8.12`) | 13.x (`^13.0`) |
| **PHP** | 7.3 / 8.0 | 8.3+ |
| **前端** | 纯 API (小程序 + 后台) | **本次不做前端，仅 API** |
| **认证** | Passport (`^10.1`) | 待定 (推荐 Sanctum / Passport 13) |
| **权限** | Spatie Permission (`^4.0`) | 待定 (推荐 `^6.0`) |
| **队列** | Horizon (`^5.7`) | 待定 |
| **Excel** | Maatwebsite (`^3.1`) | 待定 |
| **代码量** | 88 个 API 控制器 / 14000+ 行 / 113 个 Model / 135 个 Migration | 空白脚手架 |

## 🔗 模块耦合关系分析

### 核心依赖链
```
User ──company_id──→ Company ──pid──→ Company (层级树)
  │                      │
  │                      ├── EnterpriseType
  │                      ├── OperationalType
  │                      └── BaseArea
  │
  └── Personnel (人员，也绑 company_id)
```

**几乎所有业务模块都依赖 company_id**，Company 是整个系统的根节点。

### 强耦合模块 (必须同批迁移)
| 耦合组 | 包含模块 | 原因 |
|--------|---------|------|
| **认证+企业** | User, Company, Personnel, BaseArea, EnterpriseType, OperationalType, Authorization | 登录拿公司ID → 查下属公司 → 查数据 |
| **隐患整改** | HiddenDangerInfo, RectificationSheet, HiddenUploadAnnex | 整改单直接引用隐患表 |
| **检查统计** | DailyCheck, DoubleCheck, SystemCheck, NormCheck, AccidentCheck, AddPoint, CheckStatistics | 统计模块聚合所有检查类型 |
| **风险+月度** | Hazard, RiskLog, InherentRiskLog, FloatRiskLog, MonthlyInvestigation, RiskMaxValue | 月度排查基于风险清单 |
| **月度统计** | MonthStatistics → **依赖 17 个 Model** | 聚合: 事故、设备、演练、培训、投入等 |
| **可视化** | VisibleController → 聚合 10+ Model | 大屏展示，最后做 |

### 可独立迁移的模块 (简单 CRUD)
Building, CertificateStatus, DangerousCraftType, EnterpriseType, OperationalType, ProcessType, RecordType, SpecialType, SpaceWorkType, SafetyManagementType, RegulationLibraryType, TrainingClassType, etc.

---

## 🗓️ 迁移执行计划 (7 阶段，不含前端)

### 阶段 0: 基础设施搭建 (1-2天)
> 目标: 新项目能连 DB、能认证、有统一架构

- [ ] **0.1** 安装核心依赖
  - `laravel/passport` (或 `laravel/sanctum`)
  - `spatie/laravel-permission`
  - `laravel/horizon`
  - `maatwebsite/excel`
  - `spatie/laravel-activitylog`
- [ ] **0.2** 配置数据库连接（旧库只读测试）
- [ ] **0.3** 注册 API 路由 (`bootstrap/app.php` → `withRouting(api: ...)`)
- [ ] **0.4** 创建目录结构
  ```
  app/Http/Controllers/Api/v1/
  app/Http/Requests/
  app/Http/Resources/
  app/Services/
  app/Policies/
  app/Enums/
  app/Traits/
  ```
- [ ] **0.5** 迁移 ApiResponse Trait → 统一响应格式
- [ ] **0.6** 迁移 ApiTree Trait → 层级树工具
- [ ] **0.7** 迁移 BaseModel → 适配 Laravel 13 (`$dates` → `$casts`)
- [ ] **0.8** 创建 `CHANGELOG.md` 和 `MIGRATION_LOG.md`

**产出**: 新项目启动、连库、有基础框架

---

### 阶段 1: 认证 + 企业 + 人员 (3-4天) ⭐ 必须一起
> 目标: 能登录、能获取公司树、能查人员

> ⚠️ **关键约束**: 登录接口返回 token + company_id，后续所有业务查询都依赖 company_id 和下属公司树。
> 这 6 个模块必须同批完成，否则其他业务无法测试。

**批次 1.1: 枚举 + 基础类型 (Day 1)**
- [ ] 迁移 Enums: `CompanyStatus`, `UserType` → PHP 8.1 原生 Enum
- [ ] 迁移 EnterpriseType Model + Migration
- [ ] 迁移 OperationalType Model + Migration
- [ ] 迁移 BaseArea Model + Migration
- [ ] 迁移 RecordType Model + Migration
- [ ] 对比日志: 枚举从 bensampo → 原生 Enum

**批次 1.2: 企业 + 用户 + 认证 (Day 1-3)**
- [ ] 迁移 Company Model → 适配 Laravel 13
  - `$dates` → `$casts`
  - 层级关系 `pid` + `companies()` hasMany
  - 状态 accessor
- [ ] 迁移 Company Migration → **优化**: 合并旧的多个 add_xxx migration 为干净的单文件
- [ ] 迁移 User Model → 适配
  - 移除 `$fillable` 中的 `password`（安全修复）
  - Passport → Sanctum/Passport 13
  - 添加 `$casts` (email_verified_at, etc.)
- [ ] 迁移 User Migration → 合并为单文件
- [ ] 迁移 Personnel Model + Migration
- [ ] 迁移 AuthorizationController → 注册/登录/刷新
  - 添加 Form Request 验证
  - 添加 Rate Limiting
- [ ] 实现 CompanyPolicy (查看/编辑权限)
- [ ] 实现 UserController (CRUD)
- [ ] 实现 CompaniesController (CRUD + 公司树查询)
- [ ] 实现 PersonnelsController (CRUD)
- [ ] **并发优化**: 公司树查询用缓存 (递归查询改为 CTE 或缓存)
- [ ] 对比日志: 认证流程差异、公司树查询优化

**批次 1.3: 企业分组 (Day 3-4)**
- [ ] 迁移 CompanyGroup + CompanyGroupKid Model + Migration
- [ ] 迁移 CompanyGroupsController
- [ ] 对比日志

**产出**: 登录 → 获取 token → 查公司 → 查人员，全链路通

---

### 阶段 2: 文件上传 + 工具服务 (1-2天)
> 目标: 大文件上传可用、OSS 上传可用

- [ ] **2.1** 迁移 UploadController → 本地上传
  - **大文件优化**: 添加分片上传 / 流式上传
  - **并发优化**: 上传接口加 Rate Limiting
  - 文件大小限制配置化
- [ ] **2.2** 迁移 UploadOssController → OSS 上传
  - OSS SDK 升级适配
  - 直传签名 (减少服务器中转)
- [ ] **2.3** 迁移 UploadOssVideoController → 视频上传
  - 大视频分片上传
  - 上传进度回调
- [ ] **2.4** 配置 `filesystems.php` (local / oss disks)
- [ ] **2.5** 创建 UploadService (统一上传逻辑，三个控制器共用)
- [ ] **2.6** 迁移 FilingPermissionsController (审批附件需要上传)
- [ ] 对比日志: 上传方式变化、并发限制配置

**产出**: 文件上传全链路可用

---

### 阶段 3: 简单 CRUD 模块 (2-3天) ⚡ 快速推进
> 目标: 独立字典/配置表、不依赖其他业务的简单模块先过来

> 这些模块大多是独立的增删改查，互不依赖，可以并行迁移。

**批次 3.1: 字典/类型表 (纯 CRUD)**
- [ ] DangerousCraftType (危险工艺类型)
- [ ] ProcessType (工艺类型)
- [ ] SpecialType (特种设备类型)
- [ ] SpaceWorkType (有限空间类型)
- [ ] SafetyManagementType (安全管理类型)
- [ ] RegulationLibraryType (法规类型)
- [ ] TrainingClassType (培训课堂类型)
- [ ] ChecklistLibrary (清单库)
- [ ] ReportConfig (报表配置)
- [ ] 注意: 这些大多是 10-30 行的简单控制器，直接生成即可

**批次 3.2: 简单业务 CRUD**
- [ ] BuildingsController (建筑管理)
- [ ] JobManagementController (岗位管理)
- [ ] SafetyArchitecturesController (安全架构)
- [ ] ProductionStandardizationsController (安全标准化)
- [ ] SafetyManagementController (安全管理)
- [ ] CertificateStatusController (证书状态)
- [ ] EliminationControlStaffController (淘汰人员管控)
- [ ] SkillUnitsController + SkillUnitKid (技能单元)
- [ ] DesignUnitsController (设计单位)
- [ ] EvaluationUnitsController (评价单位)
- [ ] ChangeManagesController (变更管理)
- [ ] RegulationLibrariesController (法规库)
- [ ] 对比日志: 迁移清单

**产出**: 20+ 简单模块可用，进度条快速推进

---

### 阶段 4: 核心安全业务 (4-5天) 🔒
> 目标: 安全台账、职业健康、消防、应急、培训

> 这些模块都依赖 Company (company_id)，但彼此之间耦合较弱，可以分批做。

**批次 4.1: 安全台账 (Day 1-2)**
- [ ] SpecialEquipment + SpecialEquipmentStaff Model + Migration
- [ ] SpecialEquipmentController → Service 重构
- [ ] DangerousEquipment Model + Migration
- [ ] DangerousEquipmentController
- [ ] HazardousChemical + ChemicalIngredient Model + Migration
- [ ] HazardousChemicalsController
- [ ] HazardousProcess Model + Migration
- [ ] HazardousProcessesController
- [ ] MajorHazard + MajorConstitute + MajorHazardousProcess Model + Migration
- [ ] MajorHazardsController + MajorHazardMapController + MajorHazardousProcessesController
- [ ] SpaceWork Model + Migration
- [ ] SpaceWorksController
- [ ] **Excel 导入导出适配** (DangerousEquipmentExport/Import, etc.)
- [ ] 对比日志: 台账数据结构

**批次 4.2: 职业健康 (Day 2-3)**
- [ ] OccupationalHazard Model + Migration
- [ ] OccupationalHazardsController
- [ ] HealthSystem Model + Migration
- [ ] HealthSystemsController
- [ ] HealthFile Model + Migration
- [ ] HealthFilesController (含 Excel 导入)
- [ ] HealthReport + HealthCheckup Model + Migration
- [ ] HealthReportsController + HealthCheckupsController
- [ ] HygieneEvaluation Model + Migration
- [ ] HygieneEvaluationsController
- [ ] 对比日志

**批次 4.3: 消防 + 应急 (Day 3-4)**
- [ ] FireSafety + FireEquipment + FireFacility Model + Migration
- [ ] FireSafetiesController + FireEquipmentsController + FireFacilitiesController
- [ ] EmergencyDrill + EmergencySupplies + EmergencyTeam + EmergencyTeamKid Model + Migration
- [ ] EmergencyDrillsController + EmergencySuppliesController + EmergencyTeamsController
- [ ] ThreeTogether Model + Migration
- [ ] ThreeTogethersController
- [ ] 对比日志

**批次 4.4: 培训 + 会议 + 通知 (Day 4-5)**
- [ ] InternalTraining + ExternalTraining + OtherTraining Model + Migration
- [ ] InternalTrainingsController + ExternalTrainingsController + OtherTrainingsController
- [ ] TrainingFile + TrainingFileLog + TrainingVideo + TrainingVideoLog Model + Migration
- [ ] TrainingFileController + TrainingVideoController
- [ ] TrainingClass + TrainingClassInfo Model + Migration
- [ ] Meeting + MeetingNotice + MeetingSignUp Model + Migration
- [ ] MeetingsController + MeetingSignUpsController
- [ ] InternalMeeting + InternalMeetingKid Model + Migration
- [ ] InternalMeetingsController
- [ ] OfficeNotify + OfficeNotifyScope Model + Migration
- [ ] OfficeNotifiesController
- [ ] NewNotify + NewNotifyScope Model + Migration
- [ ] NewNotifiesController
- [ ] SecurityInvestment + FundingExecution Model + Migration
- [ ] SecurityInvestmentsController + FundingExecutionsController
- [ ] 对比日志

**产出**: 核心安全业务全部可用

---

### 阶段 5: 隐患排查 + 风险管控 + 检查 (4-5天) 🔍
> 目标: 业务流程最复杂的模块群

> ⚠️ 这些模块之间有工作流依赖: 检查发现隐患 → 隐患生成整改单 → 整改确认。
> 风险管控独立但数据量大。尽量一起迁移。

**批次 5.1: 隐患 + 整改 (强耦合，必须一起) (Day 1-2)**
- [ ] HiddenDangerInfo + HiddenUploadAnnex Model + Migration
- [ ] HiddenDangerInfoController → Service 重构
- [ ] RectificationSheet Model + Migration
- [ ] RectificationSheetController (1214行!) → **必须拆分**
  - RectificationSheetService (业务逻辑)
  - RectificationSheetExportService (导出)
  - RectificationSheetCountController (统计)
- [ ] 对比日志: 隐患整改流程差异

**批次 5.2: 风险管控 (Day 2-3)**
- [ ] Hazard + RiskLog + InherentRiskLog + FloatRiskLog + RiskMaxValue Model + Migration
- [ ] RisksController → Service 重构
  - 风险计算逻辑迁移
  - CalculateRiskValue Trait/Job 迁移
- [ ] RiskDistributionMap Model + Migration
- [ ] RiskDistributionMapsController
- [ ] MonthlyInvestigation + MonthlyInvestigationReview + MonthlyInvestigationView Model + Migration
- [ ] MonthlyInvestigationsController
- [ ] **并发优化**: 风险计算用队列 Job
- [ ] 对比日志: 风险计算逻辑验证

**批次 5.3: 检查管理 (Day 3-5)**
- [ ] DailyCheck + DailyCheckTemplate Model + Migration
- [ ] DailyChecksController (Check)
- [ ] DoubleCheck + DoubleCheckTemplate Model + Migration
- [ ] DoubleChecksController (Check)
- [ ] SystemCheck Model + Migration
- [ ] SystemChecksController (Check)
- [ ] NormCheck Model + Migration
- [ ] NormChecksController (Check)
- [ ] AccidentCheck + AccidentCheckTemplate Model + Migration
- [ ] AccidentChecksController (Check)
- [ ] AddPoint + AddPointsTemplate Model + Migration
- [ ] AddPointsController (Check)
- [ ] **CheckStatisticsController** → 聚合所有检查类型
  - 重构为 CheckStatisticsService
- [ ] OnlineInspectionController → 聚合在线检查
- [ ] 对比日志: 检查流程对比

**产出**: 隐患排查完整流程可用

---

### 阶段 6: 统计 + 事故 + 集团 + 剩余 (3-4天) 📊
> 目标: 聚合模块、事故快报、集团管控、专家管理

> ⚠️ 月度统计依赖 17 个 Model，必须在前面模块都完成后才能做。

**批次 6.1: 事故 + 信息 (Day 1)**
- [ ] AccidentBulletin + AccidentBulletinKid Model + Migration
- [ ] AccidentBulletinsController
- [ ] InformationDraft Model + Migration
- [ ] InformationDraftsController
- [ ] ExpertCompany + ExpertInspection + ExpertInspectionUser Model + Migration
- [ ] ExpertCompaniesController + ExpertInspectionsController

**批次 6.2: 月度统计 (P0 - 重构重点) (Day 1-2)**
- [ ] MonthStatistic + MonthStatisticAccident + MonthStatisticControl Model + Migration
- [ ] MonthStatisticsController (722行!) → **彻底重构**
  - MonthStatisticService (CRUD)
  - MonthStatisticReportService (统计逻辑)
  - MonthStatisticFillService (数据填充)
- [ ] **查询优化**: N+1 → eager loading
- [ ] **索引优化**: 为 month_statistics 添加复合索引
- [ ] **并发优化**: 统计报表生成用队列
- [ ] 对比日志: 统计数据输出逐项对比

**批次 6.3: 年度统计 (Day 2)**
- [ ] YearStatistic + YearStatisticKid Model + Migration
- [ ] YearStatisticsController → Service 重构

**批次 6.4: 集团管控 (Day 2-3)**
- [ ] BlocRisksController → 集团风险聚合
- [ ] BlocExpertsController
- [ ] BlocNoticesController
- [ ] BlocAccidentBulletinsController
- [ ] BlocCommentsController
- [ ] BlocExpertUser Model + Migration

**批次 6.5: 剩余模块 (Day 3-4)**
- [ ] TodoController → 待办事项
- [ ] HomesController → 首页数据
- [ ] FocusCompaniesController → 重点关注企业
- [ ] CompanyMapController → 企业地图
- [ ] EnterpriseReportController → 企业报表
- [ ] CompanyGroup 相关路由
- [ ] VisibleController → **最后做** (依赖所有模块)
  - 重构为 VisibleService
- [ ] 对比日志

**产出**: 全部 API 迁移完成

---

## 📐 每次迁移执行规范

### 迁移前
```
□ 旧模块代码已阅读理解
□ 相关 Model 关系已梳理
□ 依赖模块已迁移或同批处理
□ 旧表结构已对比
```

### 迁移中规则
| 规则 | 说明 |
|------|------|
| **Model** | `$dates` → `$casts`，添加类型提示，`$fillable` 审查 |
| **Controller** | > 100 行必须拆 Service，添加 Form Request |
| **Validation** | `Validator::make()` → Form Request 类 |
| **Auth** | 每个方法加授权检查 (Policy) |
| **路由** | `/admin/v1/xxx` → `/api/v1/xxx` |
| **DB 索引** | 所有外键字段必须加索引 |
| **DB 迁移** | 旧的多个 alter 合并为干净的单文件 |

### 迁移后
```
□ API 响应格式一致 (对比旧接口 JSON)
□ 数据库查询结果一致
□ 权限控制生效
□ Pest 测试通过
□ 记录到 MIGRATION_LOG.md
```

---

## 🗄️ 数据库迁移优化策略

### 原则
1. **合并碎片**: 旧项目 135 个 migration，很多是 `add_xxx_to_yyy_table` 的增量修改
   → 新项目合并为每表一个干净的 migration
2. **保留旧数据兼容**: 字段名、类型尽量不变，只优化索引和约束
3. **新增索引**: 所有 `company_id`、`created_at`、常用查询字段加索引
4. **外键约束**: 旧项目没有外键，新项目添加 `->constrained()` (可选 cascade)

### 合并示例
```
旧: 2021_05_10_create_personnels_table.php
旧: 2021_08_26_add_role_id_to_user_table.php
旧: 2021_11_15_add_weixin_session_key_to_users_table.php
旧: 2021_10_18_update_is_expert_to_users_table.php
    ↓
新: 2026_01_01_create_users_table.php (包含所有字段，一次性)
```

### 新增索引清单
```sql
-- 所有 company_id 外键
ALTER TABLE personnels ADD INDEX idx_company_id (company_id);
ALTER TABLE special_equipment ADD INDEX idx_company_id (company_id);
ALTER TABLE monthly_investigations ADD INDEX idx_company_id (company_id);
-- ... 所有含 company_id 的表

-- 时间范围查询
ALTER TABLE month_statistics ADD INDEX idx_created_year_month (created_at);
ALTER TABLE internal_trainings ADD INDEX idx_created_at (created_at);

-- 复合索引
ALTER TABLE monthly_investigations ADD INDEX idx_company_level (company_id, level);
ALTER TABLE hidden_danger_infos ADD INDEX idx_company_status (company_id, status);
```

---

## ⚡ 并发与性能优化清单

| 场景 | 优化方案 |
|------|---------|
| **公司树递归查询** | 缓存 (Redis, TTL 1h) 或 CTE 递归查询 |
| **月度统计报表** | 队列 Job 生成，结果缓存 |
| **风险值计算** | 队列 Job，不阻塞请求 |
| **大文件上传** | 分片上传 / 直传 OSS / 流式处理 |
| **批量 Excel 导入** | 队列 Chunk 处理，进度回调 |
| **检查统计聚合** | 预计算 + 缓存，非实时查询 |
| **列表分页** | cursor 分页替代 offset 分页 |
| **N+1 查询** | 全局添加 eager loading |

---

## 📝 对比日志格式 (MIGRATION_LOG.md)

每次迁移记录:
```markdown
## [阶段X 批次Y] 模块名 - YYYY-MM-DD

### 迁移文件
| 旧文件 | 新文件 | 变化 |
|--------|--------|------|
| app/Models/X.php | app/Models/X.php | $dates→$casts |
| app/Http/.../XController.php | app/Http/.../XController.php + app/Services/XService.php | 拆分 |

### 重构变更
- 变更1: xxx → yyy (原因)

### 数据库变化
- 合并: 3个 alter migration → 1个完整 migration
- 新增索引: idx_company_id, idx_created_at
- 字段变更: 无 (兼容旧数据)

### API 变化
- `GET /admin/v1/xxx` → `GET /api/v1/xxx`
- 新增: `GET /api/v1/xxx/tree` (公司树查询)
- 废弃: `POST /admin/v1/xxx/batch` (改为分页)

### 性能优化
- 查询: N+1 → eager loading，预计减少 80% 查询
- 缓存: 公司树缓存 1h
```

---

## 📈 进度跟踪

| 阶段 | 内容 | 状态 | 开始 | 完成 |
|------|------|------|------|------|
| 0 | 基础设施 | ⬜ | - | - |
| 1 | 认证+企业+人员 | ⬜ | - | - |
|| 2 | 文件上传+工具 | ✅ | 2026-04-14 | 2026-04-14 |
|| 3 | 简单 CRUD (20+模块) | ✅ | 2026-04-14 | 2026-04-14 |
| 4 | 核心安全业务 | ⬜ | - | - |
| 5 | 隐患+风险+检查 | ⬜ | - | - |
| 6 | 统计+事故+集团+剩余 | ⬜ | - | - |

**预估总天数**: 18-26 天 (不含前端)
