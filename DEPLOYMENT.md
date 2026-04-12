# 系统部署说明

## 部署文件列表

- `deploy_frontend.sh` - 前端部署脚本（Linux/Mac）
- `deploy_backend.sh` - 后端部署脚本（Linux/Mac）
- `deploy_frontend.bat` - 前端部署脚本（Windows）
- `deploy_backend.bat` - 后端部署脚本（Windows）
- `nginx.conf` - Nginx配置文件

## 前端部署步骤

### 1. 准备环境
- 安装 Node.js 16+（https://nodejs.org/）
- 克隆项目代码到本地

### 2. 运行部署脚本

#### Linux/Mac
```bash
# 赋予脚本执行权限
chmod +x deploy_frontend.sh

# 运行部署脚本
./deploy_frontend.sh
```

#### Windows
```bash
# 双击运行 deploy_frontend.bat
# 或在命令提示符中运行
deploy_frontend.bat
```

### 3. 部署静态文件
- 构建完成后，将 `dist` 目录中的所有文件复制到Web服务器的静态文件目录
- 例如：
  - Linux: `/var/www/html`
  - Windows: `C:\inetpub\wwwroot`

## 后端部署步骤

### 1. 准备环境
- 安装 .NET SDK 6.0+（https://dotnet.microsoft.com/download）
- 安装 SQL Server（https://www.microsoft.com/en-us/sql-server/sql-server-downloads）

### 2. 运行部署脚本

#### Linux/Mac
```bash
# 赋予脚本执行权限
chmod +x deploy_backend.sh

# 运行部署脚本
./deploy_backend.sh
```

#### Windows
```bash
# 双击运行 deploy_backend.bat
# 或在命令提示符中运行
deploy_backend.bat
```

### 3. 配置数据库
- 恢复数据库备份或运行数据库迁移
- 修改 `publish/appsettings.json` 中的数据库连接字符串

### 4. 部署后端服务
- 将 `publish` 目录中的所有文件复制到目标服务器
- 在服务器上安装 .NET Runtime 6.0+
- 使用 IIS 或 Kestrel 托管应用

## Nginx 配置

### 1. 安装 Nginx
```bash
# Ubuntu
sudo apt update
sudo apt install nginx

# CentOS
sudo yum install nginx
```

### 2. 配置 Nginx
- 将 `nginx.conf` 文件复制到 `/etc/nginx/conf.d/` 目录
- 修改配置文件中的域名和证书路径
- 测试配置：
  ```bash
  sudo nginx -t
  ```
- 重启 Nginx：
  ```bash
  sudo systemctl restart nginx
  ```

## 环境变量配置

### 生产环境
- 修改 `appsettings.json` 文件中的配置
- 或设置环境变量：
  ```bash
  # Linux/Mac
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__DefaultConnection="Server=localhost;Database=DeviceWarehouse;User Id=sa;Password=YourPassword;"

  # Windows
  set ASPNETCORE_ENVIRONMENT=Production
  set ConnectionStrings__DefaultConnection=Server=localhost;Database=DeviceWarehouse;User Id=sa;Password=YourPassword;
  ```

## 发布后验证

1. **访问前端**：`https://your-domain.com`
2. **测试API**：`https://your-domain.com/api/Device/special-equipments`
3. **测试登录**：使用管理员账号登录系统
4. **测试功能**：测试设备管理、原材料管理等功能

## 常见问题

### 1. 前端无法访问后端 API
- 检查 CORS 配置
- 检查 Nginx 反向代理配置
- 检查后端服务是否运行

### 2. 数据库连接失败
- 检查连接字符串
- 检查数据库服务是否运行
- 检查数据库用户权限

### 3. 静态文件无法访问
- 检查 Nginx 配置
- 检查文件权限
- 检查文件路径

### 4. 502 Bad Gateway 错误
- 检查后端服务是否运行
- 检查 Nginx 配置中的后端地址
- 检查端口是否开放

## 安全建议

1. **启用 HTTPS**：使用 Let's Encrypt 或其他 SSL 证书
2. **限制访问**：配置防火墙和安全组
3. **定期备份**：定期备份数据库和配置文件
4. **更新依赖**：定期更新系统和依赖项
5. **监控系统**：设置监控和警报

## 联系方式

如果在部署过程中遇到问题，请联系系统管理员获取帮助。
