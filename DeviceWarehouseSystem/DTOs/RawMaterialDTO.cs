using System;

namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialDTO
{
    public int Id { get; set; }
    public string productName { get; set; }
    public string brand { get; set; }
    public string specification { get; set; }
    public int totalQuantity { get; set; }
    public int usedQuantity { get; set; }
    public int remainingQuantity { get; set; }
    public string unit { get; set; }
    public string supplier { get; set; }
    public string location { get; set; }
    public string company { get; set; }
    public string remark { get; set; }
    public string image { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime? updatedAt { get; set; }
    public string createdBy { get; set; }
    public string updatedBy { get; set; }
}