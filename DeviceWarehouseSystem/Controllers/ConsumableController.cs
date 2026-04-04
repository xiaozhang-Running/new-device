using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsumableController : ControllerBase
{
    private readonly ConsumableService _consumableService;
    private readonly LogService _logService;

    public ConsumableController(ConsumableService consumableService, LogService logService)
    {
        _consumableService = consumableService;
        _logService = logService;
    }

    private int? GetCurrentUserId()
    {
        var userIdStr = HttpContext.Items["UserId"]?.ToString();
        if (int.TryParse(userIdStr, out int userId))
        {
            return userId;
        }
        return null;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConsumableDTO>>> GetConsumables([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? location)
    {
        IEnumerable<ConsumableDTO> consumables;

        if (!string.IsNullOrEmpty(search))
        {
            consumables = await _consumableService.SearchConsumablesAsync(search);
        }
        else if (!string.IsNullOrEmpty(status))
        {
            consumables = await _consumableService.FilterConsumablesByStatusAsync(status);
        }
        else if (!string.IsNullOrEmpty(location))
        {
            consumables = await _consumableService.FilterConsumablesByLocationAsync(location);
        }
        else
        {
            consumables = await _consumableService.GetAllConsumablesAsync();
        }

        return Ok(consumables);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConsumableDTO>> GetConsumable(int id)
    {
        var consumable = await _consumableService.GetConsumableByIdAsync(id);
        if (consumable == null)
        {
            return NotFound();
        }
        return Ok(consumable);
    }

    [HttpPost]
    public async Task<ActionResult<ConsumableDTO>> PostConsumable(ConsumableDTO consumableDTO)
    {
        var createDTO = new ConsumableCreateDTO
        {
            Name = consumableDTO.Name,
            Brand = consumableDTO.Brand,
            ModelSpecification = consumableDTO.ModelSpecification,
            TotalQuantity = consumableDTO.TotalQuantity,
            UsedQuantity = consumableDTO.UsedQuantity,
            RemainingQuantity = consumableDTO.RemainingQuantity,
            Unit = consumableDTO.Unit,
            Company = consumableDTO.Company,
            Accessories = consumableDTO.Accessories,
            Remark = consumableDTO.Remark,
            Image = consumableDTO.Image,
            Location = consumableDTO.Location
        };
        
        var consumable = await _consumableService.CreateConsumableAsync(createDTO);
        
        var userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await _logService.LogUserActivityAsync(userId.Value, "耗材管理", 
                $"添加耗材：{consumableDTO.Name}", 
                HttpContext.Connection.RemoteIpAddress?.ToString());
        }
        
        return CreatedAtAction(nameof(GetConsumable), new { id = consumable.Id }, consumable);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ConsumableDTO>> PutConsumable(int id, ConsumableUpdateDTO updateDTO)
    {
        var consumable = await _consumableService.UpdateConsumableAsync(id, updateDTO);
        if (consumable == null)
        {
            return NotFound();
        }
        
        var userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await _logService.LogUserActivityAsync(userId.Value, "耗材管理", 
                $"编辑耗材：{consumable.Name}", 
                HttpContext.Connection.RemoteIpAddress?.ToString());
        }
        
        return Ok(consumable);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteConsumable(int id)
    {
        var consumable = await _consumableService.GetConsumableByIdAsync(id);
        var result = await _consumableService.DeleteConsumableAsync(id);
        if (!result)
        {
            return NotFound();
        }
        
        var userId = GetCurrentUserId();
        if (userId.HasValue && consumable != null)
        {
            await _logService.LogUserActivityAsync(userId.Value, "耗材管理", 
                $"删除耗材：{consumable.Name}", 
                HttpContext.Connection.RemoteIpAddress?.ToString());
        }
        
        return Ok(result);
    }

    [HttpDelete]
    public async Task<ActionResult<bool>> DeleteAllConsumables()
    {
        var result = await _consumableService.DeleteAllConsumablesAsync();
        
        var userId = GetCurrentUserId();
        if (userId.HasValue)
        {
            await _logService.LogUserActivityAsync(userId.Value, "耗材管理", 
                "清空所有耗材", 
                HttpContext.Connection.RemoteIpAddress?.ToString());
        }
        
        return Ok(result);
    }
}
