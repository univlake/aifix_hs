# API 接口文档 — 安全生产管理系统

> **Base URL**: `/api/v1`
> **认证方式**: Bearer Token (Laravel Passport OAuth2)
> **总路由数**: 563
> **模块数**: 133
> **生成时间**: 2026-04-14

## 认证

所有接口（除登录/注册外）需要在请求头中携带：
```
Authorization: Bearer {access_token}
```

## 通用响应格式

```json
// 成功
{"status": "success", "code": 200, "data": {...}}

// 分页
{"status": "success", "code": 200, "data": {"current_page": 1, "data": [...], "total": 100, "per_page": 15, "last_page": 7}}

// 错误
{"status": "error", "code": 400, "message": "错误描述"}
```

## 认证管理

### login

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `api/v1/login` | 登录 |

### logout

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `api/v1/logout` | 登出 |

### register

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `api/v1/register` | 注册 |

### reset-password

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `api/v1/reset-password` | 修改密码 |

### user-info

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/user-info` | 获取用户信息 |

### permissions

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/permissions` | 所有权限列表（按模块分组） |

### visible

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/visible` | 列表 |

## 系统管理

### companies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/companies` | 列表 |
| POST | `api/v1/companies` | 创建 |
| GET/HEAD | `api/v1/companies/{company}` | 列表 |
| PUT | `api/v1/companies/{company}` |  |
| PATCH | `api/v1/companies/{company}` | 部分更新 |
| DELETE | `api/v1/companies/{company}` |  |
| POST | `api/v1/companies/{id}/review` | 创建 |

### users

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/users` | 列表 |
| POST | `api/v1/users` | 创建 |
| GET/HEAD | `api/v1/users/{user}` | 列表 |
| PUT | `api/v1/users/{user}` |  |
| DELETE | `api/v1/users/{user}` |  |
| PUT | `api/v1/users/{user}/password` |  |
| PUT | `api/v1/users/{user}/role` |  |

### roles

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/roles` | 创建角色 |
| POST | `api/v1/roles` | 创建角色 |
| GET/HEAD | `api/v1/roles/{role}` | 创建角色 |
| PUT | `api/v1/roles/{role}` | 创建角色 |
| DELETE | `api/v1/roles/{role}` | 创建角色 |

### companies-tree

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/companies-tree` | 创建企业 |

### company-map

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/company-map` | 列表 |

### companies-review-list

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/companies-review-list` | 创建企业 |

### enterprise-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/enterprise-types` | 企业类型列表 |

### operational-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/operational-types` | 经营类型列表 |

### filing-permissions

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/filing-permissions` | 列表 |
| POST | `api/v1/filing-permissions` | 创建 |
| GET/HEAD | `api/v1/filing-permissions/{id}` | 详情 |
| PUT | `api/v1/filing-permissions/{id}` | 更新 |
| PATCH | `api/v1/filing-permissions/{id}` | 部分更新 |
| DELETE | `api/v1/filing-permissions/{id}` | 删除 |

## 企业管理

### personnels

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/personnels` | 创建人员 |
| POST | `api/v1/personnels` | 创建人员 |
| GET/HEAD | `api/v1/personnels/{personnel}` | 创建人员 |
| PUT | `api/v1/personnels/{personnel}` | 创建人员 |
| PATCH | `api/v1/personnels/{personnel}` | 创建人员 |
| DELETE | `api/v1/personnels/{personnel}` | 创建人员 |

### buildings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/buildings` | 创建建筑 |
| POST | `api/v1/buildings` | 创建建筑 |
| GET/HEAD | `api/v1/buildings/{id}` | 创建建筑 |
| PUT | `api/v1/buildings/{id}` | 创建建筑 |
| PATCH | `api/v1/buildings/{id}` | 创建建筑 |
| DELETE | `api/v1/buildings/{id}` | 创建建筑 |

### job-management

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/job-management` | 创建作业管理 |
| POST | `api/v1/job-management` | 创建作业管理 |
| GET/HEAD | `api/v1/job-management/{id}` | 创建作业管理 |
| PUT | `api/v1/job-management/{id}` | 创建作业管理 |
| PATCH | `api/v1/job-management/{id}` | 创建作业管理 |
| DELETE | `api/v1/job-management/{id}` | 创建作业管理 |

### skill-units

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/skill-units` | 创建施工单位 |
| POST | `api/v1/skill-units` | 创建施工单位 |
| GET/HEAD | `api/v1/skill-units/{id}` | 创建施工单位 |
| PUT | `api/v1/skill-units/{id}` | 创建施工单位 |
| PATCH | `api/v1/skill-units/{id}` | 创建施工单位 |
| DELETE | `api/v1/skill-units/{id}` | 创建施工单位 |

### design-units

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/design-units` | 创建设计单位 |
| POST | `api/v1/design-units` | 创建设计单位 |
| GET/HEAD | `api/v1/design-units/{id}` | 创建设计单位 |
| PUT | `api/v1/design-units/{id}` | 创建设计单位 |
| PATCH | `api/v1/design-units/{id}` | 创建设计单位 |
| DELETE | `api/v1/design-units/{id}` | 创建设计单位 |

### evaluation-units

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/evaluation-units` | 创建评价单位 |
| POST | `api/v1/evaluation-units` | 创建评价单位 |
| GET/HEAD | `api/v1/evaluation-units/{id}` | 创建评价单位 |
| PUT | `api/v1/evaluation-units/{id}` | 创建评价单位 |
| PATCH | `api/v1/evaluation-units/{id}` | 创建评价单位 |
| DELETE | `api/v1/evaluation-units/{id}` | 创建评价单位 |

