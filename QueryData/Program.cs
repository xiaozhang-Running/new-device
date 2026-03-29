using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace QueryData
{
    class Program
    {
        static void Main(string[] args)
        {
            using (var context = new DeviceWarehouseContext())
            {
                // 查询所有ProjectOutboundItem
                var items = context.ProjectOutboundItems.Include(i => i.Outbound).ToList();
                
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