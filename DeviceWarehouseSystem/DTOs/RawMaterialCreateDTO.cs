namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialCreateDTO
{
    public string productName { get; set; } = string.Empty;
    public string? brand { get; set; }
    public string? specification { get; set; }
    public int? totalQuantity { get; set; }
    public int? usedQuantity { get; set; }
    public string? unit { get; set; }
    public string? supplier { get; set; }
    public string? location { get; set; }
    public string? company { get; set; }
    public string? remark { get; set; }
    public string? image { get; set; }
    public string? createdBy { get; set; }
}
