#!/bin/bash

# 后端部署脚本

echo "=== 后端部署脚本 ==="

# 检查.NET SDK是否安装
if ! command -v dotnet &> /dev/null; then
    echo "错误: .NET SDK 未安装，请先安装.NET SDK 6.0+"
    exit 1
fi

# 进入后端项目目录
cd DeviceWarehouseSystem || {
    echo "错误: 无法进入 DeviceWarehouseSystem 目录"
    exit 1
}

echo "1. 构建项目..."
dotnet build --configuration Release

if [ $? -ne 0 ]; then
    echo "错误: 构建失败"
    exit 1
fi

echo "2. 发布项目..."
dotnet publish --configuration Release --output ./publish

if [ $? -ne 0 ]; then
    echo "错误: 发布失败"
    exit 1
fi

echo "3. 发布完成！"
echo "发布文件位于 ./DeviceWarehouseSystem/publish 目录"
echo ""
echo "部署说明:"
echo "1. 将 publish 目录中的所有文件复制到目标服务器"
echo "2. 配置数据库连接字符串 (appsettings.json)"
echo "3. 在服务器上安装 .NET Runtime 6.0+"
echo "4. 使用 IIS 或 Kestrel 托管应用"
