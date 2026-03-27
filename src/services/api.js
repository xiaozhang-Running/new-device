import { get, post, put, del } from './request';
import { message } from 'antd';

// 简单的内存缓存
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 缓存管理器
const cacheManager = {
  get: (key) => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
      return item.data;
    }
    cache.delete(key);
    return null;
  },
  set: (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
  },
  clear: () => {
    cache.clear();
  },
  invalidate: (pattern) => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  }
};

// 带缓存和错误处理的API请求包装器
const cachedRequest = async (key, requestFn, useCache = true) => {
  if (useCache) {
    const cached = cacheManager.get(key);
    if (cached) {
      console.log(`[Cache Hit] ${key}`);
      return cached;
    }
  }

  try {
    const data = await requestFn();
    if (useCache) {
      cacheManager.set(key, data);
    }
    return data;
  } catch (error) {
    console.error(`[API Error] ${key}:`, error);
    message.error(error.message || '请求失败，请稍后重试');
    throw error;
  }
};

export const deviceApi = {
  // 获取专用设备列表
  getSpecialEquipments: async (useCache = true) => {
    return await cachedRequest('special-equipments', () => 
      get('/Device/special-equipments'), useCache);
  },

  // 获取单个设备详情
  getSpecialEquipment: async (id) => {
    return await cachedRequest(`special-equipment-${id}`, () => 
      get(`/Device/special-equipments/${id}`));
  },

  // 创建新设备
  createSpecialEquipment: async (device) => {
    const result = await post('/Device/special-equipments', device);
    cacheManager.invalidate('special-equipments');
    return result;
  },

  // 更新设备
  updateSpecialEquipment: async (id, device) => {
    const result = await put(`/Device/special-equipments/${id}`, device);
    cacheManager.invalidate('special-equipments');
    cacheManager.invalidate(`special-equipment-${id}`);
    return result;
  },

  // 删除设备
  deleteSpecialEquipment: async (id) => {
    const result = await del(`/Device/special-equipments/${id}`);
    cacheManager.invalidate('special-equipments');
    cacheManager.invalidate(`special-equipment-${id}`);
    return result;
  },

  // 清空所有专用设备
  clearAllSpecialEquipments: async () => {
    const result = await del('/Device/special-equipments');
    cacheManager.invalidate('special-equipments');
    return result;
  },

  // 获取通用设备列表
  getGeneralEquipments: async (useCache = true) => {
    return await cachedRequest('general-equipments', () => 
      get('/Device/general-equipments'), useCache);
  },

  // 获取单个通用设备详情
  getGeneralEquipment: async (id) => {
    return await cachedRequest(`general-equipment-${id}`, () => 
      get(`/Device/general-equipments/${id}`));
  },

  // 创建新通用设备
  createGeneralEquipment: async (device) => {
    const result = await post('/Device/general-equipments', device);
    cacheManager.invalidate('general-equipments');
    return result;
  },

  // 更新通用设备
  updateGeneralEquipment: async (id, device) => {
    const result = await put(`/Device/general-equipments/${id}`, device);
    cacheManager.invalidate('general-equipments');
    cacheManager.invalidate(`general-equipment-${id}`);
    return result;
  },

  // 删除通用设备
  deleteGeneralEquipment: async (id) => {
    const result = await del(`/Device/general-equipments/${id}`);
    cacheManager.invalidate('general-equipments');
    cacheManager.invalidate(`general-equipment-${id}`);
    return result;
  },

  // 清空所有通用设备
  clearAllGeneralEquipments: async () => {
    const result = await del('/Device/general-equipments');
    cacheManager.invalidate('general-equipments');
    return result;
  },

  // 从库存表获取专用设备（用于出库单）
  getSpecialInventoryDevices: async (useCache = true) => {
    return await cachedRequest('special-inventory-devices', () => 
      get('/Device/inventory/special'), useCache);
  },

  // 从库存表获取通用设备（用于出库单）
  getGeneralInventoryDevices: async (useCache = true) => {
    return await cachedRequest('general-inventory-devices', () => 
      get('/Device/inventory/general'), useCache);
  },

  // 获取专用设备详细清单
  getSpecialEquipmentDetails: async (deviceName, brand) => {
    let url = `/Device/special-equipment-details?deviceName=${encodeURIComponent(deviceName)}`;
    if (brand) {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    return await get(url);
  },

  // 获取通用设备详细清单
  getGeneralEquipmentDetails: async (deviceName, brand) => {
    let url = `/Device/general-equipment-details?deviceName=${encodeURIComponent(deviceName)}`;
    if (brand) {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    return await get(url);
  },

  // 获取耗材列表
  getConsumables: async (useCache = true) => {
    return await cachedRequest('consumables', () => 
      get('/Consumable'), useCache);
  },

  // 获取原材料列表
  getRawMaterials: async (useCache = true) => {
    return await cachedRequest('raw-materials', () => 
      get('/RawMaterials'), useCache);
  },

  // 清除所有缓存
  clearCache: () => {
    cacheManager.clear();
  }
};

export const userApi = {
  // 登录
  login: async (credentials) => {
    try {
      const result = await post('/Auth/login', credentials);
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },
};

export const warehouseApi = {
  // 获取仓库列表
  getWarehouses: async (useCache = true) => {
    return await cachedRequest('warehouses', () => 
      get('/Warehouse'), useCache);
  },

  // 获取单个仓库详情
  getWarehouse: async (id) => {
    return await cachedRequest(`warehouse-${id}`, () => 
      get(`/Warehouse/${id}`));
  },

  // 创建新仓库
  createWarehouse: async (warehouse) => {
    const result = await post('/Warehouse', warehouse);
    cacheManager.invalidate('warehouses');
    return result;
  },

  // 更新仓库
  updateWarehouse: async (id, warehouse) => {
    const result = await put(`/Warehouse/${id}`, warehouse);
    cacheManager.invalidate('warehouses');
    cacheManager.invalidate(`warehouse-${id}`);
    return result;
  },

  // 删除仓库
  deleteWarehouse: async (id) => {
    const result = await del(`/Warehouse/${id}`);
    cacheManager.invalidate('warehouses');
    cacheManager.invalidate(`warehouse-${id}`);
    return result;
  },
};

export const companyApi = {
  // 获取公司列表
  getCompanies: async (useCache = true) => {
    return await cachedRequest('companies', () => 
      get('/Company'), useCache);
  },

  // 获取单个公司详情
  getCompany: async (id) => {
    return await cachedRequest(`company-${id}`, () => 
      get(`/Company/${id}`));
  },

  // 创建新公司
  createCompany: async (company) => {
    const result = await post('/Company', company);
    cacheManager.invalidate('companies');
    return result;
  },

  // 更新公司
  updateCompany: async (id, company) => {
    const result = await put(`/Company/${id}`, company);
    cacheManager.invalidate('companies');
    cacheManager.invalidate(`company-${id}`);
    return result;
  },

  // 删除公司
  deleteCompany: async (id) => {
    const result = await del(`/Company/${id}`);
    cacheManager.invalidate('companies');
    cacheManager.invalidate(`company-${id}`);
    return result;
  },
};

export const imageApi = {
  // 上传设备图片
  uploadEquipmentImage: async (equipmentId, equipmentType, formData) => {
    return await post('/Image/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取设备图片列表
  getEquipmentImages: async (equipmentId, equipmentType) => {
    return await get(`/Image/equipment/${equipmentId}?equipmentType=${equipmentType}`);
  },

  // 删除设备图片
  deleteEquipmentImage: async (imageId) => {
    return await del(`/Image/equipment/${imageId}`);
  },

  // 上传出入库图片
  uploadInOutboundImage: async (orderId, orderType, formData) => {
    formData.append('orderId', orderId);
    formData.append('orderType', orderType === 'outbound' ? 1 : 2);
    return await post('/Image/in-outbound', formData);
  },

  // 获取出入库图片列表
  getInOutboundImages: async (orderId, orderType) => {
    return await get(`/Image/in-outbound/${orderId}?orderType=${orderType}`);
  },

  // 删除出入库图片
  deleteInOutboundImage: async (imageId) => {
    return await del(`/Image/in-outbound/${imageId}`);
  },
};

export const projectOutboundApi = {
  // 获取项目出库列表
  getProjectOutbounds: async (useCache = true) => {
    return await cachedRequest('project-outbounds', () => 
      get('/ProjectOutbound'), useCache);
  },

  // 获取单个项目出库详情
  getProjectOutbound: async (id) => {
    return await cachedRequest(`project-outbound-${id}`, () => 
      get(`/ProjectOutbound/${id}`));
  },

  // 创建项目出库
  createProjectOutbound: async (outbound) => {
    const result = await post('/ProjectOutbound', outbound);
    cacheManager.invalidate('project-outbounds');
    return result;
  },

  // 确认出库
  completeProjectOutbound: async (id) => {
    const result = await put(`/ProjectOutbound/${id}/complete`);
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },

  // 删除项目出库
  deleteProjectOutbound: async (id) => {
    const result = await del(`/ProjectOutbound/${id}`);
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },

  // 更新项目出库
  updateProjectOutbound: async (id, outbound) => {
    const result = await put(`/ProjectOutbound/${id}`, outbound);
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },
};

// 导出缓存管理器供外部使用
export { cacheManager };

// 暴露到全局，供其他组件使用
if (typeof window !== 'undefined') {
  window.cacheManager = cacheManager;
}
