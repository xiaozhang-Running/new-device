// 原材料服务
import { request } from './request';

export const rawMaterialService = {
  // 获取原材料列表
  getRawMaterials: async (params = {}) => {
    return request({
      url: '/RawMaterials',
      method: 'GET',
      params
    });
  },

  // 添加原材料
  addRawMaterial: async (rawMaterial) => {
    return request({
      url: '/RawMaterials',
      method: 'POST',
      data: rawMaterial
    });
  },

  // 更新原材料
  updateRawMaterial: async (id, rawMaterial) => {
    return request({
      url: `/RawMaterials/${id}`,
      method: 'PUT',
      data: rawMaterial
    });
  },

  // 删除原材料
  deleteRawMaterial: async (id) => {
    return request({
      url: `/RawMaterials/${id}`,
      method: 'DELETE'
    });
  },

  // 清空所有原材料
  clearAllRawMaterials: async () => {
    return request({
      url: '/RawMaterials',
      method: 'DELETE'
    });
  },

  // 导入原材料
  importRawMaterials: async (rawMaterials) => {
    return request({
      url: '/RawMaterials/import',
      method: 'POST',
      data: { RawMaterials: rawMaterials }
    });
  }
};