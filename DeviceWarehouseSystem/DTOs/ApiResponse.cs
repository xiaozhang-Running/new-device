using System.Collections.Generic;

namespace DeviceWarehouseSystem.DTOs
{
    /// <summary>
    /// 统一API响应模型
    /// </summary>
    /// <typeparam name="T">数据类型</typeparam>
    public class ApiResponse<T>
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 响应数据
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// 响应消息
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// 错误列表
        /// </summary>
        public List<string> Errors { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public long Timestamp { get; set; }

        public ApiResponse()
        {
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Errors = new List<string>();
        }

        /// <summary>
        /// 创建成功响应
        /// </summary>
        public static ApiResponse<T> SuccessResponse(T data, string message = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
        }

        /// <summary>
        /// 创建错误响应
        /// </summary>
        public static ApiResponse<T> ErrorResponse(string message, List<string> errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }

        /// <summary>
        /// 创建错误响应（单个错误）
        /// </summary>
        public static ApiResponse<T> ErrorResponse(string message, string error)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = new List<string> { error }
            };
        }
    }

    /// <summary>
    /// 无数据类型的API响应
    /// </summary>
    public class ApiResponse
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 响应消息
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// 错误列表
        /// </summary>
        public List<string> Errors { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public long Timestamp { get; set; }

        public ApiResponse()
        {
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Errors = new List<string>();
        }

        /// <summary>
        /// 创建成功响应
        /// </summary>
        public static ApiResponse SuccessResponse(string message = null)
        {
            return new ApiResponse
            {
                Success = true,
                Message = message
            };
        }

        /// <summary>
        /// 创建错误响应
        /// </summary>
        public static ApiResponse ErrorResponse(string message, List<string> errors = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }
}
