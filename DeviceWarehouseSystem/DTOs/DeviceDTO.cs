using System;

namespace DeviceWarehouseSystem.DTOs
{
    public class SpecialEquipmentDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? DeviceCode { get; set; }
        public string? SerialNumber { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public int Quantity { get; set; }
        public string? Unit { get; set; }
        public string? Accessories { get; set; }
        public string? ImageUrl { get; set; }
        public string? Warehouse { get; set; }
        public string? Company { get; set; }
        public string? Status { get; set; }
        public string? UseStatus { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectTime { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public string? PurchaseDate { get; set; }
        public decimal PurchasePrice { get; set; }
    }

    public class GeneralEquipmentDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? DeviceCode { get; set; }
        public string? SerialNumber { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public int Quantity { get; set; }
        public string? Unit { get; set; }
        public string? Accessories { get; set; }
        public string? ImageUrl { get; set; }
        public string? Warehouse { get; set; }
        public string? Company { get; set; }
        public string? Status { get; set; }
        public string? UseStatus { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectTime { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public string? PurchaseDate { get; set; }
        public decimal PurchasePrice { get; set; }
    }

    public class RepairEquipmentDTO
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? ProblemDescription { get; set; }
        public DateTime RepairDate { get; set; }
        public string? RepairStatus { get; set; }
        public string? RepairResult { get; set; }
    }

    public class ScrapEquipmentDTO
    {
        public int Id { get; set; }
        public int EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? ScrapReason { get; set; }
        public DateTime ScrapDate { get; set; }
        public string? ScrapStatus { get; set; }
    }
}