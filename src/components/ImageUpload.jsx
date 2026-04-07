import React, { useState, useEffect } from 'react'
import { Upload, message, Modal, Typography } from 'antd'
import { PlusOutlined, EyeOutlined } from '@ant-design/icons'
import { imageApi, cacheManager } from '../services/api'
import { getImageUrl } from '../config/api.js'

const { Text } = Typography

const ImageUpload = ({ entityId, entityType, type, onImagesUpdated }) => {
  const [selectedImages, setSelectedImages] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 加载现有图片
  useEffect(() => {
    if (entityId > 0) {
      loadImages()
    } else {
      setSelectedImages([])
    }
  }, [entityId, entityType, type])

  const loadImages = async () => {
    try {
      // 清除相关缓存
      if (entityId) {
        if (type === 'equipment') {
          cacheManager.invalidate(`equipment-images-${entityId}-${entityType}`)
        } else if (type === 'in-outbound') {
          const entityTypeNum = entityType === 'outbound' ? 1 : 2
          cacheManager.invalidate(`inoutbound-images-${entityId}-${entityTypeNum}`)
        }
      }
      
      let images
      if (type === 'equipment') {
        images = await imageApi.getEquipmentImages(entityId, entityType)
      } else if (type === 'in-outbound') {
        images = await imageApi.getInOutboundImages(entityId, entityType)
      }
      
      if (images && images.length > 0) {
        const loadedImages = []
        
        for (const img of images) {
          const imageId = img.Id || img.id
          if (imageId) {
            const imageUrl = getImageUrl(imageId)
            const imageName = img.ImageName || img.imageName || `image_${imageId}.jpg`
            
            const file = {
              name: imageName,
              url: imageUrl,
              type: 'image/jpeg',
              uid: `image_${imageId}`,
              status: 'done',
              id: imageId
            }
            loadedImages.push(file)
          }
        }
        
        setSelectedImages(loadedImages)
        if (onImagesUpdated) {
          onImagesUpdated(loadedImages)
        }
      } else {
        setSelectedImages([])
        if (onImagesUpdated) {
          onImagesUpdated([])
        }
      }
    } catch (error) {
      console.error('加载图片失败:', error)
      // 不显示错误消息，因为当entityId为0时，这是正常的
    }
  }

  const handlePreview = (file) => {
    setPreviewImage(file.url || URL.createObjectURL(file))
    setPreviewVisible(true)
  }

  const handleUpload = async (files) => {
    setUploading(true)
    setIsProcessing(true)
    try {
      console.log('准备处理图片，entityId:', entityId, 'entityType:', entityType)
      console.log('文件数量:', files.length)
      
      // 当entityId为0时，直接将图片添加到本地状态
      const newImages = files.map((file, index) => {
        const imageId = `temp_${Date.now()}_${index}`
        const imageUrl = URL.createObjectURL(file)
        return {
          name: file.name,
          url: imageUrl,
          type: file.type,
          uid: `temp_${imageId}`,
          status: 'done',
          id: imageId,
          originFileObj: file
        }
      })
      
      const updatedImages = [...selectedImages, ...newImages]
      setSelectedImages(updatedImages)
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages)
      }
      message.success('图片已添加到表单')
    } catch (error) {
      console.error('图片处理失败:', error)
      message.error('图片处理失败：' + (error.message || '未知错误'))
    } finally {
      setUploading(false)
      setIsProcessing(false)
    }
  }

  const handleRemove = async (file) => {
    try {
      // 检查是否是临时图片
      if (file.id && typeof file.id === 'string' && !file.id.startsWith('temp_')) {
        if (type === 'equipment') {
          await imageApi.deleteEquipmentImage(file.id)
          // 清除相关缓存
          if (entityId) {
            cacheManager.invalidate(`equipment-images-${entityId}-${entityType}`)
          }
        } else if (type === 'in-outbound') {
          await imageApi.deleteInOutboundImage(file.id)
          // 清除相关缓存
          if (entityId) {
            const entityTypeNum = entityType === 'outbound' ? 1 : 2
            cacheManager.invalidate(`inoutbound-images-${entityId}-${entityTypeNum}`)
          }
        }
      }
      
      const updatedImages = selectedImages.filter(item => item.uid !== file.uid)
      setSelectedImages(updatedImages)
      message.success('图片删除成功')
      
      if (onImagesUpdated) {
        onImagesUpdated(updatedImages)
      }
    } catch (error) {
      console.error('删除图片失败:', error)
      message.error('删除图片失败')
    }
  }

  return (
    <div className="image-upload">
      <Upload
        listType="picture-card"
        multiple
        accept="image/*"
        action="#" // 设置为#防止默认上传行为
        customRequest={({ file, onSuccess }) => {
          // 自定义上传处理，直接标记为成功
          // 实际上传会在handleUpload中处理
          setTimeout(() => {
            onSuccess();
          }, 0);
        }}
        onBeforeUpload={() => false} // 阻止默认上传
        onChange={(info) => {
          // 如果正在处理上传，不处理新的文件选择
          if (isProcessing) {
            return;
          }
          
          // 处理文件选择，只处理新增的文件
          // 检查是否有新添加的文件（有originFileObj且不在selectedImages中的文件）
          const newFiles = [];
          const existingUids = new Set(selectedImages.map(img => img.uid));
          
          info.fileList.forEach(item => {
            // 只处理有originFileObj且uid不在selectedImages中的文件
            if (item.originFileObj && !existingUids.has(item.uid)) {
              newFiles.push(item.originFileObj);
            }
          });
          
          // 处理新文件，无论entityId是否大于0
          if (newFiles.length > 0) {
            handleUpload(newFiles);
          }
        }}
        onRemove={handleRemove}
        onPreview={handlePreview}
        fileList={selectedImages}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      </Upload>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img
          alt="预览"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>

      {selectedImages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>已选择 {selectedImages.length} 张图片</Text>
        </div>
      )}
    </div>
  )
}

export default ImageUpload