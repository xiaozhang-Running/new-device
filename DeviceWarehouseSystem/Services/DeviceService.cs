using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Services
{
    public class DeviceService
    {
        private readonly DeviceWarehouseContext _context;
        private readonly ConcurrentDictionary<string, (object data, DateTime expiration)> _cache = new ConcurrentDictionary<string, (object data, DateTime expiration)>();
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

        public DeviceService(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // 缓存辅助方法
        private T GetFromCache<T>(string key)
        {
            if (_cache.TryGetValue(key, out var cached))
            {
                if (cached.expiration > DateTime.Now)
                {
                    return (T)cached.data;
                }
                _cache.TryRemove(key, out _);
            }
            return default;
        }

        private void SetCache<T>(string key, T data)
        {
            _cache[key] = (data, DateTime.Now.Add(_cacheExpiration));
        }

        private void ClearCache(string pattern)
        {
            var keysToRemove = _cache.Keys.Where(k => k.Contains(pattern)).ToList();
            foreach (var key in keysToRemove)
            {
                _cache.TryRemove(key, out _);
            }
        }

        // 专用设备管理
        public async Task<List<SpecialEquipmentDTO>> GetSpecialEquipmentsAsync()
        {
            const string cacheKey = "special_equipments";
            
            // 尝试从缓存获取
            var cached = GetFromCache<List<SpecialEquipmentDTO>>(cacheKey);
            if (cached != null)
            {
                return cached;
            }
            
            if (_context.SpecialEquipments == null)
            {
                return new List<SpecialEquipmentDTO>();
            }
            var equipments = await _context.SpecialEquipments
                .Select(e => new SpecialEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库", // 默认为主仓库
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    ProjectName = e.ProjectName ?? "",
                    ProjectTime = e.ProjectTime,
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate != null ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();
            
            // 缓存结果
            SetCache(cacheKey, equipments);
            return equipments;
        }

        /// <summary>
        /// 获取分页的专用设备列表
        /// </summary>
        public async Task<PagedResult<SpecialEquipmentDTO>> GetPagedSpecialEquipmentsAsync(PaginationParams parameters)
        {
            if (_context.SpecialEquipments == null)
            {
                return new PagedResult<SpecialEquipmentDTO>
                {
                    Items = new List<SpecialEquipmentDTO>(),
                    TotalCount = 0,
                    PageNumber = parameters.PageNumber,
                    PageSize = parameters.PageSize
                };
            }
            var query = _context.SpecialEquipments.AsQueryable();

            // 应用搜索过滤
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var search = parameters.Search.ToLower();
                query = query.Where(e =>
                    (e.DeviceName != null && e.DeviceName.ToLower().Contains(search)) ||
                    (e.Brand != null && e.Brand.ToLower().Contains(search)) ||
                    (e.Model != null && e.Model.ToLower().Contains(search)) ||
                    (e.DeviceCode != null && e.DeviceCode.ToLower().Contains(search)));
            }

            // 获取总数
            var totalCount = await query.CountAsync();

            // 应用排序
            query = parameters.SortBy?.ToLower() switch
            {
                "name" => parameters.SortDesc ? query.OrderByDescending(e => e.DeviceName) : query.OrderBy(e => e.DeviceName),
                "brand" => parameters.SortDesc ? query.OrderByDescending(e => e.Brand) : query.OrderBy(e => e.Brand),
                "model" => parameters.SortDesc ? query.OrderByDescending(e => e.Model) : query.OrderBy(e => e.Model),
                "quantity" => parameters.SortDesc ? query.OrderByDescending(e => e.Quantity) : query.OrderBy(e => e.Quantity),
                "purchasedate" => parameters.SortDesc ? query.OrderByDescending(e => e.PurchaseDate) : query.OrderBy(e => e.PurchaseDate),
                _ => query.OrderByDescending(e => e.CreatedAt) // 默认按创建时间降序
            };

            // 应用分页
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .Select(e => new SpecialEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库",
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    ProjectName = e.ProjectName ?? "",
                    ProjectTime = e.ProjectTime,
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate.HasValue ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();

            return new PagedResult<SpecialEquipmentDTO>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize
            };
        }

        public async Task<SpecialEquipmentDTO> GetSpecialEquipmentByIdAsync(int id)
        {
            if (_context.SpecialEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            return new SpecialEquipmentDTO
            {
                Id = equipment.Id,
                Name = equipment.DeviceName ?? "",
                DeviceCode = equipment.DeviceCode ?? "",
                SerialNumber = equipment.SerialNumber ?? "",
                Brand = equipment.Brand ?? "",
                Model = equipment.Model ?? "",
                Quantity = equipment.Quantity,
                Unit = equipment.Unit ?? "",
                Accessories = equipment.Accessories ?? "",
                ImageUrl = equipment.ImageUrl ?? "",
                Warehouse = equipment.Warehouse ?? "主仓库", // 默认为主仓库
                Company = equipment.Company ?? "",
                Status = equipment.Status ?? "",
                UseStatus = equipment.UseStatus == 1 ? "使用中" : "未使用",
                ProjectName = equipment.ProjectName ?? "",
                ProjectTime = equipment.ProjectTime,
                Location = equipment.Location ?? "",
                Description = equipment.Remark ?? "",
                PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = equipment.PurchasePrice ?? 0
            };
        }

        public async Task<SpecialEquipmentDTO> CreateSpecialEquipmentAsync(SpecialEquipmentDTO dto)
        {
            // 处理设备状态
            DeviceStatus deviceStatus = DeviceStatus.Normal; // 默认正常
            if (!string.IsNullOrEmpty(dto.Status))
            {
                switch (dto.Status)
                {
                    case "正常":
                        deviceStatus = DeviceStatus.Normal;
                        break;
                    case "待维修":
                        deviceStatus = DeviceStatus.PendingRepair;
                        break;
                    case "报废":
                        deviceStatus = DeviceStatus.Scrap;
                        break;
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
                UseStatus = (int)UseStatus.Unused, // 未使用
                Remark = dto.Description,
                CreatedAt = DateTime.Now,
                DeviceType = 1, // 1表示专用设备
                SortOrder = 0, // 默认排序
                DeviceStatus = (int)deviceStatus,
                NameSequence = 0 // 默认序列
            };

            // 使用执行策略确保事务一致性
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () => {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    if (_context.SpecialEquipments != null)
                    {
                        _context.SpecialEquipments.Add(equipment);
                        await _context.SaveChangesAsync();

                        // 更新库存
                        if (_context.Inventories != null)
                        {
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
                        }
                    }

                    await transaction.CommitAsync();

                    dto.Id = equipment.Id;
                    dto.Warehouse = equipment.Warehouse ?? "主仓库";
                    dto.UseStatus = "未使用";
                    dto.PurchaseDate = equipment.PurchaseDate != null ? equipment.PurchaseDate.Value.ToString("yyyy-MM-dd") : equipment.CreatedAt.ToString("yyyy-MM-dd");
                    dto.PurchasePrice = equipment.PurchasePrice ?? 0;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception("创建设备失败: " + ex.Message, ex);
                }
            });

            return dto;
        }

        public async Task<SpecialEquipmentDTO> UpdateSpecialEquipmentAsync(int id, SpecialEquipmentDTO dto)
        {
            if (_context.SpecialEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 保存旧数量，用于更新库存
            int oldQuantity = equipment.Quantity;

            // 检查设备编号是否被其他设备使用
            if (dto.DeviceCode != equipment.DeviceCode)
            {
                var existingEquipment = await _context.SpecialEquipments.FirstOrDefaultAsync(e => e.DeviceCode == dto.DeviceCode);
                if (existingEquipment != null)
                {
                    throw new Exception("设备编号已存在，请输入新的设备编号");
                }
            }

            // 使用执行策略确保事务一致性
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                // 使用事务确保数据一致性
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    equipment.DeviceName = dto.Name ?? "";
                    equipment.DeviceCode = dto.DeviceCode ?? "";
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
                    equipment.UseStatus = dto.UseStatus switch
                    {
                        "使用中" => (int)UseStatus.InUse,
                        "停用" => (int)UseStatus.Disabled,
                        "闲置" => (int)UseStatus.Idle,
                        _ => (int)UseStatus.Unused
                    };
                    equipment.Remark = dto.Description;
                    
                    equipment.UpdatedAt = DateTime.Now;

                    _context.Entry(equipment).State = EntityState.Modified;
                    await _context.SaveChangesAsync();

                    // 更新库存
                    if (_context.Inventories != null)
                    {
                        var inventory = await _context.Inventories
                            .FirstOrDefaultAsync(i => i.SpecialEquipmentId == equipment.Id);
                        
                        if (inventory != null)
                        {
                            // 更新库存数量
                            inventory.CurrentQuantity = inventory.CurrentQuantity - oldQuantity + equipment.Quantity;
                            inventory.LastUpdated = DateTime.Now;
                            await _context.SaveChangesAsync();
                        }
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception("更新设备失败: " + ex.Message, ex);
                }
            });

            dto.Warehouse = equipment.Warehouse ?? "主仓库";
            dto.ImageUrl = equipment.ImageUrl;

            // 清除相关缓存
            ClearCache("special_equipments");
            ClearCache("inventory");

            return dto;
        }

        public async Task DeleteSpecialEquipmentAsync(int id)
        {
            if (_context.SpecialEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.SpecialEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 使用执行策略确保事务一致性
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () => {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // 删除相关的库存记录
                    if (_context.Inventories != null)
                    {
                        var inventory = await _context.Inventories
                            .FirstOrDefaultAsync(i => i.SpecialEquipmentId == equipment.Id);
                        
                        if (inventory != null)
                        {
                            _context.Inventories.Remove(inventory);
                        }
                    }

                    _context.SpecialEquipments.Remove(equipment);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                
                // 清除相关缓存
                ClearCache("general_equipments");
                ClearCache("inventory");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("删除设备失败: " + ex.Message, ex);
            }
        });
        }

        public async Task ClearAllSpecialEquipmentsAsync()
        {
            // 使用执行策略确保事务一致性
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () => {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // 获取所有专用设备
                    if (_context.SpecialEquipments != null && _context.Inventories != null)
                    {
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

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception("清空专用设备失败: " + ex.Message, ex);
                }
            });
        }

        // 通用设备管理
        public async Task<List<GeneralEquipmentDTO>> GetGeneralEquipmentsAsync()
        {
            const string cacheKey = "general_equipments";
            
            // 尝试从缓存获取
            var cached = GetFromCache<List<GeneralEquipmentDTO>>(cacheKey);
            if (cached != null)
            {
                return cached;
            }
            
            if (_context.GeneralEquipments == null)
            {
                return new List<GeneralEquipmentDTO>();
            }
            var equipments = await _context.GeneralEquipments
                .Select(e => new GeneralEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库", // 默认为主仓库
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    ProjectName = e.ProjectName ?? "",
                    ProjectTime = e.ProjectTime,
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate != null ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();
            
            // 缓存结果
            SetCache(cacheKey, equipments);
            return equipments;
        }

        /// <summary>
        /// 获取分页的通用设备列表
        /// </summary>
        public async Task<PagedResult<GeneralEquipmentDTO>> GetPagedGeneralEquipmentsAsync(PaginationParams parameters)
        {
            if (_context.GeneralEquipments == null)
            {
                return new PagedResult<GeneralEquipmentDTO>
                {
                    Items = new List<GeneralEquipmentDTO>(),
                    TotalCount = 0,
                    PageNumber = parameters.PageNumber,
                    PageSize = parameters.PageSize
                };
            }
            var query = _context.GeneralEquipments.AsQueryable();

            // 应用搜索过滤
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var search = parameters.Search.ToLower();
                query = query.Where(e =>
                    (e.DeviceName != null && e.DeviceName.ToLower().Contains(search)) ||
                    (e.Brand != null && e.Brand.ToLower().Contains(search)) ||
                    (e.Model != null && e.Model.ToLower().Contains(search)) ||
                    (e.DeviceCode != null && e.DeviceCode.ToLower().Contains(search)));
            }

            // 获取总数
            var totalCount = await query.CountAsync();

            // 应用排序
            query = parameters.SortBy?.ToLower() switch
            {
                "name" => parameters.SortDesc ? query.OrderByDescending(e => e.DeviceName) : query.OrderBy(e => e.DeviceName),
                "brand" => parameters.SortDesc ? query.OrderByDescending(e => e.Brand) : query.OrderBy(e => e.Brand),
                "model" => parameters.SortDesc ? query.OrderByDescending(e => e.Model) : query.OrderBy(e => e.Model),
                "quantity" => parameters.SortDesc ? query.OrderByDescending(e => e.Quantity) : query.OrderBy(e => e.Quantity),
                "purchasedate" => parameters.SortDesc ? query.OrderByDescending(e => e.PurchaseDate) : query.OrderBy(e => e.PurchaseDate),
                _ => query.OrderByDescending(e => e.CreatedAt) // 默认按创建时间降序
            };

            // 应用分页
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .Select(e => new GeneralEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库",
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    ProjectName = e.ProjectName ?? "",
                    ProjectTime = e.ProjectTime,
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate.HasValue ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();

            return new PagedResult<GeneralEquipmentDTO>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize
            };
        }

        public async Task<GeneralEquipmentDTO> GetGeneralEquipmentByIdAsync(int id)
        {
            if (_context.GeneralEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            return new GeneralEquipmentDTO
            {
                Id = equipment.Id,
                Name = equipment.DeviceName ?? "",
                DeviceCode = equipment.DeviceCode ?? "",
                SerialNumber = equipment.SerialNumber ?? "",
                Brand = equipment.Brand ?? "",
                Model = equipment.Model ?? "",
                Quantity = equipment.Quantity,
                Unit = equipment.Unit ?? "",
                Accessories = equipment.Accessories ?? "",
                ImageUrl = equipment.ImageUrl ?? "",
                Warehouse = equipment.Warehouse ?? "主仓库", // 默认为主仓库
                Company = equipment.Company ?? "",
                Status = equipment.Status ?? "",
                UseStatus = equipment.UseStatus == 1 ? "使用中" : "未使用",
                ProjectName = equipment.ProjectName ?? "",
                ProjectTime = equipment.ProjectTime,
                Location = equipment.Location ?? "",
                Description = equipment.Remark ?? "",
                PurchaseDate = equipment.PurchaseDate?.ToString("yyyy-MM-dd") ?? equipment.CreatedAt.ToString("yyyy-MM-dd"),
                PurchasePrice = equipment.PurchasePrice ?? 0
            };
        }

        public async Task<GeneralEquipmentDTO> CreateGeneralEquipmentAsync(GeneralEquipmentDTO dto)
        {
            // 处理设备状态
            DeviceStatus deviceStatus = DeviceStatus.Normal; // 默认正常
            if (!string.IsNullOrEmpty(dto.Status))
            {
                switch (dto.Status)
                {
                    case "正常":
                        deviceStatus = DeviceStatus.Normal;
                        break;
                    case "待维修":
                        deviceStatus = DeviceStatus.PendingRepair;
                        break;
                    case "报废":
                        deviceStatus = DeviceStatus.Scrap;
                        break;
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
                UseStatus = (int)UseStatus.Unused, // 未使用
                Location = dto.Location,
                Remark = dto.Description,
                PurchaseDate = string.IsNullOrEmpty(dto.PurchaseDate) ? null : DateTime.TryParse(dto.PurchaseDate, out var parsedDate) ? parsedDate : null,
                PurchasePrice = dto.PurchasePrice,
                CreatedAt = DateTime.Now,
                DeviceType = 2, // 2表示通用设备
                SortOrder = 0, // 默认排序
                DeviceStatus = (int)deviceStatus,
                NameSequence = 0 // 默认序列
            };

            // 使用事务确保数据一致性
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (_context.GeneralEquipments != null)
                {
                    _context.GeneralEquipments.Add(equipment);
                    await _context.SaveChangesAsync();

                    // 更新库存
                    if (_context.Inventories != null)
                    {
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
                    }
                }

                await transaction.CommitAsync();

                dto.Id = equipment.Id;
                dto.Warehouse = equipment.Warehouse ?? "主仓库";
                dto.UseStatus = "未使用";
                dto.PurchaseDate = equipment.PurchaseDate != null ? equipment.PurchaseDate.Value.ToString("yyyy-MM-dd") : equipment.CreatedAt.ToString("yyyy-MM-dd");
                dto.PurchasePrice = equipment.PurchasePrice ?? 0;

                // 清除相关缓存
                ClearCache("general_equipments");
                ClearCache("inventory");

                return dto;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("创建设备失败: " + ex.Message, ex);
            }
        }

        public async Task<GeneralEquipmentDTO> UpdateGeneralEquipmentAsync(int id, GeneralEquipmentDTO dto)
        {
            if (_context.GeneralEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 保存旧数量，用于更新库存
            int oldQuantity = equipment.Quantity;

            // 使用执行策略确保事务一致性
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                // 使用事务确保数据一致性
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    equipment.DeviceName = dto.Name ?? "";
                    equipment.DeviceCode = dto.DeviceCode ?? "";
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
                    equipment.UseStatus = dto.UseStatus switch
                    {
                        "使用中" => (int)UseStatus.InUse,
                        "停用" => (int)UseStatus.Disabled,
                        "闲置" => (int)UseStatus.Idle,
                        _ => (int)UseStatus.Unused
                    };
                    equipment.Remark = dto.Description;
                    
                    equipment.UpdatedAt = DateTime.Now;

                    _context.Entry(equipment).State = EntityState.Modified;
                    await _context.SaveChangesAsync();

                    // 更新库存
                    if (_context.Inventories != null)
                    {
                        var inventory = await _context.Inventories
                            .FirstOrDefaultAsync(i => i.GeneralEquipmentId == equipment.Id);
                        
                        if (inventory != null)
                        {
                            // 更新库存数量
                            inventory.CurrentQuantity = inventory.CurrentQuantity - oldQuantity + equipment.Quantity;
                            inventory.LastUpdated = DateTime.Now;
                            await _context.SaveChangesAsync();
                        }
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception("更新设备失败: " + ex.Message, ex);
                }
            });

            dto.Warehouse = equipment.Warehouse ?? "主仓库";

            // 清除相关缓存
            ClearCache("general_equipments");
            ClearCache("inventory");

            return dto;
        }

        public async Task DeleteGeneralEquipmentAsync(int id)
        {
            if (_context.GeneralEquipments == null)
            {
                throw new Exception("设备不存在");
            }
            var equipment = await _context.GeneralEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("设备不存在");
            }

            // 使用事务确保数据一致性
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 删除相关的库存记录
                if (_context.Inventories != null)
                {
                    var inventory = await _context.Inventories
                        .FirstOrDefaultAsync(i => i.GeneralEquipmentId == equipment.Id);
                    
                    if (inventory != null)
                    {
                        _context.Inventories.Remove(inventory);
                    }
                }

                _context.GeneralEquipments.Remove(equipment);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                
                // 清除相关缓存
                ClearCache("general_equipments");
                ClearCache("inventory");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("删除设备失败: " + ex.Message, ex);
            }
        }

        public async Task ClearAllGeneralEquipmentsAsync()
        {
            // 使用事务确保数据一致性
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 获取所有通用设备
                if (_context.GeneralEquipments != null && _context.Inventories != null)
                {
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

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("清空通用设备失败: " + ex.Message, ex);
            }
        }

        // 待维修设备管理
        public async Task<List<RepairEquipmentDTO>> GetRepairEquipmentsAsync()
        {
            var repairEquipments = new List<RepairEquipmentDTO>();
            
            // 从专用设备和通用设备中筛选出待维修状态的设备
            if (_context.SpecialEquipments != null)
            {
                var specialEquipments = await _context.SpecialEquipments
                    .Where(e => e.RepairStatus == (int)RepairStatus.Pending)
                    .ToListAsync();

                foreach (var equipment in specialEquipments)
                {
                    repairEquipments.Add(new RepairEquipmentDTO
                    {
                        Id = equipment.Id,
                        EquipmentId = equipment.Id,
                        EquipmentName = equipment.DeviceName ?? "",
                        ProblemDescription = equipment.FaultReason ?? "",
                        RepairDate = equipment.RepairDate ?? DateTime.Now,
                        RepairStatus = equipment.RepairStatus.ToString(),
                        RepairResult = ""
                    });
                }
            }

            if (_context.GeneralEquipments != null)
            {
                var generalEquipments = await _context.GeneralEquipments
                    .Where(e => e.RepairStatus == (int)RepairStatus.Pending)
                    .ToListAsync();

                foreach (var equipment in generalEquipments)
                {
                    repairEquipments.Add(new RepairEquipmentDTO
                    {
                        Id = equipment.Id,
                        EquipmentId = equipment.Id,
                        EquipmentName = equipment.DeviceName ?? "",
                        ProblemDescription = equipment.FaultReason ?? "",
                        RepairDate = equipment.RepairDate ?? DateTime.Now,
                        RepairStatus = equipment.RepairStatus.ToString(),
                        RepairResult = ""
                    });
                }
            }

            return repairEquipments;
        }

        // 报废设备管理
        public async Task<List<ScrapEquipmentDTO>> GetScrapEquipmentsAsync()
        {
            if (_context.ScrapEquipments == null)
            {
                return new List<ScrapEquipmentDTO>();
            }
            var equipments = await _context.ScrapEquipments.ToListAsync();
            return equipments.Select(e => new ScrapEquipmentDTO
            {
                Id = e.Id,
                EquipmentId = e.SpecialEquipmentId ?? e.GeneralEquipmentId ?? 0,
                EquipmentName = e.DeviceName ?? "",
                DeviceCode = e.DeviceCode ?? "",
                SerialNumber = e.SerialNumber ?? "",
                Brand = e.Brand ?? "",
                Model = e.Model ?? "",
                Quantity = e.Quantity,
                Unit = e.Unit ?? "",
                Accessories = e.Accessories ?? "",
                Warehouse = e.SpecialEquipment?.Warehouse ?? e.GeneralEquipment?.Warehouse ?? "",
                Company = e.Company ?? e.SpecialEquipment?.Company ?? e.GeneralEquipment?.Company ?? "",
                ScrapReason = e.ScrapReason ?? e.Remark ?? "",
                ScrapDate = e.ScrapDate,
                ScrapStatus = "已报废"
            }).ToList();
        }

        public async Task<ScrapEquipmentDTO> CreateScrapEquipmentAsync(ScrapEquipmentDTO dto)
        {
            // 查找原设备（专用设备或通用设备）
            SpecialEquipment? specialEquipment = null;
            GeneralEquipment? generalEquipment = null;
            
            if (_context.SpecialEquipments != null)
            {
                specialEquipment = await _context.SpecialEquipments.FindAsync(dto.EquipmentId);
            }
            
            if (_context.GeneralEquipments != null)
            {
                generalEquipment = await _context.GeneralEquipments.FindAsync(dto.EquipmentId);
            }

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
                ScrapReason = dto.ScrapReason ?? "",
                ScrapDate = dto.ScrapDate,
                ScrappedBy = "系统", // 可根据实际用户信息修改
                Remark = dto.ScrapReason ?? "",
                CreatedAt = DateTime.Now
            };

            if (_context.ScrapEquipments != null)
            {
                _context.ScrapEquipments.Add(scrapEquipment);
                await _context.SaveChangesAsync();
            }

            dto.Id = scrapEquipment.Id;
            dto.EquipmentName = scrapEquipment.DeviceName;
            dto.ScrapStatus = "已报废";
            return dto;
        }

        public async Task<ScrapEquipmentDTO> GetScrapEquipmentByIdAsync(int id)
        {
            if (_context.ScrapEquipments == null)
            {
                throw new Exception("报废设备不存在");
            }
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
                ScrapReason = equipment.Remark ?? "",
                ScrapDate = equipment.ScrapDate,
                ScrapStatus = "已报废"
            };
        }

        public async Task DeleteScrapEquipmentAsync(int id)
        {
            if (_context.ScrapEquipments == null)
            {
                throw new Exception("报废设备不存在");
            }
            var equipment = await _context.ScrapEquipments.FindAsync(id);
            if (equipment == null)
            {
                throw new Exception("报废设备不存在");
            }

            _context.ScrapEquipments.Remove(equipment);
            await _context.SaveChangesAsync();
        }

        // 从设备表获取专用设备（用于出库单选择）- 按设备名称、品牌汇总，只包含正常未使用设备
        public async Task<List<InventoryDeviceDTO>> GetSpecialInventoryDevicesAsync()
        {
            if (_context.SpecialEquipments == null)
            {
                return new List<InventoryDeviceDTO>();
            }
            
            // 使用数据库分组查询，减少内存使用
            var devices = await _context.SpecialEquipments
                .Where(e => e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 0) // 0表示未使用
                .GroupBy(e => new 
                {
                    DeviceName = e.DeviceName,
                    Brand = e.Brand ?? "" // 将null转换为空字符串，确保相同设备名称的设备分到同一组
                })
                .Select(g => new 
                {
                    DeviceName = g.Key.DeviceName,
                    Brand = g.Key.Brand,
                    FirstDevice = g.First(),
                    Count = g.Count()
                })
                .ToListAsync();

            // 转换为DTO
            var result = devices.Select((g, index) => new InventoryDeviceDTO
            {
                Id = index + 1,
                EquipmentId = g.FirstDevice.Id,
                Name = g.DeviceName ?? "未知设备",
                Brand = g.Brand ?? "",
                Model = g.FirstDevice.Model ?? "",
                Specification = g.FirstDevice.Specification ?? "",
                InventoryQuantity = g.Count, // 未使用设备的数量
                Unit = g.FirstDevice.Unit ?? "",
                Warehouse = g.FirstDevice.Warehouse ?? "主仓库"
            }).ToList();

            return result;
        }

        // 从设备表获取通用设备（用于出库单选择）- 按设备名称、品牌汇总，只包含正常未使用设备
        public async Task<List<InventoryDeviceDTO>> GetGeneralInventoryDevicesAsync()
        {
            if (_context.GeneralEquipments == null)
            {
                return new List<InventoryDeviceDTO>();
            }
            
            // 使用数据库分组查询，减少内存使用
            var devices = await _context.GeneralEquipments
                .Where(e => e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 0) // 0表示未使用
                .GroupBy(e => new 
                {
                    DeviceName = e.DeviceName,
                    Brand = e.Brand ?? "" // 将null转换为空字符串，确保相同设备名称的设备分到同一组
                })
                .Select(g => new 
                {
                    DeviceName = g.Key.DeviceName,
                    Brand = g.Key.Brand,
                    FirstDevice = g.First(),
                    Count = g.Count()
                })
                .ToListAsync();

            // 转换为DTO
            var result = devices.Select((g, index) => new InventoryDeviceDTO
            {
                Id = index + 1,
                EquipmentId = g.FirstDevice.Id,
                Name = g.DeviceName ?? "未知设备",
                Brand = g.Brand ?? "",
                Model = g.FirstDevice.Model ?? "",
                Specification = g.FirstDevice.Specification ?? "",
                InventoryQuantity = g.Count, // 未使用设备的数量
                Unit = g.FirstDevice.Unit ?? "",
                Warehouse = g.FirstDevice.Warehouse ?? "主仓库"
            }).ToList();

            return result;
        }

        // 获取专用设备详细清单（用于出库单选择）
        public async Task<List<SpecialEquipmentDTO>> GetSpecialEquipmentDetailsAsync(string deviceName, string? brand = null)
        {
            if (_context.SpecialEquipments == null)
            {
                return new List<SpecialEquipmentDTO>();
            }
            var query = _context.SpecialEquipments
                .Where(e => e.DeviceName == deviceName && 
                            e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 0); // 0表示未使用（与库存查询一致）

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(e => e.Brand == brand);
            }

            return await query
                .Select(e => new SpecialEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库",
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate != null ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();
        }

        // 获取通用设备详细清单（用于出库单选择）
        public async Task<List<GeneralEquipmentDTO>> GetGeneralEquipmentDetailsAsync(string deviceName, string? brand = null)
        {
            if (_context.GeneralEquipments == null)
            {
                return new List<GeneralEquipmentDTO>();
            }
            var query = _context.GeneralEquipments
                .Where(e => e.DeviceName == deviceName && 
                            e.DeviceStatus == 1 && // 1表示正常
                            e.UseStatus == 0); // 0表示未使用（与库存查询一致）

            if (!string.IsNullOrEmpty(brand))
            {
                query = query.Where(e => e.Brand == brand);
            }

            return await query
                .Select(e => new GeneralEquipmentDTO
                {
                    Id = e.Id,
                    Name = e.DeviceName ?? "",
                    DeviceCode = e.DeviceCode ?? "",
                    SerialNumber = e.SerialNumber ?? "",
                    Brand = e.Brand ?? "",
                    Model = e.Model ?? "",
                    Quantity = e.Quantity,
                    Unit = e.Unit ?? "",
                    Accessories = e.Accessories ?? "",
                    ImageUrl = e.ImageUrl ?? "",
                    Warehouse = e.Warehouse ?? "主仓库",
                    Company = e.Company ?? "",
                    Status = e.Status ?? "",
                    UseStatus = e.UseStatus == 1 ? "使用中" : e.UseStatus == 2 ? "停用" : e.UseStatus == 3 ? "闲置" : "未使用",
                    Location = e.Location ?? "",
                    Description = e.Remark ?? "",
                    PurchaseDate = e.PurchaseDate != null ? e.PurchaseDate.Value.ToString("yyyy-MM-dd") : e.CreatedAt.ToString("yyyy-MM-dd"),
                    PurchasePrice = e.PurchasePrice ?? 0
                })
                .ToListAsync();
        }
    }
}