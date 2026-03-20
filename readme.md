# CLAUDE.md - ERP 查询智能体项目指南

## 项目概述

本项目是一个 ERP 外部 AI 查询软件，支持通过 AI 能力查询和分析 ERP 系统数据。用户可以通过自然语言查询 ERP 系统中的数据，系统返回结构化的查询结果。

### 核心功能

- **AI 智能查询**: 使用自然语言查询 ERP 数据
- **数据可视化**: 支持表格、图表等多种展示方式
- **数据探索**: 灵活的数据筛选、排序和分页
- **报表生成**: 自定义报表的创建和导出

### 技术栈

- **前端**: React 18 + TypeScript + Ant Design 5 + AntV 图表
- **后端**: Node.js + Express + TypeScript
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **测试**: Vitest (前端) + Jest (后端)
- **构建工具**: Vite (前端) + ts-node-dev (后端)

---

## 项目结构

```
erp-query-agent/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── controllers/       # 控制器 - 处理请求
│   │   ├── services/          # 业务逻辑层
│   │   ├── routes/            # 路由定义
│   │   ├── types/             # TypeScript 类型
│   │   └── utils/             # 工具函数
│   ├── tests/                 # 测试文件
│   │   └── unit/              # 单元测试
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env.example           # 环境变量示例
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── common/        # 通用组件
│   │   │   ├── chart/         # 图表组件
│   │   │   └── layout/        # 布局组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── stores/            # 状态管理
│   │   ├── types/             # 类型定义
│   │   ├── utils/             # 工具函数
│   │   ├── App.tsx            # 应用入口
│   │   └── main.tsx           # 渲染入口
│   ├── tests/                 # 测试文件
│   │   └── unit/              # 单元测试
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── docs/                      # 项目文档
│   ├── api/                   # API 文档
│   ├── architecture/          # 架构文档
│   └── guides/                # 开发指南
├── scripts/                    # 脚本工具
├── .github/                   # GitHub 配置
│   └── workflows/             # CI/CD 流水线
├── SPEC.md                    # 项目规格说明
├── README.md                  # 项目说明
└── CLAUDE.md                  # AI 开发指南
```

---

## 开发规范

### 通用规范

- **语言**: 全部使用 TypeScript
- **代码风格**: 遵循 ESLint 配置规则
- **测试**: 新功能必须先写测试（遵循 TDD 流程）
- **提交**: 提交前确保所有测试通过

### 前端规范

#### 组件开发

- 使用函数组件 + Hooks
- 组件文件命名: `ComponentName.tsx`
- 组件目录结构:
  ```
  components/
  └── ComponentName/
      ├── index.tsx           # 组件实现
      └── ComponentName.module.css  # 样式（可选）
  ```

#### 样式规范

- 优先使用 Ant Design Tokens
- 自定义样式使用 CSS Modules
- 避免内联样式（除动态属性外）

#### 状态管理

- 组件级状态: 使用 useState/useReducer
- 全局状态: 使用 Zustand Store
- 服务端状态: 使用 React Query 或自定义 Hook

### 后端规范

#### 架构模式

- RESTful API 设计
- 分层架构: Controller → Service → Model
- 单一职责原则

#### 错误处理

- 统一错误响应格式
- 使用 HTTP 状态码表示错误类型
- 记录详细错误日志

#### 日志规范

- 使用 Winston 日志库
- 日志级别: error, warn, info, debug
- 生产环境记录 JSON 格式

---

## 常用命令

### 环境准备

```bash
# 克隆项目后安装所有依赖
cd erp-query-agent
cd backend && npm install
cd ../frontend && npm install
```

### 后端命令

```bash
cd backend

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test

# 监听测试模式
npm run test:watch

# 代码检查
npm run lint
```

### 前端命令

```bash
cd frontend

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行测试
npm test

# 监听测试模式
npm run test:watch

# 代码检查
npm run lint
```

---

## API 端点

### 健康检查

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/health | 服务健康状态 |

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### AI 查询

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/query | 执行 AI 查询 |

**请求体:**
```json
{
  "query": "查询2024年1月的销售额",
  "context": {},
  "options": {
    "format": "table",
    "limit": 100
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "q-1705312200000",
    "query": "查询2024年1月的销售额",
    "result": [...],
    "format": "table",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 数据获取

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/data/:entity | 获取实体数据 |

**查询参数:**
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 10）
- 其他筛选字段

**响应示例:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}
```

### 报表管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/reports | 获取报表列表 |
| POST | /api/reports | 生成新报表 |

---

## 页面路由

| 路径 | 页面 | 描述 |
|------|------|------|
| /dashboard | Dashboard | 仪表盘 - KPI 和图表展示 |
| /query | Query | AI 查询界面 |
| /explorer | DataExplorer | 数据浏览器 - 表格展示 |
| /reports | Reports | 报表管理 |

---

## 环境配置

### 后端环境变量

在 `backend/.env` 中配置:

```bash
# 服务端口
PORT=4000

# 日志级别
LOG_LEVEL=info

# 运行环境
NODE_ENV=development
```

### 前端代理配置

前端代理配置在 `frontend/vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  }
}
```

---

## 工作流程

### 开发新功能

1. **规划阶段**: 分析需求，创建任务列表
2. **开发阶段**:
   - 遵循 TDD 流程（先写测试，再写实现）
   - 遵循代码规范
   - 编写清晰的注释
3. **提交阶段**:
   - 运行测试确保通过
   - TypeScript 编译无错误
   - 提交代码

### TDD 开发流程

```
1. 编写失败的测试（RED）
2. 运行测试确认失败
3. 编写最小化代码使测试通过（GREEN）
4. 重构代码（REFACTOR）
5. 确保所有测试通过
```

### 代码提交规范

- 使用清晰的提交信息
- 提交信息格式: `类型: 描述`
  - `feat`: 新功能
  - `fix`: 修复
  - `docs`: 文档
  - `test`: 测试
  - `refactor`: 重构
- 提交前运行测试

---

## 测试指南

### 后端测试

```bash
cd backend
npm test
```

测试文件位于 `backend/tests/`:
- 单元测试: `tests/unit/*.test.ts`
- 集成测试: `tests/integration/*.test.ts`

### 前端测试

```bash
cd frontend
npm test
```

测试文件位于 `frontend/tests/`:
- 单元测试: `tests/unit/*.test.tsx`
- 组件测试: 使用 React Testing Library

---

## 注意事项

- 前端开发服务器端口: 3000
- 后端服务器端口: 4000
- 前端代理已配置，将 /api 请求转发到后端
- 开发时需要同时启动前后端服务
- 确保 MongoDB/数据库连接配置正确（后续添加）

---

## 相关文档

- [SPEC.md](./SPEC.md) - 详细项目规格
- [README.md](./README.md) - 项目入门指南
- [docs/](./docs/) - 完整项目文档
