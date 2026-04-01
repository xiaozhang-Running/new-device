import { get, post, put, del } from './request';
import { message } from 'antd';

// 内存缓存配置
const CACHE_CONFIG = {
  DURATION: 30 * 1000, // 30秒缓存（减少多用户场景下的数据不一致）
  MAX_SIZE: 100, // 最大缓存条目数
  CLEANUP_INTERVAL: 1 * 60 * 1000 // 1分钟清理一次过期缓存
};

// 简单的内存缓存
const cache = new Map();

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now - item.timestamp > CACHE_CONFIG.DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_CONFIG.CLEANUP_INTERVAL);

// 缓存管理器
const cacheManager = {
  get: (key) => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_CONFIG.DURATION) {
      return item.data;
    }
    cache.delete(key);
    return null;
  },
  set: (key, data) => {
    // 检查缓存大小，超过限制时删除最旧的条目
    if (cache.size >= CACHE_CONFIG.MAX_SIZE) {
      const oldestKey = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
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
  },
  size: () => cache.size,
  stats: () => {
    const now = Date.now();
    const valid = [...cache.entries()].filter(([_, item]) => now - item.timestamp < CACHE_CONFIG.DURATION).length;
    return {
      total: cache.size,
      valid,
      invalid: cache.size - valid
    };
  },
  // 获取所有缓存条目（用于恢复状态）
  getAll: () => {
    const result = new Map();
    const now = Date.now();
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp < CACHE_CONFIG.DURATION) {
        result.set(key, item.data);
      }
    }
    return result;
  }
};

// 带缓存和错误处理的API请求包装器
const cachedRequest = async (key, requestFn, useCache = true, options = {}) => {
  const { showError = true, retry = 0, retryDelay = 1000 } = options;
  
  if (useCache) {
    const cached = cacheManager.get(key);
    if (cached) {
      console.log(`[Cache Hit] ${key}`);
      return cached;
    }
  }

  let lastError;
  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[API Retry] ${key} (attempt ${attempt}/${retry})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
      
      const data = await requestFn();
      if (useCache) {
        cacheManager.set(key, data);
      }
      console.log(`[API Success] ${key}`);
      return data;
    } catch (error) {
      lastError = error;
      console.error(`[API Error] ${key} (attempt ${attempt}/${retry}):`, error);
      
      // 检查是否是404错误
      if (error.response && error.response.status === 404) {
        console.log(`[API 404] ${key}: 资源不存在`);
        return null; // 对于404错误，返回null而不是抛出异常
      }
      
      // 最后一次尝试失败时显示错误
      if (attempt === retry && showError) {
        message.error(error.message || '请求失败，请稍后重试');
      }
    }
  }
  
  throw lastError;
};

