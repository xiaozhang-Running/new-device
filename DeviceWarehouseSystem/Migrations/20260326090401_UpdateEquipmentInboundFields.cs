using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEquipmentInboundFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InboundPerson",
                table: "EquipmentInbound",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Inspector",
                table: "EquipmentInbound",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InboundPerson",
                table: "EquipmentInbound");

            migrationBuilder.DropColumn(
                name: "Inspector",
                table: "EquipmentInbound");
        }
    }
}
