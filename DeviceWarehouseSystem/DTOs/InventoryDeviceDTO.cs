namespace DeviceWarehouseSystem.DTOs
{
    public class InventoryDeviceDTO
    {
        public int Id { get; set; }
        public int? EquipmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Specification { get; set; }
        public int InventoryQuantity { get; set; }
        public string? Unit { get; set; }
        public string? Warehouse { get; set; }
    }
}