export const deviceApi = {
  // 获取专用设备列表
  getSpecialEquipments: async (useCache = false) => {
    return await cachedRequest('special-equipments', () => 
      get('/Device/special-equipments'), useCache, { retry: 1 });
  },

  // 获取单个设备详情
  getSpecialEquipment: async (id) => {
    return await cachedRequest(`special-equipment-${id}`, () => 
      get(`/Device/special-equipments/${id}`), true, { retry: 1, showError: false });
  },

  // 创建新设备
  createSpecialEquipment: async (device) => {
    const result = await cachedRequest('create-special-equipment', () => 
      post('/Device/special-equipments', device), false, { retry: 1 });
    cacheManager.invalidate('special-equipments');
    return result;
  },

  // 更新设备
  updateSpecialEquipment: async (id, device) => {
    const result = await cachedRequest(`update-special-equipment-${id}`, () => 
      put(`/Device/special-equipments/${id}`, device), false, { retry: 1 });
    cacheManager.invalidate('special-equipments');
    cacheManager.invalidate(`special-equipment-${id}`);
    return result;
  },

  // 删除设备
  deleteSpecialEquipment: async (id) => {
    const result = await cachedRequest(`delete-special-equipment-${id}`, () => 
      del(`/Device/special-equipments/${id}`), false, { retry: 1 });
    cacheManager.invalidate('special-equipments');
    cacheManager.invalidate(`special-equipment-${id}`);
    return result;
  },

  // 清空所有专用设备
  clearAllSpecialEquipments: async () => {
    const result = await cachedRequest('clear-special-equipments', () => 
      del('/Device/special-equipments'), false, { retry: 1 });
    cacheManager.invalidate('special-equipments');
    return result;
  },

  // 获取通用设备列表
  getGeneralEquipments: async (useCache = false) => {
    return await cachedRequest('general-equipments', () => 
      get('/Device/general-equipments'), useCache, { retry: 1 });
  },

  // 获取单个通用设备详情
  getGeneralEquipment: async (id) => {
    return await cachedRequest(`general-equipment-${id}`, () => 
      get(`/Device/general-equipments/${id}`), true, { retry: 1, showError: false });
  },

  // 创建新通用设备
  createGeneralEquipment: async (device) => {
    const result = await cachedRequest('create-general-equipment', () => 
      post('/Device/general-equipments', device), false, { retry: 1 });
    cacheManager.invalidate('general-equipments');
    return result;
  },

  // 更新通用设备
  updateGeneralEquipment: async (id, device) => {
    const result = await cachedRequest(`update-general-equipment-${id}`, () => 
      put(`/Device/general-equipments/${id}`, device), false, { retry: 1 });
    cacheManager.invalidate('general-equipments');
    cacheManager.invalidate(`general-equipment-${id}`);
    return result;
  },

  // 删除通用设备
  deleteGeneralEquipment: async (id) => {
    const result = await cachedRequest(`delete-general-equipment-${id}`, () => 
      del(`/Device/general-equipments/${id}`), false, { retry: 1 });
    cacheManager.invalidate('general-equipments');
    cacheManager.invalidate(`general-equipment-${id}`);
    return result;
  },

  // 清空所有通用设备
  clearAllGeneralEquipments: async () => {
    const result = await cachedRequest('clear-general-equipments', () => 
      del('/Device/general-equipments'), false, { retry: 1 });
    cacheManager.invalidate('general-equipments');
    return result;
  },

  // 从库存表获取专用设备（用于出库单）
  getSpecialInventoryDevices: async (useCache = true) => {
    return await cachedRequest('special-inventory-devices', () => 
      get('/Device/inventory/special'), useCache, { retry: 1 });
  },

  // 从库存表获取通用设备（用于出库单）
  getGeneralInventoryDevices: async (useCache = true) => {
    return await cachedRequest('general-inventory-devices', () => 
      get('/Device/inventory/general'), useCache, { retry: 1 });
  },

  // 获取专用设备详细清单
  getSpecialEquipmentDetails: async (deviceName, brand, useCache = false) => {
    const cacheKey = `special-equipment-details-${deviceName}-${brand || ''}`;
    let url = `/Device/special-equipment-details?deviceName=${encodeURIComponent(deviceName)}`;
    if (brand) {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    return await cachedRequest(cacheKey, () => get(url), useCache, { retry: 1 });
  },

  // 获取通用设备详细清单
  getGeneralEquipmentDetails: async (deviceName, brand, useCache = false) => {
    const cacheKey = `general-equipment-details-${deviceName}-${brand || ''}`;
    let url = `/Device/general-equipment-details?deviceName=${encodeURIComponent(deviceName)}`;
    if (brand) {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    return await cachedRequest(cacheKey, () => get(url), useCache, { retry: 1 });
  },

  // 获取耗材列表
  getConsumables: async (useCache = true) => {
    return await cachedRequest('consumables', () => 
      get('/Consumable'), useCache, { retry: 1 });
  },

  // 获取原材料列表
  getRawMaterials: async (useCache = true) => {
    return await cachedRequest('raw-materials', () => 
      get('/RawMaterials'), useCache, { retry: 1 });
  },

  // 清除所有缓存
  clearCache: () => {
    cacheManager.clear();
  },

  // 获取缓存状态
  getCacheStats: () => {
    return cacheManager.stats();
  }
};

export const userApi = {
  // 登录
  login: async (credentials) => {
    try {
      const result = await cachedRequest('login', () => 
        post('/Auth/login', credentials), false, { retry: 1 });
      // 存储token到localStorage（支持大小写不同的字段名）
      const token = result.Token || result.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          username: result.Username || result.username,
          role: result.Role || result.role
        }));
        console.log('API登录成功，token长度:', token.length);
        console.log('API登录成功，token:', token);
      }
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },
  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  // 获取当前用户
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const warehouseApi = {
  // 获取仓库列表
  getWarehouses: async (useCache = true) => {
    return await cachedRequest('warehouses', () => 
      get('/Warehouse'), useCache, { retry: 1 });
  },

  // 获取单个仓库详情
  getWarehouse: async (id) => {
    return await cachedRequest(`warehouse-${id}`, () => 
      get(`/Warehouse/${id}`), true, { retry: 1 });
  },

  // 创建新仓库
  createWarehouse: async (warehouse) => {
    const result = await cachedRequest('create-warehouse', () => 
      post('/Warehouse', warehouse), false, { retry: 1 });
    cacheManager.invalidate('warehouses');
    return result;
  },

  // 更新仓库
  updateWarehouse: async (id, warehouse) => {
    const result = await cachedRequest(`update-warehouse-${id}`, () => 
      put(`/Warehouse/${id}`, warehouse), false, { retry: 1 });
    cacheManager.invalidate('warehouses');
    cacheManager.invalidate(`warehouse-${id}`);
    return result;
  },

  // 删除仓库
  deleteWarehouse: async (id) => {
    const result = await cachedRequest(`delete-warehouse-${id}`, () => 
      del(`/Warehouse/${id}`), false, { retry: 1 });
    cacheManager.invalidate('warehouses');
    cacheManager.invalidate(`warehouse-${id}`);
    return result;
  },
};

