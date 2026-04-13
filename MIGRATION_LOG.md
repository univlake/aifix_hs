# 迁移对比日志

> 每次迁移一个模块，记录在此文件。方便追溯变化。

---

## [阶段 0] 基础设施搭建 - 2026-04-13

### 迁移内容
| 项目 | 说明 |
|------|------|
| laravel/passport | `^13.7` — OAuth2 认证 |
| spatie/laravel-permission | `^7.3` — 权限管理 |
| maatwebsite/excel | `^3.1` — Excel 导入导出 |
| spatie/laravel-activitylog | `^5.0` — 操作日志 |

### 创建的文件
| 文件 | 说明 |
|------|------|
| `app/Traits/ApiResponse.php` | 统一响应格式 (从旧项目迁移，适配 Laravel 13 类型提示) |
| `app/Traits/ApiTree.php` | 公司层级树工具 (从旧项目迁移) |
| `app/Models/BaseModel.php` | 基础 Model，含 SoftDeletes + ActivityLog |
| `app/Http/Controllers/Api/Controller.php` | API 基类，含 childId/getCompanyId 公司树方法 |
| `app/Http/Controllers/Api/V1/AuthController.php` | 登录/注册/登出/获取用户 |
| `routes/api.php` | v1 前缀，认证路由 |
| `app/Enums/` | 目录已创建 |
| `app/Services/` | 目录已创建 |
| `app/Policies/` | 目录已创建 |
| `app/Http/Resources/` | 目录已创建 |
| `app/Http/Controllers/Common/` | 目录已创建 |

### 修改的文件
| 文件 | 变化 |
|------|------|
| `bootstrap/app.php` | 添加 `api:` 路由注册 |
| `config/auth.php` | api guard 使用 passport driver |
| `.env` | DB_CONNECTION=mysql, 指向旧库 hs_test |

### 数据库变化
- 已运行 migrate: users, cache, jobs, oauth_*, permissions, companies
- Passport 密钥已生成 (storage/oauth-*.key)
- SQLite → 已切换为 MySQL (旧库只读测试)

### 待处理
- companies 表当前只有 6 个字段，旧表有 31 个 → 阶段 1 补全 ✅
- AuthController 登录用 email，旧项目用 username → 阶段 1 统一 ✅

---

## [阶段 1] 认证 + 企业 + 人员 - 2026-04-13

### 迁移文件
| 旧文件 | 新文件 | 变化 |
|--------|--------|------|
| `app/Models/Company.php` | `app/Models/Company.php` | `$dates`→`$casts`, 添加关系类型提示 |
| `app/Models/User.php` | `app/Models/User.php` | 移除 `$fillable` 中的 `password` 安全修复 → 后因 register 需要重新添加 |
| `app/Models/Personnel.php` | `app/Models/Personnel.php` | 完整迁移，`$casts` 替代 `$dates` |
| `app/Models/EnterpriseType.php` | `app/Models/EnterpriseType.php` | 简单字典表 |
| `app/Models/OperationalType.php` | `app/Models/OperationalType.php` | 简单字典表 |
| `app/Models/BaseArea.php` | `app/Models/BaseArea.php` | 地区数据表 |
| `app/Models/RecordType.php` | `app/Models/RecordType.php` | 备案/许可类型 |
| `app/Models/CompanyGroup.php` | `app/Models/CompanyGroup.php` | 企业分组 |
| `app/Models/CompanyGroupKid.php` | `app/Models/CompanyGroupKid.php` | 企业分组子项 |
| `app/Http/Controllers/CompaniesController.php` | `app/Http/Controllers/Api/V1/CompanyController.php` | 拆分 CRUD + 树 + 审核 |

### 重构变更
- `Validator::make()` → `StoreCompanyRequest` + `LoginRequest` Form Request
- 添加 `CompanyPolicy` 授权检查 (update/delete/review)
- 登录路由添加 `throttle:login` 限流 (5次/分钟)
- `AuthController`: `createToken()` 返回值修复，`logout()` 添加 null 安全处理
- 公司列表/详情: eager loading `enterpriseType`, `operationalType`, `pidName`

### 数据库变化
- companies 表完整迁移 (32 字段，与旧表完全匹配)
- 新增 migration: users, cache, jobs, oauth_*, permissions, companies, personnels, base_areas, enterprise_types, operational_types, company_groups, company_group_kids, activity_log, record_types
- companies 表新增索引: title, enterprise_type_id, operational_type_id, area_id, credit_code, pid, is_produce, is_bloc, user_id, last_user_id, status

### API 变化
- `POST /admin/v1/login` → `POST /api/v1/login`
- `POST /admin/v1/register` → `POST /api/v1/register`
- `GET /admin/v1/companies` → `GET /api/v1/companies`
- `GET /admin/v1/companies/tree` → `GET /api/v1/companies-tree`
- `GET /admin/v1/personnels` → `GET /api/v1/personnels`
- 新增: `GET /api/v1/record-types`

### 测试覆盖
- AuthTest: 7 tests (登录/注册/登出/用户信息/改密码/验证)
- CompanyTest: 16 tests (CRUD/树/审核/权限)
- PersonnelTest: 9 tests (CRUD/过滤/验证)
- BaseDataTest: 4 tests (企业类型/经营类型/备案类型/鉴权)
- **总计: 44 tests, 79 assertions, 全部通过**

