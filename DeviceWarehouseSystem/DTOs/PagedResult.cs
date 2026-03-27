using System.Collections.Generic;

namespace DeviceWarehouseSystem.DTOs
{
    /// <summary>
    /// 分页结果DTO
    /// </summary>
    /// <typeparam name="T">数据类型</typeparam>
    public class PagedResult<T>
    {
        /// <summary>
        /// 数据列表
        /// </summary>
        public List<T> Items { get; set; } = new List<T>();

        /// <summary>
        /// 总记录数
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// 当前页码
        /// </summary>
        public int PageNumber { get; set; }

        /// <summary>
        /// 每页大小
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// 总页数
        /// </summary>
        public int TotalPages => (TotalCount + PageSize - 1) / PageSize;

        /// <summary>
        /// 是否有上一页
        /// </summary>
        public bool HasPreviousPage => PageNumber > 1;

        /// <summary>
        /// 是否有下一页
        /// </summary>
        public bool HasNextPage => PageNumber < TotalPages;
    }

    /// <summary>
    /// 分页查询参数
    /// </summary>
    public class PaginationParams
    {
        private int _pageNumber = 1;
        private int _pageSize = 20;

        /// <summary>
        /// 页码（从1开始）
        /// </summary>
        public int PageNumber
        {
            get => _pageNumber;
            set => _pageNumber = value < 1 ? 1 : value;
        }

        /// <summary>
        /// 每页大小
        /// </summary>
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value < 1 ? 20 : (value > 100 ? 100 : value);
        }

        /// <summary>
        /// 搜索关键字
        /// </summary>
        public string Search { get; set; }

        /// <summary>
        /// 排序字段
        /// </summary>
        public string SortBy { get; set; }

        /// <summary>
        /// 是否降序
        /// </summary>
        public bool SortDesc { get; set; } = false;
    }
}
