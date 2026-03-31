import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import RawMaterialForm from './RawMaterialForm'
import FileUpload from './FileUpload'
import { get, post, put, del as deleteRequest } from '../services/request'
import { useListData, useImageLoader, useImagePreview } from '../hooks'

// 默认原材料图片
const DEFAULT_RAWMATERIAL_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4ODgiPuW8gOWPkeaWmeahiDwvdGV4dD4KPC9zdmc+'

const { Option } = Select
const { Search } = Input

// 数据处理函数
const processRawMaterialData = (data) => {
  return data.map((item, index) => {
    const totalQty = parseInt(item.totalQuantity) || 0
    const usedQty = parseInt(item.usedQuantity) || 0
    const remainingQty = totalQty - usedQty
    
    return {
      ...item,
      key: item.id || index,
      totalQuantity: totalQty,
      usedQuantity: usedQty,
      remainingQuantity: remainingQty,
      image: ((item.image) || '').replace(/\/api\/api\//g, '/api/') || DEFAULT_RAWMATERIAL_IMAGE,
      images: []
    }
  })
}

const RawMaterialList = () => {
  // 使用useCallback稳定fetchApi函数，避免无限循环
  const fetchApi = useCallback(() => get('/RawMaterials'), []);
  
  // 使用通用列表数据Hook
  const {
    data: rawMaterials,
    filteredData: filteredRawMaterials,
    setFilteredData,
    loading,
    error,
    refresh,
    updateItem,
    deleteItem,
    addItem
  } = useListData({
    fetchApi,
    processData: processRawMaterialData,
    errorMessage: '获取原材料列表失败'
  })

  // 使用图片加载Hook
  const imageLoaderOptions = useMemo(() => ({
    equipmentType: 4, // 4 表示原材料
    defaultImage: DEFAULT_RAWMATERIAL_IMAGE,
    loadDelay: 100
  }), []);
  
  const {
    loadImagesBatch,
    getEquipmentImages,
    refreshImages
  } = useImageLoader(imageLoaderOptions);

  // 使用图片预览Hook
  const {
    previewVisible,
    previewImages,
    currentImageIndex,
    openPreview,
    closePreview,
    setCurrentImageIndex
  } = useImagePreview()

  // 本地状态
  const [showForm, setShowForm] = useState(false)
  const [editingRawMaterial, setEditingRawMaterial] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  // 延迟加载图片 - 只加载当前页面的原材料图片
  // 使用useMemo计算当前页面的原材料ID列表，避免不必要的重新计算
  const currentPageRawMaterialIds = useMemo(() => {
    if (filteredRawMaterials.length === 0) return [];
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredRawMaterials.slice(startIndex, endIndex).map(r => r.id);
  }, [filteredRawMaterials, pagination.current, pagination.pageSize]);

  // 使用ref跟踪已经加载过的图片ID，避免重复加载
  const loadedImageIdsRef = useRef(new Set());
  
  // 使用ref存储loadImagesBatch函数，避免依赖变化导致的无限循环
  const loadImagesBatchRef = useRef(loadImagesBatch);
  loadImagesBatchRef.current = loadImagesBatch;

  // 延迟加载图片
  useEffect(() => {
    if (currentPageRawMaterialIds.length > 0) {
      // 过滤掉已经加载过的图片ID
      const unloadedIds = currentPageRawMaterialIds.filter(id => !loadedImageIdsRef.current.has(id));
      
      if (unloadedIds.length > 0) {
        unloadedIds.forEach(id => loadedImageIdsRef.current.add(id));
        loadImagesBatchRef.current(unloadedIds);
      }
    }
  }, [currentPageRawMaterialIds]);

  // 处理搜索和筛选
  useEffect(() => {
    let result = [...rawMaterials]
    
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(rawMaterial => 
        (rawMaterial.name && rawMaterial.name.toLowerCase().includes(text)) ||
        (rawMaterial.brand && rawMaterial.brand.toLowerCase().includes(text)) ||
        (rawMaterial.modelSpecification && rawMaterial.modelSpecification.toLowerCase().includes(text))
      )
    }
    
    if (locationFilter) {
      result = result.filter(rawMaterial => rawMaterial.location === locationFilter)
    }
    
    setFilteredData(result)
  }, [rawMaterials, searchText, locationFilter])

  const handleAdd = () => {
    setEditingRawMaterial(null)
    setShowForm(true)
  }

  const handleEdit = (rawMaterial) => {
    setEditingRawMaterial(rawMaterial)
    setShowForm(true)
  }

  const handleDetail = (rawMaterial) => {
    setSelectedRawMaterial(rawMaterial)
    setShowDetail(true)
  }

  const handleImagePreview = (images) => {
    const imageUrls = images.map(img => img.url)
    openPreview(imageUrls, 0)
  }

  const handleDelete = async (id) => {
    try {
      await deleteRequest(`/RawMaterials/${id}`)
      deleteItem(id)
      message.success('原材料删除成功')
    } catch (error) {
      message.error('删除原材料失败')
    }
  }

  const handleSave = async (rawMaterial) => {
    try {
      const processedRawMaterial = {
        ...rawMaterial,
        totalQuantity: parseInt(rawMaterial.totalQuantity) || 0,
        usedQuantity: parseInt(rawMaterial.usedQuantity) || 0
      }
      
      if (rawMaterial.id) {
        const result = await put(`/RawMaterials/${processedRawMaterial.id}`, processedRawMaterial)
        const processedResult = processRawMaterialData([result])[0]
        updateItem(rawMaterial.id, processedResult)
        message.success('原材料更新成功')
      } else {
        const result = await post('/RawMaterials', processedRawMaterial)
        const processedResult = processRawMaterialData([result])[0]
        addItem(processedResult)
        message.success('原材料添加成功')
      }
      setShowForm(false)
    } catch (error) {
      message.error('保存原材料失败')
    }
  }

  const handleImport = async (data) => {
    const importedRawMaterials = data.map(item => {
      const name = item['原材料名称'] || item['名称'] || item.name
      const brand = item['品牌'] || item.brand
      const modelSpecification = item['型号规格'] || item['规格'] || item.modelSpecification
      const unit = item['单位'] || item.unit
      const location = item['位置'] || item.location
      const remark = item['备注'] || item.remark || ''
      
      const totalQty = parseInt(item['总数量'] || item.totalQuantity || 0)
      const usedQty = parseInt(item['已用数量'] || item.usedQuantity || 0)
      
      return {
        name,
        brand,
        modelSpecification,
        totalQuantity: totalQty,
        usedQuantity: usedQty,
        remainingQuantity: totalQty - usedQty,
        unit,
        company: '科技有限公司',
        location,
        remark,
        image: ''
      }
    })
    
    let successCount = 0
    for (const rawMaterial of importedRawMaterials) {
      try {
        await post('/RawMaterials', rawMaterial)
        successCount++
      } catch (error) {
        console.error('导入原材料失败:', error)
      }
    }
    
    await refresh()
    message.success(`成功导入 ${successCount} 个原材料`)
  }

  const handleClearAll = async () => {
    try {
      await deleteRequest('/RawMaterials')
      setFilteredData([])
      message.success('所有原材料已清空')
    } catch (error) {
      console.error('清空原材料失败:', error)
      message.error('清空原材料失败')
    }
  }

  const handleExport = () => {
    const exportData = filteredRawMaterials.map(item => ({
      '原材料名称': item.name,
      '品牌': item.brand || '',
      '型号规格': item.modelSpecification || '',
      '总数量': item.totalQuantity,
      '已用数量': item.usedQuantity,
      '剩余数量': item.remainingQuantity,
      '单位': item.unit || '',
      '所在仓库': item.location || '',
      '所属公司': item.company || '',
      '备注': item.remark || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, '原材料数据')
    XLSX.writeFile(wb, `原材料数据_${new Date().toISOString().split('T')[0]}.xlsx`)
    message.success('原材料数据导出成功')
  }

  const columns = [
    { title: '原材料名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '型号规格', dataIndex: 'modelSpecification', key: 'modelSpecification', width: 150 },
    { title: '总数量', dataIndex: 'totalQuantity', key: 'totalQuantity', width: 80, align: 'center' },
    { title: '已用数量', dataIndex: 'usedQuantity', key: 'usedQuantity', width: 80, align: 'center' },
    {
      title: '剩余数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 80,
      align: 'center',
      render: (remainingQuantity) => {
        const color = remainingQuantity < 10 ? 'red' : remainingQuantity < 30 ? 'orange' : 'green'
        return <span style={{ color }}>{remainingQuantity}</span>
      }
    },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80, align: 'center' },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images, record) => {
        const rawMaterialImages = getEquipmentImages(record.id)
        const hasImages = rawMaterialImages.images && rawMaterialImages.images.length > 0
        const displayImage = hasImages ? rawMaterialImages.mainImage : record.image
        
        return (
          <div 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={async () => {
              if (!hasImages) {
                await refreshImages(record.id)
              }
              const updatedImages = getEquipmentImages(record.id)
              if (updatedImages.images && updatedImages.images.length > 0) {
                handleImagePreview(updatedImages.images)
              } else {
                message.info('该原材料暂无图片')
              }
            }}
          >
            <img 
              src={displayImage} 
              alt="原材料图片" 
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
            />
            {hasImages && rawMaterialImages.images.length > 1 && (
              <div style={{ 
                position: 'absolute', bottom: 0, right: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', 
                fontSize: '12px', padding: '2px 6px', borderRadius: '10px'
              }}>
                +{rawMaterialImages.images.length - 1}
              </div>
            )}
          </div>
        )
      }
    },
    { title: '所在仓库', dataIndex: 'location', key: 'location', width: 100 },
    { title: '所属公司', dataIndex: 'company', key: 'company', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleDetail(record)}>查看</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除这个原材料吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 计算统计
  const stats = {
    total: rawMaterials.length,
    totalQuantity: rawMaterials.reduce((sum, r) => sum + r.totalQuantity, 0),
    usedQuantity: rawMaterials.reduce((sum, r) => sum + r.usedQuantity, 0),
    remainingQuantity: rawMaterials.reduce((sum, r) => sum + r.remainingQuantity, 0)
  }

  return (
    <div className="raw-material-list">
      <div className="page-header">
        <h2>原材料管理</h2>
        <Space>
          <FileUpload onImport={handleImport} module="rawMaterial" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加原材料</Button>
          <Popconfirm
            title="确定要清空所有原材料吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>清空原材料</Button>
          </Popconfirm>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出原材料</Button>
        </Space>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>原材料总数</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>总数量</h3>
              <p className="stat-number">{stats.totalQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>已用数量</h3>
              <p className="stat-number">{stats.usedQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>剩余数量</h3>
              <p className="stat-number">{stats.remainingQuantity}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Search
              placeholder="搜索原材料名称、品牌或型号规格"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="按仓库筛选"
              value={locationFilter}
              onChange={setLocationFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="仓库A">仓库A</Option>
              <Option value="仓库B">仓库B</Option>
              <Option value="仓库C">仓库C</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              onClick={() => {
                setSearchText('')
                setLocationFilter('')
              }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredRawMaterials} 
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showTotal: (total) => `共 ${total} 个原材料`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          }
        }}
        scroll={{ x: 1500 }}
        locale={{ emptyText: '暂无数据' }}
      />

      <Modal
        title={editingRawMaterial ? '编辑原材料' : '添加原材料'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={700}
      >
        <RawMaterialForm 
          rawMaterial={editingRawMaterial}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* 原材料详情模态框 */}
      <Modal
        title="原材料详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[<Button key="close" onClick={() => setShowDetail(false)}>关闭</Button>]}
        width={800}
      >
        {selectedRawMaterial && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="原材料名称">{selectedRawMaterial.name}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedRawMaterial.brand}</Descriptions.Item>
            <Descriptions.Item label="型号规格">{selectedRawMaterial.modelSpecification}</Descriptions.Item>
            <Descriptions.Item label="总数量">{selectedRawMaterial.totalQuantity} {selectedRawMaterial.unit}</Descriptions.Item>
            <Descriptions.Item label="已用数量">{selectedRawMaterial.usedQuantity} {selectedRawMaterial.unit}</Descriptions.Item>
            <Descriptions.Item label="剩余数量">
              <Tag color={
                selectedRawMaterial.remainingQuantity < 10 ? 'red' :
                selectedRawMaterial.remainingQuantity < 30 ? 'orange' : 'green'
              }>
                {selectedRawMaterial.remainingQuantity} {selectedRawMaterial.unit}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所在仓库">{selectedRawMaterial.location}</Descriptions.Item>
            <Descriptions.Item label="备注">{selectedRawMaterial.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      
      {/* 图片预览模态框 */}
      <Modal
        title={`图片预览 (${currentImageIndex + 1}/${previewImages.length})`}
        open={previewVisible}
        onCancel={closePreview}
        footer={[<Button key="close" onClick={closePreview}>关闭</Button>]}
        width={800}
      >
        {previewImages.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <Image
              src={previewImages[currentImageIndex]}
              style={{ maxWidth: '100%', maxHeight: 500 }}
            />
            {previewImages.length > 1 && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
                <Button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))}>
                  上一张
                </Button>
                <Button onClick={() => setCurrentImageIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))}>
                  下一张
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RawMaterialList
