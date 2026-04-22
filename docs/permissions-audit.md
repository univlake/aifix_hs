# 权限系统审计与改进方案

> 生成日期：2026-04-22
> 状态：**待确认**。确认后再执行前后端改造。

---

## 目标规则（待确认）

本次权限梳理要达到的三条规则：

1. **上级企业查看下级企业时，不具有编辑/删除权限**（只读模式）。
2. **生产视图（produce mode）默认只能查询自己企业的数据**，特殊情况（上报类、集团下发类）例外。
3. **用户无对应权限时，对应模块/操作按钮应隐藏**，而不是点击后报 403。

---

## 当前系统概览

### 技术栈
- **后端**：Laravel 13 + spatie/laravel-permission（guard = `api`）。
- **权限存储**：`permissions` 表，`roles` 表，`model_has_roles` / `role_has_permissions` 中间表。
- **权限检查**：通过路由中间件 `permission:{name}` 实现；共 **338 个权限 / 43+ 模块 / ~360 个路由**。
- **前端**：Inertia v3 + React 19；`useAuth()` 已经返回 `permissions` 数组并且暴露 `hasPermission(name)`，但**全项目没有任何调用**。

### 角色模型（过于粗粒度）
| 角色 | 权限范围 |
|---|---|
| `super-admin` | 全部权限 |
| `admin` | 除 `roles.*` / `permissions.*` / `companies.review` 之外的全部 |
| `reviewer` | 所有 `.list` / `.view` / `.tree` + `companies.review` |
| `user` | 所有 `.list` / `.view` / `.tree`（只读） |

**问题**：角色是按“动作”粒度划分，不是按"模块"。无法表达"这个用户只能用风险管理模块"这样的策略。

### 双模式（produce ↔ bloc）
- 模式存储在 `ScopeContext`（前端），由 `Company.is_bloc` / `is_produce` 标志决定默认模式。
- **模式与权限目前完全独立**：一个有全部权限的 admin 账号在两个模式下看到的菜单完全一样。侧边栏的 `mode: 'produce' | 'bloc'` 过滤仅影响**显示**，不影响**权限**。

### 企业范围（company scoping）
- 所有列表接口接受可选 `company_id` 查询参数，控制器内部做 `where('company_id', $request->company_id)`。
- **未对请求的 `company_id` 与登录用户的 `company_id` / 可访问下级企业做校验** —— 只要有 `*.list` 权限的用户，可以传任意 `company_id` 查到**任何企业**的数据。
- `isSubordinate`（上级进入下级视图）的判断**只在前端**，后端无此概念。

---

## 差距总结（Gap Analysis）

| # | 规则 | 当前状态 | 差距 |
|---|---|---|---|
| 1 | 上级查看下级时不可编辑/删除 | 前端 `CrudPage` 已有 `isSubordinate` 判断，单元格级别隐藏了 `Pencil`/`Trash2`，但自行实现的页面（19 个 ObjectDetailDrawer 页面）**大多未做此判断** | **部分缺失** |
| 2 | 生产视图只查自己企业数据 | 前端只传 `company_id`，后端不校验请求的 `company_id` 是否属于当前用户可访问范围 | **严重缺失（安全风险）** |
| 3 | 无权限时按钮/模块隐藏 | `useAuth.hasPermission()` 已存在，但 Sidebar、CrudPage、ObjectDetailDrawer 页面全部没有调用 | **整体缺失** |
| — | 前后端权限名一一对应 | 后端 338 个权限，前端 **0 处引用** | 整体缺失，需要建立映射 |

---

## 前后端权限对照矩阵

> 按"模式 → 模块"组织。每行列出：侧边栏标签 / 前端路由 / 主要后端接口 / 所需后端权限 / 特殊标志（`upstream` 表示向上级企业流动，`scoped` 表示生产端应限制为本企业）。
> 
> 「前端权限」列是建议的前端 gate 点（Sidebar + 按钮级）；「后端权限」列是 `routes/api/*.php` 中 `permission:*` 中间件声明的值。

### A. 生产视图（Produce Mode）

#### A.1 企业信息
| 菜单 | 前端路由 | 后端接口 | 前端权限（建议） | 后端权限（现有） | 备注 |
|---|---|---|---|---|---|
| 企业信息 | `/enterprise/current` | `GET /companies/{id}`, `PUT /companies/{id}` | `companies.list` · `companies.update` | `companies.list`, `companies.update` | scoped：仅自己 |

