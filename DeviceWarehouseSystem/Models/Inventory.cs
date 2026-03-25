using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class Inventory
{
    public int Id { get; set; }

    public int? SpecialEquipmentId { get; set; }

    public int? GeneralEquipmentId { get; set; }

    public int? WarehouseId { get; set; }

    public int CurrentQuantity { get; set; }

    public int AlertMinQuantity { get; set; }

    public int AlertMaxQuantity { get; set; }

    public DateTime LastUpdated { get; set; }

    public virtual GeneralEquipment? GeneralEquipment { get; set; }

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();

    public virtual SpecialEquipment? SpecialEquipment { get; set; }

    public virtual Warehouse? Warehouse { get; set; }
}
