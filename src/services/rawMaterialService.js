// 原材料服务

const API_BASE_URL = 'http://localhost:5055/api';

export const rawMaterialService = {
  // 获取原材料列表
  getRawMaterials: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/RawMaterials?${queryString}` : `${API_BASE_URL}/RawMaterials`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('获取原材料失败');
    }
    return response.json();
  },

  // 添加原材料
  addRawMaterial: async (rawMaterial) => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawMaterial)
    });
    if (!response.ok) {
      throw new Error('添加原材料失败');
    }
    return response.json();
  },

  // 更新原材料
  updateRawMaterial: async (id, rawMaterial) => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawMaterial)
    });
    if (!response.ok) {
      throw new Error('更新原材料失败');
    }
    return response.json();
  },

  // 删除原材料
  deleteRawMaterial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('删除原材料失败');
    }
    return true;
  },

  // 清空所有原材料
  clearAllRawMaterials: async () => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('清空原材料失败');
    }
    return true;
  },

  // 导入原材料
  importRawMaterials: async (rawMaterials) => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ RawMaterials: rawMaterials })
    });
    if (!response.ok) {
      throw new Error('导入原材料失败');
    }
    return response.json();
  }
};