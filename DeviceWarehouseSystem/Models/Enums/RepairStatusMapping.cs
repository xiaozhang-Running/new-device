using DeviceWarehouseSystem.Enums;

namespace DeviceWarehouseSystem.Models.Enums
{
    /// <summary>
    /// 维修状态映射配置
    /// </summary>
    public static class RepairStatusMapping
    {
        /// <summary>
        /// 维修状态字符串到维修状态枚举的映射字典
        /// </summary>
        public static readonly Dictionary<string, RepairStatus> StatusStringToEnum = new()
        {
            { "待维修", RepairStatus.Pending },
            { "维修中", RepairStatus.InProgress },
            { "已完成", RepairStatus.Fixed },
            { "无法维修", RepairStatus.NoNeed } // 使用NoNeed表示无法维修
        };

        /// <summary>
        /// 维修状态字符串到设备状态的映射字典
        /// </summary>
        public static readonly Dictionary<string, DeviceStatus> StatusToDeviceStatus = new()
        {
            { "待维修", DeviceStatus.PendingRepair },
            { "维修中", DeviceStatus.PendingRepair },
            { "已完成", DeviceStatus.Normal },
            { "无法维修", DeviceStatus.Scrap }
        };

        /// <summary>
        /// 将维修状态字符串转换为维修状态枚举
        /// </summary>
        /// <param name="statusString">维修状态字符串</param>
        /// <returns>维修状态枚举</returns>
        public static RepairStatus ToRepairStatusEnum(string statusString)
        {
            if (StatusStringToEnum.TryGetValue(statusString, out var status))
            {
                return status;
            }
            throw new ArgumentException($"未知的维修状态: {statusString}", nameof(statusString));
        }

        /// <summary>
        /// 将维修状态字符串转换为设备状态
        /// </summary>
        /// <param name="statusString">维修状态字符串</param>
        /// <returns>设备状态枚举</returns>
        public static DeviceStatus ToDeviceStatus(string statusString)
        {
            if (StatusToDeviceStatus.TryGetValue(statusString, out var status))
            {
                return status;
            }
            throw new ArgumentException($"未知的维修状态: {statusString}", nameof(statusString));
        }

        /// <summary>
        /// 将维修状态字符串转换为维修状态数值
        /// </summary>
        /// <param name="statusString">维修状态字符串</param>
        /// <returns>维修状态数值</returns>
        public static int ToRepairStatusValue(string statusString)
        {
            return (int)ToRepairStatusEnum(statusString);
        }

        /// <summary>
        /// 将维修状态字符串转换为设备状态数值
        /// </summary>
        /// <param name="statusString">维修状态字符串</param>
        /// <returns>设备状态数值</returns>
        public static int ToDeviceStatusValue(string statusString)
        {
            return (int)ToDeviceStatus(statusString);
        }
    }
}
