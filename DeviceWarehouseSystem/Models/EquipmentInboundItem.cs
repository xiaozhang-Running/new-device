using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class EquipmentInboundItem
{
    public int Id { get; set; }

    public int InboundId { get; set; }

    public string DeviceName { get; set; } = null!;

    public string DeviceCode { get; set; } = null!;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public int Quantity { get; set; }

    public string? Unit { get; set; }

    public string? ImageUrl { get; set; }

    public string? Status { get; set; }

    public string? Remark { get; set; }

    public int EquipmentType { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual EquipmentInbound Inbound { get; set; } = null!;
}
