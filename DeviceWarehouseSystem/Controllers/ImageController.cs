using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.IO;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly ImageService _imageService;
        private readonly DeviceWarehouseContext _context;
        private readonly IFileStorageService _fileStorageService;

        public ImageController(ImageService imageService, DeviceWarehouseContext context, IFileStorageService fileStorageService)
        {
            _imageService = imageService;
            _context = context;
            _fileStorageService = fileStorageService;
        }

        // 上传设备图片
        [HttpPost("equipment")]
        public async Task<ActionResult<List<int>>> UploadEquipmentImages()
        {
            try
            {
                // 从请求中获取所有表单数据
                var form = await Request.ReadFormAsync();
                
                // 获取文件
                var files = form.Files;
                
                // 检查是否接收到文件
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "没有接收到文件" });
                }
                
                // 获取其他参数
                if (!int.TryParse(form["equipmentId"], out int equipmentId))
                {
                    return BadRequest(new { message = "缺少equipmentId参数" });
                }
                
                if (!int.TryParse(form["equipmentType"], out int equipmentType))
                {
                    return BadRequest(new { message = "缺少equipmentType参数" });
                }
                
                // 记录日志
                Console.WriteLine($"[ImageController] 接收到文件数量: {files.Count}");
                Console.WriteLine($"[ImageController] equipmentId: {equipmentId}");
                Console.WriteLine($"[ImageController] equipmentType: {equipmentType}");
                
                var imageIds = new List<int>();
                int orderIndex = 0;

                foreach (var file in files)
                {
                    if (file.ContentType.StartsWith("image/"))
                    {
                        try
                        {
                            // 只保存到文件系统
                            var subFolder = $"equipment_{equipmentType}";
                            var storageResult = await _fileStorageService.SaveFileAsync(file, "equipment", subFolder);
                            Console.WriteLine($"[ImageController] 文件已保存到文件系统: {storageResult.RelativePath}");

                            // 保存到数据库（只存储路径信息，不存储二进制数据）
                            var image = new EquipmentImage
                            {
                                EquipmentId = equipmentId,
                                EquipmentType = equipmentType,
                                ImagePath = storageResult.RelativePath, // 使用文件系统的相对路径
                                ImageName = storageResult.FileName,
                                OrderIndex = orderIndex++,
                                ContentType = storageResult.ContentType,
                                CreatedAt = DateTime.Now
                            };

                            if (_context.EquipmentImages != null)
                            {
                                _context.EquipmentImages.Add(image);
                                await _context.SaveChangesAsync();
                                imageIds.Add(image.Id);
                                Console.WriteLine($"[ImageController] 图片记录已保存到数据库，ID: {image.Id}");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[ImageController] 处理文件 {file.FileName} 时出错: {ex.Message}");
                            // 继续处理其他文件
                            continue;
                        }
                    }
                }

                // 记录返回的图片ID数量
                Console.WriteLine($"[ImageController] 返回的图片ID数量: {imageIds.Count}");
                foreach (var id in imageIds)
                {
                    Console.WriteLine($"[ImageController] 图片ID: {id}");
                }
                
                return Ok(imageIds);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[ImageController] 上传图片时出错: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // 上传出入库图片
        [HttpPost("in-outbound")]
        public async Task<ActionResult<List<int>>> UploadInOutboundImages()
        {
            try
            {
                // 从请求中获取所有表单数据
                var form = await Request.ReadFormAsync();
                
                // 获取文件
                var files = form.Files;
                
                // 检查是否接收到文件
                if (files == null || files.Count == 0)
                {
                    return BadRequest(new { message = "没有接收到文件" });
                }
                
                // 获取其他参数
                if (!int.TryParse(form["orderId"], out int orderId))
                {
                    return BadRequest(new { message = "缺少orderId参数" });
                }
                
                if (!int.TryParse(form["orderType"], out int orderType))
                {
                    return BadRequest(new { message = "缺少orderType参数" });
                }
                
                // 记录日志
                Console.WriteLine($"[ImageController] 接收到文件数量: {files.Count}");
                Console.WriteLine($"[ImageController] orderId: {orderId}");
                Console.WriteLine($"[ImageController] orderType: {orderType}");
                
                var imageIds = new List<int>();
                int orderIndex = 0;

                foreach (var file in files)
                {
                    try
                    {
                        if (file == null || file.Length == 0)
                        {
                            continue;
                        }

                        // 检查文件类型
                        if (!file.ContentType.StartsWith("image/"))
                        {
                            continue;
                        }

                        // 只保存到文件系统
                        var subFolder = $"order_{orderType}";
                        var storageResult = await _fileStorageService.SaveFileAsync(file, "inoutbound", subFolder);
                        Console.WriteLine($"[ImageController] 文件已保存到文件系统: {storageResult.RelativePath}");

                        // 保存到数据库（只存储路径信息，不存储二进制数据）
                        var image = new InOutboundImage
                        {
                            OrderId = orderId,
                            OrderType = orderType,
                            ImagePath = storageResult.RelativePath, // 使用文件系统的相对路径
                            ImageName = storageResult.FileName,
                            OrderIndex = orderIndex++,
                            ContentType = storageResult.ContentType,
                            CreatedAt = DateTime.Now
                        };

                        if (_context.InOutboundImages != null)
                        {
                            _context.InOutboundImages.Add(image);
                            await _context.SaveChangesAsync();
                            imageIds.Add(image.Id);
                            Console.WriteLine($"[ImageController] 图片记录已保存到数据库，ID: {image.Id}");
                        }
                    }
                    catch (Exception ex)
                    {
                        // 记录单个文件处理错误，继续处理其他文件
                        Console.WriteLine($"[ImageController] 处理文件 {file?.FileName} 时出错: {ex.Message}");
                        continue;
                    }
                }
                
                // 记录返回的图片ID数量
                Console.WriteLine($"[ImageController] 返回的图片ID数量: {imageIds.Count}");
                foreach (var id in imageIds)
                {
                    Console.WriteLine($"[ImageController] 图片ID: {id}");
                }
                
                return Ok(imageIds);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[ImageController] 上传图片时出错: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // 获取设备图片列表
        [HttpGet("equipment/{equipmentId}")]
        public ActionResult<List<object>> GetEquipmentImages(int equipmentId, [FromQuery] int equipmentType)
        {
            try
            {
                if (_context.EquipmentImages == null)
                {
                    return Ok(new List<object>());
                }
                var images = _context.EquipmentImages
                    .Where(img => img.EquipmentId == equipmentId && img.EquipmentType == equipmentType)
                    .OrderBy(img => img.OrderIndex)
                    .Select(img => new { img.Id, img.ImagePath, img.ImageName })
                    .ToList();
                return Ok(images);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 获取出入库图片列表
        [HttpGet("in-outbound/{orderId}")]
        public ActionResult<List<object>> GetInOutboundImages(int orderId, [FromQuery] int orderType)
        {
            try
            {
                if (_context.InOutboundImages == null)
                {
                    return Ok(new List<object>());
                }
                var images = _context.InOutboundImages
                    .Where(img => img.OrderId == orderId && img.OrderType == orderType)
                    .OrderBy(img => img.OrderIndex)
                    .Select(img => new { img.Id, img.ImagePath, img.ImageName })
                    .ToList();
                return Ok(images);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 获取图片数据（用于直接显示）
        [HttpGet("data/{imageId}")]
        public async Task<IActionResult> GetImageData(int imageId)
        {
            try
            {
                // 只从文件系统读取
                
                // 1. 先查询数据库获取图片路径
                string? relativePath = null;
                
                // 先从设备图片表查找
                if (_context.EquipmentImages != null)
                {
                    var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
                    if (equipmentImage != null)
                    {
                        relativePath = equipmentImage.ImagePath;
                    }
                }
                
                // 再从出入库图片表查找
                if (relativePath == null && _context.InOutboundImages != null)
                {
                    var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
                    if (inOutboundImage != null)
                    {
                        relativePath = inOutboundImage.ImagePath;
                    }
                }
                
                // 2. 从文件系统读取
                if (!string.IsNullOrEmpty(relativePath))
                {
                    var (fileData, fileContentType) = await _fileStorageService.GetFileAsync(relativePath);
                    if (fileData != null)
                    {
                        Console.WriteLine($"[ImageController] 从文件系统读取图片成功，ID: {imageId}");
                        return File(fileData, fileContentType ?? "image/jpeg");
                    }
                }
                
                return NotFound();
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[ImageController] 获取图片数据时出错: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // 删除设备图片
        [HttpDelete("equipment/{imageId}")]
        public async Task<ActionResult> DeleteEquipmentImage(int imageId)
        {
            try
            {
                // ===== 阶段3：双删模式 =====
                // 1. 先获取图片路径
                string? filePath = null;
                if (_context.EquipmentImages != null)
                {
                    var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
                    if (equipmentImage != null)
                    {
                        filePath = equipmentImage.ImagePath;
                    }
                }
                
                // 2. 删除数据库记录
                var result = await _imageService.DeleteImageAsync(imageId);
                if (result)
                {
                    // 3. 删除文件系统中的文件
                    if (!string.IsNullOrEmpty(filePath))
                    {
                        await _fileStorageService.DeleteFileAsync(filePath);
                        Console.WriteLine($"[ImageController] 设备图片已从文件系统删除，ID: {imageId}, 路径: {filePath}");
                    }
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[ImageController] 删除设备图片时出错: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // 删除出入库图片
        [HttpDelete("in-outbound/{imageId}")]
        public async Task<ActionResult> DeleteInOutboundImage(int imageId)
        {
            try
            {
                // ===== 阶段3：双删模式 =====
                // 1. 先获取图片路径
                string? filePath = null;
                if (_context.InOutboundImages != null)
                {
                    var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
                    if (inOutboundImage != null)
                    {
                        filePath = inOutboundImage.ImagePath;
                    }
                }
                
                // 2. 删除数据库记录
                var result = await _imageService.DeleteImageAsync(imageId);
                if (result)
                {
                    // 3. 删除文件系统中的文件
                    if (!string.IsNullOrEmpty(filePath))
                    {
                        await _fileStorageService.DeleteFileAsync(filePath);
                        Console.WriteLine($"[ImageController] 出入库图片已从文件系统删除，ID: {imageId}, 路径: {filePath}");
                    }
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"[ImageController] 删除出入库图片时出错: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
