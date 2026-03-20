# 研究发现

## 技术调研

### 1. 用户认证方案

**确认方案:** 用户名密码认证

- 使用 bcrypt 加密密码
- Session/Cookie 保持登录状态
- 适合企业内部系统

**依赖包:**
- `bcrypt` - 密码加密
- `express-session` - Session 管理

---

### 2. 后端日志系统

使用 Winston 日志库 + 自定义中间件：

**日志中间件:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from './utils/logger';

// 请求日志中间件
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      params: req.params,
      query: req.query,
      body: req.body,
    };

    if (res.statusCode >= 400) {
      logger.error(`[${req.method}] ${req.path} ${duration}ms`, logData);
    } else {
      logger.info(`[${req.method}] ${req.path} ${duration}ms`, logData);
    }
  });

  next();
}
```

**日志格式:**
```
[时间] [级别] [方法] [路径] [状态码] [耗时ms]
2024-01-15 10:30:00 INFO POST /api/users 200 45ms
2024-01-15 10:30:01 ERROR POST /api/users 500 120ms Error: 用户不存在
```

**文件配置:**
- 控制台: 开发环境显示彩色日志
- 文件: 保存到 logs/app-{date}.log

---

### 3. 外部数据库连接

**已确认支持的数据库:**
- SQL Server / MSSQL
- MySQL

**SQL Server 连接:**

使用 `mssql` npm 包：

```typescript
import mssql from 'mssql';