### base-areas

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/base-areas` | 地区列表 |

## 安全台账

### special-equipment

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/special-equipment` | 列表 |
| POST | `api/v1/special-equipment` | 创建 |
| GET/HEAD | `api/v1/special-equipment/{id}` | 详情 |
| PUT | `api/v1/special-equipment/{id}` | 更新 |
| PATCH | `api/v1/special-equipment/{id}` | 部分更新 |
| DELETE | `api/v1/special-equipment/{id}` | 删除 |

### special-equipment-staff

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/special-equipment-staff` | 列表 |
| POST | `api/v1/special-equipment-staff` | 创建 |
| GET/HEAD | `api/v1/special-equipment-staff/{id}` | 详情 |
| PUT | `api/v1/special-equipment-staff/{id}` | 更新 |
| PATCH | `api/v1/special-equipment-staff/{id}` | 部分更新 |
| DELETE | `api/v1/special-equipment-staff/{id}` | 删除 |

### special-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/special-types` | 创建设备类型 |
| POST | `api/v1/special-types` | 创建设备类型 |
| PUT | `api/v1/special-types/{id}` | 创建设备类型 |
| PATCH | `api/v1/special-types/{id}` | 创建设备类型 |
| DELETE | `api/v1/special-types/{id}` | 创建设备类型 |

### dangerous-equipment

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/dangerous-equipment` | 列表 |
| POST | `api/v1/dangerous-equipment` | 创建 |
| GET/HEAD | `api/v1/dangerous-equipment/{id}` | 详情 |
| PUT | `api/v1/dangerous-equipment/{id}` | 更新 |
| PATCH | `api/v1/dangerous-equipment/{id}` | 部分更新 |
| DELETE | `api/v1/dangerous-equipment/{id}` | 删除 |

### dangerous-craft-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/dangerous-craft-types` | 创建危险工艺类型 |
| POST | `api/v1/dangerous-craft-types` | 创建危险工艺类型 |
| PUT | `api/v1/dangerous-craft-types/{id}` | 创建危险工艺类型 |
| PATCH | `api/v1/dangerous-craft-types/{id}` | 创建危险工艺类型 |
| DELETE | `api/v1/dangerous-craft-types/{id}` | 创建危险工艺类型 |

### hazardous-chemicals

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/hazardous-chemicals` | 列表 |
| POST | `api/v1/hazardous-chemicals` | 创建 |
| GET/HEAD | `api/v1/hazardous-chemicals/{id}` | 详情 |
| PUT | `api/v1/hazardous-chemicals/{id}` | 更新 |
| PATCH | `api/v1/hazardous-chemicals/{id}` | 部分更新 |
| DELETE | `api/v1/hazardous-chemicals/{id}` | 删除 |

### hazardous-processes

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/hazardous-processes` | 列表 |
| POST | `api/v1/hazardous-processes` | 创建 |
| GET/HEAD | `api/v1/hazardous-processes/{id}` | 详情 |
| PUT | `api/v1/hazardous-processes/{id}` | 更新 |
| PATCH | `api/v1/hazardous-processes/{id}` | 部分更新 |
| DELETE | `api/v1/hazardous-processes/{id}` | 删除 |

### major-hazards

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/major-hazards` | 列表 |
| POST | `api/v1/major-hazards` | 创建 |
| GET/HEAD | `api/v1/major-hazards/{id}` | 详情 |
| PUT | `api/v1/major-hazards/{id}` | 更新 |
| PATCH | `api/v1/major-hazards/{id}` | 部分更新 |
| DELETE | `api/v1/major-hazards/{id}` | 删除 |

### major-hazardous-processes

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/major-hazardous-processes` | 列表 |
| POST | `api/v1/major-hazardous-processes` | 创建 |
| GET/HEAD | `api/v1/major-hazardous-processes/{id}` | 详情 |
| PUT | `api/v1/major-hazardous-processes/{id}` | 更新 |
| PATCH | `api/v1/major-hazardous-processes/{id}` | 部分更新 |
| DELETE | `api/v1/major-hazardous-processes/{id}` | 删除 |

### certificate-statuses

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/certificate-statuses` | 创建持证情况 |
| POST | `api/v1/certificate-statuses` | 创建持证情况 |
| GET/HEAD | `api/v1/certificate-statuses/{id}` | 创建持证情况 |
| PUT | `api/v1/certificate-statuses/{id}` | 创建持证情况 |
| PATCH | `api/v1/certificate-statuses/{id}` | 创建持证情况 |
| DELETE | `api/v1/certificate-statuses/{id}` | 创建持证情况 |

### health-systems

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/health-systems` | 列表 |
| POST | `api/v1/health-systems` | 创建 |
| PUT | `api/v1/health-systems/{id}` | 更新 |
| PATCH | `api/v1/health-systems/{id}` | 部分更新 |

## 消防管理

