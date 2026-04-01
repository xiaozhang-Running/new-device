using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class ProjectOutboundItem
{
    public int Id { get; set; }

    public int OutboundId { get; set; }

    public int ItemType { get; set; }

    public int ItemId { get; set; }

    public string ItemName { get; set; } = null!;

    public string? DeviceCode { get; set; }

    public string? SerialNumber { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public int Quantity { get; set; }

    public string? Unit { get; set; }

    public string? Accessories { get; set; }

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? DeviceStatus { get; set; }

    public virtual ProjectOutbound Outbound { get; set; } = null!;
}
