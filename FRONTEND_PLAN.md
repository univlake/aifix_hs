# 前端开发计划 — 安全生产管理系统

> **技术栈**: Inertia 3 + React 19 + Tailwind 4 + shadcn/ui + TypeScript
> **后端**: Laravel 13 + Passport OAuth2 + Spatie Permission RBAC
> **生成时间**: 2026-04-14

---

## 📊 项目规模概览

| 指标 | 数量 |
|------|------|
| API 路由 | 563 条 |
| 业务模块 | ~80 个 CRUD 模块 |
| 数据模型 | 113 个 |
| 控制器 | 113 个 |
| 角色 | 4 个 (super-admin, admin, user, +自定义) |
| 权限 | 299 个 |

---

## 🏗️ 架构设计

### 前端目录结构

```
resources/js/
├── app.tsx                          # Inertia 入口
├── components/
│   ├── ui/                          # shadcn/ui 组件库
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── pagination.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── toast.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── calendar.tsx
│   │   ├── date-picker.tsx
│   │   ├── file-upload.tsx
│   │   └── ... (按需添加)
│   ├── layout/
│   │   ├── AppLayout.tsx            # 主布局（侧边栏+顶栏）
│   │   ├── Sidebar.tsx              # 侧边导航菜单
│   │   ├── Header.tsx               # 顶部栏（用户信息、通知）
│   │   └── Breadcrumbs.tsx          # 面包屑导航
│   ├── data-table/
│   │   ├── DataTable.tsx            # 通用表格组件（排序/筛选/分页）
│   │   ├── DataTableToolbar.tsx     # 工具栏（搜索/筛选/批量操作）
│   │   ├── DataTablePagination.tsx  # 分页组件
│   │   └── columns.tsx              # 各模块列定义
│   ├── forms/
│   │   ├── CrudForm.tsx             # 通用 CRUD 表单壳
│   │   └── fields/                  # 自定义字段组件
│   └── shared/
│       ├── SearchInput.tsx
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
├── hooks/
│   ├── use-permissions.ts           # 权限判断 hook
│   ├── use-debounce.ts
│   └── use-toast.ts
├── layouts/
│   └── AppLayout.tsx
├── lib/
│   ├── utils.ts                     # cn() 等工具函数
│   └── api.ts                       # axios/fetch 封装
├── types/
│   ├── index.ts                     # 通用类型
│   ├── auth.ts                      # 用户/认证类型
│   ├── api.ts                       # API 响应类型
│   └── models/                      # 各模块数据类型
│       ├── company.ts
│       ├── user.ts
│       └── ...
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx            # 首页仪表板
│   ├── system/                      # 系统管理
│   │   ├── companies/               # 企业管理
│   │   ├── users/                   # 用户管理
│   │   ├── roles/                   # 角色管理
│   │   └── permissions/             # 权限管理
│   ├── safety/                      # 安全管理
│   │   ├── buildings/               # 建筑物
│   │   ├── job-management/          # 岗位管理
│   │   ├── personnels/              # 人员管理
│   │   └── ...
│   ├── risk/                        # 风险管理
│   │   ├── hazards/                 # 危险有害因素
│   │   ├── risk-logs/               # 风险记录
│   │   ├── hidden-danger/           # 隐患排查
│   │   └── ...
│   ├── inspection/                  # 检查管理
│   │   ├── daily-checks/            # 日常检查
│   │   ├── double-checks/           # 双重检查
│   │   ├── system-checks/           # 系统检查
│   │   └── ...
│   ├── emergency/                   # 应急管理
│   ├── training/                    # 培训管理
│   ├── statistics/                  # 统计报表
│   └── welcome.tsx                  # 首页
├── routes/                          # Wayfinder 生成的类型安全路由
└── utils/
    └── permissions.ts               # 权限常量
```

### 关键设计原则

1. **通用 DataTable 组件** — 80% 的 CRUD 模块共用同一套表格+分页+筛选+搜索
2. **通用 CrudForm 组件** — 创建/编辑共用表单，根据 schema 自动渲染
3. **权限驱动 UI** — 通过 `usePermissions()` hook 隐藏无权操作的按钮/菜单
4. **Wayfinder 类型安全路由** — 后端已安装 `@laravel/vite-plugin-wayfinder`，前端路由指向 API
5. **前后端分离** — Inertia 只负责 SPA 路由/页面渲染，数据通过 fetch/axios 调用 API

---

## 📋 开发阶段

### Phase 0: 基础设施（1-2 天）

**目标**: 搭建前端框架，安装 shadcn/ui，创建通用组件