### fire-equipment

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/fire-equipment` | 列表 |
| POST | `api/v1/fire-equipment` | 创建 |
| GET/HEAD | `api/v1/fire-equipment/{id}` | 详情 |
| PUT | `api/v1/fire-equipment/{id}` | 更新 |
| PATCH | `api/v1/fire-equipment/{id}` | 部分更新 |
| DELETE | `api/v1/fire-equipment/{id}` | 删除 |

### fire-facilities

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/fire-facilities` | 列表 |
| POST | `api/v1/fire-facilities` | 创建 |
| GET/HEAD | `api/v1/fire-facilities/{id}` | 详情 |
| PUT | `api/v1/fire-facilities/{id}` | 更新 |
| PATCH | `api/v1/fire-facilities/{id}` | 部分更新 |
| DELETE | `api/v1/fire-facilities/{id}` | 删除 |

### fire-safeties

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/fire-safeties` | 列表 |
| POST | `api/v1/fire-safeties` | 创建 |
| GET/HEAD | `api/v1/fire-safeties/{id}` | 详情 |
| PUT | `api/v1/fire-safeties/{id}` | 更新 |
| PATCH | `api/v1/fire-safeties/{id}` | 部分更新 |
| DELETE | `api/v1/fire-safeties/{id}` | 删除 |

## 风险管理

### hazards

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/hazards` | 列表 |
| POST | `api/v1/hazards` | 创建 |
| GET/HEAD | `api/v1/hazards/{id}` | 详情 |
| PUT | `api/v1/hazards/{id}` | 更新 |
| PATCH | `api/v1/hazards/{id}` | 部分更新 |
| DELETE | `api/v1/hazards/{id}` | 删除 |

### risk-logs

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/risk-logs` | 列表 |
| POST | `api/v1/risk-logs` | 创建 |
| GET/HEAD | `api/v1/risk-logs/{id}` | 详情 |
| PUT | `api/v1/risk-logs/{id}` | 更新 |
| PATCH | `api/v1/risk-logs/{id}` | 部分更新 |
| DELETE | `api/v1/risk-logs/{id}` | 删除 |

### float-risk-logs

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/float-risk-logs` | 列表 |
| POST | `api/v1/float-risk-logs` | 创建 |
| GET/HEAD | `api/v1/float-risk-logs/{id}` | 详情 |
| PUT | `api/v1/float-risk-logs/{id}` | 更新 |
| PATCH | `api/v1/float-risk-logs/{id}` | 部分更新 |
| DELETE | `api/v1/float-risk-logs/{id}` | 删除 |

### inherent-risk-logs

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/inherent-risk-logs` | 列表 |
| POST | `api/v1/inherent-risk-logs` | 创建 |
| GET/HEAD | `api/v1/inherent-risk-logs/{id}` | 详情 |
| PUT | `api/v1/inherent-risk-logs/{id}` | 更新 |
| PATCH | `api/v1/inherent-risk-logs/{id}` | 部分更新 |
| DELETE | `api/v1/inherent-risk-logs/{id}` | 删除 |

### risk-max-values

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/risk-max-values` | 列表 |
| POST | `api/v1/risk-max-values` | 创建 |
| GET/HEAD | `api/v1/risk-max-values/{id}` | 详情 |
| PUT | `api/v1/risk-max-values/{id}` | 更新 |
| PATCH | `api/v1/risk-max-values/{id}` | 部分更新 |
| DELETE | `api/v1/risk-max-values/{id}` | 删除 |

### risk-distribution-maps

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/risk-distribution-maps` | 列表 |
| POST | `api/v1/risk-distribution-maps` | 创建 |
| PUT | `api/v1/risk-distribution-maps/{id}` | 更新 |
| PATCH | `api/v1/risk-distribution-maps/{id}` | 部分更新 |

### risks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/risks/log` | 列表 |
| GET/HEAD | `api/v1/risks/portrait` | 列表 |

### bloc-risks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks` | 列表 |

### bloc-risks-float

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-float` | 列表 |

### bloc-risks-inherent

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-inherent` | 列表 |

### bloc-risks-sort

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-sort` | 列表 |

### bloc-risks-float-statistics

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-float-statistics` | 列表 |

### bloc-risks-inherent-statistics

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-inherent-statistics` | 列表 |

### bloc-risks-log

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks-log` | 列表 |

### bloc-hidden-danger-sort

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-hidden-danger-sort` | 列表 |

## 隐患排查

### hidden-danger-infos

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/hidden-danger-infos` | 列表 |
| POST | `api/v1/hidden-danger-infos` | 创建 |
| GET/HEAD | `api/v1/hidden-danger-infos/{id}` | 详情 |
| PUT | `api/v1/hidden-danger-infos/{id}` | 更新 |
| PATCH | `api/v1/hidden-danger-infos/{id}` | 部分更新 |
| DELETE | `api/v1/hidden-danger-infos/{id}` | 删除 |

### rectification-sheets

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/rectification-sheets` | 列表 |
| POST | `api/v1/rectification-sheets` | 创建 |
| GET/HEAD | `api/v1/rectification-sheets/{id}` | 详情 |
| PUT | `api/v1/rectification-sheets/{id}` | 更新 |
| PATCH | `api/v1/rectification-sheets/{id}` | 部分更新 |
| DELETE | `api/v1/rectification-sheets/{id}` | 删除 |

### rectification-sheet-count

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/rectification-sheet-count` | 整改统计
      TODO: 完善统计逻辑 |

