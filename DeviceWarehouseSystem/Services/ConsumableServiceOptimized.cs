using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Services
{
    /// <summary>
    /// 优化后的耗材服务类，继承自BaseService
    /// </summary>
    public class ConsumableServiceOptimized : BaseService<Consumable, ConsumableDTO, ConsumableCreateDTO, ConsumableUpdateDTO>
    {
        public ConsumableServiceOptimized(DeviceWarehouseContext context) : base(context)
        {
        }

        #region 自定义查询方法

        /// <summary>
        /// 根据状态获取耗材
        /// </summary>
        public async Task<List<ConsumableDTO>> GetByStatusAsync(string status)
        {
            return await FindAsync(c => c.Status == status);
        }

        /// <summary>
        /// 获取短缺的耗材（剩余数量少于10）
        /// </summary>
        public async Task<List<ConsumableDTO>> GetShortageConsumablesAsync()
        {
            return await FindAsync(c => c.RemainingQuantity < 10 && c.RemainingQuantity > 0);
        }

        /// <summary>
        /// 获取无货的耗材
        /// </summary>
        public async Task<List<ConsumableDTO>> GetOutOfStockConsumablesAsync()
        {
            return await FindAsync(c => c.RemainingQuantity <= 0);
        }

        /// <summary>
        /// 搜索耗材
        /// </summary>
        public async Task<List<ConsumableDTO>> SearchAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return await GetAllAsync();
            }

            var lowerKeyword = keyword.ToLower();
            return await FindAsync(c => 
                (c.Name != null && c.Name.ToLower().Contains(lowerKeyword)) ||
                (c.Brand != null && c.Brand.ToLower().Contains(lowerKeyword)) ||
                (c.ModelSpecification != null && c.ModelSpecification.ToLower().Contains(lowerKeyword))
            );
        }

        /// <summary>
    /// 获取库存统计
    /// </summary>
    public async Task<ConsumableStatisticsDTO> GetStatisticsAsync()
    {
        var allConsumables = await GetAllAsync();
        
        return new ConsumableStatisticsDTO
        {
            TotalCount = allConsumables.Count,
            NormalCount = allConsumables.Count(c => c.Status == "正常"),
            ShortageCount = allConsumables.Count(c => c.Status == "短缺"),
            OutOfStockCount = allConsumables.Count(c => c.Status == "无货"),
            TotalQuantity = allConsumables.Sum(c => c.TotalQuantity),
            UsedQuantity = allConsumables.Sum(c => c.UsedQuantity),
            RemainingQuantity = allConsumables.Sum(c => c.RemainingQuantity)
        };
    }

        #endregion

        #region 重写基类方法

        /// <summary>
        /// 创建耗材时自动计算状态
        /// </summary>
        public override async Task<ConsumableDTO> CreateAsync(ConsumableCreateDTO dto)
        {
            // 根据剩余数量自动设置状态
            var status = GetStatusByQuantity(dto.RemainingQuantity);
            
            var entity = new Consumable
            {
                Name = dto.Name ?? "",
                Brand = dto.Brand ?? "",
                ModelSpecification = dto.ModelSpecification ?? "",
                TotalQuantity = dto.TotalQuantity,

                UsedQuantity = dto.UsedQuantity,
                RemainingQuantity = dto.RemainingQuantity,
                Unit = dto.Unit ?? "",
                Company = dto.Company ?? "",
                Status = status,
                Accessories = dto.Accessories ?? "",
                Remark = dto.Remark ?? "",
                Image = dto.Image ?? "",
                Location = dto.Location ?? "",
                CreatedAt = DateTime.UtcNow
            };

            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
            
            return MapToDTO(entity);
        }

        /// <summary>
        /// 更新耗材时自动重新计算状态
        /// </summary>
        public override async Task<ConsumableDTO> UpdateAsync(int id, ConsumableUpdateDTO dto)
        {
            var entity = await _dbSet.FindAsync(id);
            if (entity == null)
            {
                throw new Exception("耗材不存在");
            }

            // 更新字段
            entity.Name = dto.Name ?? entity.Name;
            entity.Brand = dto.Brand ?? entity.Brand;
            entity.ModelSpecification = dto.ModelSpecification ?? entity.ModelSpecification;
            entity.TotalQuantity = dto.TotalQuantity ?? entity.TotalQuantity;

            entity.UsedQuantity = dto.UsedQuantity ?? entity.UsedQuantity;
            entity.RemainingQuantity = dto.RemainingQuantity ?? entity.RemainingQuantity;
            entity.Unit = dto.Unit ?? entity.Unit;
            entity.Company = dto.Company ?? entity.Company;
            entity.Status = GetStatusByQuantity(dto.RemainingQuantity ?? entity.RemainingQuantity);
            entity.Accessories = dto.Accessories ?? entity.Accessories;
            entity.Remark = dto.Remark ?? entity.Remark;
            entity.Image = dto.Image ?? entity.Image;
            entity.Location = dto.Location ?? entity.Location;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            
            return MapToDTO(entity);
        }

        #endregion

        #region 抽象方法实现

        protected override ConsumableDTO MapToDTO(Consumable entity)
        {
            return new ConsumableDTO
            {
                Id = entity.Id,
                Name = entity.Name ?? "",
                Brand = entity.Brand ?? "",
                ModelSpecification = entity.ModelSpecification ?? "",
                TotalQuantity = entity.TotalQuantity,

                UsedQuantity = entity.UsedQuantity,
                RemainingQuantity = entity.RemainingQuantity,
                Unit = entity.Unit ?? "",
                Company = entity.Company ?? "",
                Status = entity.Status ?? "正常",
                Accessories = entity.Accessories ?? "",
                Remark = entity.Remark ?? "",
                Image = entity.Image ?? "",
                Location = entity.Location ?? "",
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt
            };
        }

        protected override Consumable MapToEntity(ConsumableCreateDTO dto)
        {
            return new Consumable
            {
                Name = dto.Name ?? "",
                Brand = dto.Brand ?? "",
                ModelSpecification = dto.ModelSpecification ?? "",
                TotalQuantity = dto.TotalQuantity,

                UsedQuantity = dto.UsedQuantity,
                RemainingQuantity = dto.RemainingQuantity,
                Unit = dto.Unit ?? "",
                Company = dto.Company ?? "",
                Status = GetStatusByQuantity(dto.RemainingQuantity),
                Accessories = dto.Accessories ?? "",
                Remark = dto.Remark ?? "",
                Image = dto.Image ?? "",
                Location = dto.Location ?? "",
                CreatedAt = DateTime.UtcNow
            };
        }

        protected override void UpdateEntity(Consumable entity, ConsumableUpdateDTO dto)
        {
            entity.Name = dto.Name ?? entity.Name;
            entity.Brand = dto.Brand ?? entity.Brand;
            entity.ModelSpecification = dto.ModelSpecification ?? entity.ModelSpecification;
            entity.TotalQuantity = dto.TotalQuantity ?? entity.TotalQuantity;

            entity.UsedQuantity = dto.UsedQuantity ?? entity.UsedQuantity;
            entity.RemainingQuantity = dto.RemainingQuantity ?? entity.RemainingQuantity;
            entity.Unit = dto.Unit ?? entity.Unit;
            entity.Company = dto.Company ?? entity.Company;
            entity.Status = GetStatusByQuantity(dto.RemainingQuantity ?? entity.RemainingQuantity);
            entity.Accessories = dto.Accessories ?? entity.Accessories;
            entity.Remark = dto.Remark ?? entity.Remark;
            entity.Image = dto.Image ?? entity.Image;
            entity.Location = dto.Location ?? entity.Location;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        #endregion

        #region 辅助方法

        /// <summary>
        /// 根据剩余数量获取状态
        /// </summary>
        private static string GetStatusByQuantity(int remainingQuantity)
        {
            if (remainingQuantity <= 0)
                return "无货";
            if (remainingQuantity < 10)
                return "短缺";
            return "正常";
        }

        #endregion
    }

    /// <summary>
    /// 耗材统计DTO
    /// </summary>
    public class ConsumableStatisticsDTO
    {
        public int TotalCount { get; set; }
        public int NormalCount { get; set; }
        public int ShortageCount { get; set; }
        public int OutOfStockCount { get; set; }
        public int TotalQuantity { get; set; }
        public int UsedQuantity { get; set; }
        public int RemainingQuantity { get; set; }
    }
}