#### A.2 安全档案
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 安全生产组织架构 | `/safety-archives/org-structure` | `/safety-architectures` | `safety-architectures.*` | `safety-architectures.list/create/update` | scoped |
| 人员管理 | `/safety/personnels` | `/personnels` | `personnels.*` | `personnels.list/create/update/delete` | scoped |
| 安全资质管理 | `/safety-archives/qualifications` | `/filing-permissions`, `/certificate-statuses` | `filing-permissions.*`, `certificate-statuses.*` | `filing-permissions.*`, `certificate-statuses.*` | scoped |
| 建筑物及构筑物 | `/safety/buildings` | `/buildings` | `buildings.*` | `buildings.list/create/update/delete` | scoped |
| 安全投入 | `/safety-archives/safety-investment` | `/security-investments`, `/funding-executions` | `security-investments.*`, `funding-executions.*` | 同左 | scoped |

#### A.3 设备信息
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 特种设备 | `/safety/special-equipment` | `/special-equipment`, `/special-equipment-staff` | `special-equipment.*`, `special-equipment-staff.*` | 同左 | scoped |
| 重大危险设备 | `/equipment/major-hazardous` | `/dangerous-equipment` | `dangerous-equipment.*` | `dangerous-equipment.list/create/update/delete` | scoped |

#### A.4 危险物质
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 危险化学品 | `/safety/hazardous-chemicals` | `/hazardous-chemicals` | `hazardous-chemicals.*` | `hazardous-chemicals.list/create/update/delete` | scoped |
| 重大危险源 | `/safety/major-hazards` | `/major-hazards` | `major-hazards.*` | `major-hazards.list/create/update/delete` | scoped |

#### A.5 工艺信息
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 重点监管危险工艺 | `/process/key-hazardous` | `/major-hazardous-processes` | `major-hazardous-processes.*` | 同左 | scoped |
| 较大危险工艺 | `/process/hazardous` | `/hazardous-processes` | `hazardous-processes.*` | 同左 | scoped |
| 有限空间辨识 | `/space-work/space-works` | `/space-works` | `space-works.*` | `space-works.list/create/update/delete` | scoped |

#### A.6 风险管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 风险源管理 | `/risk/hazards` | `/hazards` | `hazards.*` | `hazards.list/create/update/delete` | scoped |
| 隐患管理 | `/risk/monthly-investigation` | `/monthly-investigations` + `/rectification-sheets` + `/hidden-danger-infos` | `monthly-investigations.*`, `rectification-sheets.*`, `hidden-danger-infos.*` | 同左 | scoped |
| 作业管理 | `/safety/job-management` | `/job-management` | `job-management.*` | `job-management.list/create/update/delete` | scoped |
| 三同时管理 | `/space-work/three-togethers` | `/three-togethers` | `three-togethers.*` | 同左 | scoped |
| 安全评价与检测 | `/risk/safety-assessment` | `/assess-detects` | `assess-detects.*` | `assess-detects.list/create/update/delete` | scoped |
| 风险监测预警 | `/risk/risk-warning` | `/risk-logs`, `/inherent-risk-logs`, `/float-risk-logs`, `/risk-max-values` | `risk-logs.*`, `inherent-risk-logs.*`, `float-risk-logs.*`, `risk-max-values.*` | 同左 | scoped |
| 专家检查 | `/risk/expert-inspection` | `/expert-inspections` | `expert-inspections.*` | `expert-inspections.list/create/update/delete` | **upstream**（接受上级派来的检查） |

#### A.7 会议培训
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 内部会议 | `/meeting/internal-meetings` | `/internal-meetings` | `internal-meetings.*` | 同左 | scoped |
| 教育培训 | `/training/education` | `/internal-trainings`, `/external-trainings`, `/other-trainings`, `/training-classes`, `/training-class-infos` | `internal-trainings.*`, `external-trainings.*`, `other-trainings.*`, `training-classes.*`, `training-class-infos.*` | 同左 | scoped |

#### A.8 第三方管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 设计单位 | `/third-party/design-units` | `/design-units` | `design-units.*` | 同左 | scoped |
| 施工单位 | `/third-party/construction-units` | `/evaluation-units` | `evaluation-units.*` | 同左 | scoped |
| 技术服务单位 | `/third-party/technical-services` | `/skill-units` | `skill-units.*` | 同左 | scoped |

