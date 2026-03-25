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
        // 生成出库单号
        projectOutbound.OutboundNumber = "PROOUT" + DateTime.Now.Ticks;
        projectOutbound.CreatedAt = DateTime.Now;
        projectOutbound.IsCompleted = false;

        // 计算总数量
        projectOutbound.TotalQuantity = projectOutbound.ProjectOutboundItems?.Sum(item => item.Quantity) ?? 0;

        _context.ProjectOutbounds.Add(projectOutbound);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProjectOutbound), new { id = projectOutbound.Id }, projectOutbound);
    }

    // PUT: api/ProjectOutbound/5/complete
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteProjectOutbound(int id)
    {
        var projectOutbound = await _context.ProjectOutbounds.FindAsync(id);

        if (projectOutbound == null)
        {
            return NotFound();
        }

        projectOutbound.IsCompleted = true;
        projectOutbound.CompletedAt = DateTime.Now;
        projectOutbound.UpdatedAt = DateTime.Now;

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
