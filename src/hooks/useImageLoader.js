import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { imageApi } from '../services/api'

/**
 * 通用图片加载Hook
 * @param {Object} options - 配置选项
 * @param {number} options.equipmentType - 设备类型（1:专用设备, 2:通用设备, 3:耗材, 4:原材料）
 * @param {string} options.defaultImage - 默认图片URL
 * @param {number} options.loadDelay - 加载延迟毫秒数（默认100ms）
 * @param {boolean} options.lazyLoad - 是否延迟加载（默认true）
 */
export const useImageLoader = (options) => {
  const {
    equipmentType = 1,
    defaultImage = '',
    loadDelay = 100,
    lazyLoad = true
  } = options

  const [imagesMap, setImagesMap] = useState(new Map())
  const [loadingSet, setLoadingSet] = useState(new Set())
  const loadedSetRef = useRef(new Set())
  const imagesMapRef = useRef(imagesMap)

  /**
   * 获取图片URL（处理双斜杠问题）
   */
  const getImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return defaultImage
    return imageUrl.replace(/\/api\/api\//g, '/api/') || defaultImage
  }, [defaultImage])

  // 当imagesMap变化时，更新ref
  useEffect(() => {
    imagesMapRef.current = imagesMap
  }, [imagesMap])

  /**
   * 构建图片完整URL
   */
  const buildImageUrl = useCallback((imageId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055'
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '')
    return `${cleanBaseUrl}/api/Image/data/${imageId}`
  }, [])

  /**
   * 加载单个设备的图片
   */
  const loadImages = useCallback(async (equipmentId) => {
    // 避免重复加载
    if (loadedSetRef.current.has(equipmentId)) {
      return null
    }

    try {
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
        loadedSetRef.current.add(equipmentId)
        
        return result
      }
    } catch (error) {
      // 静默处理图片加载失败，避免控制台被错误信息填满
    }

    return null
  }, [equipmentType, buildImageUrl])

  /**
   * 批量加载图片（带延迟和并发限制）
   */
  const loadImagesBatch = useCallback((equipmentIds) => {
    // 过滤掉已经加载的设备
    const unloadedIds = equipmentIds.filter(id => !loadedSetRef.current.has(id))
    
    if (unloadedIds.length === 0) {
      return
    }

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
          if (!loadedSetRef.current.has(id)) {
            loadImages(id)
          }
        }, index * loadDelay)
      })
    })
  }, [lazyLoad, loadDelay, loadImages])

  /**
   * 获取设备的图片信息
   */
  const getEquipmentImages = useCallback((equipmentId) => {
    return imagesMapRef.current.get(equipmentId) || {
      images: [],
      mainImage: defaultImage
    }
  }, [defaultImage])

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