export const companyApi = {
  // 获取公司列表
  getCompanies: async (useCache = true) => {
    return await cachedRequest('companies', () => 
      get('/Company'), useCache, { retry: 1 });
  },

  // 获取单个公司详情
  getCompany: async (id) => {
    return await cachedRequest(`company-${id}`, () => 
      get(`/Company/${id}`), true, { retry: 1 });
  },

  // 创建新公司
  createCompany: async (company) => {
    const result = await cachedRequest('create-company', () => 
      post('/Company', company), false, { retry: 1 });
    cacheManager.invalidate('companies');
    return result;
  },

  // 更新公司
  updateCompany: async (id, company) => {
    const result = await cachedRequest(`update-company-${id}`, () => 
      put(`/Company/${id}`, company), false, { retry: 1 });
    cacheManager.invalidate('companies');
    cacheManager.invalidate(`company-${id}`);
    return result;
  },

  // 删除公司
  deleteCompany: async (id) => {
    const result = await cachedRequest(`delete-company-${id}`, () => 
      del(`/Company/${id}`), false, { retry: 1 });
    cacheManager.invalidate('companies');
    cacheManager.invalidate(`company-${id}`);
    return result;
  },
};

export const imageApi = {
  // 上传设备图片
  uploadEquipmentImage: async (equipmentId, equipmentType, formData) => {
    // 添加设备ID和类型到FormData
    formData.append('equipmentId', equipmentId);
    formData.append('equipmentType', equipmentType);
    return await cachedRequest(`upload-equipment-image-${equipmentId}`, () => 
      post('/Image/equipment', formData, {
        // 不设置Content-Type，让浏览器自动设置
      }), false, { retry: 1 });
  },

  // 获取设备图片列表
  getEquipmentImages: async (equipmentId, equipmentType) => {
    return await cachedRequest(`equipment-images-${equipmentId}-${equipmentType}`, () => 
      get(`/Image/equipment/${equipmentId}?equipmentType=${equipmentType}`), true, { retry: 0, showError: false });
  },

  // 删除设备图片
  deleteEquipmentImage: async (imageId) => {
    return await cachedRequest(`delete-equipment-image-${imageId}`, () => 
      del(`/Image/equipment/${imageId}`), false, { retry: 1 });
  },

  // 上传出入库图片
  uploadInOutboundImage: async (orderId, orderType, formData) => {
    // 确保FormData中包含必要的参数
    formData.append('orderId', orderId);
    formData.append('orderType', orderType === 'outbound' ? 1 : 2);
    // 直接传递FormData，让后端处理参数绑定
    // 不设置Content-Type，让浏览器自动处理
    return await cachedRequest(`upload-inoutbound-image-${orderId}-${orderType}`, () => 
      post('/Image/in-outbound', formData), false, { retry: 1 });
  },

  // 获取出入库图片列表
  getInOutboundImages: async (orderId, orderType) => {
    const type = orderType === 'outbound' ? 1 : 2;
    return await cachedRequest(`inoutbound-images-${orderId}-${type}`, () => 
      get(`/Image/in-outbound/${orderId}?orderType=${type}`), true, { retry: 1 });
  },

  // 删除出入库图片
  deleteInOutboundImage: async (imageId) => {
    return await cachedRequest(`delete-inoutbound-image-${imageId}`, () => 
      del(`/Image/in-outbound/${imageId}`), false, { retry: 1 });
  },
};

