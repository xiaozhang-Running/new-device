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
        return await _context.Consumables
            .Select(c => new ConsumableDTO
            {
                id = c.Id,
                name = c.Name,
                brand = c.Brand,
                modelSpecification = c.ModelSpecification,
                totalQuantity = c.TotalQuantity,
                originalQuantity = c.OriginalQuantity,
                usedQuantity = c.UsedQuantity,
                remainingQuantity = c.RemainingQuantity,
                unit = c.Unit,
                company = c.Company,
                status = c.Status,
                accessories = c.Accessories,
                remark = c.Remark,
                image = c.Image,
                location = c.Location,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    // 根据ID获取耗材
    public async Task<ConsumableDTO?> GetConsumableByIdAsync(int id)
    {
        var consumable = await _context.Consumables.FindAsync(id);
        if (consumable == null)
        {
            return null;
        }

        return new ConsumableDTO
        {
            id = consumable.Id,
            name = consumable.Name,
            brand = consumable.Brand,
            modelSpecification = consumable.ModelSpecification,
            totalQuantity = consumable.TotalQuantity,
            originalQuantity = consumable.OriginalQuantity,
            usedQuantity = consumable.UsedQuantity,
            remainingQuantity = consumable.RemainingQuantity,
            unit = consumable.Unit,
            company = consumable.Company,
            status = consumable.Status,
            accessories = consumable.Accessories,
            remark = consumable.Remark,
            image = consumable.Image,
            location = consumable.Location,
            createdAt = consumable.CreatedAt,
            updatedAt = consumable.UpdatedAt
        };
    }

    // 创建耗材
    public async Task<ConsumableDTO> CreateConsumableAsync(ConsumableCreateDTO dto)
    {
        // 计算总数量，处理可能的null值
        int usedQuantity = dto.usedQuantity;
        int remainingQuantity = dto.remainingQuantity;
        int totalQuantity = remainingQuantity + usedQuantity;

        // 根据剩余数量设置状态
        string status = "正常";
        if (remainingQuantity <= 0)
        {
            status = "无货";
        }
        else if (remainingQuantity < 10)
        {
            status = "短缺";
        }

        var consumable = new Consumable
        {
            Name = dto.name,
            Brand = dto.brand,
            ModelSpecification = dto.modelSpecification,
            TotalQuantity = totalQuantity,
            OriginalQuantity = dto.originalQuantity,
            UsedQuantity = usedQuantity,
            RemainingQuantity = remainingQuantity,
            Unit = dto.unit,
            Company = dto.company,
            Status = status,
            Accessories = dto.accessories,
            Remark = dto.remark,
            Image = dto.image,
            Location = dto.location,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        _context.Consumables.Add(consumable);
        await _context.SaveChangesAsync();

        return new ConsumableDTO
        {
            id = consumable.Id,
            name = consumable.Name,
            brand = consumable.Brand,
            modelSpecification = consumable.ModelSpecification,
            totalQuantity = consumable.TotalQuantity,
            originalQuantity = consumable.OriginalQuantity,
            usedQuantity = consumable.UsedQuantity,
            remainingQuantity = consumable.RemainingQuantity,
            unit = consumable.Unit,
            company = consumable.Company,
            status = consumable.Status,
            accessories = consumable.Accessories,
            remark = consumable.Remark,
            image = consumable.Image,
            location = consumable.Location,
            createdAt = consumable.CreatedAt,
            updatedAt = consumable.UpdatedAt
        };
    }

    // 更新耗材
    public async Task<ConsumableDTO?> UpdateConsumableAsync(int id, ConsumableUpdateDTO dto)
    {
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
        if (consumable.RemainingQuantity <= 0)
        {
            consumable.Status = "无货";
        }
        else if (consumable.RemainingQuantity < 10)
        {
            consumable.Status = "短缺";
        }
        else
        {
            consumable.Status = "正常";
        }

        consumable.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return new ConsumableDTO
        {
            id = consumable.Id,
            name = consumable.Name,
            brand = consumable.Brand,
            modelSpecification = consumable.ModelSpecification,
            totalQuantity = consumable.TotalQuantity,
            originalQuantity = consumable.OriginalQuantity,
            usedQuantity = consumable.UsedQuantity,
            remainingQuantity = consumable.RemainingQuantity,
            unit = consumable.Unit,
            company = consumable.Company,
            status = consumable.Status,
            accessories = consumable.Accessories,
            remark = consumable.Remark,
            image = consumable.Image,
            location = consumable.Location,
            createdAt = consumable.CreatedAt,
            updatedAt = consumable.UpdatedAt
        };
    }

    // 删除耗材
    public async Task<bool> DeleteConsumableAsync(int id)
    {
        var consumable = await _context.Consumables.FindAsync(id);
        if (consumable == null)
        {
            return false;
        }

        _context.Consumables.Remove(consumable);
        await _context.SaveChangesAsync();
        return true;
    }

    // 搜索耗材
    public async Task<IEnumerable<ConsumableDTO>> SearchConsumablesAsync(string searchText)
    {
        searchText = searchText.ToLower();
        return await _context.Consumables
            .Where(c => c.Name.ToLower().Contains(searchText) ||
                        (c.Brand != null && c.Brand.ToLower().Contains(searchText)) ||
                        (c.ModelSpecification != null && c.ModelSpecification.ToLower().Contains(searchText)))
            .Select(c => new ConsumableDTO
            {
                id = c.Id,
                name = c.Name,
                brand = c.Brand,
                modelSpecification = c.ModelSpecification,
                totalQuantity = c.TotalQuantity,
                originalQuantity = c.OriginalQuantity,
                usedQuantity = c.UsedQuantity,
                remainingQuantity = c.RemainingQuantity,
                unit = c.Unit,
                company = c.Company,
                status = c.Status,
                accessories = c.Accessories,
                remark = c.Remark,
                image = c.Image,
                location = c.Location,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    // 按状态筛选耗材
    public async Task<IEnumerable<ConsumableDTO>> FilterConsumablesByStatusAsync(string status)
    {
        return await _context.Consumables
            .Where(c => c.Status == status)
            .Select(c => new ConsumableDTO
            {
                id = c.Id,
                name = c.Name,
                brand = c.Brand,
                modelSpecification = c.ModelSpecification,
                totalQuantity = c.TotalQuantity,
                originalQuantity = c.OriginalQuantity,
                usedQuantity = c.UsedQuantity,
                remainingQuantity = c.RemainingQuantity,
                unit = c.Unit,
                company = c.Company,
                status = c.Status,
                accessories = c.Accessories,
                remark = c.Remark,
                image = c.Image,
                location = c.Location,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    // 按仓库筛选耗材
    public async Task<IEnumerable<ConsumableDTO>> FilterConsumablesByLocationAsync(string location)
    {
        return await _context.Consumables
            .Where(c => c.Location == location)
            .Select(c => new ConsumableDTO
            {
                id = c.Id,
                name = c.Name,
                brand = c.Brand,
                modelSpecification = c.ModelSpecification,
                totalQuantity = c.TotalQuantity,
                originalQuantity = c.OriginalQuantity,
                usedQuantity = c.UsedQuantity,
                remainingQuantity = c.RemainingQuantity,
                unit = c.Unit,
                company = c.Company,
                status = c.Status,
                accessories = c.Accessories,
                remark = c.Remark,
                image = c.Image,
                location = c.Location,
                createdAt = c.CreatedAt,
                updatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    // 删除所有耗材
    public async Task<bool> DeleteAllConsumablesAsync()
    {
        _context.Consumables.RemoveRange(_context.Consumables);
        await _context.SaveChangesAsync();
        return true;
    }
}