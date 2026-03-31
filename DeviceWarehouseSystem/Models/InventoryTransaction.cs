using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class InventoryTransaction
{
    public int Id { get; set; }

    public int InventoryId { get; set; }

    public int Quantity { get; set; }

    public string TransactionType { get; set; } = null!;

    public string? Reason { get; set; }

    public string? Reference { get; set; }

    public DateTime TransactionDate { get; set; }

    public string? Operator { get; set; }

    public string? Remark { get; set; }

    public virtual Inventory Inventory { get; set; } = null!;
}
