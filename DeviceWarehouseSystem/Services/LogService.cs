using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
// using OfficeOpenXml;

namespace DeviceWarehouseSystem.Services
{
    public class LogService
    {
        private readonly DeviceWarehouseContext _context;

        public LogService(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // 获取日志列表，支持搜索、筛选和分页
        public async Task<(IEnumerable<UserActivityLog>, int)> GetLogsAsync(
            string? search,
            string? user,
            string? type,
            string? startDate,
            string? endDate,
            int page = 1,
            int pageSize = 10)
        {
            if (_context.UserActivityLogs == null)
            {
                return (new List<UserActivityLog>(), 0);
            }

            var query = _context.UserActivityLogs
                .Include(l => l.User)
                .AsQueryable();

            // 搜索条件
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(l => 
                    l.ActivityDescription.Contains(search) ||
                    (l.User != null && l.User.Username.Contains(search)) ||
                    (l.IpAddress != null && l.IpAddress.Contains(search))
                );
            }

            // 用户筛选
            if (!string.IsNullOrEmpty(user))
            {
                query = query.Where(l => l.User != null && l.User.Username == user);
            }

            // 活动类型筛选
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(l => l.ActivityType == type);
            }

            // 日期范围筛选
            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var start))
            {
                query = query.Where(l => l.CreatedAt >= start);
            }

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var end))
            {
                query = query.Where(l => l.CreatedAt <= end.AddDays(1));
            }

            // 计算总数
            var total = await query.CountAsync();

            // 分页
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (logs, total);
        }

        // 根据ID获取单个日志
        public async Task<UserActivityLog?> GetLogByIdAsync(int id)
        {
            if (_context.UserActivityLogs == null)
            {
                return null;
            }

            return await _context.UserActivityLogs
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        // 创建新日志
        public async Task<UserActivityLog> CreateLogAsync(UserActivityLog log)
        {
            log.CreatedAt = DateTime.Now;
            if (_context.UserActivityLogs != null)
            {
                _context.UserActivityLogs.Add(log);
                await _context.SaveChangesAsync();
            }
            return log;
        }

        // 删除日志
        public async Task DeleteLogAsync(int id)
        {
            if (_context.UserActivityLogs != null)
            {
                var log = await _context.UserActivityLogs.FindAsync(id);
                if (log != null)
                {
                    _context.UserActivityLogs.Remove(log);
                    await _context.SaveChangesAsync();
                }
            }
        }

        // 导出日志为Excel
        // public async Task<byte[]> ExportLogsAsync()
        // {
        //     var logs = await _context.UserActivityLogs
        //         .Include(l => l.User)
        //         .OrderByDescending(l => l.CreatedAt)
        //         .ToListAsync();

        //     using (var package = new ExcelPackage())
        //     {
        //         var worksheet = package.Workbook.Worksheets.Add("日志记录");

        //         // 设置表头
        //         worksheet.Cells[1, 1].Value = "日志ID";
        //         worksheet.Cells[1, 2].Value = "用户ID";
        //         worksheet.Cells[1, 3].Value = "用户名";
        //         worksheet.Cells[1, 4].Value = "活动类型";
        //         worksheet.Cells[1, 5].Value = "活动描述";
        //         worksheet.Cells[1, 6].Value = "IP地址";
        //         worksheet.Cells[1, 7].Value = "用户代理";
        //         worksheet.Cells[1, 8].Value = "创建时间";

        //         // 填充数据
        //         for (int i = 0; i < logs.Count; i++)
        //         {
        //             var log = logs[i];
        //             worksheet.Cells[i + 2, 1].Value = log.Id;
        //             worksheet.Cells[i + 2, 2].Value = log.UserId;
        //             worksheet.Cells[i + 2, 3].Value = log.User.Username;
        //             worksheet.Cells[i + 2, 4].Value = log.ActivityType;
        //             worksheet.Cells[i + 2, 5].Value = log.ActivityDescription;
        //             worksheet.Cells[i + 2, 6].Value = log.IpAddress;
        //             worksheet.Cells[i + 2, 7].Value = log.UserAgent;
        //             worksheet.Cells[i + 2, 8].Value = log.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
        //         }

        //         // 自动调整列宽
        //         worksheet.Cells.AutoFitColumns();

        //         // 保存到内存流
        //         using (var stream = new MemoryStream())
        //         {
        //             package.SaveAs(stream);
        //             return stream.ToArray();
        //         }
        //     }
        // }

        // 记录用户活动日志
        public async Task LogUserActivityAsync(int userId, string activityType, string activityDescription, string? ipAddress = null, string? userAgent = null)
        {
            var log = new UserActivityLog
            {
                UserId = userId,
                ActivityType = activityType ?? "未知",
                ActivityDescription = activityDescription ?? "",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                CreatedAt = DateTime.Now
            };

            await CreateLogAsync(log);
        }

        // 清空所有日志
        public async Task ClearAllLogsAsync()
        {
            if (_context.UserActivityLogs != null)
            {
                var logs = await _context.UserActivityLogs.ToListAsync();
                _context.UserActivityLogs.RemoveRange(logs);
                await _context.SaveChangesAsync();
            }
        }
    }
}