using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Consumables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ModelSpecification = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    OriginalQuantity = table.Column<int>(type: "int", nullable: false),
                    UsedQuantity = table.Column<int>(type: "int", nullable: false),
                    RemainingQuantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Company = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consumables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EquipmentInbound",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InboundDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EquipmentType = table.Column<int>(type: "int", nullable: false),
                    DeliveryPerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentInbound", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GeneralEquipment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DeviceType = table.Column<int>(type: "int", nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Model = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeviceStatus = table.Column<int>(type: "int", nullable: false),
                    UseStatus = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Company = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepairStatus = table.Column<int>(type: "int", nullable: true),
                    RepairPerson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepairDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FaultReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProjectTime = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NameSequence = table.Column<int>(type: "int", nullable: false),
                    ImageData = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    ImageContentType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneralEquipment", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InboundOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InboundType = table.Column<int>(type: "int", nullable: false),
                    Supplier = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeliveryPerson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Receiver = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReceiverPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InboundOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OutboundOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OutboundType = table.Column<int>(type: "int", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutboundOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectInbound",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InboundDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProjectCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProjectManager = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    InboundType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProjectTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    StorageLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Handler = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WarehouseKeeper = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    InboundImages = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "待入库"),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectInbound", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectOutbound",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OutboundDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProjectName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProjectCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProjectManager = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Recipient = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    OutboundType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProjectTime = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UsageLocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Handler = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    WarehouseKeeper = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LogisticsMethod = table.Column<int>(type: "int", nullable: true),
                    OutboundImages = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectOutbound", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterial",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Specification = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TotalQuantity = table.Column<int>(type: "int", nullable: false),
                    UsedQuantity = table.Column<int>(type: "int", nullable: false),
                    RemainingQuantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterial", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterialInbound",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    InboundDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeliveryPerson = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Company = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Supplier = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterialInbound", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterialOutbound",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OutboundDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Recipient = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Purpose = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterialOutbound", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecialEquipment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DeviceType = table.Column<int>(type: "int", nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Model = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeviceStatus = table.Column<int>(type: "int", nullable: false),
                    UseStatus = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Company = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepairStatus = table.Column<int>(type: "int", nullable: true),
                    RepairPerson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RepairDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FaultReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Location = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    ProjectName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProjectTime = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NameSequence = table.Column<int>(type: "int", nullable: false),
                    ImageData = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    ImageContentType = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialEquipment", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PasswordExpiryAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    IsLockedOut = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EquipmentInboundItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundId = table.Column<int>(type: "int", nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EquipmentType = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EquipmentInboundItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EquipmentInboundItem_EquipmentInbound_InboundId",
                        column: x => x.InboundId,
                        principalTable: "EquipmentInbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectInboundItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DeviceStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsInbound = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectInboundItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectInboundItem_ProjectInbound_InboundId",
                        column: x => x.InboundId,
                        principalTable: "ProjectInbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectInboundOutbound",
                columns: table => new
                {
                    ProjectInboundId = table.Column<int>(type: "int", nullable: false),
                    ProjectOutboundId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectInboundOutbound", x => new { x.ProjectInboundId, x.ProjectOutboundId });
                    table.ForeignKey(
                        name: "FK_ProjectInboundOutbound_ProjectInbound_ProjectInboundId",
                        column: x => x.ProjectInboundId,
                        principalTable: "ProjectInbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectInboundOutbound_ProjectOutbound_ProjectOutboundId",
                        column: x => x.ProjectOutboundId,
                        principalTable: "ProjectOutbound",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectOutboundItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    ItemName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Brand = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeviceStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectOutboundItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectOutboundItem_ProjectOutbound_OutboundId",
                        column: x => x.OutboundId,
                        principalTable: "ProjectOutbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RawMaterialInboundItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundId = table.Column<int>(type: "int", nullable: false),
                    RawMaterialId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Specification = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterialInboundItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawMaterialInboundItem_RawMaterialInbound_InboundId",
                        column: x => x.InboundId,
                        principalTable: "RawMaterialInbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RawMaterialInboundItem_RawMaterial_RawMaterialId",
                        column: x => x.RawMaterialId,
                        principalTable: "RawMaterial",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RawMaterialOutboundItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundId = table.Column<int>(type: "int", nullable: false),
                    RawMaterialId = table.Column<int>(type: "int", nullable: false),
                    Specification = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawMaterialOutboundItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawMaterialOutboundItem_RawMaterialOutbound_OutboundId",
                        column: x => x.OutboundId,
                        principalTable: "RawMaterialOutbound",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RawMaterialOutboundItem_RawMaterial_RawMaterialId",
                        column: x => x.RawMaterialId,
                        principalTable: "RawMaterial",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    PermissionsId = table.Column<int>(type: "int", nullable: false),
                    RolesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.PermissionsId, x.RolesId });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionsId",
                        column: x => x.PermissionsId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RolesId",
                        column: x => x.RolesId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpecialEquipmentId = table.Column<int>(type: "int", nullable: true),
                    GeneralEquipmentId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Images_GeneralEquipment_GeneralEquipmentId",
                        column: x => x.GeneralEquipmentId,
                        principalTable: "GeneralEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Images_SpecialEquipment_SpecialEquipmentId",
                        column: x => x.SpecialEquipmentId,
                        principalTable: "SpecialEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InboundOrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    SpecialEquipmentId = table.Column<int>(type: "int", nullable: false),
                    GeneralEquipmentId = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InboundOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InboundOrderItems_GeneralEquipment_GeneralEquipmentId",
                        column: x => x.GeneralEquipmentId,
                        principalTable: "GeneralEquipment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InboundOrderItems_InboundOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "InboundOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InboundOrderItems_SpecialEquipment_SpecialEquipmentId",
                        column: x => x.SpecialEquipmentId,
                        principalTable: "SpecialEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inventories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecialEquipmentId = table.Column<int>(type: "int", nullable: true),
                    GeneralEquipmentId = table.Column<int>(type: "int", nullable: true),
                    CurrentQuantity = table.Column<int>(type: "int", nullable: false),
                    AlertMinQuantity = table.Column<int>(type: "int", nullable: false),
                    AlertMaxQuantity = table.Column<int>(type: "int", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inventories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inventories_GeneralEquipment_GeneralEquipmentId",
                        column: x => x.GeneralEquipmentId,
                        principalTable: "GeneralEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inventories_SpecialEquipment_SpecialEquipmentId",
                        column: x => x.SpecialEquipmentId,
                        principalTable: "SpecialEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OutboundOrderItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    SpecialEquipmentId = table.Column<int>(type: "int", nullable: false),
                    GeneralEquipmentId = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutboundOrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OutboundOrderItems_GeneralEquipment_GeneralEquipmentId",
                        column: x => x.GeneralEquipmentId,
                        principalTable: "GeneralEquipment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OutboundOrderItems_OutboundOrders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "OutboundOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OutboundOrderItems_SpecialEquipment_SpecialEquipmentId",
                        column: x => x.SpecialEquipmentId,
                        principalTable: "SpecialEquipment",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScrapEquipment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecialEquipmentId = table.Column<int>(type: "int", nullable: true),
                    GeneralEquipmentId = table.Column<int>(type: "int", nullable: true),
                    DeviceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Specification = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeviceType = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Company = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Accessories = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScrapReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ScrapDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ScrappedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScrapEquipment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScrapEquipment_GeneralEquipment_GeneralEquipmentId",
                        column: x => x.GeneralEquipmentId,
                        principalTable: "GeneralEquipment",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ScrapEquipment_SpecialEquipment_SpecialEquipmentId",
                        column: x => x.SpecialEquipmentId,
                        principalTable: "SpecialEquipment",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserActivityLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ActivityDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserActivityLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventoryTransaction",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InventoryId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Operator = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryTransaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryTransaction_Inventories_InventoryId",
                        column: x => x.InventoryId,
                        principalTable: "Inventories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_Company",
                table: "Consumables",
                column: "Company");

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_Location",
                table: "Consumables",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_Name_Brand_ModelSpecification",
                table: "Consumables",
                columns: new[] { "Name", "Brand", "ModelSpecification" });

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_RemainingQuantity",
                table: "Consumables",
                column: "RemainingQuantity");

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_TotalQuantity",
                table: "Consumables",
                column: "TotalQuantity");

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_Unit",
                table: "Consumables",
                column: "Unit");

            migrationBuilder.CreateIndex(
                name: "IX_Consumables_UsedQuantity",
                table: "Consumables",
                column: "UsedQuantity");

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentInbound_InboundNumber",
                table: "EquipmentInbound",
                column: "InboundNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentInboundItem_InboundId",
                table: "EquipmentInboundItem",
                column: "InboundId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_DeviceCode",
                table: "GeneralEquipment",
                column: "DeviceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_DeviceName",
                table: "GeneralEquipment",
                column: "DeviceName");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_DeviceName_Brand_Model",
                table: "GeneralEquipment",
                columns: new[] { "DeviceName", "Brand", "Model" });

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_DeviceStatus",
                table: "GeneralEquipment",
                column: "DeviceStatus");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_DeviceType",
                table: "GeneralEquipment",
                column: "DeviceType");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_Location",
                table: "GeneralEquipment",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_Quantity",
                table: "GeneralEquipment",
                column: "Quantity");

            migrationBuilder.CreateIndex(
                name: "IX_GeneralEquipment_UseStatus",
                table: "GeneralEquipment",
                column: "UseStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Images_GeneralEquipmentId",
                table: "Images",
                column: "GeneralEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_SpecialEquipmentId",
                table: "Images",
                column: "SpecialEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderItems_GeneralEquipmentId",
                table: "InboundOrderItems",
                column: "GeneralEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderItems_OrderId",
                table: "InboundOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderItems_SpecialEquipmentId",
                table: "InboundOrderItems",
                column: "SpecialEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrders_OrderCode",
                table: "InboundOrders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_GeneralEquipmentId",
                table: "Inventories",
                column: "GeneralEquipmentId",
                unique: true,
                filter: "([GeneralEquipmentId] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_Inventories_SpecialEquipmentId",
                table: "Inventories",
                column: "SpecialEquipmentId",
                unique: true,
                filter: "([SpecialEquipmentId] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_InventoryId",
                table: "InventoryTransaction",
                column: "InventoryId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_TransactionDate",
                table: "InventoryTransaction",
                column: "TransactionDate");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryTransaction_TransactionType",
                table: "InventoryTransaction",
                column: "TransactionType");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrderItems_GeneralEquipmentId",
                table: "OutboundOrderItems",
                column: "GeneralEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrderItems_OrderId",
                table: "OutboundOrderItems",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrderItems_SpecialEquipmentId",
                table: "OutboundOrderItems",
                column: "SpecialEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrders_OrderCode",
                table: "OutboundOrders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Code",
                table: "Permissions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInbound_InboundNumber",
                table: "ProjectInbound",
                column: "InboundNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInboundItem_InboundId",
                table: "ProjectInboundItem",
                column: "InboundId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInboundOutbound_ProjectOutboundId",
                table: "ProjectInboundOutbound",
                column: "ProjectOutboundId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOutbound_OutboundNumber",
                table: "ProjectOutbound",
                column: "OutboundNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectOutboundItem_OutboundId",
                table: "ProjectOutboundItem",
                column: "OutboundId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterial_ProductName",
                table: "RawMaterial",
                column: "ProductName");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterial_RemainingQuantity",
                table: "RawMaterial",
                column: "RemainingQuantity");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterial_Supplier",
                table: "RawMaterial",
                column: "Supplier");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialInbound_InboundNumber",
                table: "RawMaterialInbound",
                column: "InboundNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialInboundItem_InboundId",
                table: "RawMaterialInboundItem",
                column: "InboundId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialInboundItem_RawMaterialId",
                table: "RawMaterialInboundItem",
                column: "RawMaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialOutbound_OutboundNumber",
                table: "RawMaterialOutbound",
                column: "OutboundNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialOutboundItem_OutboundId",
                table: "RawMaterialOutboundItem",
                column: "OutboundId");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterialOutboundItem_RawMaterialId",
                table: "RawMaterialOutboundItem",
                column: "RawMaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RolesId",
                table: "RolePermissions",
                column: "RolesId");

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScrapEquipment_DeviceCode",
                table: "ScrapEquipment",
                column: "DeviceCode");

            migrationBuilder.CreateIndex(
                name: "IX_ScrapEquipment_DeviceType",
                table: "ScrapEquipment",
                column: "DeviceType");

            migrationBuilder.CreateIndex(
                name: "IX_ScrapEquipment_GeneralEquipmentId",
                table: "ScrapEquipment",
                column: "GeneralEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ScrapEquipment_ScrapDate",
                table: "ScrapEquipment",
                column: "ScrapDate");

            migrationBuilder.CreateIndex(
                name: "IX_ScrapEquipment_SpecialEquipmentId",
                table: "ScrapEquipment",
                column: "SpecialEquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_DeviceCode",
                table: "SpecialEquipment",
                column: "DeviceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_DeviceName",
                table: "SpecialEquipment",
                column: "DeviceName");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_DeviceName_Brand_Model",
                table: "SpecialEquipment",
                columns: new[] { "DeviceName", "Brand", "Model" });

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_DeviceStatus",
                table: "SpecialEquipment",
                column: "DeviceStatus");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_DeviceType",
                table: "SpecialEquipment",
                column: "DeviceType");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_Location",
                table: "SpecialEquipment",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_Quantity",
                table: "SpecialEquipment",
                column: "Quantity");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialEquipment_UseStatus",
                table: "SpecialEquipment",
                column: "UseStatus");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityLogs_ActivityType",
                table: "UserActivityLogs",
                column: "ActivityType");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityLogs_CreatedAt",
                table: "UserActivityLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_UserActivityLogs_UserId",
                table: "UserActivityLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Consumables");

            migrationBuilder.DropTable(
                name: "EquipmentInboundItem");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.DropTable(
                name: "InboundOrderItems");

            migrationBuilder.DropTable(
                name: "InventoryTransaction");

            migrationBuilder.DropTable(
                name: "OutboundOrderItems");

            migrationBuilder.DropTable(
                name: "ProjectInboundItem");

            migrationBuilder.DropTable(
                name: "ProjectInboundOutbound");

            migrationBuilder.DropTable(
                name: "ProjectOutboundItem");

            migrationBuilder.DropTable(
                name: "RawMaterialInboundItem");

            migrationBuilder.DropTable(
                name: "RawMaterialOutboundItem");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "ScrapEquipment");

            migrationBuilder.DropTable(
                name: "UserActivityLogs");

            migrationBuilder.DropTable(
                name: "EquipmentInbound");

            migrationBuilder.DropTable(
                name: "InboundOrders");

            migrationBuilder.DropTable(
                name: "Inventories");

            migrationBuilder.DropTable(
                name: "OutboundOrders");

            migrationBuilder.DropTable(
                name: "ProjectInbound");

            migrationBuilder.DropTable(
                name: "ProjectOutbound");

            migrationBuilder.DropTable(
                name: "RawMaterialInbound");

            migrationBuilder.DropTable(
                name: "RawMaterialOutbound");

            migrationBuilder.DropTable(
                name: "RawMaterial");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "GeneralEquipment");

            migrationBuilder.DropTable(
                name: "SpecialEquipment");
        }
    }
}
