using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Services
{
    public class DeviceService
    {
        private readonly DeviceWarehouseContext _context;

        public DeviceService(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // 专用设备管理
        public async Task<List<SpecialEquipmentDTO>> GetSpecialEquipmentsAsync()
        {
            var equipments = await _context.SpecialEquipments.ToListAsync();
            return equipments.Select(e => new SpecialEquipmentDTO
            {
                Id = e.Id,
                Name = e.DeviceName,
                DeviceCode = e.DeviceCode,
                SerialNumber = e.SerialNumber,
                Brand = e.Brand,
                Model = e.Model,
                Quantity = e.Quantity,
                Unit = e.Unit,
                Accessories = e.Accessories,
                ImageUrl = e.ImageUrl,
                Warehouse = e.Warehouse ?? "主仓库", // 默认为主仓库
                Company = e.Company,
                Status = e.Status,
                UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : "未使用",
                Location = e.Location,
                Description = e.Remark,
                PurchaseDate = e.PurchaseDate?.ToString("yyyy-MM-dd") ?? e.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = e.PurchasePrice ?? 0
            }).ToList();
        }

        public async Task<SpecialEquipmentDTO> GetSpecialEquipmentByIdAsync(int id)
        {
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            return new SpecialEquipmentDTO
            {
                Id = equipment.Id,
                Name = equipment.DeviceName,
                DeviceCode = equipment.DeviceCode,
                SerialNumber = equipment.SerialNumber,
                Brand = equipment.Brand,
                Model = equipment.Model,
                Quantity = equipment.Quantity,
                Unit = equipment.Unit,
                Accessories = equipment.Accessories,
                ImageUrl = equipment.ImageUrl,
                Warehouse = equipment.Warehouse ?? "主仓库", // 默认为主仓库
                Company = equipment.Company,
                Status = equipment.Status,
                UseStatus = equipment.UseStatus == 1 ? "使用中" : equipment.UseStatus == 2 ? "停用" : "未使用",
                Location = equipment.Location,
                Description = equipment.Remark,
                PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = equipment.PurchasePrice ?? 0
            };
        }

        public async Task<SpecialEquipmentDTO> CreateSpecialEquipmentAsync(SpecialEquipmentDTO dto)
        {
            // 处理设备状态
            int deviceStatus = 1; // 默认正常
            if (!string.IsNullOrEmpty(dto.Status))
            {
                switch (dto.Status)
                {
                    case "正常":
                        deviceStatus = 1;
                        break;
                    case "待维修":
                        deviceStatus = 2;
                        break;
                    case "报废":
                        deviceStatus = 3;
                        break;
                }
            }
            
            // 处理购买日期
            DateTime? purchaseDate = null;
            if (!string.IsNullOrEmpty(dto.PurchaseDate))
            {
                if (DateTime.TryParse(dto.PurchaseDate, out DateTime date))
                {
                    purchaseDate = date;
                }
            }
            
            var equipment = new SpecialEquipment
            {
                DeviceName = dto.Name ?? throw new ArgumentNullException(nameof(dto.Name), "设备名称不能为空"),
                DeviceCode = dto.DeviceCode ?? throw new ArgumentNullException(nameof(dto.DeviceCode), "设备编号不能为空"),
                Brand = dto.Brand,
                Model = dto.Model,
                SerialNumber = dto.SerialNumber,
                Quantity = dto.Quantity > 0 ? dto.Quantity : 1,
                Unit = string.IsNullOrEmpty(dto.Unit) ? "台" : dto.Unit,
                Accessories = dto.Accessories,
                ImageUrl = dto.ImageUrl,
                Warehouse = dto.Warehouse,
                Company = dto.Company,
                Status = string.IsNullOrEmpty(dto.Status) ? "正常" : dto.Status,
                UseStatus = 3, // 3表示未使用
                Location = dto.Location,
                Remark = dto.Description,
                PurchaseDate = purchaseDate,
                PurchasePrice = dto.PurchasePrice,
                CreatedAt = DateTime.Now,
                DeviceType = 1, // 1表示专用设备
                SortOrder = 0, // 默认排序
                DeviceStatus = deviceStatus,
                NameSequence = 0 // 默认序列
            };

            _context.SpecialEquipments.Add(equipment);
            await _context.SaveChangesAsync();

            // 更新库存
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.SpecialEquipmentId == equipment.Id);
            
            if (inventory == null)
            {
                // 创建新的库存记录
                inventory = new Inventory
                {
                    SpecialEquipmentId = equipment.Id,
                    CurrentQuantity = equipment.Quantity,
                    AlertMinQuantity = 1,
                    AlertMaxQuantity = 100,
                    LastUpdated = DateTime.Now
                };
                _context.Inventories.Add(inventory);
            } else {
                // 更新现有库存记录
                inventory.CurrentQuantity += equipment.Quantity;
                inventory.LastUpdated = DateTime.Now;
            }
            await _context.SaveChangesAsync();

            dto.Id = equipment.Id;
            dto.Warehouse = equipment.Warehouse ?? "主仓库";
            dto.UseStatus = "未使用";
            dto.PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd");
            dto.PurchasePrice = equipment.PurchasePrice ?? 0;
            return dto;
        }

        public async Task<SpecialEquipmentDTO> UpdateSpecialEquipmentAsync(int id, SpecialEquipmentDTO dto)
        {
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 保存旧数量，用于更新库存
            int oldQuantity = equipment.Quantity;

            equipment.DeviceName = dto.Name;
            equipment.DeviceCode = dto.DeviceCode;
            equipment.Brand = dto.Brand;
            equipment.Model = dto.Model;
            equipment.SerialNumber = dto.SerialNumber;
            equipment.Quantity = dto.Quantity > 0 ? dto.Quantity : 1;
            equipment.Unit = string.IsNullOrEmpty(dto.Unit) ? "台" : dto.Unit;
            equipment.Accessories = dto.Accessories;
            equipment.ImageUrl = dto.ImageUrl;
            equipment.Warehouse = dto.Warehouse;
            equipment.Company = dto.Company;
            equipment.Status = string.IsNullOrEmpty(dto.Status) ? "正常" : dto.Status;
            equipment.UseStatus = dto.UseStatus == "使用中" ? 1 : dto.UseStatus == "停用" ? 2 : 3;
            equipment.Location = dto.Location;
            equipment.Remark = dto.Description;
            equipment.PurchasePrice = dto.PurchasePrice;
            
            // 处理购买日期
            if (!string.IsNullOrEmpty(dto.PurchaseDate))
            {
                if (DateTime.TryParse(dto.PurchaseDate, out DateTime date))
                {
                    equipment.PurchaseDate = date;
                }
            }
            
            equipment.UpdatedAt = DateTime.Now;

            _context.Entry(equipment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // 更新库存
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.SpecialEquipmentId == equipment.Id);
            
            if (inventory != null)
            {
                // 更新库存数量
                inventory.CurrentQuantity = inventory.CurrentQuantity - oldQuantity + equipment.Quantity;
                inventory.LastUpdated = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            dto.Warehouse = equipment.Warehouse ?? "主仓库";
            dto.PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd");
            dto.PurchasePrice = equipment.PurchasePrice ?? 0;
            return dto;
        }

        public async Task DeleteSpecialEquipmentAsync(int id)
        {
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 删除相关的库存记录
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.SpecialEquipmentId == equipment.Id);
            
            if (inventory != null)
            {
                _context.Inventories.Remove(inventory);
            }

            _context.SpecialEquipments.Remove(equipment);
            await _context.SaveChangesAsync();
        }

        public async Task ClearAllSpecialEquipmentsAsync()
        {
            // 获取所有专用设备
            var specialEquipments = await _context.SpecialEquipments.ToListAsync();
            
            // 获取相关的库存记录
            var inventoryIds = specialEquipments.Select(e => (int?)e.Id).ToList();
            var inventories = await _context.Inventories
                .Where(i => i.SpecialEquipmentId != null && inventoryIds.Contains(i.SpecialEquipmentId))
                .ToListAsync();
            
            // 删除库存记录
            _context.Inventories.RemoveRange(inventories);
            
            // 删除专用设备
            _context.SpecialEquipments.RemoveRange(specialEquipments);
            
            await _context.SaveChangesAsync();
        }

        // 通用设备管理
        public async Task<List<GeneralEquipmentDTO>> GetGeneralEquipmentsAsync()
        {
            var equipments = await _context.GeneralEquipments.ToListAsync();
            return equipments.Select(e => new GeneralEquipmentDTO
            {
                Id = e.Id,
                Name = e.DeviceName,
                DeviceCode = e.DeviceCode,
                SerialNumber = e.SerialNumber,
                Brand = e.Brand,
                Model = e.Model,
                Quantity = e.Quantity,
                Unit = e.Unit,
                Accessories = e.Accessories,
                ImageUrl = e.ImageUrl,
                Warehouse = e.Warehouse ?? "主仓库", // 默认为主仓库
                Company = e.Company,
                Status = e.Status,
                UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : "未使用",
                Location = e.Location,
                Description = e.Remark,
                PurchaseDate = e.PurchaseDate?.ToString("yyyy-MM-dd") ?? e.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = e.PurchasePrice ?? 0
            }).ToList();
        }

        public async Task<GeneralEquipmentDTO> GetGeneralEquipmentByIdAsync(int id)
        {
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            return new GeneralEquipmentDTO
            {
                Id = equipment.Id,
                Name = equipment.DeviceName,
                DeviceCode = equipment.DeviceCode,
                SerialNumber = equipment.SerialNumber,
                Brand = equipment.Brand,
                Model = equipment.Model,
                Quantity = equipment.Quantity,
                Unit = equipment.Unit,
                Accessories = equipment.Accessories,
                ImageUrl = equipment.ImageUrl,
                Warehouse = equipment.Warehouse ?? "主仓库", // 默认为主仓库
                Company = equipment.Company,
                Status = equipment.Status,
                UseStatus = equipment.UseStatus == 1 ? "使用中" : equipment.UseStatus == 2 ? "停用" : "未使用",
                Location = equipment.Location,
                Description = equipment.Remark,
                PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = equipment.PurchasePrice ?? 0
            };
        }

        public async Task<GeneralEquipmentDTO> CreateGeneralEquipmentAsync(GeneralEquipmentDTO dto)
        {
            // 处理设备状态
            int deviceStatus = 1; // 默认正常
            if (!string.IsNullOrEmpty(dto.Status))
            {
                switch (dto.Status)
                {
                    case "正常":
                        deviceStatus = 1;
                        break;
                    case "待维修":
                        deviceStatus = 2;
                        break;
                    case "报废":
                        deviceStatus = 3;
                        break;
                }
            }
            
            // 处理购买日期
            DateTime? purchaseDate = null;
            if (!string.IsNullOrEmpty(dto.PurchaseDate))
            {
                if (DateTime.TryParse(dto.PurchaseDate, out DateTime date))
                {
                    purchaseDate = date;
                }
            }
            
            var equipment = new GeneralEquipment
            {
                DeviceName = dto.Name ?? throw new ArgumentNullException(nameof(dto.Name), "设备名称不能为空"),
                DeviceCode = dto.DeviceCode ?? throw new ArgumentNullException(nameof(dto.DeviceCode), "设备编号不能为空"),
                Brand = dto.Brand,
                Model = dto.Model,
                SerialNumber = dto.SerialNumber,
                Quantity = dto.Quantity > 0 ? dto.Quantity : 1,
                Unit = string.IsNullOrEmpty(dto.Unit) ? "台" : dto.Unit,
                Accessories = dto.Accessories,
                ImageUrl = dto.ImageUrl,
                Warehouse = dto.Warehouse,
                Company = dto.Company,
                Status = string.IsNullOrEmpty(dto.Status) ? "正常" : dto.Status,
                UseStatus = 3, // 3表示未使用
                Location = dto.Location,
                Remark = dto.Description,
                PurchaseDate = purchaseDate,
                PurchasePrice = dto.PurchasePrice,
                CreatedAt = DateTime.Now,
                DeviceType = 2, // 2表示通用设备
                SortOrder = 0, // 默认排序
                DeviceStatus = deviceStatus,
                NameSequence = 0 // 默认序列
            };

            _context.GeneralEquipments.Add(equipment);
            await _context.SaveChangesAsync();

            // 更新库存
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.GeneralEquipmentId == equipment.Id);
            
            if (inventory == null)
            {
                // 创建新的库存记录
                inventory = new Inventory
                {
                    GeneralEquipmentId = equipment.Id,
                    CurrentQuantity = equipment.Quantity,
                    AlertMinQuantity = 1,
                    AlertMaxQuantity = 100,
                    LastUpdated = DateTime.Now
                };
                _context.Inventories.Add(inventory);
            } else {
                // 更新现有库存记录
                inventory.CurrentQuantity += equipment.Quantity;
                inventory.LastUpdated = DateTime.Now;
            }
            await _context.SaveChangesAsync();

            dto.Id = equipment.Id;
            dto.Warehouse = equipment.Warehouse ?? "主仓库";
            dto.UseStatus = "未使用";
            dto.PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd");
            dto.PurchasePrice = equipment.PurchasePrice ?? 0;
            return dto;
        }

        public async Task<GeneralEquipmentDTO> UpdateGeneralEquipmentAsync(int id, GeneralEquipmentDTO dto)
        {
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 保存旧数量，用于更新库存
            int oldQuantity = equipment.Quantity;

            equipment.DeviceName = dto.Name;
            equipment.DeviceCode = dto.DeviceCode;
            equipment.Brand = dto.Brand;
            equipment.Model = dto.Model;
            equipment.SerialNumber = dto.SerialNumber;
            equipment.Quantity = dto.Quantity > 0 ? dto.Quantity : 1;
            equipment.Unit = string.IsNullOrEmpty(dto.Unit) ? "台" : dto.Unit;
            equipment.Accessories = dto.Accessories;
            equipment.ImageUrl = dto.ImageUrl;
            equipment.Warehouse = dto.Warehouse;
            equipment.Company = dto.Company;
            equipment.Status = string.IsNullOrEmpty(dto.Status) ? "正常" : dto.Status;
            equipment.UseStatus = dto.UseStatus == "使用中" ? 1 : dto.UseStatus == "停用" ? 2 : 3;
            equipment.Location = dto.Location;
            equipment.Remark = dto.Description;
            equipment.PurchasePrice = dto.PurchasePrice;
            
            // 处理购买日期
            if (!string.IsNullOrEmpty(dto.PurchaseDate))
            {
                if (DateTime.TryParse(dto.PurchaseDate, out DateTime date))
                {
                    equipment.PurchaseDate = date;
                }
            }
            
            equipment.UpdatedAt = DateTime.Now;

            _context.Entry(equipment).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // 更新库存
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.GeneralEquipmentId == equipment.Id);
            
            if (inventory != null)
            {
                // 更新库存数量
                inventory.CurrentQuantity = inventory.CurrentQuantity - oldQuantity + equipment.Quantity;
                inventory.LastUpdated = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            dto.Warehouse = equipment.Warehouse ?? "主仓库";
            dto.PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd");
            dto.PurchasePrice = equipment.PurchasePrice ?? 0;
            return dto;
        }

        public async Task DeleteGeneralEquipmentAsync(int id)
        {
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 删除相关的库存记录
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.GeneralEquipmentId == equipment.Id);
            
            if (inventory != null)
            {
                _context.Inventories.Remove(inventory);
            }

            _context.GeneralEquipments.Remove(equipment);
            await _context.SaveChangesAsync();
        }

        public async Task ClearAllGeneralEquipmentsAsync()
        {
            // 获取所有通用设备
            var generalEquipments = await _context.GeneralEquipments.ToListAsync();
            
            // 获取相关的库存记录
            var inventoryIds = generalEquipments.Select(e => (int?)e.Id).ToList();
            var inventories = await _context.Inventories
                .Where(i => i.GeneralEquipmentId != null && inventoryIds.Contains(i.GeneralEquipmentId))
                .ToListAsync();
            
            // 删除库存记录
            _context.Inventories.RemoveRange(inventories);
            
            // 删除通用设备
            _context.GeneralEquipments.RemoveRange(generalEquipments);
            
            await _context.SaveChangesAsync();
        }

        // 待维修设备管理
        public async Task<List<RepairEquipmentDTO>> GetRepairEquipmentsAsync()
        {
            // 从专用设备和通用设备中筛选出待维修状态的设备
            var specialEquipments = await _context.SpecialEquipments
                .Where(e => e.RepairStatus == 1) // 假设1表示待维修
                .ToListAsync();

            var generalEquipments = await _context.GeneralEquipments
                .Where(e => e.RepairStatus == 1) // 假设1表示待维修
                .ToListAsync();

            var repairEquipments = new List<RepairEquipmentDTO>();

            foreach (var equipment in specialEquipments)
            {
                repairEquipments.Add(new RepairEquipmentDTO
                {
                    Id = equipment.Id,
                    EquipmentId = equipment.Id,
                    EquipmentName = equipment.DeviceName,
                    ProblemDescription = equipment.FaultReason,
                    RepairDate = equipment.RepairDate ?? DateTime.Now,
                    RepairStatus = equipment.RepairStatus.ToString(),
                    RepairResult = ""
                });
            }

            foreach (var equipment in generalEquipments)
            {
                repairEquipments.Add(new RepairEquipmentDTO
                {
                    Id = equipment.Id,
                    EquipmentId = equipment.Id,
                    EquipmentName = equipment.DeviceName,
                    ProblemDescription = equipment.FaultReason,
                    RepairDate = equipment.RepairDate ?? DateTime.Now,
                    RepairStatus = equipment.RepairStatus.ToString(),
                    RepairResult = ""
                });
            }

            return repairEquipments;
        }

        // 报废设备管理
        public async Task<List<ScrapEquipmentDTO>> GetScrapEquipmentsAsync()
        {
            var equipments = await _context.ScrapEquipments.ToListAsync();
            return equipments.Select(e => new ScrapEquipmentDTO
            {
                Id = e.Id,
                EquipmentId = e.SpecialEquipmentId ?? e.GeneralEquipmentId ?? 0,
                EquipmentName = e.SpecialEquipment?.DeviceName ?? e.GeneralEquipment?.DeviceName ?? "",
                ScrapReason = e.Remark,
                ScrapDate = e.ScrapDate,
                ScrapStatus = "已报废"
            }).ToList();
        }

        public async Task<ScrapEquipmentDTO> CreateScrapEquipmentAsync(ScrapEquipmentDTO dto)
        {
            // 查找原设备（专用设备或通用设备）
            var specialEquipment = await _context.SpecialEquipments.FindAsync(dto.EquipmentId);
            var generalEquipment = await _context.GeneralEquipments.FindAsync(dto.EquipmentId);

            if (specialEquipment == null && generalEquipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 创建报废设备记录
            var scrapEquipment = new ScrapEquipment
            {
                SpecialEquipmentId = specialEquipment?.Id,
                GeneralEquipmentId = generalEquipment?.Id,
                DeviceName = specialEquipment?.DeviceName ?? generalEquipment?.DeviceName ?? "",
                DeviceCode = specialEquipment?.DeviceCode ?? generalEquipment?.DeviceCode ?? "",
                Brand = specialEquipment?.Brand ?? generalEquipment?.Brand,
                Model = specialEquipment?.Model ?? generalEquipment?.Model,
                SerialNumber = specialEquipment?.SerialNumber ?? generalEquipment?.SerialNumber,
                Specification = specialEquipment?.Specification ?? generalEquipment?.Specification,
                Quantity = specialEquipment?.Quantity ?? generalEquipment?.Quantity ?? 1,
                Unit = specialEquipment?.Unit ?? generalEquipment?.Unit,
                ImageUrl = specialEquipment?.ImageUrl ?? generalEquipment?.ImageUrl,
                DeviceType = specialEquipment != null ? 1 : 2, // 1=专用设备, 2=通用设备
                Location = specialEquipment?.Location ?? generalEquipment?.Location,
                Company = specialEquipment?.Company ?? generalEquipment?.Company,
                Accessories = specialEquipment?.Accessories ?? generalEquipment?.Accessories,
                ScrapReason = dto.ScrapReason,
                ScrapDate = dto.ScrapDate,
                ScrappedBy = "系统", // 可根据实际用户信息修改
                Remark = dto.ScrapReason,
                CreatedAt = DateTime.Now
            };

            _context.ScrapEquipments.Add(scrapEquipment);
            await _context.SaveChangesAsync();

            dto.Id = scrapEquipment.Id;
            dto.EquipmentName = scrapEquipment.DeviceName;
            dto.ScrapStatus = "已报废";
            return dto;
        }

        public async Task<ScrapEquipmentDTO> GetScrapEquipmentByIdAsync(int id)
        {
            var equipment = await _context.ScrapEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("报废设备不存在");
            }

            return new ScrapEquipmentDTO
            {
                Id = equipment.Id,
                EquipmentId = equipment.SpecialEquipmentId ?? equipment.GeneralEquipmentId ?? 0,
                EquipmentName = equipment.SpecialEquipment?.DeviceName ?? equipment.GeneralEquipment?.DeviceName ?? "",
                ScrapReason = equipment.Remark,
                ScrapDate = equipment.ScrapDate,
                ScrapStatus = "已报废"
            };
        }

        public async Task DeleteScrapEquipmentAsync(int id)
        {
            var equipment = await _context.ScrapEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("报废设备不存在");
            }

            _context.ScrapEquipments.Remove(equipment);
            await _context.SaveChangesAsync();
        }

        // 从库存表获取专用设备（用于出库单选择）- 按设备名称、品牌、型号汇总，只包含正常未使用设备
        public async Task<List<InventoryDeviceDTO>> GetSpecialInventoryDevicesAsync()
        {
            var inventories = await _context.Inventories
                .Include(i => i.SpecialEquipment)
                .Where(i => i.SpecialEquipmentId != null && i.SpecialEquipment != null && 
                            i.SpecialEquipment.DeviceStatus == 1 && // 1表示正常
                            i.SpecialEquipment.UseStatus == 3) // 3表示未使用
                .ToListAsync();

            // 按设备名称、品牌、型号分组汇总
            var groupedDevices = inventories
                .GroupBy(i => new 
                { 
                    i.SpecialEquipment!.DeviceName, 
                    i.SpecialEquipment.Brand, 
                    i.SpecialEquipment.Model 
                })
                .Select((g, index) => new InventoryDeviceDTO
                {
                    Id = index + 1,
                    EquipmentId = g.First().SpecialEquipmentId,
                    Name = g.Key.DeviceName ?? "未知设备",
                    Brand = g.Key.Brand,
                    Model = g.Key.Model,
                    Specification = g.First().SpecialEquipment?.Specification,
                    InventoryQuantity = g.Sum(i => i.CurrentQuantity),
                    Unit = g.First().SpecialEquipment?.Unit,
                    Warehouse = g.First().SpecialEquipment?.Warehouse ?? "主仓库"
                })
                .ToList();

            return groupedDevices;
        }

        // 从库存表获取通用设备（用于出库单选择）- 按设备名称、品牌、型号汇总，只包含正常未使用设备
        public async Task<List<InventoryDeviceDTO>> GetGeneralInventoryDevicesAsync()
        {
            var inventories = await _context.Inventories
                .Include(i => i.GeneralEquipment)
                .Where(i => i.GeneralEquipmentId != null && i.GeneralEquipment != null && 
                            i.GeneralEquipment.DeviceStatus == 1 && // 1表示正常
                            i.GeneralEquipment.UseStatus == 3) // 3表示未使用
                .ToListAsync();

            // 按设备名称、品牌、型号分组汇总
            var groupedDevices = inventories
                .GroupBy(i => new 
                { 
                    i.GeneralEquipment!.DeviceName, 
                    i.GeneralEquipment.Brand, 
                    i.GeneralEquipment.Model 
                })
                .Select((g, index) => new InventoryDeviceDTO
                {
                    Id = index + 1,
                    EquipmentId = g.First().GeneralEquipmentId,
                    Name = g.Key.DeviceName ?? "未知设备",
                    Brand = g.Key.Brand,
                    Model = g.Key.Model,
                    Specification = g.First().GeneralEquipment?.Specification,
                    InventoryQuantity = g.Sum(i => i.CurrentQuantity),
                    Unit = g.First().GeneralEquipment?.Unit,
                    Warehouse = g.First().GeneralEquipment?.Warehouse ?? "主仓库"
                })
                .ToList();

            return groupedDevices;
        }

        // 获取专用设备详细清单（用于出库单选择）
        public async Task<List<SpecialEquipmentDTO>> GetSpecialEquipmentDetailsAsync(string deviceName, string? brand = null)
        {
            var query = _context.SpecialEquipments
                .Where(e => e.DeviceName == deviceName && 
                            e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 3); // 3表示未使用

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(e => e.Brand == brand);
            }

            var equipments = await query.ToListAsync();
            return equipments.Select(e => new SpecialEquipmentDTO
            {
                Id = e.Id,
                Name = e.DeviceName,
                DeviceCode = e.DeviceCode,
                SerialNumber = e.SerialNumber,
                Brand = e.Brand,
                Model = e.Model,
                Quantity = e.Quantity,
                Unit = e.Unit,
                Accessories = e.Accessories,
                ImageUrl = e.ImageUrl,
                Warehouse = e.Warehouse ?? "主仓库",
                Company = e.Company,
                Status = e.Status,
                UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : "未使用",
                Location = e.Location,
                Description = e.Remark,
                PurchaseDate = e.PurchaseDate?.ToString("yyyy-MM-dd") ?? e.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = e.PurchasePrice ?? 0
            }).ToList();
        }

        // 获取通用设备详细清单（用于出库单选择）
        public async Task<List<GeneralEquipmentDTO>> GetGeneralEquipmentDetailsAsync(string deviceName, string? brand = null)
        {
            var query = _context.GeneralEquipments
                .Where(e => e.DeviceName == deviceName && 
                            e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 3); // 3表示未使用

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(e => e.Brand == brand);
            }

            var equipments = await query.ToListAsync();
            return equipments.Select(e => new GeneralEquipmentDTO
            {
                Id = e.Id,
                Name = e.DeviceName,
                DeviceCode = e.DeviceCode,
                SerialNumber = e.SerialNumber,
                Brand = e.Brand,
                Model = e.Model,
                Quantity = e.Quantity,
                Unit = e.Unit,
                Accessories = e.Accessories,
                ImageUrl = e.ImageUrl,
                Warehouse = e.Warehouse ?? "主仓库",
                Company = e.Company,
                Status = e.Status,
                UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : "未使用",
                Location = e.Location,
                Description = e.Remark,
                PurchaseDate = e.PurchaseDate?.ToString("yyyy-MM-dd") ?? e.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = e.PurchasePrice ?? 0
            }).ToList();
        }
    }
}