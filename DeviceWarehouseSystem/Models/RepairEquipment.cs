namespace DeviceWarehouseSystem.Models
{
    public class RepairEquipment
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public required string EquipmentName { get; set; }
        public required string EquipmentCode { get; set; }
        public required string FaultDescription { get; set; }
        public DateTime RepairDate { get; set; }
        public decimal RepairCost { get; set; }
        public required string RepairPerson { get; set; }
        public required string RepairStatus { get; set; }
        public required string Remark { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
