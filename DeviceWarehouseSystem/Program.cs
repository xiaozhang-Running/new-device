using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.Middleware;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure database connection
builder.Services.AddDbContext<DeviceWarehouseContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)));

// Configure services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DeviceService>();
builder.Services.AddScoped<InOutboundService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<ConsumableService>();
builder.Services.AddScoped<IRawMaterialService, RawMaterialService>();
builder.Services.AddScoped<LogService>();

// Configure JWT authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured. Please set 'Jwt:Key' in appsettings.json or environment variables.");
}

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException("JWT Key must be at least 32 characters long for security purposes.");
}

var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Add CORS
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

// 初始化默认用户
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DeviceWarehouseContext>();
    // 检查是否存在用户表
    if (context.Users != null && !context.Users.Any())
    {
        // 添加默认管理员用户
        var adminUser = new DeviceWarehouseSystem.Models.User
        {
            Username = "admin",
            PasswordHash = "admin123", // 实际项目中应该加密密码
            Role = "Admin",
            Email = "admin@example.com",
            FullName = "管理员",
            IsActive = true,
            CreatedAt = DateTime.Now,
            LastLoginAt = DateTime.Now
        };
        context.Users.Add(adminUser);
        
        // 添加默认普通用户
        var normalUser = new DeviceWarehouseSystem.Models.User
        {
            Username = "user",
            PasswordHash = "user123",
            Role = "User",
            Email = "user@example.com",
            FullName = "普通用户",
            IsActive = true,
            CreatedAt = DateTime.Now
        };
        context.Users.Add(normalUser);
        
        context.SaveChanges();
        Console.WriteLine("默认用户初始化完成");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// 使用请求日志记录中间件
app.UseRequestLogging();

// 使用全局异常处理中间件
app.UseExceptionHandling();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();