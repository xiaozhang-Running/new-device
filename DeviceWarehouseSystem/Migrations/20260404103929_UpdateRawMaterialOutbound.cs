using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRawMaterialOutbound : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Recipient",
                table: "RawMaterialOutbound");

            migrationBuilder.RenameColumn(
                name: "Operator",
                table: "RawMaterialOutbound",
                newName: "WarehouseKeeper");

            migrationBuilder.AddColumn<string>(
                name: "Applicant",
                table: "RawMaterialOutbound",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "RawMaterialOutbound",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Handler",
                table: "RawMaterialOutbound",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Applicant",
                table: "RawMaterialOutbound");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "RawMaterialOutbound");

            migrationBuilder.DropColumn(
                name: "Handler",
                table: "RawMaterialOutbound");

            migrationBuilder.RenameColumn(
                name: "WarehouseKeeper",
                table: "RawMaterialOutbound",
                newName: "Operator");

            migrationBuilder.AddColumn<string>(
                name: "Recipient",
                table: "RawMaterialOutbound",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }
    }
}
