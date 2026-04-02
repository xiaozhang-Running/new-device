using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Middleware
{
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public AuthorizationMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // 跳过登录和注册接口
            if (context.Request.Path.StartsWithSegments("/api/Auth"))
            {
                await _next(context);
                return;
            }

            // 跳过图片接口
            if (context.Request.Path.StartsWithSegments("/api/Image"))
            {
                await _next(context);
                return;
            }

            // 获取Authorization头
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"未授权访问\"}");
                return;
            }

            // 提取token
            var token = authHeader.Substring(7);

            try
            {
                // 检查是否是假token（用于模拟登录）
                if (token.StartsWith("fake-token-"))
                {
                    // 从假token中提取角色信息
                    // 假token格式: fake-token-<encoded-role>-<timestamp>
                    string fakeUserRole = "普通用户";
                    string fakeUsername = "test-user";

                    // 去掉前缀 "fake-token-"
                    string tokenWithoutPrefix = token.Substring(11);
                    
                    // 找到最后一个 "-" 字符，将字符串分为两部分
                    int lastHyphenIndex = tokenWithoutPrefix.LastIndexOf('-');
                    if (lastHyphenIndex > 0)
                    {
                        // 提取编码后的角色名称
                        string encodedRole = tokenWithoutPrefix.Substring(0, lastHyphenIndex);
                        fakeUserRole = Uri.UnescapeDataString(encodedRole);
                        
                        // 提取时间戳作为用户名
                        fakeUsername = tokenWithoutPrefix.Substring(lastHyphenIndex + 1);
                    }

                    // 将用户信息存储到上下文
                    context.Items["UserRole"] = fakeUserRole;
                    context.Items["Username"] = fakeUsername;

                    // 权限验证
                    if (!HasPermission(context.Request.Path, fakeUserRole))
                    {
                        context.Response.StatusCode = 403;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsync("{\"message\":\"权限不足\"}");
                        return;
                    }

                    await _next(context);
                    return;
                }

                // 验证token
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];
                
                if (string.IsNullOrEmpty(jwtKey))
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"message\":\"JWT配置错误\"}");
                    return;
                }
                
                var key = Encoding.UTF8.GetBytes(jwtKey);
                
                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                var claimsPrincipal = tokenHandler.ValidateToken(token, tokenValidationParameters, out _);
                var jwtUserRole = claimsPrincipal.FindFirst(ClaimTypes.Role)?.Value;
                var jwtUsername = claimsPrincipal.FindFirst(ClaimTypes.Name)?.Value;

                // 将用户信息存储到上下文
                context.Items["UserRole"] = jwtUserRole;
                context.Items["Username"] = jwtUsername;

                // 权限验证
                if (!HasPermission(context.Request.Path, jwtUserRole ?? ""))
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"message\":\"权限不足\"}");
                    return;
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token验证失败: {ex.Message}");
                Console.WriteLine($"异常类型: {ex.GetType().Name}");
                Console.WriteLine($"堆栈跟踪: {ex.StackTrace}");
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"message\":\"无效的token\"}");
                return;
            }
        }

        private bool HasPermission(PathString path, string userRole)
        {
            // 简化的权限验证逻辑，基于用户角色
            // 实际项目中应该从数据库读取角色权限关系
            
            // 检查用户角色是否存在
            if (string.IsNullOrEmpty(userRole))
            {
                return false;
            }

            // 系统管理员有所有权限
            if (userRole == "系统管理员")
            {
                return true;
            }
            // 仓库管理员：除仓库管理、用户管理、日志管理外的所有权限
            else if (userRole == "仓库管理员")
            {
                // 检查是否访问仓库管理、用户管理或日志管理
                if (path.StartsWithSegments("/api/Warehouse") || 
                    path.StartsWithSegments("/api/User") ||
                    path.StartsWithSegments("/api/Log"))
                {
                    return false;
                }
                // 允许访问图片上传接口
                if (path.StartsWithSegments("/api/Image"))
                {
                    return true;
                }
                return true;
            }
            // 项目负责人：项目相关权限 + 设备、耗材、原材料管理 + 图片上传
            else if (userRole == "项目负责人")
            {
                return path.StartsWithSegments("/api/Device") ||
                       path.StartsWithSegments("/api/Consumable") ||
                       path.StartsWithSegments("/api/RawMaterials") ||
                       path.StartsWithSegments("/api/ProjectOutbound") ||
                       path.StartsWithSegments("/api/InOutbound/project-inbounds") ||
                       path.StartsWithSegments("/api/Image");
            }
            // 财务人员：设备、耗材、原材料管理 + 日志管理
            else if (userRole == "财务人员")
            {
                return path.StartsWithSegments("/api/Device") ||
                       path.StartsWithSegments("/api/Consumable") ||
                       path.StartsWithSegments("/api/RawMaterials") ||
                       path.StartsWithSegments("/api/Log");
            }
            // 普通用户：看板查看 + 库存管理 + 项目出入库管理 + 设备管理 + 耗材和原材料管理
            else if (userRole == "普通用户")
            {
                // 允许访问看板、设备库存汇总视图、项目出库、项目入库、设备列表、耗材和原材料
                return path.StartsWithSegments("/api/Dashboard") ||
                       path.StartsWithSegments("/api/Device/special-equipments") ||
                       path.StartsWithSegments("/api/Device/general-equipments") ||
                       path.StartsWithSegments("/api/Device/inventory") ||
                       path.StartsWithSegments("/api/Consumable") ||
                       path.StartsWithSegments("/api/RawMaterials") ||
                       (path.StartsWithSegments("/api/Device") && path.ToString().Contains("summary")) ||
                       path.StartsWithSegments("/api/ProjectOutbound") ||
                       path.StartsWithSegments("/api/InOutbound/project-inbounds");
            }
            
            return false;
        }
    }
}