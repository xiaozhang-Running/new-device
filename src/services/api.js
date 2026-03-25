const API_BASE_URL = 'http://localhost:5054/api';

export const deviceApi = {
  // 获取专用设备列表
  getSpecialEquipments: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments`);
    if (!response.ok) throw new Error('获取设备列表失败');
    return await response.json();
  },

  // 获取单个设备详情
  getSpecialEquipment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments/${id}`);
    if (!response.ok) throw new Error('获取设备详情失败');
    return await response.json();
  },

  // 创建新设备
  createSpecialEquipment: async (device) => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建设备失败');
      } catch (e) {
        throw new Error('创建设备失败');
      }
    }
    return await response.json();
  },

  // 更新设备
  updateSpecialEquipment: async (id, device) => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) throw new Error('更新设备失败');
    return await response.json();
  },

  // 删除设备
  deleteSpecialEquipment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除设备失败');
  },

  // 清空所有专用设备
  clearAllSpecialEquipments: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/special-equipments`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('清空设备失败');
  },

  // 获取通用设备列表
  getGeneralEquipments: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments`);
    if (!response.ok) throw new Error('获取通用设备列表失败');
    return await response.json();
  },

  // 获取单个通用设备详情
  getGeneralEquipment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments/${id}`);
    if (!response.ok) throw new Error('获取通用设备详情失败');
    return await response.json();
  },

  // 创建新通用设备
  createGeneralEquipment: async (device) => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建通用设备失败');
      } catch (e) {
        throw new Error('创建通用设备失败');
      }
    }
    return await response.json();
  },

  // 更新通用设备
  updateGeneralEquipment: async (id, device) => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) throw new Error('更新通用设备失败');
    return await response.json();
  },

  // 删除通用设备
  deleteGeneralEquipment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除通用设备失败');
  },

  // 清空所有通用设备
  clearAllGeneralEquipments: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/general-equipments`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('清空通用设备失败');
  },

  // 从库存表获取专用设备（用于出库单）
  getSpecialInventoryDevices: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/inventory/special`);
    if (!response.ok) throw new Error('获取库存专用设备失败');
    return await response.json();
  },

  // 从库存表获取通用设备（用于出库单）
  getGeneralInventoryDevices: async () => {
    const response = await fetch(`${API_BASE_URL}/Device/inventory/general`);
    if (!response.ok) throw new Error('获取库存通用设备失败');
    return await response.json();
  },

  // 获取专用设备详细清单
  getSpecialEquipmentDetails: async (deviceName, brand) => {
    const url = new URL(`${API_BASE_URL}/Device/special-equipment-details`);
    url.searchParams.append('deviceName', deviceName);
    if (brand) {
      url.searchParams.append('brand', brand);
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取专用设备详情失败');
    return await response.json();
  },

  // 获取通用设备详细清单
  getGeneralEquipmentDetails: async (deviceName, brand) => {
    const url = new URL(`${API_BASE_URL}/Device/general-equipment-details`);
    url.searchParams.append('deviceName', deviceName);
    if (brand) {
      url.searchParams.append('brand', brand);
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取通用设备详情失败');
    return await response.json();
  },

  // 获取耗材列表
  getConsumables: async () => {
    const response = await fetch(`${API_BASE_URL}/RawMaterials`);
    if (!response.ok) throw new Error('获取耗材列表失败');
    return await response.json();
  },
};

export const userApi = {
  // 登录
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('登录失败');
    return await response.json();
  },
};

export const warehouseApi = {
  // 获取仓库列表
  getWarehouses: async () => {
    const response = await fetch(`${API_BASE_URL}/Warehouse`);
    if (!response.ok) throw new Error('获取仓库列表失败');
    return await response.json();
  },

  // 获取单个仓库详情
  getWarehouse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Warehouse/${id}`);
    if (!response.ok) throw new Error('获取仓库详情失败');
    return await response.json();
  },

  // 创建新仓库
  createWarehouse: async (warehouse) => {
    const response = await fetch(`${API_BASE_URL}/Warehouse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    if (!response.ok) throw new Error('创建仓库失败');
    return await response.json();
  },

  // 更新仓库
  updateWarehouse: async (id, warehouse) => {
    const response = await fetch(`${API_BASE_URL}/Warehouse/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouse),
    });
    if (!response.ok) throw new Error('更新仓库失败');
  },

  // 删除仓库
  deleteWarehouse: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Warehouse/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除仓库失败');
  },
};

export const companyApi = {
  // 获取公司列表
  getCompanies: async () => {
    const response = await fetch(`${API_BASE_URL}/Company`);
    if (!response.ok) throw new Error('获取公司列表失败');
    return await response.json();
  },

  // 获取单个公司详情
  getCompany: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Company/${id}`);
    if (!response.ok) throw new Error('获取公司详情失败');
    return await response.json();
  },

  // 创建新公司
  createCompany: async (company) => {
    const response = await fetch(`${API_BASE_URL}/Company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    });
    if (!response.ok) throw new Error('创建公司失败');
    return await response.json();
  },

  // 更新公司
  updateCompany: async (id, company) => {
    const response = await fetch(`${API_BASE_URL}/Company/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    });
    if (!response.ok) throw new Error('更新公司失败');
  },

  // 删除公司
  deleteCompany: async (id) => {
    const response = await fetch(`${API_BASE_URL}/Company/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除公司失败');
  },
};

export const imageApi = {
  // 上传设备图片
  uploadEquipmentImage: async (equipmentId, equipmentType, formData) => {
    const response = await fetch(`${API_BASE_URL}/Image/equipment`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('上传设备图片失败');
    return await response.json();
  },

  // 获取设备图片列表
  getEquipmentImages: async (equipmentId, equipmentType) => {
    const response = await fetch(`${API_BASE_URL}/Image/equipment/${equipmentId}?equipmentType=${equipmentType}`);
    if (!response.ok) throw new Error('获取设备图片列表失败');
    return await response.json();
  },

  // 删除设备图片
  deleteEquipmentImage: async (imageId) => {
    const response = await fetch(`${API_BASE_URL}/Image/equipment/${imageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除设备图片失败');
  },

  // 上传出入库图片
  uploadInOutboundImage: async (orderId, orderType, formData) => {
    const response = await fetch(`${API_BASE_URL}/Image/in-outbound`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('上传出入库图片失败');
    return await response.json();
  },

  // 获取出入库图片列表
  getInOutboundImages: async (orderId, orderType) => {
    const response = await fetch(`${API_BASE_URL}/Image/in-outbound/${orderId}?orderType=${orderType}`);
    if (!response.ok) throw new Error('获取出入库图片列表失败');
    return await response.json();
  },

  // 删除出入库图片
  deleteInOutboundImage: async (imageId) => {
    const response = await fetch(`${API_BASE_URL}/Image/in-outbound/${imageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除出入库图片失败');
  },
};