# ERP 查询智能体 - 进阶指南

## 目录

1. [系统架构](#1-系统架构)
2. [数据库设计](#2-数据库设计)
3. [API 接口文档](#3-api-接口文档)
4. [AI 查询原理](#4-ai-查询原理)
5. [安全机制](#5-安全机制)
6. [部署指南](#6-部署指南)
7. [二次开发](#7-二次开发)
8. [性能优化](#8-性能优化)

---

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Web UI    │  │  移动端 App  │  │  第三方集成  │         │
│  │   (React)   │  │  (Flutter)   │  │   (API)     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ HTTP/HTTPS
┌──────────────────────────┼──────────────────────────────────┐
│                    │     服务层                              │
│  ┌─────────────────▼─────────────────┐                     │
│  │         Express.js Server           │                     │
│  │  ┌─────────┐  ┌─────────┐  ┌─────┐ │                     │
│  │  │ Routes  │→│Controller│→│Service│ │                     │
│  │  └─────────┘  └─────────┘  └─────┘ │                     │
│  │  ┌─────────────────────────────────┐│                     │
│  │  │      Session + Auth Middleware  ││                     │
│  │  └─────────────────────────────────┘│                     │
│  └─────────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    │     数据层                              │
│  ┌─────────────────▼─────────────────┐  ┌─────────────────┐ │
│  │           Prisma ORM               │  │   MiniMax API   │ │
│  │  ┌───────────────────────────────┐ │  │   (AI 服务)     │ │
│  │  │        MySQL Database         │ │  └─────────────────┘ │
│  │  │  • User • Role • Menu         │ │                     │
│  │  │  • DataSource • TableMapping  │ │                     │
│  │  │  • FieldMapping • PromptRule   │ │                     │
│  │  │  • QueryHistory                │ │                     │
│  │  └───────────────────────────────┘ │                     │
│  └─────────────────────────────────────┘                     │
│                                                                 │
│  ┌─────────────────────────────────────┐  ┌─────────────────┐ │
│  │        External Databases           │  │   文件存储       │ │
│  │  (MySQL / SQL Server ERP Systems)    │  │   (PDF Exports) │ │
│  └─────────────────────────────────────┘  └─────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈详解

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | React 18 + TypeScript | 类型安全，组件化开发 |
| 构建工具 | Vite | 快速的开发服务器和构建 |
| UI 组件库 | Ant Design 5 | 企业级 UI 组件 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端框架 | Express.js + TypeScript | 稳健的 Node.js 框架 |
| ORM | Prisma | 现代数据库访问层 |
| 会话管理 | express-session | 服务器端会话存储 |
| 密码加密 | bcrypt | 安全密码哈希 |
| 日志系统 | Winston | 结构化日志记录 |
| AI 服务 | MiniMax API | 自然语言处理和 SQL 生成 |

### 1.3 项目目录结构

```
erp-query-agent/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── controllers/        # 控制器层
│   │   │   ├── auth.ts         # 认证控制器
│   │   │   ├── user.ts         # 用户管理
│   │   │   ├── role.ts         # 角色管理
│   │   │   ├── menu.ts         # 菜单管理
│   │   │   ├── datasource.ts    # 数据源管理
│   │   │   ├── tableMapping.ts  # 表映射管理
│   │   │   ├── fieldMapping.ts  # 字段映射管理
│   │   │   ├── promptRule.ts    # 提示词规则
│   │   │   ├── query.ts         # AI 查询
│   │   │   └── history.ts       # 查询历史
│   │   ├── routes/             # 路由定义
│   │   ├── services/           # 业务逻辑层
│   │   │   ├── ai.ts           # AI 服务（MiniMax 集成）
│   │   │   └── datasource.ts   # 数据源服务
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.ts         # 认证中间件
│   │   │   ├── session.ts      # Session 配置
│   │   │   └── errorHandler.ts # 错误处理
│   │   ├── models/             # Prisma 客户端实例
│   │   ├── utils/              # 工具函数
│   │   │   ├── logger.ts       # 日志工具
│   │   │   └── encryption.ts    # 加密工具（AES-256-CBC）
│   │   └── index.ts            # 应用入口
│   ├── prisma/
│   │   └── schema.prisma       # 数据库模型定义
│   └── tests/                  # 测试文件
│
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   │   ├── layout/         # 布局组件
│   │   │   ├── query/          # 查询相关组件
│   │   │   └── common/         # 通用组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── Login.tsx       # 登录页
│   │   │   ├── Dashboard.tsx   # 仪表盘
│   │   │   ├── Query.tsx       # AI 查询页
│   │   │   └── admin/          # 管理页面
│   │   ├── stores/             # Zustand 状态
│   │   ├── services/           # API 服务
│   │   ├── App.tsx             # 路由配置
│   │   └── main.tsx            # 应用入口
│   └── tests/                  # 测试文件
│
├── docs/                       # 文档
│   ├── architecture/           # 架构文档
│   └── guides/                # 使用指南
│
└── e2e/                        # 端到端测试
```

---

## 2. 数据库设计

### 2.1 ER 关系图

```
┌─────────┐       ┌──────────┐       ┌─────────┐
│  User   │───────│ UserRole │───────│  Role   │
└─────────┘       └──────────┘       └────┬────┘
                                          │
                                          ▼
┌─────────┐       ┌──────────┐       ┌─────────┐
│  Menu   │───────│ RoleMenu │       │  Role   │
└─────────┘       └──────────┘       └─────────┘

┌─────────────┐     ┌───────────────┐     ┌────────────────┐
│ DataSource  │─────│ TableMapping   │─────│  FieldMapping  │
└─────────────┘     └───────────────┘     └────────────────┘

┌─────────────┐
│ PromptRule  │
└─────────────┘

┌─────────────┐     ┌───────────────┐
│ QueryHistory│─────│     User      │
└─────────────┘     └───────────────┘
```

### 2.2 数据表说明

#### 用户表 (User)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| username | String | 用户名（唯一） |
| password | String | 加密后的密码 |
| email | String | 邮箱 |
| avatar | String | 头像 URL |
| status | Int | 状态（0禁用，1启用） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### 角色表 (Role)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 角色名称 |
| code | String | 角色代码（唯一） |
| description | String | 描述 |
| status | Int | 状态 |

#### 菜单表 (Menu)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 菜单名称 |
| path | String | 路由路径 |
| icon | String | 图标 |
| parentId | Int | 上级菜单 ID |
| sort | Int | 排序号 |
| createdAt | DateTime | 创建时间 |

#### 数据源表 (DataSource)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 数据源名称 |
| type | String | 类型（mysql/sqlserver） |
| host | String | 主机地址 |
| port | Int | 端口 |
| database | String | 数据库名 |
| username | String | 用户名 |
| password | String | 加密后的密码 |
| status | Int | 状态 |

#### 表映射表 (TableMapping)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| dataSourceId | Int | 关联数据源 ID |
| sourceTable | String | 源表名 |
| alias | String | 别名 |
| queryRules | String | 查询规则 SQL |

#### 字段映射表 (FieldMapping)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| tableMappingId | Int | 关联表映射 ID |
| sourceField | String | 源字段名 |
| alias | String | 别名 |
| description | String | 描述 |
| displayRules | String | 显示规则 JSON |

#### 提示词规则表 (PromptRule)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| name | String | 规则名称 |
| keywords | String | 关键词（逗号分隔） |
| systemPrompt | String | 系统提示词 |

#### 查询历史表 (QueryHistory)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int | 主键 |
| userId | Int | 用户 ID |
| query | String | 用户查询 |
| sql | String | 生成的 SQL |
| tables | String | 涉及的表 |
| status | String | 状态（success/failed） |
| error | String | 错误信息 |
| createdAt | DateTime | 创建时间 |

---

## 3. API 接口文档

### 3.1 认证接口

#### 登录
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["admin"]
  }
}
```

#### 登出
```
POST /api/auth/logout

Response:
{
  "code": 0,
  "message": "登出成功"
}
```

#### 获取当前用户
```
GET /api/auth/me

Response:
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### 3.2 用户管理接口

#### 用户列表
```
GET /api/users

Response:
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "status": 1,
      "roles": [{"id": 1, "name": "管理员"}]
    }
  ]
}
```

#### 创建用户
```
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
```

#### 分配角色
```
PUT /api/users/:id/roles
Content-Type: application/json

{
  "roleIds": [1, 2]
}
```

### 3.3 数据源接口

#### 数据源列表
```
GET /api/data-sources

Response:
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "ERP主数据库",
      "type": "mysql",
      "host": "192.168.1.100",
      "port": 3306,
      "database": "erp_db",
      "status": 1
    }
  ]
}
```

#### 测试连接
```
POST /api/data-sources/:id/test

Response:
{
  "code": 0,
  "message": "连接成功"
}
```

#### 获取表列表
```
GET /api/data-sources/:id/tables

Response:
{
  "code": 0,
  "data": ["orders", "customers", "products"]
}
```

#### 获取字段列表
```
GET /api/data-sources/:id/fields/:tableName

Response:
{
  "code": 0,
  "data": [
    {"name": "id", "type": "int"},
    {"name": "order_no", "type": "varchar"},
    {"name": "amount", "type": "decimal"}
  ]
}
```

### 3.4 AI 查询接口

#### 执行查询
```
POST /api/query
Content-Type: application/json

{
  "query": "统计2024年每个月的销售总额",
  "dataSourceId": 1
}

Response:
{
  "code": 0,
  "data": {
    "sql": "SELECT DATE_FORMAT(order_date, '%Y-%m') as month, SUM(amount) as total FROM orders WHERE order_date >= '2024-01-01' GROUP BY month",
    "thinking": "用户想要统计2024年每月的销售总额...",
    "results": [
      {"month": "2024-01", "total": 150000},
      {"month": "2024-02", "total": 180000}
    ],
    "columns": ["month", "total"]
  }
}
```

#### 查询历史
```
GET /api/query/history

Response:
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "query": "统计2024年每个月的销售总额",
      "sql": "SELECT...",
      "status": "success",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 4. AI 查询原理

### 4.1 查询处理流程

```
用户输入 → 分词预处理 → 提示词组装 → MiniMax API → SQL解析 → 结果处理 → 返回前端
   │           │              │              │          │          │
   │           ▼              ▼              ▼          ▼          ▼
   │     关键词提取      注入上下文      AI分析+生成    SQL验证    格式化输出
   │     意图识别       映射信息        结构化输出     执行查询
   │
   └────────────────────────────────────────────────────────────────────
                              AI Thinking 过程（使用 <think> 标签）
```

### 4.2 提示词组装策略

系统组装提示词时按以下顺序拼接：

1. **系统角色定义** - "你是一个专业的 ERP 数据查询助手"
2. **提示词规则匹配** - 根据用户输入关键词匹配的自定义规则
3. **数据源信息** - 已配置的数据源类型和版本
4. **表映射上下文** - 用户配置的表别名和描述
5. **字段映射上下文** - 用户配置的字段别名、描述、显示规则
6. **查询要求** - 用户输入的自然语言查询

### 4.3 SQL 生成示例

**用户输入:**
```
查询华北地区2024年Q1订单金额大于10000的客户
```

**生成的提示词上下文:**
```json
{
  "tables": {
    "orders": {
      "alias": "订单表",
      "fields": {
        "order_no": {"alias": "订单编号"},
        "customer_name": {"alias": "客户名称"},
        "region": {"alias": "地区", "displayRules": {"华北": "华北地区", "华南": "华南地区"}},
        "amount": {"alias": "订单金额"},
        "order_date": {"alias": "订单日期"}
      }
    }
  }
}
```

**生成的 SQL:**
```sql
SELECT o.order_no, o.customer_name, o.region, o.amount, o.order_date
FROM orders o
WHERE o.region = '华北'
  AND o.order_date BETWEEN '2024-01-01' AND '2024-03-31'
  AND o.amount > 10000
ORDER BY o.amount DESC
```

---

## 5. 安全机制

### 5.1 认证机制

- **会话认证**: 使用 `express-session` 管理用户会话
- **会话存储**: 内存存储（可扩展为 Redis）
- **会话过期**: 24 小时自动过期

### 5.2 密码安全

- **密码加密**: 使用 `bcrypt` 进行单向哈希
- **盐值轮数**: 10 轮（可配置）
- **密码验证**: 比较哈希值而非明文

### 5.3 数据源密码安全

外部数据库密码使用 **AES-256-CBC** 加密存储：

```typescript
// 加密流程
const encrypted = AES256-CBC-Encrypt(password, key, iv)
// 存储密文
```

### 5.4 API 安全

- **CORS**: 限制跨域请求
- **请求日志**: 记录所有 API 请求
- **错误处理**: 统一错误响应格式，避免信息泄露

---

## 6. 部署指南

### 6.1 环境要求

| 组件 | 要求 |
|------|------|
| Node.js | >= 18.0.0 |
| MySQL | >= 8.0 |
| npm | >= 9.0 |

### 6.2 配置文件

**后端环境变量** (`backend/.env`):
```env
PORT=4000
DATABASE_URL="mysql://user:password@localhost:3306/erp-query"
SESSION_SECRET="your-session-secret-key"
MINIMAX_API_KEY="your-minimax-api-key"
ENCRYPTION_KEY="32-byte-encryption-key-here"
```

**前端环境变量** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 6.3 构建部署

```bash
# 1. 安装依赖
npm install

# 2. 构建后端
cd backend && npm run build

# 3. 构建前端
cd ../frontend && npm run build

# 4. 配置 Nginx 反向代理
```

### 6.4 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/erp-query-agent/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 7. 二次开发

### 7.1 添加新的 API 端点

**步骤 1: 定义路由** (`backend/src/routes/newFeature.ts`)
```typescript
import { Router } from 'express';
import { newFeatureController } from '../controllers/newFeature';

const router = Router();

router.get('/', newFeatureController.list);
router.post('/', newFeatureController.create);

export default router;
```

**步骤 2: 创建控制器** (`backend/src/controllers/newFeature.ts`)
```typescript
export const newFeatureController = {
  async list(req, res, next) {
    try {
      // 业务逻辑
      res.json({ code: 0, data: [] });
    } catch (error) {
      next(error);
    }
  },
  // ...
};
```

**步骤 3: 注册路由** (`backend/src/index.ts`)
```typescript
import newFeatureRoutes from './routes/newFeature';

app.use('/api/new-feature', newFeatureRoutes);
```

### 7.2 添加新的前端页面

**步骤 1: 创建页面组件** (`frontend/src/pages/NewPage.tsx`)
```typescript
import React from 'react';
import { Card } from 'antd';

const NewPage: React.FC = () => {
  return (
    <Card title="新功能页面">
      {/* 页面内容 */}
    </Card>
  );
};

export default NewPage;
```

**步骤 2: 注册路由** (`frontend/src/App.tsx`)
```typescript
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

**步骤 3: 添加菜单数据**（通过后端 API 或前端静态配置）

### 7.3 自定义 AI 提示词规则

在「提示词规则」页面添加自定义规则：

```json
{
  "name": "财务分析规则",
  "keywords": "利润,成本,收益率,资产负债",
  "systemPrompt": "你是一个专业的财务分析师助手。在生成 SQL 时需要注意：\n1. 利润 = 收入 - 成本\n2. 资产负债率 = 负债 / 资产\n3. 使用合适的聚合函数进行统计计算"
}
```

---

## 8. 性能优化

### 8.1 数据库优化

- **连接池**: Prisma 默认连接池管理
- **索引**: 为常用查询字段添加索引
- **分页**: 大数据量查询使用分页

### 8.2 前端优化

- **代码分割**: 使用 React.lazy 进行路由懒加载
- **状态缓存**: 合理使用 Zustand 持久化
- **图表优化**: 大数据量时使用数据采样

### 8.3 AI 查询优化

- **上下文精简**: 只传递相关表映射信息
- **缓存**: 缓存频繁查询的结果
- **超时控制**: 设置合理的请求超时时间

### 8.4 监控与日志

- **日志级别**: ERROR、WARN、INFO、DEBUG
- **关键指标**: API 响应时间、查询成功率
- **告警**: 异常错误自动告警

---

## 附录

### A. 环境变量完整列表

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 后端服务端口 | 4000 |
| DATABASE_URL | MySQL 连接地址 | - |
| SESSION_SECRET | Session 加密密钥 | - |
| MINIMAX_API_KEY | MiniMax API 密钥 | - |
| ENCRYPTION_KEY | 数据源密码加密密钥 | - |

### B. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 认证失败 |
| 1002 | 无权限 |
| 2001 | 数据不存在 |
| 2002 | 数据已存在 |
| 3001 | 数据库连接失败 |
| 3002 | SQL 执行失败 |
| 4001 | AI 服务调用失败 |

### C. 相关资源

- [Prisma 文档](https://prisma.io/docs)
- [Ant Design 文档](https://ant.design/docs/react/introduce)
- [MiniMax API 文档](https://www.minimaxi.com/document)
