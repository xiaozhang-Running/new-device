using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models;

public partial class Image
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? Type { get; set; }

    public byte[]? Data { get; set; }

    public string? Url { get; set; }

    public int? SpecialEquipmentId { get; set; }

    public int? GeneralEquipmentId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual GeneralEquipment? GeneralEquipment { get; set; }

    public virtual SpecialEquipment? SpecialEquipment { get; set; }
}
