# 目录结构

## 整体结构

```
erp-query-agent/
├── backend/                    # 后端服务 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/        # API 控制器
│   │   │   ├── auth.ts        # 认证控制器
│   │   │   ├── user.ts       # 用户控制器
│   │   │   ├── role.ts        # 角色控制器
│   │   │   ├── menu.ts        # 菜单控制器
│   │   │   ├── datasource.ts  # 数据源控制器
│   │   │   ├── tableMapping.ts# 表映射控制器
│   │   │   ├── fieldMapping.ts# 字段映射控制器
│   │   │   ├── promptRule.ts  # 提示词规则控制器
│   │   │   ├── query.ts       # AI 查询控制器
│   │   │   └── history.ts     # 查询历史控制器
│   │   ├── routes/            # 路由定义
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── roles.ts
│   │   │   ├── menus.ts
│   │   │   ├── dataSources.ts
│   │   │   ├── tableMappings.ts
│   │   │   ├── fieldMappings.ts
│   │   │   ├── promptRules.ts
│   │   │   ├── query.ts
│   │   │   └── history.ts
│   │   ├── services/          # 业务逻辑层
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── role.ts
│   │   │   ├── menu.ts
│   │   │   ├── datasource.ts
│   │   │   ├── tableMapping.ts
│   │   │   ├── fieldMapping.ts
│   │   │   ├── promptRule.ts
│   │   │   ├── ai.ts           # AI 查询服务
│   │   │   └── history.ts     # 查询历史服务
│   │   ├── middleware/         # 中间件
│   │   │   ├── auth.ts         # 认证中间件
│   │   │   ├── session.ts       # Session 中间件
│   │   │   ├── errorHandler.ts # 错误处理
│   │   │   └── requestLogger.ts # 请求日志
│   │   ├── models/             # Prisma 模型
│   │   │   └── index.ts
│   │   ├── utils/              # 工具函数
│   │   │   └── logger.ts       # 日志工具
│   │   ├── types/             # 类型定义
│   │   └── index.ts           # 应用入口
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库模型
│   │   ├── migrations/        # 数据库迁移
│   │   └── seed.ts            # 种子数据
│   ├── .env                    # 环境变量
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # 前端应用 (React)
│   ├── src/
│   │   ├── pages/             # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Query.tsx
│   │   │   ├── DataExplorer.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── admin/         # 管理页面
│   │   │   │   ├── UserManage.tsx
│   │   │   │   ├── RoleManage.tsx
│   │   │   │   └── MenuManage.tsx
│   │   │   └── datasource/     # 数据源页面
│   │   │       ├── DataSourceManage.tsx
│   │   │       ├── TableMappingManage.tsx
│   │   │       └── PromptRuleManage.tsx
│   │   ├── components/        # 公共组件
│   │   │   ├── layout/
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── common/
│   │   │   │   └── ResultTable.tsx
│   │   │   ├── chart/
│   │   │   └── AuthGuard.tsx  # 路由守卫
│   │   ├── services/           # API 服务
│   │   │   ├── api.ts          # Axios 实例
│   │   │   ├── auth.ts         # 认证服务
│   │   │   ├── user.ts         # 用户服务
│   │   │   └── datasource.ts    # 数据源服务
│   │   ├── stores/             # Zustand 状态
│   │   │   └── authStore.ts
│   │   ├── types/              # 类型定义
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── utils/              # 工具函数
│   │   ├── App.tsx             # 应用入口
│   │   ├── main.tsx            # React 入口
│   │   └── index.css           # 全局样式
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── flutter_app/                # 移动端应用 (Flutter)
│   └── lib/
│       ├── main.dart           # 应用入口
│       ├── config/
│       │   └── api_config.dart # API 配置
│       ├── services/
│       │   ├── api_client.dart # Dio HTTP 客户端
│       │   ├── auth_service.dart# 认证服务
│       │   └── query_service.dart # 查询服务
│       ├── states/
│       │   ├── auth_state.dart  # 认证状态
│       │   └── query_state.dart # 查询状态
│       ├── cubits/
│       │   ├── auth_cubit.dart  # 认证 Cubit
│       │   └── query_cubit.dart # 查询 Cubit
│       ├── pages/
│       │   ├── login_page.dart  # 登录页
│       │   ├── home_page.dart   # 首页/查询页
│       │   └── history_page.dart# 查询记录页
│       └── routes/
│           └── app_router.dart  # 路由配置
├── docs/                       # 项目文档
│   ├── README.md
│   ├── architecture/
│   │   ├── README.md
│   │   ├── database-design.md
│   │   └── directory-structure.md
│   ├── api/
│   │   └── README.md
│   └── guides/
│       ├── README.md
│       └── deployment.md
├── scripts/                    # 脚本
├── docker-compose.yml          # Docker 配置
├── package.json                # 根目录 package.json (可选)
└── README.md
```

## 后端详细结构

### controllers/
控制器负责处理 HTTP 请求和响应。

- `auth.ts` - 登录、登出、获取当前用户
- `user.ts` - 用户 CRUD、密码修改、角色分配
- `role.ts` - 角色 CRUD、菜单分配
- `menu.ts` - 菜单 CRUD
- `datasource.ts` - 数据源 CRUD、连接测试、获取表/字段
- `tableMapping.ts` - 表映射 CRUD
- `fieldMapping.ts` - 字段映射 CRUD
- `promptRule.ts` - 提示词规则 CRUD
- `query.ts` - AI 查询处理
- `history.ts` - 查询历史获取、删除

### services/
服务层包含业务逻辑。

- `auth.ts` - 密码验证、用户认证
- `ai.ts` - AI 查询核心逻辑（上下文构建、SQL 生成）
- `datasource.ts` - 数据库连接、密码加密

### middleware/
- `auth.ts` - 验证用户是否登录
- `session.ts` - Express Session 配置
- `errorHandler.ts` - 统一错误处理
- `requestLogger.ts` - 请求日志记录

## 前端详细结构

### pages/
页面组件，通常对应路由。

### components/
可复用的 UI 组件。

### services/
封装 API 调用。

### stores/
Zustand 状态管理存储。

## 文档结构

### docs/architecture/
- 系统架构设计文档
- 数据库设计文档
- 目录结构文档

### docs/api/
- RESTful API 接口文档

### docs/guides/
- 快速开始指南
- 部署指南
