# aifix_hs 系统说明与操作手册

> 面向企业安全生产管理人员、集团监管人员与系统管理员的使用指南。
> 技术栈：Laravel 13 + Inertia v3 + React 19 + TailwindCSS v4 + MySQL/SQLite。

---

## 目录

1. [系统概述](#1-系统概述)
2. [工作模式](#2-工作模式)
3. [用户角色与权限](#3-用户角色与权限)
4. [登录与身份认证](#4-登录与身份认证)
5. [主要功能模块](#5-主要功能模块)
6. [常用业务流程](#6-常用业务流程)
7. [后台定时任务](#7-后台定时任务)
8. [系统管理](#8-系统管理)
9. [常见问题](#9-常见问题)
10. [技术架构简述](#10-技术架构简述)

---

## 1. 系统概述

aifix_hs 是面向**生产制造类企业**与**集团监管单位**的安全生产综合管理平台。核心能力：

- 企业安全档案、人员、设备、危险源、工艺信息集中管理
- 隐患排查、整改、确认、归档全流程跟踪
- 每日自动计算企业**固有风险**与**浮动风险**指数，生成历史趋势
- 集团视角聚合下属企业风险分布（红/橙/黄/蓝四级）
- 专家检查、月度/年度考核、事故快报、培训、会议等业务流管理
- 基于 Spatie Permission 的多角色权限 + 企业范围中间件（`scope`），支持跨层级数据隔离

典型使用者：

| 角色 | 主要诉求 |
|---|---|
| 生产企业安全员 | 日常隐患填报、人员台账、设备台账、检查反馈 |
| 集团安全主管 | 聚合监管下属企业风险，派发专家检查，审核企业月/年报 |
| 第三方专家 | 应邀登记现场检查发现的隐患 |
| 系统管理员 | 用户/角色/权限维护、基础数据字典、系统配置 |

---

## 2. 工作模式

系统支持**两种并存模式**。用户登录后，会根据所属企业的 `is_produce` / `is_bloc` 字段自动切换模式；集团用户可在侧栏切换「集团」与「企业」视图。

### 生产模式 (produce)
面向单个生产企业。侧栏显示「企业信息 / 安全档案 / 设备信息 / 危险物质 / 工艺信息 / 风险管理 / 会议培训 / 第三方管理 / 职业健康 / 消防安全 / 应急管理 / 检查考核 / 统计报表」等模块。

### 集团模式 (bloc)
面向集团/监管单位。侧栏额外显示「下属企业审核」「集团风险监测」「专家检查管理」「月度/年度汇总」「集团评论」等聚合看板。集团可通过「下钻」切换到某个下属企业的视图（此时变为**只读模式**，写操作被 `CrudPage.globalReadOnly` 拦截）。

---

## 3. 用户角色与权限

系统内置 4 个角色（定义在 `database/seeders/RolesAndPermissionsSeeder.php`）：

| 角色 | 说明 |
|---|---|
| `super-admin` | 超级管理员。拥有所有权限。 |
| `admin` | 企业管理员。除 `roles.*`, `permissions.*`, `companies.review` 外所有权限。 |
| `reviewer` | 审核员。所有 `.list` / `.view` / `.tree` + `companies.review`。 |
| `user` | 普通用户。仅 `.list` / `.view` / `.tree` 只读。 |

权限命名约定：`{module}.{action}`，如 `personnels.create`、`hidden-danger-infos.update`。前端通过 `usePermission` Hook 读取当前用户权限并按钮级 gate；后端每条路由挂 `permission:xxx` 中间件。

**下钻只读规则**：当集团用户切换到下属企业视图时，`useScope().isSubordinate = true`，所有 CRUD 页面的「新增/编辑/删除」按钮自动隐藏，确保上级无法直接改动下属数据。

---

## 4. 登录与身份认证

- 浏览器入口：`https://aifix-hs.test`（本地 Herd）或部署域名
- 鉴权方式：Laravel Passport (OAuth2 Personal Access Token)
- 密码传输：**浏览器 RSA 公钥加密**后提交，服务端由 `App\Services\RsaService` 解密
- Token 存储：`localStorage` key = `auth_token`
- 页面刷新保持会话：`App\Http\Middleware\ValidateScopeCompany` 读取 header 并刷新 `rootCompany` / `activeCompany`

登录失败常见原因：
1. RSA 公钥过期 — 前端 `/api/v1/public-key` 返回 401 时会自动重新获取
2. 账号状态 `status != 1` — 管理员禁用或未审核
3. 企业 `status != 1` — 企业被禁用后其用户无法登录

---

## 5. 主要功能模块

> 下述模块均按业务领域分组，侧栏分组与模块标题一一对应。

### 5.1 企业信息 (`/enterprise/*`)
- **当前企业**：查看 + 编辑本企业基础资料（credit_code、地址、经纬度、监管联系人）
- **下属企业**：集团模式下管理直属子公司，含启用/禁用、层级树
- **企业审核**：`reviewer` 角色专用，对新注册的下属企业点击「通过 / 驳回」
- **企业分组**：将不同行业的下属企业打标签，便于仪表盘筛选

### 5.2 安全档案 (`/safety-archives/*`)
- 安全生产组织架构（`safety-architectures`）
- 人员管理 `safety/personnels` — 总人数、管理层、专职安全员、职业健康资质
- 安全资质管理（备案证件、台账、复审计划）
- 建筑物及构筑物（`safety/buildings`）
- 安全投入 — 按年度、按类别录入；支持子项 (`security_investments` + `funding_executions`)

### 5.3 设备信息 (`/safety/special-equipment`, `/equipment/major-hazardous`)
- 特种设备 + 操作人员台账
- 重大危险设备（运行年限、报废计划）

### 5.4 危险物质 / 工艺 (`/safety/hazardous-chemicals`, `/process/*`)
- 危险化学品清单、重大危险源辨识
- 重点监管危险工艺 + 较大危险工艺
- 有限空间辨识（`/space-work/space-works`）

### 5.5 风险管理 (`/risk/*`, `/risk-control/*`)
- **风险源管理**：`/risk/hazards` 台账
- **隐患排查**：`/risk/monthly-investigation` — 月度自查，支持整改 / 复查附件
- **作业管理**：八大特殊作业记录
- **三同时管理**：建设项目三同时与四新管理
- **安全评价与检测**：外部评价/检测机构记录
- **风险监测预警**：`/risk/risk-warning` — 雷达图 + 9 维度展示
- **专家检查**：集团端派发 → 下属企业确认 → 专家登记现场隐患 → 整改 / 确认 / 归档

### 5.6 会议培训 (`/meeting/*`, `/training/*`)
- 内部会议（安全例会、消防例会）
- 教育培训（内部培训 / 外部培训 / 其他培训 / 专项班），月度/年度统计自动聚合培训次数与参加人数

### 5.7 第三方管理 (`/third-party/*`)
- 设计单位 / 施工单位 / 技术服务单位 — 资质、协议、监督记录

### 5.8 职业健康 (`/health/*`)
- 健康档案、职业危害因素清单、体检记录、职业健康评估、职业病报告

### 5.9 消防 (`/fire/*`, `/emergency/*`)
- 消防设施 / 消防器材 / 智慧消防系统 台账
- 应急演练、应急物资、应急队伍

### 5.10 检查考核 (`/inspection/*`)
涵盖 5 类考核类型，均遵循同一生命周期（详见 §6.3）：

| 模块 | 路径 | 特点 |
|---|---|---|
| 日常目标管理考核 | `/inspection/daily-checks` | 填报 → 提交 → 评分，草稿保存、禁止修改已提交 |
| 安全生产考核 | `/inspection/system-checks` | 自动聚合 5 维得分 |
| 标准化考核 | `/inspection/norm-checks` | 按行业类型提供标准模板下载 |
| 事故考核 | `/inspection/accident-checks` | `final_number = max(0, 20 - Σnumber)` 扣分制 |
| 加分项考核 | 内嵌入绩效汇总 | 加分项独立登记 |

### 5.11 统计报表 (`/statistics/*`)
- 月度报表 `/statistics/month-statistics` — 预填充当月生产数据，支持治理计划子表 + 事故快报子表
- 年度报表 `/statistics/year-statistics`
- 专家检查统计 / 事故快报统计

### 5.12 集团专区 (bloc 模式)
- 风险监测总览（饼图 + 排行）
- 专家检查管理（新增计划 → 添加受检企业 → 指派专家）
- 下属企业审核
- 集团通知、集团事故快报、集团评论

---

## 6. 常用业务流程

### 6.1 新建企业 → 用户 → 角色分配

1. 超管或集团管理员进入「系统管理 / 企业管理」点击「新增企业」。
   - 必填：企业名称、统一社会信用代码、企业类型、经营类型、上级 pid（如为子公司）、`is_produce` / `is_bloc` 标识。
2. 企业进入「待审核」状态，由 `reviewer` 角色在「企业审核」列表通过。
3. 通过后，进入「系统管理 / 用户」，为该企业创建账号。
4. 在用户卡片点击「分配角色」，选择 `admin` / `user` 等预置角色或自定义角色。
5. 用户即可使用新账号 + 密码登录。

### 6.2 隐患排查与整改（月度）

1. 安全员进入「风险管理 / 隐患管理」→ 点击「新增隐患」。
   - 必填：排查时间、隐患类别、隐患等级（一般/重大）、隐患描述、整改期限、排查依据。
2. 保存后状态为 `待整改`；系统自动记录排查人 (user_id)。
3. 整改完成后，点击「整改」按钮填写整改描述、整改日期、附件 → 状态变为 `已整改待确认`，`correct_status = 2`。
4. 安全员或上级点击「整改确认」录入复查附件 → 状态变为 `已确认`，`correct_status = 3`、`review_time` 写入。
5. 集团管理员点击「确认归档」后 `invest_status = 2`，记录归档人，后续不可修改。

### 6.3 考核填报（日常目标管理为例）

```
1. 进入 /inspection/daily-checks
2. 选择年度 → 点击「开始填报」或「继续填报」
   后端路由：GET /daily-checks/start-form?company_id=X&year=Y
3. 按三级模板树逐条录入证据附件 path
4. 点击「暂存」可多次保存草稿 (status = 0)
   后端路由：POST /daily-checks/save-draft
5. 全部完成后点击「提交」(status 0 → 1)
   后端路由：POST /daily-checks/complete
6. 上级企业查看列表时，点击「评分」逐项打分 + 备注 (status 1 → 2)
   后端路由：POST /daily-checks/score
7. 最终分数即 Σnumber，归入企业年度考核汇总
```

**关键规则**：`save-draft` 会拦截已提交记录；`complete` 至少需要 1 条草稿；评分可在已评分后再次修改。

### 6.4 专家检查生命周期

```
集团：新建检查计划  →  添加受检企业  →  指派专家
                           │                  │
                           ▼                  ▼
                    下属企业收到通知    专家收到通知
                           │                  │
                           ▼                  ▼
                      企业点「确认」         专家现场登记隐患
                                            │
                                            ▼
                                   后续复用 §6.2 整改流程
```

集团端可生成并下载**检查通知单**（`.docx`）与**整改通知单**（`.xlsx`）；企业端可下载已通知的检查通知单。

### 6.5 月度报表填报

1. 进入 `/statistics/month-statistics` 点击「新增」。
2. 系统自动调用 `/month-statistics/stuff?company_id=X` 预填充本月各项汇总（会议次数、培训次数、隐患数量、事故数量等）。
3. 安全员在「治理计划」子表录入重大隐患治理项，「事故快报」子表录入本月事故。
4. 提交后，上级在月度汇总页可看到子公司的填报情况与对比分析。

---

## 7. 后台定时任务

定义在 `routes/console.php`：

| 命令 | 频率 | 功能 | 下游影响 |
|---|---|---|---|
| `risk:calculate --content='每日定时计算'` | 每日 02:00 | 遍历所有启用的生产企业，重算固有风险 + 浮动风险；对集团企业做下属风险加权平均 | 写入 `risk_logs` / `inherent_risk_logs` / `float_risk_logs`；更新 `companies.inherent_risk`, `float_risk` 及其 grade 字段 |

**运维建议**：
- `withoutOverlapping()` + `onOneServer()` 已限制并发，适用多实例部署
- `runInBackground()` 保证不阻塞其他 schedule 任务
- 如需手动重算：`php artisan risk:calculate --content='manual'`
- 任务失败会在 `storage/logs/laravel.log` 留下 `CalculateRiskValue:` 开头的警告

---

## 8. 系统管理

### 8.1 基础数据字典 (`/system/*-types`)
- 企业类型 / 经营类型 / 危险工艺类型 / 特殊作业类型 / 工艺类型 / 有限空间类型 / 培训班类型 / 安管类型 / 法规库类型 / 考核表类型
- 管理员可增删改；每个字典有自己的 `permission:{name}.list/create/update/delete`

### 8.2 用户、角色、权限
- **用户**：创建用户时可指定所属企业、初始角色、密码重置
- **角色**：支持自定义角色，配置时勾选所需权限。系统内置 4 个角色受保护（`super-admin` / `admin` / `reviewer` / `user`）
- **权限列表**：只读，共 338 条。搜索框支持按模块或动作标签筛选
- **角色模板**：新建/编辑自定义角色时，可一键套用 6 个预置模板（HSE 经理、设备主管、职业健康员、培训管理员、只读审计员、任务执行员），再按需微调

### 8.3 考核表模板
`/system/assessment-templates` 集中管理考核类型。复制模板到新年度功能简化年度启用。

### 8.4 报表配置
`/system/report-configs` 配置月度/年度报表的统计字段。

---

## 9. 常见问题

### Q1. 登录后看不到某个菜单？
- 当前角色未被授予该模块 `.list` 权限。由管理员在「系统 / 角色管理」勾选后再重新登录。
- 如果是集团下钻企业视图，部分写操作菜单会被隐藏（仅读）。

### Q2. 点击「新增」按钮没反应？
- 前端按钮级 gate：未授予 `.create` 权限会直接隐藏。如果按钮可见但点击无响应，打开浏览器开发者工具查看 console 错误。

### Q3. 仪表盘的风险指数一直是 0？
- 风险计算为每日 02:00 执行；新企业当日还没有历史日志。手动触发：`php artisan risk:calculate --content='manual'`
- 确认企业 `is_produce = 1` 且 `status = 1`，否则会被任务跳过

### Q4. 上传附件失败？
- 检查 OSS 签名端点 `/upload/oss-signature` 是否返回 200
- 文件大小限制见 `php.ini` 的 `upload_max_filesize`
- 本地开发如遇 CORS 报错，`OssUploadField` 已内置 HEAD 请求 fallback 判定上传是否成功

### Q5. 如何查看某条数据的变更历史？
系统使用 Spatie activitylog，`activity_log` 表记录了所有 BaseModel 子类的 create/update/delete 事件。当前版本未暴露前端查看入口；DBA 可直接查询：
```sql
SELECT * FROM activity_log
WHERE subject_type = 'App\\Models\\HiddenDangerInfo' AND subject_id = ?
ORDER BY created_at DESC;
```

### Q6. 月报 / 年报的数字为什么和预期对不上？
数据聚合范围由 `MonthStatisticsController::aggregateMonth` 与 `YearStatisticsController::stuff` 定义：
- `is_produce=1` 企业：仅本企业数据
- `is_bloc=1` 企业：本企业数据 + 所有**直接下级**子公司数据（不包含孙公司）
- 治理计划 / 事故详情：本企业 + 直接下级

---

## 10. 技术架构简述

### 10.1 后端
- Laravel 13 · PHP 8.4
- Passport OAuth2 · Spatie Permission · Spatie ActivityLog
- 数据库：生产环境 MySQL 8，测试环境 SQLite in-memory
- 后台任务：`routes/console.php` + Laravel Scheduler
- OSS：阿里云 OSS，签名由后端生成后前端直传

### 10.2 前端
- Inertia v3 + React 19（无独立 SPA，服务端渲染页面 shell + SPA 体验）
- TailwindCSS v4
- Wayfinder：自动生成 `resources/js/actions/*` 的类型化 API 调用
- 构建：Vite + Rolldown

### 10.3 关键中间件链
```
auth:api       # Passport Bearer token 校验
scope          # ValidateScopeCompany：注入 rootCompany + activeCompany
throttle:api   # 全局 API 限流
permission:X   # Spatie 权限校验（按路由）
```

### 10.4 权限架构
- 页面级：侧栏按 `permission` 字段过滤
- 路由级：`AppLayout.tsx` 在 URL 切换时校验 `getRoutePermission(pathname)`；无权则跳转 `/dashboard`
- API 级：`permission:xxx` 中间件
- 企业级：`scope` 中间件拒绝 `company_id` 不在用户可见范围内的请求
- UI 级：每页用 `usePermission` Hook 对 create/update/delete 按钮做 gate

### 10.5 关键目录
```
app/Http/Controllers/Api/V1/    # API 控制器（~100 个）
app/Http/Middleware/            # ValidateScopeCompany, PermissionMiddleware
app/Models/                     # Eloquent 模型（~80 个，均继承 BaseModel）
app/Traits/CalculateRiskValue.php   # 每日风险计算核心（14 个方法，~900 行）
app/Services/RsaService.php     # 登录密码解密
database/seeders/               # RolesAndPermissionsSeeder 是权限唯一事实源
resources/js/pages/             # Inertia 页面（~130 个）
resources/js/components/shared/CrudPage.tsx  # 通用 CRUD 页面模板，约 80% 台账页面基于此
resources/js/hooks/             # use-api / use-auth / use-permission / use-scope / use-detail-drawer
routes/web.php                  # Inertia 页面路由（~114 条）
routes/api/                     # API 路由按域拆分
tests/Feature/                  # Pest 4 特性测试（~80 个文件，~750 个测试）
```

### 10.6 测试
```bash
php artisan test --compact               # 全量
php artisan test --compact --filter=X   # 按名筛选
npm run types:check                      # TypeScript
npm run lint                             # ESLint
npm run format -- --check                # Prettier
vendor/bin/pint --format agent          # PHP 格式化（Laravel Pint）
```

---

> 文档版本：2026-04-22。如有业务问题请联系系统管理员；如发现系统缺陷请提 issue。
