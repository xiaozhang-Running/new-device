using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.DTOs;

/// <summary>
/// 库存盘点单DTO
/// </summary>
public class StockTakingDTO
{
    public int Id { get; set; }
    public string StockTakingNo { get; set; } = null!;
    public string StockTakingType { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public int TotalItems { get; set; }
    public int CheckedItems { get; set; }
    public List<StockTakingItemDTO> Items { get; set; } = new();
}

/// <summary>
/// 库存盘点明细DTO
/// </summary>
public class StockTakingItemDTO
{
    public int Id { get; set; }
    public int StockTakingId { get; set; }
    public string Category { get; set; } = null!;
    public int ItemId { get; set; }
    public string ItemName { get; set; } = null!;
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public int SystemQuantity { get; set; }
    public int? ActualQuantity { get; set; }
    public int? DifferenceQuantity { get; set; }
    public string? DifferenceReason { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? CheckTime { get; set; }
    public string? Unit { get; set; }
    public string? Warehouse { get; set; }
    public string? Location { get; set; }
}

/// <summary>
/// 创建盘点单DTO
/// </summary>
public class CreateStockTakingDTO
{
    public string StockTakingType { get; set; } = null!;
    public string? Remark { get; set; }
    public string? CreatedBy { get; set; }
}

/// <summary>
/// 更新盘点明细DTO
/// </summary>
public class UpdateStockTakingItemDTO
{
    public int ItemId { get; set; }
    public int ActualQuantity { get; set; }
    public string? DifferenceReason { get; set; }
}

/// <summary>
/// 完成盘点DTO
/// </summary>
public class CompleteStockTakingDTO
{
    public List<StockTakingAdjustmentDTO> Adjustments { get; set; } = new();
}

/// <summary>
/// 盘点调整DTO
/// </summary>
public class StockTakingAdjustmentDTO
{
    public int ItemId { get; set; }
    public int StockTakingItemId { get; set; }
    public bool ShouldAdjust { get; set; }
}
