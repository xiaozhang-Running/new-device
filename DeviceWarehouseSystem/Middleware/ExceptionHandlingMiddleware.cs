using DeviceWarehouseSystem.DTOs;
using System.Net;
using System.Text.Json;

namespace DeviceWarehouseSystem.Middleware
{
    /// <summary>
    /// 全局异常处理中间件
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            HttpStatusCode statusCode;
            var response = exception switch
            {
                KeyNotFoundException => CreateErrorResponse(
                    HttpStatusCode.NotFound,
                    "请求的资源不存在",
                    exception.Message),

                UnauthorizedAccessException => CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "未授权访问",
                    exception.Message),

                ArgumentException => CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "请求参数错误",
                    exception.Message),

                InvalidOperationException => CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "操作无效",
                    exception.Message),

                _ => CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    "服务器内部错误",
                    "处理请求时发生错误，请稍后重试")
            };

            // 根据异常类型确定状态码
            statusCode = exception switch
            {
                KeyNotFoundException => HttpStatusCode.NotFound,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                ArgumentException => HttpStatusCode.BadRequest,
                InvalidOperationException => HttpStatusCode.BadRequest,
                _ => HttpStatusCode.InternalServerError
            };

            // 设置响应状态码
            context.Response.StatusCode = (int)statusCode;

            // 记录日志
            if (statusCode >= HttpStatusCode.InternalServerError)
            {
                _logger.LogError(exception, "服务器错误: {Message}", exception.Message);
                // 在开发环境下输出详细异常信息到控制台
                Console.WriteLine($"[ERROR] {DateTime.Now:yyyy-MM-dd HH:mm:ss} - 服务器错误:");
                Console.WriteLine($"  消息: {exception.Message}");
                Console.WriteLine($"  堆栈: {exception.StackTrace}");
                if (exception.InnerException != null)
                {
                    Console.WriteLine($"  内部异常: {exception.InnerException.Message}");
                    Console.WriteLine($"  内部堆栈: {exception.InnerException.StackTrace}");
                }
            }
            else
            {
                _logger.LogWarning(exception, "客户端错误: {Message}", exception.Message);
            }

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }

        private static ApiResponse CreateErrorResponse(HttpStatusCode statusCode, string message, string error)
        {
            return ApiResponse.ErrorResponse(message, new List<string> { error });
        }
    }

    /// <summary>
    /// 扩展方法，用于注册中间件
    /// </summary>
    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
