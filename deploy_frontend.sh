#!/bin/bash

# 前端部署脚本

echo "=== 前端部署脚本 ==="

# 检查Node.js是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装Node.js 16+"
    exit 1
fi

echo "1. 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo "2. 构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "错误: 构建失败"
    exit 1
fi

echo "3. 构建完成！"
echo "构建文件位于 ./dist 目录"
echo ""
echo "请将 ./dist 目录中的所有文件复制到Web服务器的静态文件目录"
echo "例如: /var/www/html 或 C:\inetpub\wwwroot"