### monthly-investigations

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/monthly-investigations` | 列表 |
| POST | `api/v1/monthly-investigations` | 创建 |
| GET/HEAD | `api/v1/monthly-investigations/{id}` | 详情 |
| PUT | `api/v1/monthly-investigations/{id}` | 更新 |
| PATCH | `api/v1/monthly-investigations/{id}` | 部分更新 |
| DELETE | `api/v1/monthly-investigations/{id}` | 删除 |

### checklist-libraries

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/checklist-libraries` | 创建检查清单库 |
| POST | `api/v1/checklist-libraries` | 创建检查清单库 |
| PUT | `api/v1/checklist-libraries/{id}` | 创建检查清单库 |
| PATCH | `api/v1/checklist-libraries/{id}` | 创建检查清单库 |
| DELETE | `api/v1/checklist-libraries/{id}` | 创建检查清单库 |

## 检查管理

### daily-checks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/daily-checks` | 列表 |
| POST | `api/v1/daily-checks` | 创建 |
| GET/HEAD | `api/v1/daily-checks/{id}` | 详情 |
| PUT | `api/v1/daily-checks/{id}` | 更新 |
| PATCH | `api/v1/daily-checks/{id}` | 部分更新 |
| DELETE | `api/v1/daily-checks/{id}` | 删除 |

### daily-check-templates

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/daily-check-templates` | 列表 |
| POST | `api/v1/daily-check-templates` | 创建 |
| GET/HEAD | `api/v1/daily-check-templates/{id}` | 详情 |
| PUT | `api/v1/daily-check-templates/{id}` | 更新 |
| PATCH | `api/v1/daily-check-templates/{id}` | 部分更新 |
| DELETE | `api/v1/daily-check-templates/{id}` | 删除 |

### double-checks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/double-checks` | 列表 |
| POST | `api/v1/double-checks` | 创建 |
| GET/HEAD | `api/v1/double-checks/{id}` | 详情 |
| PUT | `api/v1/double-checks/{id}` | 更新 |
| PATCH | `api/v1/double-checks/{id}` | 部分更新 |
| DELETE | `api/v1/double-checks/{id}` | 删除 |

### double-check-templates

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/double-check-templates` | 列表 |
| POST | `api/v1/double-check-templates` | 创建 |
| GET/HEAD | `api/v1/double-check-templates/{id}` | 详情 |
| PUT | `api/v1/double-check-templates/{id}` | 更新 |
| PATCH | `api/v1/double-check-templates/{id}` | 部分更新 |
| DELETE | `api/v1/double-check-templates/{id}` | 删除 |

### system-checks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/system-checks` | 列表 |
| POST | `api/v1/system-checks` | 创建 |
| GET/HEAD | `api/v1/system-checks/{id}` | 详情 |
| PUT | `api/v1/system-checks/{id}` | 更新 |
| PATCH | `api/v1/system-checks/{id}` | 部分更新 |
| DELETE | `api/v1/system-checks/{id}` | 删除 |

### norm-checks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/norm-checks` | 列表 |
| POST | `api/v1/norm-checks` | 创建 |
| GET/HEAD | `api/v1/norm-checks/{id}` | 详情 |
| PUT | `api/v1/norm-checks/{id}` | 更新 |
| PATCH | `api/v1/norm-checks/{id}` | 部分更新 |
| DELETE | `api/v1/norm-checks/{id}` | 删除 |

### accident-checks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/accident-checks` | 列表 |
| POST | `api/v1/accident-checks` | 创建 |
| GET/HEAD | `api/v1/accident-checks/{id}` | 详情 |
| PUT | `api/v1/accident-checks/{id}` | 更新 |
| PATCH | `api/v1/accident-checks/{id}` | 部分更新 |
| DELETE | `api/v1/accident-checks/{id}` | 删除 |

### accident-check-templates

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/accident-check-templates` | 列表 |
| POST | `api/v1/accident-check-templates` | 创建 |
| GET/HEAD | `api/v1/accident-check-templates/{id}` | 详情 |
| PUT | `api/v1/accident-check-templates/{id}` | 更新 |
| PATCH | `api/v1/accident-check-templates/{id}` | 部分更新 |
| DELETE | `api/v1/accident-check-templates/{id}` | 删除 |

### add-points

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/add-points` | 列表 |
| POST | `api/v1/add-points` | 创建 |
| GET/HEAD | `api/v1/add-points/{id}` | 详情 |
| PUT | `api/v1/add-points/{id}` | 更新 |
| PATCH | `api/v1/add-points/{id}` | 部分更新 |
| DELETE | `api/v1/add-points/{id}` | 删除 |

### add-points-templates

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/add-points-templates` | 列表 |
| POST | `api/v1/add-points-templates` | 创建 |
| GET/HEAD | `api/v1/add-points-templates/{id}` | 详情 |
| PUT | `api/v1/add-points-templates/{id}` | 更新 |
| PATCH | `api/v1/add-points-templates/{id}` | 部分更新 |
| DELETE | `api/v1/add-points-templates/{id}` | 删除 |

### check-statistics

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/check-statistics` | 列表 |

## 职业健康

