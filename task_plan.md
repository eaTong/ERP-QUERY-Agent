# 任务规划 - ERP 查询智能体

## 当前阶段

**新功能：AI思考过程返回 + AI分析功能**

---

## 新增需求

### 1. AI查询结果返回思考过程
- AI返回的结果包含<think>标签
- 需要提取标签内的内容返回前端
- 前端页面支持展示思考过程

### 2. AI分析功能
- 用户获取查询结果后，点击"AI分析"按钮
- 后台将用户查询内容、查询结果、思考过程发送给AI
- AI分析后返回分析结果
- 前端展示分析内容

---

## 实现阶段

| 阶段 | 内容 | 状态 |
|------|------|------|
| A | 后端：提取AI思考过程并返回 | 待开始 |
| B | 前端：展示AI思考过程 | 待开始 |
| C | 后端：新增AI分析接口 | 待开始 |
| D | 前端：AI分析按钮及展示 | 待开始 |

---

## 阶段 A: 后端 - 提取AI思考过程

**目标:** 从AI响应中提取<think>标签内容

**涉及文件:**
- `backend/src/services/ai.ts` - AI服务

**实现:**
```typescript
// 从AI响应中提取思考过程
const extractThinkContent = (response: string): string | null => {
  const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
  return thinkMatch ? thinkMatch[1].trim() : null;
};

// 清理AI响应，移除<think>标签
const cleanResponse = (response: string): string => {
  return response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};
```

---

## 阶段 B: 前端 - 展示AI思考过程

**目标:** 在查询结果区域显示AI思考过程

**涉及文件:**
- `frontend/src/pages/query/Query.tsx` - AI查询页面

**实现:**
- 添加"思考过程"折叠面板
- 查询结果上方显示思考过程
- 可展开/折叠

---

## 阶段 C: 后端 - AI分析接口

**目标:** 新增分析接口，接收查询内容、结果、思考过程

**接口设计:**
```
POST /api/query/analyze
Body: {
  query: string,        // 用户原始查询
  result: object[],     // 查询结果
  thinkProcess: string,  // AI思考过程
  tables: string[]       // 涉及的表
}

Response: {
  analysis: string       // AI分析结果
}
```

**涉及文件:**
- `backend/src/controllers/query.ts` - 新增 analyze 方法
- `backend/src/routes/query.ts` - 新增路由
- `backend/src/services/ai.ts` - 新增 analyze 方法

---

## 阶段 D: 前端 - AI分析功能

**目标:** 添加分析按钮并展示分析结果

**涉及文件:**
- `frontend/src/pages/query/Query.tsx` - AI查询页面
- `frontend/src/services/query.ts` - API调用

**实现:**
- 查询结果区域添加"AI分析"按钮
- 调用分析接口
- 展示AI分析结果（可折叠面板）

---

## 涉及文件清单

### 后端
| 文件 | 变更 |
|------|------|
| `backend/src/services/ai.ts` | 提取think标签、返回think内容、新增analyze方法 |
| `backend/src/controllers/query.ts` | 新增analyze controller |
| `backend/src/routes/query.ts` | 新增/api/query/analyze路由 |

### 前端
| 文件 | 变更 |
|------|------|
| `frontend/src/services/query.ts` | 新增analyze API |
| `frontend/src/pages/query/Query.tsx` | 展示思考过程、添加分析按钮 |

---

## 当前阶段

**新功能规划：菜单树形结构**

---

## 新功能：菜单树形结构

### 功能需求

1. **菜单页树形显示**
   - 使用 Ant Design Tree 或 TreeTable 组件
   - 支持展开/折叠
   - 支持新增、编辑、删除菜单
   - 父子菜单关系可视化

2. **角色分配菜单（授权）**
   - 角色管理页面已有分配菜单功能
   - 需要完善：TreeSelect 数据格式正确（已修复 RoleManage）
   - 需要完善：支持多级菜单选择

3. **动态菜单加载**
   - 用户登录后根据角色加载对应菜单
   - 侧边栏菜单根据用户权限动态显示
   - 后端 API：获取用户有权限的菜单树

---

### 实现阶段

#### 阶段 A: 后端 - 用户菜单 API

**目标:** 提供用户可访问菜单的 API

**任务:**
- [ ] 新增 API: `GET /api/auth/menus` - 获取当前用户的菜单树
  - 根据用户角色获取菜单
  - 返回树形结构菜单
  - 只返回启用状态的菜单

