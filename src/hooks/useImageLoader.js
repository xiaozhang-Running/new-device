import { useState, useCallback, useRef, useEffect } from 'react'
import { imageApi, cacheManager } from '../services/api'
import { getImageUrl } from '../config/api.js'

// 全局已加载设备ID缓存（按设备类型分组）
const globalLoadedSet = new Map()

/**
 * 获取设备类型的全局已加载集合
 * @param {number} equipmentType - 设备类型
 * @returns {Set} 已加载设备ID集合
 */
const getGlobalLoadedSet = (equipmentType) => {
  if (!globalLoadedSet.has(equipmentType)) {
    globalLoadedSet.set(equipmentType, new Set())
  }
  return globalLoadedSet.get(equipmentType)
}

/**
 * 通用图片加载Hook
 * @param {Object} options - 配置选项
 * @param {number} options.equipmentType - 设备类型（1:专用设备, 2:通用设备, 3:耗材, 4:原材料）
 * @param {string} options.defaultImage - 默认图片URL
 * @param {number} options.loadDelay - 加载延迟毫秒数（默认100ms）
 * @param {boolean} options.lazyLoad - 是否延迟加载（默认true）
 */
export const useImageLoader = (options) => {
  const optionsRef = useRef(options)

  // 更新optionsRef，但不触发重新渲染
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const { equipmentType = 1 } = options || {}

  // 使用全局缓存来跟踪已加载的设备ID
  const loadedSetRef = useRef(getGlobalLoadedSet(equipmentType))
  const loadingSetRef = useRef(new Set())
  const lastLoadTimeRef = useRef(new Map()) // 记录每个设备的最后加载时间，用于防抖
  const abortControllersRef = useRef(new Map()) // 用于存储每个设备的AbortController，用于取消请求

  const [imagesMap, setImagesMap] = useState(() => {
    // 从API缓存中恢复图片数据
    const restoredMap = new Map()
    const cachePrefix = `equipment-images-`
    const loadedSet = getGlobalLoadedSet(equipmentType)
    
    for (const [key, value] of cacheManager.getAll?.() || []) {
      if (key.startsWith(cachePrefix)) {
        const match = key.match(/equipment-images-(\d+)-(\d+)/)
        if (match && parseInt(match[2]) === equipmentType) {
          const id = parseInt(match[1])
          if (value && value.length > 0) {
            restoredMap.set(id, {
              images: value.map(img => ({
                id: img.Id || img.id,
                url: buildImageUrlStatic(img.Id || img.id)
              })),
              mainImage: buildImageUrlStatic(value[0].Id || value[0].id)
            })
            // 同步更新全局已加载集合
            loadedSet.add(id)
          }
        }
      }
    }
    return restoredMap
  })

  const [loadingSet, setLoadingSet] = useState(new Set())
  const imagesMapRef = useRef(imagesMap)

  // 当loadingSet变化时，更新ref
  useEffect(() => {
    loadingSetRef.current = loadingSet
  }, [loadingSet])



  // 当imagesMap变化时，更新ref
  useEffect(() => {
    imagesMapRef.current = imagesMap
  }, [imagesMap])

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 取消所有正在进行的请求
      for (const [equipmentId, abortController] of abortControllersRef.current.entries()) {
        abortController.abort()
      }
      abortControllersRef.current.clear()
    }
  }, [])

  /**
   * 构建图片完整URL（静态版本）
   */
  const buildImageUrlStatic = (imageId) => {
    return getImageUrl(imageId)
  }

  /**
   * 构建图片完整URL
   */
  const buildImageUrl = useCallback((imageId) => {
    return buildImageUrlStatic(imageId)
  }, [])

  /**
   * 加载单个设备的图片
   */
  const loadImages = useCallback(async (equipmentId) => {
    // 避免重复加载或并发请求
    // 只使用 loadedSetRef 和 loadingSetRef 进行检查，避免 imagesMap 状态变化导致的重复请求
    if (loadedSetRef.current.has(equipmentId) || loadingSetRef.current.has(equipmentId)) {
      return imagesMapRef.current.get(equipmentId) || null
    }

    // 防抖：避免短时间内重复请求
    const now = Date.now()
    const lastLoadTime = lastLoadTimeRef.current.get(equipmentId)
    if (lastLoadTime && now - lastLoadTime < 1000) { // 1秒内防抖
      console.log(`[Image Loader Debounce] Skipping load for equipment ${equipmentId}`)
      return null
    }

    // 创建AbortController用于取消请求
    const abortController = new AbortController()
    abortControllersRef.current.set(equipmentId, abortController)

    // 标记为加载中
    setLoadingSet(prev => new Set(prev).add(equipmentId))
    loadingSetRef.current.add(equipmentId)
    lastLoadTimeRef.current.set(equipmentId, now)

    try {
      const { equipmentType = 1, defaultImage = null } = optionsRef.current
      const equipmentImages = await imageApi.getEquipmentImages(equipmentId, equipmentType, abortController.signal)

      if (equipmentImages && equipmentImages.length > 0) {
        const images = equipmentImages.map(img => ({
          id: img.Id || img.id,
          url: buildImageUrl(img.Id || img.id)
        }))

        const result = {
          images,
          mainImage: images[0].url
        }

        setImagesMap(prev => new Map(prev).set(equipmentId, result))
      } else {
        // 即使没有图片，也要设置空数组，避免重复请求
        setImagesMap(prev => new Map(prev).set(equipmentId, {
          images: [],
          mainImage: defaultImage || null
        }))
      }

      // 无论是否有图片，都标记为已加载，避免重复请求
      loadedSetRef.current.add(equipmentId)

      return imagesMapRef.current.get(equipmentId)
    } catch (error) {
      // 检查是否是取消请求的错误
      if (error.name !== 'AbortError') {
        // 即使出错，也要标记为已加载，避免重复请求
        loadedSetRef.current.add(equipmentId)
        // 静默处理图片加载失败，避免控制台被错误信息填满
      }
    } finally {
      // 移除加载中状态
      setLoadingSet(prev => {
        const newSet = new Set(prev)
        newSet.delete(equipmentId)
        return newSet
      })
      loadingSetRef.current.delete(equipmentId)
      // 清理AbortController
      abortControllersRef.current.delete(equipmentId)
    }

    return null
  }, [buildImageUrl])

  /**
   * 批量加载图片（带延迟和并发限制）
   */
  const loadImagesBatch = useCallback((equipmentIds) => {
    // 过滤掉已经加载或正在加载的设备
    const unloadedIds = equipmentIds.filter(id =>
      !loadedSetRef.current.has(id) && !loadingSetRef.current.has(id)
    )

    if (unloadedIds.length === 0) {
      return
    }

    const { lazyLoad = true, loadDelay = 200 } = optionsRef.current

    // 限制并发请求数量
    const MAX_CONCURRENT = 3
    let activeRequests = 0
    let index = 0

    const loadNext = () => {
      if (index >= unloadedIds.length || activeRequests >= MAX_CONCURRENT) {
        return
      }

      const id = unloadedIds[index]
      index++

      if (!loadedSetRef.current.has(id) && !loadingSetRef.current.has(id)) {
        activeRequests++
        loadImages(id).finally(() => {
          activeRequests--
          // 延迟一下再加载下一个，避免请求过于密集
          setTimeout(loadNext, 100)
        })
      }
    }

    // 启动初始并发请求
    for (let i = 0; i < MAX_CONCURRENT && i < unloadedIds.length; i++) {
      setTimeout(loadNext, i * loadDelay)
    }
  }, [loadImages])

  /**
   * 获取设备的图片信息
   */
  const getEquipmentImages = useCallback((equipmentId) => {
    const defaultImage = optionsRef.current.defaultImage || null
    return imagesMapRef.current.get(equipmentId) || {
      images: [],
      mainImage: defaultImage
    }
  }, [])

  /**
   * 检查是否正在加载
   */
  const isLoading = useCallback((equipmentId) => {
    return loadingSet.has(equipmentId)
  }, [loadingSet])

  /**
   * 检查是否已加载
   */
  const isLoaded = useCallback((equipmentId) => {
    return loadedSetRef.current.has(equipmentId)
  }, [])

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    setImagesMap(new Map())
    loadedSetRef.current.clear()
    setLoadingSet(new Set())
  }, [])

  /**
   * 刷新单个设备的图片
   */
  const refreshImages = useCallback(async (equipmentId) => {
    loadedSetRef.current.delete(equipmentId)
    // 同时清除 imagesMap 中的缓存，确保重新加载
    setImagesMap(prev => {
      const newMap = new Map(prev)
      newMap.delete(equipmentId)
      return newMap
    })
    return loadImages(equipmentId)
  }, [loadImages])

  return {
    imagesMap,
    loadingSet,
    loadImages,
    loadImagesBatch,
    getEquipmentImages,
    buildImageUrl,
    isLoading,
    isLoaded,
    clearCache,
    refreshImages
  }
}

/**
 * 图片预览管理Hook
 */
export const useImagePreview = () => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  /**
   * 打开图片预览
   */
  const openPreview = useCallback((images, startIndex = 0) => {
    setPreviewImages(images)
    setCurrentImageIndex(startIndex)
    setPreviewVisible(true)
  }, [])

  /**
   * 关闭图片预览
   */
  const closePreview = useCallback(() => {
    setPreviewVisible(false)
    setPreviewImages([])
    setCurrentImageIndex(0)
  }, [])

  /**
   * 切换到下一张图片
   */
  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev =>
      prev < previewImages.length - 1 ? prev + 1 : 0
    )
  }, [previewImages.length])

  /**
   * 切换到上一张图片
   */
  const prevImage = useCallback(() => {
    setCurrentImageIndex(prev =>
      prev > 0 ? prev - 1 : previewImages.length - 1
    )
  }, [previewImages.length])

  return {
    previewVisible,
    previewImages,
    currentImageIndex,
    openPreview,
    closePreview,
    nextImage,
    prevImage,
    setCurrentImageIndex
  }
}

export default useImageLoader