### 安全增强
- 登录/注册路由 Rate Limiting (5次/分钟)
- CompanyPolicy: 仅管理员可审核，仅创建者/管理员可编辑/删除
- `logout()` null 安全处理 (`token()?->revoke()`)

---

## [阶段 1 补充] RBAC 权限系统 - 2026-04-13

### 设计方案

**角色定义 (guard: api):**
| 角色 | 说明 | 包含权限 |
|------|------|---------|
| `super-admin` | 超级管理员 | 所有权限 |
| `admin` | 管理员 | 企业/人员/用户 CRUD + 基础数据（不含审核/系统管理） |
| `reviewer` | 审核员 | 查看企业/人员 + 审核企业 + 基础数据 |
| `user` | 普通用户 | 只读（企业列表/树/人员列表/基础数据） |

**权限矩阵:**
| 权限 | super-admin | admin | reviewer | user |
|------|:-----------:|:-----:|:--------:|:----:|
| companies.list | ✅ | ✅ | ✅ | ✅ |
| companies.create | ✅ | ✅ | ❌ | ❌ |
| companies.update | ✅ | ✅ | ❌ | ❌ |
| companies.delete | ✅ | ✅ | ❌ | ❌ |
| companies.tree | ✅ | ✅ | ✅ | ✅ |
| companies.review | ✅ | ❌ | ✅ | ❌ |
| personnels.list | ✅ | ✅ | ✅ | ✅ |
| personnels.create | ✅ | ✅ | ❌ | ❌ |
| personnels.update | ✅ | ✅ | ❌ | ❌ |
| personnels.delete | ✅ | ✅ | ❌ | ❌ |
| users.list | ✅ | ✅ | ❌ | ❌ |
| users.create | ✅ | ✅ | ❌ | ❌ |
| users.update | ✅ | ✅ | ❌ | ❌ |
| users.delete | ✅ | ❌ | ❌ | ❌ |
| roles.list/create/update/delete | ✅ | ❌ | ❌ | ❌ |
| roles.assign | ✅ | ❌ | ❌ | ❌ |
| permissions.list | ✅ | ❌ | ❌ | ❌ |
| base-data.view | ✅ | ✅ | ✅ | ✅ |

### 新增文件
| 文件 | 说明 |
|------|------|
| `database/seeders/RolesAndPermissionsSeeder.php` | 初始化 4 个角色 + 21 个权限 |
| `app/Http/Middleware/PermissionMiddleware.php` | 权限检查中间件（返回 JSON） |
| `app/Http/Middleware/RoleMiddleware.php` | 角色检查中间件（返回 JSON） |
| `app/Http/Controllers/Api/V1/RoleController.php` | 角色 CRUD 管理 |
| `app/Http/Controllers/Api/V1/PermissionController.php` | 权限列表（按模块分组） |
| `app/Http/Controllers/Api/V1/UserController.php` | 用户管理 + 角色分配 |

### 重构变更
- `User` model 添加 `HasRoles` trait
- `CompanyPolicy` 改用 `$user->hasPermissionTo()` 替代 `$user->role_id === 1`
- `AuthController.userInfo` 返回 `roles` + `permissions` 数组
- `AuthController.register` 默认分配 `user` 角色
- 路由中间件：每个端点绑定具体 `permission:xxx`
- `bootstrap/app.php` 注册 `permission` / `role` 中间件别名

### 前后端对接
前端可通过 `GET /api/v1/user-info` 获取用户角色和权限列表，据此控制菜单和按钮显隐：
```json
{
  "data": {
    "roles": ["admin"],
    "permissions": ["companies.list", "companies.create", ...]
  }
}
```

---

<!-- 示例格式:

## [阶段1 批次1.2] 企业管理 - 2026-04-13

### 迁移文件
| 旧文件 | 新文件 | 变化 |
|--------|--------|------|
| app/Models/Company.php | app/Models/Company.php | $dates→$casts, 添加关系类型提示 |
| app/Http/Controllers/Api/CompaniesController.php | app/Http/Controllers/Api/v1/CompanyController.php + app/Services/CompanyService.php | 拆分 Service |

### 重构变更
- `Validator::make()` → `StoreCompanyRequest` Form Request
- 添加 `CompanyPolicy` 授权检查
- 递归公司树查询改为 Redis 缓存 (TTL 1h)

### 数据库变化
- 合并: `create_companies_table` + `add_xxx_to_companies` (3个) → 1个干净 migration
- 新增索引: `idx_pid`, `idx_status`, `idx_enterprise_type_id`
- 字段变更: 无

### API 变化
- `GET /admin/v1/companies` → `GET /api/v1/companies`
- `GET /admin/v1/companies/tree` → `GET /api/v1/companies/tree`
- 新增: `GET /api/v1/companies/{id}/children`

### 性能优化
- 公司列表: eager loading `operationalType`, `enterpriseType`, `baseArea`
- 公司树: Redis 缓存，减少 N+1 递归查询

-->
