using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models
{
    public class Company
    {
        public int Id { get; set; }
        public required string CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyPhone { get; set; }
        public string? CompanyEmail { get; set; }
        public string? BusinessLicense { get; set; }
        public string? TaxNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}