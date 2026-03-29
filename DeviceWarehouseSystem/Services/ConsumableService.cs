using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
                return new List<ConsumableDTO>();
            }
            return await _context.Consumables
                .Select(c => MapToConsumableDTO(c))
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
            if (string.IsNullOrWhiteSpace(dto.name))
            {
                throw new Exception("耗材名称不能为空");
            }

            // 计算总数量，处理可能的null值
            int usedQuantity = dto.usedQuantity;
            int remainingQuantity = dto.remainingQuantity;
            int totalQuantity = remainingQuantity + usedQuantity;

            // 根据剩余数量设置状态
            string status = GetStatusByQuantity(remainingQuantity);

            var consumable = new Consumable
            {
                Name = dto.name ?? "",
                Brand = dto.brand ?? "",
                ModelSpecification = dto.modelSpecification ?? "",
                TotalQuantity = totalQuantity,
                OriginalQuantity = dto.originalQuantity,
                UsedQuantity = usedQuantity,
                RemainingQuantity = remainingQuantity,
                Unit = dto.unit ?? "",
                Company = dto.company ?? "",
                Status = status,
                Accessories = dto.accessories ?? "",
                Remark = dto.remark ?? "",
                Image = dto.image ?? "",
                Location = dto.location ?? "",
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
            if (dto.name != null) consumable.Name = dto.name;
            if (dto.brand != null) consumable.Brand = dto.brand;
            if (dto.modelSpecification != null) consumable.ModelSpecification = dto.modelSpecification;
            if (dto.originalQuantity.HasValue) consumable.OriginalQuantity = dto.originalQuantity.Value;
            if (dto.usedQuantity.HasValue) consumable.UsedQuantity = dto.usedQuantity.Value;
            if (dto.remainingQuantity.HasValue) consumable.RemainingQuantity = dto.remainingQuantity.Value;
            if (dto.unit != null) consumable.Unit = dto.unit;
            if (dto.company != null) consumable.Company = dto.company;
            if (dto.accessories != null) consumable.Accessories = dto.accessories;
            if (dto.remark != null) consumable.Remark = dto.remark;
            if (dto.image != null) consumable.Image = dto.image;
            if (dto.location != null) consumable.Location = dto.location;

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
                return new List<ConsumableDTO>();
            }
            searchText = searchText?.ToLower() ?? "";
            return await _context.Consumables
                .Where(c => (c.Name != null && c.Name.ToLower().Contains(searchText)) ||
                            (c.Brand != null && c.Brand.ToLower().Contains(searchText)) ||
                            (c.ModelSpecification != null && c.ModelSpecification.ToLower().Contains(searchText)))
                .Select(c => MapToConsumableDTO(c))
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
                return new List<ConsumableDTO>();
            }
            return await _context.Consumables
                .Where(c => c.Status == status)
                .Select(c => MapToConsumableDTO(c))
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
                return new List<ConsumableDTO>();
            }
            return await _context.Consumables
                .Where(c => c.Location == location)
                .Select(c => MapToConsumableDTO(c))
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
            id = consumable.Id,
            name = consumable.Name ?? "",
            brand = consumable.Brand ?? "",
            modelSpecification = consumable.ModelSpecification ?? "",
            totalQuantity = consumable.TotalQuantity,
            originalQuantity = consumable.OriginalQuantity,
            usedQuantity = consumable.UsedQuantity,
            remainingQuantity = consumable.RemainingQuantity,
            unit = consumable.Unit ?? "",
            company = consumable.Company ?? "",
            status = consumable.Status ?? "",
            accessories = consumable.Accessories ?? "",
            remark = consumable.Remark ?? "",
            image = consumable.Image ?? "",
            location = consumable.Location ?? "",
            createdAt = consumable.CreatedAt,
            updatedAt = consumable.UpdatedAt
        };
    }
}