#### A.9 职业健康
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 健康档案 | `/health/health-files` | `/health-files` | `health-files.*` | 同左 | scoped |
| 职业危害因素清单 | `/health/occupational-hazards` | `/occupational-hazards` | `occupational-hazards.*` | 同左 | scoped |
| 健康检查 | `/health/health-checkups` | `/health-checkups` | `health-checkups.*` | 同左 | scoped |
| 职业卫生评价与检测 | `/health/hygiene-evaluations` | `/hygiene-evaluations` | `hygiene-evaluations.*` | 同左 | scoped |
| 职业病报告 | `/health/disease-report` | `/health-reports` | `health-reports.*` | 同左 | scoped |

#### A.10 消防安全
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 消防安全管理 | `/safety/fire-safeties` | `/fire-safeties`, `/fire-control-room-personnels`, `/elimination-control-staff` | `fire-safeties.*`, `fire-control-room-personnels.*`, `elimination-control-staff.*` | 同左 | scoped |
| 消防器材 | `/fire/equipment` | `/fire-equipment` | `fire-equipment.*` | 同左 | scoped |
| 消防设施 | `/fire/facilities` | `/fire-facilities` | `fire-facilities.*` | 同左 | scoped |

#### A.11 事故应急
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 事故上报 | `/accident/report` | `/accident-bulletins` | `accident-bulletins.*` | 同左 | **upstream** |
| 应急管理 | `/accident/emergency` | `/emergency-teams`, `/emergency-supplies`, `/emergency-drills` | `emergency-teams.*`, `emergency-supplies.*`, `emergency-drills.*` | 同左 | scoped |

#### A.12 任务管理（含上级下发）
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 会议 | `/meeting/meetings` | `/meetings`, `/meeting-sign-ups` | `meetings.list`, `meeting-sign-ups.*` | 同左 | **upstream**（接收上级发起的会议通知） |
| 通知公告 | `/tasks/notices` | `/office-notifies`, `/new-notifies` | `office-notifies.list/update`, `new-notifies.list/update` | 同左 | **upstream**，只读 + 反馈 |
| 信息稿件管理 | `/tasks/manuscripts` | `/information-drafts` | `information-drafts.*` | `information-drafts.list/create/update/delete` | **upstream** |
| 月度数据上报 | `/tasks/monthly-report` | `/month-statistics` | `month-statistics.*` | `month-statistics.list/create/update/delete` | **upstream** |
| 年度数据上报 | `/tasks/annual-report` | `/year-statistics` | `year-statistics.*` | `year-statistics.list/create/update/delete` | **upstream** |

#### A.13 变更/知识/考核/培训中心
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 变更管理 | `/change-management` | `/change-manages` | `change-manages.*` | 同左 | scoped |
| 法律法规库 | `/regulation/libraries` | `/regulation-libraries` | `regulation-libraries.list` | `regulation-libraries.*` | **全局共享**，生产端通常只读 |
| 检查表库 | `/knowledge/checklists` | `/checklist-libraries` | `checklist-libraries.list` | 属于 `base-data.view`（注意：控制器与 seeder 不一致，见"差距 #1"） | 共享库 |
| 考核填报 | `/assessment/filing` | `/add-points` | `add-points.*` | `add-points.list/create/update/delete` | **upstream** |
| 培训资料 | `/training/training-files` | `/training-files` | `training-files.list` | `training-files.*` | 下载权限，集团下发 |
| 培训视频 | `/training/training-videos` | `/training-videos` | `training-videos.list` | `training-videos.*` | 下载权限，集团下发 |
| 账号管理（生产端） | `/system/users` | `/users` | `users.*` | `users.list/create/update/delete` | **只能管理本企业用户**，需后端 scope |

---

### B. 集团视图（Bloc Mode）

#### B.1 企业管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 当前企业 | `/enterprise/current` | `/companies/{id}` | `companies.list/update` | 同左 | |
| 下级企业 | `/enterprise/subsidiaries` | `/companies?pid=...`, `/companies-tree` | `companies.list` | 同左 | |
| 企业审批 | `/enterprise/approval` | `/companies-review-list`, `/companies/{id}/review` | `companies.review` | 同左 | |
| 企业分组 | `/enterprise/grouping` | `/company-groups` | `companies.create/update/delete` | 同左 | |

