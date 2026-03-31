using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Services;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InOutboundController : ControllerBase
    {
        private readonly InOutboundService _inOutboundService;

        public InOutboundController(InOutboundService inOutboundService)
        {
            _inOutboundService = inOutboundService;
        }

        // 项目出库管理
        // GET: api/InOutbound/project-outbounds
        [HttpGet("project-outbounds")]
        public async Task<ActionResult<List<ProjectOutboundDTO>>> GetProjectOutbounds()
        {
            try
            {
                var outbounds = await _inOutboundService.GetProjectOutboundsAsync();
                return Ok(outbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/project-outbounds
        [HttpPost("project-outbounds")]
        public async Task<ActionResult<ProjectOutboundDTO>> CreateProjectOutbound([FromBody] ProjectOutboundDTO dto)
        {
            try
            {
                var outbound = await _inOutboundService.CreateProjectOutboundAsync(dto);
                return Ok(outbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/InOutbound/project-outbounds/{id}
        [HttpGet("project-outbounds/{id}")]
        public async Task<ActionResult<ProjectOutboundDTO>> GetProjectOutbound(int id)
        {
            try
            {
                var outbound = await _inOutboundService.GetProjectOutboundAsync(id);
                return Ok(outbound);
            }
            catch (Exception ex)
            {
                if (ex.Message == "Project outbound not found")
                {
                    return NotFound(new { message = ex.Message });
                }
                return BadRequest(new { message = ex.Message });
            }
        }

        // 原材料出库管理
        // GET: api/InOutbound/raw-material-outbounds
        [HttpGet("raw-material-outbounds")]
        public async Task<ActionResult<List<RawMaterialOutboundDTO>>> GetRawMaterialOutbounds()
        {
            try
            {
                var outbounds = await _inOutboundService.GetRawMaterialOutboundsAsync();
                return Ok(outbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/raw-material-outbounds
        [HttpPost("raw-material-outbounds")]
        public async Task<ActionResult<RawMaterialOutboundDTO>> CreateRawMaterialOutbound([FromBody] RawMaterialOutboundDTO dto)
        {
            try
            {
                var outbound = await _inOutboundService.CreateRawMaterialOutboundAsync(dto);
                return Ok(outbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 项目入库管理
        // GET: api/InOutbound/project-inbounds
        [HttpGet("project-inbounds")]
        public async Task<ActionResult<List<ProjectInboundDTO>>> GetProjectInbounds()
        {
            try
            {
                Console.WriteLine("开始获取项目入库记录");
                var inbounds = await _inOutboundService.GetProjectInboundsAsync();
                Console.WriteLine($"获取项目入库记录成功，数量: {inbounds.Count}");
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"获取项目入库记录失败: {ex.Message}");
                Console.WriteLine($"错误堆栈: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"内部错误: {ex.InnerException.Message}");
                }
                return BadRequest(new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // POST: api/InOutbound/project-inbounds
        [HttpPost("project-inbounds")]
        public async Task<ActionResult<ProjectInboundDTO>> CreateProjectInbound([FromBody] ProjectInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateProjectInboundAsync(dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/InOutbound/project-inbounds/{id}
        [HttpDelete("project-inbounds/{id}")]
        public async Task<ActionResult<bool>> DeleteProjectInbound(int id)
        {
            try
            {
                await _inOutboundService.DeleteProjectInboundAsync(id);
                return Ok(true);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/InOutbound/project-inbounds/{id}
        [HttpPut("project-inbounds/{id}")]
        public async Task<ActionResult<ProjectInboundDTO>> UpdateProjectInbound(int id, [FromBody] ProjectInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.UpdateProjectInboundAsync(id, dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        // 原材料入库管理
        // GET: api/InOutbound/raw-material-inbounds
        [HttpGet("raw-material-inbounds")]
        public async Task<ActionResult<List<RawMaterialInboundDTO>>> GetRawMaterialInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetRawMaterialInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/raw-material-inbounds
        [HttpPost("raw-material-inbounds")]
        public async Task<ActionResult<RawMaterialInboundDTO>> CreateRawMaterialInbound([FromBody] RawMaterialInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateRawMaterialInboundAsync(dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/raw-material-inbounds/confirm
        [HttpPost("raw-material-inbounds/confirm")]
        public async Task<ActionResult<RawMaterialInboundDTO>> ConfirmRawMaterialInbound([FromBody] int id)
        {
            try
            {
                var inbound = await _inOutboundService.ConfirmRawMaterialInboundAsync(id);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/InOutbound/raw-material-inbounds/{id}
        [HttpDelete("raw-material-inbounds/{id}")]
        public async Task<ActionResult<bool>> DeleteRawMaterialInbound(int id)
        {
            try
            {
                await _inOutboundService.DeleteRawMaterialInboundAsync(id);
                return Ok(true);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 专用设备采购入库管理
        // GET: api/InOutbound/special-equipment-purchase-inbounds
        [HttpGet("special-equipment-purchase-inbounds")]
        public async Task<ActionResult<List<SpecialEquipmentPurchaseInboundDTO>>> GetSpecialEquipmentPurchaseInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetSpecialEquipmentPurchaseInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/special-equipment-purchase-inbounds
        [HttpPost("special-equipment-purchase-inbounds")]
        public async Task<ActionResult<SpecialEquipmentPurchaseInboundDTO>> CreateSpecialEquipmentPurchaseInbound([FromBody] SpecialEquipmentPurchaseInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateSpecialEquipmentPurchaseInboundAsync(dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating special equipment purchase inbound: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // 通用设备采购入库管理
        // GET: api/InOutbound/general-equipment-purchase-inbounds
        [HttpGet("general-equipment-purchase-inbounds")]
        public async Task<ActionResult<List<GeneralEquipmentPurchaseInboundDTO>>> GetGeneralEquipmentPurchaseInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetGeneralEquipmentPurchaseInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/general-equipment-purchase-inbounds
        [HttpPost("general-equipment-purchase-inbounds")]
        public async Task<ActionResult<GeneralEquipmentPurchaseInboundDTO>> CreateGeneralEquipmentPurchaseInbound([FromBody] GeneralEquipmentPurchaseInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateGeneralEquipmentPurchaseInboundAsync(dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 耗材采购入库管理
        // GET: api/InOutbound/consumable-purchase-inbounds
        [HttpGet("consumable-purchase-inbounds")]
        public async Task<ActionResult<List<ConsumablePurchaseInboundDTO>>> GetConsumablePurchaseInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetConsumablePurchaseInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/consumable-purchase-inbounds
        [HttpPost("consumable-purchase-inbounds")]
        public async Task<ActionResult<ConsumablePurchaseInboundDTO>> CreateConsumablePurchaseInbound([FromBody] ConsumablePurchaseInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateConsumablePurchaseInboundAsync(dto);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/consumable-purchase-inbounds/{id}/confirm
        [HttpPost("consumable-purchase-inbounds/{id}/confirm")]
        public async Task<ActionResult<ConsumablePurchaseInboundDTO>> ConfirmConsumablePurchaseInbound(int id)
        {
            try
            {
                var inbound = await _inOutboundService.ConfirmConsumablePurchaseInboundAsync(id);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/InOutbound/consumable-purchase-inbounds/{id}
        [HttpDelete("consumable-purchase-inbounds/{id}")]
        public async Task<ActionResult<bool>> DeleteConsumablePurchaseInbound(int id)
        {
            try
            {
                await _inOutboundService.DeleteConsumablePurchaseInboundAsync(id);
                return Ok(true);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/special-equipment-purchase-inbounds/{id}/confirm
        [HttpPost("special-equipment-purchase-inbounds/{id}/confirm")]
        public async Task<ActionResult<SpecialEquipmentPurchaseInboundDTO>> ConfirmSpecialEquipmentPurchaseInbound(int id)
        {
            try
            {
                var inbound = await _inOutboundService.ConfirmSpecialEquipmentPurchaseInboundAsync(id);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/InOutbound/special-equipment-purchase-inbounds/{id}
        [HttpDelete("special-equipment-purchase-inbounds/{id}")]
        public async Task<ActionResult<bool>> DeleteSpecialEquipmentPurchaseInbound(int id)
        {
            try
            {
                await _inOutboundService.DeleteSpecialEquipmentPurchaseInboundAsync(id);
                return Ok(true);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/general-equipment-purchase-inbounds/{id}/confirm
        [HttpPost("general-equipment-purchase-inbounds/{id}/confirm")]
        public async Task<ActionResult<GeneralEquipmentPurchaseInboundDTO>> ConfirmGeneralEquipmentPurchaseInbound(int id)
        {
            try
            {
                var inbound = await _inOutboundService.ConfirmGeneralEquipmentPurchaseInboundAsync(id);
                return Ok(inbound);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/InOutbound/general-equipment-purchase-inbounds/{id}
        [HttpDelete("general-equipment-purchase-inbounds/{id}")]
        public async Task<ActionResult<bool>> DeleteGeneralEquipmentPurchaseInbound(int id)
        {
            try
            {
                await _inOutboundService.DeleteGeneralEquipmentPurchaseInboundAsync(id);
                return Ok(true);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/InOutbound/generate-device-code
        [HttpGet("generate-device-code")]
        public async Task<ActionResult<string>> GenerateDeviceCode(string deviceName = "", string brand = "", string deviceType = "1", string model = "")
        {
            Console.WriteLine($"[API] ========== 收到生成设备编号请求 ==========");
            Console.WriteLine($"[API] 原始参数: deviceName={deviceName}, brand={brand}, deviceType={deviceType}, model={model}");
            
            try
            {
                // 手动转换deviceType
                if (!int.TryParse(deviceType, out int deviceTypeInt))
                {
                    Console.WriteLine($"[API] deviceType转换失败: {deviceType}");
                    return BadRequest(new { message = "deviceType必须是整数", errorType = "ValidationError" });
                }
                
                Console.WriteLine($"[API] 转换后的deviceType: {deviceTypeInt}");
                
                // 调用服务生成编号
                var deviceCode = await _inOutboundService.GenerateDeviceCodeAsync(deviceName, brand, model, deviceTypeInt);
                Console.WriteLine($"[API] 生成设备编号成功: {deviceCode}");
                return Ok(deviceCode);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"[API] 生成设备编号参数错误: {ex.Message}");
                return BadRequest(new { message = ex.Message, errorType = "ArgumentException" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[API] 生成设备编号错误: {ex.Message}");
                Console.WriteLine($"[API] 错误堆栈: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, errorType = "GeneralException", stackTrace = ex.StackTrace });
            }
        }
    }
}