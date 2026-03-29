// 统一的请求封装函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api';

// 请求超时时间
const TIMEOUT = 30000;

// 统一的请求函数
const request = async (url, options = {}) => {
  // 获取token
  const token = localStorage.getItem('token');
  
  // 验证token是否存在且有效（简单验证）
  if (token && token.length < 10) {
    // 无效token，清除并重新登录
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('登录已过期，请重新登录');
  }
  
  // 设置默认选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'X-Request-Id': generateRequestId(),
      'X-Timestamp': Date.now().toString(),
    },
  };

  // 合并选项
  let mergedHeaders;
  if (options.headers === undefined) {
    // 如果没有设置headers，使用默认的headers
    mergedHeaders = defaultOptions.headers;
  } else {
    // 否则合并默认headers和传入的headers
    mergedHeaders = {
      ...defaultOptions.headers,
      ...options.headers,
    };
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: mergedHeaders,
  };

  // 创建AbortController来处理超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...mergedOptions,
      signal: controller.signal,
    });

    // 清除超时
    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error('后端错误:', JSON.stringify(errorData, null, 2));
        
        // 处理401未授权错误
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          throw new Error('登录已过期，请重新登录');
        }
        
        throw new Error(errorData.message || `请求失败: ${response.status}`);
      } catch (e) {
        console.error('请求错误:', e);
        throw new Error(`请求失败: ${response.status}`);
      }
    }

    // 检查响应是否为空
    const contentType = response.headers.get('content-type');
    try {
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (e) {
      console.error('解析响应失败:', e);
      return await response.text();
    }
  } catch (error) {
    // 清除超时
    clearTimeout(timeoutId);

    // 处理中止错误
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }

    throw error;
  }
};

// 生成请求ID
const generateRequestId = () => {
  return 'req_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 导出请求方法
export const get = (url, options = {}) => {
  return request(url, {
    ...options,
    method: 'GET',
  });
};

export const post = (url, data, options = {}) => {
  console.log('发送POST请求:', url);
  // 检查是否为FormData对象
  if (data instanceof FormData) {
    console.log('请求数据: FormData对象');
    // 完全覆盖headers，不使用默认的application/json
    return request(url, {
      ...options,
      method: 'POST',
      body: data,
      // 完全不设置headers，让浏览器自动处理
      headers: undefined,
    });
  } else {
    console.log('请求数据:', JSON.stringify(data, null, 2));
    return request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const put = (url, data, options = {}) => {
  return request(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
};

export const del = (url, options = {}) => {
  return request(url, {
    ...options,
    method: 'DELETE',
  });
};

// 同时导出默认和命名导出
export { request };
export default request;