using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeviceWarehouseSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddBrandLocationAndImageToRawMaterial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "RawMaterial",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "RawMaterial",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "RawMaterial",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterial_Brand",
                table: "RawMaterial",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_RawMaterial_Location",
                table: "RawMaterial",
                column: "Location");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RawMaterial_Brand",
                table: "RawMaterial");

            migrationBuilder.DropIndex(
                name: "IX_RawMaterial_Location",
                table: "RawMaterial");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "RawMaterial");

            migrationBuilder.DropColumn(
                name: "Image",
                table: "RawMaterial");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "RawMaterial");
        }
    }
}
