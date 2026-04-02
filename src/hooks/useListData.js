import { useState, useEffect, useCallback, useRef } from 'react'
import { message } from 'antd'

/**
 * 通用列表数据管理Hook
 * @param {Object} options - 配置选项
 * @param {Function} options.fetchApi - 获取数据的API函数
 * @param {Function} options.processData - 处理数据的函数（可选）
 * @param {string} options.errorMessage - 错误提示消息（可选）
 * @param {boolean} options.autoFetch - 是否自动获取数据（默认true）
 * @param {number} options.debounceMs - 防抖延迟毫秒数（默认300）
 */
export const useListData = (options) => {
  const {
    fetchApi,
    processData = (data) => data,
    errorMessage = '获取数据失败',
    autoFetch = true,
    debounceMs = 300
  } = options

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 使用ref来存储防抖定时器
  const debounceTimerRef = useRef(null)
  const abortControllerRef = useRef(null)

  /**
   * 获取数据
   */
  const fetchData = useCallback(async (params = {}) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetchApi(params)
      const processedData = processData(response)
      setData(processedData)
      setFilteredData(processedData)
      return processedData
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(errorMessage, err)
        setError(err.message || errorMessage)
        message.error(errorMessage)
      }
      return []
    } finally {
      setLoading(false)
    }
  }, [fetchApi, processData, errorMessage])

  /**
   * 防抖获取数据
   */
  const debouncedFetchData = useCallback((params = {}) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      fetchData(params)
    }, debounceMs)
  }, [fetchData, debounceMs])

  /**
   * 过滤数据
   */
  const filterData = useCallback((filterFn) => {
    setFilteredData(prev => {
      const filtered = filterFn ? prev.filter(filterFn) : data
      return filtered
    })
  }, [data])

  /**
   * 搜索数据
   */
  const searchData = useCallback((searchText, searchFields) => {
    if (!searchText) {
      setFilteredData(data)
      return
    }
    
    const lowerSearchText = searchText.toLowerCase()
    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(lowerSearchText)
      })
    })
    
    setFilteredData(filtered)
  }, [data])

  /**
   * 更新单条数据
   */
  const updateItem = useCallback((id, updates) => {
    setData(prev => prev.map(item => 
      String(item.id) === String(id) ? { ...item, ...updates } : item
    ))
    setFilteredData(prev => prev.map(item => 
      String(item.id) === String(id) ? { ...item, ...updates } : item
    ))
  }, [])

  /**
   * 删除单条数据
   */
  const deleteItem = useCallback((id) => {
    setData(prev => prev.filter(item => String(item.id) !== String(id)))
    setFilteredData(prev => prev.filter(item => String(item.id) !== String(id)))
  }, [])

  /**
   * 添加数据
   */
  const addItem = useCallback((item) => {
    setData(prev => [item, ...prev])
    setFilteredData(prev => [item, ...prev])
  }, [])

  /**
   * 刷新数据
   */
  const refresh = useCallback(() => {
    return fetchData()
  }, [fetchData])

  // 自动获取数据
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
    
    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [autoFetch, fetchData])

  return {
    data,
    filteredData,
    setFilteredData,
    loading,
    error,
    fetchData,
    debouncedFetchData,
    filterData,
    searchData,
    updateItem,
    deleteItem,
    addItem,
    refresh
  }
}

export default useListData
