# 构建阶段
FROM node:22-alpine AS build

# 设置工作目录
WORKDIR /app

# 安装 git
RUN apk add --no-cache git

# 复制 package.json 和 package-lock.json 文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --ignore-scripts

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 运行阶段
FROM nginx:1.27-alpine

# 复制 nginx.conf 文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=build /app/.vitepress/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80
