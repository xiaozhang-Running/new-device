using System;

namespace DeviceWarehouseSystem.Models;

public partial class InOutboundImage
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    public int OrderType { get; set; }

    public string ImagePath { get; set; } = null!;

    public string ImageName { get; set; } = null!;

    public int OrderIndex { get; set; }

    public DateTime CreatedAt { get; set; }
}