**API 返回格式:**
```typescript
{
  id: string,
  name: string,
  path: string,
  icon?: string,
  children: MenuItem[]
}
```

---

#### 阶段 B: 前端 - 菜单管理页面树形改造

**目标:** 菜单管理页面使用树形展示

**任务:**
- [ ] 引入 Ant Design Tree 组件
- [ ] 改造 MenuManage.tsx 使用 Tree 展示菜单
- [ ] 支持新增子菜单
- [ ] 支持拖拽排序（可选）

**组件改造:**
```typescript
// 使用 Tree 组件替代 Table
<Tree
  treeData={menuTreeData}
  draggable
  blockNode
  onDrop={handleDrop}
>
```

---

#### 阶段 C: 前端 - 侧边栏动态菜单

**目标:** 侧边栏根据用户权限动态显示菜单

**任务:**
- [ ] 新增菜单加载 API 调用
- [ ] 改造 MainLayout 使用动态菜单
- [ ] 登录后加载菜单并存入状态
- [ ] 处理无权限时的展示

**状态管理:**
```typescript
// 新增 menuStore
interface MenuState {
  menus: MenuItem[];
  loadMenus: () => Promise<void>;
}
```

---

#### 阶段 D: 前端 - 角色分配菜单完善

**目标:** 完善角色管理中的菜单分配功能

**任务:**
- [ ] 使用 TreeSelect 替代普通 Select（已有）
- [ ] 支持多级菜单选择
- [ ] 支持全选、半选状态

---

## 关键决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 菜单数据存储 | 现有 parentId 字段 | 数据库结构已支持 |
| 动态菜单加载时机 | 登录后加载 | 减少请求，按需加载 |
| 菜单状态 | Zustand store | 与现有 authStore 模式一致 |

---

## 涉及文件

### 后端
- `backend/src/routes/menus.ts` - 可能需要新增用户菜单 API
- `backend/src/services/menu.ts` - 新增 findByUserId 方法

### 前端
- `frontend/src/pages/admin/MenuManage.tsx` - 树形改造
- `frontend/src/components/layout/MainLayout.tsx` - 动态菜单
- `frontend/src/stores/menuStore.ts` - 新增菜单状态
- `frontend/src/services/user.ts` - 新增 getUserMenus API

---

### 7. 提示词规则管理
- 提示词规则 CRUD
- 规则名称、规则简介
- 规则内容（完整提示词）
- 规则启用/禁用

### 8. 表查询规则
- 定义表的默认查询条件（如: isDelete=0）
- 支持 WHERE 条件表达式

### 9. 字段显示规则
- 字段值映射显示（如: status=0 显示"保存", status=1 显示"提交"）
- 支持键值对映射

---

## 需求概述

### 1. 用户管理
- 用户 CRUD（创建、读取、更新、删除）
- 用户列表展示
- 用户详情编辑

### 2. 角色管理
- 角色 CRUD
- 角色列表展示

### 3. 角色分配菜单
- 菜单权限配置
- 角色绑定菜单

### 4. 给用户分配角色
- 用户角色绑定
- 一用户多角色

### 5. 用户修改密码、头像
- 修改密码
- 修改头像

### 6. 外部数据源管理
- 支持 SQL Server / MSSQL 连接
- 数据源 CRUD
- 连接测试

### 7. 外部数据源表映射
- 外部表结构映射到本地
- 表别名配置
- 使用场景配置
- 字段别名配置
- 字段启用/禁用

---

## 阶段列表

### 阶段 0: 后端基础架构（新增）

**目标:** 完善后端日志和错误处理

**任务:**
- [ ] 请求日志中间件
  - 记录所有接口请求
  - 请求方法、路径、参数、耗时

- [ ] 错误日志处理
  - 捕获所有异常
  - 记录错误堆栈信息
  - 区分错误类型（业务错误/系统错误）

- [ ] 日志输出
  - 控制台输出（开发环境）
  - 文件输出（保存到 logs/ 目录）
  - 按日期分割日志文件

- [ ] 日志格式
  ```
  [时间] [级别] [请求ID] [方法] [路径] [耗时ms] [信息]
  2024-01-15 10:30:00 INFO req-123 POST /api/users 45ms
  2024-01-15 10:30:01 ERROR req-124 POST /api/users 120ms Error: 用户不存在
  ```