#### B.2 风险监测
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 企业分布图 | `/risk-monitoring/enterprise-map` | `/risk-distribution-maps`, `/company-map` | `risk-distribution-maps.list`, `company-map.view` | 同左 | |
| 重大危险源分布图 | `/risk-monitoring/hazard-map` | `/major-hazards` (bloc query), `/company-map` | `major-hazards.list`, `company-map.view` | 同左 | |
| 在线巡检 | `/risk-monitoring/online-inspection` | `/online-inspection` | `online-inspection.list` | 同左 | |
| 风险监控 | `/risk-monitoring/risk-monitor` | `/bloc-risks-*`, `/focus-companies` | `bloc-risks.list`, `focus-companies.*` | 同左 | **"重点关注企业"就在这个模块** |
| 特种设备数据统计 | `/risk-monitoring/special-equipment` | `/special-equipment?pid=...` | `special-equipment.list` | 同左 | |

#### B.3 风险管控
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 隐患管理 | `/risk-control/monthly-investigation` | `/monthly-investigations?bloc=1` | `monthly-investigations.list` | 同左 | **集团下钻到下级企业时只读** |
| 专家检查 | `/risk-control/expert-inspection` | `/expert-inspections`, `/expert-inspection-companies`, `/expert-inspection-users` | `expert-inspections.*` | 同左 | 集团发起下发 |

#### B.4 内部会议 / 教育培训
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 内部会议 | `/meeting/internal-meetings` | `/internal-meetings` | `internal-meetings.list` | 同左 | 下钻只读 |
| 内部培训 | `/training/internal-trainings` | `/internal-trainings` | `internal-trainings.list` | 同左 | 下钻只读 |
| 外部培训 | `/training/external-trainings` | `/external-trainings` | `external-trainings.list` | 同左 | 下钻只读 |
| 相关方培训 | `/management/training/relevant-party` | `/other-trainings` | `other-trainings.*` | 同左 | |

#### B.5 知识管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 法律法规库 | `/regulation/libraries` | `/regulation-libraries` | `regulation-libraries.*` | 同左 | 集团可维护 |
| 检查表库 | `/management/knowledge/checklists` | `/checklist-libraries` | `checklist-libraries.*` | 同左（控制器权限名不一致） | 集团可维护 |

#### B.6 任务管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 会议通知 | `/management/tasks/meeting-notices` | `/meetings`, `/meeting-sign-ups` | `meetings.*` | 同左 | 集团发起 |
| 通知公告 | `/management/tasks/notices` | `/office-notifies`, `/new-notifies`, `/office-notify-scopes`, `/new-notify-scopes` | `office-notifies.*`, `new-notifies.*` | 同左 | 集团发起 |
| 信息稿件管理 | `/management/tasks/manuscripts` | `/information-drafts` | `information-drafts.*` | 同左 | 集团审核 |

#### B.7 事故应急
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 事故应急管理 | `/management/accidents/management` | `/emergency-teams?bloc=1`, `/emergency-drills?bloc=1` | `emergency-teams.list`, `emergency-drills.list` | 同左 | 下钻只读 |
| 事故上报 | `/management/accidents/report` | `/accident-bulletins`, `/bloc-accident-bulletins` | `accident-bulletins.*`, `bloc-accident-bulletins.list` | 同左 | 集团汇总 |

#### B.8 专家库
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 专家库 | `/management/experts` | `/bloc-experts` | `bloc-experts.*` | `bloc-experts.list/create/delete` | 集团级 |

#### B.9 年度考核
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 考核填报 | `/management/assessment/filing` | `/add-points`, `/add-points-templates` | `add-points.*`, `add-points-templates.*` | 同左 | 集团查看下级上报 |
| 考核评分 | `/management/assessment/scoring` | `/add-points/{id}/score`（待确认） | `add-points.update` | 同左 | |
| 考核汇总 | `/management/assessment/summary` | `/add-points?summary=1` | `add-points.list` | 同左 | |

#### B.10 数据统计
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 月度数据上报 | `/statistics/month-statistics` | `/month-statistics` | `month-statistics.list` | 同左 | 集团查看 |
| 年度数据上报 | `/statistics/year-statistics` | `/year-statistics` | `year-statistics.list` | 同左 | 集团查看 |
| 月度报表统计 | `/management/statistics/monthly-stats` | 待确认 | `month-statistics.list` | 同左 | |
| 年度报表统计 | `/management/statistics/annual-stats` | 待确认 | `year-statistics.list` | 同左 | |
| 通知公告反馈统计 | `/management/statistics/notice-stats` | 待确认 | `office-notifies.list`, `new-notifies.list` | 同左 | |

