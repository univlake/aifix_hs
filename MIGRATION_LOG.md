# 迁移对比日志

> 每次迁移一个模块，记录在此文件。方便追溯变化。

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
