using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

namespace DeviceWarehouseSystem.Services
{
    /// <summary>
    /// 文件存储服务接口
    /// </summary>
    public interface IFileStorageService
    {
        /// <summary>
        /// 保存文件到文件系统
        /// </summary>
        Task<FileStorageResult> SaveFileAsync(IFormFile file, string folder, string subFolder = null);
        
        /// <summary>
        /// 从文件系统读取文件
        /// </summary>
        Task<(byte[]? data, string? contentType)> GetFileAsync(string relativePath);
        
        /// <summary>
        /// 从文件系统删除文件
        /// </summary>
        Task<bool> DeleteFileAsync(string relativePath);
        
        /// <summary>
        /// 检查文件是否存在
        /// </summary>
        bool FileExists(string relativePath);
        
        /// <summary>
        /// 获取文件的完整URL
        /// </summary>
        string GetFileUrl(string relativePath);
        
        /// <summary>
        /// 获取文件存储的物理路径
        /// </summary>
        string GetPhysicalPath(string relativePath);
    }

    /// <summary>
    /// 文件存储结果
    /// </summary>
    public class FileStorageResult
    {
        public string? FileName { get; set; }
        public string? RelativePath { get; set; }
        public string? OriginalFileName { get; set; }
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
        public string? Url { get; set; }
    }

    /// <summary>
    /// 文件存储服务实现
    /// </summary>
    public class FileStorageService : IFileStorageService
    {
        private readonly string _basePath;
        private readonly string _baseUrl;
        private readonly IWebHostEnvironment _environment;

        public FileStorageService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            
            // 配置文件存储路径 - 使用项目目录下的uploads文件夹
            var configuredPath = configuration["FileStorage:BasePath"];
            if (!string.IsNullOrEmpty(configuredPath))
            {
                _basePath = configuredPath;
            }
            else
            {
                // 默认存储在项目根目录的uploads文件夹
                _basePath = Path.Combine(environment.ContentRootPath, "..", "uploads");
            }
            
            // 确保使用绝对路径
            _basePath = Path.GetFullPath(_basePath);
            
            // 配置URL基础路径
            _baseUrl = configuration["FileStorage:BaseUrl"] ?? "/uploads";
            
            // 确保目录存在
            if (!Directory.Exists(_basePath))
            {
                Directory.CreateDirectory(_basePath);
                Console.WriteLine($"[FileStorage] 创建上传目录: {_basePath}");
            }
            
            Console.WriteLine($"[FileStorage] 初始化完成 - 基础路径: {_basePath}, URL: {_baseUrl}");
        }

        /// <summary>
        /// 保存文件到文件系统（带图片压缩）
        /// </summary>
        public async Task<FileStorageResult> SaveFileAsync(IFormFile file, string folder, string subFolder = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("文件不能为空");
            }