### occupational-hazards

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/occupational-hazards` | 列表 |
| POST | `api/v1/occupational-hazards` | 创建 |
| GET/HEAD | `api/v1/occupational-hazards/{id}` | 详情 |
| PUT | `api/v1/occupational-hazards/{id}` | 更新 |
| PATCH | `api/v1/occupational-hazards/{id}` | 部分更新 |
| DELETE | `api/v1/occupational-hazards/{id}` | 删除 |

### health-files

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/health-files` | 列表 |
| POST | `api/v1/health-files` | 创建 |
| GET/HEAD | `api/v1/health-files/{id}` | 详情 |
| PUT | `api/v1/health-files/{id}` | 更新 |
| PATCH | `api/v1/health-files/{id}` | 部分更新 |
| DELETE | `api/v1/health-files/{id}` | 删除 |

### health-checkups

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/health-checkups` | 列表 |
| POST | `api/v1/health-checkups` | 创建 |
| GET/HEAD | `api/v1/health-checkups/{id}` | 详情 |
| PUT | `api/v1/health-checkups/{id}` | 更新 |
| PATCH | `api/v1/health-checkups/{id}` | 部分更新 |
| DELETE | `api/v1/health-checkups/{id}` | 删除 |

### health-reports

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/health-reports` | 列表 |
| POST | `api/v1/health-reports` | 创建 |
| GET/HEAD | `api/v1/health-reports/{id}` | 详情 |
| PUT | `api/v1/health-reports/{id}` | 更新 |
| PATCH | `api/v1/health-reports/{id}` | 部分更新 |
| DELETE | `api/v1/health-reports/{id}` | 删除 |

### hygiene-evaluations

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/hygiene-evaluations` | 列表 |
| POST | `api/v1/hygiene-evaluations` | 创建 |
| GET/HEAD | `api/v1/hygiene-evaluations/{id}` | 详情 |
| PUT | `api/v1/hygiene-evaluations/{id}` | 更新 |
| PATCH | `api/v1/hygiene-evaluations/{id}` | 部分更新 |
| DELETE | `api/v1/hygiene-evaluations/{id}` | 删除 |

### elimination-control-staff

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/elimination-control-staff` | 创建淘汰控制人员 |
| POST | `api/v1/elimination-control-staff` | 创建淘汰控制人员 |
| GET/HEAD | `api/v1/elimination-control-staff/{id}` | 创建淘汰控制人员 |
| PUT | `api/v1/elimination-control-staff/{id}` | 创建淘汰控制人员 |
| PATCH | `api/v1/elimination-control-staff/{id}` | 创建淘汰控制人员 |
| DELETE | `api/v1/elimination-control-staff/{id}` | 创建淘汰控制人员 |

## 应急管理

### emergency-drills

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/emergency-drills` | 列表 |
| POST | `api/v1/emergency-drills` | 创建 |
| GET/HEAD | `api/v1/emergency-drills/{id}` | 详情 |
| PUT | `api/v1/emergency-drills/{id}` | 更新 |
| PATCH | `api/v1/emergency-drills/{id}` | 部分更新 |
| DELETE | `api/v1/emergency-drills/{id}` | 删除 |

### emergency-supplies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/emergency-supplies` | 列表 |
| POST | `api/v1/emergency-supplies` | 创建 |
| GET/HEAD | `api/v1/emergency-supplies/{id}` | 详情 |
| PUT | `api/v1/emergency-supplies/{id}` | 更新 |
| PATCH | `api/v1/emergency-supplies/{id}` | 部分更新 |
| DELETE | `api/v1/emergency-supplies/{id}` | 删除 |

### emergency-teams

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/emergency-teams` | 列表 |
| POST | `api/v1/emergency-teams` | 创建 |
| GET/HEAD | `api/v1/emergency-teams/{id}` | 详情 |
| PUT | `api/v1/emergency-teams/{id}` | 更新 |
| PATCH | `api/v1/emergency-teams/{id}` | 部分更新 |
| DELETE | `api/v1/emergency-teams/{id}` | 删除 |

## 培训管理

### training-classes

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/training-classes` | 列表 |
| POST | `api/v1/training-classes` | 创建 |
| GET/HEAD | `api/v1/training-classes/{id}` | 详情 |
| PUT | `api/v1/training-classes/{id}` | 更新 |
| PATCH | `api/v1/training-classes/{id}` | 部分更新 |
| DELETE | `api/v1/training-classes/{id}` | 删除 |

### training-class-infos

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/training-class-infos` | 列表 |
| POST | `api/v1/training-class-infos` | 创建 |
| GET/HEAD | `api/v1/training-class-infos/{id}` | 详情 |
| PUT | `api/v1/training-class-infos/{id}` | 更新 |
| PATCH | `api/v1/training-class-infos/{id}` | 部分更新 |
| DELETE | `api/v1/training-class-infos/{id}` | 删除 |

### training-class-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/training-class-types` | 创建培训课类型 |
| POST | `api/v1/training-class-types` | 创建培训课类型 |
| PUT | `api/v1/training-class-types/{id}` | 创建培训课类型 |
| PATCH | `api/v1/training-class-types/{id}` | 创建培训课类型 |
| DELETE | `api/v1/training-class-types/{id}` | 创建培训课类型 |

