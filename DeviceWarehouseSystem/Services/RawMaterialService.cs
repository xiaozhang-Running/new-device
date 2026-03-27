using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Services;

public class RawMaterialService : IRawMaterialService
{
    private readonly DeviceWarehouseContext _context;

    public RawMaterialService(DeviceWarehouseContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RawMaterialDTO>> GetRawMaterials(string search, string location)
    {
        var query = _context.RawMaterials.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(r => 
                r.ProductName.Contains(search) ||
                r.Brand.Contains(search) ||
                r.Specification.Contains(search) ||
                r.Supplier.Contains(search)
            );
        }

        if (!string.IsNullOrEmpty(location))
        {
            query = query.Where(r => r.Location == location);
        }

        return await query.Select(r => new RawMaterialDTO
        {
            Id = r.Id,
            productName = r.ProductName,
            brand = r.Brand,
            specification = r.Specification,
            totalQuantity = r.TotalQuantity,
            usedQuantity = r.UsedQuantity,
            remainingQuantity = r.RemainingQuantity,
            unit = r.Unit,
            supplier = r.Supplier,
            location = r.Location,
            company = r.Company,
            remark = r.Remark,
            image = r.Image,
            createdAt = r.CreatedAt,
            updatedAt = r.UpdatedAt,
            createdBy = r.CreatedBy,
            updatedBy = r.UpdatedBy
        }).ToListAsync();
    }

    public async Task<RawMaterialDTO> GetRawMaterialById(int id)
    {
        var rawMaterial = await _context.RawMaterials.FindAsync(id);
        if (rawMaterial == null)
        {
            return null;
        }

        return new RawMaterialDTO
        {
            Id = rawMaterial.Id,
            productName = rawMaterial.ProductName,
            brand = rawMaterial.Brand,
            specification = rawMaterial.Specification,
            totalQuantity = rawMaterial.TotalQuantity,
            usedQuantity = rawMaterial.UsedQuantity,
            remainingQuantity = rawMaterial.RemainingQuantity,
            unit = rawMaterial.Unit,
            supplier = rawMaterial.Supplier,
            location = rawMaterial.Location,
            company = rawMaterial.Company,
            remark = rawMaterial.Remark,
            image = rawMaterial.Image,
            createdAt = rawMaterial.CreatedAt,
            updatedAt = rawMaterial.UpdatedAt,
            createdBy = rawMaterial.CreatedBy,
            updatedBy = rawMaterial.UpdatedBy
        };
    }

    public async Task<RawMaterialDTO> CreateRawMaterial(RawMaterialCreateDTO rawMaterialCreateDTO)
    {
        var totalQuantity = rawMaterialCreateDTO.totalQuantity ?? 0;
        var usedQuantity = rawMaterialCreateDTO.usedQuantity ?? 0;
        var remainingQuantity = totalQuantity - usedQuantity;

        var rawMaterial = new RawMaterial
        {
            SortOrder = 0,
            ProductName = rawMaterialCreateDTO.productName,
            Brand = rawMaterialCreateDTO.brand,
            Specification = rawMaterialCreateDTO.specification,
            TotalQuantity = totalQuantity,
            UsedQuantity = usedQuantity,
            RemainingQuantity = remainingQuantity,
            Unit = rawMaterialCreateDTO.unit,
            Supplier = rawMaterialCreateDTO.supplier,
            Location = rawMaterialCreateDTO.location,
            Company = rawMaterialCreateDTO.company,
            Remark = rawMaterialCreateDTO.remark,
            Image = rawMaterialCreateDTO.image,
            CreatedAt = System.DateTime.Now,
            CreatedBy = rawMaterialCreateDTO.createdBy ?? "System"
        };

        _context.RawMaterials.Add(rawMaterial);
        await _context.SaveChangesAsync();

        return new RawMaterialDTO
        {
            Id = rawMaterial.Id,
            productName = rawMaterial.ProductName,
            brand = rawMaterial.Brand,
            specification = rawMaterial.Specification,
            totalQuantity = rawMaterial.TotalQuantity,
            usedQuantity = rawMaterial.UsedQuantity,
            remainingQuantity = rawMaterial.RemainingQuantity,
            unit = rawMaterial.Unit,
            supplier = rawMaterial.Supplier,
            location = rawMaterial.Location,
            company = rawMaterial.Company,
            remark = rawMaterial.Remark,
            image = rawMaterial.Image,
            createdAt = rawMaterial.CreatedAt,
            updatedAt = rawMaterial.UpdatedAt,
            createdBy = rawMaterial.CreatedBy,
            updatedBy = rawMaterial.UpdatedBy
        };
    }

