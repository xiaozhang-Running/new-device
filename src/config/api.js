// API配置文件
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 确保API_BASE_URL格式正确
export const getApiUrl = (endpoint) => {
  // 确保endpoint以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // 确保API_BASE_URL不以/结尾
  const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${normalizedBaseUrl}${normalizedEndpoint}`;
};

// 图片API相关
export const getImageUrl = (imageId) => {
  // 直接使用API_BASE_URL构建图片URL
  const normalizedBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${normalizedBaseUrl}/Image/data/${imageId}`;
};