            try
            {
                // 生成唯一文件名
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var fileName = $"{Guid.NewGuid():N}{fileExtension}";
                
                // 构建存储路径：uploads/{folder}/{subFolder}/{filename}
                var folderPath = string.IsNullOrEmpty(subFolder) 
                    ? Path.Combine(_basePath, folder)
                    : Path.Combine(_basePath, folder, subFolder);
                
                var filePath = Path.Combine(folderPath, fileName);
                
                // 确保目录存在
                Directory.CreateDirectory(folderPath);
                
                // 检查是否是图片文件
                var isImage = file.ContentType.StartsWith("image/");
                
                if (isImage)
                {
                    // 压缩并保存图片
                    await CompressAndSaveImageAsync(file, filePath);
                }
                else
                {
                    // 直接保存非图片文件
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
                
                // 计算相对路径（用于数据库存储）
                var relativePath = Path.Combine(folder, subFolder ?? "", fileName).Replace("\\", "/");
                
                // 获取文件大小
                var fileInfo = new FileInfo(filePath);
                
                return new FileStorageResult
                {
                    FileName = fileName,
                    RelativePath = relativePath,
                    OriginalFileName = file.FileName,
                    FileSize = fileInfo.Length,
                    ContentType = isImage ? "image/jpeg" : file.ContentType,
                    Url = GetFileUrl(relativePath)
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FileStorage] 保存文件失败: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// 压缩并保存图片
        /// </summary>
        private async Task CompressAndSaveImageAsync(IFormFile file, string filePath)
        {
            try
            {
                using (var inputStream = file.OpenReadStream())
                using (var image = await Image.LoadAsync(inputStream))
                {
                    // 获取图片原始尺寸
                    var originalWidth = image.Width;
                    var originalHeight = image.Height;
                    
                    // 设置最大尺寸限制
                    const int maxWidth = 1920;
                    const int maxHeight = 1080;
                    
                    // 如果图片尺寸超过限制，进行等比例缩放
                    if (originalWidth > maxWidth || originalHeight > maxHeight)
                    {
                        var ratioX = (double)maxWidth / originalWidth;
                        var ratioY = (double)maxHeight / originalHeight;
                        var ratio = Math.Min(ratioX, ratioY);
                        
                        var newWidth = (int)(originalWidth * ratio);
                        var newHeight = (int)(originalHeight * ratio);
                        
                        image.Mutate(x => x.Resize(newWidth, newHeight));
                        Console.WriteLine($"[FileStorage] 图片压缩: {originalWidth}x{originalHeight} -> {newWidth}x{newHeight}");
                    }
                    
                    // 保存为JPEG格式，质量80%
                    var encoder = new JpegEncoder
                    {
                        Quality = 80
                    };
                    
                    await image.SaveAsync(filePath, encoder);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FileStorage] 图片压缩失败: {ex.Message}");
                // 如果压缩失败，直接复制原文件
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }
        }

        /// <summary>
        /// 从文件系统读取文件
        /// </summary>
        public async Task<(byte[]? data, string? contentType)> GetFileAsync(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return (null, null);
            }

            try
            {
                var physicalPath = GetPhysicalPath(relativePath);
                
                if (!File.Exists(physicalPath))
                {
                    Console.WriteLine($"[FileStorage] 文件不存在: {physicalPath}");
                    return (null, null);
                }
                
                // 检查文件大小，对于大文件使用流式读取
                var fileInfo = new FileInfo(physicalPath);
                const long maxFileSize = 10 * 1024 * 1024; // 10MB
                
                byte[] data;
                if (fileInfo.Length > maxFileSize)
                {
                    // 对于大文件，使用流式读取
                    using (var fileStream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read))
                    using (var memoryStream = new MemoryStream())
                    {
                        await fileStream.CopyToAsync(memoryStream);
                        data = memoryStream.ToArray();
                    }
                }
                else
                {
                    // 对于小文件，直接读取
                    data = await File.ReadAllBytesAsync(physicalPath);
                }
                
                var contentType = GetContentType(Path.GetExtension(physicalPath));
                
                return (data, contentType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FileStorage] 读取文件失败: {ex.Message}");
                return (null, null);
            }
        }

        /// <summary>
        /// 从文件系统删除文件
        /// </summary>
        public async Task<bool> DeleteFileAsync(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return false;
            }

            try
            {
                var physicalPath = GetPhysicalPath(relativePath);
                
                if (File.Exists(physicalPath))
                {
                    File.Delete(physicalPath);
                    Console.WriteLine($"[FileStorage] 删除文件成功: {physicalPath}");
                    
                    // 尝试删除空目录
                    var directory = Path.GetDirectoryName(physicalPath);
                    if (Directory.Exists(directory))
                    {
                        var files = Directory.GetFiles(directory);
                        if (files.Length == 0)
                        {
                            Directory.Delete(directory);
                            Console.WriteLine($"[FileStorage] 删除空目录: {directory}");
                        }
                    }
                    
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FileStorage] 删除文件失败: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// 检查文件是否存在
        /// </summary>
        public bool FileExists(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return false;
            }

            var physicalPath = GetPhysicalPath(relativePath);
            return File.Exists(physicalPath);
        }

        /// <summary>
        /// 获取文件的完整URL
        /// </summary>
        public string GetFileUrl(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return null;
            }

            // 确保路径格式正确
            relativePath = relativePath.Replace("\\", "/");
            if (!relativePath.StartsWith("/"))
            {
                relativePath = "/" + relativePath;
            }
            
            return $"{_baseUrl}{relativePath}";
        }

        /// <summary>
        /// 获取文件存储的物理路径
        /// </summary>
        public string GetPhysicalPath(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return null;
            }

            // 清理路径，防止目录遍历攻击
            relativePath = relativePath.Replace("\\", "/").TrimStart('/');
            var segments = relativePath.Split('/');
            
            // 过滤掉非法字符和路径遍历
            var safeSegments = segments.Where(s => 
                !string.IsNullOrWhiteSpace(s) && 
                !s.Contains("..") && 
                !s.Contains(":") &&
                !s.Contains("<") &&
                !s.Contains(">") &&
                !s.Contains("|")
            );
            
            var safePath = string.Join(Path.DirectorySeparatorChar.ToString(), safeSegments);
            return Path.Combine(_basePath, safePath);
        }

        /// <summary>
        /// 根据文件扩展名获取Content-Type
        /// </summary>
        private string GetContentType(string extension)
        {
            return extension?.ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }
    }
}
