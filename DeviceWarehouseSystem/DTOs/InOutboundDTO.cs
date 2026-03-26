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



    public class RawMaterialInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string Supplier { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public string Status { get; set; }
        public List<RawMaterialInboundItemDTO> Items { get; set; }
    }

    public class RawMaterialInboundItemDTO
    {
        public int Id { get; set; }
        public int RawMaterialId { get; set; }
        public int Quantity { get; set; }
        public string Remark { get; set; }
    }

    // 专用设备采购入库
    public class SpecialEquipmentPurchaseInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string DeliveryPerson { get; set; }
        public string Inspector { get; set; }
        public string InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public List<SpecialEquipmentPurchaseInboundItemDTO> Items { get; set; }
    }

    public class SpecialEquipmentPurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Unit { get; set; }
        public int Inventory { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
    }

    // 通用设备采购入库
    public class GeneralEquipmentPurchaseInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string DeliveryPerson { get; set; }
        public string Inspector { get; set; }
        public string InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public List<GeneralEquipmentPurchaseInboundItemDTO> Items { get; set; }
    }

    public class GeneralEquipmentPurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Unit { get; set; }
        public int Inventory { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
    }

    // 耗材采购入库
    public class ConsumablePurchaseInboundDTO
    {
        public int Id { get; set; }
        public string InboundNumber { get; set; }
        public string DeliveryPerson { get; set; }
        public string Inspector { get; set; }
        public string InboundPerson { get; set; }
        public DateTime InboundDate { get; set; }
        public string Handler { get; set; }
        public string WarehouseKeeper { get; set; }
        public string Remark { get; set; }
        public List<ConsumablePurchaseInboundItemDTO> Items { get; set; }
    }

    public class ConsumablePurchaseInboundItemDTO
    {
        public int Id { get; set; }
        public int ConsumableId { get; set; }
        public string ConsumableName { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Unit { get; set; }
        public int Inventory { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
    }
}