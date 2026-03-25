namespace DeviceWarehouseSystem.Models
{
    public class RepairEquipment
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; }
        public string EquipmentCode { get; set; }
        public string FaultDescription { get; set; }
        public DateTime RepairDate { get; set; }
        public decimal RepairCost { get; set; }
        public string RepairPerson { get; set; }
        public string RepairStatus { get; set; }
        public string Remark { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
