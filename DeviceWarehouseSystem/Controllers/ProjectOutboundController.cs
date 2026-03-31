using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DeviceWarehouseSystem.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace DeviceWarehouseSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectOutboundController : ControllerBase
{
    private readonly DeviceWarehouseContext _context;

    public ProjectOutboundController(DeviceWarehouseContext context)
    {
        _context = context;
    }

    // GET: api/ProjectOutbound
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetProjectOutbounds()
    {
        try
        {
            if (_context.ProjectOutbounds == null)
            {
                return Ok(new List<object>());
            }
            
            var projectOutbounds = await _context.ProjectOutbounds
                .Include(p => p.ProjectOutboundItems)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // 转换为包含入库状态的对象
            var result = projectOutbounds.Select(outbound => new
            {
                id = outbound.Id,
                outboundNumber = outbound.OutboundNumber,
                outboundDate = outbound.OutboundDate,
                projectName = outbound.ProjectName,
                projectCode = outbound.ProjectCode,
                projectManager = outbound.ProjectManager,
                recipient = outbound.Recipient,
                outboundType = outbound.OutboundType,
                projectTime = outbound.ProjectTime,
                contactPhone = outbound.ContactPhone,
                usageLocation = outbound.UsageLocation,
                returnDate = outbound.ReturnDate,
                handler = outbound.Handler,
                warehouseKeeper = outbound.WarehouseKeeper,
                logisticsMethod = outbound.LogisticsMethod,
                outboundImages = outbound.OutboundImages,
                remark = outbound.Remark,
                totalQuantity = outbound.TotalQuantity,
                isCompleted = outbound.IsCompleted,
                completedAt = outbound.CompletedAt,
                createdAt = outbound.CreatedAt,
                updatedAt = outbound.UpdatedAt,
                createdBy = outbound.CreatedBy,
                updatedBy = outbound.UpdatedBy,
                inboundStatus = string.IsNullOrEmpty(outbound.InboundStatus) ? "未入库" : outbound.InboundStatus,
                projectOutboundItems = outbound.ProjectOutboundItems?.Select(item => new
                {
                    id = item.Id,
                    itemType = item.ItemType,
                    itemId = item.ItemId,
                    itemName = item.ItemName,
                    deviceCode = item.DeviceCode,
                    brand = item.Brand,
                    model = item.Model,
                    quantity = item.Quantity,
                    unit = item.Unit,
                    accessories = item.Accessories,
                    itemRemark = item.Remark,
                    deviceStatus = item.DeviceStatus,
                    createdAt = item.CreatedAt
                }).ToList()
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    // GET: api/ProjectOutbound/5
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetProjectOutbound(int id)
    {
        try
        {
            if (_context.ProjectOutbounds == null)
            {
                return NotFound();
            }
            
            var projectOutbound = await _context.ProjectOutbounds
                .Include(p => p.ProjectOutboundItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (projectOutbound == null)
            {
                return NotFound();
            }

            // 转换为包含入库状态的对象
            var result = new
            {
                projectOutbound.Id,
                projectOutbound.OutboundNumber,
                projectOutbound.OutboundDate,
                projectOutbound.ProjectName,
                projectOutbound.ProjectCode,
                projectOutbound.ProjectManager,
                projectOutbound.Recipient,
                projectOutbound.OutboundType,
                projectOutbound.ProjectTime,
                projectOutbound.ContactPhone,
                projectOutbound.UsageLocation,
                projectOutbound.ReturnDate,
                projectOutbound.Handler,
                projectOutbound.WarehouseKeeper,
                projectOutbound.LogisticsMethod,
                projectOutbound.OutboundImages,
                projectOutbound.Remark,
                projectOutbound.TotalQuantity,
                projectOutbound.IsCompleted,
                projectOutbound.CompletedAt,
                projectOutbound.CreatedAt,
                projectOutbound.UpdatedAt,
                projectOutbound.CreatedBy,
                projectOutbound.UpdatedBy,
                InboundStatus = string.IsNullOrEmpty(projectOutbound.InboundStatus) ? "未入库" : projectOutbound.InboundStatus,
                ProjectOutboundItems = projectOutbound.ProjectOutboundItems?.Select(item => new
                {
                    item.Id,
                    item.ItemType,
                    item.ItemId,
                    item.ItemName,
                    item.DeviceCode,
                    item.Brand,
                    item.Model,
                    item.Quantity,
                    item.Unit,
                    item.Accessories,
                    item.Remark,
                    item.DeviceStatus,
                    item.CreatedAt
                }).ToList()
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    // POST: api/ProjectOutbound
    [HttpPost]
    public async Task<ActionResult<ProjectOutbound>> CreateProjectOutbound([FromBody] JsonElement projectOutboundData)
    {
        try
        {
            // 提取基本信息
            string projectName = projectOutboundData.GetProperty("ProjectName").GetString() ?? "";
            DateTime outboundDate = projectOutboundData.GetProperty("OutboundDate").GetDateTime();
            string projectTime = projectOutboundData.GetProperty("ProjectTime").GetString() ?? "";
            string projectManager = projectOutboundData.GetProperty("ProjectManager").GetString() ?? "";
            string recipient = projectOutboundData.GetProperty("Recipient").GetString() ?? "";
            string outboundType = projectOutboundData.GetProperty("OutboundType").GetString() ?? "";
            string contactPhone = projectOutboundData.GetProperty("ContactPhone").GetString() ?? "";
            string usageLocation = projectOutboundData.GetProperty("UsageLocation").GetString() ?? "";
            
            DateTime? returnDate = null;
            if (projectOutboundData.TryGetProperty("ReturnDate", out var returnDateElement) && returnDateElement.ValueKind != JsonValueKind.Null)
            {
                returnDate = returnDateElement.GetDateTime();
            }
            
            string warehouseKeeper = projectOutboundData.GetProperty("WarehouseKeeper").GetString() ?? "";
            
            int? logisticsMethod = null;
            if (projectOutboundData.TryGetProperty("LogisticsMethod", out var logisticsMethodElement) && logisticsMethodElement.ValueKind != JsonValueKind.Null)
            {
                logisticsMethod = logisticsMethodElement.GetInt32();
            }
            
            string outboundImages = "";
            if (projectOutboundData.TryGetProperty("OutboundImages", out var outboundImagesElement))
            {
                outboundImages = outboundImagesElement.GetString() ?? "";
            }
            
            string remark = "";
            if (projectOutboundData.TryGetProperty("Remark", out var remarkElement))
            {
                remark = remarkElement.GetString() ?? "";
            }

            // 生成出库单号
            string outboundNumber = "PROOUT" + DateTime.Now.Ticks;
            DateTime createdAt = DateTime.Now;
            bool isCompleted = false;

            // 创建新的ProjectOutbound对象
            var newProjectOutbound = new ProjectOutbound
            {
                OutboundNumber = outboundNumber,
                OutboundDate = outboundDate,
                ProjectName = projectName,
                ProjectTime = projectTime,
                ProjectManager = projectManager,
                Recipient = recipient,
                OutboundType = outboundType,
                ContactPhone = contactPhone,
                UsageLocation = usageLocation,
                ReturnDate = returnDate,
                WarehouseKeeper = warehouseKeeper,
                LogisticsMethod = logisticsMethod,
                OutboundImages = outboundImages,
                Remark = remark,
                IsCompleted = isCompleted,
                CreatedAt = createdAt,
                ProjectOutboundItems = new List<ProjectOutboundItem>()
            };

            // 添加ProjectOutboundItems
            if (projectOutboundData.TryGetProperty("ProjectOutboundItems", out var projectOutboundItemsElement) && 
                projectOutboundItemsElement.ValueKind == JsonValueKind.Array)
            {
                int totalQuantity = 0;
                foreach (var itemData in projectOutboundItemsElement.EnumerateArray())
                {
                    int quantity = itemData.GetProperty("Quantity").GetInt32();
                    totalQuantity += quantity;
                    
                    // 解析CreatedAt字段，处理ISO格式的日期字符串
                    DateTime itemCreatedAt = DateTime.Now;
                    if (itemData.TryGetProperty("CreatedAt", out var createdAtElement) && createdAtElement.ValueKind == JsonValueKind.String)
                    {
                        var createdAtString = createdAtElement.GetString();
                        if (!string.IsNullOrEmpty(createdAtString))
                        {
                            if (!DateTime.TryParse(createdAtString, out itemCreatedAt))
                            {
                                // 如果解析失败，使用当前时间
                                itemCreatedAt = DateTime.Now;
                            }
                        }
                    }

                    var item = new ProjectOutboundItem
                    {
                        ItemType = itemData.GetProperty("ItemType").GetInt32(),
                        ItemId = itemData.GetProperty("ItemId").GetInt32(),
                        ItemName = itemData.GetProperty("ItemName").GetString() ?? "",
                        DeviceCode = itemData.TryGetProperty("DeviceCode", out var deviceCodeElement) ? deviceCodeElement.GetString() : null,
                        Brand = itemData.TryGetProperty("Brand", out var brandElement) ? brandElement.GetString() : null,
                        Model = itemData.TryGetProperty("Model", out var modelElement) ? modelElement.GetString() : null,
                        Quantity = quantity,
                        Unit = itemData.TryGetProperty("Unit", out var unitElement) ? unitElement.GetString() : null,
                        Accessories = itemData.TryGetProperty("Accessories", out var accessoriesElement) ? accessoriesElement.GetString() : null,
                        Remark = itemData.TryGetProperty("Remark", out var itemRemarkElement) ? itemRemarkElement.GetString() : null,
                        DeviceStatus = itemData.TryGetProperty("DeviceStatus", out var deviceStatusElement) ? deviceStatusElement.GetString() : null,
                        CreatedAt = itemCreatedAt
                    };
                    newProjectOutbound.ProjectOutboundItems.Add(item);
                }
                newProjectOutbound.TotalQuantity = totalQuantity;
            }

            if (_context.ProjectOutbounds != null)
            {
                _context.ProjectOutbounds.Add(newProjectOutbound);
                await _context.SaveChangesAsync();
            }

            // 清除导航属性以避免循环引用
            foreach (var item in newProjectOutbound.ProjectOutboundItems)
            {
                item.Outbound = null!;
            }

            return CreatedAtAction(nameof(GetProjectOutbound), new { id = newProjectOutbound.Id }, newProjectOutbound);
            
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    // PUT: api/ProjectOutbound/5/complete
    [HttpPut("{id}/complete")]
    public async Task<IActionResult> CompleteProjectOutbound(int id)
    {
        if (_context.ProjectOutbounds == null)
        {
            return NotFound();
        }
        
        var projectOutbound = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (projectOutbound == null)
        {
            return NotFound();
        }

        projectOutbound.IsCompleted = true;
        projectOutbound.CompletedAt = DateTime.Now;
        projectOutbound.UpdatedAt = DateTime.Now;

        // 更新设备状态和项目信息
        foreach (var item in projectOutbound.ProjectOutboundItems)
        {
            if (item.ItemType == 1) // 专用设备
            {
                if (_context.SpecialEquipments != null)
                {
                    var specialEquipment = await _context.SpecialEquipments.FindAsync(item.ItemId);
                    if (specialEquipment != null)
                    {
                        specialEquipment.UseStatus = 1; // 1表示使用中
                        specialEquipment.ProjectName = projectOutbound.ProjectName;
                        specialEquipment.ProjectTime = projectOutbound.ProjectTime;
                        specialEquipment.UpdatedAt = DateTime.Now;
                        _context.Entry(specialEquipment).State = EntityState.Modified;
                    }
                }
            }
            else if (item.ItemType == 2) // 通用设备
            {
                if (_context.GeneralEquipments != null)
                {
                    var generalEquipment = await _context.GeneralEquipments.FindAsync(item.ItemId);
                    if (generalEquipment != null)
                    {
                        generalEquipment.UseStatus = 1; // 1表示使用中
                        generalEquipment.ProjectName = projectOutbound.ProjectName;
                        generalEquipment.ProjectTime = projectOutbound.ProjectTime;
                        generalEquipment.UpdatedAt = DateTime.Now;
                        _context.Entry(generalEquipment).State = EntityState.Modified;
                    }
                }
            }
            else if (item.ItemType == 3) // 耗材
                {
                    Console.WriteLine($"处理耗材: ItemId={item.ItemId}, ItemName={item.ItemName}, Quantity={item.Quantity}");
                    if (_context.Consumables != null)
                    {
                        var consumable = await _context.Consumables.FindAsync(item.ItemId);
                        if (consumable != null)
                        {
                            Console.WriteLine($"找到耗材: Id={consumable.Id}, Name={consumable.Name}, RemainingQuantity={consumable.RemainingQuantity}, UsedQuantity={consumable.UsedQuantity}");
                            // 添加边界检查，确保耗材数量充足
                            if (consumable.RemainingQuantity >= item.Quantity)
                            {
                                Console.WriteLine($"更新前 - 剩余数量: {consumable.RemainingQuantity}, 使用数量: {consumable.UsedQuantity}");
                                consumable.UsedQuantity += item.Quantity;
                                consumable.RemainingQuantity -= item.Quantity;
                                consumable.UpdatedAt = DateTime.Now;
                                _context.Entry(consumable).State = EntityState.Modified;
                                Console.WriteLine($"更新后 - 剩余数量: {consumable.RemainingQuantity}, 使用数量: {consumable.UsedQuantity}");
                            }
                            else
                            {
                                throw new System.InvalidOperationException($"耗材数量不足，当前剩余: {consumable.RemainingQuantity}，需要: {item.Quantity}");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"未找到耗材: ItemId={item.ItemId}");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Consumables 集合为空");
                    }
                }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProjectOutboundExists(id))
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

    // PUT: api/ProjectOutbound/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProjectOutbound(int id, [FromBody] JsonElement projectOutboundData)
        {
            try
            {
                if (_context.ProjectOutbounds == null)
                {
                    return NotFound();
                }
                // 查找现有的出库单
                var existingOutbound = await _context.ProjectOutbounds
                    .Include(p => p.ProjectOutboundItems)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (existingOutbound == null)
                {
                    return NotFound();
                }

            // 更新基本信息
            if (projectOutboundData.TryGetProperty("OutboundNumber", out var outboundNumberElement))
            {
                existingOutbound.OutboundNumber = outboundNumberElement.GetString() ?? existingOutbound.OutboundNumber;
            }

            if (projectOutboundData.TryGetProperty("OutboundDate", out var outboundDateElement))
            {
                existingOutbound.OutboundDate = outboundDateElement.GetDateTime();
            }

            if (projectOutboundData.TryGetProperty("ProjectName", out var projectNameElement))
            {
                existingOutbound.ProjectName = projectNameElement.GetString() ?? existingOutbound.ProjectName;
            }

            if (projectOutboundData.TryGetProperty("ProjectTime", out var projectTimeElement))
            {
                existingOutbound.ProjectTime = projectTimeElement.GetString() ?? existingOutbound.ProjectTime;
            }

            if (projectOutboundData.TryGetProperty("ProjectManager", out var projectManagerElement))
            {
                existingOutbound.ProjectManager = projectManagerElement.GetString() ?? existingOutbound.ProjectManager;
            }

            if (projectOutboundData.TryGetProperty("Recipient", out var recipientElement))
            {
                existingOutbound.Recipient = recipientElement.GetString() ?? existingOutbound.Recipient;
            }

            if (projectOutboundData.TryGetProperty("OutboundType", out var outboundTypeElement))
            {
                existingOutbound.OutboundType = outboundTypeElement.GetString() ?? existingOutbound.OutboundType;
            }

            if (projectOutboundData.TryGetProperty("ContactPhone", out var contactPhoneElement))
            {
                existingOutbound.ContactPhone = contactPhoneElement.GetString() ?? existingOutbound.ContactPhone;
            }

            if (projectOutboundData.TryGetProperty("UsageLocation", out var usageLocationElement))
            {
                existingOutbound.UsageLocation = usageLocationElement.GetString() ?? existingOutbound.UsageLocation;
            }

            if (projectOutboundData.TryGetProperty("ReturnDate", out var returnDateElement) && returnDateElement.ValueKind != JsonValueKind.Null)
            {
                existingOutbound.ReturnDate = returnDateElement.GetDateTime();
            }

            if (projectOutboundData.TryGetProperty("WarehouseKeeper", out var warehouseKeeperElement))
            {
                existingOutbound.WarehouseKeeper = warehouseKeeperElement.GetString() ?? existingOutbound.WarehouseKeeper;
            }

            if (projectOutboundData.TryGetProperty("LogisticsMethod", out var logisticsMethodElement) && logisticsMethodElement.ValueKind != JsonValueKind.Null)
            {
                existingOutbound.LogisticsMethod = logisticsMethodElement.GetInt32();
            }

            if (projectOutboundData.TryGetProperty("OutboundImages", out var outboundImagesElement))
            {
                existingOutbound.OutboundImages = outboundImagesElement.GetString() ?? existingOutbound.OutboundImages;
            }

            if (projectOutboundData.TryGetProperty("Remark", out var remarkElement))
            {
                existingOutbound.Remark = remarkElement.GetString() ?? existingOutbound.Remark;
            }

            // 更新是否完成字段
            if (projectOutboundData.TryGetProperty("isCompleted", out var isCompletedElement))
            {
                existingOutbound.IsCompleted = isCompletedElement.GetBoolean();
            }

            // 更新完成时间字段
            if (projectOutboundData.TryGetProperty("completedAt", out var completedAtElement) && completedAtElement.ValueKind != JsonValueKind.Null)
            {
                existingOutbound.CompletedAt = completedAtElement.GetDateTime();
            }

            // 更新入库状态字段
            if (projectOutboundData.TryGetProperty("inboundStatus", out var inboundStatusElement))
            {
                existingOutbound.InboundStatus = inboundStatusElement.GetString();
            }

            // 更新项目项
            if (projectOutboundData.TryGetProperty("ProjectOutboundItems", out var projectOutboundItemsElement) && 
                projectOutboundItemsElement.ValueKind == JsonValueKind.Array)
            {
                // 先删除现有的项目项
                if (existingOutbound.ProjectOutboundItems != null && _context.ProjectOutboundItems != null)
                {
                    _context.ProjectOutboundItems.RemoveRange(existingOutbound.ProjectOutboundItems);
                    existingOutbound.ProjectOutboundItems.Clear();
                }
                else
                {
                    existingOutbound.ProjectOutboundItems = new List<ProjectOutboundItem>();
                }

                // 添加新的项目项
                int totalQuantity = 0;
                foreach (var itemData in projectOutboundItemsElement.EnumerateArray())
                {
                    int quantity = itemData.GetProperty("Quantity").GetInt32();
                    totalQuantity += quantity;

                    // 解析CreatedAt字段
                    DateTime itemCreatedAt = DateTime.Now;
                    if (itemData.TryGetProperty("CreatedAt", out var createdAtElement) && createdAtElement.ValueKind == JsonValueKind.String)
                    {
                        var createdAtString = createdAtElement.GetString();
                        if (!string.IsNullOrEmpty(createdAtString))
                        {
                            if (!DateTime.TryParse(createdAtString, out itemCreatedAt))
                            {
                                itemCreatedAt = DateTime.Now;
                            }
                        }
                    }

                    var item = new ProjectOutboundItem
                    {
                        OutboundId = id,
                        ItemType = itemData.GetProperty("ItemType").GetInt32(),
                        ItemId = itemData.GetProperty("ItemId").GetInt32(),
                        ItemName = itemData.GetProperty("ItemName").GetString() ?? "",
                        DeviceCode = itemData.TryGetProperty("DeviceCode", out var deviceCodeElement) ? deviceCodeElement.GetString() : null,
                        Brand = itemData.TryGetProperty("Brand", out var brandElement) ? brandElement.GetString() : null,
                        Model = itemData.TryGetProperty("Model", out var modelElement) ? modelElement.GetString() : null,
                        Quantity = quantity,
                        Unit = itemData.TryGetProperty("Unit", out var unitElement) ? unitElement.GetString() : null,
                        Accessories = itemData.TryGetProperty("Accessories", out var accessoriesElement) ? accessoriesElement.GetString() : null,
                        Remark = itemData.TryGetProperty("Remark", out var itemRemarkElement) ? itemRemarkElement.GetString() : null,
                        DeviceStatus = itemData.TryGetProperty("DeviceStatus", out var deviceStatusElement) ? deviceStatusElement.GetString() : null,
                        CreatedAt = itemCreatedAt
                    };
                    existingOutbound.ProjectOutboundItems.Add(item);
                }
                existingOutbound.TotalQuantity = totalQuantity;
            }

            existingOutbound.UpdatedAt = DateTime.Now;

            _context.Entry(existingOutbound).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectOutboundExists(id))
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
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    // DELETE: api/ProjectOutbound/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProjectOutbound(int id)
    {
        if (_context.ProjectOutbounds == null)
        {
            return NotFound();
        }
        
        var projectOutbound = await _context.ProjectOutbounds
            .Include(p => p.ProjectOutboundItems)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (projectOutbound == null)
        {
            return NotFound();
        }

        // 如果出库单已完成，需要恢复设备状态和耗材数量
        if (projectOutbound.IsCompleted)
        {
            foreach (var item in projectOutbound.ProjectOutboundItems)
            {
                if (item.ItemType == 1) // 专用设备
                {
                    if (_context.SpecialEquipments != null)
                    {
                        var specialEquipment = await _context.SpecialEquipments.FindAsync(item.ItemId);
                        if (specialEquipment != null)
                        {
                            specialEquipment.UseStatus = 0; // 0表示未使用
                            specialEquipment.ProjectName = null;
                            specialEquipment.ProjectTime = null;
                            specialEquipment.UpdatedAt = DateTime.Now;
                            _context.Entry(specialEquipment).State = EntityState.Modified;

                            // 恢复库存数量
                            if (_context.Inventories != null)
                            {
                                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.SpecialEquipmentId == item.ItemId);
                                if (inventory != null)
                                {
                                    inventory.CurrentQuantity += 1; // 恢复一个设备的库存
                                    inventory.LastUpdated = DateTime.Now;
                                    _context.Entry(inventory).State = EntityState.Modified;
                                }
                            }
                        }
                    }
                }
                else if (item.ItemType == 2) // 通用设备
                {
                    if (_context.GeneralEquipments != null)
                    {
                        var generalEquipment = await _context.GeneralEquipments.FindAsync(item.ItemId);
                        if (generalEquipment != null)
                        {
                            generalEquipment.UseStatus = 0; // 0表示未使用
                            generalEquipment.ProjectName = null;
                            generalEquipment.ProjectTime = null;
                            generalEquipment.UpdatedAt = DateTime.Now;
                            _context.Entry(generalEquipment).State = EntityState.Modified;

                            // 恢复库存数量
                            if (_context.Inventories != null)
                            {
                                var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.GeneralEquipmentId == item.ItemId);
                                if (inventory != null)
                                {
                                    inventory.CurrentQuantity += 1; // 恢复一个设备的库存
                                    inventory.LastUpdated = DateTime.Now;
                                    _context.Entry(inventory).State = EntityState.Modified;
                                }
                            }
                        }
                    }
                }
                else if (item.ItemType == 3) // 耗材
                {
                    if (_context.Consumables != null)
                    {
                        var consumable = await _context.Consumables.FindAsync(item.ItemId);
                        if (consumable != null)
                        {
                            // 添加边界检查，确保使用数量不会为负数
                            if (consumable.UsedQuantity >= item.Quantity)
                            {
                                consumable.UsedQuantity -= item.Quantity;
                                consumable.RemainingQuantity += item.Quantity;
                                consumable.UpdatedAt = DateTime.Now;
                                _context.Entry(consumable).State = EntityState.Modified;
                            }
                            else
                            {
                                throw new System.InvalidOperationException($"耗材使用数量异常，当前使用量: {consumable.UsedQuantity}，需要恢复: {item.Quantity}");
                            }
                        }
                    }
                }
            }
        }

        _context.ProjectOutbounds.Remove(projectOutbound);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ProjectOutboundExists(int id)
    {
        return _context.ProjectOutbounds != null && _context.ProjectOutbounds.Any(e => e.Id == id);
    }
}
