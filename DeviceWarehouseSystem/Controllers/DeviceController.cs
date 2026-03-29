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

        public DeviceController(DeviceService deviceService)
        {
            _deviceService = deviceService;
        }

        // 通用错误处理方法
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
        // GET: api/Device/special-equipments
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

        // GET: api/Device/special-equipments/paged
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

        // GET: api/Device/special-equipments/{id}
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
                return HandleException(ex);
            }
        }

        // POST: api/Device/special-equipments
        [HttpPost("special-equipments")]
        public async Task<ActionResult<SpecialEquipmentDTO>> CreateSpecialEquipment([FromBody] SpecialEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateSpecialEquipmentAsync(dto);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // PUT: api/Device/special-equipments/{id}
        [HttpPut("special-equipments/{id}")]
        public async Task<ActionResult<SpecialEquipmentDTO>> UpdateSpecialEquipment(int id, [FromBody] SpecialEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.UpdateSpecialEquipmentAsync(id, dto);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // DELETE: api/Device/special-equipments/{id}
        [HttpDelete("special-equipments/{id}")]
        public async Task<ActionResult> DeleteSpecialEquipment(int id)
        {
            try
            {
                await _deviceService.DeleteSpecialEquipmentAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // DELETE: api/Device/special-equipments
        [HttpDelete("special-equipments")]
        public async Task<ActionResult> ClearAllSpecialEquipments()
        {
            try
            {
                await _deviceService.ClearAllSpecialEquipmentsAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 通用设备管理
        // GET: api/Device/general-equipments
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

        // GET: api/Device/general-equipments/paged
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

        // GET: api/Device/general-equipments/{id}
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
                return HandleException(ex);
            }
        }

        // POST: api/Device/general-equipments
        [HttpPost("general-equipments")]
        public async Task<ActionResult<GeneralEquipmentDTO>> CreateGeneralEquipment([FromBody] GeneralEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateGeneralEquipmentAsync(dto);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // PUT: api/Device/general-equipments/{id}
        [HttpPut("general-equipments/{id}")]
        public async Task<ActionResult<GeneralEquipmentDTO>> UpdateGeneralEquipment(int id, [FromBody] GeneralEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.UpdateGeneralEquipmentAsync(id, dto);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // DELETE: api/Device/general-equipments/{id}
        [HttpDelete("general-equipments/{id}")]
        public async Task<ActionResult> DeleteGeneralEquipment(int id)
        {
            try
            {
                await _deviceService.DeleteGeneralEquipmentAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // DELETE: api/Device/general-equipments
        [HttpDelete("general-equipments")]
        public async Task<ActionResult> ClearAllGeneralEquipments()
        {
            try
            {
                await _deviceService.ClearAllGeneralEquipmentsAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 待维修设备管理
        // GET: api/Device/repair-equipments
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
        // GET: api/Device/scrap-equipments
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

        // POST: api/Device/scrap-equipments
        [HttpPost("scrap-equipments")]
        public async Task<ActionResult<ScrapEquipmentDTO>> CreateScrapEquipment([FromBody] ScrapEquipmentDTO dto)
        {
            try
            {
                var equipment = await _deviceService.CreateScrapEquipmentAsync(dto);
                return Ok(equipment);
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // GET: api/Device/scrap-equipments/{id}
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

        // DELETE: api/Device/scrap-equipments/{id}
        [HttpDelete("scrap-equipments/{id}")]
        public async Task<ActionResult> DeleteScrapEquipment(int id)
        {
            try
            {
                await _deviceService.DeleteScrapEquipmentAsync(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }

        // 库存设备查询 - 用于出库单选择
        // GET: api/Device/inventory/special
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

        // GET: api/Device/inventory/general
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

        // 获取专用设备详细清单
        // GET: api/Device/special-equipment-details
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

        // 获取通用设备详细清单
        // GET: api/Device/general-equipment-details
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