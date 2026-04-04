using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models
{
    /// <summary>
    /// 库存盘点单
    /// </summary>
    public partial class StockTaking
    {
        public int Id { get; set; }

        /// <summary>
        /// 盘点单号
        /// </summary>
        public string StockTakingNo { get; set; } = null!;

        /// <summary>
        /// 盘点类型：全部、专用设备、通用设备、耗材、原材料
        /// </summary>
        public string StockTakingType { get; set; } = null!;

        /// <summary>
        /// 盘点状态：待盘点、盘点中、已完成
        /// </summary>
        public string Status { get; set; } = null!;

        /// <summary>
        /// 盘点开始时间
        /// </summary>
        public DateTime? StartTime { get; set; }

        /// <summary>
        /// 盘点结束时间
        /// </summary>
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// 盘点人
        /// </summary>
        public string? Operator { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string? Remark { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 创建人
        /// </summary>
        public string? CreatedBy { get; set; }

        /// <summary>
        /// 盘点明细
        /// </summary>
        public virtual ICollection<StockTakingItem> StockTakingItems { get; set; } = new List<StockTakingItem>();
    }
}
