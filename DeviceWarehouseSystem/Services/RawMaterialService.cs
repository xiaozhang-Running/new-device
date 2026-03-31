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

    public async Task<IEnumerable<RawMaterialDTO>> GetRawMaterials(string? search, string? location)
    {
        try
        {
            if (_context.RawMaterials == null)
            {
                return Enumerable.Empty<RawMaterialDTO>();
            }
            var query = _context.RawMaterials.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(r => 
                    (r.ProductName != null && r.ProductName.ToLower().Contains(searchLower)) ||
                    (r.Brand != null && r.Brand.ToLower().Contains(searchLower)) ||
                    (r.Specification != null && r.Specification.ToLower().Contains(searchLower)) ||
                    (r.Supplier != null && r.Supplier.ToLower().Contains(searchLower))
                );
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(r => r.Location == location);
            }

            return await query.Select(r => new RawMaterialDTO
            {
                Id = r.Id,
                productName = r.ProductName ?? "",
                brand = r.Brand ?? "",
                specification = r.Specification ?? "",
                totalQuantity = r.TotalQuantity,
                usedQuantity = r.UsedQuantity,
                remainingQuantity = r.RemainingQuantity,
                unit = r.Unit ?? "",
                supplier = r.Supplier ?? "",
                location = r.Location ?? "",
                company = r.Company ?? "",
                remark = r.Remark ?? "",
                image = r.Image ?? "",
                createdAt = r.CreatedAt,
                updatedAt = r.UpdatedAt,
                createdBy = r.CreatedBy ?? "",
                updatedBy = r.UpdatedBy ?? ""
            }).ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("获取原材料列表失败: " + ex.Message);
        }
    }

    public async Task<RawMaterialDTO> GetRawMaterialById(int id)
    {
        try
        {
            if (_context.RawMaterials == null)
            {
                throw new Exception("原材料上下文不存在");
            }
            var rawMaterial = await _context.RawMaterials.FindAsync(id);
            if (rawMaterial == null)
            {
                throw new Exception($"ID为 {id} 的原材料不存在");
            }

            return MapToRawMaterialDTO(rawMaterial);
        }
        catch (Exception ex)
        {
            throw new Exception($"获取ID为 {id} 的原材料失败: " + ex.Message);
        }
    }

    public async Task<RawMaterialDTO> CreateRawMaterial(RawMaterialCreateDTO rawMaterialCreateDTO)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.RawMaterials == null)
            {
                throw new Exception("RawMaterials context is null");
            }
            
            // 验证输入数据
            if (string.IsNullOrWhiteSpace(rawMaterialCreateDTO.productName))
            {
                throw new Exception("原材料名称不能为空");
            }

            var totalQuantity = rawMaterialCreateDTO.totalQuantity ?? 0;
            var usedQuantity = rawMaterialCreateDTO.usedQuantity ?? 0;
            var remainingQuantity = totalQuantity - usedQuantity;

            var rawMaterial = new RawMaterial
            {
                SortOrder = 0,
                ProductName = rawMaterialCreateDTO.productName ?? "",
                Brand = rawMaterialCreateDTO.brand ?? "",
                Specification = rawMaterialCreateDTO.specification ?? "",
                TotalQuantity = totalQuantity,
                UsedQuantity = usedQuantity,
                RemainingQuantity = remainingQuantity,
                Unit = rawMaterialCreateDTO.unit ?? "",
                Supplier = rawMaterialCreateDTO.supplier ?? "",
                Location = rawMaterialCreateDTO.location ?? "",
                Company = rawMaterialCreateDTO.company ?? "",
                Remark = rawMaterialCreateDTO.remark ?? "",
                Image = rawMaterialCreateDTO.image ?? "",
                CreatedAt = System.DateTime.Now,
                CreatedBy = rawMaterialCreateDTO.createdBy ?? "System"
            };

            _context.RawMaterials.Add(rawMaterial);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToRawMaterialDTO(rawMaterial);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("创建原材料失败: " + ex.Message);
        }
    }

    public async Task<RawMaterialDTO> UpdateRawMaterial(int id, RawMaterialUpdateDTO rawMaterialUpdateDTO)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.RawMaterials == null)
            {
                throw new Exception("原材料上下文不存在");
            }
            var rawMaterial = await _context.RawMaterials.FindAsync(id);
            if (rawMaterial == null)
            {
                throw new Exception($"ID为 {id} 的原材料不存在");
            }

            // 验证输入数据
            if (string.IsNullOrWhiteSpace(rawMaterialUpdateDTO.productName))
            {
                throw new Exception("原材料名称不能为空");
            }

            var totalQuantity = rawMaterialUpdateDTO.totalQuantity ?? 0;
            var usedQuantity = rawMaterialUpdateDTO.usedQuantity ?? 0;
            var remainingQuantity = totalQuantity - usedQuantity;

            rawMaterial.ProductName = rawMaterialUpdateDTO.productName ?? "";
            rawMaterial.Brand = rawMaterialUpdateDTO.brand ?? "";
            rawMaterial.Specification = rawMaterialUpdateDTO.specification ?? "";
            rawMaterial.TotalQuantity = totalQuantity;
            rawMaterial.UsedQuantity = usedQuantity;
            rawMaterial.RemainingQuantity = remainingQuantity;
            rawMaterial.Unit = rawMaterialUpdateDTO.unit ?? "";
            rawMaterial.Supplier = rawMaterialUpdateDTO.supplier ?? "";
            rawMaterial.Location = rawMaterialUpdateDTO.location ?? "";
            rawMaterial.Company = rawMaterialUpdateDTO.company ?? "";
            rawMaterial.Remark = rawMaterialUpdateDTO.remark ?? "";
            rawMaterial.Image = rawMaterialUpdateDTO.image ?? "";
            rawMaterial.UpdatedAt = System.DateTime.Now;
            rawMaterial.UpdatedBy = rawMaterialUpdateDTO.updatedBy ?? "";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return MapToRawMaterialDTO(rawMaterial);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"更新ID为 {id} 的原材料失败: " + ex.Message);
        }
    }

    public async Task<bool> DeleteRawMaterial(int id)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.RawMaterials == null)
            {
                return false;
            }
            var rawMaterial = await _context.RawMaterials.FindAsync(id);
            if (rawMaterial == null)
            {
                return false;
            }

            _context.RawMaterials.Remove(rawMaterial);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception($"删除ID为 {id} 的原材料失败: " + ex.Message);
        }
    }

    public async Task<int> ImportRawMaterials(List<RawMaterialCreateDTO> rawMaterials)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.RawMaterials == null)
            {
                return 0;
            }
            var count = 0;
            foreach (var rawMaterialCreateDTO in rawMaterials)
            {
                // 跳过无效数据
                if (string.IsNullOrWhiteSpace(rawMaterialCreateDTO.productName))
                {
                    continue;
                }

                var totalQuantity = rawMaterialCreateDTO.totalQuantity ?? 0;
                var usedQuantity = rawMaterialCreateDTO.usedQuantity ?? 0;
                var remainingQuantity = totalQuantity - usedQuantity;

                var rawMaterial = new RawMaterial
                {
                    SortOrder = 0,
                    ProductName = rawMaterialCreateDTO.productName ?? "",
                    Brand = rawMaterialCreateDTO.brand ?? "",
                    Specification = rawMaterialCreateDTO.specification ?? "",
                    TotalQuantity = totalQuantity,
                    UsedQuantity = usedQuantity,
                    RemainingQuantity = remainingQuantity,
                    Unit = rawMaterialCreateDTO.unit ?? "",
                    Supplier = rawMaterialCreateDTO.supplier ?? "",
                    Location = rawMaterialCreateDTO.location ?? "",
                    Company = rawMaterialCreateDTO.company ?? "",
                    Remark = rawMaterialCreateDTO.remark ?? "",
                    Image = rawMaterialCreateDTO.image ?? "",
                    CreatedAt = System.DateTime.Now,
                    CreatedBy = rawMaterialCreateDTO.createdBy ?? "System"
                };

                _context.RawMaterials.Add(rawMaterial);
                count++;
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return count;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("导入原材料失败: " + ex.Message);
        }
    }

    public async Task<RawMaterialStatsDTO> GetRawMaterialStats()
    {
        try
        {
            if (_context.RawMaterials == null)
            {
                return new RawMaterialStatsDTO
                {
                    TotalCount = 0,
                    TotalQuantity = 0,
                    UsedQuantity = 0,
                    RemainingQuantity = 0
                };
            }
            // 优化查询，直接在数据库中计算统计数据
            var stats = await _context.RawMaterials
                .GroupBy(r => 1)
                .Select(g => new {
                    TotalCount = g.Count(),
                    TotalQuantity = g.Sum(r => r.TotalQuantity),
                    UsedQuantity = g.Sum(r => r.UsedQuantity),
                    RemainingQuantity = g.Sum(r => r.RemainingQuantity)
                })
                .FirstOrDefaultAsync();

            return new RawMaterialStatsDTO
            {
                TotalCount = stats?.TotalCount ?? 0,
                TotalQuantity = stats?.TotalQuantity ?? 0,
                UsedQuantity = stats?.UsedQuantity ?? 0,
                RemainingQuantity = stats?.RemainingQuantity ?? 0
            };
        }
        catch (Exception ex)
        {
            throw new Exception("获取原材料统计数据失败: " + ex.Message);
        }
    }

    public async Task DeleteAllRawMaterials()
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (_context.RawMaterials != null)
            {
                // 优化删除操作，直接使用 RemoveRange 而不是先查询
                await _context.RawMaterials.ExecuteDeleteAsync();
                await transaction.CommitAsync();
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new Exception("删除所有原材料失败: " + ex.Message);
        }
    }

    // 辅助方法：将RawMaterial映射到RawMaterialDTO
    private RawMaterialDTO MapToRawMaterialDTO(RawMaterial rawMaterial)
    {
        return new RawMaterialDTO
        {
            Id = rawMaterial.Id,
            productName = rawMaterial.ProductName ?? "",
            brand = rawMaterial.Brand ?? "",
            specification = rawMaterial.Specification ?? "",
            totalQuantity = rawMaterial.TotalQuantity,
            usedQuantity = rawMaterial.UsedQuantity,
            remainingQuantity = rawMaterial.RemainingQuantity,
            unit = rawMaterial.Unit ?? "",
            supplier = rawMaterial.Supplier ?? "",
            location = rawMaterial.Location ?? "",
            company = rawMaterial.Company ?? "",
            remark = rawMaterial.Remark ?? "",
            image = rawMaterial.Image ?? "",
            createdAt = rawMaterial.CreatedAt,
            updatedAt = rawMaterial.UpdatedAt,
            createdBy = rawMaterial.CreatedBy ?? "",
            updatedBy = rawMaterial.UpdatedBy ?? ""
        };
    }
}