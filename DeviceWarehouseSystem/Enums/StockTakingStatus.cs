namespace DeviceWarehouseSystem.Enums
{
    /// <summary>
    /// 盘点状态枚举
    /// </summary>
    public enum StockTakingStatus
    {
        /// <summary>
        /// 待盘点
        /// </summary>
        Pending = 0,
        
        /// <summary>
        /// 盘点中
        /// </summary>
        InProgress = 1,
        
        /// <summary>
        /// 已完成
        /// </summary>
        Completed = 2
    }
}