- [ ] 日志文件管理
  - 日志目录: logs/
  - 文件命名: app-2024-01-15.log
  - 日志保留策略（可选）

---

### 阶段 1: 数据库设计 & 数据模型

**目标:** 设计并创建数据库表结构

**任务:**
- [ ] 用户表 (users)
- [ ] 角色表 (roles)
- [ ] 菜单表 (menus)
- [ ] 用户角色关联表 (user_roles)
- [ ] 角色菜单关联表 (role_menus)
- [ ] 外部数据源表 (data_sources)
- [ ] 表映射配置表 (table_mappings)
  - 查询规则 (query_rules): 默认查询条件，如 isDelete=0
- [ ] 字段映射配置表 (field_mappings)
  - 显示规则 (display_rules): 字段值映射，如 {"0":"保存","1":"提交"}
- [ ] 提示词规则表 (prompt_rules)

---

### 阶段 2: 后端 - 认证 API

**目标:** 实现用户登录注册功能

**任务:**
- [ ] 登录 API
  - POST /api/auth/login - 用户登录
  - POST /api/auth/logout - 用户登出
  - GET /api/auth/me - 获取当前用户信息
- [ ] Session 中间件配置
- [ ] 密码加密 (bcrypt)

---

### 阶段 3: 后端 - 权限管理 API

**目标:** 实现权限管理相关 API

**任务:**
- [ ] 用户管理 API
  - GET /api/users - 用户列表
  - POST /api/users - 创建用户
  - GET /api/users/:id - 用户详情
  - PUT /api/users/:id - 更新用户
  - DELETE /api/users/:id - 删除用户
  - PUT /api/users/:id/password - 修改密码
  - PUT /api/users/:id/avatar - 修改头像

- [ ] 角色管理 API
  - GET /api/roles - 角色列表
  - POST /api/roles - 创建角色
  - GET /api/roles/:id - 角色详情
  - PUT /api/roles/:id - 更新角色
  - DELETE /api/roles/:id - 删除角色

- [ ] 菜单管理 API
  - GET /api/menus - 菜单列表
  - POST /api/menus - 创建菜单
  - PUT /api/menus/:id - 更新菜单
  - DELETE /api/menus/:id - 删除菜单

- [ ] 角色菜单分配 API
  - PUT /api/roles/:id/menus - 分配菜单

- [ ] 用户角色分配 API
  - PUT /api/users/:id/roles - 分配角色

---

### 阶段 4: 后端 - 外部数据源 API

**目标:** 实现外部数据源连接和管理

**任务:**
- [ ] 外部数据源管理 API
  - GET /api/data-sources - 数据源列表
  - POST /api/data-sources - 创建数据源
  - GET /api/data-sources/:id - 数据源详情
  - PUT /api/data-sources/:id - 更新数据源
  - DELETE /api/data-sources/:id - 删除数据源
  - POST /api/data-sources/:id/test - 测试连接

- [ ] 表映射管理 API
  - GET /api/data-sources/:id/tables - 获取外部表列表
  - GET /api/table-mappings - 映射列表
  - POST /api/table-mappings - 创建映射
  - PUT /api/table-mappings/:id - 更新映射
  - DELETE /api/table-mappings/:id - 删除映射

- [ ] 字段映射管理 API
  - GET /api/table-mappings/:id/fields - 获取字段列表
  - POST /api/table-mappings/:id/fields - 创建字段映射
  - PUT /api/field-mappings/:id - 更新字段映射
  - DELETE /api/field-mappings/:id - 删除字段映射

- [ ] 提示词规则管理 API
  - GET /api/prompt-rules - 规则列表
  - POST /api/prompt-rules - 创建规则
  - GET /api/prompt-rules/:id - 规则详情
  - PUT /api/prompt-rules/:id - 更新规则
  - DELETE /api/prompt-rules/:id - 删除规则

---

### 阶段 5: 前端 - 登录页面

**目标:** 实现用户登录页面

**任务:**
- [ ] 登录页面 (Login)
- [ ] 路由守卫配置

---

### 阶段 6: 前端 - 权限管理页面

**目标:** 实现权限管理相关页面

**任务:**
- [ ] 用户管理页面 (UserManage)
- [ ] 角色管理页面 (RoleManage)
- [ ] 菜单管理页面 (MenuManage)
- [ ] 用户角色分配组件
- [ ] 角色菜单分配组件

