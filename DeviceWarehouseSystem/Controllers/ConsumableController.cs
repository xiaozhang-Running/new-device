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

    public ConsumableController(ConsumableService consumableService)
    {
        _consumableService = consumableService;
    }

    // GET: api/Consumable
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

    // GET: api/Consumable/5
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

    // POST: api/Consumable
    [HttpPost]
    public async Task<ActionResult<ConsumableDTO>> PostConsumable(ConsumableDTO consumableDTO)
    {
        // 转换为ConsumableCreateDTO
        var createDTO = new ConsumableCreateDTO
        {
            Name = consumableDTO.Name,
            Brand = consumableDTO.Brand,
            ModelSpecification = consumableDTO.ModelSpecification,
            TotalQuantity = consumableDTO.TotalQuantity,
            OriginalQuantity = consumableDTO.OriginalQuantity,
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
        return CreatedAtAction(nameof(GetConsumable), new { id = consumable.Id }, consumable);
    }

    // PUT: api/Consumable/5
    [HttpPut("{id}")]
    public async Task<ActionResult<ConsumableDTO>> PutConsumable(int id, ConsumableDTO consumableDTO)
    {
        // 转换为ConsumableUpdateDTO
        var updateDTO = new ConsumableUpdateDTO
        {
            Name = consumableDTO.Name,
            Brand = consumableDTO.Brand,
            ModelSpecification = consumableDTO.ModelSpecification,
            TotalQuantity = consumableDTO.TotalQuantity,
            OriginalQuantity = consumableDTO.OriginalQuantity,
            UsedQuantity = consumableDTO.UsedQuantity,
            RemainingQuantity = consumableDTO.RemainingQuantity,
            Unit = consumableDTO.Unit,
            Company = consumableDTO.Company,
            Accessories = consumableDTO.Accessories,
            Remark = consumableDTO.Remark,
            Image = consumableDTO.Image,
            Location = consumableDTO.Location
        };
        
        var consumable = await _consumableService.UpdateConsumableAsync(id, updateDTO);
        if (consumable == null)
        {
            return NotFound();
        }
        return Ok(consumable);
    }

    // DELETE: api/Consumable/5
    [HttpDelete("{id}")]
    public async Task<ActionResult<bool>> DeleteConsumable(int id)
    {
        var result = await _consumableService.DeleteConsumableAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return Ok(result);
    }

    // DELETE: api/Consumable
    [HttpDelete]
    public async Task<ActionResult<bool>> DeleteAllConsumables()
    {
        var result = await _consumableService.DeleteAllConsumablesAsync();
        return Ok(result);
    }
}