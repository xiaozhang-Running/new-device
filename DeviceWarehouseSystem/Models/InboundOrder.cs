using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class InboundOrder
{
    public int Id { get; set; }

    public string OrderCode { get; set; } = null!;

    public DateTime OrderDate { get; set; }

    public int InboundType { get; set; }

    public string? Supplier { get; set; }

    public string? DeliveryPerson { get; set; }

    public string? Operator { get; set; }

    public string? Receiver { get; set; }

    public string? ReceiverPhone { get; set; }

    public int TotalQuantity { get; set; }

    public decimal? TotalAmount { get; set; }

    public int Status { get; set; }

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<InboundOrderItem> InboundOrderItems { get; set; } = new List<InboundOrderItem>();
}
