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
                
                // 保存图片记录到数据库
                int orderIndex = 0;
                foreach (var path in imagePaths)
                {
                    var image = new EquipmentImage
                    {
                        EquipmentId = equipmentId,
                        EquipmentType = equipmentType,
                        ImagePath = path,
                        ImageName = System.IO.Path.GetFileName(path),
                        OrderIndex = orderIndex++
                    };
                    _context.EquipmentImages.Add(image);
                }
                await _context.SaveChangesAsync();

                return Ok(imagePaths);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 上传出入库图片
        [HttpPost("in-outbound")]
        public async Task<ActionResult<List<string>>> UploadInOutboundImages([FromForm] int orderId, [FromForm] int orderType, IFormFileCollection files)
        {
            try
            {
                var imagePaths = await _imageService.UploadInOutboundImages(files, orderId);
                
                // 保存图片记录到数据库
                int orderIndex = 0;
                foreach (var path in imagePaths)
                {
                    var image = new InOutboundImage
                    {
                        OrderId = orderId,
                        OrderType = orderType,
                        ImagePath = path,
                        ImageName = System.IO.Path.GetFileName(path),
                        OrderIndex = orderIndex++
                    };
                    _context.InOutboundImages.Add(image);
                }
                await _context.SaveChangesAsync();

                return Ok(imagePaths);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 获取设备图片列表
        [HttpGet("equipment/{equipmentId}")]
        public ActionResult<List<string>> GetEquipmentImages(int equipmentId, [FromQuery] int equipmentType)
        {
            try
            {
                var images = _context.EquipmentImages
                    .Where(img => img.EquipmentId == equipmentId && img.EquipmentType == equipmentType)
                    .OrderBy(img => img.OrderIndex)
                    .Select(img => img.ImagePath)
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
        public ActionResult<List<string>> GetInOutboundImages(int orderId, [FromQuery] int orderType)
        {
            try
            {
                var images = _context.InOutboundImages
                    .Where(img => img.OrderId == orderId && img.OrderType == orderType)
                    .OrderBy(img => img.OrderIndex)
                    .Select(img => img.ImagePath)
                    .ToList();
                return Ok(images);
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
                // 查找图片记录
                var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
                if (equipmentImage != null)
                {
                    _imageService.DeleteImage(equipmentImage.ImagePath);
                    _context.EquipmentImages.Remove(equipmentImage);
                    await _context.SaveChangesAsync();
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
                // 查找图片记录
                var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
                if (inOutboundImage != null)
                {
                    _imageService.DeleteImage(inOutboundImage.ImagePath);
                    _context.InOutboundImages.Remove(inOutboundImage);
                    await _context.SaveChangesAsync();
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
