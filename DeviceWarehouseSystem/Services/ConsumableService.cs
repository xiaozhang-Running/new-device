using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Services;

public class ConsumableService
{
    private readonly DeviceWarehouseContext _context;

    public ConsumableService(DeviceWarehouseContext context)
    {
        _context = context;
    }

    // 获取所有耗材
    public async Task<IEnumerable<ConsumableDTO>> GetAllConsumablesAsync()
    {
        try
        {
            if (_context.Consumables == null)
            {
                return [];
            }
            return await _context.Consumables
                .Select(c => new ConsumableDTO
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Brand = c.Brand ?? "",
                    ModelSpecification = c.ModelSpecification ?? "",
                    TotalQuantity = c.TotalQuantity,
                    OriginalQuantity = c.OriginalQuantity,
                    UsedQuantity = c.UsedQuantity,
                    RemainingQuantity = c.RemainingQuantity,
                    Unit = c.Unit ?? "",
                    Company = c.Company ?? "",
                    Status = c.Status ?? "",
                    Accessories = c.Accessories ?? "",
                    Remark = c.Remark ?? "",
                    Image = c.Image ?? "",
                    Location = c.Location ?? "",
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("获取耗材列表失败: " + ex.Message);
        }
    }

    // 根据ID获取耗材
    public async Task<ConsumableDTO?> GetConsumableByIdAsync(int id)
    {
        try
        {
            if (_context.Consumables == null)
            {
                return null;
            }
            var consumable = await _context.Consumables.FindAsync(id);
            if (consumable == null)
            {
                return null;
            }

            return MapToConsumableDTO(consumable);
        }
        catch (Exception ex)
        {
            throw new Exception($"获取ID为 {id} 的耗材失败: " + ex.Message);
        }
    }

    // 创建耗材
    public async Task<ConsumableDTO> CreateConsumableAsync(ConsumableCreateDTO dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 验证输入数据
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new Exception("耗材名称不能为空");
            }

            // 计算总数量，处理可能的null值
            int usedQuantity = dto.UsedQuantity;
            int remainingQuantity = dto.RemainingQuantity;
            int totalQuantity = remainingQuantity + usedQuantity;

            // 根据剩余数量设置状态
            string status = GetStatusByQuantity(remainingQuantity);

            var consumable = new Consumable
            {
                Name = dto.Name ?? "",
                Brand = dto.Brand ?? "",
                ModelSpecification = dto.ModelSpecification ?? "",
                TotalQuantity = totalQuantity,
                OriginalQuantity = dto.OriginalQuantity,
                UsedQuantity = usedQuantity,
                RemainingQuantity = remainingQuantity,
                Unit = dto.Unit ?? "",
                Company = dto.Company ?? "",
                Status = status,
                Accessories = dto.Accessories ?? "",
                Remark = dto.Remark ?? "",
                Image = dto.Image ?? "",
                Location = dto.Location ?? "",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            if (_context.Consumables == null)
            {
                throw new Exception("Consumables DbSet is null");
            }
            _context.Consumables.Add(consumable);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToConsumableDTO(consumable);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("创建耗材失败: " + ex.Message);
        }
    }

    // 更新耗材
    public async Task<ConsumableDTO?> UpdateConsumableAsync(int id, ConsumableUpdateDTO dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.Consumables == null)
            {
                return null;
            }
            var consumable = await _context.Consumables.FindAsync(id);
            if (consumable == null)
            {
                return null;
            }

            // 更新字段
            if (dto.Name != null) consumable.Name = dto.Name;
            if (dto.Brand != null) consumable.Brand = dto.Brand;
            if (dto.ModelSpecification != null) consumable.ModelSpecification = dto.ModelSpecification;
            if (dto.OriginalQuantity.HasValue) consumable.OriginalQuantity = dto.OriginalQuantity.Value;
            if (dto.UsedQuantity.HasValue) consumable.UsedQuantity = dto.UsedQuantity.Value;
            if (dto.RemainingQuantity.HasValue) consumable.RemainingQuantity = dto.RemainingQuantity.Value;
            if (dto.Unit != null) consumable.Unit = dto.Unit;
            if (dto.Company != null) consumable.Company = dto.Company;
            if (dto.Accessories != null) consumable.Accessories = dto.Accessories;
            if (dto.Remark != null) consumable.Remark = dto.Remark;
            if (dto.Image != null) consumable.Image = dto.Image;
            if (dto.Location != null) consumable.Location = dto.Location;

