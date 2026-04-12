// 统一的请求封装函数
import { API_BASE_URL } from '../config/api.js';

// 请求超时时间
const TIMEOUT = 60000;

// 统一的请求函数
const request = async (config) => {
  let url, options = {}
  
  // 处理两种调用方式
  if (typeof config === 'string') {
    url = config
  } else {
    url = config.url
    options = { ...config }
    delete options.url
    
    // 处理params参数，将其转换为查询字符串
    if (options.params) {
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          params.append(key, value)
        }
      }
      const queryString = params.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
      delete options.params
    }
    
    // 处理data参数，将其转换为body字段
    if (options.data) {
      options.body = JSON.stringify(options.data)
      delete options.data
    }
  }
  // 获取token
  const token = localStorage.getItem('token');
  
  // 验证token是否存在且有效（简单验证）
  console.log('Token:', token);
  console.log('Token长度:', token ? token.length : 0);
  // 假token格式为 fake-token-<role>-<timestamp>，长度会超过10
  // 只检查token是否存在，不检查长度
  // 跳过登录和注册接口的token检查
  if (!token && !url.includes('/Auth/login') && !url.includes('/Auth/register')) {
    // 无token且不是登录/注册请求，跳转到登录页面
    console.log('未找到token，跳转到登录页面');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('请先登录');
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
  } else if (options.headers === null) {
    // 如果显式设置为null，不使用任何headers
    mergedHeaders = undefined;
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

  // 使用传入的signal或控制器的signal
  const signal = mergedOptions.signal || controller.signal;
  
  // 清除mergedOptions中的signal，避免重复传递
  if (mergedOptions.signal) {
    delete mergedOptions.signal;
  }

  try {
    // 发送请求
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...mergedOptions,
      signal: signal,
    });

    // 清除超时
    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
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
        } else {
          // 非JSON响应，直接抛出状态码错误
          throw new Error(`请求失败: ${response.status}`);
        }
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
  return request({
    url,
    ...options,
    method: 'GET',
  });
};

export const post = (url, data, options = {}) => {
  console.log('发送POST请求:', url);
  // 检查是否为FormData对象
  if (data instanceof FormData) {
    console.log('请求数据: FormData对象');
    // 保留token，但不设置Content-Type，让浏览器自动处理
    // 创建一个新的options对象，将headers设置为null
    // 这样request函数就不会使用默认的Content-Type头
    const formDataOptions = {
      ...options,
      headers: null, // 不使用默认的headers
    };
    // 直接使用fetch发送请求，避免request函数的默认headers干扰
    const token = localStorage.getItem('token');
    const fetchOptions = {
      method: 'POST',
      body: data,
      headers: {},
    };
    // 添加Authorization头
    if (token) {
      fetchOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    // 添加其他headers
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        if (key !== 'Content-Type') {
          fetchOptions.headers[key] = options.headers[key];
        }
      });
    }
    // 发送请求
    return fetch(`${API_BASE_URL}${url}`, fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        return response.json();
      });
  } else {
    console.log('请求数据:', JSON.stringify(data, null, 2));
    return request({
      url,
      ...options,
      method: 'POST',
      data: data,
    });
  }
};

export const put = (url, data, options = {}) => {
  const requestOptions = {
    url,
    ...options,
    method: 'PUT',
  };
  
  if (data !== undefined) {
    requestOptions.body = JSON.stringify(data);
  }
  
  return request(requestOptions);
};

export const del = (url, options = {}) => {
  return request({
    url,
    ...options,
    method: 'DELETE',
  });
};

// 为 request 对象添加方法，使其可以像 request.get() 这样使用
request.get = get;
request.post = post;
request.put = put;
request.del = del;

// 同时导出默认和命名导出
export { request };
export default request;