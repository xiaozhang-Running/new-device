using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Models
{
    public class WarehouseContext : DbContext
    {
        public WarehouseContext(DbContextOptions<WarehouseContext> options) : base(options)
        {}

        public DbSet<User> Users { get; set; }
        public DbSet<SpecialEquipment> SpecialEquipments { get; set; }
        public DbSet<GeneralEquipment> GeneralEquipments { get; set; }
        public DbSet<Consumable> Consumables { get; set; }
        public DbSet<RawMaterial> RawMaterials { get; set; }
        public DbSet<ProjectOutbound> ProjectOutbounds { get; set; }
        public DbSet<ProjectInbound> ProjectInbounds { get; set; }
        public DbSet<RepairEquipment> RepairEquipments { get; set; }
        public DbSet<UserActivityLog> UserActivityLogs { get; set; }
    }
}
