# ERP 查询智能体

基于 AI 的企业ERP外部数据源智能查询系统。

## 功能特性

- **AI 智能查询**: 使用自然语言描述查询，系统自动生成 SQL 并执行
- **多数据源支持**: 支持 MySQL、SQL Server 等数据库
- **完整的权限管理**: 用户、角色、菜单三位一体的权限控制
- **表映射配置**: 可配置外部数据表映射，设置查询规则和显示规则
- **提示词规则**: 自定义 AI 提示词规则，优化查询结果

## 技术栈

### 后端
- Node.js + Express
- Prisma ORM + MySQL
- bcrypt 密码加密
- express-session 认证
- MiniMax API (AI 查询)

### 前端
- React 18 + TypeScript
- Ant Design 5
- React Router 6
- Zustand 状态管理
- Vite 构建工具

### 移动端 (Flutter)
- Flutter 3.x + Dart
- Provider 状态管理
- Dio HTTP 客户端 (Cookie 管理)
- flutter_bloc 状态管理

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0

### 安装部署

```bash
# 克隆项目
git clone <repository-url>
cd erp-query-agent

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install

# 配置环境变量
# 编辑 backend/.env 文件

# 初始化数据库
cd backend
npm run seed

# 启动开发服务器
# 后端: npm run dev (端口 4000)
# 前端: npm run dev (端口 3000)
```

### 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
erp-query-agent/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── controllers/       # API 控制器
│   │   ├── routes/            # 路由定义
│   │   ├── services/          # 业务逻辑
│   │   ├── middleware/        # 中间件
│   │   ├── models/            # Prisma 模型
│   │   └── utils/             # 工具函数
│   └── prisma/
│       └── schema.prisma      # 数据库模型
├── frontend/                   # 前端应用
│   └── src/
│       ├── pages/              # 页面组件
│       ├── components/         # 公共组件
│       ├── services/           # API 服务
│       └── stores/            # 状态管理
├── flutter_app/               # 移动端应用 (Flutter)
│   └── lib/
│       ├── config/            # 配置文件
│       ├── services/          # API 服务
│       ├── states/            # 状态定义
│       ├── cubits/            # 状态管理
│       ├── pages/             # 页面
│       └── routes/            # 路由
└── docs/                      # 项目文档
```

## 文档目录

- [架构设计](./architecture/) - 系统架构、数据库设计
- [API 文档](./api/) - 接口文档
- [使用指南](./guides/) - 快速开始、部署指南

## License

MIT
