using System.Collections.Generic;
using System.Threading.Tasks;
using DeviceWarehouseSystem.DTOs;

namespace DeviceWarehouseSystem.Services;

public interface IRawMaterialService
{
    Task<IEnumerable<RawMaterialDTO>> GetRawMaterials(string? search, string? location);
    Task<RawMaterialDTO> GetRawMaterialById(int id);
    Task<RawMaterialDTO> CreateRawMaterial(RawMaterialCreateDTO rawMaterialCreateDTO);
    Task<RawMaterialDTO> UpdateRawMaterial(int id, RawMaterialUpdateDTO rawMaterialUpdateDTO);
    Task<bool> DeleteRawMaterial(int id);
    Task<int> ImportRawMaterials(List<RawMaterialCreateDTO> rawMaterials);
    Task<RawMaterialStatsDTO> GetRawMaterialStats();
    Task DeleteAllRawMaterials();
}