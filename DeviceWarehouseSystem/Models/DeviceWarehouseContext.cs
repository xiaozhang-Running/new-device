using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Models;

public partial class DeviceWarehouseContext : DbContext
{
    public DeviceWarehouseContext()
    {
    }

    public DeviceWarehouseContext(DbContextOptions<DeviceWarehouseContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Consumable>? Consumables { get; set; }

    public virtual DbSet<EquipmentInbound>? EquipmentInbounds { get; set; }

    public virtual DbSet<EquipmentInboundItem>? EquipmentInboundItems { get; set; }

    public virtual DbSet<GeneralEquipment>? GeneralEquipments { get; set; }

    public virtual DbSet<Image>? Images { get; set; }

    public virtual DbSet<InboundOrder>? InboundOrders { get; set; }

    public virtual DbSet<InboundOrderItem>? InboundOrderItems { get; set; }

    public virtual DbSet<Inventory>? Inventories { get; set; }

    public virtual DbSet<InventoryTransaction>? InventoryTransactions { get; set; }

    public virtual DbSet<OutboundOrder>? OutboundOrders { get; set; }

    public virtual DbSet<OutboundOrderItem>? OutboundOrderItems { get; set; }

    public virtual DbSet<Permission>? Permissions { get; set; }

    public virtual DbSet<ProjectInbound>? ProjectInbounds { get; set; }

    public virtual DbSet<ProjectInboundItem>? ProjectInboundItems { get; set; }

    public virtual DbSet<ProjectInboundOutbound>? ProjectInboundOutbounds { get; set; }

    public virtual DbSet<ProjectOutbound>? ProjectOutbounds { get; set; }

    public virtual DbSet<ProjectOutboundItem>? ProjectOutboundItems { get; set; }

    public virtual DbSet<RawMaterial>? RawMaterials { get; set; }

    public virtual DbSet<RawMaterialInbound>? RawMaterialInbounds { get; set; }

    public virtual DbSet<RawMaterialInboundItem>? RawMaterialInboundItems { get; set; }

    public virtual DbSet<RawMaterialOutbound>? RawMaterialOutbounds { get; set; }

    public virtual DbSet<RawMaterialOutboundItem>? RawMaterialOutboundItems { get; set; }

    public virtual DbSet<Role>? Roles { get; set; }

    public virtual DbSet<RolePermission>? RolePermissions { get; set; }

    public virtual DbSet<ScrapEquipment>? ScrapEquipments { get; set; }

    public virtual DbSet<SpecialEquipment>? SpecialEquipments { get; set; }

    public virtual DbSet<User>? Users { get; set; }

        public virtual DbSet<UserActivityLog>? UserActivityLogs { get; set; }

        public virtual DbSet<EquipmentImage>? EquipmentImages { get; set; }

        public virtual DbSet<InOutboundImage>? InOutboundImages { get; set; }

        public virtual DbSet<RepairEquipment>? RepairEquipments { get; set; }

    public virtual DbSet<Warehouse>? Warehouses { get; set; }

    public virtual DbSet<Company>? Companies { get; set; }

    public virtual DbSet<StockTaking>? StockTakings { get; set; }

    public virtual DbSet<StockTakingItem>? StockTakingItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // 连接字符串已在 Program.cs 中通过配置文件设置
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Consumable>(entity =>
        {
            entity.HasIndex(e => e.Company, "IX_Consumables_Company");

            entity.HasIndex(e => e.Location, "IX_Consumables_Location");

            entity.HasIndex(e => new { e.Name, e.Brand, e.ModelSpecification }, "IX_Consumables_Name_Brand_ModelSpecification");

            entity.HasIndex(e => e.RemainingQuantity, "IX_Consumables_RemainingQuantity");

            entity.HasIndex(e => e.TotalQuantity, "IX_Consumables_TotalQuantity");

            entity.HasIndex(e => e.Unit, "IX_Consumables_Unit");

            entity.HasIndex(e => e.UsedQuantity, "IX_Consumables_UsedQuantity");
        });

        modelBuilder.Entity<EquipmentInbound>(entity =>
        {
            entity.ToTable("EquipmentInbound");

            entity.HasIndex(e => e.InboundNumber, "IX_EquipmentInbound_InboundNumber").IsUnique();

            entity.Property(e => e.DeliveryPerson).HasMaxLength(200);
            entity.Property(e => e.InboundNumber).HasMaxLength(50);
            entity.Property(e => e.Operator).HasMaxLength(100);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20);
        });

