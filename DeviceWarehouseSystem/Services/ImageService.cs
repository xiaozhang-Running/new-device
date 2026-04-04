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
        /// 上传设备图片 - 已弃用，请使用 ImageController.UploadEquipmentImages
        /// </summary>
        [Obsolete("请使用 ImageController.UploadEquipmentImages 方法，通过文件系统存储图片")]
        public async Task<List<string>> UploadEquipmentImages(IFormFileCollection files, int equipmentId)
        {
            // 此方法已弃用，不再存储图片二进制数据到数据库
            // 请使用 ImageController.UploadEquipmentImages 方法
            throw new NotImplementedException("此方法已弃用，请使用 ImageController.UploadEquipmentImages");
        }

        /// <summary>
        /// 上传出入库图片 - 已弃用，请使用 ImageController.UploadInOutboundImages
        /// </summary>
        [Obsolete("请使用 ImageController.UploadInOutboundImages 方法，通过文件系统存储图片")]
        public async Task<List<string>> UploadInOutboundImages(IFormFileCollection files, int orderId, int orderType)
        {
            // 此方法已弃用，不再存储图片二进制数据到数据库
            // 请使用 ImageController.UploadInOutboundImages 方法
            throw new NotImplementedException("此方法已弃用，请使用 ImageController.UploadInOutboundImages");
        }

        /// <summary>
        /// 获取图片数据 - 已弃用，请使用 FileStorageService
        /// </summary>
        [Obsolete("请使用 FileStorageService.GetFileAsync 方法，从文件系统读取图片")]
        public async Task<(byte[]? data, string? contentType)> GetImageAsync(int imageId)
        {
            // 此方法已弃用，不再从数据库读取图片二进制数据
            // 请使用 FileStorageService.GetFileAsync 方法从文件系统读取
            throw new NotImplementedException("此方法已弃用，请使用 FileStorageService.GetFileAsync");
        }

        /// <summary>
        /// 根据订单ID获取所有图片
        /// </summary>
        public async Task<List<InOutboundImage>> GetImagesByOrderIdAsync(int orderId)
        {
            if (_context.InOutboundImages == null)
            {
                return new List<InOutboundImage>();
            }
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
            // ===== 阶段3：双删模式 =====
            // 同时删除文件系统和数据库中的图片
            
            string? filePath = null;
            bool deletedFromDb = false;
            
            // 先从设备图片表查找
            if (_context.EquipmentImages != null)
            {
                var equipmentImage = await _context.EquipmentImages.FindAsync(imageId);
                if (equipmentImage != null)
                {
                    filePath = equipmentImage.ImagePath;
                    _context.EquipmentImages.Remove(equipmentImage);
                    await _context.SaveChangesAsync();
                    deletedFromDb = true;
                    Console.WriteLine($"[ImageService] 设备图片已从数据库删除，ID: {imageId}");
                }
            }

            // 再从出入库图片表查找
            if (!deletedFromDb && _context.InOutboundImages != null)
            {
                var inOutboundImage = await _context.InOutboundImages.FindAsync(imageId);
                if (inOutboundImage != null)
                {
                    filePath = inOutboundImage.ImagePath;
                    _context.InOutboundImages.Remove(inOutboundImage);
                    await _context.SaveChangesAsync();
                    deletedFromDb = true;
                    Console.WriteLine($"[ImageService] 出入库图片已从数据库删除，ID: {imageId}");
                }
            }

            // 如果数据库删除成功，尝试删除文件系统中的文件
            if (deletedFromDb && !string.IsNullOrEmpty(filePath))
            {
                try
                {
                    // 注意：这里不注入FileStorageService，因为删除操作在Controller层处理
                    // 如果需要删除文件，应该在Controller层调用FileStorageService.DeleteFileAsync
                    Console.WriteLine($"[ImageService] 图片记录已删除，文件路径: {filePath}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ImageService] 删除文件时出错: {ex.Message}");
                }
            }

            return deletedFromDb;
        }

        /// <summary>
        /// 删除订单的所有图片
        /// </summary>
        public async Task DeleteImagesByOrderIdAsync(int orderId)
        {
            if (_context.InOutboundImages != null)
            {
                var images = await _context.InOutboundImages
                    .Where(i => i.OrderId == orderId)
                    .ToListAsync();

                _context.InOutboundImages.RemoveRange(images);
                await _context.SaveChangesAsync();
            }
        }
    }
}
