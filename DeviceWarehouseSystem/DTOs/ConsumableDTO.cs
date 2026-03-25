using System;

namespace DeviceWarehouseSystem.DTOs;

public class ConsumableDTO
{
    public int id { get; set; }
    public string name { get; set; } = null!;
    public string? brand { get; set; }
    public string? modelSpecification { get; set; }
    public int totalQuantity { get; set; }
    public int originalQuantity { get; set; }
    public int usedQuantity { get; set; }
    public int remainingQuantity { get; set; }
    public string? unit { get; set; }
    public string? company { get; set; }
    public string? status { get; set; }
    public string? accessories { get; set; }
    public string? remark { get; set; }
    public string? image { get; set; }
    public string? location { get; set; }
    public DateTime createdAt { get; set; }
    public DateTime? updatedAt { get; set; }
}

public class ConsumableCreateDTO
{
    public string name { get; set; } = null!;
    public string? brand { get; set; }
    public string? modelSpecification { get; set; }
    public int totalQuantity { get; set; }
    public int originalQuantity { get; set; }
    public int usedQuantity { get; set; }
    public int remainingQuantity { get; set; }
    public string? unit { get; set; }
    public string? company { get; set; }
    public string? accessories { get; set; }
    public string? remark { get; set; }
    public string? image { get; set; }
    public string? location { get; set; }
}

public class ConsumableUpdateDTO
{
    public string? name { get; set; }
    public string? brand { get; set; }
    public string? modelSpecification { get; set; }
    public int? totalQuantity { get; set; }
    public int? originalQuantity { get; set; }
    public int? usedQuantity { get; set; }
    public int? remainingQuantity { get; set; }
    public string? unit { get; set; }
    public string? company { get; set; }
    public string? accessories { get; set; }
    public string? remark { get; set; }
    public string? image { get; set; }
    public string? location { get; set; }
}