using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.Enums;
using DeviceWarehouseSystem.Models.Enums;
using DeviceWarehouseSystem.Services;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepairController : ControllerBase
    {
        private readonly DeviceWarehouseContext _context;
        private readonly LogService _logService;

        public RepairController(DeviceWarehouseContext context, LogService logService)
        {
            _context = context;
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
        public async Task<ActionResult<IEnumerable<RepairEquipment>>> GetRepairEquipments()
        {
            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            return await _context.RepairEquipments.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RepairEquipment>> GetRepairEquipment(int id)
        {
            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            var repairEquipment = await _context.RepairEquipments.FindAsync(id);

            if (repairEquipment == null)
            {
                return NotFound();
            }

            return repairEquipment;
        }

        [HttpPost]
        public async Task<ActionResult<RepairEquipment>> PostRepairEquipment(RepairEquipment repairEquipment)
        {
            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            repairEquipment.CreatedAt = System.DateTime.Now;
            repairEquipment.UpdatedAt = System.DateTime.Now;
            _context.RepairEquipments.Add(repairEquipment);
            await _context.SaveChangesAsync();

            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                await _logService.LogUserActivityAsync(userId.Value, "维修管理", 
                    $"报修设备：{repairEquipment.EquipmentName}（编号：{repairEquipment.EquipmentCode}）", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }

            return CreatedAtAction(nameof(GetRepairEquipment), new { id = repairEquipment.Id }, repairEquipment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutRepairEquipment(int id, RepairEquipment repairEquipment)
        {
            if (id != repairEquipment.Id)
            {
                return BadRequest();
            }

            repairEquipment.UpdatedAt = System.DateTime.Now;
            _context.Entry(repairEquipment).State = EntityState.Modified;

            if (_context.SpecialEquipments != null)
            {
                var specialEquipment = await _context.SpecialEquipments.FindAsync(repairEquipment.EquipmentId);
                if (specialEquipment != null)
                {
                    specialEquipment.DeviceStatus = RepairStatusMapping.ToDeviceStatusValue(repairEquipment.RepairStatus);
                    specialEquipment.RepairStatus = RepairStatusMapping.ToRepairStatusValue(repairEquipment.RepairStatus);
                    specialEquipment.Status = repairEquipment.RepairStatus == "已完成" ? "正常" : repairEquipment.RepairStatus == "无法维修" ? "报废" : repairEquipment.RepairStatus;

                    if (repairEquipment.RepairStatus == "无法维修")
                    {
                        if (_context.ScrapEquipments != null)
                        {
                            var scrapEquipment = new ScrapEquipment
                            {
                                SpecialEquipmentId = specialEquipment.Id,
                                DeviceName = specialEquipment.DeviceName,
                                DeviceCode = specialEquipment.DeviceCode,
                                Brand = specialEquipment.Brand,
                                Model = specialEquipment.Model,
                                SerialNumber = specialEquipment.SerialNumber,
                                Specification = specialEquipment.Specification,
                                Quantity = specialEquipment.Quantity,
                                Unit = specialEquipment.Unit,
                                ImageUrl = specialEquipment.ImageUrl,
                                DeviceType = 1,
                                Location = specialEquipment.Location,
                                Company = specialEquipment.Company,
                                Accessories = specialEquipment.Accessories,
                                ScrapReason = repairEquipment.FaultDescription,
                                ScrapDate = System.DateTime.Now,
                                ScrappedBy = "系统",
                                Remark = repairEquipment.Remark,
                                CreatedAt = System.DateTime.Now,
                                UpdatedAt = System.DateTime.Now
                            };
                            _context.ScrapEquipments.Add(scrapEquipment);
                        }
                    }
                    specialEquipment.UpdatedAt = System.DateTime.Now;
                }
            }

            if (_context.GeneralEquipments != null)
            {
                var generalEquipment = await _context.GeneralEquipments.FindAsync(repairEquipment.EquipmentId);
                if (generalEquipment != null)
                {
                    generalEquipment.DeviceStatus = RepairStatusMapping.ToDeviceStatusValue(repairEquipment.RepairStatus);
                    generalEquipment.RepairStatus = RepairStatusMapping.ToRepairStatusValue(repairEquipment.RepairStatus);
                    generalEquipment.Status = repairEquipment.RepairStatus == "已完成" ? "正常" : repairEquipment.RepairStatus == "无法维修" ? "报废" : repairEquipment.RepairStatus;

                    if (repairEquipment.RepairStatus == "无法维修")
                    {
                        if (_context.ScrapEquipments != null)
                        {
                            var scrapEquipment = new ScrapEquipment
                            {
                                GeneralEquipmentId = generalEquipment.Id,
                                DeviceName = generalEquipment.DeviceName,
                                DeviceCode = generalEquipment.DeviceCode,
                                Brand = generalEquipment.Brand,
                                Model = generalEquipment.Model,
                                SerialNumber = generalEquipment.SerialNumber,
                                Specification = generalEquipment.Specification,
                                Quantity = generalEquipment.Quantity,
                                Unit = generalEquipment.Unit,
                                ImageUrl = generalEquipment.ImageUrl,
                                DeviceType = 2,
                                Location = generalEquipment.Location,
                                Company = generalEquipment.Company,
                                Accessories = generalEquipment.Accessories,
                                ScrapReason = repairEquipment.FaultDescription,
                                ScrapDate = System.DateTime.Now,
                                ScrappedBy = "系统",
                                Remark = repairEquipment.Remark,
                                CreatedAt = System.DateTime.Now,
                                UpdatedAt = System.DateTime.Now
                            };
                            _context.ScrapEquipments.Add(scrapEquipment);
                        }
                    }
                    generalEquipment.UpdatedAt = System.DateTime.Now;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RepairEquipmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                string action = repairEquipment.RepairStatus == "已完成" ? "完成维修" : 
                               repairEquipment.RepairStatus == "无法维修" ? "报废设备" : "更新维修状态";
                await _logService.LogUserActivityAsync(userId.Value, "维修管理", 
                    $"{action}：{repairEquipment.EquipmentName}（编号：{repairEquipment.EquipmentCode}）", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRepairEquipment(int id)
        {
            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            var repairEquipment = await _context.RepairEquipments.FindAsync(id);
            if (repairEquipment == null)
            {
                return NotFound();
            }

            _context.RepairEquipments.Remove(repairEquipment);
            await _context.SaveChangesAsync();

            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                await _logService.LogUserActivityAsync(userId.Value, "维修管理", 
                    $"删除维修记录：{repairEquipment.EquipmentName}（编号：{repairEquipment.EquipmentCode}）", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }

            return NoContent();
        }

        private bool RepairEquipmentExists(int id)
        {
            if (_context.RepairEquipments == null)
            {
                return false;
            }
            return _context.RepairEquipments.Any(e => e.Id == id);
        }

        [HttpPost("CreateFromDevice")]
        public async Task<ActionResult<RepairEquipment>> CreateFromDevice([FromBody] DeviceRepairRequest request)
        {
            string equipmentName = string.Empty;
            string equipmentCode = string.Empty;

            if (request.DeviceType == "special")
            {
                if (_context.SpecialEquipments == null)
                {
                    return NotFound("专用设备不存在");
                }
                var specialEquipment = await _context.SpecialEquipments.FindAsync(request.EquipmentId);
                if (specialEquipment == null)
                {
                    return NotFound("专用设备不存在");
                }
                equipmentName = specialEquipment.DeviceName;
                equipmentCode = specialEquipment.DeviceCode;

                specialEquipment.DeviceStatus = (int)DeviceStatus.PendingRepair;
                specialEquipment.RepairStatus = (int)RepairStatus.Pending;
                specialEquipment.FaultReason = request.FaultDescription;
                specialEquipment.UpdatedAt = System.DateTime.Now;
            }
            else if (request.DeviceType == "general")
            {
                if (_context.GeneralEquipments == null)
                {
                    return NotFound("通用设备不存在");
                }
                var generalEquipment = await _context.GeneralEquipments.FindAsync(request.EquipmentId);
                if (generalEquipment == null)
                {
                    return NotFound("通用设备不存在");
                }
                equipmentName = generalEquipment.DeviceName;
                equipmentCode = generalEquipment.DeviceCode;

                generalEquipment.DeviceStatus = (int)DeviceStatus.PendingRepair;
                generalEquipment.RepairStatus = (int)RepairStatus.Pending;
                generalEquipment.FaultReason = request.FaultDescription;
                generalEquipment.UpdatedAt = System.DateTime.Now;
            }
            else
            {
                return BadRequest("设备类型无效");
            }

            var repairEquipment = new RepairEquipment
            {
                EquipmentId = request.EquipmentId,
                EquipmentName = equipmentName,
                EquipmentCode = equipmentCode,
                FaultDescription = request.FaultDescription,
                RepairDate = System.DateTime.Now,
                RepairCost = 0,
                RepairPerson = request.RepairPerson,
                RepairStatus = "待维修",
                Remark = request.Remark,
                CreatedAt = System.DateTime.Now,
                UpdatedAt = System.DateTime.Now
            };

            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            _context.RepairEquipments.Add(repairEquipment);
            await _context.SaveChangesAsync();

            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                await _logService.LogUserActivityAsync(userId.Value, "维修管理", 
                    $"报修设备：{equipmentName}（编号：{equipmentCode}）", 
                    HttpContext.Connection.RemoteIpAddress?.ToString());
            }

            return CreatedAtAction(nameof(GetRepairEquipment), new { id = repairEquipment.Id }, repairEquipment);
        }
    }

    public class DeviceRepairRequest
    {
        public required string DeviceType { get; set; }
        public int EquipmentId { get; set; }
        public required string FaultDescription { get; set; }
        public required string RepairPerson { get; set; }
        public required string Remark { get; set; }
    }
}