    public async Task<RawMaterialDTO> UpdateRawMaterial(int id, RawMaterialUpdateDTO rawMaterialUpdateDTO)
    {
        var rawMaterial = await _context.RawMaterials.FindAsync(id);
        if (rawMaterial == null)
        {
            return null;
        }

        var totalQuantity = rawMaterialUpdateDTO.totalQuantity ?? 0;
        var usedQuantity = rawMaterialUpdateDTO.usedQuantity ?? 0;
        var remainingQuantity = totalQuantity - usedQuantity;

        rawMaterial.ProductName = rawMaterialUpdateDTO.productName;
        rawMaterial.Brand = rawMaterialUpdateDTO.brand;
        rawMaterial.Specification = rawMaterialUpdateDTO.specification;
        rawMaterial.TotalQuantity = totalQuantity;
        rawMaterial.UsedQuantity = usedQuantity;
        rawMaterial.RemainingQuantity = remainingQuantity;
        rawMaterial.Unit = rawMaterialUpdateDTO.unit;
        rawMaterial.Supplier = rawMaterialUpdateDTO.supplier;
        rawMaterial.Location = rawMaterialUpdateDTO.location;
        rawMaterial.Company = rawMaterialUpdateDTO.company;
        rawMaterial.Remark = rawMaterialUpdateDTO.remark;
        rawMaterial.Image = rawMaterialUpdateDTO.image;
        rawMaterial.UpdatedAt = System.DateTime.Now;
        rawMaterial.UpdatedBy = rawMaterialUpdateDTO.updatedBy;

        await _context.SaveChangesAsync();

        return new RawMaterialDTO
        {
            Id = rawMaterial.Id,
            productName = rawMaterial.ProductName,
            brand = rawMaterial.Brand,
            specification = rawMaterial.Specification,
            totalQuantity = rawMaterial.TotalQuantity,
            usedQuantity = rawMaterial.UsedQuantity,
            remainingQuantity = rawMaterial.RemainingQuantity,
            unit = rawMaterial.Unit,
            supplier = rawMaterial.Supplier,
            location = rawMaterial.Location,
            company = rawMaterial.Company,
            remark = rawMaterial.Remark,
            image = rawMaterial.Image,
            createdAt = rawMaterial.CreatedAt,
            updatedAt = rawMaterial.UpdatedAt,
            createdBy = rawMaterial.CreatedBy,
            updatedBy = rawMaterial.UpdatedBy
        };
    }

    public async Task<bool> DeleteRawMaterial(int id)
    {
        var rawMaterial = await _context.RawMaterials.FindAsync(id);
        if (rawMaterial == null)
        {
            return false;
        }

        _context.RawMaterials.Remove(rawMaterial);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> ImportRawMaterials(List<RawMaterialCreateDTO> rawMaterials)
    {
        var count = 0;
        foreach (var rawMaterialCreateDTO in rawMaterials)
        {
            var totalQuantity = rawMaterialCreateDTO.totalQuantity ?? 0;
            var usedQuantity = rawMaterialCreateDTO.usedQuantity ?? 0;
            var remainingQuantity = totalQuantity - usedQuantity;

            var rawMaterial = new RawMaterial
            {
                SortOrder = 0,
                ProductName = rawMaterialCreateDTO.productName,
                Brand = rawMaterialCreateDTO.brand,
                Specification = rawMaterialCreateDTO.specification,
                TotalQuantity = totalQuantity,
                UsedQuantity = usedQuantity,
                RemainingQuantity = remainingQuantity,
                Unit = rawMaterialCreateDTO.unit,
                Supplier = rawMaterialCreateDTO.supplier,
                Location = rawMaterialCreateDTO.location,
                Company = rawMaterialCreateDTO.company,
                Remark = rawMaterialCreateDTO.remark,
                Image = rawMaterialCreateDTO.image,
                CreatedAt = System.DateTime.Now,
                CreatedBy = rawMaterialCreateDTO.createdBy ?? "System"
            };

            _context.RawMaterials.Add(rawMaterial);
            count++;
        }

        await _context.SaveChangesAsync();
        return count;
    }

    public async Task<RawMaterialStatsDTO> GetRawMaterialStats()
    {
        var stats = await _context.RawMaterials
            .Select(r => new { r.TotalQuantity, r.UsedQuantity, r.RemainingQuantity })
            .ToListAsync();

        return new RawMaterialStatsDTO
        {
            TotalCount = stats.Count,
            TotalQuantity = stats.Sum(s => s.TotalQuantity),
            UsedQuantity = stats.Sum(s => s.UsedQuantity),
            RemainingQuantity = stats.Sum(s => s.RemainingQuantity)
        };
    }

    public async Task DeleteAllRawMaterials()
    {
        var rawMaterials = await _context.RawMaterials.ToListAsync();
        _context.RawMaterials.RemoveRange(rawMaterials);
        await _context.SaveChangesAsync();
    }
}