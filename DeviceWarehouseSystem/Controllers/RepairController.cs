using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Models;
using DeviceWarehouseSystem.Enums;
using DeviceWarehouseSystem.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DeviceWarehouseSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RepairController : ControllerBase
    {
        private readonly DeviceWarehouseContext _context;

        public RepairController(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // GET: api/Repair
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RepairEquipment>>> GetRepairEquipments()
        {
            if (_context.RepairEquipments == null)
            {
                return NotFound();
            }
            return await _context.RepairEquipments.ToListAsync();
        }

        // GET: api/Repair/5
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

        // POST: api/Repair
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

            return CreatedAtAction(nameof(GetRepairEquipment), new { id = repairEquipment.Id }, repairEquipment);
        }

        // PUT: api/Repair/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRepairEquipment(int id, RepairEquipment repairEquipment)
        {
            if (id != repairEquipment.Id)
            {
                return BadRequest();
            }

            repairEquipment.UpdatedAt = System.DateTime.Now;
            _context.Entry(repairEquipment).State = EntityState.Modified;

            // 查找对应的设备并更新状态
            // 先尝试查找专用设备
            if (_context.SpecialEquipments != null)
            {
                var specialEquipment = await _context.SpecialEquipments.FindAsync(repairEquipment.EquipmentId);
                if (specialEquipment != null)
                {
                    // 使用映射配置更新设备状态
                    specialEquipment.DeviceStatus = RepairStatusMapping.ToDeviceStatusValue(repairEquipment.RepairStatus);
                    specialEquipment.RepairStatus = RepairStatusMapping.ToRepairStatusValue(repairEquipment.RepairStatus);
                    
                    // 同时更新Status字符串字段，确保前端显示正确
                    specialEquipment.Status = repairEquipment.RepairStatus == "已完成" ? "正常" : repairEquipment.RepairStatus == "无法维修" ? "报废" : repairEquipment.RepairStatus;

                    // 如果无法维修，添加到报废设备表
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
                                DeviceType = 1, // 1=专用设备
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

            // 再尝试查找通用设备
            if (_context.GeneralEquipments != null)
            {
                var generalEquipment = await _context.GeneralEquipments.FindAsync(repairEquipment.EquipmentId);
                if (generalEquipment != null)
                {
                    // 使用映射配置更新设备状态
                    generalEquipment.DeviceStatus = RepairStatusMapping.ToDeviceStatusValue(repairEquipment.RepairStatus);
                    generalEquipment.RepairStatus = RepairStatusMapping.ToRepairStatusValue(repairEquipment.RepairStatus);
                    
                    // 同时更新Status字符串字段，确保前端显示正确
                    generalEquipment.Status = repairEquipment.RepairStatus == "已完成" ? "正常" : repairEquipment.RepairStatus == "无法维修" ? "报废" : repairEquipment.RepairStatus;

                    // 如果无法维修，添加到报废设备表
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
                                DeviceType = 2, // 2=通用设备
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

            return NoContent();
        }

        // DELETE: api/Repair/5
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

        // POST: api/Repair/CreateFromDevice
        [HttpPost("CreateFromDevice")]
        public async Task<ActionResult<RepairEquipment>> CreateFromDevice([FromBody] DeviceRepairRequest request)
        {
            // 根据设备类型和ID获取设备信息
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

                // 更新设备状态为维修中
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

                // 更新设备状态为维修中
                generalEquipment.DeviceStatus = (int)DeviceStatus.PendingRepair;
                generalEquipment.RepairStatus = (int)RepairStatus.Pending;
                generalEquipment.FaultReason = request.FaultDescription;
                generalEquipment.UpdatedAt = System.DateTime.Now;
            }
            else
            {
                return BadRequest("设备类型无效");
            }

            // 创建维修记录
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

            return CreatedAtAction(nameof(GetRepairEquipment), new { id = repairEquipment.Id }, repairEquipment);
        }
    }

    public class DeviceRepairRequest
    {
        public required string DeviceType { get; set; } // "special" 或 "general"
        public int EquipmentId { get; set; }
        public required string FaultDescription { get; set; }
        public required string RepairPerson { get; set; }
        public required string Remark { get; set; }
    }
}