#### B.11 培训中心
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 上传资料 | `/management/training-center/upload-materials` | `/training-files` (POST) | `training-files.create` | 同左 | 集团下发 |
| 培训资料 | `/training/training-files` | `/training-files` | `training-files.list` | 同左 | |
| 上传视频 | `/management/training-center/upload-videos` | `/training-videos` (POST) | `training-videos.create` | 同左 | 集团下发 |
| 培训视频 | `/training/training-videos` | `/training-videos` | `training-videos.list` | 同左 | |

#### B.12 系统管理
| 菜单 | 前端路由 | 后端接口 | 前端权限 | 后端权限 | 备注 |
|---|---|---|---|---|---|
| 账号管理 | `/system/users` | `/users` | `users.*` | `users.list/create/update/delete` | 集团范围 |
| 角色管理 | `/system/roles` | `/roles` | `roles.*` | `roles.list/create/update/delete/assign` | 集团管理员 |
| 权限管理 | `/system/permissions` | `/permissions` | `permissions.list` | 同左 | 只读展示 |
| 考核模板管理 | `/system/assessment-templates` | `/daily-check-templates`, `/accident-check-templates`, `/add-points-templates` | `daily-check-templates.*`, `accident-check-templates.*`, `add-points-templates.*` | 同左 | 集团维护 |
| 基础数据（多子项） | `/system/enterprise-types` 等 | `/enterprise-types` 等 | `base-data.view` / `base-data.manage` | 同左 | 平台级 |

---

### C. 未暴露在侧边栏但存在的后端模块（存在但前端未使用，或间接使用）

| 权限前缀 | 用途 | 前端是否直接页面 |
|---|---|---|
| `bloc-comments.list` | 集团评论 | 间接（通过 bloc 模块消费） |
| `bloc-notices.list` | 集团通知 | 间接 |
| `homes.list` | 首页聚合接口 | `Dashboard.tsx` 消费 |
| `todos.list` | 待办事项 | `Dashboard.tsx` 消费 |
| `visible.list` | 可见范围（公司树） | 间接 |
| `enterprise-report.list` | 企业级报表 | 未对接 |
| `focus-companies.*` | **重点关注企业**（本次新增页面） | `/risk-monitoring/risk-monitor` 消费 |
| `rectification-sheet-count.view` | 整改单计数 | 未对接（可能用于 Dashboard） |
| `upload.file` / `upload.oss` | 文件上传 | 所有带附件的 CrudPage 隐式使用 |

---

## 重要差距与不一致（Inconsistencies）

### 差距 #1 — `checklist-libraries` / 基础数据权限前后端不一致
- Seeder 定义了 `checklist-libraries.list/create/update/delete`。
- 但 `routes/api/base-data.php` 把 `/checklist-libraries` 挂在 `base-data.view` / `base-data.manage` 下。
- **结果**：页面报 403 或用户有 `checklist-libraries.*` 但实际被 `base-data.view` 挡住。
- **处理**：统一为 `base-data.*`（按模块），或为 `checklist-libraries` 单独建立中间件绑定。

### 差距 #2 — 所有控制器未校验请求的 `company_id` 归属
- `/personnels`, `/buildings`, `/special-equipment` 等 **任何** scoped 模块都接受外部传入的 `company_id`。
- 有 `*.list` 权限的用户可以查询**任意**企业的数据。
- **处理**：
  - 新增一个 `ScopeCompany` 中间件或 trait，根据用户角色 + `is_bloc` / `is_produce` 判断可访问的 `company_id` 白名单：
    - 生产视图用户：只能用 `auth()->user()->company_id`。
    - 集团视图用户：只能用 `auth()->user()->company_id` 或其 `pid` 子孙节点。
  - 控制器内，若请求的 `company_id` 不在白名单内，返回 403。

### 差距 #3 — 前端无任何权限 gate
- `useAuth.hasPermission()` **已经存在**，但 **0 处调用**。
- `Sidebar.tsx` 不根据权限隐藏菜单项。
- `CrudPage.tsx` 不根据权限隐藏"新增/编辑/删除"按钮。
- 19 个直接调用 `ObjectDetailDrawer` 的页面同样未做 gate。
- **处理**：
  - `Sidebar.tsx`：在 `NavItem` 上增加可选 `permission?: string`（或 `permissions?: string[]`，any-match）。过滤 `visibleSections` 时调用 `hasPermission`。
  - `CrudPage.tsx`：新增 `permissions?: { list?: string; create?: string; update?: string; delete?: string }`（或根据 `endpoint` 推断默认）。按钮通过 `hasPermission` 条件渲染。
  - 19 个自定义页面按同样规则硬编码，或抽到 `DataTable` 的 action 配置中。

