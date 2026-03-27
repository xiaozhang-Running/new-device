namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialUpdateDTO
{
    public required string productName { get; set; }
    public required string brand { get; set; }
    public required string specification { get; set; }
    public int? totalQuantity { get; set; }
    public int? usedQuantity { get; set; }
    public required string unit { get; set; }
    public required string supplier { get; set; }
    public required string location { get; set; }
    public required string company { get; set; }
    public required string remark { get; set; }
    public required string image { get; set; }
    public required string updatedBy { get; set; }
}