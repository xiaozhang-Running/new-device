using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DeviceWarehouseSystem.Models;

namespace DeviceWarehouseSystem.Services
{
    public class ImageService
    {
        private readonly DeviceWarehouseContext _context;

        public ImageService(DeviceWarehouseContext context)
        {
            _context = context;
        }

        /// <summary>
        /// 上传设备图片 - 保存到数据库
        /// </summary>
        public async Task<List<string>> UploadEquipmentImages(IFormFileCollection files, int equipmentId)
        {
            var imagePaths = new List<string>();
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
                        EquipmentType = 1, // 1表示专用设备
                        ImagePath = relativePath,
                        ImageName = fileName,
                        OrderIndex = orderIndex++,
                        ImageData = imageData,
                        ContentType = file.ContentType,
                        CreatedAt = DateTime.Now
                    };

                    _context.EquipmentImages.Add(image);
                    imagePaths.Add(relativePath);
                }
            }

            await _context.SaveChangesAsync();
            return imagePaths;
        }

        /// <summary>
        /// 上传出入库图片 - 保存到数据库
        /// </summary>
        public async Task<List<string>> UploadInOutboundImages(IFormFileCollection files, int orderId)
        {
            var imagePaths = new List<string>();
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
                    var relativePath = $"/api/images/inoutbound/{orderId}/{fileName}";

                    // 保存到数据库
                    var image = new InOutboundImage
                    {
                        OrderId = orderId,
                        OrderType = 2, // 2表示出入库图片
                        ImagePath = relativePath,
                        ImageName = fileName,
                        OrderIndex = orderIndex++,
                        ImageData = imageData,
                        ContentType = file.ContentType,
                        CreatedAt = DateTime.Now
                    };

                    _context.InOutboundImages.Add(image);
                    imagePaths.Add(relativePath);
                }
            }

            await _context.SaveChangesAsync();
            return imagePaths;
        }

        /// <summary>
        /// 获取图片数据
        /// </summary>
        public async Task<(byte[]? data, string? contentType)> GetImageAsync(int imageId)
        {
            // 先从设备图片表查找
            var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
            if (equipmentImage != null)
            {
                return (equipmentImage.ImageData, equipmentImage.ContentType);
            }

            // 再从出入库图片表查找
            var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
            if (inOutboundImage != null)
            {
                return (inOutboundImage.ImageData, inOutboundImage.ContentType);
            }

            return (null, null);
        }

        /// <summary>
        /// 根据订单ID获取所有图片
        /// </summary>
        public async Task<List<InOutboundImage>> GetImagesByOrderIdAsync(int orderId)
        {
            return await _context.InOutboundImages
                .Where(i => i.OrderId == orderId)
                .OrderBy(i => i.OrderIndex)
                .ToListAsync();
        }

        /// <summary>
        /// 删除图片
        /// </summary>
        public async Task<bool> DeleteImageAsync(int imageId)
        {
            // 先从设备图片表查找
            var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
            if (equipmentImage != null)
            {
                _context.EquipmentImages.Remove(equipmentImage);
                await _context.SaveChangesAsync();
                return true;
            }

            // 再从出入库图片表查找
            var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
            if (inOutboundImage != null)
            {
                _context.InOutboundImages.Remove(inOutboundImage);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        /// <summary>
        /// 删除订单的所有图片
        /// </summary>
        public async Task DeleteImagesByOrderIdAsync(int orderId)
        {
            var images = await _context.InOutboundImages
                .Where(i => i.OrderId == orderId)
                .ToListAsync();

            _context.InOutboundImages.RemoveRange(images);
            await _context.SaveChangesAsync();
        }
    }
}
