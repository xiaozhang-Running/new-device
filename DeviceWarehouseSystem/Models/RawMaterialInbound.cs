using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class RawMaterialInbound
{
    public int Id { get; set; }

    public string InboundNumber { get; set; } = null!;

    public DateTime InboundDate { get; set; }

    public string? DeliveryPerson { get; set; }

    public string? Company { get; set; }

    public string? Supplier { get; set; }

    public string? Remark { get; set; }

    public string? Operator { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<RawMaterialInboundItem> RawMaterialInboundItems { get; set; } = new List<RawMaterialInboundItem>();
}
