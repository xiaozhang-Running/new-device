using System;

namespace DeviceWarehouseSystem.DTOs;

public class ConsumableDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Brand { get; set; }
    public string? ModelSpecification { get; set; }
    public int TotalQuantity { get; set; }
    public int OriginalQuantity { get; set; }
    public int UsedQuantity { get; set; }
    public int RemainingQuantity { get; set; }
    public string? Unit { get; set; }
    public string? Company { get; set; }
    public string? Status { get; set; }
    public string? Accessories { get; set; }
    public string? Remark { get; set; }
    public string? Image { get; set; }
    public string? Location { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ConsumableCreateDTO
{
    public string Name { get; set; } = null!;
    public string? Brand { get; set; }
    public string? ModelSpecification { get; set; }
    public int TotalQuantity { get; set; }
    public int OriginalQuantity { get; set; }
    public int UsedQuantity { get; set; }
    public int RemainingQuantity { get; set; }
    public string? Unit { get; set; }
    public string? Company { get; set; }
    public string? Accessories { get; set; }
    public string? Remark { get; set; }
    public string? Image { get; set; }
    public string? Location { get; set; }
}

public class ConsumableUpdateDTO
{
    public string? Name { get; set; }
    public string? Brand { get; set; }
    public string? ModelSpecification { get; set; }
    public int? TotalQuantity { get; set; }
    public int? OriginalQuantity { get; set; }
    public int? UsedQuantity { get; set; }
    public int? RemainingQuantity { get; set; }
    public string? Unit { get; set; }
    public string? Company { get; set; }
    public string? Accessories { get; set; }
    public string? Remark { get; set; }
    public string? Image { get; set; }
    public string? Location { get; set; }
}