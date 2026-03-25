using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class OutboundOrderItem
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int SpecialEquipmentId { get; set; }

    public int? GeneralEquipmentId { get; set; }

    public int Quantity { get; set; }

    public string? Remark { get; set; }

    public virtual GeneralEquipment? GeneralEquipment { get; set; }

    public virtual OutboundOrder Order { get; set; } = null!;

    public virtual SpecialEquipment SpecialEquipment { get; set; } = null!;
}