---

### 阶段 7: 前端 - 数据源管理页面

**目标:** 实现外部数据源管理页面

**任务:**
- [ ] 数据源管理页面 (DataSourceManage)
- [ ] 数据源连接表单
- [ ] 表映射管理页面 (TableMappingManage)
- [ ] 字段映射管理组件
- [ ] 提示词规则管理页面 (PromptRuleManage)

---

### 阶段 8: 后端 - AI 查询服务

**目标:** 实现 AI 智能查询功能（包含提示词规则）

**任务:**
- [ ] MiniMax API 集成
  - API 客户端封装
  - 请求/响应处理
  - 错误处理

- [ ] 简化版查询流程（后端自动处理）
  - **后端自动完成**:
    1. 分析用户查询意图，提取关键词
    2. 自动匹配相关表（使用场景、别名）
    3. 自动匹配相关提示词规则（名称、简介）
    4. 获取表字段信息（启用状态、字段别名）
    5. **应用表查询规则**（如 isDelete=0）
    6. 获取提示词规则内容
    7. 将表结构 + 字段信息 + 查询规则 + 提示词规则发送给 AI
    8. AI 生成 SQL 并执行
    9. **应用字段显示规则**转换结果（如 status=0 显示"保存"）
    10. 返回查询结果（包含使用的表、规则信息）
  - **用户只需**: 输入自然语言查询，获取结果

- [ ] SQL 执行服务
  - 根据数据源类型执行 SQL
  - SQL Server 执行器
  - MySQL 执行器
  - 结果转换处理

- [ ] 查询历史记录
  - 保存查询历史
  - 查询历史列表
  - 重新执行历史查询

---

### 阶段 9: 前端 - AI 查询页面增强

**目标:** 完善 AI 查询界面

**任务:**
- [ ] 简化查询界面
  - 自然语言输入框
  - 一键查询

- [ ] 查询结果展示
  - 表格展示
  - 图表可视化
  - 显示使用的表和提示词规则（可读信息）
  - 导出功能

- [ ] 查询历史面板
  - 历史列表
  - 重新执行

---

### 阶段 10: 集成与测试

**目标:** 集成前后端并测试

**任务:**
- [ ] 前端路由配置
- [ ] 权限控制（路由守卫）
- [ ] 前后端联调
- [ ] 单元测试
- [ ] 集成测试

---

## 菜单结构（完整模块）

### 一级菜单
1. **首页** - Dashboard
2. **权限管理** - 用户管理、角色管理、菜单管理
3. **数据源** - 外部数据源管理、表映射管理
4. **AI 查询** - AI 查询界面
5. **数据探索** - 数据浏览器
6. **报表** - 报表管理

### 权限管理模块（子菜单）
- 用户管理 (/users)
- 角色管理 (/roles)
- 菜单管理 (/menus)

### 数据源模块（子菜单）
- 外部数据源 (/data-sources)
- 表映射管理 (/table-mappings)
- 提示词规则 (/prompt-rules)

---

## 决策记录

### 决策 1: 数据库选择
- 本地数据库: MySQL（已确认）
- 外部数据源: SQL Server + MySQL（已确认）

### 决策 2: 外部数据库连接方案
- 使用 `mssql` npm 包连接 SQL Server
- 实现连接池管理

### 决策 3: 认证方案
- 用户名密码认证（已确认）
- Session/Cookie 方案

### 决策 4: 外部数据库支持
- SQL Server / MSSQL
- MySQL

### 决策 5: AI 查询方案
- AI 服务: MiniMax
- 查询流程: 后端自动处理（表选择 + 提示词规则 + SQL 生成）
- SQL 处理: 直接执行
- 提示词规则: 支持自定义提示词规则

---

## 技术栈扩展

- **本地数据库**: MySQL
- **ORM**: Prisma (推荐)
- **外部数据库**: mssql (SQL Server) + mysql2 (MySQL)
- **认证**: bcrypt + express-session
- **密码加密**: AES 加密外部数据源密码
- **AI 服务**: MiniMax API
- **文件上传**: multer

---

## 待实现功能优先级

1. 高优先级: 用户管理、角色管理、用户角色分配
2. 中优先级: 外部数据源管理、表映射
3. 低优先级: 菜单管理、角色菜单分配、字段映射
