using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LogController : ControllerBase
    {
        private readonly LogService _logService;

        public LogController(LogService logService)
        {
            _logService = logService;
        }

        // GET: api/Log
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserActivityLog>>> GetLogs(
            [FromQuery] string? search,
            [FromQuery] string? user,
            [FromQuery] string? type,
            [FromQuery] string? startDate,
            [FromQuery] string? endDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var logs = await _logService.GetLogsAsync(search, user, type, startDate, endDate, page, pageSize);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Log/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserActivityLog>> GetLog(int id)
        {
            try
            {
                var log = await _logService.GetLogByIdAsync(id);
                if (log == null)
                {
                    return NotFound();
                }
                return Ok(log);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Log
        [HttpPost]
        public async Task<ActionResult<UserActivityLog>> CreateLog([FromBody] UserActivityLog log)
        {
            try
            {
                var createdLog = await _logService.CreateLogAsync(log);
                return CreatedAtAction(nameof(GetLog), new { id = createdLog.Id }, createdLog);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Log/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLog(int id)
        {
            try
            {
                await _logService.DeleteLogAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Log/export
        // [HttpGet("export")]
        // public async Task<ActionResult> ExportLogs()
        // {
        //     try
        //     {
        //         var fileContent = await _logService.ExportLogsAsync();
        //         return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "logs.xlsx");
        //     }
        //     catch (Exception ex)
        //     {
        //         return BadRequest(new { message = ex.Message });
        //     }
        // }
    }
}