using System.Diagnostics;

namespace DeviceWarehouseSystem.Middleware
{
    /// <summary>
    /// 请求日志记录中间件
    /// </summary>
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            var request = context.Request;

            // 记录请求信息
            _logger.LogInformation(
                "[Request] {Method} {Path} - 客户端: {ClientIP} - 用户: {User}",
                request.Method,
                request.Path,
                GetClientIPAddress(context),
                context.User?.Identity?.Name ?? "Anonymous");

            try
            {
                await _next(context);

                stopwatch.Stop();

                // 记录响应信息
                var statusCode = context.Response.StatusCode;
                var logLevel = statusCode >= 400 ? LogLevel.Warning : LogLevel.Information;

                _logger.Log(logLevel,
                    "[Response] {Method} {Path} - 状态码: {StatusCode} - 耗时: {ElapsedMs}ms",
                    request.Method,
                    request.Path,
                    statusCode,
                    stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                _logger.LogError(ex,
                    "[Error] {Method} {Path} - 状态码: {StatusCode} - 耗时: {ElapsedMs}ms - 错误: {ErrorMessage}",
                    request.Method,
                    request.Path,
                    context.Response.StatusCode,
                    stopwatch.ElapsedMilliseconds,
                    ex.Message);

                throw;
            }
        }

        private static string GetClientIPAddress(HttpContext context)
        {
            // 尝试从X-Forwarded-For头获取真实IP（当使用反向代理时）
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            // 尝试从X-Real-IP头获取
            var realIP = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIP))
            {
                return realIP;
            }

            // 返回连接IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }

    /// <summary>
    /// 扩展方法，用于注册中间件
    /// </summary>
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
