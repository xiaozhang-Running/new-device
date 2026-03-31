using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseFieldsToGeneralEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate",
                table: "GeneralEquipment",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "GeneralEquipment",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "GeneralEquipment");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "GeneralEquipment");
        }
    }
}
