namespace DeviceWarehouseSystem.DTOs
{
    public class ProjectOutboundDTO
    {
        public int Id { get; set; }
        public string OutboundNumber { get; set; }
        public string ProjectName { get; set; }
        public string ProjectManager { get; set; }
        public string ContactPhone { get; set; }
        public string ProjectTime { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string UsageLocation { get; set; }
        public string Recipient { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<ProjectOutboundItemDTO> Items { get; set; }
    }

    public class ProjectOutboundItemDTO
    {
        public int Id { get; set; }
        public int ProjectOutboundId { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; }
        public string Status { get; set; }
    }

    public class RawMaterialOutboundDTO
    {
        public int Id { get; set; }
        public string OutboundNumber { get; set; }
        public string Recipient { get; set; }
        public string Operator { get; set; }
        public string Status { get; set; }
        public string Remark { get; set; }
        public DateTime OutboundDate { get; set; }
        public List<RawMaterialOutboundItemDTO> Items { get; set; }
    }

    public class RawMaterialOutboundItemDTO
    {
        public int Id { get; set; }
        public int RawMaterialId { get; set; }
        public int Quantity { get; set; }
        public string Remark { get; set; }
    }

    public class ProjectInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string ProjectName { get; set; }
        public string ProjectManager { get; set; }
        public string ContactPhone { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public string Status { get; set; }
        public List<ProjectInboundItemDTO> Items { get; set; }
    }

    public class ProjectInboundItemDTO
    {
        public int Id { get; set; }
        public int ProjectInboundId { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public int Quantity { get; set; }
        public string Unit { get; set; }
        public string Status { get; set; }
    }

    public class EquipmentPurchaseInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string Supplier { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public List<EquipmentPurchaseInboundItemDTO> Items { get; set; }
    }

    public class EquipmentPurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Specification { get; set; }
        public string Unit { get; set; }
        public int Inventory { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
    }

    public class RawMaterialInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string Supplier { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public List<RawMaterialInboundItemDTO> Items { get; set; }
    }

    public class RawMaterialInboundItemDTO
    {
        public int Id { get; set; }
        public int RawMaterialId { get; set; }
        public int Quantity { get; set; }
        public string Remark { get; set; }
    }
}