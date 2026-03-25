using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class RawMaterialOutbound
{
    public int Id { get; set; }

    public string OutboundNumber { get; set; } = null!;

    public DateTime OutboundDate { get; set; }

    public string? Recipient { get; set; }

    public string? Purpose { get; set; }

    public string? Remark { get; set; }

    public string? Operator { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<RawMaterialOutboundItem> RawMaterialOutboundItems { get; set; } = new List<RawMaterialOutboundItem>();
}
