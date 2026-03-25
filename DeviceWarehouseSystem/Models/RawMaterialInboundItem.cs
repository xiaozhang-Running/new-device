using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class RawMaterialInboundItem
{
    public int Id { get; set; }

    public int InboundId { get; set; }

    public int RawMaterialId { get; set; }

    public int Quantity { get; set; }

    public string? Specification { get; set; }

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual RawMaterialInbound Inbound { get; set; } = null!;

    public virtual RawMaterial RawMaterial { get; set; } = null!;
}
