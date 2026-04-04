using System;
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

        private object ConvertToLogDto(UserActivityLog log)
        {
            return new
            {
                id = log.Id,
                userId = log.UserId,
                username = log.User?.Username ?? "未知用户",
                activityType = log.ActivityType,
                activityDescription = log.ActivityDescription,
                ipAddress = log.IpAddress,
                userAgent = log.UserAgent,
                createdAt = log.CreatedAt
            };
        }

        // GET: api/Log
        [HttpGet]
        public async Task<ActionResult> GetLogs(
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
                var (logs, total) = await _logService.GetLogsAsync(search, user, type, startDate, endDate, page, pageSize);
                
                // 转换为DTO，避免JSON序列化循环引用问题
                var logDtos = logs.Select(ConvertToLogDto).ToList();
                
                // 转换为前端期望的格式 [logs, total]
                return Ok(new object[] { logDtos, total });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/Log/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetLog(int id)
        {
            try
            {
                var log = await _logService.GetLogByIdAsync(id);
                if (log == null)
                {
                    return NotFound();
                }
                
                // 转换为DTO，避免JSON序列化循环引用问题
                var logDto = ConvertToLogDto(log);
                
                return Ok(logDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/Log
        [HttpPost]
        public async Task<ActionResult> CreateLog([FromBody] UserActivityLog log)
        {
            try
            {
                var createdLog = await _logService.CreateLogAsync(log);
                
                // 转换为DTO，避免JSON序列化循环引用问题
                var logDto = ConvertToLogDto(createdLog);
                
                return CreatedAtAction(nameof(GetLog), new { id = createdLog.Id }, logDto);
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

        // DELETE: api/Log/all
        [HttpDelete("all")]
        public async Task<ActionResult> ClearAllLogs()
        {
            try
            {
                await _logService.ClearAllLogsAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}