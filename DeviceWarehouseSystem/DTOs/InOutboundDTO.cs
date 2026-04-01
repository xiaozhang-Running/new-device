namespace DeviceWarehouseSystem.DTOs
{
    public class ProjectOutboundDTO
    {
        public int Id { get; set; }
        public required string OutboundNumber { get; set; }
        public DateTime OutboundDate { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectManager { get; set; }
        public required string ContactPhone { get; set; }
        public required string ProjectTime { get; set; }
        public DateTime? ReturnDate { get; set; }
        public required string UsageLocation { get; set; }
        public required string Recipient { get; set; }
        public required string Handler { get; set; }
        public required string WarehouseKeeper { get; set; }
        public required string Remark { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public required List<ProjectOutboundItemDTO> Items { get; set; }
    }

    public class ProjectOutboundItemDTO
    {
        public int Id { get; set; }
        public int ProjectOutboundId { get; set; }
        public int EquipmentId { get; set; }
        public required string EquipmentName { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public int Quantity { get; set; }
        public required string Unit { get; set; }
        public required string Status { get; set; }
    }

    public class RawMaterialOutboundDTO
    {
        public int Id { get; set; }
        public required string OutboundNumber { get; set; }
        public required string Recipient { get; set; }
        public required string Operator { get; set; }
        public required string Status { get; set; }
        public required string Remark { get; set; }
        public DateTime OutboundDate { get; set; }
        public required List<RawMaterialOutboundItemDTO> Items { get; set; }
    }

    public class RawMaterialOutboundItemDTO
    {
        public int Id { get; set; }
        public int RawMaterialId { get; set; }
        public int Quantity { get; set; }
        public string? Remark { get; set; }
    }

    public class ProjectInboundDTO
    {
        public int Id { get; set; }
        public required string InboundNumber { get; set; }
        public int OutboundOrderId { get; set; }
        public required string ProjectName { get; set; }
        public required string ProjectManager { get; set; }
        public required string ContactPhone { get; set; }
        public required string ProjectTime { get; set; }
        public required string UsageLocation { get; set; }
        public required string Handler { get; set; }
        public required string Inspector { get; set; }
        public required string WarehouseKeeper { get; set; }
        public string? InboundDate { get; set; }
        public required string Remark { get; set; }
        public required string Status { get; set; }
        public bool IsCompleted { get; set; }
        public required List<ProjectInboundItemDTO> Items { get; set; }
    }

    public class ProjectInboundItemDTO
    {
        public int Id { get; set; }
        public int ProjectInboundId { get; set; }
        public int EquipmentId { get; set; }
        public required string EquipmentName { get; set; }
        public string? DeviceCode { get; set; }
        public required string Brand { get; set; }
        public required string Model { get; set; }
        public int Quantity { get; set; }
        public required string Unit { get; set; }
        public string? Accessories { get; set; }
        public required string Status { get; set; }
        public string DeviceStatus { get => Status; set => Status = value; }
        public int ItemType { get; set; } // 1=专用设备, 2=通用设备, 3=耗材
    }



    public class RawMaterialInboundDTO
    {
        public int Id { get; set; }
        public string? InboundNumber { get; set; }
        public string? Supplier { get; set; }
        public string? Handler { get; set; }
        public string? WarehouseKeeper { get; set; }
        public string? Remark { get; set; }
        public string? Status { get; set; }
        public List<RawMaterialInboundItemDTO>? Items { get; set; }
    }

    public class RawMaterialInboundItemDTO
    {
        public int Id { get; set; }
        public int RawMaterialId { get; set; }
        public int Quantity { get; set; }
        public string? Remark { get; set; }
    }

    // 专用设备采购入库
    public class SpecialEquipmentPurchaseInboundDTO
    {
        public int Id { get; set; }
        public string? InboundNumber { get; set; }
        public string? DeliveryPerson { get; set; }
        public string? Inspector { get; set; }
        public string? InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string? Handler { get; set; }
        public string? WarehouseKeeper { get; set; }
        public string? Remark { get; set; }
        public string? Status { get; set; }
        public List<SpecialEquipmentPurchaseInboundItemDTO>? Items { get; set; }
    }

    public class SpecialEquipmentPurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int? EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Unit { get; set; }
        public int? Inventory { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public string? DeviceCode { get; set; }
        public string? SnCode { get; set; }
        public string? Accessories { get; set; }
    }

    // 通用设备采购入库
    public class GeneralEquipmentPurchaseInboundDTO
    {
        public int Id { get; set; }
        public string? InboundNumber { get; set; }
        public string? DeliveryPerson { get; set; }
        public string? Inspector { get; set; }
        public string? InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string? Handler { get; set; }
        public string? WarehouseKeeper { get; set; }
        public string? Remark { get; set; }
        public string? Status { get; set; }
        public List<GeneralEquipmentPurchaseInboundItemDTO>? Items { get; set; }
    }

    public class GeneralEquipmentPurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int? EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Unit { get; set; }
        public int? Inventory { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
        public string? DeviceCode { get; set; }
        public string? SnCode { get; set; }
        public string? Accessories { get; set; }
    }

    // 耗材采购入库
    public class ConsumablePurchaseInboundDTO
    {
        public int Id { get; set; }
        public string? InboundNumber { get; set; }
        public string? DeliveryPerson { get; set; }
        public string? Inspector { get; set; }
        public string? InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string? Handler { get; set; }
        public string? WarehouseKeeper { get; set; }
        public string? Remark { get; set; }
        public string? Status { get; set; }
        public List<ConsumablePurchaseInboundItemDTO>? Items { get; set; }
    }

    public class ConsumablePurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int? ConsumableId { get; set; }
        public string? ConsumableName { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public string? Unit { get; set; }
        public int? Inventory { get; set; }
        public int Quantity { get; set; }
        public string? Status { get; set; }
    }
}