        modelBuilder.Entity<EquipmentInboundItem>(entity =>
        {
            entity.ToTable("EquipmentInboundItem");

            entity.HasIndex(e => e.InboundId, "IX_EquipmentInboundItem_InboundId");

            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.DeviceCode).HasMaxLength(100);
            entity.Property(e => e.DeviceName).HasMaxLength(200);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.Model).HasMaxLength(100);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.SerialNumber).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(200);
            entity.Property(e => e.Unit).HasMaxLength(20);

            entity.HasOne(d => d.Inbound).WithMany(p => p.EquipmentInboundItems).HasForeignKey(d => d.InboundId);
        });

        modelBuilder.Entity<GeneralEquipment>(entity =>
        {
            entity.ToTable("GeneralEquipment");

            entity.HasIndex(e => e.DeviceCode, "IX_GeneralEquipment_DeviceCode").IsUnique();

            entity.HasIndex(e => e.DeviceName, "IX_GeneralEquipment_DeviceName");

            entity.HasIndex(e => new { e.DeviceName, e.Brand, e.Model }, "IX_GeneralEquipment_DeviceName_Brand_Model");

            entity.HasIndex(e => e.DeviceStatus, "IX_GeneralEquipment_DeviceStatus");

            entity.HasIndex(e => e.DeviceType, "IX_GeneralEquipment_DeviceType");

            entity.HasIndex(e => e.Location, "IX_GeneralEquipment_Location");

            entity.HasIndex(e => e.Quantity, "IX_GeneralEquipment_Quantity");

            entity.HasIndex(e => e.UseStatus, "IX_GeneralEquipment_UseStatus");
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasIndex(e => e.GeneralEquipmentId, "IX_Images_GeneralEquipmentId");

            entity.HasIndex(e => e.SpecialEquipmentId, "IX_Images_SpecialEquipmentId");

            entity.HasOne(d => d.GeneralEquipment).WithMany(p => p.Images)
                .HasForeignKey(d => d.GeneralEquipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.SpecialEquipment).WithMany(p => p.Images)
                .HasForeignKey(d => d.SpecialEquipmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InboundOrder>(entity =>
        {
            entity.HasIndex(e => e.OrderCode, "IX_InboundOrders_OrderCode").IsUnique();

            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<InboundOrderItem>(entity =>
        {
            entity.HasIndex(e => e.GeneralEquipmentId, "IX_InboundOrderItems_GeneralEquipmentId");

            entity.HasIndex(e => e.OrderId, "IX_InboundOrderItems_OrderId");

            entity.HasIndex(e => e.SpecialEquipmentId, "IX_InboundOrderItems_SpecialEquipmentId");

            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.GeneralEquipment).WithMany(p => p.InboundOrderItems).HasForeignKey(d => d.GeneralEquipmentId);

            entity.HasOne(d => d.Order).WithMany(p => p.InboundOrderItems).HasForeignKey(d => d.OrderId);

            entity.HasOne(d => d.SpecialEquipment).WithMany(p => p.InboundOrderItems).HasForeignKey(d => d.SpecialEquipmentId);
        });

        modelBuilder.Entity<Inventory>(entity =>
        {
            entity.HasIndex(e => e.GeneralEquipmentId, "IX_Inventories_GeneralEquipmentId")
                .IsUnique()
                .HasFilter("([GeneralEquipmentId] IS NOT NULL)");

            entity.HasIndex(e => e.SpecialEquipmentId, "IX_Inventories_SpecialEquipmentId")
                .IsUnique()
                .HasFilter("([SpecialEquipmentId] IS NOT NULL)");

            entity.HasIndex(e => e.WarehouseId, "IX_Inventories_WarehouseId");

            entity.HasOne(d => d.GeneralEquipment).WithOne(p => p.Inventory)
                .HasForeignKey<Inventory>(d => d.GeneralEquipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.SpecialEquipment).WithOne(p => p.Inventory)
                .HasForeignKey<Inventory>(d => d.SpecialEquipmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Warehouse).WithMany(p => p.Inventories)
                .HasForeignKey(d => d.WarehouseId);
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.ToTable("InventoryTransaction");

            entity.HasIndex(e => e.InventoryId, "IX_InventoryTransaction_InventoryId");

            entity.HasIndex(e => e.TransactionDate, "IX_InventoryTransaction_TransactionDate");

            entity.HasIndex(e => e.TransactionType, "IX_InventoryTransaction_TransactionType");

            entity.HasOne(d => d.Inventory).WithMany(p => p.InventoryTransactions).HasForeignKey(d => d.InventoryId);
        });

        modelBuilder.Entity<OutboundOrder>(entity =>
        {
            entity.HasIndex(e => e.OrderCode, "IX_OutboundOrders_OrderCode").IsUnique();
        });

        modelBuilder.Entity<OutboundOrderItem>(entity =>
        {
            entity.HasIndex(e => e.GeneralEquipmentId, "IX_OutboundOrderItems_GeneralEquipmentId");

            entity.HasIndex(e => e.OrderId, "IX_OutboundOrderItems_OrderId");

            entity.HasIndex(e => e.SpecialEquipmentId, "IX_OutboundOrderItems_SpecialEquipmentId");

            entity.HasOne(d => d.GeneralEquipment).WithMany(p => p.OutboundOrderItems).HasForeignKey(d => d.GeneralEquipmentId);

            entity.HasOne(d => d.Order).WithMany(p => p.OutboundOrderItems).HasForeignKey(d => d.OrderId);

            entity.HasOne(d => d.SpecialEquipment).WithMany(p => p.OutboundOrderItems).HasForeignKey(d => d.SpecialEquipmentId);
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasIndex(e => e.Code, "IX_Permissions_Code").IsUnique();

            entity.HasMany(d => d.Roles).WithMany(p => p.Permissions)
                .UsingEntity<RolePermission>(
                    r => r.HasOne<Role>().WithMany().HasForeignKey(d => d.RoleId),
                    l => l.HasOne<Permission>().WithMany().HasForeignKey(d => d.PermissionId),
                    j =>
                    {
                        j.HasKey(d => d.Id);
                        j.ToTable("RolePermissions");
                        j.HasIndex(new[] { "RoleId" }, "IX_RolePermissions_RoleId");
                        j.HasIndex(new[] { "PermissionId" }, "IX_RolePermissions_PermissionId");
                    });
        });

        modelBuilder.Entity<ProjectInbound>(entity =>
        {
            entity.ToTable("ProjectInbound");

            entity.HasIndex(e => e.InboundNumber, "IX_ProjectInbound_InboundNumber").IsUnique();

            entity.Property(e => e.ContactPhone).HasMaxLength(50);
            entity.Property(e => e.Handler).HasMaxLength(100);
            entity.Property(e => e.InboundNumber).HasMaxLength(50);
            entity.Property(e => e.InboundType).HasMaxLength(50);
            entity.Property(e => e.ProjectCode).HasMaxLength(50);
            entity.Property(e => e.ProjectManager).HasMaxLength(200);
            entity.Property(e => e.ProjectName).HasMaxLength(200);
            entity.Property(e => e.ProjectTime).HasMaxLength(100);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Status).HasDefaultValue("待入库");
            entity.Property(e => e.StorageLocation).HasMaxLength(200);
            entity.Property(e => e.Supplier).HasMaxLength(200);
            entity.Property(e => e.WarehouseKeeper).HasMaxLength(100);
        });

        modelBuilder.Entity<ProjectInboundItem>(entity =>
        {
            entity.ToTable("ProjectInboundItem");

            entity.HasIndex(e => e.InboundId, "IX_ProjectInboundItem_InboundId");

            entity.Property(e => e.Accessories).HasMaxLength(500);
            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.DeviceCode).HasMaxLength(100);
            entity.Property(e => e.DeviceStatus).HasMaxLength(50);
            entity.Property(e => e.ItemName).HasMaxLength(200);
            entity.Property(e => e.Model).HasMaxLength(200);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Unit).HasMaxLength(50);

            entity.HasOne(d => d.Inbound).WithMany(p => p.ProjectInboundItems).HasForeignKey(d => d.InboundId);
        });

        modelBuilder.Entity<ProjectInboundOutbound>(entity =>
        {
            entity.HasKey(e => new { e.ProjectInboundId, e.ProjectOutboundId });

            entity.ToTable("ProjectInboundOutbound");

            entity.HasIndex(e => e.ProjectOutboundId, "IX_ProjectInboundOutbound_ProjectOutboundId");

            entity.HasOne(d => d.ProjectInbound).WithMany(p => p.ProjectInboundOutbounds).HasForeignKey(d => d.ProjectInboundId);

            entity.HasOne(d => d.ProjectOutbound).WithMany(p => p.ProjectInboundOutbounds)
                .HasForeignKey(d => d.ProjectOutboundId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<ProjectOutbound>(entity =>
        {
            entity.ToTable("ProjectOutbound");

            entity.HasIndex(e => e.OutboundNumber, "IX_ProjectOutbound_OutboundNumber").IsUnique();

            entity.Property(e => e.ContactPhone).HasMaxLength(50);
            entity.Property(e => e.Handler).HasMaxLength(100);
            entity.Property(e => e.OutboundNumber).HasMaxLength(50);
            entity.Property(e => e.OutboundType).HasMaxLength(50);
            entity.Property(e => e.ProjectCode).HasMaxLength(50);
            entity.Property(e => e.ProjectManager).HasMaxLength(200);
            entity.Property(e => e.ProjectName).HasMaxLength(200);
            entity.Property(e => e.ProjectTime).HasMaxLength(100);
            entity.Property(e => e.Recipient).HasMaxLength(200);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.UsageLocation).HasMaxLength(200);
            entity.Property(e => e.WarehouseKeeper).HasMaxLength(100);
        });

        modelBuilder.Entity<ProjectOutboundItem>(entity =>
        {
            entity.ToTable("ProjectOutboundItem");

            entity.HasIndex(e => e.OutboundId, "IX_ProjectOutboundItem_OutboundId");

            entity.Property(e => e.Accessories).HasMaxLength(500);
            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.DeviceCode).HasMaxLength(100);
            entity.Property(e => e.DeviceStatus).HasMaxLength(50);
            entity.Property(e => e.ItemName).HasMaxLength(200);
            entity.Property(e => e.Model).HasMaxLength(200);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Unit).HasMaxLength(50);

            entity.HasOne(d => d.Outbound).WithMany(p => p.ProjectOutboundItems).HasForeignKey(d => d.OutboundId);
        });

        modelBuilder.Entity<RawMaterial>(entity =>
        {
            entity.ToTable("RawMaterial");

            entity.HasIndex(e => e.ProductName, "IX_RawMaterial_ProductName");

            entity.HasIndex(e => e.RemainingQuantity, "IX_RawMaterial_RemainingQuantity");

            entity.HasIndex(e => e.Supplier, "IX_RawMaterial_Supplier");

            entity.HasIndex(e => e.Brand, "IX_RawMaterial_Brand");

            entity.HasIndex(e => e.Location, "IX_RawMaterial_Location");

            entity.Property(e => e.Brand).HasMaxLength(100);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.Image).HasMaxLength(500);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.ProductName).HasMaxLength(200);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Specification).HasMaxLength(200);
            entity.Property(e => e.Supplier).HasMaxLength(200);
            entity.Property(e => e.Unit).HasMaxLength(20);
        });

        modelBuilder.Entity<RawMaterialInbound>(entity =>
        {
            entity.ToTable("RawMaterialInbound");

            entity.HasIndex(e => e.InboundNumber, "IX_RawMaterialInbound_InboundNumber").IsUnique();

            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.DeliveryPerson).HasMaxLength(200);
            entity.Property(e => e.InboundNumber).HasMaxLength(50);
            entity.Property(e => e.Operator).HasMaxLength(100);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Supplier).HasMaxLength(200);
        });

        modelBuilder.Entity<RawMaterialInboundItem>(entity =>
        {
            entity.ToTable("RawMaterialInboundItem");

            entity.HasIndex(e => e.InboundId, "IX_RawMaterialInboundItem_InboundId");

            entity.HasIndex(e => e.RawMaterialId, "IX_RawMaterialInboundItem_RawMaterialId");

            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Specification).HasMaxLength(200);

            entity.HasOne(d => d.Inbound).WithMany(p => p.RawMaterialInboundItems).HasForeignKey(d => d.InboundId);

            entity.HasOne(d => d.RawMaterial).WithMany(p => p.RawMaterialInboundItems)
                .HasForeignKey(d => d.RawMaterialId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<RawMaterialOutbound>(entity =>
        {
            entity.ToTable("RawMaterialOutbound");

            entity.HasIndex(e => e.OutboundNumber, "IX_RawMaterialOutbound_OutboundNumber").IsUnique();

            entity.Property(e => e.Applicant).HasMaxLength(100);
            entity.Property(e => e.Department).HasMaxLength(100);
            entity.Property(e => e.Handler).HasMaxLength(100);
            entity.Property(e => e.OutboundNumber).HasMaxLength(50);
            entity.Property(e => e.Purpose).HasMaxLength(200);
            entity.Property(e => e.WarehouseKeeper).HasMaxLength(100);
            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<RawMaterialOutboundItem>(entity =>
        {
            entity.ToTable("RawMaterialOutboundItem");

            entity.HasIndex(e => e.OutboundId, "IX_RawMaterialOutboundItem_OutboundId");

            entity.HasIndex(e => e.RawMaterialId, "IX_RawMaterialOutboundItem_RawMaterialId");

            entity.Property(e => e.Remark).HasMaxLength(500);
            entity.Property(e => e.Specification).HasMaxLength(200);

            entity.HasOne(d => d.Outbound).WithMany(p => p.RawMaterialOutboundItems).HasForeignKey(d => d.OutboundId);

            entity.HasOne(d => d.RawMaterial).WithMany(p => p.RawMaterialOutboundItems)
                .HasForeignKey(d => d.RawMaterialId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_Roles_Name").IsUnique();
        });

        modelBuilder.Entity<ScrapEquipment>(entity =>
        {
            entity.ToTable("ScrapEquipment");

            entity.HasIndex(e => e.DeviceCode, "IX_ScrapEquipment_DeviceCode");

            entity.HasIndex(e => e.DeviceType, "IX_ScrapEquipment_DeviceType");

            entity.HasIndex(e => e.GeneralEquipmentId, "IX_ScrapEquipment_GeneralEquipmentId");

            entity.HasIndex(e => e.ScrapDate, "IX_ScrapEquipment_ScrapDate");

            entity.HasIndex(e => e.SpecialEquipmentId, "IX_ScrapEquipment_SpecialEquipmentId");

            entity.HasOne(d => d.GeneralEquipment).WithMany(p => p.ScrapEquipments).HasForeignKey(d => d.GeneralEquipmentId);

            entity.HasOne(d => d.SpecialEquipment).WithMany(p => p.ScrapEquipments).HasForeignKey(d => d.SpecialEquipmentId);
        });

        modelBuilder.Entity<SpecialEquipment>(entity =>
        {
            entity.ToTable("SpecialEquipment");

            entity.HasIndex(e => e.DeviceCode, "IX_SpecialEquipment_DeviceCode").IsUnique();

            entity.HasIndex(e => e.DeviceName, "IX_SpecialEquipment_DeviceName");

            entity.HasIndex(e => new { e.DeviceName, e.Brand, e.Model }, "IX_SpecialEquipment_DeviceName_Brand_Model");

            entity.HasIndex(e => e.DeviceStatus, "IX_SpecialEquipment_DeviceStatus");

            entity.HasIndex(e => e.DeviceType, "IX_SpecialEquipment_DeviceType");

            entity.HasIndex(e => e.Location, "IX_SpecialEquipment_Location");

            entity.HasIndex(e => e.Quantity, "IX_SpecialEquipment_Quantity");

            entity.HasIndex(e => e.UseStatus, "IX_SpecialEquipment_UseStatus");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Users_Email").IsUnique().HasFilter("[Email] IS NOT NULL");

            entity.HasIndex(e => e.Username, "IX_Users_Username").IsUnique();
        });

        modelBuilder.Entity<UserActivityLog>(entity =>
        {
            entity.HasIndex(e => e.ActivityType, "IX_UserActivityLogs_ActivityType");

            entity.HasIndex(e => e.CreatedAt, "IX_UserActivityLogs_CreatedAt");

            entity.HasIndex(e => e.UserId, "IX_UserActivityLogs_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.UserActivityLogs).HasForeignKey(d => d.UserId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
