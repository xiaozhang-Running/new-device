using System.Collections.Generic;

namespace DeviceWarehouseSystem.DTOs;

public class RawMaterialImportDTO
{
    public required List<RawMaterialCreateDTO> RawMaterials { get; set; }
}