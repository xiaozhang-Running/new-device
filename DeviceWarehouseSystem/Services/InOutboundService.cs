using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Services
{
    public class InOutboundService
    {
        private readonly DeviceWarehouseContext _context;

        public InOutboundService(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // 项目出库管理
        public async Task<List<ProjectOutboundDTO>> GetProjectOutboundsAsync()
        {
            var outbounds = await _context.ProjectOutbounds.Include(o => o.ProjectOutboundItems).ToListAsync();
            return outbounds.Select(o => new ProjectOutboundDTO
            {
                Id = o.Id,
                OutboundNumber = o.OutboundNumber,
                ProjectName = o.ProjectName,
                ProjectManager = o.ProjectManager,
                ContactPhone = o.ContactPhone,
                ProjectTime = o.ProjectTime,
                ReturnDate = o.ReturnDate,
                UsageLocation = o.UsageLocation,
                Recipient = o.Recipient,
                Handler = o.Handler,
                WarehouseKeeper = o.WarehouseKeeper,
                Remark = o.Remark,
                IsCompleted = o.IsCompleted,
                CompletedAt = o.CompletedAt,
                Items = o.ProjectOutboundItems.Select(i => new ProjectOutboundItemDTO
                {
                    Id = i.Id,
                    ProjectOutboundId = i.OutboundId,
                    EquipmentId = i.ItemId,
                    EquipmentName = i.ItemName,
                    Brand = i.Brand,
                    Model = i.Model,
                    Quantity = i.Quantity,
                    Unit = i.Unit,
                    Status = i.DeviceStatus
                }).ToList()
            }).ToList();
        }

        public async Task<ProjectOutboundDTO> CreateProjectOutboundAsync(ProjectOutboundDTO dto)
        {
            // 生成出库单号
            var outboundNumber = GenerateOutboundNumber();

            var outbound = new ProjectOutbound
            {
                OutboundNumber = outboundNumber,
                OutboundDate = DateTime.Now,
                ProjectName = dto.ProjectName,
                ProjectManager = dto.ProjectManager,
                ContactPhone = dto.ContactPhone,
                ProjectTime = dto.ProjectTime,
                ReturnDate = dto.ReturnDate,
                UsageLocation = dto.UsageLocation,
                Recipient = dto.Recipient,
                Handler = dto.Handler,
                WarehouseKeeper = dto.WarehouseKeeper,
                Remark = dto.Remark,
                IsCompleted = false,
                CreatedAt = DateTime.Now
            };

            _context.ProjectOutbounds.Add(outbound);
            await _context.SaveChangesAsync();

            // 添加出库明细
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    var outboundItem = new ProjectOutboundItem
                    {
                        OutboundId = outbound.Id,
                        ItemType = 1, // 假设1表示设备
                        ItemId = item.EquipmentId,
                        ItemName = item.EquipmentName,
                        Brand = item.Brand,
                        Model = item.Model,
                        Quantity = item.Quantity,
                        Unit = item.Unit,
                        DeviceStatus = item.Status,
                        CreatedAt = DateTime.Now
                    };
                    _context.ProjectOutboundItems.Add(outboundItem);
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = outbound.Id;
            dto.OutboundNumber = outboundNumber;
            return dto;
        }

        // 原材料出库管理
        public async Task<List<RawMaterialOutboundDTO>> GetRawMaterialOutboundsAsync()
        {
            var outbounds = await _context.RawMaterialOutbounds.Include(o => o.RawMaterialOutboundItems).ToListAsync();
            return outbounds.Select(o => new RawMaterialOutboundDTO
            {
                Id = o.Id,
                OutboundNumber = o.OutboundNumber,
                Recipient = o.Recipient,
                Operator = o.Operator,
                Status = o.Status,
                Remark = o.Remark,
                OutboundDate = o.OutboundDate,
                Items = o.RawMaterialOutboundItems.Select(i => new RawMaterialOutboundItemDTO
                {
                    Id = i.Id,
                    RawMaterialId = i.RawMaterialId,
                    Quantity = i.Quantity,
                    Remark = i.Remark
                }).ToList()
            }).ToList();
        }

        // 项目入库管理
        public async Task<List<ProjectInboundDTO>> GetProjectInboundsAsync()
        {
            var inbounds = await _context.ProjectInbounds.Include(i => i.ProjectInboundItems).ToListAsync();
            return inbounds.Select(i => new ProjectInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                ProjectName = i.ProjectName,
                ProjectManager = i.ProjectManager,
                ContactPhone = i.ContactPhone,
                Handler = i.Handler,
                WarehouseKeeper = i.WarehouseKeeper,
                Remark = i.Remark,
                Status = i.Status,
                Items = i.ProjectInboundItems.Select(item => new ProjectInboundItemDTO
                {
                    Id = item.Id,
                    ProjectInboundId = item.InboundId,
                    EquipmentId = item.ItemId,
                    EquipmentName = item.ItemName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    Status = item.DeviceStatus
                }).ToList()
            }).ToList();
        }



        // 原材料入库管理
        public async Task<List<RawMaterialInboundDTO>> GetRawMaterialInboundsAsync()
        {
            var inbounds = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).ToListAsync();
            return inbounds.Select(i => new RawMaterialInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                Supplier = i.Supplier,
                Handler = i.Operator,
                WarehouseKeeper = i.Operator, // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark,
                Status = i.Status,
                Items = i.RawMaterialInboundItems.Select(item => new RawMaterialInboundItemDTO
                {
                    Id = item.Id,
                    RawMaterialId = item.RawMaterialId,
                    Quantity = item.Quantity,
                    Remark = item.Remark
                }).ToList()
            }).ToList();
        }

        public async Task<RawMaterialInboundDTO> CreateRawMaterialInboundAsync(RawMaterialInboundDTO dto)
        {
            // 生成入库单号
            var inboundNumber = GenerateInboundNumber();

            var inbound = new RawMaterialInbound
            {
                InboundNumber = inboundNumber,
                InboundDate = DateTime.Now,
                Supplier = dto.Supplier,
                Operator = dto.Handler,
                Remark = dto.Remark,
                Status = "待处理",
                CreatedAt = DateTime.Now
            };

            _context.RawMaterialInbounds.Add(inbound);
            await _context.SaveChangesAsync();

            // 添加入库明细
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    int rawMaterialId = item.RawMaterialId;
                    
                    // 处理新原材料的情况
                    if (rawMaterialId <= 0) // 前端可能发送0或负数表示新原材料
                    {
                        // 创建新的原材料记录
                        var newRawMaterial = new RawMaterial
                        {
                            SortOrder = 0,
                            ProductName = "新原材料", // 临时使用默认名称
                            Specification = item.Remark != null && item.Remark.Contains("规格:") ? item.Remark.Split("规格:")[1].Trim() : "", // 尝试从备注中提取规格
                            TotalQuantity = 0,
                            UsedQuantity = 0,
                            RemainingQuantity = 0,
                            Unit = "个", // 临时使用默认单位
                            Supplier = dto.Supplier,
                            CreatedAt = DateTime.Now
                        };
                        
                        _context.RawMaterials.Add(newRawMaterial);
                        await _context.SaveChangesAsync();
                        
                        rawMaterialId = newRawMaterial.Id;
                    }
                    
                    var inboundItem = new RawMaterialInboundItem
                    {
                        InboundId = inbound.Id,
                        RawMaterialId = rawMaterialId,
                        Quantity = item.Quantity,
                        Remark = item.Remark,
                        CreatedAt = DateTime.Now
                    };
                    _context.RawMaterialInboundItems.Add(inboundItem);
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待处理";
            return dto;
        }

        public async Task<RawMaterialInboundDTO> ConfirmRawMaterialInboundAsync(int id)
        {
            var inbound = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 更新原材料库存
            foreach (var item in inbound.RawMaterialInboundItems)
            {
                var rawMaterial = await _context.RawMaterials.FirstOrDefaultAsync(m => m.Id == item.RawMaterialId);
                if (rawMaterial != null)
                {
                    rawMaterial.RemainingQuantity += item.Quantity;
                    rawMaterial.TotalQuantity += item.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            // 返回更新后的入库记录
            return new RawMaterialInboundDTO
            {
                Id = inbound.Id,
                InboundNumber = inbound.InboundNumber,
                Supplier = inbound.Supplier,
                Handler = inbound.Operator,
                WarehouseKeeper = inbound.Operator,
                Remark = inbound.Remark,
                Status = inbound.Status,
                Items = inbound.RawMaterialInboundItems.Select(item => new RawMaterialInboundItemDTO
                {
                    Id = item.Id,
                    RawMaterialId = item.RawMaterialId,
                    Quantity = item.Quantity,
                    Remark = item.Remark
                }).ToList()
            };
        }

        public async Task DeleteRawMaterialInboundAsync(int id)
        {
            var inbound = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 删除入库明细
            _context.RawMaterialInboundItems.RemoveRange(inbound.RawMaterialInboundItems);
            // 删除入库记录
            _context.RawMaterialInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 专用设备采购入库管理
        public async Task<List<SpecialEquipmentPurchaseInboundDTO>> GetSpecialEquipmentPurchaseInboundsAsync()
        {
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new SpecialEquipmentPurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                DeliveryPerson = i.DeliveryPerson,
                Inspector = i.Inspector,
                InboundPerson = i.InboundPerson,
                InboundDate = i.InboundDate,
                Handler = i.Operator,
                WarehouseKeeper = i.Operator, // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark,
                Status = i.Status,
                Items = i.EquipmentInboundItems.Select(item => new SpecialEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0, // 需要根据实际情况设置
                    EquipmentName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            }).ToList();
        }

        public async Task<SpecialEquipmentPurchaseInboundDTO> CreateSpecialEquipmentPurchaseInboundAsync(SpecialEquipmentPurchaseInboundDTO dto)
        {
            try
            {
                Console.WriteLine("开始创建专用设备采购入库单");
                Console.WriteLine($"DTO数据: DeliveryPerson={dto.DeliveryPerson}, Inspector={dto.Inspector}, InboundPerson={dto.InboundPerson}, InboundDate={dto.InboundDate}");
                Console.WriteLine($"Items数量: {dto.Items?.Count ?? 0}");
                
                // 使用前端提供的入库单号，如果没有则生成
                var inboundNumber = dto.InboundNumber ?? GenerateInboundNumber();
                Console.WriteLine($"入库单号: {inboundNumber}");

                var inbound = new EquipmentInbound
                {
                    InboundNumber = inboundNumber,
                    InboundDate = dto.InboundDate,
                    EquipmentType = 1, // 1表示专用设备采购入库
                    DeliveryPerson = dto.DeliveryPerson,
                    Inspector = dto.Inspector,
                    InboundPerson = dto.InboundPerson,
                    Operator = dto.Handler,
                    Remark = dto.Remark,
                    Status = "待确认",
                    CreatedAt = DateTime.Now
                };

                Console.WriteLine("准备保存入库单");
                _context.EquipmentInbounds.Add(inbound);
                await _context.SaveChangesAsync();
                Console.WriteLine($"入库单创建成功，ID: {inbound.Id}");

                // 添加入库明细
                if (dto.Items != null && dto.Items.Count > 0)
                {
                    Console.WriteLine("开始添加入库明细");
                    foreach (var item in dto.Items)
                    {
                        Console.WriteLine($"处理入库明细: EquipmentName={item.EquipmentName}, Brand={item.Brand}, Model={item.Model}, Quantity={item.Quantity}, DeviceCode={item.DeviceCode}");
                        // 使用前端发送的设备编号
                        var deviceCode = item.DeviceCode;
                        Console.WriteLine($"使用的设备编号: {deviceCode}");
                        
                        var inboundItem = new EquipmentInboundItem
                        {
                            InboundId = inbound.Id,
                            DeviceName = item.EquipmentName,
                            DeviceCode = deviceCode,
                            Brand = item.Brand,
                            Model = item.Model,
                            Unit = item.Unit,
                            Quantity = item.Quantity,
                            Status = item.Status,
                            EquipmentType = 1,
                            CreatedAt = DateTime.Now
                        };
                        _context.EquipmentInboundItems.Add(inboundItem);
                    }
                    Console.WriteLine("准备保存入库明细");
                    try
                    {
                        await _context.SaveChangesAsync();
                        Console.WriteLine("入库明细添加成功");
                    }
                    catch (Exception saveError)
                    {
                        Console.WriteLine($"保存入库明细时发生错误: {saveError.Message}");
                        if (saveError.InnerException != null)
                        {
                            Console.WriteLine($"保存错误的内部错误: {saveError.InnerException.Message}");
                            if (saveError.InnerException.InnerException != null)
                            {
                                Console.WriteLine($"保存错误的内部内部错误: {saveError.InnerException.InnerException.Message}");
                            }
                        }
                        throw;
                    }
                }

                dto.Id = inbound.Id;
                dto.InboundNumber = inboundNumber;
                dto.Status = "待确认";
                Console.WriteLine("专用设备采购入库单创建完成");
                return dto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"创建专用设备采购入库单时发生错误: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"内部错误: {ex.InnerException.Message}");
                    if (ex.InnerException.InnerException != null)
                    {
                        Console.WriteLine($"内部内部错误: {ex.InnerException.InnerException.Message}");
                    }
                }
                Console.WriteLine($"堆栈跟踪: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<SpecialEquipmentPurchaseInboundDTO> ConfirmSpecialEquipmentPurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 创建设备记录
            foreach (var item in inbound.EquipmentInboundItems)
            {
                // 创建新的专用设备记录
                var specialEquipment = new SpecialEquipment
                {
                    SortOrder = 0, // 默认排序
                    DeviceType = 1, // 1表示专用设备
                    DeviceName = item.DeviceName,
                    DeviceCode = item.DeviceCode,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Quantity = 1,
                    DeviceStatus = 1, // 1表示正常
                    UseStatus = 1, // 1表示未使用
                    Status = item.Status,
                    Location = "主仓库", // 默认位置
                    Company = "", // 默认公司
                    Warehouse = "主仓库", // 默认仓库
                    NameSequence = 0, // 默认序列号
                    CreatedAt = DateTime.Now
                };
                _context.SpecialEquipments.Add(specialEquipment);
            }

            await _context.SaveChangesAsync();

            // 返回更新后的入库记录
            return new SpecialEquipmentPurchaseInboundDTO
            {
                Id = inbound.Id,
                InboundNumber = inbound.InboundNumber,
                DeliveryPerson = inbound.DeliveryPerson,
                Inspector = inbound.Inspector,
                InboundPerson = inbound.InboundPerson,
                InboundDate = inbound.InboundDate,
                Handler = inbound.Operator,
                WarehouseKeeper = inbound.Operator,
                Remark = inbound.Remark,
                Status = inbound.Status,
                Items = inbound.EquipmentInboundItems.Select(item => new SpecialEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0,
                    EquipmentName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0,
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            };
        }

        // 通用设备采购入库管理
        public async Task<List<GeneralEquipmentPurchaseInboundDTO>> GetGeneralEquipmentPurchaseInboundsAsync()
        {
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new GeneralEquipmentPurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                DeliveryPerson = i.DeliveryPerson,
                Inspector = i.Inspector,
                InboundPerson = i.InboundPerson,
                InboundDate = i.InboundDate,
                Handler = i.Operator,
                WarehouseKeeper = i.Operator, // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark,
                Status = i.Status,
                Items = i.EquipmentInboundItems.Select(item => new GeneralEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0, // 需要根据实际情况设置
                    EquipmentName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            }).ToList();
        }

        public async Task<GeneralEquipmentPurchaseInboundDTO> CreateGeneralEquipmentPurchaseInboundAsync(GeneralEquipmentPurchaseInboundDTO dto)
        {
            // 使用前端提供的入库单号，如果没有则生成
            var inboundNumber = dto.InboundNumber ?? GenerateInboundNumber();

            var inbound = new EquipmentInbound
            {
                InboundNumber = inboundNumber,
                InboundDate = dto.InboundDate,
                EquipmentType = 2, // 2表示通用设备采购入库
                DeliveryPerson = dto.DeliveryPerson,
                Inspector = dto.Inspector,
                InboundPerson = dto.InboundPerson,
                Operator = dto.Handler,
                Remark = dto.Remark,
                Status = "待确认",
                CreatedAt = DateTime.Now
            };

            _context.EquipmentInbounds.Add(inbound);
            await _context.SaveChangesAsync();

            // 添加入库明细
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    // 使用前端发送的设备编号
                    var deviceCode = item.DeviceCode;
                    
                    var inboundItem = new EquipmentInboundItem
                    {
                        InboundId = inbound.Id,
                        DeviceName = item.EquipmentName,
                        DeviceCode = deviceCode,
                        Brand = item.Brand,
                        Model = item.Model,
                        Unit = item.Unit,
                        Quantity = item.Quantity,
                        Status = item.Status,
                        EquipmentType = 2,
                        CreatedAt = DateTime.Now
                    };
                    _context.EquipmentInboundItems.Add(inboundItem);
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待确认";
            return dto;
        }

        public async Task<GeneralEquipmentPurchaseInboundDTO> ConfirmGeneralEquipmentPurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 创建设备记录
            foreach (var item in inbound.EquipmentInboundItems)
            {
                // 创建新的通用设备记录
                var generalEquipment = new GeneralEquipment
                {
                    SortOrder = 0, // 默认排序
                    DeviceType = 2, // 2表示通用设备
                    DeviceName = item.DeviceName,
                    DeviceCode = item.DeviceCode,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Quantity = 1,
                    DeviceStatus = 1, // 1表示正常
                    UseStatus = 1, // 1表示未使用
                    Status = item.Status,
                    NameSequence = 0, // 默认序列号
                    CreatedAt = DateTime.Now
                };
                _context.GeneralEquipments.Add(generalEquipment);
            }

            await _context.SaveChangesAsync();

            // 返回更新后的入库记录
            return new GeneralEquipmentPurchaseInboundDTO
            {
                Id = inbound.Id,
                InboundNumber = inbound.InboundNumber,
                DeliveryPerson = inbound.DeliveryPerson,
                Inspector = inbound.Inspector,
                InboundPerson = inbound.InboundPerson,
                InboundDate = inbound.InboundDate,
                Handler = inbound.Operator,
                WarehouseKeeper = inbound.Operator,
                Remark = inbound.Remark,
                Status = inbound.Status,
                Items = inbound.EquipmentInboundItems.Select(item => new GeneralEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0,
                    EquipmentName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0,
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            };
        }

        // 耗材采购入库管理
        public async Task<List<ConsumablePurchaseInboundDTO>> GetConsumablePurchaseInboundsAsync()
        {
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new ConsumablePurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                DeliveryPerson = i.DeliveryPerson,
                Inspector = i.Inspector,
                InboundPerson = i.InboundPerson,
                InboundDate = i.InboundDate,
                Handler = i.Operator,
                WarehouseKeeper = i.Operator, // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark,
                Items = i.EquipmentInboundItems.Select(item => new ConsumablePurchaseInboundItemDTO
                {
                    Id = item.Id,
                    ConsumableId = 0, // 需要根据实际情况设置
                    ConsumableName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            }).ToList();
        }

        public async Task<ConsumablePurchaseInboundDTO> CreateConsumablePurchaseInboundAsync(ConsumablePurchaseInboundDTO dto)
        {
            // 使用前端提供的入库单号，如果没有则生成
            var inboundNumber = dto.InboundNumber ?? GenerateInboundNumber();

            var inbound = new EquipmentInbound
            {
                InboundNumber = inboundNumber,
                InboundDate = dto.InboundDate,
                EquipmentType = 3, // 3表示耗材采购入库
                DeliveryPerson = dto.DeliveryPerson,
                Inspector = dto.Inspector,
                InboundPerson = dto.InboundPerson,
                Operator = dto.Handler,
                Remark = dto.Remark,
                Status = "待确认",
                CreatedAt = DateTime.Now
            };

            _context.EquipmentInbounds.Add(inbound);
            await _context.SaveChangesAsync();

            // 添加入库明细
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    // 生成耗材编号
                    var deviceCode = await GenerateDeviceCodeAsync(item.ConsumableName, item.Brand, item.Model, 3);
                    
                    var inboundItem = new EquipmentInboundItem
                    {
                        InboundId = inbound.Id,
                        DeviceName = item.ConsumableName,
                        DeviceCode = deviceCode,
                        Brand = item.Brand,
                        Model = item.Model,
                        Unit = item.Unit,
                        Quantity = item.Quantity,
                        Status = item.Status,
                        EquipmentType = 3,
                        CreatedAt = DateTime.Now
                    };
                    _context.EquipmentInboundItems.Add(inboundItem);
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待确认";
            return dto;
        }

        public async Task<ConsumablePurchaseInboundDTO> ConfirmConsumablePurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 更新耗材库存
            foreach (var item in inbound.EquipmentInboundItems)
            {
                // 查找或创建耗材
                var consumable = await _context.Consumables.FirstOrDefaultAsync(c => 
                    c.Name == item.DeviceName && 
                    (c.Brand == item.Brand || (c.Brand == null && item.Brand == "")) && 
                    (c.ModelSpecification == item.Model || (c.ModelSpecification == null && item.Model == ""))
                );
                if (consumable == null)
                {
                    // 创建新耗材
                    consumable = new Consumable
                    {
                        Name = item.DeviceName,
                        Brand = string.IsNullOrEmpty(item.Brand) ? null : item.Brand,
                        ModelSpecification = string.IsNullOrEmpty(item.Model) ? null : item.Model,
                        Unit = item.Unit,
                        TotalQuantity = item.Quantity,
                        RemainingQuantity = item.Quantity,
                        Status = "正常",
                        CreatedAt = DateTime.Now
                    };
                    _context.Consumables.Add(consumable);
                } else {
                    // 更新现有耗材库存
                    consumable.RemainingQuantity += item.Quantity;
                    consumable.TotalQuantity += item.Quantity;
                }
            }

            await _context.SaveChangesAsync();

            // 返回更新后的入库记录
            return new ConsumablePurchaseInboundDTO
            {
                Id = inbound.Id,
                InboundNumber = inbound.InboundNumber,
                DeliveryPerson = inbound.DeliveryPerson,
                Inspector = inbound.Inspector,
                InboundPerson = inbound.InboundPerson,
                InboundDate = inbound.InboundDate,
                Handler = inbound.Operator,
                WarehouseKeeper = inbound.Operator,
                Remark = inbound.Remark,
                Status = inbound.Status,
                Items = inbound.EquipmentInboundItems.Select(item => new ConsumablePurchaseInboundItemDTO
                {
                    Id = item.Id,
                    ConsumableId = 0,
                    ConsumableName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Unit = item.Unit,
                    Inventory = 0,
                    Quantity = item.Quantity,
                    Status = item.Status
                }).ToList()
            };
        }

        public async Task DeleteConsumablePurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 删除入库明细
            _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            // 删除入库记录
            _context.EquipmentInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 删除专用设备采购入库记录
        public async Task DeleteSpecialEquipmentPurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 收集需要删除的设备编号
            var deviceCodes = inbound.EquipmentInboundItems.Select(item => item.DeviceCode).ToList();

            // 删除相关的专用设备记录
            if (deviceCodes.Count > 0)
            {
                var devicesToDelete = await _context.SpecialEquipments.Where(d => deviceCodes.Contains(d.DeviceCode)).ToListAsync();
                _context.SpecialEquipments.RemoveRange(devicesToDelete);
            }

            // 删除入库明细
            _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            // 删除入库记录
            _context.EquipmentInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 删除通用设备采购入库记录
        public async Task DeleteGeneralEquipmentPurchaseInboundAsync(int id)
        {
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 收集需要删除的设备编号
            var deviceCodes = inbound.EquipmentInboundItems.Select(item => item.DeviceCode).ToList();

            // 删除相关的通用设备记录
            if (deviceCodes.Count > 0)
            {
                var devicesToDelete = await _context.GeneralEquipments.Where(d => deviceCodes.Contains(d.DeviceCode)).ToListAsync();
                _context.GeneralEquipments.RemoveRange(devicesToDelete);
            }

            // 删除入库明细
            _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            // 删除入库记录
            _context.EquipmentInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 生成出库单号
        private string GenerateOutboundNumber()
        {
            return "OUT" + DateTime.Now.ToString("yyyyMMddHHmmss");
        }

        // 生成入库单号
        private string GenerateInboundNumber()
        {
            return "IN" + DateTime.Now.ToString("yyyyMMddHHmmss");
        }

        // 生成设备编号
        public async Task<string> GenerateDeviceCodeAsync(string deviceName, string brand, string model, int deviceType)
        {
            Console.WriteLine($"开始生成设备编号: deviceName={deviceName}, brand={brand}, model={model}, deviceType={deviceType}");
            
            // 处理空值
            deviceName = deviceName ?? "";
            brand = brand ?? "";
            model = model ?? "";
            
            string prefix = "YD";
            if (deviceType == 2) // 通用设备
            {
                prefix = "YD";
            }
            else if (deviceType == 3) // 耗材
            {
                prefix = "HC";
            }

            // 获取该设备名称、品牌、型号下的最大编号
            int maxSequence = 0;

            // 从设备入库记录中查找最大编号
            var query = _context.EquipmentInboundItems.Where(item => 
                (item.DeviceName == deviceName || (item.DeviceName == null && deviceName == "")) && 
                (item.Brand == brand || (item.Brand == null && brand == ""))
            );
            if (!string.IsNullOrEmpty(model))
            {
                query = query.Where(item => item.Model == model || (item.Model == null && model == ""));
            }
            var maxItem = await query
                .Select(item => item.DeviceCode)
                .OrderByDescending(code => code)
                .FirstOrDefaultAsync();

            if (!string.IsNullOrEmpty(maxItem))
            {
                // 提取编号中的数字部分
                var parts = maxItem.Split('-');
                if (parts.Length >= 3)
                {
                    string sequencePart = parts[^1];
                    if (int.TryParse(sequencePart, out int sequence))
                    {
                        maxSequence = sequence;
                        Console.WriteLine($"从入库记录中找到最大编号: {maxItem}, 序列号: {sequence}");
                    }
                }
            }

            // 从设备表中查找最大编号（如果入库记录中没有）
            if (maxSequence == 0)
            {
                if (deviceType == 1) // 专用设备
                {
                    // 查找该设备名称的所有设备
                    var devices = await _context.SpecialEquipments
                        .Where(d => d.DeviceName == deviceName || (d.DeviceName == null && deviceName == ""))
                        .Select(d => d.DeviceCode)
                        .ToListAsync();
                    
                    Console.WriteLine($"从专用设备表中找到 {devices.Count} 条记录");
                    foreach (var deviceCode in devices)
                    {
                        Console.WriteLine($"设备编号: {deviceCode}");
                    }
                    
                    // 提取最大序列号
                    foreach (var deviceCode in devices)
                    {
                        if (!string.IsNullOrEmpty(deviceCode))
                        {
                            var parts = deviceCode.Split('-');
                            if (parts.Length >= 3)
                            {
                                string sequencePart = parts[^1];
                                if (int.TryParse(sequencePart, out int sequence))
                                {
                                    if (sequence > maxSequence)
                                    {
                                        maxSequence = sequence;
                                        Console.WriteLine($"找到更大的序列号: {sequence}");
                                    }
                                }
                            }
                        }
                    }
                }
                else if (deviceType == 2) // 通用设备
                {
                    // 查找该设备名称的所有设备
                    var devices = await _context.GeneralEquipments
                        .Where(d => d.DeviceName == deviceName || (d.DeviceName == null && deviceName == ""))
                        .Select(d => d.DeviceCode)
                        .ToListAsync();
                    
                    Console.WriteLine($"从通用设备表中找到 {devices.Count} 条记录");
                    foreach (var deviceCode in devices)
                    {
                        Console.WriteLine($"设备编号: {deviceCode}");
                    }
                    
                    // 提取最大序列号
                    foreach (var deviceCode in devices)
                    {
                        if (!string.IsNullOrEmpty(deviceCode))
                        {
                            var parts = deviceCode.Split('-');
                            if (parts.Length >= 3)
                            {
                                string sequencePart = parts[^1];
                                if (int.TryParse(sequencePart, out int sequence))
                                {
                                    if (sequence > maxSequence)
                                    {
                                        maxSequence = sequence;
                                        Console.WriteLine($"找到更大的序列号: {sequence}");
                                    }
                                }
                            }
                        }
                    }
                }
                else if (deviceType == 3) // 耗材
                {
                    // 耗材表中没有 ConsumableCode 字段，只从入库记录中查找
                }
            }

            // 生成新的编号
            maxSequence++;
            string newDeviceCode = $"{prefix}-{deviceName}-{maxSequence.ToString().PadLeft(3, '0')}";
            Console.WriteLine($"生成的新设备编号: {newDeviceCode}");
            return newDeviceCode;
        }
    }
}