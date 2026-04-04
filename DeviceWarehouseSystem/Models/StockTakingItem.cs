using System;
using System.Collections.Generic;

namespace DeviceWarehouseSystem.Models
{
    /// <summary>
    /// 盘点项
    /// </summary>
    public partial class StockTakingItem
    {
        /// <summary>
        /// 主键
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 盘点单ID
        /// </summary>
        public int StockTakingId { get; set; }

        /// <summary>
        /// 项目ID
        /// </summary>
        public int ItemId { get; set; }

        /// <summary>
        /// 类别（专用设备/通用设备/耗材/原材料）
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// 名称
        /// </summary>
        public string ItemName { get; set; }

        /// <summary>
        /// 品牌
        /// </summary>
        public string? Brand { get; set; }

        /// <summary>
        /// 型号
        /// </summary>
        public string? Model { get; set; }

        /// <summary>
        /// 系统数量
        /// </summary>
        public int SystemQuantity { get; set; }

        /// <summary>
        /// 实际数量
        /// </summary>
        public int? ActualQuantity { get; set; }

        /// <summary>
        /// 差异数量
        /// </summary>
        public int? DifferenceQuantity { get; set; }

        /// <summary>
        /// 差异原因
        /// </summary>
        public string? DifferenceReason { get; set; }

        /// <summary>
        /// 状态
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// 盘点时间
        /// </summary>
        public DateTime? CheckTime { get; set; }

        /// <summary>
        /// 单位
        /// </summary>
        public string? Unit { get; set; }

        /// <summary>
        /// 仓库
        /// </summary>
        public string? Warehouse { get; set; }

        /// <summary>
        /// 位置
        /// </summary>
        public string? Location { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Remark { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 关联的盘点单
        /// </summary>
        public virtual StockTaking StockTaking { get; set; }
    }
}