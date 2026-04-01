import { useState, useCallback, useRef, useEffect } from 'react'
import { imageApi, cacheManager } from '../services/api'

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
  })

  const { equipmentType = 1 } = options || {}

  // 使用全局缓存来跟踪已加载的设备ID
  const loadedSetRef = useRef(getGlobalLoadedSet(equipmentType))
  const loadingSetRef = useRef(new Set())
  const lastLoadTimeRef = useRef(new Map()) // 记录每个设备的最后加载时间，用于防抖

  const [imagesMap, setImagesMap] = useState(() => {
    // 从API缓存中恢复图片数据
    const restoredMap = new Map()
    const cachePrefix = `equipment-images-`
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

  /**
   * 获取图片URL（处理双斜杠问题）
   */
  const getImageUrl = useCallback((imageUrl) => {
    const defaultImg = optionsRef.current.defaultImage || ''
    if (!imageUrl) return defaultImg || null
    return imageUrl.replace(/\/api\/api\//g, '/api/') || defaultImg || null
  }, [])

  // 当imagesMap变化时，更新ref
  useEffect(() => {
    imagesMapRef.current = imagesMap
  }, [imagesMap])

  /**
   * 构建图片完整URL（静态版本）
   */
  const buildImageUrlStatic = (imageId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055'
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '')
    return `${cleanBaseUrl}/api/Image/data/${imageId}`
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
    if (loadedSetRef.current.has(equipmentId) || loadingSetRef.current.has(equipmentId)) {
      return null
    }

    // 防抖：避免短时间内重复请求
    const now = Date.now()
    const lastLoadTime = lastLoadTimeRef.current.get(equipmentId)
    if (lastLoadTime && now - lastLoadTime < 1000) { // 1秒内防抖
      console.log(`[Image Loader Debounce] Skipping load for equipment ${equipmentId}`)
      return null
    }

    // 标记为加载中
    setLoadingSet(prev => new Set(prev).add(equipmentId))
    loadingSetRef.current.add(equipmentId)
    lastLoadTimeRef.current.set(equipmentId, now)

    try {
      const { equipmentType = 1, defaultImage = '' } = optionsRef.current
      const equipmentImages = await imageApi.getEquipmentImages(equipmentId, equipmentType)

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
          mainImage: defaultImage
        }))
      }

      // 无论是否有图片，都标记为已加载，避免重复请求
      loadedSetRef.current.add(equipmentId)

      return imagesMapRef.current.get(equipmentId)
    } catch (error) {
      // 即使出错，也要标记为已加载，避免重复请求
      loadedSetRef.current.add(equipmentId)
      // 静默处理图片加载失败，避免控制台被错误信息填满
    } finally {
      // 移除加载中状态
      setLoadingSet(prev => {
        const newSet = new Set(prev)
        newSet.delete(equipmentId)
        return newSet
      })
      loadingSetRef.current.delete(equipmentId)
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

    const { lazyLoad = true, loadDelay = 100 } = optionsRef.current

    if (!lazyLoad) {
      // 立即加载所有，但添加小延迟避免并发过多
      unloadedIds.forEach((id, index) => {
        setTimeout(() => {
          loadImages(id)
        }, index * 50) // 50ms延迟
      })
      return
    }

    // 使用 requestIdleCallback 或 setTimeout 进行延迟加载
    const scheduleLoad = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))

    scheduleLoad(() => {
      unloadedIds.forEach((id, index) => {
        setTimeout(() => {
          if (!loadedSetRef.current.has(id) && !loadingSetRef.current.has(id)) {
            loadImages(id)
          }
        }, index * loadDelay)
      })
    })
  }, [loadImages])

  /**
   * 获取设备的图片信息
   */
  const getEquipmentImages = useCallback((equipmentId) => {
    const defaultImage = optionsRef.current.defaultImage || ''
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
    return loadImages(equipmentId)
  }, [loadImages])

  return {
    imagesMap,
    loadingSet,
    loadImages,
    loadImagesBatch,
    getEquipmentImages,
    getImageUrl,
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
