using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddUsageLocationFieldToProjectInbound : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UsageLocation",
                table: "ProjectInbound",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UsageLocation",
                table: "ProjectInbound");
        }
    }
}
