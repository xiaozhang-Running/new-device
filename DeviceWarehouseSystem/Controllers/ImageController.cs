using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly ImageService _imageService;
        private readonly DeviceWarehouseContext _context;

        public ImageController(ImageService imageService, DeviceWarehouseContext context)
        {
            _imageService = imageService;
            _context = context;
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
                Console.WriteLine($"接收到文件数量: {files.Count}");
                Console.WriteLine($"equipmentId: {equipmentId}");
                Console.WriteLine($"equipmentType: {equipmentType}");
                
                var imageIds = new List<int>();
                int orderIndex = 0;

                foreach (var file in files)
                {
                    if (file.ContentType.StartsWith("image/"))
                    {
                        // 读取图片二进制数据
                        byte[] imageData;
                        using (var memoryStream = new MemoryStream())
                        {
                            await file.CopyToAsync(memoryStream);
                            imageData = memoryStream.ToArray();
                        }

                        var fileName = $"{System.Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                        var relativePath = $"/api/images/equipment/{equipmentId}/{fileName}";

                        // 保存到数据库
                        var image = new EquipmentImage
                        {
                            EquipmentId = equipmentId,
                            EquipmentType = equipmentType, // 使用传入的equipmentType
                            ImagePath = relativePath,
                            ImageName = fileName,
                            OrderIndex = orderIndex++,
                            ImageData = imageData,
                            ContentType = file.ContentType,
                            CreatedAt = DateTime.Now
                        };

                        if (_context.EquipmentImages != null)
                        {
                            _context.EquipmentImages.Add(image);
                            await _context.SaveChangesAsync();
                            imageIds.Add(image.Id);
                        }
                    }
                }

                // 记录返回的图片ID数量
                Console.WriteLine($"返回的图片ID数量: {imageIds.Count}");
                foreach (var id in imageIds)
                {
                    Console.WriteLine($"图片ID: {id}");
                }
                
                return Ok(imageIds);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"上传图片时出错: {ex.Message}");
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
                Console.WriteLine($"接收到文件数量: {files.Count}");
                Console.WriteLine($"orderId: {orderId}");
                Console.WriteLine($"orderType: {orderType}");
                
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

                        // 读取图片二进制数据
                        byte[] imageData;
                        using (var memoryStream = new MemoryStream())
                        {
                            await file.CopyToAsync(memoryStream);
                            imageData = memoryStream.ToArray();
                        }

                        var fileName = $"{System.Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                        var relativePath = $"/api/images/inoutbound/{orderId}/{fileName}";

                        // 保存到数据库
                        var image = new InOutboundImage
                        {
                            OrderId = orderId,
                            OrderType = orderType, // 使用传入的orderType
                            ImagePath = relativePath,
                            ImageName = fileName,
                            OrderIndex = orderIndex++,
                            ImageData = imageData,
                            ContentType = file.ContentType,
                            CreatedAt = DateTime.Now
                        };

                        if (_context.InOutboundImages != null)
                        {
                            _context.InOutboundImages.Add(image);
                            await _context.SaveChangesAsync();
                            imageIds.Add(image.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        // 记录单个文件处理错误，继续处理其他文件
                        Console.WriteLine($"处理文件 {file?.FileName} 时出错: {ex.Message}");
                        continue;
                    }
                }
                
                // 记录返回的图片ID数量
                Console.WriteLine($"返回的图片ID数量: {imageIds.Count}");
                foreach (var id in imageIds)
                {
                    Console.WriteLine($"图片ID: {id}");
                }
                
                return Ok(imageIds);
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"上传图片时出错: {ex.Message}");
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
                var (data, contentType) = await _imageService.GetImageAsync(imageId);
                if (data == null)
                {
                    return NotFound();
                }
                return File(data, contentType ?? "image/jpeg");
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 删除设备图片
        [HttpDelete("equipment/{imageId}")]
        public async Task<ActionResult> DeleteEquipmentImage(int imageId)
        {
            try
            {
                var result = await _imageService.DeleteImageAsync(imageId);
                if (result)
                {
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 删除出入库图片
        [HttpDelete("in-outbound/{imageId}")]
        public async Task<ActionResult> DeleteInOutboundImage(int imageId)
        {
            try
            {
                var result = await _imageService.DeleteImageAsync(imageId);
                if (result)
                {
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
