using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Services
{
    public class ImageService
    {
        private readonly string _imageRootPath;
        private readonly string _equipmentImagePath;
        private readonly string _inOutboundImagePath;

        public ImageService(IWebHostEnvironment environment)
        {
            _imageRootPath = Path.Combine(environment.WebRootPath, "uploads");
            _equipmentImagePath = Path.Combine(_imageRootPath, "equipment");
            _inOutboundImagePath = Path.Combine(_imageRootPath, "inoutbound");

            // 确保目录存在
            if (!Directory.Exists(_imageRootPath))
            {
                Directory.CreateDirectory(_imageRootPath);
            }
            if (!Directory.Exists(_equipmentImagePath))
            {
                Directory.CreateDirectory(_equipmentImagePath);
            }
            if (!Directory.Exists(_inOutboundImagePath))
            {
                Directory.CreateDirectory(_inOutboundImagePath);
            }
        }

        /// <summary>
        /// 上传设备图片
        /// </summary>
        public async Task<List<string>> UploadEquipmentImages(IFormFileCollection files, int equipmentId)
        {
            var imagePaths = new List<string>();
            var equipmentFolder = Path.Combine(_equipmentImagePath, equipmentId.ToString());

            if (!Directory.Exists(equipmentFolder))
            {
                Directory.CreateDirectory(equipmentFolder);
            }

            foreach (var file in files)
            {
                if (file.ContentType.StartsWith("image/"))
                {
                    var fileName = $"{System.Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                    var filePath = Path.Combine(equipmentFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var relativePath = Path.Combine("uploads", "equipment", equipmentId.ToString(), fileName).Replace("\\", "/");
                    imagePaths.Add(relativePath);
                }
            }

            return imagePaths;
        }

        /// <summary>
        /// 上传出入库图片
        /// </summary>
        public async Task<List<string>> UploadInOutboundImages(IFormFileCollection files, int orderId)
        {
            var imagePaths = new List<string>();
            var orderFolder = Path.Combine(_inOutboundImagePath, orderId.ToString());

            if (!Directory.Exists(orderFolder))
            {
                Directory.CreateDirectory(orderFolder);
            }

            foreach (var file in files)
            {
                if (file.ContentType.StartsWith("image/"))
                {
                    var fileName = $"{System.Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                    var filePath = Path.Combine(orderFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var relativePath = Path.Combine("uploads", "inoutbound", orderId.ToString(), fileName).Replace("\\", "/");
                    imagePaths.Add(relativePath);
                }
            }

            return imagePaths;
        }

        /// <summary>
        /// 删除图片
        /// </summary>
        public void DeleteImage(string relativePath)
        {
            var fullPath = Path.Combine(_imageRootPath, relativePath.Replace("uploads/", "").Replace("/", "\\"));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}
