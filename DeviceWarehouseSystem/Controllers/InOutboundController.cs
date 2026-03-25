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

        // 项目入库管理
        // GET: api/InOutbound/project-inbounds
        [HttpGet("project-inbounds")]
        public async Task<ActionResult<List<ProjectInboundDTO>>> GetProjectInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetProjectInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 设备采购入库管理
        // GET: api/InOutbound/equipment-purchase-inbounds
        [HttpGet("equipment-purchase-inbounds")]
        public async Task<ActionResult<List<EquipmentPurchaseInboundDTO>>> GetEquipmentPurchaseInbounds()
        {
            try
            {
                var inbounds = await _inOutboundService.GetEquipmentPurchaseInboundsAsync();
                return Ok(inbounds);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/InOutbound/equipment-purchase-inbounds
        [HttpPost("equipment-purchase-inbounds")]
        public async Task<ActionResult<EquipmentPurchaseInboundDTO>> CreateEquipmentPurchaseInbound([FromBody] EquipmentPurchaseInboundDTO dto)
        {
            try
            {
                var inbound = await _inOutboundService.CreateEquipmentPurchaseInboundAsync(dto);
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
    }
}