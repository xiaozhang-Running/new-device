using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class OutboundOrder
{
    public int Id { get; set; }

    public string OrderCode { get; set; } = null!;

    public DateTime OrderDate { get; set; }

    public int OutboundType { get; set; }

    public string? Purpose { get; set; }

    public string? ProjectName { get; set; }

    public string? Operator { get; set; }

    public int TotalQuantity { get; set; }

    public int Status { get; set; }

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<OutboundOrderItem> OutboundOrderItems { get; set; } = new List<OutboundOrderItem>();
}