### training-files

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/training-files` | 列表 |
| POST | `api/v1/training-files` | 创建 |
| GET/HEAD | `api/v1/training-files/{id}` | 详情 |
| PUT | `api/v1/training-files/{id}` | 更新 |
| PATCH | `api/v1/training-files/{id}` | 部分更新 |
| DELETE | `api/v1/training-files/{id}` | 删除 |

### training-videos

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/training-videos` | 列表 |
| POST | `api/v1/training-videos` | 创建 |
| GET/HEAD | `api/v1/training-videos/{id}` | 详情 |
| PUT | `api/v1/training-videos/{id}` | 更新 |
| PATCH | `api/v1/training-videos/{id}` | 部分更新 |
| DELETE | `api/v1/training-videos/{id}` | 删除 |

### internal-trainings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/internal-trainings` | 列表 |
| POST | `api/v1/internal-trainings` | 创建 |
| GET/HEAD | `api/v1/internal-trainings/{id}` | 详情 |
| PUT | `api/v1/internal-trainings/{id}` | 更新 |
| PATCH | `api/v1/internal-trainings/{id}` | 部分更新 |
| DELETE | `api/v1/internal-trainings/{id}` | 删除 |

### external-trainings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/external-trainings` | 列表 |
| POST | `api/v1/external-trainings` | 创建 |
| GET/HEAD | `api/v1/external-trainings/{id}` | 详情 |
| PUT | `api/v1/external-trainings/{id}` | 更新 |
| PATCH | `api/v1/external-trainings/{id}` | 部分更新 |
| DELETE | `api/v1/external-trainings/{id}` | 删除 |

### other-trainings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/other-trainings` | 列表 |
| POST | `api/v1/other-trainings` | 创建 |
| GET/HEAD | `api/v1/other-trainings/{id}` | 详情 |
| PUT | `api/v1/other-trainings/{id}` | 更新 |
| PATCH | `api/v1/other-trainings/{id}` | 部分更新 |
| DELETE | `api/v1/other-trainings/{id}` | 删除 |

## 会议管理

### meetings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/meetings` | 列表 |
| POST | `api/v1/meetings` | 创建 |
| GET/HEAD | `api/v1/meetings/{id}` | 详情 |
| PUT | `api/v1/meetings/{id}` | 更新 |
| PATCH | `api/v1/meetings/{id}` | 部分更新 |
| DELETE | `api/v1/meetings/{id}` | 删除 |

### meeting-sign-ups

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/meeting-sign-ups` | 列表 |
| POST | `api/v1/meeting-sign-ups` | 创建 |
| GET/HEAD | `api/v1/meeting-sign-ups/{id}` | 详情 |
| PUT | `api/v1/meeting-sign-ups/{id}` | 更新 |
| PATCH | `api/v1/meeting-sign-ups/{id}` | 部分更新 |
| DELETE | `api/v1/meeting-sign-ups/{id}` | 删除 |

### internal-meetings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/internal-meetings` | 列表 |
| POST | `api/v1/internal-meetings` | 创建 |
| GET/HEAD | `api/v1/internal-meetings/{id}` | 详情 |
| PUT | `api/v1/internal-meetings/{id}` | 更新 |
| PATCH | `api/v1/internal-meetings/{id}` | 部分更新 |
| DELETE | `api/v1/internal-meetings/{id}` | 删除 |

## 变更与安全

### change-manages

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/change-manages` | 创建变更管理 |
| POST | `api/v1/change-manages` | 创建变更管理 |
| GET/HEAD | `api/v1/change-manages/{id}` | 创建变更管理 |
| PUT | `api/v1/change-manages/{id}` | 创建变更管理 |
| PATCH | `api/v1/change-manages/{id}` | 创建变更管理 |
| DELETE | `api/v1/change-manages/{id}` | 创建变更管理 |

### safety-management

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/safety-management` | 创建安全管理人员类型 |
| POST | `api/v1/safety-management` | 创建安全管理人员类型 |
| GET/HEAD | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| PUT | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| PATCH | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| DELETE | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |

### safety-management-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/safety-management-types` | 创建安全管理人员类型 |
| POST | `api/v1/safety-management-types` | 创建安全管理人员类型 |
| PUT | `api/v1/safety-management-types/{id}` | 创建安全管理人员类型 |
| PATCH | `api/v1/safety-management-types/{id}` | 创建安全管理人员类型 |
| DELETE | `api/v1/safety-management-types/{id}` | 创建安全管理人员类型 |

### safety-architectures

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/safety-architectures` | 创建安全架构 |
| POST | `api/v1/safety-architectures` | 创建安全架构 |
| PUT | `api/v1/safety-architectures/{id}` | 创建安全架构 |
| PATCH | `api/v1/safety-architectures/{id}` | 创建安全架构 |

### security-investments

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/security-investments` | 列表 |
| POST | `api/v1/security-investments` | 创建 |
| GET/HEAD | `api/v1/security-investments/{id}` | 详情 |
| PUT | `api/v1/security-investments/{id}` | 更新 |
| PATCH | `api/v1/security-investments/{id}` | 部分更新 |
| DELETE | `api/v1/security-investments/{id}` | 删除 |

### funding-executions

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/funding-executions` | 列表 |
| POST | `api/v1/funding-executions` | 创建 |
| GET/HEAD | `api/v1/funding-executions/{id}` | 详情 |
| PUT | `api/v1/funding-executions/{id}` | 更新 |
| PATCH | `api/v1/funding-executions/{id}` | 部分更新 |
| DELETE | `api/v1/funding-executions/{id}` | 删除 |

## 通知公告

### office-notifies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/office-notifies` | 列表 |
| POST | `api/v1/office-notifies` | 创建 |
| GET/HEAD | `api/v1/office-notifies/{id}` | 详情 |
| PUT | `api/v1/office-notifies/{id}` | 更新 |
| PATCH | `api/v1/office-notifies/{id}` | 部分更新 |
| DELETE | `api/v1/office-notifies/{id}` | 删除 |

