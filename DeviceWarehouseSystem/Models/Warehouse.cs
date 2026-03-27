using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models
{
    public class Warehouse
    {
        public int Id { get; set; }
        public required string WarehouseName { get; set; }
        public string? Location { get; set; }
        public required string ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public int? Capacity { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        // 导航属性
        public ICollection<Inventory>? Inventories { get; set; }
    }
}