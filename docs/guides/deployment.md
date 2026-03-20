# 部署指南

## 环境要求

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

## 生产环境部署

### 1. 准备数据库

```sql
-- 创建数据库
CREATE DATABASE erp_query CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选）
CREATE USER 'erp_query_agent'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON erp_query.* TO 'erp_query_agent'@'%';
FLUSH PRIVILEGES;
```

### 2. 构建后端

```bash
cd backend

# 安装依赖
npm install

# 构建
npm run build

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 运行数据库迁移
npx prisma migrate deploy

# 运行种子数据（可选）
npm run seed
```

### 3. 构建前端

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### 4. 配置反向代理

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/erp-query-agent/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. 使用 PM2 部署后端

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd backend
pm2 start dist/index.js --name erp-api

# 配置开机自启
pm2 startup
pm2 save
```

### 6. 环境变量配置

#### 后端 (.env)

```bash
# 服务器配置
PORT=4000
NODE_ENV=production
LOG_LEVEL=info

# 数据库配置
DATABASE_URL="mysql://user:password@localhost:3306/erp_query"

# 会话密钥（生成随机字符串）
SESSION_SECRET="your-session-secret-here"

# 加密密钥（生成随机32字节密钥）
ENCRYPTION_KEY="your-32-char-encryption-key-here"

# MiniMax API
MINI_MAX_API_KEY="your-minimax-api-key"
MINI_MAX_BASE_URL="https://api.minimax.chat/v1"
```

#### 前端

生产环境前端通过 Vite 构建，API 地址由反向代理处理。

## Docker 部署（可选）

### Dockerfile (后端)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: erp_query
      MYSQL_USER: erp_query_agent
      MYSQL_PASSWORD: erp_query_agent
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: "mysql://erp_query_agent:erp_query_agent@mysql:3306/erp_query"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

## 目录结构

生产环境推荐目录结构：

```
/opt/erp-query-agent/
├── backend/
│   ├── dist/           # 构建输出
│   ├── node_modules/   # 依赖
│   ├── prisma/
│   │   └── migrations/ # 数据库迁移
│   ├── .env            # 环境变量
│   └── package.json
├── frontend/
│   └── dist/           # 构建输出
└── logs/               # 日志目录
```

## 维护

### 查看日志

```bash
# PM2 日志
pm2 logs erp-api

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 更新部署

```bash
# 拉取代码
git pull

# 重新构建后端
cd backend
npm install
npm run build
pm2 restart erp-api

# 重新构建前端
cd frontend
npm install
npm run build
```

### 数据库备份

```bash
mysqldump -u root -p erp_query > backup_$(date +%Y%m%d).sql
```

## 安全建议

1. **修改默认密码**: 生产环境务必修改 `admin` 账号密码
2. **配置 HTTPS**: 生产环境应启用 HTTPS
3. **限制数据库访问**: 限制数据库端口仅允许应用服务器访问
4. **定期更新依赖**: 关注安全漏洞更新
5. **配置防火墙**: 仅开放必要的端口 (80, 443)