            // 重新计算总数量和状态
            consumable.TotalQuantity = consumable.RemainingQuantity + consumable.UsedQuantity;
            consumable.Status = GetStatusByQuantity(consumable.RemainingQuantity);
            consumable.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToConsumableDTO(consumable);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"更新ID为 {id} 的耗材失败: " + ex.Message);
        }
    }

    // 删除耗材
    public async Task<bool> DeleteConsumableAsync(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.Consumables == null)
            {
                return false;
            }
            var consumable = await _context.Consumables.FindAsync(id);
            if (consumable == null)
            {
                return false;
            }

            _context.Consumables.Remove(consumable);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"删除ID为 {id} 的耗材失败: " + ex.Message);
        }
    }

    // 搜索耗材
    public async Task<IEnumerable<ConsumableDTO>> SearchConsumablesAsync(string searchText)
    {
        try
        {
            if (_context.Consumables == null)
            {
                return [];
            }
            searchText = searchText?.ToLower() ?? "";
            return await _context.Consumables
                .Where(c => (c.Name != null && c.Name.ToLower().Contains(searchText)) ||
                            (c.Brand != null && c.Brand.ToLower().Contains(searchText)) ||
                            (c.ModelSpecification != null && c.ModelSpecification.ToLower().Contains(searchText)))
                .Select(c => new ConsumableDTO
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Brand = c.Brand ?? "",
                    ModelSpecification = c.ModelSpecification ?? "",
                    TotalQuantity = c.TotalQuantity,
                    OriginalQuantity = c.OriginalQuantity,
                    UsedQuantity = c.UsedQuantity,
                    RemainingQuantity = c.RemainingQuantity,
                    Unit = c.Unit ?? "",
                    Company = c.Company ?? "",
                    Status = c.Status ?? "",
                    Accessories = c.Accessories ?? "",
                    Remark = c.Remark ?? "",
                    Image = c.Image ?? "",
                    Location = c.Location ?? "",
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("搜索耗材失败: " + ex.Message);
        }
    }

    // 按状态筛选耗材
    public async Task<IEnumerable<ConsumableDTO>> FilterConsumablesByStatusAsync(string status)
    {
        try
        {
            if (_context.Consumables == null)
            {
                return [];
            }
            return await _context.Consumables
                .Where(c => c.Status == status)
                .Select(c => new ConsumableDTO
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Brand = c.Brand ?? "",
                    ModelSpecification = c.ModelSpecification ?? "",
                    TotalQuantity = c.TotalQuantity,
                    OriginalQuantity = c.OriginalQuantity,
                    UsedQuantity = c.UsedQuantity,
                    RemainingQuantity = c.RemainingQuantity,
                    Unit = c.Unit ?? "",
                    Company = c.Company ?? "",
                    Status = c.Status ?? "",
                    Accessories = c.Accessories ?? "",
                    Remark = c.Remark ?? "",
                    Image = c.Image ?? "",
                    Location = c.Location ?? "",
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"按状态 {status} 筛选耗材失败: " + ex.Message);
        }
    }

    // 按仓库筛选耗材
    public async Task<IEnumerable<ConsumableDTO>> FilterConsumablesByLocationAsync(string location)
    {
        try
        {
            if (_context.Consumables == null)
            {
                return [];
            }
            return await _context.Consumables
                .Where(c => c.Location == location)
                .Select(c => new ConsumableDTO
                {
                    Id = c.Id,
                    Name = c.Name ?? "",
                    Brand = c.Brand ?? "",
                    ModelSpecification = c.ModelSpecification ?? "",
                    TotalQuantity = c.TotalQuantity,
                    OriginalQuantity = c.OriginalQuantity,
                    UsedQuantity = c.UsedQuantity,
                    RemainingQuantity = c.RemainingQuantity,
                    Unit = c.Unit ?? "",
                    Company = c.Company ?? "",
                    Status = c.Status ?? "",
                    Accessories = c.Accessories ?? "",
                    Remark = c.Remark ?? "",
                    Image = c.Image ?? "",
                    Location = c.Location ?? "",
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception($"按仓库 {location} 筛选耗材失败: " + ex.Message);
        }
    }

    // 删除所有耗材
    public async Task<bool> DeleteAllConsumablesAsync()
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.Consumables == null)
            {
                return false;
            }
            _context.Consumables.RemoveRange(_context.Consumables);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("删除所有耗材失败: " + ex.Message);
        }
    }

    // 辅助方法：根据剩余数量获取状态
    private string GetStatusByQuantity(int remainingQuantity)
    {
        if (remainingQuantity <= 0)
        {
            return "无货";
        }
        else if (remainingQuantity < 10)
        {
            return "短缺";
        }
        else
        {
            return "正常";
        }
    }

    // 辅助方法：将Consumable映射到ConsumableDTO
    private ConsumableDTO MapToConsumableDTO(Consumable consumable)
    {
        return new ConsumableDTO
        {
            Id = consumable.Id,
            Name = consumable.Name ?? "",
            Brand = consumable.Brand ?? "",
            ModelSpecification = consumable.ModelSpecification ?? "",
            TotalQuantity = consumable.TotalQuantity,
            OriginalQuantity = consumable.OriginalQuantity,
            UsedQuantity = consumable.UsedQuantity,
            RemainingQuantity = consumable.RemainingQuantity,
            Unit = consumable.Unit ?? "",
            Company = consumable.Company ?? "",
            Status = consumable.Status ?? "",
            Accessories = consumable.Accessories ?? "",
            Remark = consumable.Remark ?? "",
            Image = consumable.Image ?? "",
            Location = consumable.Location ?? "",
            CreatedAt = consumable.CreatedAt,
            UpdatedAt = consumable.UpdatedAt
        };
    }
}