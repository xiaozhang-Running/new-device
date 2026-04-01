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

// 注册控制器
builder.Services.AddControllers();

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

// 应用中间件
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