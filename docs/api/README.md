# API 文档

## 基础信息

- 基础路径: `/api`
- 认证方式: Session (Cookie)
- 数据格式: JSON

## 认证接口

### 登录
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response (200):
{
  "id": "xxx",
  "username": "admin",
  "email": "admin@example.com",
  "avatar": null
}
```

### 登出
```
POST /api/auth/logout

Response (200):
{
  "message": "登出成功"
}
```

### 获取当前用户
```
GET /api/auth/me

Response (200):
{
  "id": "xxx",
  "username": "admin",
  "email": "admin@example.com",
  "avatar": null
}

Response (401):
{
  "error": "请先登录"
}
```

## 用户管理接口

### 获取用户列表
```
GET /api/users

Response (200):
[
  {
    "id": "xxx",
    "username": "admin",
    "email": "admin@example.com",
    "avatar": null,
    "status": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "roles": [
      {
        "role": {
          "id": "xxx",
          "name": "管理员"
        }
      }
    ]
  }
]
```

### 获取用户详情
```
GET /api/users/:id
```

### 创建用户
```
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
```

### 更新用户
```
PUT /api/users/:id
Content-Type: application/json

{
  "email": "newemail@example.com",
  "status": 1
}
```

### 删除用户
```
DELETE /api/users/:id

Response (200):
{
  "message": "删除成功"
}
```

### 修改密码
```
PUT /api/users/:id/password
Content-Type: application/json

{
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}
```

### 分配角色
```
PUT /api/users/:id/roles
Content-Type: application/json

{
  "roleIds": ["role-id-1", "role-id-2"]
}
```

## 角色管理接口

### 获取角色列表
```
GET /api/roles

Response (200):
[
  {
    "id": "xxx",
    "name": "管理员",
    "code": "admin",
    "description": "系统管理员",
    "status": 1,
    "menus": [
      {
        "menu": {
          "id": "xxx",
          "name": "首页",
          "path": "/dashboard"
        }
      }
    ]
  }
]
```

### 创建角色
```
POST /api/roles
Content-Type: application/json

{
  "name": "新角色",
  "code": "new_role",
  "description": "角色描述"
}
```

### 更新角色
```
PUT /api/roles/:id
Content-Type: application/json

{
  "name": "更新后的角色名",
  "status": 1
}
```

### 删除角色
```
DELETE /api/roles/:id
```

### 分配菜单
```
PUT /api/roles/:id/menus
Content-Type: application/json

{
  "menuIds": ["menu-id-1", "menu-id-2"]
}
```

## 菜单管理接口

### 获取菜单列表
```
GET /api/menus
```

### 获取菜单树
```
GET /api/menus/tree
```

### 创建菜单
```
POST /api/menus
Content-Type: application/json

{
  "name": "新菜单",
  "path": "/new-menu",
  "icon": "Menu",
  "sort": 10
}
```

### 更新菜单
```
PUT /api/menus/:id
```

### 删除菜单
```
DELETE /api/menus/:id
```

## 数据源管理接口

### 获取数据源列表
```
GET /api/data-sources
```

### 获取数据源详情
```
GET /api/data-sources/:id
```

### 创建数据源
```
POST /api/data-sources
Content-Type: application/json

{
  "name": "MySQL数据源",
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "erp_db",
  "username": "root",
  "password": "password",
  "description": "主数据库"
}
```

### 更新数据源
```
PUT /api/data-sources/:id
```

### 删除数据源
```
DELETE /api/data-sources/:id
```

### 测试连接
```
POST /api/data-sources/:id/test

Response (200):
{
  "success": true,
  "message": "连接成功"
}
```

### 获取表列表
```
GET /api/data-sources/:id/tables
```

### 获取字段列表
```
GET /api/data-sources/:id/fields/:tableName
```

## 表映射接口

### 获取表映射列表
```
GET /api/table-mappings?dataSourceId=xxx
```

### 创建表映射
```
POST /api/table-mappings
Content-Type: application/json

{
  "dataSourceId": "ds-id",
  "externalTableName": "orders",
  "localAlias": "销售订单",
  "useCase": "销售订单查询",
  "queryRules": "isDelete=0"
}
```

### 更新表映射
```
PUT /api/table-mappings/:id
```

### 删除表映射
```
DELETE /api/table-mappings/:id
```

## 字段映射接口

### 获取字段映射列表
```
GET /api/field-mappings/table/:tableMappingId
```

### 创建字段映射
```
POST /api/field-mappings/table/:tableMappingId
Content-Type: application/json

{
  "externalFieldName": "status",
  "localAlias": "状态",
  "fieldDescription": "订单状态",
  "displayRules": "{\"0\":\"保存\",\"1\":\"提交\",\"2\":\"审核\"}"
}
```

### 更新字段映射
```
PUT /api/field-mappings/:id
```

### 删除字段映射
```
DELETE /api/field-mappings/:id
```

## 提示词规则接口

### 获取提示词规则列表
```
GET /api/prompt-rules?enabled=1
```

### 创建提示词规则
```
POST /api/prompt-rules
Content-Type: application/json

{
  "name": "销售订单查询",
  "description": "专门用于销售订单的查询规则",
  "content": "你是一个销售订单查询助手...",
  "enabled": 1
}
```

### 更新提示词规则
```
PUT /api/prompt-rules/:id
```

### 删除提示词规则
```
DELETE /api/prompt-rules/:id
```

## AI 查询接口

### 执行查询
```
POST /api/query
Content-Type: application/json

{
  "query": "查询所有状态为已提交的销售订单"
}

Response (200):
{
  "sql": "SELECT * FROM orders WHERE status = 1 AND isDelete = 0",
  "tables": ["销售订单"],
  "promptRules": ["销售订单查询"],
  "data": [
    {
      "id": 1,
      "order_no": "SO001",
      "status": "已提交"
    }
  ],
  "columns": ["id", "order_no", "status"]
}
```

## 查询历史接口

### 获取查询历史
```
GET /api/query/history

Response (200):
{
  "data": [
    {
      "id": "xxx",
      "query": "查询所有状态为已提交的销售订单",
      "sql": "SELECT * FROM orders WHERE status = 1",
      "tables": ["销售订单"],
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 删除查询历史
```
DELETE /api/query/history/:id

Response (200):
{
  "message": "删除成功"
}
```