### new-notifies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/new-notifies` | 列表 |
| POST | `api/v1/new-notifies` | 创建 |
| GET/HEAD | `api/v1/new-notifies/{id}` | 详情 |
| PUT | `api/v1/new-notifies/{id}` | 更新 |
| PATCH | `api/v1/new-notifies/{id}` | 部分更新 |
| DELETE | `api/v1/new-notifies/{id}` | 删除 |

### information-drafts

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/information-drafts` | 列表 |
| POST | `api/v1/information-drafts` | 创建 |
| GET/HEAD | `api/v1/information-drafts/{id}` | 详情 |
| PUT | `api/v1/information-drafts/{id}` | 更新 |
| PATCH | `api/v1/information-drafts/{id}` | 部分更新 |
| DELETE | `api/v1/information-drafts/{id}` | 删除 |

## 统计报表

### month-statistics

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/month-statistics` | 列表 |
| POST | `api/v1/month-statistics` | 创建 |
| GET/HEAD | `api/v1/month-statistics/{id}` | 详情 |
| PUT | `api/v1/month-statistics/{id}` | 更新 |
| PATCH | `api/v1/month-statistics/{id}` | 部分更新 |
| DELETE | `api/v1/month-statistics/{id}` | 删除 |

### year-statistics

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/year-statistics` | 列表 |
| POST | `api/v1/year-statistics` | 创建 |
| GET/HEAD | `api/v1/year-statistics/{id}` | 详情 |
| PUT | `api/v1/year-statistics/{id}` | 更新 |
| PATCH | `api/v1/year-statistics/{id}` | 部分更新 |
| DELETE | `api/v1/year-statistics/{id}` | 删除 |

### expert-inspections

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/expert-inspections` | 列表 |
| POST | `api/v1/expert-inspections` | 创建 |
| GET/HEAD | `api/v1/expert-inspections/{id}` | 详情 |
| PUT | `api/v1/expert-inspections/{id}` | 更新 |
| PATCH | `api/v1/expert-inspections/{id}` | 部分更新 |
| DELETE | `api/v1/expert-inspections/{id}` | 删除 |

### expert-inspection-companies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/expert-inspection-companies` | 列表 |
| POST | `api/v1/expert-inspection-companies` | 创建 |
| PUT | `api/v1/expert-inspection-companies/{id}` | 更新 |
| PATCH | `api/v1/expert-inspection-companies/{id}` | 部分更新 |
| DELETE | `api/v1/expert-inspection-companies/{id}` | 删除 |

### expert-inspection-users

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/expert-inspection-users` | 列表 |
| POST | `api/v1/expert-inspection-users` | 创建 |
| PUT | `api/v1/expert-inspection-users/{id}` | 更新 |
| PATCH | `api/v1/expert-inspection-users/{id}` | 部分更新 |
| DELETE | `api/v1/expert-inspection-users/{id}` | 删除 |

### accident-bulletins

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/accident-bulletins` | 列表 |
| POST | `api/v1/accident-bulletins` | 创建 |
| GET/HEAD | `api/v1/accident-bulletins/{id}` | 详情 |
| PUT | `api/v1/accident-bulletins/{id}` | 更新 |
| PATCH | `api/v1/accident-bulletins/{id}` | 部分更新 |
| DELETE | `api/v1/accident-bulletins/{id}` | 删除 |

### production-standardizations

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/production-standardizations` | 创建安全生产标准化 |
| POST | `api/v1/production-standardizations` | 创建安全生产标准化 |
| PUT | `api/v1/production-standardizations/{id}` | 创建安全生产标准化 |
| PATCH | `api/v1/production-standardizations/{id}` | 创建安全生产标准化 |

### enterprise-report

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/enterprise-report` | 列表 |

### report-configs

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/report-configs` | 创建报表配置 |
| POST | `api/v1/report-configs` | 创建报表配置 |
| PUT | `api/v1/report-configs/{id}` | 创建报表配置 |
| PATCH | `api/v1/report-configs/{id}` | 创建报表配置 |
| DELETE | `api/v1/report-configs/{id}` | 创建报表配置 |

## 首页仪表板

### homes-company-info

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/homes-company-info` | 列表 |

### homes-early-warning

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/homes-early-warning` | 列表 |

### todos

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/todos` | 列表 |

### todos-list-table

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/todos-list-table` | 列表 |

## 法律法规库

### regulation-libraries

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/regulation-libraries` | 列表 |
| POST | `api/v1/regulation-libraries` | 创建 |
| GET/HEAD | `api/v1/regulation-libraries/{id}` | 详情 |
| PUT | `api/v1/regulation-libraries/{id}` | 更新 |
| PATCH | `api/v1/regulation-libraries/{id}` | 部分更新 |
| DELETE | `api/v1/regulation-libraries/{id}` | 删除 |

