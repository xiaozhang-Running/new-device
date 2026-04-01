using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Enums;
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
            if (_context.ProjectOutbounds == null)
            {
                return new List<ProjectOutboundDTO>();
            }
            var outbounds = await _context.ProjectOutbounds.Include(o => o.ProjectOutboundItems).ToListAsync();
            return outbounds.Select(o => new ProjectOutboundDTO
            {
                Id = o.Id,
                OutboundNumber = o.OutboundNumber ?? "",
                OutboundDate = o.OutboundDate,
                ProjectName = o.ProjectName ?? "",
                ProjectManager = o.ProjectManager ?? "",
                ContactPhone = o.ContactPhone ?? "",
                ProjectTime = o.ProjectTime ?? "",
                ReturnDate = o.ReturnDate,
                UsageLocation = o.UsageLocation ?? "",
                Recipient = o.Recipient ?? "",
                Handler = o.Handler ?? "",
                WarehouseKeeper = o.WarehouseKeeper ?? "",
                Remark = o.Remark ?? "",
                IsCompleted = o.IsCompleted,
                CompletedAt = o.CompletedAt,
                Items = o.ProjectOutboundItems?.Select(i => new ProjectOutboundItemDTO
                {
                    Id = i.Id,
                    ProjectOutboundId = i.OutboundId,
                    EquipmentId = i.ItemId,
                    EquipmentName = i.ItemName ?? "",
                    Brand = i.Brand ?? "",
                    Model = i.Model ?? "",
                    Quantity = i.Quantity,
                    Unit = i.Unit ?? "",
                    Status = i.DeviceStatus ?? ""
                }).ToList() ?? []
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

            if (_context.ProjectOutbounds != null)
            {
                _context.ProjectOutbounds.Add(outbound);
                await _context.SaveChangesAsync();

                // 添加出库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.ProjectOutboundItems != null)
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
            }

            dto.Id = outbound.Id;
            dto.OutboundNumber = outboundNumber;
            dto.OutboundDate = outbound.OutboundDate;
            return dto;
        }

        public async Task<ProjectOutboundDTO> GetProjectOutboundAsync(int id)
        {
            if (_context.ProjectOutbounds == null)
            {
                throw new Exception("ProjectOutbounds table not found");
            }
            var outbound = await _context.ProjectOutbounds.Include(o => o.ProjectOutboundItems).FirstOrDefaultAsync(o => o.Id == id);
            if (outbound == null)
            {
                throw new Exception("Project outbound not found");
            }
            return new ProjectOutboundDTO
            {
                Id = outbound.Id,
                OutboundNumber = outbound.OutboundNumber ?? "",
                ProjectName = outbound.ProjectName ?? "",
                ProjectManager = outbound.ProjectManager ?? "",
                ContactPhone = outbound.ContactPhone ?? "",
                ProjectTime = outbound.ProjectTime ?? "",
                ReturnDate = outbound.ReturnDate,
                UsageLocation = outbound.UsageLocation ?? "",
                Recipient = outbound.Recipient ?? "",
                Handler = outbound.Handler ?? "",
                WarehouseKeeper = outbound.WarehouseKeeper ?? "",
                Remark = outbound.Remark ?? "",
                IsCompleted = outbound.IsCompleted,
                CompletedAt = outbound.CompletedAt,
                Items = outbound.ProjectOutboundItems?.Select(i => new ProjectOutboundItemDTO
                {
                    Id = i.Id,
                    ProjectOutboundId = i.OutboundId,
                    EquipmentId = i.ItemId,
                    EquipmentName = i.ItemName ?? "",
                    Brand = i.Brand ?? "",
                    Model = i.Model ?? "",
                    Quantity = i.Quantity,
                    Unit = i.Unit ?? "",
                    Status = i.DeviceStatus ?? ""
                }).ToList() ?? []
            };
        }

        // 原材料出库管理
        public async Task<List<RawMaterialOutboundDTO>> GetRawMaterialOutboundsAsync()
        {
            if (_context.RawMaterialOutbounds == null)
            {
                return new List<RawMaterialOutboundDTO>();
            }
            var outbounds = await _context.RawMaterialOutbounds.Include(o => o.RawMaterialOutboundItems).ThenInclude(i => i.RawMaterial).ToListAsync();
            return outbounds.Select(o => new RawMaterialOutboundDTO
            {
                Id = o.Id,
                OutboundNumber = o.OutboundNumber ?? "",
                Recipient = o.Recipient ?? "",
                Operator = o.Operator ?? "",
                Status = o.Status ?? "",
                Remark = o.Remark ?? "",
                OutboundDate = o.OutboundDate,
                Items = o.RawMaterialOutboundItems?.Select(i => new RawMaterialOutboundItemDTO
                {
                    Id = i.Id,
                    RawMaterialId = i.RawMaterialId,
                    Quantity = i.Quantity,
                    Remark = i.Remark ?? ""
                }).ToList() ?? []
            }).ToList();
        }

        public async Task<RawMaterialOutboundDTO> CreateRawMaterialOutboundAsync(RawMaterialOutboundDTO dto)
        {
            // 生成出库单号
            var outboundNumber = GenerateOutboundNumber();

            var outbound = new RawMaterialOutbound
            {
                OutboundNumber = outboundNumber,
                OutboundDate = dto.OutboundDate,
                Recipient = dto.Recipient,
                Operator = dto.Operator,
                Status = dto.Status ?? "待处理",
                Remark = dto.Remark,
                CreatedAt = DateTime.Now
            };

            if (_context.RawMaterialOutbounds != null)
            {
                _context.RawMaterialOutbounds.Add(outbound);
                await _context.SaveChangesAsync();

                // 添加出库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.RawMaterialOutboundItems != null)
                {
                    foreach (var item in dto.Items)
                    {
                        var outboundItem = new RawMaterialOutboundItem
                        {
                            OutboundId = outbound.Id,
                            RawMaterialId = item.RawMaterialId,
                            Quantity = item.Quantity,
                            Remark = item.Remark,
                            CreatedAt = DateTime.Now
                        };
                        _context.RawMaterialOutboundItems.Add(outboundItem);

                        // 更新原材料库存
                        if (_context.RawMaterials != null)
                        {
                            var rawMaterial = await _context.RawMaterials.FirstOrDefaultAsync(m => m.Id == item.RawMaterialId);
                            if (rawMaterial != null)
                            {
                                if (rawMaterial.RemainingQuantity < item.Quantity)
                                {
                                    throw new Exception($"原材料 {rawMaterial.ProductName} 库存不足");
                                }
                                rawMaterial.RemainingQuantity -= item.Quantity;
                                rawMaterial.UsedQuantity += item.Quantity;
                                rawMaterial.UpdatedAt = DateTime.Now;
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                }
            }

            dto.Id = outbound.Id;
            dto.OutboundNumber = outboundNumber;
            dto.OutboundDate = outbound.OutboundDate;
            return dto;
        }

        // 项目入库管理
        public async Task<List<ProjectInboundDTO>> GetProjectInboundsAsync()
        {
            if (_context.ProjectInbounds == null)
            {
                return new List<ProjectInboundDTO>();
            }
            var inbounds = await _context.ProjectInbounds
                .Include(i => i.ProjectInboundItems)
                .Include(i => i.ProjectInboundOutbounds)
                .OrderByDescending(i => i.InboundDate)
                .ThenByDescending(i => i.Id)
                .ToListAsync();

            var result = new List<ProjectInboundDTO>();
            foreach (var inbound in inbounds)
            {
                var inboundDTO = new ProjectInboundDTO
                {
                    Id = inbound.Id,
                    InboundNumber = inbound.InboundNumber ?? "",
                    OutboundOrderId = inbound.ProjectInboundOutbounds?.FirstOrDefault()?.ProjectOutboundId ?? 0,
                    ProjectName = inbound.ProjectName ?? "",
                    ProjectManager = inbound.ProjectManager ?? "",
                    ContactPhone = inbound.ContactPhone ?? "",
                    ProjectTime = inbound.ProjectTime ?? "",
                    UsageLocation = inbound.UsageLocation ?? "",
                    Handler = inbound.Handler ?? "",
                    Inspector = inbound.Inspector ?? "",
                    WarehouseKeeper = inbound.WarehouseKeeper ?? "",
                    InboundDate = inbound.InboundDate.ToString("yyyy-MM-dd"),
                    Remark = inbound.Remark ?? "",
                    Status = inbound.Status ?? "",
                    IsCompleted = inbound.IsCompleted,
                    Items = new List<ProjectInboundItemDTO>()
                };

                if (inbound.ProjectInboundItems != null)
                {
                    foreach (var item in inbound.ProjectInboundItems)
                    {
                        var itemDTO = new ProjectInboundItemDTO
                        {
                            Id = item.Id,
                            ProjectInboundId = item.InboundId,
                            EquipmentId = item.ItemId,
                            EquipmentName = item.ItemName ?? "",
                            DeviceCode = item.DeviceCode,
                            SerialNumber = item.SerialNumber,
                            Brand = item.Brand ?? "",
                            Model = item.Model ?? "",
                            Quantity = item.Quantity,
                            Unit = item.Unit ?? "",
                            Accessories = item.Accessories,
                            Status = item.DeviceStatus ?? "",
                            ItemType = item.ItemType
                        };

                        // 从设备表获取最新的设备编号和SN码
                        if (item.ItemId > 0 && item.ItemType != 3) // 非耗材
                        {
                            if (item.ItemType == 1 && _context.SpecialEquipments != null)
                            {
                                var specialEquipment = await _context.SpecialEquipments.FirstOrDefaultAsync(e => e.Id == item.ItemId);
                                if (specialEquipment != null)
                                {
                                    itemDTO.DeviceCode = specialEquipment.DeviceCode;
                                    itemDTO.SerialNumber = specialEquipment.SerialNumber;
                                }
                            }
                            else if (item.ItemType == 2 && _context.GeneralEquipments != null)
                            {
                                var generalEquipment = await _context.GeneralEquipments.FirstOrDefaultAsync(e => e.Id == item.ItemId);
                                if (generalEquipment != null)
                                {
                                    itemDTO.DeviceCode = generalEquipment.DeviceCode;
                                    itemDTO.SerialNumber = generalEquipment.SerialNumber;
                                }
                            }
                        }

                        inboundDTO.Items.Add(itemDTO);
                    }
                }

                result.Add(inboundDTO);
            }

            return result;
        }

        public async Task<ProjectInboundDTO> CreateProjectInboundAsync(ProjectInboundDTO dto)
        {
            // 使用前端传递的入库单号，如果没有则生成新的
            var inboundNumber = dto.InboundNumber ?? GenerateInboundNumber();

            var inbound = new ProjectInbound
            {
                InboundNumber = inboundNumber,
                InboundDate = DateTime.Now,
                ProjectName = dto.ProjectName,
                ProjectManager = dto.ProjectManager,
                ContactPhone = dto.ContactPhone,
                ProjectTime = dto.ProjectTime,
                UsageLocation = dto.UsageLocation,
                Handler = dto.Handler,
                Inspector = dto.Inspector,
                WarehouseKeeper = dto.WarehouseKeeper,
                Remark = dto.Remark,
                Status = dto.Status,
                IsCompleted = dto.Status == "全部入库",
                CreatedAt = DateTime.Now
            };

            if (_context.ProjectInbounds != null)
            {
                _context.ProjectInbounds.Add(inbound);
                await _context.SaveChangesAsync();

                // 添加入库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.ProjectInboundItems != null)
                {
                    foreach (var item in dto.Items)
                    {
                        var inboundItem = new ProjectInboundItem
                        {
                            InboundId = inbound.Id,
                            ItemType = item.ItemType > 0 ? item.ItemType : 1, // 使用传入的ItemType，默认为1
                            ItemId = item.EquipmentId,
                            ItemName = item.EquipmentName,
                            DeviceCode = item.DeviceCode,
                            SerialNumber = item.SerialNumber,
                            Brand = item.Brand,
                            Model = item.Model,
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            Accessories = item.Accessories,
                            DeviceStatus = item.Status,
                            CreatedAt = DateTime.Now
                        };
                        _context.ProjectInboundItems.Add(inboundItem);
                    }
                    await _context.SaveChangesAsync();
                }

                // 创建入库和出库的关联记录
                if (dto.OutboundOrderId > 0 && _context.ProjectInboundOutbounds != null)
                {
                    var inboundOutbound = new ProjectInboundOutbound
                    {
                        ProjectInboundId = inbound.Id,
                        ProjectOutboundId = dto.OutboundOrderId,
                        CreatedAt = DateTime.Now
                    };
                    _context.ProjectInboundOutbounds.Add(inboundOutbound);
                    await _context.SaveChangesAsync();

                    // 更新对应出库记录的状态
                    if (_context.ProjectOutbounds != null)
                    {
                        var outbound = await _context.ProjectOutbounds.FirstOrDefaultAsync(o => o.Id == dto.OutboundOrderId);
                        if (outbound != null)
                        {
                            // 根据入库状态更新出库记录状态
                            if (dto.Status == "全部入库")
                            {
                                outbound.IsCompleted = true;
                                outbound.CompletedAt = DateTime.Now;
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                }

                // 处理入库物品
                // 1. 处理耗材
                if (dto.Items != null && dto.Items.Count > 0 && _context.Consumables != null)
                {
                    foreach (var item in dto.Items)
                    {
                        // 检查是否为耗材类型（ItemType == 3）
                        if (item.ItemType == 3)
                        {
                            // 更新耗材库存信息
                            try
                            {
                                // 查找耗材
                                var consumable = await _context.Consumables.FirstOrDefaultAsync(c =>
                                    c.Name == item.EquipmentName &&
                                    (c.Brand == item.Brand || (c.Brand == null && (item.Brand == null || item.Brand == ""))) &&
                                    (c.ModelSpecification == item.Model || (c.ModelSpecification == null && (item.Model == null || item.Model == "")))
                                );

                                if (consumable != null)
                                {
                                    // 增加耗材库存（入库数量）
                                    consumable.RemainingQuantity += item.Quantity;
                                    consumable.TotalQuantity += item.Quantity;
                                    consumable.UpdatedAt = DateTime.Now;
                                }
                                else
                                {
                                    // 如果耗材不存在，创建新的耗材记录
                                    consumable = new Consumable
                                    {
                                        Name = item.EquipmentName,
                                        Brand = string.IsNullOrEmpty(item.Brand) ? null : item.Brand,
                                        ModelSpecification = string.IsNullOrEmpty(item.Model) ? null : item.Model,
                                        Unit = item.Unit,
                                        TotalQuantity = item.Quantity,
                                        OriginalQuantity = item.Quantity,
                                        UsedQuantity = 0,
                                        RemainingQuantity = item.Quantity,
                                        Status = "正常",
                                        CreatedAt = DateTime.Now
                                    };
                                    _context.Consumables.Add(consumable);
                                }
                            }
                            catch (Exception ex)
                            {
                                // 忽略耗材表不存在的错误，继续执行
                                Console.WriteLine($"更新耗材库存失败: {ex.Message}");
                            }
                        }
                        // 2. 处理设备（专用设备和通用设备）
                        else if (item.ItemType == 1 || item.ItemType == 2)
                        {
                            // 检查设备状态是否为"损坏"，如果是则不更新设备状态
                            if (item.Status != "损坏")
                            {
                                // 根据设备类型查找对应的设备
                                if (item.ItemType == 1 && _context.SpecialEquipments != null)
                                {
                                    // 查找专用设备
                                    var specialEquipment = await _context.SpecialEquipments.FirstOrDefaultAsync(e => e.Id == item.EquipmentId);
                                    if (specialEquipment != null)
                                    {
                                        // 更新设备状态为正常
                                        specialEquipment.DeviceStatus = (int)DeviceStatus.Normal;
                                        specialEquipment.UpdatedAt = DateTime.Now;
                                    }
                                }
                                else if (item.ItemType == 2 && _context.GeneralEquipments != null)
                                {
                                    // 查找通用设备
                                    var generalEquipment = await _context.GeneralEquipments.FirstOrDefaultAsync(e => e.Id == item.EquipmentId);
                                    if (generalEquipment != null)
                                    {
                                        // 更新设备状态为正常
                                        generalEquipment.DeviceStatus = (int)DeviceStatus.Normal;
                                        generalEquipment.UpdatedAt = DateTime.Now;
                                    }
                                }
                            }
                        }
                    }
                }
                

                
                // 保存所有更改
                await _context.SaveChangesAsync();
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.IsCompleted = inbound.IsCompleted;
            return dto;
        }



        // 原材料入库管理
        public async Task<List<RawMaterialInboundDTO>> GetRawMaterialInboundsAsync()
        {
            if (_context.RawMaterialInbounds == null)
            {
                return new List<RawMaterialInboundDTO>();
            }
            var inbounds = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).ToListAsync();
            return inbounds.Select(i => new RawMaterialInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber ?? "",
                Supplier = i.Supplier ?? "",
                Handler = i.Operator ?? "",
                WarehouseKeeper = i.Operator ?? "", // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark ?? "",
                Status = i.Status ?? "",
                Items = i.RawMaterialInboundItems?.Select(item => new RawMaterialInboundItemDTO
                {
                    Id = item.Id,
                    RawMaterialId = item.RawMaterialId,
                    Quantity = item.Quantity,
                    Remark = item.Remark ?? ""
                }).ToList() ?? new List<RawMaterialInboundItemDTO>()
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

            if (_context.RawMaterialInbounds != null)
            {
                _context.RawMaterialInbounds.Add(inbound);
                await _context.SaveChangesAsync();

                // 添加入库明细
                if (dto.Items != null && dto.Items.Count > 0)
                {
                    foreach (var item in dto.Items)
                    {
                        int rawMaterialId = item.RawMaterialId;
                        
                        // 处理新原材料的情况
                        if (rawMaterialId <= 0 && _context.RawMaterials != null) // 前端可能发送0或负数表示新原材料
                        {
                            // 尝试从备注中提取名称、规格和单位
                            string productName = "新原材料";
                            string specification = "";
                            string unit = "个"; // 默认单位
                            
                            if (item.Remark != null)
                            {
                                // 尝试从备注中提取名称
                                if (item.Remark.Contains("名称:"))
                                {
                                    productName = item.Remark.Split("名称:")[1].Split(';')[0].Trim();
                                }
                                // 尝试从备注中提取规格
                                if (item.Remark.Contains("规格:"))
                                {
                                    specification = item.Remark.Split("规格:")[1].Split(';')[0].Trim();
                                }
                                // 尝试从备注中提取单位
                                if (item.Remark.Contains("单位:"))
                                {
                                    unit = item.Remark.Split("单位:")[1].Split(';')[0].Trim();
                                }
                            }
                            
                            // 验证必要信息
                            if (string.IsNullOrEmpty(productName))
                            {
                                throw new Exception("新原材料必须提供名称");
                            }
                            if (string.IsNullOrEmpty(specification))
                            {
                                throw new Exception("新原材料必须提供规格信息");
                            }
                            
                            // 创建新的原材料记录
                            var newRawMaterial = new RawMaterial
                            {
                                SortOrder = 0,
                                ProductName = productName,
                                Specification = specification,
                                TotalQuantity = 0,
                                UsedQuantity = 0,
                                RemainingQuantity = 0,
                                Unit = unit,
                                Supplier = dto.Supplier,
                                CreatedAt = DateTime.Now
                            };
                            
                            _context.RawMaterials.Add(newRawMaterial);
                            await _context.SaveChangesAsync();
                            
                            rawMaterialId = newRawMaterial.Id;
                        }
                        
                        if (_context.RawMaterialInboundItems != null)
                        {
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
                    }
                    await _context.SaveChangesAsync();
                }
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待处理";
            return dto;
        }

        public async Task<RawMaterialInboundDTO> ConfirmRawMaterialInboundAsync(int id)
        {
            if (_context.RawMaterialInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 更新原材料库存
            if (inbound.RawMaterialInboundItems != null && _context.RawMaterials != null)
            {
                foreach (var item in inbound.RawMaterialInboundItems)
                {
                    var rawMaterial = await _context.RawMaterials.FirstOrDefaultAsync(m => m.Id == item.RawMaterialId);
                    if (rawMaterial != null)
                    {
                        rawMaterial.RemainingQuantity += item.Quantity;
                        rawMaterial.TotalQuantity += item.Quantity;
                    }
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
                Items = inbound.RawMaterialInboundItems?.Select(item => new RawMaterialInboundItemDTO
                {
                    Id = item.Id,
                    RawMaterialId = item.RawMaterialId,
                    Quantity = item.Quantity,
                    Remark = item.Remark
                }).ToList() ?? new List<RawMaterialInboundItemDTO>()
            };
        }

        public async Task DeleteRawMaterialInboundAsync(int id)
        {
            if (_context.RawMaterialInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.RawMaterialInbounds.Include(i => i.RawMaterialInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 如果入库记录已完成，需要减少原材料库存
            if (inbound.Status == "已完成" && inbound.RawMaterialInboundItems != null && _context.RawMaterials != null)
            {
                foreach (var item in inbound.RawMaterialInboundItems)
                {
                    var rawMaterial = await _context.RawMaterials.FirstOrDefaultAsync(m => m.Id == item.RawMaterialId);
                    if (rawMaterial != null)
                    {
                        rawMaterial.RemainingQuantity = Math.Max(0, rawMaterial.RemainingQuantity - item.Quantity);
                        rawMaterial.TotalQuantity = Math.Max(0, rawMaterial.TotalQuantity - item.Quantity);
                    }
                }
            }

            // 删除入库明细
            if (_context.RawMaterialInboundItems != null && inbound.RawMaterialInboundItems != null)
            {
                _context.RawMaterialInboundItems.RemoveRange(inbound.RawMaterialInboundItems);
            }
            // 删除入库记录
            _context.RawMaterialInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 专用设备采购入库管理
        public async Task<List<SpecialEquipmentPurchaseInboundDTO>> GetSpecialEquipmentPurchaseInboundsAsync()
        {
            if (_context.EquipmentInbounds == null)
            {
                return new List<SpecialEquipmentPurchaseInboundDTO>();
            }
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new SpecialEquipmentPurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber ?? "",
                DeliveryPerson = i.DeliveryPerson ?? "",
                Inspector = i.Inspector ?? "",
                InboundPerson = i.InboundPerson ?? "",
                InboundDate = i.InboundDate,
                Handler = i.Operator ?? "",
                WarehouseKeeper = i.Operator ?? "", // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark ?? "",
                Status = i.Status ?? "",
                Items = i.EquipmentInboundItems?.Select(item => new SpecialEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0, // 需要根据实际情况设置
                    EquipmentName = item.DeviceName ?? "",
                    Brand = item.Brand ?? "",
                    Model = item.Model ?? "",
                    Unit = item.Unit ?? "",
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status ?? "",
                    DeviceCode = item.DeviceCode ?? "",
                    SnCode = item.SerialNumber ?? "",
                    Accessories = item.Remark ?? ""
                }).ToList() ?? new List<SpecialEquipmentPurchaseInboundItemDTO>()
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
                    DeliveryPerson = dto.DeliveryPerson ?? "",
                    Inspector = dto.Inspector ?? "",
                    InboundPerson = dto.InboundPerson ?? "",
                    Operator = dto.Handler ?? "",
                    Remark = dto.Remark ?? "",
                    Status = "待确认",
                    CreatedAt = DateTime.Now
                };

                Console.WriteLine("准备保存入库单");
                if (_context.EquipmentInbounds != null)
                {
                    _context.EquipmentInbounds.Add(inbound);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"入库单创建成功，ID: {inbound.Id}");

                    // 添加入库明细
                    if (dto.Items != null && dto.Items.Count > 0 && _context.EquipmentInboundItems != null)
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
                                DeviceName = item.EquipmentName ?? "",
                                DeviceCode = deviceCode ?? "",
                                Brand = item.Brand,
                                Model = item.Model,
                                Unit = item.Unit,
                                Quantity = item.Quantity,
                                Status = item.Status,
                                EquipmentType = 1,
                                SerialNumber = item.SnCode,
                                Remark = item.Accessories,
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
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 使用执行策略来处理事务
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // 更新入库状态为已完成
                    inbound.Status = "已完成";
                    inbound.UpdatedAt = DateTime.Now;

                    // 创建设备记录
                    if (inbound.EquipmentInboundItems != null && _context.SpecialEquipments != null)
                    {
                        foreach (var item in inbound.EquipmentInboundItems)
                        {
                            // 创建新的专用设备记录
                        // 根据状态字符串设置设备状态
                        int deviceStatus = (int)DeviceStatus.Normal; // 默认正常
                        if (!string.IsNullOrEmpty(item.Status))
                        {
                            switch (item.Status)
                            {
                                case "待维修":
                                    deviceStatus = (int)DeviceStatus.PendingRepair;
                                    break;
                                case "已报废":
                                    deviceStatus = (int)DeviceStatus.Scrap;
                                    break;
                                default:
                                    deviceStatus = (int)DeviceStatus.Normal;
                                    break;
                            }
                        }

                        var specialEquipment = new SpecialEquipment
                        {
                            SortOrder = 0, // 默认排序
                            DeviceType = 1, // 1表示专用设备
                            DeviceName = item.DeviceName ?? "",
                            DeviceCode = item.DeviceCode ?? "",
                            Brand = item.Brand ?? "",
                            Model = item.Model ?? "",
                            Unit = item.Unit ?? "",
                            Quantity = 1,
                            DeviceStatus = deviceStatus, // 根据前端传递的状态设置
                            UseStatus = (int)UseStatus.Unused, // 未使用
                            Status = item.Status ?? "",
                            Location = "主仓库", // 默认位置
                            Company = "", // 默认公司
                            Warehouse = "主仓库", // 默认仓库
                            NameSequence = 0, // 默认序列号
                            SerialNumber = item.SerialNumber, // SN码
                            Accessories = item.Remark, // 配件
                            CreatedAt = DateTime.Now
                        };
                            _context.SpecialEquipments.Add(specialEquipment);
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

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
                Items = inbound.EquipmentInboundItems?.Select(item => new SpecialEquipmentPurchaseInboundItemDTO
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
                }).ToList() ?? new List<SpecialEquipmentPurchaseInboundItemDTO>()
            };
        }

        // 通用设备采购入库管理
        public async Task<List<GeneralEquipmentPurchaseInboundDTO>> GetGeneralEquipmentPurchaseInboundsAsync()
        {
            if (_context.EquipmentInbounds == null)
            {
                return new List<GeneralEquipmentPurchaseInboundDTO>();
            }
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new GeneralEquipmentPurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber ?? "",
                DeliveryPerson = i.DeliveryPerson ?? "",
                Inspector = i.Inspector ?? "",
                InboundPerson = i.InboundPerson ?? "",
                InboundDate = i.InboundDate,
                Handler = i.Operator ?? "",
                WarehouseKeeper = i.Operator ?? "", // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark ?? "",
                Status = i.Status ?? "",
                Items = i.EquipmentInboundItems?.Select(item => new GeneralEquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0, // 需要根据实际情况设置
                    EquipmentName = item.DeviceName ?? "",
                    Brand = item.Brand ?? "",
                    Model = item.Model ?? "",
                    Unit = item.Unit ?? "",
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status ?? "",
                    DeviceCode = item.DeviceCode ?? "",
                    SnCode = item.SerialNumber ?? "",
                    Accessories = item.Accessories ?? item.Remark ?? ""
                }).ToList() ?? new List<GeneralEquipmentPurchaseInboundItemDTO>()
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
                DeliveryPerson = dto.DeliveryPerson ?? "",
                Inspector = dto.Inspector ?? "",
                InboundPerson = dto.InboundPerson ?? "",
                Operator = dto.Handler ?? "",
                Remark = dto.Remark ?? "",
                Status = "待确认",
                CreatedAt = DateTime.Now
            };

            if (_context.EquipmentInbounds != null)
            {
                _context.EquipmentInbounds.Add(inbound);
                await _context.SaveChangesAsync();

                // 添加入库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.EquipmentInboundItems != null)
                {
                    foreach (var item in dto.Items)
                    {
                        // 使用前端发送的设备编号
                        var deviceCode = item.DeviceCode;
                        
                        var inboundItem = new EquipmentInboundItem
                        {
                            InboundId = inbound.Id,
                            DeviceName = item.EquipmentName ?? "",
                            DeviceCode = deviceCode ?? "",
                            Brand = item.Brand,
                            Model = item.Model,
                            Unit = item.Unit,
                            Quantity = item.Quantity,
                            Status = item.Status,
                            SerialNumber = item.SnCode,
                            SnCode = item.SnCode, // 同时存储到SnCode字段
                            Accessories = item.Accessories,
                            EquipmentType = 2,
                            CreatedAt = DateTime.Now
                        };
                        _context.EquipmentInboundItems.Add(inboundItem);
                    }
                    await _context.SaveChangesAsync();
                }
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待确认";
            return dto;
        }

        public async Task<GeneralEquipmentPurchaseInboundDTO> ConfirmGeneralEquipmentPurchaseInboundAsync(int id)
        {
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 打印入库记录的详细信息，包括SN码
            Console.WriteLine($"[ConfirmGeneralEquipmentPurchaseInboundAsync] 开始确认入库，记录ID: {id}");
            if (inbound.EquipmentInboundItems != null)
            {
                foreach (var item in inbound.EquipmentInboundItems)
                {
                    Console.WriteLine($"[ConfirmGeneralEquipmentPurchaseInboundAsync] 入库项: 设备名称={item.DeviceName}, 设备编号={item.DeviceCode}, SerialNumber={item.SerialNumber}, SnCode={item.SnCode}");
                }
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 创建设备记录
                if (inbound.EquipmentInboundItems != null && _context.GeneralEquipments != null)
                {
                    foreach (var item in inbound.EquipmentInboundItems)
                    {
                        // 打印创建设备的详细信息，包括SN码
                        Console.WriteLine($"[ConfirmGeneralEquipmentPurchaseInboundAsync] 创建设备: 设备名称={item.DeviceName}, 设备编号={item.DeviceCode}, 要使用的SN码={item.SerialNumber ?? item.SnCode}");
                        
                        // 创建新的通用设备记录
                        var generalEquipment = new GeneralEquipment
                        {
                            SortOrder = 0, // 默认排序
                            DeviceType = 2, // 2表示通用设备
                            DeviceName = item.DeviceName ?? "",
                            DeviceCode = item.DeviceCode ?? "",
                            Brand = item.Brand ?? "",
                            Model = item.Model ?? "",
                            Unit = item.Unit ?? "",
                            Quantity = 1,
                            DeviceStatus = (int)DeviceStatus.Normal, // 正常
                            UseStatus = (int)UseStatus.Unused, // 未使用
                            Status = item.Status ?? "",
                            SerialNumber = item.SerialNumber ?? item.SnCode, // 优先使用SerialNumber字段
                            Accessories = item.Accessories,
                            NameSequence = 0, // 默认序列号
                            CreatedAt = DateTime.Now
                        };
                        _context.GeneralEquipments.Add(generalEquipment);
                        Console.WriteLine($"[ConfirmGeneralEquipmentPurchaseInboundAsync] 设备创建成功: 设备编号={generalEquipment.DeviceCode}, SN码={generalEquipment.SerialNumber}");
                    }
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
                Items = inbound.EquipmentInboundItems?.Select(item => new GeneralEquipmentPurchaseInboundItemDTO
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
                }).ToList() ?? new List<GeneralEquipmentPurchaseInboundItemDTO>()
            };
        }

        // 耗材采购入库管理
        public async Task<List<ConsumablePurchaseInboundDTO>> GetConsumablePurchaseInboundsAsync()
        {
            if (_context.EquipmentInbounds == null)
            {
                return new List<ConsumablePurchaseInboundDTO>();
            }
            var inbounds = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new ConsumablePurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber ?? "",
                DeliveryPerson = i.DeliveryPerson ?? "",
                Inspector = i.Inspector ?? "",
                InboundPerson = i.InboundPerson ?? "",
                InboundDate = i.InboundDate,
                Handler = i.Operator ?? "",
                WarehouseKeeper = i.Operator ?? "", // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark ?? "",
                Status = i.Status ?? "待确认",
                Items = i.EquipmentInboundItems?.Select(item => new ConsumablePurchaseInboundItemDTO
                {
                    Id = item.Id,
                    ConsumableId = 0, // 需要根据实际情况设置
                    ConsumableName = item.DeviceName ?? "",
                    Brand = item.Brand ?? "",
                    Model = item.Model ?? "",
                    Unit = item.Unit ?? "",
                    Inventory = 0, // 需要根据实际情况计算
                    Quantity = item.Quantity,
                    Status = item.Status ?? ""
                }).ToList() ?? new List<ConsumablePurchaseInboundItemDTO>()
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
                DeliveryPerson = dto.DeliveryPerson ?? "",
                Inspector = dto.Inspector ?? "",
                InboundPerson = dto.InboundPerson ?? "",
                Operator = dto.Handler ?? "",
                Remark = dto.Remark ?? "",
                Status = "待确认",
                CreatedAt = DateTime.Now
            };

            if (_context.EquipmentInbounds != null)
            {
                _context.EquipmentInbounds.Add(inbound);
                await _context.SaveChangesAsync();

                // 添加入库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.EquipmentInboundItems != null)
                {
                    foreach (var item in dto.Items)
                    {
                        // 生成耗材编号
                        var deviceCode = await GenerateDeviceCodeAsync(item.ConsumableName ?? "", item.Brand ?? "", item.Model ?? "", 3);
                        
                        var inboundItem = new EquipmentInboundItem
                        {
                            InboundId = inbound.Id,
                            DeviceName = item.ConsumableName ?? "",
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
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            dto.Status = "待确认";
            return dto;
        }

        public async Task<ConsumablePurchaseInboundDTO> ConfirmConsumablePurchaseInboundAsync(int id)
        {
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 更新入库状态为已完成
            inbound.Status = "已完成";
            inbound.UpdatedAt = DateTime.Now;

            // 更新耗材库存
            if (inbound.EquipmentInboundItems != null && _context.Consumables != null)
            {
                foreach (var item in inbound.EquipmentInboundItems)
                {
                    // 查找或创建耗材
                    var consumable = await _context.Consumables.FirstOrDefaultAsync(c => 
                        c.Name == item.DeviceName && 
                        (c.Brand == item.Brand || (c.Brand == null && (item.Brand == null || item.Brand == ""))) && 
                        (c.ModelSpecification == item.Model || (c.ModelSpecification == null && (item.Model == null || item.Model == "")))
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
                Items = inbound.EquipmentInboundItems?.Select(item => new ConsumablePurchaseInboundItemDTO
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
                }).ToList() ?? new List<ConsumablePurchaseInboundItemDTO>()
            };
        }

        public async Task DeleteConsumablePurchaseInboundAsync(int id)
        {
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 3).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 如果入库记录已完成，需要减少消耗品库存
            if (inbound.Status == "已完成" && inbound.EquipmentInboundItems != null && _context.Consumables != null)
            {
                foreach (var item in inbound.EquipmentInboundItems)
                {
                    var consumable = await _context.Consumables.FirstOrDefaultAsync(c => 
                        c.Name == item.DeviceName && 
                        (c.Brand == item.Brand || (c.Brand == null && (item.Brand == null || item.Brand == ""))) && 
                        (c.ModelSpecification == item.Model || (c.ModelSpecification == null && (item.Model == null || item.Model == "")))
                    );
                    if (consumable != null)
                    {
                        consumable.RemainingQuantity = Math.Max(0, consumable.RemainingQuantity - item.Quantity);
                        consumable.TotalQuantity = Math.Max(0, consumable.TotalQuantity - item.Quantity);
                    }
                }
            }

            // 删除入库明细
            if (_context.EquipmentInboundItems != null && inbound.EquipmentInboundItems != null)
            {
                _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            }
            // 删除入库记录
            _context.EquipmentInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 删除专用设备采购入库记录
        public async Task DeleteSpecialEquipmentPurchaseInboundAsync(int id)
        {
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 1).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 收集需要删除的设备编号
            var deviceCodes = inbound.EquipmentInboundItems?.Select(item => item.DeviceCode).ToList() ?? new List<string>();

            // 删除相关的专用设备记录和对应的库存记录
            if (deviceCodes.Count > 0 && _context.SpecialEquipments != null && _context.Inventories != null)
            {
                var devicesToDelete = await _context.SpecialEquipments.Where(d => deviceCodes.Contains(d.DeviceCode)).ToListAsync();
                var deviceIds = devicesToDelete.Select(d => d.Id).ToList();
                
                // 删除对应的库存记录
                var inventoriesToDelete = await _context.Inventories.Where(i => deviceIds.Contains(i.SpecialEquipmentId.GetValueOrDefault())).ToListAsync();
                _context.Inventories.RemoveRange(inventoriesToDelete);
                
                // 删除专用设备记录
                _context.SpecialEquipments.RemoveRange(devicesToDelete);
            }

            // 删除入库明细
            if (_context.EquipmentInboundItems != null && inbound.EquipmentInboundItems != null)
            {
                _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            }
            // 删除入库记录
            _context.EquipmentInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 删除通用设备采购入库记录
        public async Task DeleteGeneralEquipmentPurchaseInboundAsync(int id)
        {
            if (_context.EquipmentInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.EquipmentInbounds.Where(e => e.EquipmentType == 2).Include(i => i.EquipmentInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 收集需要删除的设备编号
            var deviceCodes = inbound.EquipmentInboundItems?.Select(item => item.DeviceCode).ToList() ?? new List<string>();

            // 删除相关的通用设备记录和对应的库存记录
            if (deviceCodes.Count > 0 && _context.GeneralEquipments != null && _context.Inventories != null)
            {
                var devicesToDelete = await _context.GeneralEquipments.Where(d => deviceCodes.Contains(d.DeviceCode)).ToListAsync();
                var deviceIds = devicesToDelete.Select(d => d.Id).ToList();
                
                // 删除对应的库存记录
                var inventoriesToDelete = await _context.Inventories.Where(i => deviceIds.Contains(i.GeneralEquipmentId.GetValueOrDefault())).ToListAsync();
                _context.Inventories.RemoveRange(inventoriesToDelete);
                
                // 删除通用设备记录
                _context.GeneralEquipments.RemoveRange(devicesToDelete);
            }

            // 删除入库明细
            if (_context.EquipmentInboundItems != null && inbound.EquipmentInboundItems != null)
            {
                _context.EquipmentInboundItems.RemoveRange(inbound.EquipmentInboundItems);
            }
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

        // 删除项目入库记录
        public async Task DeleteProjectInboundAsync(int id)
        {
            if (_context.ProjectInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.ProjectInbounds.Include(i => i.ProjectInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 还原设备和耗材状态
            if (inbound.ProjectInboundItems != null)
            {
                foreach (var item in inbound.ProjectInboundItems)
                {
                    // 处理设备（专用设备和通用设备）
                    if (item.ItemType == 1 || item.ItemType == 2)
                    {
                        // 还原设备使用状态为使用中
                        if (item.ItemType == 1 && _context.SpecialEquipments != null)
                        {
                            var specialEquipment = await _context.SpecialEquipments.FirstOrDefaultAsync(e => e.Id == item.ItemId);
                            if (specialEquipment != null)
                            {
                                // 还原为使用中状态
                                specialEquipment.UseStatus = (int)UseStatus.InUse;
                                specialEquipment.UpdatedAt = DateTime.Now;
                            }
                        }
                        else if (item.ItemType == 2 && _context.GeneralEquipments != null)
                        {
                            var generalEquipment = await _context.GeneralEquipments.FirstOrDefaultAsync(e => e.Id == item.ItemId);
                            if (generalEquipment != null)
                            {
                                // 还原为使用中状态
                                generalEquipment.UseStatus = (int)UseStatus.InUse;
                                generalEquipment.UpdatedAt = DateTime.Now;
                            }
                        }
                    }
                    // 处理耗材
                    else if (item.ItemType == 3 && _context.Consumables != null)
                    {
                        // 查找耗材并减少库存
                        var consumable = await _context.Consumables.FirstOrDefaultAsync(c =>
                            c.Name == item.ItemName &&
                            (c.Brand == item.Brand || (c.Brand == null && (item.Brand == null || item.Brand == ""))) &&
                            (c.ModelSpecification == item.Model || (c.ModelSpecification == null && (item.Model == null || item.Model == "")))
                        );

                        if (consumable != null)
                        {
                            // 减少耗材库存
                            consumable.RemainingQuantity = Math.Max(0, consumable.RemainingQuantity - item.Quantity);
                            consumable.TotalQuantity = Math.Max(0, consumable.TotalQuantity - item.Quantity);
                            consumable.UpdatedAt = DateTime.Now;
                        }
                    }
                }
            }

            // 删除入库明细
            if (_context.ProjectInboundItems != null && inbound.ProjectInboundItems != null)
            {
                _context.ProjectInboundItems.RemoveRange(inbound.ProjectInboundItems);
            }
            // 删除入库记录
            _context.ProjectInbounds.Remove(inbound);
            
            await _context.SaveChangesAsync();
        }

        // 更新项目入库记录
        public async Task<ProjectInboundDTO> UpdateProjectInboundAsync(int id, ProjectInboundDTO dto)
        {
            if (_context.ProjectInbounds == null)
            {
                throw new Exception("入库记录不存在");
            }
            var inbound = await _context.ProjectInbounds.Include(i => i.ProjectInboundItems).FirstOrDefaultAsync(i => i.Id == id);
            if (inbound == null)
            {
                throw new Exception("入库记录不存在");
            }

            // 获取关联的出库单ID
            int outboundOrderId = dto.OutboundOrderId;
            if (outboundOrderId == 0 && _context.ProjectInboundOutbounds != null)
            {
                var inboundOutbound = await _context.ProjectInboundOutbounds.FirstOrDefaultAsync(io => io.ProjectInboundId == id);
                if (inboundOutbound != null)
                {
                    outboundOrderId = inboundOutbound.ProjectOutboundId;
                }
            }

            // 开始事务
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 更新入库记录基本信息
                inbound.InboundNumber = dto.InboundNumber;
                inbound.ProjectName = dto.ProjectName;
                inbound.ProjectManager = dto.ProjectManager;
                inbound.ContactPhone = dto.ContactPhone;
                inbound.ProjectTime = dto.ProjectTime;
                inbound.UsageLocation = dto.UsageLocation;
                inbound.Handler = dto.Handler;
                inbound.Inspector = dto.Inspector;
                inbound.WarehouseKeeper = dto.WarehouseKeeper;
                inbound.InboundDate = !string.IsNullOrEmpty(dto.InboundDate) ? DateTime.Parse(dto.InboundDate) : DateTime.Now;
                inbound.Remark = dto.Remark;
                inbound.Status = dto.Status;
                inbound.IsCompleted = dto.Status == "全部入库";
                inbound.UpdatedAt = DateTime.Now;

                // 删除旧的入库明细
                if (_context.ProjectInboundItems != null && inbound.ProjectInboundItems != null)
                {
                    _context.ProjectInboundItems.RemoveRange(inbound.ProjectInboundItems);
                }

                // 添加新的入库明细
                if (dto.Items != null && dto.Items.Count > 0 && _context.ProjectInboundItems != null)
                {
                    foreach (var item in dto.Items)
                    {
                        var inboundItem = new ProjectInboundItem
                        {
                            InboundId = inbound.Id,
                            ItemType = item.ItemType > 0 ? item.ItemType : 1, // 使用传入的ItemType，默认为1
                            ItemId = item.EquipmentId,
                            ItemName = item.EquipmentName,
                            DeviceCode = item.DeviceCode,
                            SerialNumber = item.SerialNumber,
                            Brand = item.Brand,
                            Model = item.Model,
                            Quantity = item.Quantity,
                            Unit = item.Unit,
                            Accessories = item.Accessories,
                            DeviceStatus = item.Status,
                            CreatedAt = DateTime.Now
                        };
                        _context.ProjectInboundItems.Add(inboundItem);
                    }
                }

                // 更新对应出库记录的状态
                if (outboundOrderId > 0 && _context.ProjectOutbounds != null)
                {
                    var outbound = await _context.ProjectOutbounds.FirstOrDefaultAsync(o => o.Id == outboundOrderId);
                    if (outbound != null)
                    {
                        // 根据入库状态更新出库记录状态
                        if (dto.Status == "全部入库")
                        {
                            outbound.IsCompleted = true;
                            outbound.CompletedAt = DateTime.Now;
                            outbound.InboundStatus = "已完成";
                        } else if (dto.Status == "部分入库")
                        {
                            outbound.InboundStatus = "部分入库";
                        }
                    }
                }

                // 更新设备使用状态和耗材库存信息
                if (dto.Items != null && dto.Items.Count > 0)
                {
                    foreach (var item in dto.Items)
                    {
                        // 检查是否为专用设备（ItemType == 1）
                        if (item.ItemType == 1 && _context.SpecialEquipments != null)
                        {
                            // 查找专用设备
                            var specialEquipment = await _context.SpecialEquipments.FirstOrDefaultAsync(e => e.Id == item.EquipmentId);
                            if (specialEquipment != null)
                            {
                                // 更新设备使用状态为未使用
                                specialEquipment.UseStatus = (int)UseStatus.Unused;
                                // 更新设备状态
                                if (!string.IsNullOrEmpty(item.Status))
                                {
                                    specialEquipment.Status = item.Status;
                                }
                                specialEquipment.UpdatedAt = DateTime.Now;
                            }
                        }
                        // 检查是否为通用设备（ItemType == 2）
                        else if (item.ItemType == 2 && _context.GeneralEquipments != null)
                        {
                            // 查找通用设备
                            var generalEquipment = await _context.GeneralEquipments.FirstOrDefaultAsync(e => e.Id == item.EquipmentId);
                            if (generalEquipment != null)
                            {
                                // 更新设备使用状态为未使用
                                generalEquipment.UseStatus = (int)UseStatus.Unused;
                                // 更新设备状态
                                if (!string.IsNullOrEmpty(item.Status))
                                {
                                    generalEquipment.Status = item.Status;
                                }
                                generalEquipment.UpdatedAt = DateTime.Now;
                            }
                        }
                        // 检查是否为耗材类型（ItemType == 3）
                        else if (item.ItemType == 3 && _context.Consumables != null)
                        {
                            // 只有当入库记录状态不是从"部分入库"更新为"全部入库"时，才更新耗材库存
                            // 因为耗材库存已经在创建"部分入库"记录时更新过了
                            if (!(inbound.Status == "部分入库" && dto.Status == "全部入库"))
                            {
                                // 查找耗材
                                var consumable = await _context.Consumables.FirstOrDefaultAsync(c =>
                                    c.Name == item.EquipmentName &&
                                    (c.Brand == item.Brand || (c.Brand == null && (item.Brand == null || item.Brand == ""))) &&
                                    (c.ModelSpecification == item.Model || (c.ModelSpecification == null && (item.Model == null || item.Model == "")))
                                );

                                if (consumable != null)
                                {
                                    // 增加耗材库存（入库数量）
                                    consumable.RemainingQuantity += item.Quantity;
                                    consumable.TotalQuantity += item.Quantity;
                                    consumable.UpdatedAt = DateTime.Now;
                                }
                                else
                                {
                                    // 如果耗材不存在，创建新的耗材记录
                                    consumable = new Consumable
                                    {
                                        Name = item.EquipmentName,
                                        Brand = string.IsNullOrEmpty(item.Brand) ? null : item.Brand,
                                        ModelSpecification = string.IsNullOrEmpty(item.Model) ? null : item.Model,
                                        Unit = item.Unit,
                                        TotalQuantity = item.Quantity,
                                        OriginalQuantity = item.Quantity,
                                        UsedQuantity = 0,
                                        RemainingQuantity = item.Quantity,
                                        Status = "正常",
                                        CreatedAt = DateTime.Now
                                    };
                                    _context.Consumables.Add(consumable);
                                }
                            }
                        }
                    }
                }
                


                // 保存所有更改
                Console.WriteLine($"开始保存所有更改...");
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                Console.WriteLine($"所有更改保存成功");
            }
            catch (Exception ex)
            {
                // 回滚事务
                await transaction.RollbackAsync();
                Console.WriteLine($"保存更改时发生异常: {ex.Message}");
                throw;
            }

            // 返回更新后的入库记录
            return new ProjectInboundDTO
            {
                Id = inbound.Id,
                InboundNumber = inbound.InboundNumber ?? "",
                OutboundOrderId = dto.OutboundOrderId, // 返回传入的出库单ID
                ProjectName = inbound.ProjectName ?? "",
                ProjectManager = inbound.ProjectManager ?? "",
                ContactPhone = inbound.ContactPhone ?? "",
                ProjectTime = inbound.ProjectTime ?? "",
                UsageLocation = inbound.UsageLocation ?? "",
                Handler = inbound.Handler ?? "",
                Inspector = inbound.Inspector ?? "",
                WarehouseKeeper = inbound.WarehouseKeeper ?? "",
                InboundDate = inbound.InboundDate.ToString("yyyy-MM-dd"),
                Remark = inbound.Remark ?? "",
                Status = inbound.Status ?? "",
                IsCompleted = inbound.IsCompleted,
                Items = inbound.ProjectInboundItems?.Select(item => new ProjectInboundItemDTO
                {
                    Id = item.Id,
                    ProjectInboundId = item.InboundId,
                    EquipmentId = item.ItemId,
                    EquipmentName = item.ItemName ?? "",
                    DeviceCode = item.DeviceCode,
                    SerialNumber = item.SerialNumber,
                    Brand = item.Brand ?? "",
                    Model = item.Model ?? "",
                    Quantity = item.Quantity,
                    Unit = item.Unit ?? "",
                    Accessories = item.Accessories,
                    Status = item.DeviceStatus ?? "",
                    ItemType = item.ItemType
                }).ToList() ?? new List<ProjectInboundItemDTO>()
            };
        }

        // 生成设备编号
        public async Task<string> GenerateDeviceCodeAsync(string deviceName, string brand, string model, int deviceType)
        {
            try
            {
                Console.WriteLine($"开始生成设备编号: deviceName={deviceName}, brand={brand}, model={model}, deviceType={deviceType}");
                
                // 处理空值
                deviceName = deviceName ?? "";
                brand = brand ?? "";
                model = model ?? "";
                
                // 验证设备名称不能为空
                if (string.IsNullOrWhiteSpace(deviceName))
                {
                    throw new ArgumentException("设备名称不能为空");
                }
                
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
                // 只从当前实际存在的设备表中查询，不查询历史入库记录
                int maxSequence = 0;
                
                if (deviceType == 1 && _context.SpecialEquipments != null) // 专用设备
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
                else if (deviceType == 2 && _context.GeneralEquipments != null) // 通用设备
                {
                    // 查找该设备名称、品牌、型号的所有设备
                    var devices = await _context.GeneralEquipments
                        .Where(d => d.DeviceName == deviceName)
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
                    // 耗材表中没有 ConsumableCode 字段，需要从其他方式生成编号
                    // 这里可以添加耗材的编号生成逻辑
                }

                // 生成新的编号
                maxSequence++;
                string newDeviceCode = $"{prefix}-{deviceName}-{maxSequence.ToString().PadLeft(3, '0')}";
                Console.WriteLine($"生成的新设备编号: {newDeviceCode}");
                return newDeviceCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"生成设备编号时发生错误: {ex.Message}");
                Console.WriteLine($"错误堆栈: {ex.StackTrace}");
                throw;
            }
        }
    }
}