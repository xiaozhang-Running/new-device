using System.Collections.Generic;
using System.Threading.Tasks;
using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Services;
using Microsoft.AspNetCore.Mvc;

namespace DeviceWarehouseSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RawMaterialsController : ControllerBase
{
    private readonly IRawMaterialService _rawMaterialService;

    public RawMaterialsController(IRawMaterialService rawMaterialService)
    {
        _rawMaterialService = rawMaterialService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RawMaterialDTO>>> GetRawMaterials([FromQuery] string? search = null, [FromQuery] string? location = null)
    {
        var rawMaterials = await _rawMaterialService.GetRawMaterials(search ?? "", location ?? "");
        return Ok(rawMaterials);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RawMaterialDTO>> GetRawMaterial(int id)
    {
        var rawMaterial = await _rawMaterialService.GetRawMaterialById(id);
        if (rawMaterial == null)
        {
            return NotFound();
        }
        return Ok(rawMaterial);
    }

    [HttpPost]
    public async Task<ActionResult<RawMaterialDTO>> CreateRawMaterial(RawMaterialCreateDTO rawMaterialCreateDTO)
    {
        if (string.IsNullOrEmpty(rawMaterialCreateDTO.productName))
        {
            return BadRequest("原材料名称是必填项");
        }
        var rawMaterial = await _rawMaterialService.CreateRawMaterial(rawMaterialCreateDTO);
        return CreatedAtAction(nameof(GetRawMaterial), new { id = rawMaterial.Id }, rawMaterial);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RawMaterialDTO>> UpdateRawMaterial(int id, RawMaterialUpdateDTO rawMaterialUpdateDTO)
    {
        if (string.IsNullOrEmpty(rawMaterialUpdateDTO.productName))
        {
            return BadRequest("原材料名称是必填项");
        }
        var rawMaterial = await _rawMaterialService.UpdateRawMaterial(id, rawMaterialUpdateDTO);
        if (rawMaterial == null)
        {
            return NotFound();
        }
        return Ok(rawMaterial);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteRawMaterial(int id)
    {
        var result = await _rawMaterialService.DeleteRawMaterial(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPost("import")]
    public async Task<ActionResult<int>> ImportRawMaterials(RawMaterialImportDTO importDTO)
    {
        var count = await _rawMaterialService.ImportRawMaterials(importDTO.RawMaterials);
        return Ok(count);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<RawMaterialStatsDTO>> GetRawMaterialStats()
    {
        var stats = await _rawMaterialService.GetRawMaterialStats();
        return Ok(stats);
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteAllRawMaterials()
    {
        await _rawMaterialService.DeleteAllRawMaterials();
        return NoContent();
    }
}