### 差距 #4 — 上级进入下级视图的只读未强制
- `ScopeContext.isSubordinate` 仅为前端布尔标志，后端不感知。
- `CrudPage.tsx` 已按 `isSubordinate` 隐藏行级编辑/删除（见 `readOnly = globalReadOnly` 逻辑），但：
  - "新增"按钮（顶部）未隐藏。
  - 19 个自定义页面未实现此判断。
- **处理**：
  - 统一在 `CrudPage` 将 `globalReadOnly = globalReadOnly || isSubordinate` 应用到全部写操作按钮（包括顶部"新增"、导入）。
  - 自定义页面通过 `ScopeContext.isSubordinate` 同样 gate。
  - 后端：上级用户对下级企业的写操作应被控制器拒绝（可与差距 #2 合并）。

### 差距 #5 — 角色粒度太粗
- `admin` 基本等同于 `super-admin`，无法分配"只管 HSE 的 HSE 经理"这种角色。
- **处理**：引入"角色模板 + 模块权限组"概念，允许在后台按模块勾选权限，而不是靠代码里的 seeder 过滤器。

### 差距 #6 — `upstream` 模块缺少专门的"接收"权限
- 生产端消费上级下发的 `meetings`/`office-notifies`/`new-notifies` 时，只需要 `.list`/`.update`（反馈），不应该有 `.create`/`.delete`。
- 目前用角色层面靠"admin 全给、user 全不给"粗筛。
- **处理**：在前端 gate 按钮时按角色+模式双条件；后端可在控制器层对非发起方拒绝 `.create`/`.delete`。

---

## 建议的改动清单（待确认后执行）

**前端：**
1. `Sidebar.tsx`：`NavItem` 加 `permission?: string | string[]`，`NavGroup` / `NavLink` 按 `hasPermission` 过滤；全局菜单定义补齐对应 permission 字符串。
2. `CrudPage.tsx`：根据 `config.permissions`（或从 `endpoint` 自动推断）在新增/编辑/删除/导入/导出/复制按钮上加 gate；`isSubordinate` 时统一 `readOnly = true`。
3. 新增 `resources/js/components/shared/Gate.tsx`（或 `usePermission` hook），统一封装 `hasPermission + !isSubordinate`。
4. 19 个 ObjectDetailDrawer 页面同样套用 Gate。
5. 路由级别：在 AppLayout 里对当前路由做权限检查，无权限时跳 `/dashboard` 并 toast 提示。

**后端：**
6. 新增 `EnsureCompanyScope` 中间件或 `CompanyScoped` trait：对 scoped 模块，强制 `company_id` 白名单。
7. 上级用户对下级企业的写操作（POST/PUT/PATCH/DELETE）在 trait 层统一拒绝。
8. 修复 `checklist-libraries` 的权限前缀（差距 #1）。
9. （可选）引入 `RoleTemplate` 数据，替换 seeder 里硬编码的 4 个角色。

**文档：**
10. 本文确认后，可落地为 `docs/permissions-reference.md`，作为权限命名契约（前端引用 = 后端声明）。

---

## 需要用户确认的点

请对以下事项给出确认 / 调整意见，以决定具体实施优先级：

1. **差距 #2（后端企业范围校验）** 是否属于 P0 安全修复？建议：是。
2. **差距 #3（前端 gate）** 是否希望在 `Sidebar` + `CrudPage` 同时落地？建议：是，同时改。
3. **差距 #1（权限名不一致）** 是按"统一到 `base-data.*`"还是"为 `checklist-libraries` 单独命名"？建议：**统一到独立模块名**（`checklist-libraries.*`），这样前端 gate 语义更清晰。
4. **差距 #5（角色粒度）** 是否纳入本次改造？如果是，需要增加后台"角色模板编辑器"UI，工作量较大；如果仅做前端 gate，保持 4 个内置角色即可，后续再做。
5. **上级进入下级视图** 的只读范围是否包含"导入/导出/复制"等辅助按钮？建议：包含所有写操作。
6. 本文列出的"前端权限"列是**建议**的 permission 字符串。是否直接采用后端现有命名（如 `personnels.list`）？建议：完全对齐，避免再起一套别名。

---

确认后请告知，我会按上面的 1–10 项逐步实施。
