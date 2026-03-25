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

        // 设备采购入库管理
        public async Task<List<EquipmentPurchaseInboundDTO>> GetEquipmentPurchaseInboundsAsync()
        {
            var inbounds = await _context.EquipmentInbounds.Include(i => i.EquipmentInboundItems).ToListAsync();
            return inbounds.Select(i => new EquipmentPurchaseInboundDTO
            {
                Id = i.Id,
                InboundNumber = i.InboundNumber,
                Handler = i.Operator,
                WarehouseKeeper = i.Operator, // 临时使用Operator作为WarehouseKeeper
                Remark = i.Remark,
                Items = i.EquipmentInboundItems.Select(item => new EquipmentPurchaseInboundItemDTO
                {
                    Id = item.Id,
                    EquipmentId = 0, // 需要根据实际情况设置
                    EquipmentName = item.DeviceName,
                    Brand = item.Brand,
                    Model = item.Model,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    Status = item.Status
                }).ToList()
            }).ToList();
        }

        public async Task<EquipmentPurchaseInboundDTO> CreateEquipmentPurchaseInboundAsync(EquipmentPurchaseInboundDTO dto)
        {
            // 生成入库单号
            var inboundNumber = GenerateInboundNumber();

            var inbound = new EquipmentInbound
            {
                InboundNumber = inboundNumber,
                InboundDate = DateTime.Now,
                EquipmentType = 1, // 1表示设备采购入库
                DeliveryPerson = dto.Supplier, // 使用 DeliveryPerson 字段存储供应商信息
                Operator = dto.Handler,
                Remark = dto.Remark,
                Status = "已完成",
                CreatedAt = DateTime.Now
            };

            _context.EquipmentInbounds.Add(inbound);
            await _context.SaveChangesAsync();

            // 添加入库明细
            if (dto.Items != null && dto.Items.Count > 0)
            {
                foreach (var item in dto.Items)
                {
                    var inboundItem = new EquipmentInboundItem
                    {
                        InboundId = inbound.Id,
                        DeviceName = item.EquipmentName,
                        Brand = item.Brand,
                        Model = item.Model,
                        Specification = item.Specification,
                        Unit = item.Unit,
                        Quantity = item.Quantity,
                        Status = item.Status,
                        CreatedAt = DateTime.Now
                    };
                    _context.EquipmentInboundItems.Add(inboundItem);
                }
                await _context.SaveChangesAsync();
            }

            dto.Id = inbound.Id;
            dto.InboundNumber = inboundNumber;
            return dto;
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
                Items = i.RawMaterialInboundItems.Select(item => new RawMaterialInboundItemDTO
                {
                    Id = item.Id,
                    RawMaterialId = item.RawMaterialId,
                    Quantity = item.Quantity,
                    Remark = item.Remark
                }).ToList()
            }).ToList();
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
    }
}