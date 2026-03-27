using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeviceWarehouseSystem.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace DeviceWarehouseSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectOutboundController : ControllerBase
{
    private readonly DeviceWarehouseContext _context;

    public ProjectOutboundController(DeviceWarehouseContext context)
    {
        _context = context;
    }

    // GET: api/ProjectOutbound
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectOutbound>>> GetProjectOutbounds()
    {
        var projectOutbounds = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // 清除导航属性以避免循环引用
        foreach (var outbound in projectOutbounds)
        {
            foreach (var item in outbound.ProjectOutboundItems)
            {
                item.Outbound = null!;
            }
        }

        return projectOutbounds;
    }

    // GET: api/ProjectOutbound/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectOutbound>> GetProjectOutbound(int id)
    {
        var projectOutbound = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (projectOutbound == null)
        {
            return NotFound();
        }

        // 清除导航属性以避免循环引用
        foreach (var item in projectOutbound.ProjectOutboundItems)
        {
            item.Outbound = null!;
        }

        return projectOutbound;
    }

    // POST: api/ProjectOutbound
    [HttpPost]
    public async Task<ActionResult<ProjectOutbound>> CreateProjectOutbound([FromBody] JsonElement projectOutboundData)
    {
        try
        {
            // 提取基本信息
            string projectName = projectOutboundData.GetProperty("ProjectName").GetString() ?? "";
            DateTime outboundDate = projectOutboundData.GetProperty("OutboundDate").GetDateTime();
            string projectTime = projectOutboundData.GetProperty("ProjectTime").GetString() ?? "";
            string projectManager = projectOutboundData.GetProperty("ProjectManager").GetString() ?? "";
            string recipient = projectOutboundData.GetProperty("Recipient").GetString() ?? "";
            string outboundType = projectOutboundData.GetProperty("OutboundType").GetString() ?? "";
            string contactPhone = projectOutboundData.GetProperty("ContactPhone").GetString() ?? "";
            string usageLocation = projectOutboundData.GetProperty("UsageLocation").GetString() ?? "";
            
            DateTime? returnDate = null;
            if (projectOutboundData.TryGetProperty("ReturnDate", out var returnDateElement) && returnDateElement.ValueKind != JsonValueKind.Null)
            {
                returnDate = returnDateElement.GetDateTime();
            }
            
            string warehouseKeeper = projectOutboundData.GetProperty("WarehouseKeeper").GetString() ?? "";
            
            int? logisticsMethod = null;
            if (projectOutboundData.TryGetProperty("LogisticsMethod", out var logisticsMethodElement) && logisticsMethodElement.ValueKind != JsonValueKind.Null)
            {
                logisticsMethod = logisticsMethodElement.GetInt32();
            }
            
            string outboundImages = "";
            if (projectOutboundData.TryGetProperty("OutboundImages", out var outboundImagesElement))
            {
                outboundImages = outboundImagesElement.GetString() ?? "";
            }
            
            string remark = "";
            if (projectOutboundData.TryGetProperty("Remark", out var remarkElement))
            {
                remark = remarkElement.GetString() ?? "";
            }

            // 生成出库单号
            string outboundNumber = "PROOUT" + DateTime.Now.Ticks;
            DateTime createdAt = DateTime.Now;
            bool isCompleted = false;

            // 创建新的ProjectOutbound对象
            var newProjectOutbound = new ProjectOutbound
            {
                OutboundNumber = outboundNumber,
                OutboundDate = outboundDate,
                ProjectName = projectName,
                ProjectTime = projectTime,
                ProjectManager = projectManager,
                Recipient = recipient,
                OutboundType = outboundType,
                ContactPhone = contactPhone,
                UsageLocation = usageLocation,
                ReturnDate = returnDate,
                WarehouseKeeper = warehouseKeeper,
                LogisticsMethod = logisticsMethod,
                OutboundImages = outboundImages,
                Remark = remark,
                IsCompleted = isCompleted,
                CreatedAt = createdAt,
                ProjectOutboundItems = new List<ProjectOutboundItem>()
            };

            // 添加ProjectOutboundItems
            if (projectOutboundData.TryGetProperty("ProjectOutboundItems", out var projectOutboundItemsElement) && 
                projectOutboundItemsElement.ValueKind == JsonValueKind.Array)
            {
                int totalQuantity = 0;
                foreach (var itemData in projectOutboundItemsElement.EnumerateArray())
                {
                    int quantity = itemData.GetProperty("Quantity").GetInt32();
                    totalQuantity += quantity;
                    
                    // 解析CreatedAt字段，处理ISO格式的日期字符串
                    DateTime itemCreatedAt = DateTime.Now;
                    if (itemData.TryGetProperty("CreatedAt", out var createdAtElement) && createdAtElement.ValueKind == JsonValueKind.String)
                    {
                        var createdAtString = createdAtElement.GetString();
                        if (!string.IsNullOrEmpty(createdAtString))
                        {
                            if (!DateTime.TryParse(createdAtString, out itemCreatedAt))
                            {
                                // 如果解析失败，使用当前时间
                                itemCreatedAt = DateTime.Now;
                            }
                        }
                    }

                    var item = new ProjectOutboundItem
                    {
                        ItemType = itemData.GetProperty("ItemType").GetInt32(),
                        ItemId = itemData.GetProperty("ItemId").GetInt32(),
                        ItemName = itemData.GetProperty("ItemName").GetString() ?? "",
                        DeviceCode = itemData.TryGetProperty("DeviceCode", out var deviceCodeElement) ? deviceCodeElement.GetString() : null,
                        Brand = itemData.TryGetProperty("Brand", out var brandElement) ? brandElement.GetString() : null,
                        Model = itemData.TryGetProperty("Model", out var modelElement) ? modelElement.GetString() : null,
                        Quantity = quantity,
                        Unit = itemData.TryGetProperty("Unit", out var unitElement) ? unitElement.GetString() : null,
                        Accessories = itemData.TryGetProperty("Accessories", out var accessoriesElement) ? accessoriesElement.GetString() : null,
                        Remark = itemData.TryGetProperty("Remark", out var itemRemarkElement) ? itemRemarkElement.GetString() : null,
                        DeviceStatus = itemData.TryGetProperty("DeviceStatus", out var deviceStatusElement) ? deviceStatusElement.GetString() : null,
                        CreatedAt = itemCreatedAt
                    };
                    newProjectOutbound.ProjectOutboundItems.Add(item);
                }
                newProjectOutbound.TotalQuantity = totalQuantity;
            }

            _context.ProjectOutbounds.Add(newProjectOutbound);
            await _context.SaveChangesAsync();

            // 清除导航属性以避免循环引用
            foreach (var item in newProjectOutbound.ProjectOutboundItems)
            {
                item.Outbound = null!;
            }

            return CreatedAtAction(nameof(GetProjectOutbound), new { id = newProjectOutbound.Id }, newProjectOutbound);
            
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    // PUT: api/ProjectOutbound/5/complete
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteProjectOutbound(int id)
    {
        var projectOutbound = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (projectOutbound == null)
        {
            return NotFound();
        }

        projectOutbound.IsCompleted = true;
        projectOutbound.CompletedAt = DateTime.Now;
        projectOutbound.UpdatedAt = DateTime.Now;

        // 更新设备状态和项目信息
        foreach (var item in projectOutbound.ProjectOutboundItems)
        {
            if (item.ItemType == 1) // 专用设备
            {
                var specialEquipment = await _context.SpecialEquipments.FindAsync(item.ItemId);
                if (specialEquipment != null)
                {
                    specialEquipment.UseStatus = 1; // 1表示使用中
                    specialEquipment.ProjectName = projectOutbound.ProjectName;
                    specialEquipment.ProjectTime = projectOutbound.ProjectTime;
                    specialEquipment.UpdatedAt = DateTime.Now;
                    _context.Entry(specialEquipment).State = EntityState.Modified;
                }
            }
            else if (item.ItemType == 2) // 通用设备
            {
                var generalEquipment = await _context.GeneralEquipments.FindAsync(item.ItemId);
                if (generalEquipment != null)
                {
                    generalEquipment.UseStatus = 1; // 1表示使用中
                    generalEquipment.ProjectName = projectOutbound.ProjectName;
                    generalEquipment.ProjectTime = projectOutbound.ProjectTime;
                    generalEquipment.UpdatedAt = DateTime.Now;
                    _context.Entry(generalEquipment).State = EntityState.Modified;
                }
            }
            else if (item.ItemType == 3) // 耗材
            {
                var consumable = await _context.Consumables.FindAsync(item.ItemId);
                if (consumable != null)
                {
                    consumable.UsedQuantity += item.Quantity;
                    consumable.RemainingQuantity -= item.Quantity;
                    consumable.UpdatedAt = DateTime.Now;
                    _context.Entry(consumable).State = EntityState.Modified;
                }
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProjectOutboundExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // PUT: api/ProjectOutbound/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProjectOutbound(int id, ProjectOutbound projectOutbound)
    {
        if (id != projectOutbound.Id)
        {
            return BadRequest();
        }

        _context.Entry(projectOutbound).State = EntityState.Modified;
        projectOutbound.UpdatedAt = DateTime.Now;

        // 重新计算总数量
        projectOutbound.TotalQuantity = projectOutbound.ProjectOutboundItems?.Sum(item => item.Quantity) ?? 0;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProjectOutboundExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/ProjectOutbound/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProjectOutbound(int id)
    {
        var projectOutbound = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (projectOutbound == null)
        {
            return NotFound();
        }

        // 如果出库单已完成，需要恢复设备状态和耗材数量
        if (projectOutbound.IsCompleted)
        {
            foreach (var item in projectOutbound.ProjectOutboundItems)
            {
                if (item.ItemType == 1) // 专用设备
                {
                    var specialEquipment = await _context.SpecialEquipments.FindAsync(item.ItemId);
                    if (specialEquipment != null)
                    {
                        specialEquipment.UseStatus = 3; // 3表示未使用
                        specialEquipment.ProjectName = null;
                        specialEquipment.ProjectTime = null;
                        specialEquipment.UpdatedAt = DateTime.Now;
                        _context.Entry(specialEquipment).State = EntityState.Modified;
                    }
                }
                else if (item.ItemType == 2) // 通用设备
                {
                    var generalEquipment = await _context.GeneralEquipments.FindAsync(item.ItemId);
                    if (generalEquipment != null)
                    {
                        generalEquipment.UseStatus = 3; // 3表示未使用
                        generalEquipment.ProjectName = null;
                        generalEquipment.ProjectTime = null;
                        generalEquipment.UpdatedAt = DateTime.Now;
                        _context.Entry(generalEquipment).State = EntityState.Modified;
                    }
                }
                else if (item.ItemType == 3) // 耗材
                {
                    var consumable = await _context.Consumables.FindAsync(item.ItemId);
                    if (consumable != null)
                    {
                        consumable.UsedQuantity -= item.Quantity;
                        consumable.RemainingQuantity += item.Quantity;
                        consumable.UpdatedAt = DateTime.Now;
                        _context.Entry(consumable).State = EntityState.Modified;
                    }
                }
            }
        }

        _context.ProjectOutbounds.Remove(projectOutbound);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ProjectOutboundExists(int id)
    {
        return _context.ProjectOutbounds.Any(e => e.Id == id);
    }
}
