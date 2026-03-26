import { get, post, put, del } from './request';

export const deviceApi = {
  // 获取专用设备列表
  getSpecialEquipments: async () => {
    return await get('/Device/special-equipments');
  },

  // 获取单个设备详情
  getSpecialEquipment: async (id) => {
    return await get(`/Device/special-equipments/${id}`);
  },

  // 创建新设备
  createSpecialEquipment: async (device) => {
    return await post('/Device/special-equipments', device);
  },

  // 更新设备
  updateSpecialEquipment: async (id, device) => {
    return await put(`/Device/special-equipments/${id}`, device);
  },

  // 删除设备
  deleteSpecialEquipment: async (id) => {
    return await del(`/Device/special-equipments/${id}`);
  },

  // 清空所有专用设备
  clearAllSpecialEquipments: async () => {
    return await del('/Device/special-equipments');
  },

  // 获取通用设备列表
  getGeneralEquipments: async () => {
    return await get('/Device/general-equipments');
  },

  // 获取单个通用设备详情
  getGeneralEquipment: async (id) => {
    return await get(`/Device/general-equipments/${id}`);
  },

  // 创建新通用设备
  createGeneralEquipment: async (device) => {
    return await post('/Device/general-equipments', device);
  },

  // 更新通用设备
  updateGeneralEquipment: async (id, device) => {
    return await put(`/Device/general-equipments/${id}`, device);
  },

  // 删除通用设备
  deleteGeneralEquipment: async (id) => {
    return await del(`/Device/general-equipments/${id}`);
  },

  // 清空所有通用设备
  clearAllGeneralEquipments: async () => {
    return await del('/Device/general-equipments');
  },

  // 从库存表获取专用设备（用于出库单）
  getSpecialInventoryDevices: async () => {
    return await get('/Device/inventory/special');
  },

  // 从库存表获取通用设备（用于出库单）
  getGeneralInventoryDevices: async () => {
    return await get('/Device/inventory/general');
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
  getConsumables: async () => {
    return await get('/Consumable');
  },

  // 获取原材料列表
  getRawMaterials: async () => {
    return await get('/RawMaterials');
  },
};

export const userApi = {
  // 登录
  login: async (credentials) => {
    return await post('/Auth/login', credentials);
  },
};

export const warehouseApi = {
  // 获取仓库列表
  getWarehouses: async () => {
    return await get('/Warehouse');
  },

  // 获取单个仓库详情
  getWarehouse: async (id) => {
    return await get(`/Warehouse/${id}`);
  },

  // 创建新仓库
  createWarehouse: async (warehouse) => {
    return await post('/Warehouse', warehouse);
  },

  // 更新仓库
  updateWarehouse: async (id, warehouse) => {
    return await put(`/Warehouse/${id}`, warehouse);
  },

  // 删除仓库
  deleteWarehouse: async (id) => {
    return await del(`/Warehouse/${id}`);
  },
};

export const companyApi = {
  // 获取公司列表
  getCompanies: async () => {
    return await get('/Company');
  },

  // 获取单个公司详情
  getCompany: async (id) => {
    return await get(`/Company/${id}`);
  },

  // 创建新公司
  createCompany: async (company) => {
    return await post('/Company', company);
  },

  // 更新公司
  updateCompany: async (id, company) => {
    return await put(`/Company/${id}`, company);
  },

  // 删除公司
  deleteCompany: async (id) => {
    return await del(`/Company/${id}`);
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
    return await post('/Image/in-outbound', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
  getProjectOutbounds: async () => {
    return await get('/ProjectOutbound');
  },

  // 获取单个项目出库详情
  getProjectOutbound: async (id) => {
    return await get(`/ProjectOutbound/${id}`);
  },

  // 创建项目出库
  createProjectOutbound: async (outbound) => {
    return await post('/ProjectOutbound', outbound);
  },

  // 确认出库
  completeProjectOutbound: async (id) => {
    return await put(`/ProjectOutbound/${id}/complete`);
  },

  // 删除项目出库
  deleteProjectOutbound: async (id) => {
    return await del(`/ProjectOutbound/${id}`);
  },
};