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
        public async Task<ActionResult<List<string>>> UploadEquipmentImages([FromForm] int equipmentId, [FromForm] int equipmentType, IFormFileCollection files)
        {
            try
            {
                var imagePaths = await _imageService.UploadEquipmentImages(files, equipmentId);
                return Ok(imagePaths);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 上传出入库图片
        [HttpPost("in-outbound")]
        public async Task<ActionResult<List<string>>> UploadInOutboundImages()
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
                
                var imagePaths = await _imageService.UploadInOutboundImages(files, orderId, orderType);
                
                // 记录返回的图片路径
                Console.WriteLine($"返回的图片路径数量: {imagePaths.Count}");
                foreach (var path in imagePaths)
                {
                    Console.WriteLine($"图片路径: {path}");
                }
                
                return Ok(imagePaths);
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
