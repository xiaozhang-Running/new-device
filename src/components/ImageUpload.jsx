import React, { useState, useEffect } from 'react'
import { Upload, Button, message, Modal, List, Space, Typography } from 'antd'
import { UploadOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import { imageApi } from '../services/api'

const { Text } = Typography

const ImageUpload = ({ entityId, entityType, type, onImagesUpdated }) => {
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [uploading, setUploading] = useState(false)

  // 加载现有图片
  useEffect(() => {
    if (entityId) {
      loadImages()
    }
  }, [entityId, entityType, type])

  const loadImages = async () => {
    try {
      let images
      if (type === 'equipment') {
        images = await imageApi.getEquipmentImages(entityId, entityType)
      } else if (type === 'in-outbound') {
        images = await imageApi.getInOutboundImages(entityId, entityType)
      }
      
      if (images && images.length > 0) {
        const newFileList = images.map((url, index) => ({
          uid: `existing_${index}`,
          name: url.split('/').pop(),
          status: 'done',
          url: `http://localhost:5054/${url}`
        }))
        setFileList(newFileList)
      }
    } catch (error) {
      console.error('加载图片失败:', error)
      message.error('加载图片失败')
    }
  }

  const handlePreview = (file) => {
    setPreviewImage(file.url)
    setPreviewVisible(true)
  }

  const handleUpload = async (fileList) => {
    setUploading(true)
    try {
      const formData = new FormData()
      fileList.forEach(file => {
        formData.append('files', file)
      })
      formData.append('equipmentId', entityId)
      formData.append('equipmentType', entityType)
      formData.append('orderId', entityId)
      formData.append('orderType', entityType)

      let uploadedImages
      if (type === 'equipment') {
        uploadedImages = await imageApi.uploadEquipmentImage(entityId, entityType, formData)
      } else if (type === 'in-outbound') {
        uploadedImages = await imageApi.uploadInOutboundImage(entityId, entityType, formData)
      }

      if (uploadedImages && uploadedImages.length > 0) {
        const newFileList = uploadedImages.map((url, index) => ({
          uid: `new_${Date.now()}_${index}`,
          name: url.split('/').pop(),
          status: 'done',
          url: `http://localhost:5054/${url}`
        }))
        
        setFileList([...fileList, ...newFileList])
        message.success('图片上传成功')
        
        if (onImagesUpdated) {
          onImagesUpdated([...fileList, ...newFileList])
        }
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      message.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async (file) => {
    try {
      // 从文件名中提取图片ID
      const fileName = file.name
      // 注意：这里需要根据实际情况修改，因为我们没有在前端存储图片ID
      // 实际项目中，应该在加载图片时同时存储图片ID
      message.warning('删除功能需要后端支持图片ID')
    } catch (error) {
      console.error('删除图片失败:', error)
      message.error('删除图片失败')
    }
  }

  const uploadProps = {
    name: 'files',
    multiple: true,
    accept: 'image/*',
    action: '', // 我们使用自定义上传
    customRequest: ({ file, onSuccess, onError }) => {
      // 这里不做实际上传，因为我们在handleUpload中统一处理
      setTimeout(() => {
        onSuccess('ok')
      }, 0)
    },
    onRemove: handleRemove,
    onPreview: handlePreview,
    fileList: fileList,
    onChange: (info) => {
      const { status } = info.file
      if (status === 'done') {
        // 不做处理，因为我们在handleUpload中统一处理
      } else if (status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    }
  }

  return (
    <div className="image-upload">
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={uploading || !entityId}
        >
          上传图片
        </Button>
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

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>已上传图片:</Text>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={fileList}
            renderItem={(file) => (
              <List.Item key={file.uid}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden', borderRadius: 4 }}>
                    <img
                      src={file.url}
                      alt={file.name}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <Text ellipsis={{ tooltip: file.name }} style={{ fontSize: 12 }}>
                    {file.name}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default ImageUpload