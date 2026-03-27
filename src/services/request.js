// 统一的请求封装函数
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api';

// 请求超时时间
const TIMEOUT = 30000;

// 统一的请求函数
const request = async (url, options = {}) => {
  // 设置默认选项
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 合并选项
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
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
    return request(url, {
      ...options,
      method: 'POST',
      body: data,
      // 移除Content-Type，让浏览器自动处理
      headers: {
        ...options.headers,
        'Content-Type': undefined,
      },
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
  });
};

export const del = (url, options = {}) => {
  return request(url, {
    ...options,
    method: 'DELETE',
  });
};

export default request;