### regulation-library-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/regulation-library-types` | 创建法规类型 |
| POST | `api/v1/regulation-library-types` | 创建法规类型 |
| PUT | `api/v1/regulation-library-types/{id}` | 创建法规类型 |
| PATCH | `api/v1/regulation-library-types/{id}` | 创建法规类型 |
| DELETE | `api/v1/regulation-library-types/{id}` | 创建法规类型 |

## 空间作业

### space-works

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/space-works` | 列表 |
| POST | `api/v1/space-works` | 创建 |
| GET/HEAD | `api/v1/space-works/{id}` | 详情 |
| PUT | `api/v1/space-works/{id}` | 更新 |
| PATCH | `api/v1/space-works/{id}` | 部分更新 |
| DELETE | `api/v1/space-works/{id}` | 删除 |

### space-work-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/space-work-types` | 创建有限空间辨识类型 |
| POST | `api/v1/space-work-types` | 创建有限空间辨识类型 |
| PUT | `api/v1/space-work-types/{id}` | 创建有限空间辨识类型 |
| PATCH | `api/v1/space-work-types/{id}` | 创建有限空间辨识类型 |
| DELETE | `api/v1/space-work-types/{id}` | 创建有限空间辨识类型 |

### three-togethers

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/three-togethers` | 列表 |
| POST | `api/v1/three-togethers` | 创建 |
| GET/HEAD | `api/v1/three-togethers/{id}` | 详情 |
| PUT | `api/v1/three-togethers/{id}` | 更新 |
| PATCH | `api/v1/three-togethers/{id}` | 部分更新 |
| DELETE | `api/v1/three-togethers/{id}` | 删除 |

## 在线检查

### online-inspection-equipment

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-equipment` | 列表 |

### online-inspection-equipment-expand

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-equipment-expand` | 列表 |

### online-inspection-personnel-certificate

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-personnel-certificate` | 列表 |

### online-inspection-personnel-certificate-expand

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-personnel-certificate-expand` | 列表 |

### online-inspection-production-standardization

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-production-standardization` | 列表 |

### online-inspection-monthly-investigation

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-monthly-investigation` | 列表 |

### online-inspection-monthly-investigation-expand

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/online-inspection-monthly-investigation-expand` | 列表 |

## 区块模块(集团)

### bloc-accident-bulletins

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-accident-bulletins` | 列表 |

### bloc-comments

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-comments` | 列表 |

### bloc-experts

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-experts` | 列表 |
| POST | `api/v1/bloc-experts` | 创建 |
| GET/HEAD | `api/v1/bloc-experts/{id}` | 详情 |
| DELETE | `api/v1/bloc-experts/{id}` | 删除 |

### bloc-experts-list

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-experts-list` | 列表 |

### bloc-notices

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-notices` | 列表 |

### bloc-risks

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/bloc-risks` | 列表 |

## 积分管理

### add-points

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/add-points` | 列表 |
| POST | `api/v1/add-points` | 创建 |
| GET/HEAD | `api/v1/add-points/{id}` | 详情 |
| PUT | `api/v1/add-points/{id}` | 更新 |
| PATCH | `api/v1/add-points/{id}` | 部分更新 |
| DELETE | `api/v1/add-points/{id}` | 删除 |

### add-points-templates

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/add-points-templates` | 列表 |
| POST | `api/v1/add-points-templates` | 创建 |
| GET/HEAD | `api/v1/add-points-templates/{id}` | 详情 |
| PUT | `api/v1/add-points-templates/{id}` | 更新 |
| PATCH | `api/v1/add-points-templates/{id}` | 部分更新 |
| DELETE | `api/v1/add-points-templates/{id}` | 删除 |

## 评估检测

### assess-detects

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/assess-detects` | 列表 |
| POST | `api/v1/assess-detects` | 创建 |
| GET/HEAD | `api/v1/assess-detects/{id}` | 详情 |
| PUT | `api/v1/assess-detects/{id}` | 更新 |
| PATCH | `api/v1/assess-detects/{id}` | 部分更新 |
| DELETE | `api/v1/assess-detects/{id}` | 删除 |

## 工艺类型

### process-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/process-types` | 创建工艺名称类型 |
| POST | `api/v1/process-types` | 创建工艺名称类型 |
| PUT | `api/v1/process-types/{id}` | 创建工艺名称类型 |
| PATCH | `api/v1/process-types/{id}` | 创建工艺名称类型 |
| DELETE | `api/v1/process-types/{id}` | 创建工艺名称类型 |

### operational-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/operational-types` | 经营类型列表 |

## 文件上传

### upload

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `api/v1/upload` | 创建 |
| POST | `api/v1/upload/oss-callback` | 创建 |
| GET/HEAD | `api/v1/upload/oss-signature` | 列表 |

## 其他

### focus-companies

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/focus-companies` | 列表 |
| POST | `api/v1/focus-companies` | 创建 |
| DELETE | `api/v1/focus-companies/{id}` | 删除 |

### safety-management

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/safety-management` | 创建安全管理人员类型 |
| POST | `api/v1/safety-management` | 创建安全管理人员类型 |
| GET/HEAD | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| PUT | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| PATCH | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |
| DELETE | `api/v1/safety-management/{id}` | 创建安全管理人员类型 |

### major-hazard-map

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/major-hazard-map` | 重大危险源地图 — 返回有重大危险源的企业列表 |

### record-types

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/HEAD | `api/v1/record-types` | 备案/许可类型列表 |
