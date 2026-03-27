using System;

namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialDTO
{
    public int Id { get; set; }
    public required string productName { get; set; }
    public required string brand { get; set; }
    public required string specification { get; set; }
    public int totalQuantity { get; set; }
    public int usedQuantity { get; set; }
    public int remainingQuantity { get; set; }
    public required string unit { get; set; }
    public required string supplier { get; set; }
    public required string location { get; set; }
    public required string company { get; set; }
    public required string remark { get; set; }
    public required string image { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime? updatedAt { get; set; }
    public required string createdBy { get; set; }
    public required string updatedBy { get; set; }
}