export const projectOutboundApi = {
  // 获取项目出库列表
  getProjectOutbounds: async (useCache = true) => {
    return await cachedRequest('project-outbounds', () => 
      get('/ProjectOutbound'), useCache, { retry: 1 });
  },

  // 获取单个项目出库详情
  getProjectOutbound: async (id) => {
    return await cachedRequest(`project-outbound-${id}`, () => 
      get(`/ProjectOutbound/${id}`), true, { retry: 1 });
  },

  // 创建项目出库
  createProjectOutbound: async (outbound) => {
    const result = await cachedRequest('create-project-outbound', () => 
      post('/ProjectOutbound', outbound), false, { retry: 1 });
    cacheManager.invalidate('project-outbounds');
    return result;
  },

  // 确认出库
  completeProjectOutbound: async (id) => {
    const result = await cachedRequest(`complete-project-outbound-${id}`, () => 
      put(`/ProjectOutbound/${id}/complete`), false, { retry: 1 });
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },

  // 删除项目出库
  deleteProjectOutbound: async (id) => {
    const result = await cachedRequest(`delete-project-outbound-${id}`, () => 
      del(`/ProjectOutbound/${id}`), false, { retry: 1 });
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },

  // 更新项目出库
  updateProjectOutbound: async (id, outbound) => {
    const result = await cachedRequest(`update-project-outbound-${id}`, () => 
      put(`/ProjectOutbound/${id}`, outbound), false, { retry: 1 });
    cacheManager.invalidate('project-outbounds');
    cacheManager.invalidate(`project-outbound-${id}`);
    return result;
  },
};

export const projectInboundApi = {
  // 获取项目入库列表
  getProjectInbounds: async (useCache = true) => {
    return await cachedRequest('project-inbounds', () => 
      get('/InOutbound/project-inbounds'), useCache, { retry: 1 });
  },

  // 获取单个项目入库详情
  getProjectInbound: async (id) => {
    return await cachedRequest(`project-inbound-${id}`, () => 
      get(`/InOutbound/project-inbounds/${id}`), true, { retry: 1 });
  },

  // 创建项目入库
  createProjectInbound: async (inbound) => {
    const result = await cachedRequest('create-project-inbound', () => 
      post('/InOutbound/project-inbounds', inbound), false, { retry: 1 });
    cacheManager.invalidate('project-inbounds');
    return result;
  },

  // 更新项目入库
  updateProjectInbound: async (id, inbound) => {
    const result = await cachedRequest(`update-project-inbound-${id}`, () => 
      put(`/InOutbound/project-inbounds/${id}`, inbound), false, { retry: 1 });
    cacheManager.invalidate('project-inbounds');
    cacheManager.invalidate(`project-inbound-${id}`);
    return result;
  },

  // 删除项目入库
  deleteProjectInbound: async (id) => {
    const result = await cachedRequest(`delete-project-inbound-${id}`, () => 
      del(`/InOutbound/project-inbounds/${id}`), false, { retry: 1 });
    cacheManager.invalidate('project-inbounds');
    cacheManager.invalidate(`project-inbound-${id}`);
    return result;
  },
};

// 导出缓存管理器供外部使用
export { cacheManager };

// 暴露到全局，供其他组件使用
if (typeof window !== 'undefined') {
  window.cacheManager = cacheManager;
}
