namespace DeviceWarehouseSystem.Enums;

/// <summary>
/// 设备状态枚举
/// </summary>
public enum DeviceStatus
{
    /// <summary>
    /// 正常
    /// </summary>
    Normal = 1,
    
    /// <summary>
    /// 待维修
    /// </summary>
    PendingRepair = 2,
    
    /// <summary>
    /// 报废
    /// </summary>
    Scrap = 3
}

/// <summary>
/// 使用状态枚举
/// </summary>
public enum UseStatus
{
    /// <summary>
    /// 未使用
    /// </summary>
    Unused = 0,
    
    /// <summary>
    /// 使用中
    /// </summary>
    InUse = 1,
    
    /// <summary>
    /// 停用
    /// </summary>
    Disabled = 2,
    
    /// <summary>
    /// 闲置
    /// </summary>
    Idle = 3
}

/// <summary>
/// 入库状态枚举
/// </summary>
public enum InboundStatus
{
    /// <summary>
    /// 待确认
    /// </summary>
    PendingConfirmation = 1,
    
    /// <summary>
    /// 已完成
    /// </summary>
    Completed = 2,
    
    /// <summary>
    /// 待处理
    /// </summary>
    PendingProcessing = 3
}

/// <summary>
/// 出库状态枚举
/// </summary>
public enum OutboundStatus
{
    /// <summary>
    /// 未完成
    /// </summary>
    NotCompleted = 0,
    
    /// <summary>
    /// 已完成
    /// </summary>
    Completed = 1
}

/// <summary>
/// 维修状态枚举
/// </summary>
public enum RepairStatus
{
    /// <summary>
    /// 不需要维修
    /// </summary>
    NoNeed = 0,
    
    /// <summary>
    /// 待维修
    /// </summary>
    Pending = 1,
    
    /// <summary>
    /// 维修中
    /// </summary>
    InProgress = 2,
    
    /// <summary>
    /// 已修复
    /// </summary>
    Fixed = 3
}

/// <summary>
/// 设备类型枚举
/// </summary>
public enum EquipmentType
{
    /// <summary>
    /// 专用设备
    /// </summary>
    Special = 1,
    
    /// <summary>
    /// 通用设备
    /// </summary>
    General = 2,
    
    /// <summary>
    /// 耗材
    /// </summary>
    Consumable = 3
}