const config = {
  server: 'localhost',
  database: 'test',
  user: 'sa',
  password: 'password',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

const pool = await mssql.connect(config);
```

**MySQL 连接:**

使用 `mysql2` npm 包：

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10
});
```

**功能需求:**
- 连接池管理
- 连接测试
- SQL 查询执行

---

### 3. 表结构映射

**映射表结构设计:**

```sql
-- 外部数据源
CREATE TABLE data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'sqlserver', 'mysql', etc.
  host TEXT NOT NULL,
  port INTEGER,
  database TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

-- 表映射
CREATE TABLE table_mappings (
  id TEXT PRIMARY KEY,
  data_source_id TEXT NOT NULL,
  external_table_name TEXT NOT NULL,
  local_alias TEXT NOT NULL,
  use_case TEXT,
  enabled INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (data_source_id) REFERENCES data_sources(id)
);

-- 字段映射
CREATE TABLE field_mappings (
  id TEXT PRIMARY KEY,
  table_mapping_id TEXT NOT NULL,
  external_field_name TEXT NOT NULL,
  local_alias TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (table_mapping_id) REFERENCES table_mappings(id)
);
```

---

### 4. 权限控制

**前端路由守卫:**

```typescript
// 路由守卫示例
const requireAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};
```

**API 权限验证:**

- 中间件验证 token
- 解析用户信息和角色
- 验证接口权限

---

## 相关代码

### 当前后端结构

```
backend/src/
├── controllers/
│   ├── query.ts
│   ├── data.ts
│   └── reports.ts
├── services/
│   ├── query.ts
│   ├── data.ts
│   └── reports.ts
├── routes/
│   ├── query.ts
│   ├── data.ts
│   └── reports.ts
└── types/
    └── index.ts
```

### 当前前端结构

```
frontend/src/
├── pages/
│   ├── Dashboard.tsx
│   ├── Query.tsx
│   ├── DataExplorer.tsx
│   └── Reports.tsx
├── components/
│   ├── layout/MainLayout.tsx
│   └── common/ResultTable.tsx
└── services/
    └── api.ts
```

---

## 参考资料

- [mssql npm](https://www.npmjs.com/package/mssql) - SQL Server 连接
- [Prisma ORM](https://www.prisma.io/) - 数据库 ORM
- [JWT 文档](https://jwt.io/) - Token 认证
---

### 5. 密码加密方案

**外部数据源密码加密:**

使用 AES-256 加密：

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32位密钥
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

### 6. MiniMax AI 集成

**API 文档:** MiniMax API

**请求示例:**

```typescript
import axios from 'axios';

const MINI_MAX_API_KEY = process.env.MINI_MAX_API_KEY!;
const MINI_MAX_BASE_URL = 'https://api.minimax.chat/v1';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function chat(messages: ChatMessage[]) {
  const response = await axios.post(
    `${MINI_MAX_BASE_URL}/text/chatcompletion_v2`,
    {
      model: 'abab6.5s-chat',
      messages,
    },
    {
      headers: {
        'Authorization': `Bearer ${MINI_MAX_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
```

**简化查询流程（后端自动处理）:**

1. 用户输入自然语言查询
2. 后端自动分析查询意图
3. 后端自动匹配相关表（使用场景、别名）
4. 后端自动匹配相关提示词规则
5. 后端获取表字段信息（启用状态）
6. 后端将表结构 + 提示词规则发送给 MiniMax
7. AI 生成 SQL 并执行
8. 返回查询结果（同时返回使用的表和规则信息供用户查看）

---

### 7. 提示词规则数据结构

```typescript
interface PromptRule {
  id: string;
  name: string;           // 规则名称
  description: string;    // 规则简介
  content: string;        // 完整提示词内容
  enabled: boolean;       // 启用/禁用
  createdAt: string;
  updatedAt: string;
}
```

### 8. 表查询规则

在表映射中定义默认的查询条件，AI 生成 SQL 时自动添加：

```typescript
interface TableMapping {
  id: string;
  // ... 其他字段
  queryRules: string;  // 如: "isDelete=0 AND status=1"
}
```

**实现逻辑:**
- 解析 queryRules 为 WHERE 条件
- AI 生成 SELECT 时自动附加 WHERE 子句

---

### 9. 字段显示规则

字段值到显示文本的映射：

```typescript
interface FieldMapping {
  id: string;
  // ... 其他字段
  displayRules: string;  // JSON: {"0":"保存","1":"提交","2":"审核中"}
}
```

**实现逻辑:**
- 查询结果返回后，根据 displayRules 转换字段值
- 前端展示转换后的文本

---

### 10. 菜单数据结构

```typescript
interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  sort: number;
  children?: Menu[];
}
```

---

- [Ant Design Table](https://ant.design/components/table) - 表格组件

---

## 2026-03-20 发现

### TreeSelect 数据格式问题

**问题描述：**
- 角色管理页面分配菜单功能使用 Ant Design TreeSelect 组件
- 后端 API `/api/menus/tree` 返回数据格式：`{ id, name, path, icon, parentId, sort, status, children }`
- Ant Design TreeSelect 需要的数据格式：`{ value, title, children }`

**控制台警告：**
```
Warning: TreeNode `value` is invalidate: undefined
Warning: Same `value` exist in the tree: undefined
```

**解决方案：**
在前端 RoleManage.tsx 中添加数据转换函数：

```typescript
// 转换菜单数据为 TreeSelect 需要的格式
const convertMenuToTreeSelect = (menus: Menu[]): { value: string; title: string; children: any[] }[] => {
  return menus.map(menu => ({
    value: menu.id,
    title: menu.name,
    children: menu.children ? convertMenuToTreeSelect(menu.children) : [],
  }));
};
```

**涉及文件：**
- `frontend/src/pages/admin/RoleManage.tsx`
- `backend/src/services/menu.ts` (findTree 方法)

**相关测试：**
- `frontend/tests/role-menu.spec.ts`
- `frontend/playwright.config.ts`

---

### Playwright 测试配置

**已安装依赖：**
- `@playwright/test` (frontend 目录)

**测试命令：**
```bash
cd frontend
npx playwright test tests/role-menu.spec.ts
```

**配置文件：** `frontend/playwright.config.ts`

**测试路由：** `/admin/roles` (不是 `/roles`)

**前端端口：** Vite 自动选择（3000/3020/3021/3022）

---

## 菜单树形结构功能调研

### 现状分析

**数据库结构 (schema.prisma):**
- Menu 模型已有 `parentId` 字段支持父子关系
- RoleMenu 关联表支持角色-菜单授权
- 数据结构已满足需求

**后端服务 (menu.ts):**
- `findTree()` 方法已构建树形结构
- 返回字段: `{ id, name, path, icon, parentId, sort, status, children }`
- 缺少 `value/title` 字段（TreeSelect 需要）

**前端菜单管理 (MenuManage.tsx):**
- 使用 Table 组件展示（不是树形）
- 父菜单选择使用普通 Select（不是 TreeSelect）
- 无拖拽排序功能

**侧边栏 (MainLayout.tsx):**
- 菜单硬编码为静态数据 `menuItems`（第19-34行）
- 所有用户看到相同的菜单
- 未根据用户角色动态加载

### 需要实现

1. **后端 API**: `GET /api/auth/menus` - 获取用户有权限的菜单树
2. **前端 MenuManage**: 改用 Tree/TreTable 组件展示
3. **前端 MainLayout**: 动态加载菜单并显示
4. **前端 roleManage**: 完善 TreeSelect 多级菜单选择
