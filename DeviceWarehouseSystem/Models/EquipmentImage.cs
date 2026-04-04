using System;

namespace DeviceWarehouseSystem.Models;

public partial class EquipmentImage
{
    public int Id { get; set; }

    public int EquipmentId { get; set; }

    public int EquipmentType { get; set; }

    public string ImagePath { get; set; } = null!;

    public string ImageName { get; set; } = null!;

    public int OrderIndex { get; set; }

    public DateTime CreatedAt { get; set; }

    public string ContentType { get; set; } = null!;
}
