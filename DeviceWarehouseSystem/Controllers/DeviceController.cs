using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly DeviceService _deviceService;
        private readonly LogService _logService;

        public DeviceController(DeviceService deviceService, LogService logService)
        {
            _deviceService = deviceService;
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

        private ActionResult HandleException(Exception ex)
        {
            var errorMessage = ex.Message;
            if (ex.InnerException != null)
            {
                errorMessage += " | 内部错误: " + ex.InnerException.Message;
                if (ex.InnerException.InnerException != null)
                {
                    errorMessage += " | 内部错误: " + ex.InnerException.InnerException.Message;
                }
            }
            return BadRequest(new { message = errorMessage });
        }

        // 专用设备管理
        [HttpGet("special-equipments")]
        public async Task<ActionResult<List<SpecialEquipmentDTO>>> GetSpecialEquipments()
        {
            try
            {
                var equipments = await _deviceService.GetSpecialEquipmentsAsync();
                return Ok(equipments);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("special-equipments/paged")]
        public async Task<ActionResult<PagedResult<SpecialEquipmentDTO>>> GetPagedSpecialEquipments([FromQuery] PaginationParams parameters)
        {
            try
            {
                var result = await _deviceService.GetPagedSpecialEquipmentsAsync(parameters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("special-equipments/{id}")]
        public async Task<ActionResult<SpecialEquipmentDTO>> GetSpecialEquipmentById(int id)
        {
            try
            {
                var equipment = await _deviceService.GetSpecialEquipmentByIdAsync(id);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                if (ex.Message == "设备不存在")
                {
                    return NotFound(new { message = ex.Message });
                }
                return HandleException(ex);
            }
        }

        [HttpPost("special-equipments")]
        public async Task<ActionResult<SpecialEquipmentDTO>> CreateSpecialEquipment([FromBody] SpecialEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateSpecialEquipmentAsync(dto);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"添加专用设备：{dto.Name}（编号：{dto.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpPut("special-equipments/{id}")]
        public async Task<ActionResult<SpecialEquipmentDTO>> UpdateSpecialEquipment(int id, [FromBody] SpecialEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.UpdateSpecialEquipmentAsync(id, dto);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"编辑专用设备：{dto.Name}（编号：{dto.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpDelete("special-equipments/{id}")]
        public async Task<ActionResult> DeleteSpecialEquipment(int id)
        {
            try
            {
                var equipment = await _deviceService.GetSpecialEquipmentByIdAsync(id);
                await _deviceService.DeleteSpecialEquipmentAsync(id);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"删除专用设备：{equipment.Name}（编号：{equipment.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpDelete("special-equipments")]
        public async Task<ActionResult> ClearAllSpecialEquipments()
        {
            try
            {
                await _deviceService.ClearAllSpecialEquipmentsAsync();
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        "清空所有专用设备", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 通用设备管理
        [HttpGet("general-equipments")]
        public async Task<ActionResult<List<GeneralEquipmentDTO>>> GetGeneralEquipments()
        {
            try
            {
                var equipments = await _deviceService.GetGeneralEquipmentsAsync();
                return Ok(equipments);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("general-equipments/paged")]
        public async Task<ActionResult<PagedResult<GeneralEquipmentDTO>>> GetPagedGeneralEquipments([FromQuery] PaginationParams parameters)
        {
            try
            {
                var result = await _deviceService.GetPagedGeneralEquipmentsAsync(parameters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("general-equipments/{id}")]
        public async Task<ActionResult<GeneralEquipmentDTO>> GetGeneralEquipmentById(int id)
        {
            try
            {
                var equipment = await _deviceService.GetGeneralEquipmentByIdAsync(id);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                if (ex.Message == "设备不存在")
                {
                    return NotFound(new { message = ex.Message });
                }
                return HandleException(ex);
            }
        }

        [HttpPost("general-equipments")]
        public async Task<ActionResult<GeneralEquipmentDTO>> CreateGeneralEquipment([FromBody] GeneralEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateGeneralEquipmentAsync(dto);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"添加通用设备：{dto.Name}（编号：{dto.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpPut("general-equipments/{id}")]
        public async Task<ActionResult<GeneralEquipmentDTO>> UpdateGeneralEquipment(int id, [FromBody] GeneralEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.UpdateGeneralEquipmentAsync(id, dto);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"编辑通用设备：{dto.Name}（编号：{dto.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpDelete("general-equipments/{id}")]
        public async Task<ActionResult> DeleteGeneralEquipment(int id)
        {
            try
            {
                var equipment = await _deviceService.GetGeneralEquipmentByIdAsync(id);
                await _deviceService.DeleteGeneralEquipmentAsync(id);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        $"删除通用设备：{equipment.Name}（编号：{equipment.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpDelete("general-equipments")]
        public async Task<ActionResult> ClearAllGeneralEquipments()
        {
            try
            {
                await _deviceService.ClearAllGeneralEquipmentsAsync();
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备管理", 
                        "清空所有通用设备", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 待维修设备管理
        [HttpGet("repair-equipments")]
        public async Task<ActionResult<List<RepairEquipmentDTO>>> GetRepairEquipments()
        {
            try
            {
                var equipments = await _deviceService.GetRepairEquipmentsAsync();
                return Ok(equipments);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 报废设备管理
        [HttpGet("scrap-equipments")]
        public async Task<ActionResult<List<ScrapEquipmentDTO>>> GetScrapEquipments()
        {
            try
            {
                var equipments = await _deviceService.GetScrapEquipmentsAsync();
                return Ok(equipments);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpPost("scrap-equipments")]
        public async Task<ActionResult<ScrapEquipmentDTO>> CreateScrapEquipment([FromBody] ScrapEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateScrapEquipmentAsync(dto);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备报废", 
                        $"报废设备：{dto.EquipmentName}（编号：{dto.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("scrap-equipments/{id}")]
        public async Task<ActionResult<ScrapEquipmentDTO>> GetScrapEquipmentById(int id)
        {
            try
            {
                var equipment = await _deviceService.GetScrapEquipmentByIdAsync(id);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpDelete("scrap-equipments/{id}")]
        public async Task<ActionResult> DeleteScrapEquipment(int id)
        {
            try
            {
                var equipment = await _deviceService.GetScrapEquipmentByIdAsync(id);
                await _deviceService.DeleteScrapEquipmentAsync(id);
                var userId = GetCurrentUserId();
                if (userId.HasValue)
                {
                    await _logService.LogUserActivityAsync(userId.Value, "设备报废", 
                        $"删除报废记录：{equipment.EquipmentName}（编号：{equipment.DeviceCode}）", 
                        HttpContext.Connection.RemoteIpAddress?.ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 库存设备查询
        [HttpGet("inventory/special")]
        public async Task<ActionResult<List<InventoryDeviceDTO>>> GetSpecialInventoryDevices()
        {
            try
            {
                var devices = await _deviceService.GetSpecialInventoryDevicesAsync();
                return Ok(devices);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("inventory/general")]
        public async Task<ActionResult<List<InventoryDeviceDTO>>> GetGeneralInventoryDevices()
        {
            try
            {
                var devices = await _deviceService.GetGeneralInventoryDevicesAsync();
                return Ok(devices);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("special-equipment-details")]
        public async Task<ActionResult<List<SpecialEquipmentDTO>>> GetSpecialEquipmentDetails([FromQuery] string deviceName, [FromQuery] string? brand = null)
        {
            try
            {
                var devices = await _deviceService.GetSpecialEquipmentDetailsAsync(deviceName, brand);
                return Ok(devices);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        [HttpGet("general-equipment-details")]
        public async Task<ActionResult<List<GeneralEquipmentDTO>>> GetGeneralEquipmentDetails([FromQuery] string deviceName, [FromQuery] string? brand = null)
        {
            try
            {
                var devices = await _deviceService.GetGeneralEquipmentDetailsAsync(deviceName, brand);
                return Ok(devices);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }
    }
}