- [ ] 安装 shadcn/ui 初始化 (`npx shadcn@latest init`)
- [ ] 安装基础 UI 组件 (`button`, `input`, `table`, `dialog`, `form`, `select`, `dropdown-menu`, `badge`, `card`, `toast`, `sheet`, `tabs`, `pagination`)
- [ ] 安装依赖: `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `zod`, `axios`, `dayjs`, `lucide-react`
- [ ] 创建 `AppLayout.tsx` — 左侧菜单 + 顶栏 + 内容区
- [ ] 创建 `Sidebar.tsx` — 按业务模块分组的导航菜单
- [ ] 创建 `DataTable.tsx` — 通用数据表格（排序/筛选/搜索/分页）
- [ ] 创建 `CrudForm.tsx` — 通用 CRUD 表单壳
- [ ] 创建 `usePermissions()` hook
- [ ] 配置 `api.ts` — axios 实例 + token 拦截器
- [ ] 更新 `app.tsx` — 集成 Inertia + Layout

### Phase 1: 认证模块（1 天）

**目标**: 登录/注册/登出，获取 token，跳转仪表板

- [ ] `Login.tsx` — 用户名+密码登录表单
- [ ] `Register.tsx` — 注册表单
- [ ] Token 管理 — localStorage 存储 Passport token
- [ ] axios 拦截器 — 自动附加 `Authorization: Bearer {token}`
- [ ] 401 自动跳转登录页
- [ ] `Dashboard.tsx` — 登录后首页（显示用户信息、快捷入口）

**对接 API**:
- `POST /api/v1/login` — 登录
- `POST /api/v1/register` — 注册
- `POST /api/v1/logout` — 登出
- `GET /api/v1/user-info` — 用户信息

### Phase 2: 系统管理模块（2-3 天）

**目标**: 企业/用户/角色/权限 — 核心管理功能

- [ ] `companies/` — 企业管理（列表/创建/编辑/删除/树形结构）
- [ ] `users/` — 用户管理（CRUD + 角色分配）
- [ ] `roles/` — 角色管理（CRUD + 权限分配）
- [ ] `permissions/` — 权限查看（只读，按模块分组展示）

**对接 API** (见 API 文档)

### Phase 3: 基础数据 & 安全台账（3-4 天）

**目标**: 字典表 + 安全台账管理，大量 CRUD 模块批量开发

**基础数据（字典表）**— 简单 CRUD，优先迁移:
- [ ] enterprise-types — 企业类型
- [ ] operational-types — 运营类型
- [ ] base-areas — 区域
- [ ] dangerous-craft-types — 危险工艺类型
- [ ] special-types — 特种设备类型
- [ ] process-types — 工艺类型
- [ ] space-work-types — 空间作业类型
- [ ] training-class-types — 培训班类型
- [ ] safety-management-types — 安全管理类型
- [ ] record-types — 记录类型
- [ ] regulation-library-types — 法规库类型
- [ ] report-configs — 报表配置

**安全台账**:
- [ ] buildings — 建筑物
- [ ] job-management — 岗位管理
- [ ] personnels — 人员管理
- [ ] skill-units — 技能单位
- [ ] design-units — 设计单位
- [ ] evaluation-units — 评价单位
- [ ] dangerous-equipment — 危险设备
- [ ] special-equipment — 特种设备
- [ ] special-equipment-staff — 特种设备人员
- [ ] hazardous-chemicals — 危险化学品
- [ ] hazardous-processes — 危险工艺
- [ ] major-hazards — 重大危险源
- [ ] major-hazardous-processes — 重大危险工艺
- [ ] fire-equipment — 消防设备
- [ ] fire-facilities — 消防设施
- [ ] fire-safeties — 消防安全

### Phase 4: 风险管理 & 检查（3-4 天）

- [ ] hazards — 危险有害因素
- [ ] risk-logs — 风险记录
- [ ] float-risk-logs — 动态风险记录
- [ ] inherent-risk-logs — 固有风险记录
- [ ] risk-max-values — 风险最大值
- [ ] risk-distribution-maps — 风险分布图
- [ ] hidden-danger-infos — 隐患信息
- [ ] rectification-sheets — 整改单
- [ ] monthly-investigations — 月度排查
- [ ] checklist-libraries — 检查清单库
- [ ] daily-checks / daily-check-templates — 日常检查
- [ ] double-checks / double-check-templates — 双重检查
- [ ] system-checks — 系统检查
- [ ] norm-checks — 规范检查
- [ ] accident-checks / accident-check-templates — 事故检查
- [ ] add-points / add-points-templates — 加分

### Phase 5: 职业健康 & 应急 & 培训（2-3 天）

- [ ] occupational-hazards — 职业危害
- [ ] health-files — 健康档案
- [ ] health-checkups — 健康检查
- [ ] health-reports — 健康报告
- [ ] health-systems — 健康系统
- [ ] hygiene-evaluations — 卫生评价
- [ ] elimination-control-staff — 消除控制人员
- [ ] fire-safety — 消防安全
- [ ] emergency-drills — 应急演练
- [ ] emergency-supplies — 应急物资
- [ ] emergency-teams — 应急队伍
- [ ] training-classes — 培训班
- [ ] training-class-infos — 培训班信息
- [ ] training-files — 培训档案
- [ ] training-videos — 培训视频
- [ ] internal-trainings — 内部培训
- [ ] external-trainings — 外部培训
- [ ] other-trainings — 其他培训
- [ ] meetings — 会议
- [ ] meeting-sign-ups — 会议签到
- [ ] internal-meetings — 内部会议
- [ ] change-manages — 变更管理
- [ ] safety-management — 安全管理
- [ ] safety-architectures — 安全架构
- [ ] security-investments — 安全投入
- [ ] funding-executions — 资金执行

### Phase 6: 统计报表 & 高级功能（2-3 天）

- [ ] month-statistics — 月度统计
- [ ] year-statistics — 年度统计
- [ ] check-statistics — 检查统计
- [ ] expert-inspections — 专家检查
- [ ] accident-bulletins — 事故通报
- [ ] information-drafts — 信息草稿
- [ ] office-notifies / new-notifies — 通知公告
- [ ] production-standardizations — 标准化生产
- [ ] filing-permissions — 归档权限
- [ ] todos — 待办事项
- [ ] company-map — 企业地图
- [ ] homes — 首页（企业信息/预警）
- [ ] bloc-* — 区块模块（集团端）
- [ ] online-inspection-* — 在线检查
- [ ] space-works — 空间作业
- [ ] three-togethers — 三同时
- [ ] report-configs — 报表配置

### Phase 7: 仪表板 & 数据可视化（1-2 天）

- [ ] 首页仪表板 — 关键指标卡片（企业数/隐患数/检查数/培训数）
- [ ] 图表组件 — echarts/recharts 集成
- [ ] 风险分布热力图
- [ ] 统计报表导出

---

## 🔌 对接策略

### 前后端通信模式

```
┌─────────────┐    Inertia Page Props    ┌──────────────┐
│  Inertia    │ ◄──────────────────────  │  Laravel     │
│  React Page │   (初始数据/共享状态)      │  Web Route   │
│             │                          │              │
│             │    fetch/axios           │              │
│             │ ──────────────────────►  │  API Route   │
│             │   (CRUD 操作)            │  /api/v1/*   │
└─────────────┘                          └──────────────┘
```

**两种模式并用**:
1. **Inertia props** — 页面初始数据（用户信息、菜单、权限列表）
2. **API 调用** — CRUD 操作通过 axios 调用 `/api/v1/*`

### API 响应格式

```json
// 成功
{
  "status": "success",
  "code": 200,
  "data": { ... } | [ ... ] | { "data": [...], "meta": {...} }
}

// 分页响应
{
  "status": "success",
  "code": 200,
  "data": {
    "current_page": 1,
    "data": [...],
    "total": 100,
    "per_page": 15,
    "last_page": 7
  }
}

// 错误
{
  "status": "error",
  "code": 400,
  "message": "错误描述"
}
```

---

## ⚡ 性能 & 并发优化

1. **并行子任务** — 使用 `delegate_task` 并行开发多个模块
2. **代码生成** — CRUD 模块基于模板批量生成，减少重复劳动
3. **按需加载** — 路由懒加载 + 动态 import
4. **虚拟滚动** — 大数据列表使用 `@tanstack/react-virtual`
5. **文件上传** — 大文件分片上传 + 进度条

---

## 📏 代码规范

- TypeScript 严格模式
- ESLint + Prettier（已有配置）
- 组件 PascalCase，文件 kebab-case
- 表单验证用 Zod schema
- API 类型与后端 Model 字段保持一致

---

## 📈 预估工作量

| 阶段 | 模块数 | 预估天数 |
|------|--------|----------|
| Phase 0: 基础设施 | - | 1-2 |
| Phase 1: 认证 | 1 | 1 |
| Phase 2: 系统管理 | 4 | 2-3 |
| Phase 3: 基础数据+台账 | ~30 | 3-4 |
| Phase 4: 风险+检查 | ~25 | 3-4 |
| Phase 5: 健康+应急+培训 | ~25 | 2-3 |
| Phase 6: 统计+高级 | ~20 | 2-3 |
| Phase 7: 仪表板 | - | 1-2 |
| **总计** | **~80** | **15-21** |

> 可通过并行子任务加速到 **8-12 天**
