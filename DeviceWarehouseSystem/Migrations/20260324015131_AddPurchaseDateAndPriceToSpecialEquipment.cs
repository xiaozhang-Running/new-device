using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseDateAndPriceToSpecialEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PurchaseDate",
                table: "SpecialEquipment",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PurchasePrice",
                table: "SpecialEquipment",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PurchaseDate",
                table: "SpecialEquipment");

            migrationBuilder.DropColumn(
                name: "PurchasePrice",
                table: "SpecialEquipment");
        }
    }
}
