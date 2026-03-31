using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DeviceWarehouseSystem
{
    public static class QueryHelper
    {
        public static void QueryProjectOutboundItems()
        {
            using (var context = new DeviceWarehouseContext())
            {
                // 查询所有ProjectOutboundItem
                var items = context.ProjectOutboundItems != null ? context.ProjectOutboundItems.Include(i => i.Outbound).ToList() : new List<ProjectOutboundItem>();
                
                Console.WriteLine("ProjectOutboundItem数据:");
                Console.WriteLine("Id | OutboundId | ItemName | DeviceCode | Brand | Model | Quantity | Unit | Accessories | DeviceStatus");
                Console.WriteLine("--------------------------------------------------------------------------------------------------");
                
                foreach (var item in items)
                {
                    Console.WriteLine($"{item.Id} | {item.OutboundId} | {item.ItemName} | {item.DeviceCode} | {item.Brand} | {item.Model} | {item.Quantity} | {item.Unit} | {item.Accessories} | {item.DeviceStatus}");
                }
            }
        }
    }
}