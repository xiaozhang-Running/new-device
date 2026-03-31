namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialStatsDTO
{
    public int TotalCount { get; set; }
    public int TotalQuantity { get; set; }
    public int UsedQuantity { get; set; }
    public int RemainingQuantity { get; set; }
}