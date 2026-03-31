using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class EquipmentInbound
{
    public int Id { get; set; }

    public string InboundNumber { get; set; } = null!;

    public DateTime InboundDate { get; set; }

    public int EquipmentType { get; set; }

    public string? DeliveryPerson { get; set; }

    public string? Inspector { get; set; }

    public string? InboundPerson { get; set; }

    public string? Operator { get; set; }

    public string? Remark { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<EquipmentInboundItem> EquipmentInboundItems { get; set; } = new List<EquipmentInboundItem>();
}
