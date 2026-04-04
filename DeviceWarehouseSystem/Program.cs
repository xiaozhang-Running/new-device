using Microsoft.EntityFrameworkCore;
using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 注册数据库上下文
builder.Services.AddDbContext<DeviceWarehouseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 注册服务
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<LogService>();
builder.Services.AddScoped<DeviceService>();
builder.Services.AddScoped<ConsumableService>();
builder.Services.AddScoped<IRawMaterialService, RawMaterialService>();
builder.Services.AddScoped<InOutboundService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<StockTakingService>();

// 注册控制器
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // 配置 JSON 序列化使用 camelCase 命名策略，与前端保持一致
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 配置CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 应用CORS策略
app.UseCors("AllowAll");

// 配置静态文件服务（用于访问上传的文件）
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "..", "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.GetFullPath(uploadsPath)),
    RequestPath = "/uploads"
});
Console.WriteLine($"[Program] 静态文件服务已配置: {Path.GetFullPath(uploadsPath)}");

// 应用中间件
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<AuthorizationMiddleware>();

// 映射控制器
app.MapControllers();

// 检查数据库中的用户数据
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DeviceWarehouseContext>();
    var users = context.Users?.ToList() ?? new List<User>();
    Console.WriteLine("数据库中的用户数据:");
    foreach (var user in users)
    {
        Console.WriteLine($"ID: {user.Id}, Username: {user.Username}, Role: {user.Role}");
    }
}

app.Run();