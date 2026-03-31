using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class ScrapEquipment
{
    public int Id { get; set; }

    public int? SpecialEquipmentId { get; set; }

    public int? GeneralEquipmentId { get; set; }

    public string DeviceName { get; set; } = null!;

    public string DeviceCode { get; set; } = null!;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public string? Specification { get; set; }

    public int Quantity { get; set; }

    public string? Unit { get; set; }

    public string? ImageUrl { get; set; }

    public int DeviceType { get; set; }

    public string? Location { get; set; }

    public string? Company { get; set; }

    public string? Accessories { get; set; }

    public string? ScrapReason { get; set; }

    public DateTime ScrapDate { get; set; }

    public string? ScrappedBy { get; set; }

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual GeneralEquipment? GeneralEquipment { get; set; }

    public virtual SpecialEquipment? SpecialEquipment { get; set; }
}
