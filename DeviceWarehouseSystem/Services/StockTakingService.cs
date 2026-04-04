using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Enums;
using DeviceWarehouseSystem.Extensions;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Services;

/// <summary>
/// 库存盘点服务
/// </summary>
public class StockTakingService
{
    private readonly DeviceWarehouseContext _context;

    public StockTakingService(DeviceWarehouseContext context)
    {
        _context = context;
    }

    /// <summary>
    /// 获取所有盘点单
    /// </summary>
    public async Task<IEnumerable<StockTakingDTO>> GetAllStockTakingsAsync()
    {
        var stockTakings = await _context.StockTakings
            .Include(st => st.StockTakingItems)
            .OrderByDescending(st => st.CreatedAt)
            .ToListAsync();

        return stockTakings.Select(MapToDTO);
    }

    /// <summary>
    /// 根据ID获取盘点单
    /// </summary>
    public async Task<StockTakingDTO?> GetStockTakingByIdAsync(int id)
    {
        var stockTaking = await _context.StockTakings
            .Include(st => st.StockTakingItems)
            .FirstOrDefaultAsync(st => st.Id == id);

        return stockTaking == null ? null : MapToDTO(stockTaking);
    }

    /// <summary>
    /// 创建盘点单
    /// </summary>
    public async Task<StockTakingDTO> CreateStockTakingAsync(CreateStockTakingDTO dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 生成盘点单号
            var stockTakingNo = await GenerateStockTakingNoAsync();

            var stockTaking = new StockTaking
            {
                StockTakingNo = stockTakingNo,
                StockTakingType = dto.StockTakingType,
                Status = "待盘点",
                Remark = dto.Remark,
                CreatedAt = DateTime.Now,
                CreatedBy = dto.CreatedBy
            };

            _context.StockTakings.Add(stockTaking);
            await _context.SaveChangesAsync();

            // 根据盘点类型生成盘点明细
            var items = await GenerateStockTakingItemsAsync(stockTaking.Id, dto.StockTakingType);
            _context.StockTakingItems.AddRange(items);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return MapToDTO(stockTaking);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("创建盘点单失败: " + ex.Message);
        }
    }

    /// <summary>
    /// 开始盘点
    /// </summary>
    public async Task<StockTakingDTO?> StartStockTakingAsync(int id, string @operator)
    {
        var stockTaking = await _context.StockTakings.FindAsync(id);
        if (stockTaking == null) return null;

        if (stockTaking.Status != StockTakingStatus.Pending.ToStockTakingStatusString())
        {
            throw new Exception("只能开始待盘点状态的盘点单");
        }

        stockTaking.Status = StockTakingStatus.InProgress.ToStockTakingStatusString();
        stockTaking.StartTime = DateTime.Now;
        stockTaking.Operator = @operator;

        await _context.SaveChangesAsync();
        return MapToDTO(stockTaking);
    }

    /// <summary>
    /// 更新盘点明细
    /// </summary>
    public async Task<StockTakingItemDTO?> UpdateStockTakingItemAsync(int stockTakingId, UpdateStockTakingItemDTO dto)
    {
        var item = await _context.StockTakingItems
            .FirstOrDefaultAsync(i => i.StockTakingId == stockTakingId && i.ItemId == dto.ItemId);

        if (item == null) return null;

        item.ActualQuantity = dto.ActualQuantity;
        item.DifferenceQuantity = dto.ActualQuantity.HasValue ? dto.ActualQuantity.Value - item.SystemQuantity : null;
        item.DifferenceReason = dto.DifferenceReason;
        item.Status = "已盘点";
        item.CheckTime = DateTime.Now;

        await _context.SaveChangesAsync();
        return MapToItemDTO(item);
    }

    /// <summary>
    /// 完成盘点
    /// </summary>
    public async Task<StockTakingDTO?> CompleteStockTakingAsync(int id, CompleteStockTakingDTO dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var stockTaking = await _context.StockTakings
                .Include(st => st.StockTakingItems)
                .FirstOrDefaultAsync(st => st.Id == id);

            if (stockTaking == null) return null;

            if (stockTaking.Status != StockTakingStatus.InProgress.ToStockTakingStatusString())
            {
                throw new Exception("只能完成盘点中状态的盘点单");
            }

            // 处理需要调整的库存
            foreach (var adjustment in dto.Adjustments)
            {
                if (adjustment.ShouldAdjust)
                {
                    var item = stockTaking.StockTakingItems.FirstOrDefault(i => i.Id == adjustment.StockTakingItemId);
                    if (item != null && item.ActualQuantity.HasValue)
                    {
                        await AdjustInventoryAsync(item);
                    }
                }
            }

            stockTaking.Status = StockTakingStatus.Completed.ToStockTakingStatusString();
            stockTaking.EndTime = DateTime.Now;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToDTO(stockTaking);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("完成盘点失败: " + ex.Message);
        }
    }

    /// <summary>
    /// 删除盘点单
    /// </summary>
    public async Task<bool> DeleteStockTakingAsync(int id)
    {
        var stockTaking = await _context.StockTakings.FindAsync(id);
        if (stockTaking == null) return false;

        if (stockTaking.Status == "已完成")
        {
            throw new Exception("已完成的盘点单不能删除");
        }

        _context.StockTakings.Remove(stockTaking);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// 生成盘点单号
    /// </summary>
    private async Task<string> GenerateStockTakingNoAsync()
    {
        var dateStr = DateTime.Now.ToString("yyyyMMdd");
        var count = await _context.StockTakings
            .CountAsync(st => st.CreatedAt.Date == DateTime.Now.Date);
        return $"PD{dateStr}{(count + 1).ToString().PadLeft(4, '0')}";
    }

    /// <summary>
    /// 生成盘点明细
    /// </summary>
    private async Task<List<StockTakingItem>> GenerateStockTakingItemsAsync(int stockTakingId, string stockTakingType)
    {
        var items = new List<StockTakingItem>();

        // 专用设备
        if (stockTakingType == "全部" || stockTakingType == "专用设备")
        {
            var specialEquipments = await _context.SpecialEquipments.ToListAsync();
            items.AddRange(specialEquipments.Select(e => new StockTakingItem
            {
                StockTakingId = stockTakingId,
                Category = "专用设备",
                ItemId = e.Id,
                ItemName = e.DeviceName,
                Brand = e.Brand,
                Model = e.Model,
                SystemQuantity = e.Quantity,
                Status = "待盘点",
                Unit = e.Unit,
                Warehouse = e.Warehouse,
                Location = e.Location
            }));
        }

        // 通用设备
        if (stockTakingType == "全部" || stockTakingType == "通用设备")
        {
            var generalEquipments = await _context.GeneralEquipments.ToListAsync();
            items.AddRange(generalEquipments.Select(e => new StockTakingItem
            {
                StockTakingId = stockTakingId,
                Category = "通用设备",
                ItemId = e.Id,
                ItemName = e.DeviceName,
                Brand = e.Brand,
                Model = e.Model,
                SystemQuantity = e.Quantity,
                Status = "待盘点",
                Unit = e.Unit,
                Warehouse = e.Warehouse,
                Location = e.Location
            }));
        }

        // 耗材
        if (stockTakingType == "全部" || stockTakingType == "耗材")
        {
            var consumables = await _context.Consumables.ToListAsync();
            items.AddRange(consumables.Select(c => new StockTakingItem
            {
                StockTakingId = stockTakingId,
                Category = "耗材",
                ItemId = c.Id,
                ItemName = c.Name,
                Brand = c.Brand,
                Model = c.ModelSpecification,
                SystemQuantity = c.RemainingQuantity,
                Status = "待盘点",
                Unit = c.Unit,
                Warehouse = "主仓库",
                Location = c.Location
            }));
        }

        // 原材料
        if (stockTakingType == "全部" || stockTakingType == "原材料")
        {
            var rawMaterials = await _context.RawMaterials.ToListAsync();
            items.AddRange(rawMaterials.Select(r => new StockTakingItem
            {
                StockTakingId = stockTakingId,
                Category = "原材料",
                ItemId = r.Id,
                ItemName = r.ProductName,
                Brand = r.Brand,
                Model = r.Specification,
                SystemQuantity = r.RemainingQuantity,
                Status = "待盘点",
                Unit = r.Unit,
                Warehouse = "原材料仓库",
                Location = r.Location
            }));
        }

        return items;
    }

    /// <summary>
    /// 调整库存
    /// </summary>
    private async Task AdjustInventoryAsync(StockTakingItem item)
    {
        var difference = item.ActualQuantity!.Value - item.SystemQuantity;

        switch (item.Category)
        {
            case "专用设备":
                var specialEquipment = await _context.SpecialEquipments.FindAsync(item.ItemId);
                if (specialEquipment != null)
                {
                    specialEquipment.Quantity = item.ActualQuantity.Value;
                    specialEquipment.UpdatedAt = DateTime.Now;
                }
                break;

            case "通用设备":
                var generalEquipment = await _context.GeneralEquipments.FindAsync(item.ItemId);
                if (generalEquipment != null)
                {
                    generalEquipment.Quantity = item.ActualQuantity.Value;
                    generalEquipment.UpdatedAt = DateTime.Now;
                }
                break;

            case "耗材":
                var consumable = await _context.Consumables.FindAsync(item.ItemId);
                if (consumable != null)
                {
                    consumable.TotalQuantity += difference;
                    consumable.RemainingQuantity = item.ActualQuantity.Value;
                    consumable.UpdatedAt = DateTime.Now;
                }
                break;

            case "原材料":
                var rawMaterial = await _context.RawMaterials.FindAsync(item.ItemId);
                if (rawMaterial != null)
                {
                    rawMaterial.TotalQuantity += difference;
                    rawMaterial.RemainingQuantity = item.ActualQuantity.Value;
                    rawMaterial.UpdatedAt = DateTime.Now;
                }
                break;
        }
    }

    /// <summary>
    /// 映射到DTO
    /// </summary>
    private StockTakingDTO MapToDTO(StockTaking stockTaking)
    {
        return new StockTakingDTO
        {
            Id = stockTaking.Id,
            StockTakingNo = stockTaking.StockTakingNo,
            StockTakingType = stockTaking.StockTakingType,
            Status = stockTaking.Status,
            StartTime = stockTaking.StartTime,
            EndTime = stockTaking.EndTime,
            Operator = stockTaking.Operator,
            Remark = stockTaking.Remark,
            CreatedAt = stockTaking.CreatedAt,
            CreatedBy = stockTaking.CreatedBy,
            TotalItems = stockTaking.StockTakingItems.Count,
            CheckedItems = stockTaking.StockTakingItems.Count(i => i.Status == "已盘点"),
            Items = stockTaking.StockTakingItems.Select(MapToItemDTO).ToList()
        };
    }

    /// <summary>
    /// 映射明细到DTO
    /// </summary>
    private StockTakingItemDTO MapToItemDTO(StockTakingItem item)
    {
        return new StockTakingItemDTO
        {
            Id = item.Id,
            StockTakingId = item.StockTakingId,
            Category = item.Category,
            ItemId = item.ItemId,
            ItemName = item.ItemName,
            Brand = item.Brand,
            Model = item.Model,
            SystemQuantity = item.SystemQuantity,
            ActualQuantity = item.ActualQuantity,
            DifferenceQuantity = item.DifferenceQuantity,
            DifferenceReason = item.DifferenceReason,
            Status = item.Status,
            CheckTime = item.CheckTime,
            Unit = item.Unit,
            Warehouse = item.Warehouse,
            Location = item.Location
        };
    }
}
