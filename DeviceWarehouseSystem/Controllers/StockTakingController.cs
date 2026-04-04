using DeviceWarehouseSystem.DTOs;
using DeviceWarehouseSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DeviceWarehouseSystem.Controllers;

/// <summary>
/// 库存盘点控制器
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockTakingController : ControllerBase
{
    private readonly StockTakingService _stockTakingService;
    private readonly LogService _logService;

    public StockTakingController(StockTakingService stockTakingService, LogService logService)
    {
        _stockTakingService = stockTakingService;
        _logService = logService;
    }

    /// <summary>
    /// 获取所有盘点单
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockTakingDTO>>> GetAllStockTakings()
    {
        try
        {
            var stockTakings = await _stockTakingService.GetAllStockTakingsAsync();
            return Ok(stockTakings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// 根据ID获取盘点单
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<StockTakingDTO>> GetStockTakingById(int id)
    {
        try
        {
            var stockTaking = await _stockTakingService.GetStockTakingByIdAsync(id);
            if (stockTaking == null)
            {
                return NotFound(new { message = "盘点单不存在" });
            }
            return Ok(stockTaking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// 创建盘点单
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<StockTakingDTO>> CreateStockTaking([FromBody] CreateStockTakingDTO dto)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            var username = User.Identity?.Name;
            
            dto.CreatedBy = username;
            
            var stockTaking = await _stockTakingService.CreateStockTakingAsync(dto);
            
            // 记录日志
            if (userId != null && int.TryParse(userId, out int uid))
            {
                await _logService.LogUserActivityAsync(uid, "库存盘点", 
                    $"创建盘点单：{stockTaking.StockTakingNo}，类型：{stockTaking.StockTakingType}", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }
            
            return CreatedAtAction(nameof(GetStockTakingById), new { id = stockTaking.Id }, stockTaking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
        /// 开始盘点
        /// </summary>
        [HttpPost("{id}/start")]
        public async Task<ActionResult<StockTakingDTO>> StartStockTaking(int id)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                var username = User.FindFirst("username")?.Value;
                var stockTaking = await _stockTakingService.StartStockTakingAsync(id, username ?? "未知用户");
                
                if (stockTaking == null)
                {
                    return NotFound(new { message = "盘点单不存在" });
                }
                
                // 记录日志
                if (userId != null && int.TryParse(userId, out int uid))
                {
                    await _logService.LogUserActivityAsync(uid, "库存盘点", 
                        $"开始盘点单：{stockTaking.StockTakingNo}，类型：{stockTaking.StockTakingType}", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                
                return Ok(stockTaking);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    /// <summary>
        /// 更新盘点明细
        /// </summary>
        [HttpPost("{stockTakingId}/items")]
        public async Task<ActionResult<StockTakingItemDTO>> UpdateStockTakingItem(int stockTakingId, [FromBody] UpdateStockTakingItemDTO dto)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                var item = await _stockTakingService.UpdateStockTakingItemAsync(stockTakingId, dto);
                
                if (item == null)
                {
                    return NotFound(new { message = "盘点明细不存在" });
                }
                
                // 记录日志
                if (userId != null && int.TryParse(userId, out int uid))
                {
                    await _logService.LogUserActivityAsync(uid, "库存盘点", 
                        $"更新盘点明细：盘点单ID={stockTakingId}，物料ID={dto.ItemId}", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                
                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    /// <summary>
    /// 完成盘点
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<ActionResult<StockTakingDTO>> CompleteStockTaking(int id, [FromBody] CompleteStockTakingDTO dto)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            var username = User.FindFirst("username")?.Value;
            
            var stockTaking = await _stockTakingService.CompleteStockTakingAsync(id, dto);
            
            if (stockTaking == null)
            {
                return NotFound(new { message = "盘点单不存在" });
            }
            
            // 记录日志
            if (userId != null && int.TryParse(userId, out int uid))
            {
                await _logService.LogUserActivityAsync(uid, "库存盘点", 
                    $"完成盘点单：{stockTaking.StockTakingNo}，盘点人：{username}", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }
            
            return Ok(stockTaking);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// 删除盘点单
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStockTaking(int id)
    {
        try
        {
            var userId = User.FindFirst("userId")?.Value;
            
            var result = await _stockTakingService.DeleteStockTakingAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "盘点单不存在" });
            }
            
            // 记录日志
            if (userId != null && int.TryParse(userId, out int uid))
            {
                await _logService.LogUserActivityAsync(uid, "库存盘点", 
                    $"删除盘点单：{id}", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
