using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeviceWarehouseSystem.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
        return await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
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

        return projectOutbound;
    }

    // POST: api/ProjectOutbound
    [HttpPost]
    public async Task<ActionResult<ProjectOutbound>> CreateProjectOutbound(ProjectOutbound projectOutbound)
    {
        // 验证模型状态
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(new { errors = errors, modelState = ModelState });
        }

        // 生成出库单号
        projectOutbound.OutboundNumber = "PROOUT" + DateTime.Now.Ticks;
        projectOutbound.CreatedAt = DateTime.Now;
        projectOutbound.IsCompleted = false;

        // 计算总数量
        projectOutbound.TotalQuantity = projectOutbound.ProjectOutboundItems?.Sum(item => item.Quantity) ?? 0;

        // 创建新的ProjectOutbound对象，只包含必要的字段
        var newProjectOutbound = new ProjectOutbound
        {
            OutboundNumber = projectOutbound.OutboundNumber,
            OutboundDate = projectOutbound.OutboundDate,
            ProjectName = projectOutbound.ProjectName,
            ProjectCode = projectOutbound.ProjectCode,
            ProjectManager = projectOutbound.ProjectManager,
            Recipient = projectOutbound.Recipient,
            OutboundType = projectOutbound.OutboundType,
            ProjectTime = projectOutbound.ProjectTime,
            ContactPhone = projectOutbound.ContactPhone,
            UsageLocation = projectOutbound.UsageLocation,
            ReturnDate = projectOutbound.ReturnDate,
            Handler = projectOutbound.Handler,
            WarehouseKeeper = projectOutbound.WarehouseKeeper,
            LogisticsMethod = projectOutbound.LogisticsMethod,
            OutboundImages = projectOutbound.OutboundImages,
            Remark = projectOutbound.Remark,
            TotalQuantity = projectOutbound.TotalQuantity,
            IsCompleted = projectOutbound.IsCompleted,
            CreatedAt = projectOutbound.CreatedAt,
            ProjectOutboundItems = projectOutbound.ProjectOutboundItems?.Select(item => new ProjectOutboundItem
            {
                ItemType = item.ItemType,
                ItemId = item.ItemId,
                ItemName = item.ItemName,
                DeviceCode = item.DeviceCode,
                Brand = item.Brand,
                Model = item.Model,
                Quantity = item.Quantity,
                Unit = item.Unit,
                Accessories = item.Accessories,
                Remark = item.Remark,
                DeviceStatus = item.DeviceStatus,
                CreatedAt = item.CreatedAt
            }).ToList()
        };

        _context.ProjectOutbounds.Add(newProjectOutbound);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProjectOutbound), new { id = newProjectOutbound.Id }, newProjectOutbound);
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
            // 耗材不需要更新状态
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
        var projectOutbound = await _context.ProjectOutbounds.FindAsync(id);
        if (projectOutbound == null)
        {
            return NotFound();
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
