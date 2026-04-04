namespace DeviceWarehouseSystem.Extensions
{
    /// <summary>
    /// 枚举扩展方法
    /// </summary>
    public static class EnumExtensions
    {
        /// <summary>
        /// 将盘点状态枚举转换为字符串
        /// </summary>
        public static string ToStockTakingStatusString(this Enums.StockTakingStatus status)
        {
            return status switch
            {
                Enums.StockTakingStatus.Pending => "待盘点",
                Enums.StockTakingStatus.InProgress => "盘点中",
                Enums.StockTakingStatus.Completed => "已完成",
                _ => "未知"
            };
        }
        
        /// <summary>
        /// 将字符串转换为盘点状态枚举
        /// </summary>
        public static Enums.StockTakingStatus ToStockTakingStatus(this string statusString)
        {
            return statusString switch
            {
                "待盘点" => Enums.StockTakingStatus.Pending,
                "盘点中" => Enums.StockTakingStatus.InProgress,
                "已完成" => Enums.StockTakingStatus.Completed,
                _ => Enums.StockTakingStatus.Pending
            };
        }
    }
}
