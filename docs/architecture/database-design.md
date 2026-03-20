# 数据库设计

## ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │  user_roles │       │    roles    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──────<│ user_id (FK)│>──────│ id (PK)     │
│ username    │       │ role_id (FK)│       │ name        │
│ password    │       └─────────────┘       │ code        │
│ email       │                             │ description │
│ avatar      │                             └──────┬──────┘
│ status      │                                    │
└─────────────┘                                    │
                                                   │ role_menus
                                                   │
┌─────────────┐       ┌─────────────┐            │
│    menus    │       │  role_menus │       ┌─────┴──────┐
├─────────────┤       ├─────────────┤       │            │
│ id (PK)     │<──────│ menu_id (FK)│>──────┘            │
│ name        │       │ role_id (FK)│                    │
│ path        │       └─────────────┘                    │
│ icon        │                                          │
│ parent_id   │       ┌─────────────────┐                 │
│ sort        │       │  data_sources  │                 │
└─────────────┘       ├─────────────────┤                 │
                      │ id (PK)         │                 │
                      │ name            │                 │
                      │ type            │                 │
                      │ host            │                 │
                      │ port            │                 │
                      │ database        │                 │
                      │ username        │                 │
                      │ password (加密)  │                 │
                      └────────┬────────┘                 │
                               │ table_mappings
                               │
┌─────────────┐       ┌────────┴────────┐
│field_mappings│       │ table_mappings   │
├─────────────┤       ├─────────────────┤
│ id (PK)     │──────<│ id (PK)         │
│ table_map_id│       │ data_source_id   │
│ external_fn │       │ external_table   │
│ local_alias │       │ local_alias      │
│ description │       │ use_case        │
│ display_rules│      │ query_rules     │
│ enabled     │       │ enabled         │
└─────────────┘       └────────┬────────┘
                                │
                       ┌────────┴────────┐
                       │ prompt_rules     │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ name            │
                       │ description      │
                       │ content          │
                       │ enabled          │
                       └─────────────────┘

┌─────────────┐       ┌─────────────────┐
│    users    │──────<│ query_history   │
├─────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)         │
│ username    │       │ userId (FK)     │
│ password    │       │ query           │
│ email       │       │ sql             │
│ avatar      │       │ tables          │
│ status      │       │ status          │
└─────────────┘       │ createdAt       │
                      └─────────────────┘
```

## 表结构

### users (用户表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| username | String (unique) | 用户名 |
| password | String | 加密密码 |
| email | String | 邮箱 |
| avatar | String | 头像 URL |
| status | Int | 状态 (1:启用, 0:禁用) |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### roles (角色表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| name | String | 角色名称 |
| code | String (unique) | 角色代码 |
| description | String | 描述 |
| status | Int | 状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### menus (菜单表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| name | String | 菜单名称 |
| path | String | 路由路径 |
| icon | String | 图标 |
| parentId | String | 父菜单 ID |
| sort | Int | 排序 |
| status | Int | 状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### user_roles (用户角色关联表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| userId | String (FK) | 用户 ID |
| roleId | String (FK) | 角色 ID |
| createdAt | DateTime | 创建时间 |

### role_menus (角色菜单关联表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| roleId | String (FK) | 角色 ID |
| menuId | String (FK) | 菜单 ID |
| createdAt | DateTime | 创建时间 |

### data_sources (外部数据源表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| name | String | 数据源名称 |
| type | String | 数据库类型 (mysql/sqlserver) |
| host | String | 主机地址 |
| port | Int | 端口 |
| database | String | 数据库名 |
| username | String | 用户名 |
| password | String | 加密密码 |
| description | String | 描述 |
| status | Int | 状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### table_mappings (表映射配置表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| dataSourceId | String (FK) | 数据源 ID |
| externalTableName | String | 外部数据库表名 |
| localAlias | String | 本地别名 |
| useCase | String | 使用场景 |
| queryRules | String | 查询规则 (如: isDelete=0) |
| enabled | Int | 启用状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### field_mappings (字段映射配置表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| tableMappingId | String (FK) | 表映射 ID |
| externalFieldName | String | 外部数据库字段名 |
| localAlias | String | 本地字段别名 |
| fieldDescription | String | 字段描述 |
| displayRules | String | 显示规则 (JSON: {"0":"保存","1":"提交"}) |
| enabled | Int | 启用状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### prompt_rules (提示词规则表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| name | String (unique) | 规则名称 |
| description | String | 规则简介 |
| content | String | 完整提示词内容 |
| enabled | Int | 启用状态 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### query_history (查询历史表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String (UUID) | 主键 |
| userId | String (FK) | 用户 ID |
| query | String | 自然语言查询 |
| sql | String | 生成的 SQL |
| tables | String | 涉及的表（逗号分隔） |
| status | Int | 状态 (1:成功, 0:失败) |
| createdAt | DateTime | 创建时间 |

## 索引设计

- `users.username` - 唯一索引
- `roles.code` - 唯一索引
- `user_roles.userId_roleId` - 复合唯一索引
- `role_menus.roleId_menuId` - 复合唯一索引
- `table_mappings.dataSourceId_localAlias` - 复合唯一索引
- `field_mappings.tableMappingId_localAlias` - 复合唯一索引
- `prompt_rules.name` - 唯一索引
- `query_history.userId` - 普通索引
