import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import ConsumableForm from './ConsumableForm'
import FileUpload from './FileUpload'
import * as XLSX from 'xlsx'
import { get, post, put, del } from '../services/request'
import { imageApi, cacheManager } from '../services/api'
import { useListData, useImageLoader, useImagePreview } from '../hooks'



const { Option } = Select
const { Search } = Input

// 数据处理函数
const processConsumableData = (data) => {
  return data.map((item, index) => ({
    ...item,
    key: item.id || index,
    image: ((item.image) || '').replace(/apiapi/g, '/api/') || '',
    images: []
  }))
}

const ConsumableList = () => {
  // 使用useCallback稳定fetchApi函数，避免无限循环
  const fetchApi = useCallback(() => get('/Consumable'), []);
  
  // 使用通用列表数据Hook
  const {
    data: consumables,
    filteredData: filteredConsumables,
    setFilteredData,
    loading,
    error,
    refresh,
    updateItem,
    deleteItem,
    addItem
  } = useListData({
    fetchApi,
    processData: processConsumableData,
    errorMessage: '获取耗材列表失败'
  })

  // 使用图片加载Hook
  const imageLoaderOptions = useMemo(() => ({
    equipmentType: 3, // 3 表示耗材
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
  const [editingConsumable, setEditingConsumable] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedConsumable, setSelectedConsumable] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  // 延迟加载图片 - 只加载当前页面的耗材图片
  // 使用useMemo计算当前页面的耗材ID列表，避免不必要的重新计算
  const currentPageConsumableIds = useMemo(() => {
    if (filteredConsumables.length === 0) return [];
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredConsumables.slice(startIndex, endIndex).map(c => c.id);
  }, [filteredConsumables, pagination.current, pagination.pageSize]);

  // 使用ref跟踪已经加载过的图片ID，避免重复加载
  const loadedImageIdsRef = useRef(new Set());
  
  // 使用ref存储loadImagesBatch函数，避免依赖变化导致的无限循环
  const loadImagesBatchRef = useRef(loadImagesBatch);
  loadImagesBatchRef.current = loadImagesBatch;

  // 延迟加载图片
  useEffect(() => {
    if (currentPageConsumableIds.length > 0) {
      // 过滤掉已经加载过的图片ID
      const unloadedIds = currentPageConsumableIds.filter(id => !loadedImageIdsRef.current.has(id));
      
      if (unloadedIds.length > 0) {
        unloadedIds.forEach(id => loadedImageIdsRef.current.add(id));
        loadImagesBatchRef.current(unloadedIds);
      }
    }
  }, [currentPageConsumableIds]);

  // 处理搜索和筛选
  useEffect(() => {
    let result = [...consumables]
    
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(consumable => 
        (consumable.name && consumable.name.toLowerCase().includes(text)) ||
        (consumable.brand && consumable.brand.toLowerCase().includes(text)) ||
        (consumable.modelSpecification && consumable.modelSpecification.toLowerCase().includes(text))
      )
    }
    
    if (statusFilter) {
      result = result.filter(consumable => consumable.status === statusFilter)
    }
    
    if (locationFilter) {
      result = result.filter(consumable => consumable.location === locationFilter)
    }
    
    setFilteredData(result)
  }, [consumables, searchText, statusFilter, locationFilter])

  const handleAdd = () => {
    setEditingConsumable(null)
    setShowForm(true)
  }

  const handleEdit = async (consumable) => {
    // 确保加载耗材的最新图片
    await refreshImages(consumable.id)
    setEditingConsumable(consumable)
    setShowForm(true)
  }

  const handleDetail = async (consumable) => {
    // 确保加载耗材的最新图片
    await refreshImages(consumable.id)
    // 获取最新的耗材数据
    const updatedConsumable = {
      ...consumable,
      images: getEquipmentImages(consumable.id).images
    }
    setSelectedConsumable(updatedConsumable)
    setShowDetail(true)
  }

  const handleImagePreview = (images) => {
    const imageUrls = images.map(img => img.url)
    openPreview(imageUrls, 0)
  }

  const handleDelete = async (id) => {
    try {
      await del(`/Consumable/${id}`)
      deleteItem(id)
      message.success('耗材删除成功')
    } catch (error) {
      message.error('删除耗材失败')
    }
  }

  const handleSave = async (consumable) => {
    try {
      if (consumable.id) {
        // 编辑现有耗材
        await handleUpdateConsumable(consumable);
      } else {
        // 添加新耗材
        await handleCreateConsumable(consumable);
      }
    } catch (error) {
      console.error('保存耗材失败:', error);
      message.error('保存耗材失败');
    } finally {
      setShowForm(false);
    }
  };

  const handleUpdateConsumable = async (consumable) => {
    // 获取当前耗材的所有图片
    const currentImages = await imageApi.getEquipmentImages(consumable.id, 3);
    const currentImageIds = currentImages.map(img => img.Id || img.id);
    
    // 获取用户保留的图片ID
    const retainedImageIds = (consumable.images || [])
      .filter(img => img.id && typeof img.id === 'string' && !img.id.startsWith('temp_'))
      .map(img => img.id);
    
    // 删除用户已移除的图片
    for (const imageId of currentImageIds) {
      if (!retainedImageIds.includes(imageId)) {
        try {
          await imageApi.deleteEquipmentImage(imageId);
        } catch (error) {
          console.error('删除图片失败:', error);
        }
      }
    }
    
    // 上传新的临时图片
    const tempImages = (consumable.images || [])
      .filter(img => img.id && typeof img.id === 'string' && img.id.startsWith('temp_') && img.originFileObj);
    
    if (tempImages.length > 0) {
      const formData = new FormData();
      tempImages.forEach(img => {
        if (img.originFileObj) {
          formData.append('files', img.originFileObj);
        }
      });
      
      try {
        await imageApi.uploadEquipmentImage(consumable.id, 3, formData);
      } catch (error) {
        console.error('上传临时图片失败:', error);
        message.error('上传图片失败');
      }
    }
    
    // 清除图片缓存
    cacheManager.invalidate(`equipment-images-${consumable.id}-3`);
    
    // 获取最新的图片信息
    const updatedImages = await imageApi.getEquipmentImages(consumable.id, 3);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
    const imageUrl = updatedImages && updatedImages.length > 0 
      ? `${cleanBaseUrl}/api/Image/data/${updatedImages[0].Id || updatedImages[0].id}` 
      : '';
    
    // 构建更新的图片数组
    const consumableImages = updatedImages.map(img => ({
      id: img.Id || img.id,
      url: `${cleanBaseUrl}/api/Image/data/${img.Id || img.id}`
    }));
    
    const updatedConsumable = await put(`/Consumable/${consumable.id}`, {
      ...consumable,
      image: imageUrl
    });
    
    const updatedConsumableWithKey = {
      ...updatedConsumable,
      key: updatedConsumable.id,
      image: imageUrl || '',
      imageUrl: imageUrl || '',
      images: consumableImages
    };
    
    // 刷新数据
    await refresh();
    // 刷新图片
    await refreshImages(consumable.id);
    // 更新耗材数据中的图片信息
    updateItem(consumable.id, updatedConsumableWithKey);
    message.success('耗材更新成功');
  };

  const handleCreateConsumable = async (consumable) => {
    const consumableData = {
      ...consumable,
      image: ''
    };

    const newConsumable = await post('/Consumable', consumableData);
    
    // 如果有临时图片，上传它们
    if (consumable.images && consumable.images.length > 0) {
      const tempImages = consumable.images.filter(img => 
        img.id && typeof img.id === 'string' && img.id.startsWith('temp_')
      );
      
      if (tempImages.length > 0) {
        const formData = new FormData();
        tempImages.forEach(img => {
          if (img.originFileObj) {
            formData.append('files', img.originFileObj);
          }
        });
        
        try {
          await imageApi.uploadEquipmentImage(newConsumable.id || newConsumable.Id, 3, formData);
        } catch (error) {
          console.error('上传临时图片失败:', error);
          message.error('上传图片失败');
        }
      }
    }

    // 刷新数据
    await refresh();
    // 刷新图片
    await refreshImages(newConsumable.id || newConsumable.Id);
    message.success('耗材添加成功');
  };

  const handleImport = async (data) => {
    console.log('导入数据原始内容:', data)
    
    const importedConsumables = data.map((item, index) => {
      // 获取所有可能的字段名称
      const name = item['耗材名称'] || item['名称'] || item['consumableName'] || item.name || item.Name || ''
      const brand = item['品牌'] || item['brand'] || item.brand || item.Brand || ''
      const modelSpecification = item['型号规格'] || item['规格'] || item['model'] || item.modelSpecification || item.model || item.ModelSpecification || item.Specification || ''
      const unit = item['单位'] || item['unit'] || item.unit || item.Unit || ''
      const location = item['位置'] || item['location'] || item.location || item.Location || ''
      const remark = item['备注'] || item['remark'] || item.remark || item.Remark || ''
      
      // 解析数量字段，支持多种可能的字段名
      const getNumberValue = (value) => {
        if (value === undefined || value === null || value === '') return 0
        const num = parseInt(String(value).trim())
        return isNaN(num) ? 0 : num
      }
      
      let usedQuantityValue = getNumberValue(item['已用数量'] || item['usedQuantity'] || item.usedQuantity || item.UsedQuantity || 0)
      let remainingQuantityValue = getNumberValue(item['剩余数量'] || item['remainingQuantity'] || item.remainingQuantity || item.RemainingQuantity || 0)
      
      // 如果剩余数量为0但模板中有总数量字段，尝试从总数量计算
      if (remainingQuantityValue === 0) {
        const totalQtyFromTemplate = getNumberValue(item['总数量'] || item['totalQuantity'] || item.totalQuantity || item.TotalQuantity || 0)
        if (totalQtyFromTemplate > 0) {
          remainingQuantityValue = totalQtyFromTemplate - usedQuantityValue
        }
      }
      
      const totalQty = remainingQuantityValue + usedQuantityValue
      
      let itemStatus = remainingQuantityValue <= 0 ? '无货' : remainingQuantityValue < 10 ? '短缺' : '正常'
      
      console.log(`第${index + 1}行数据:`, {
        name,
        usedQuantityValue,
        remainingQuantityValue,
        totalQty,
        itemStatus
      })
      
      return {
        name,
        brand,
        modelSpecification,
        totalQuantity: totalQty,
        originalQuantity: totalQty,
        usedQuantity: usedQuantityValue,
        remainingQuantity: remainingQuantityValue,
        unit,
        company: '科技有限公司',
        status: itemStatus,
        accessories: '',
        remark,
        image: '',
        location
      }
    })
    
    let successCount = 0
    for (const consumable of importedConsumables) {
      try {
        await post('/Consumable', consumable)
        successCount++
      } catch (error) {
        console.error('导入耗材失败:', error)
      }
    }
    
    await refresh()
    message.success(`成功导入 ${successCount} 个耗材`)
  }

  const handleClearAll = async () => {
    try {
      await del('/Consumable')
      setFilteredData([])
      message.success('所有耗材已清空')
    } catch (error) {
      console.error('清空耗材失败:', error)
      message.error('清空耗材失败')
    }
  }

  const handleExport = () => {
    const exportData = filteredConsumables.map(item => ({
      '耗材名称': item.name,
      '品牌': item.brand || '',
      '型号规格': item.modelSpecification || '',
      '总数量': item.totalQuantity,
      '已用数量': item.usedQuantity,
      '剩余数量': item.remainingQuantity,
      '单位': item.unit || '',
      '状态': item.status || '',
      '所在仓库': item.location || '',
      '所属公司': item.company || '',
      '备注': item.remark || ''
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(wb, ws, '耗材数据')
    XLSX.writeFile(wb, `耗材数据_${new Date().toISOString().split('T')[0]}.xlsx`)
    message.success('耗材数据导出成功')
  }

  const columns = [
    { title: '耗材名称', dataIndex: 'name', key: 'name', width: 120 },
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colorMap = { '正常': 'green', '短缺': 'orange', '无货': 'red' }
        return <span style={{ color: colorMap[status] || 'blue' }}>{status}</span>
      }
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images, record) => {
        const consumableImages = getEquipmentImages(record.id)
        const hasImages = consumableImages.images && consumableImages.images.length > 0
        const displayImage = hasImages ? consumableImages.mainImage : (record.image || null)
        
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
                message.info('该耗材暂无图片')
              }
            }}
          >
            {displayImage ? (
              <img 
                src={displayImage} 
                alt="耗材图片" 
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <div 
                style={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px'
                }}
              >
                无图片
              </div>
            )}
            {hasImages && consumableImages.images.length > 1 && (
              <div style={{ 
                position: 'absolute', bottom: 0, right: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', 
                fontSize: '12px', padding: '2px 6px', borderRadius: '10px'
              }}>
                +{consumableImages.images.length - 1}
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
            title="确定要删除这个耗材吗？"
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

  // 计算耗材状态统计
  const statusStats = {
    normal: consumables.filter(consumable => consumable.status === '正常').length,
    shortage: consumables.filter(consumable => consumable.status === '短缺').length,
    outOfStock: consumables.filter(consumable => consumable.status === '无货').length,
    total: consumables.length
  }

  // 计算总数量统计
  const quantityStats = {
    total: consumables.reduce((sum, c) => sum + c.totalQuantity, 0),
    used: consumables.reduce((sum, c) => sum + c.usedQuantity, 0),
    remaining: consumables.reduce((sum, c) => sum + c.remainingQuantity, 0)
  }

  return (
    <div className="consumable-list">
      <div className="page-header">
        <h2>耗材管理</h2>
        <Space>
          <FileUpload onImport={handleImport} module="consumable" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加耗材</Button>
          <Popconfirm
            title="确定要清空所有耗材吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>清空耗材</Button>
          </Popconfirm>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>导出耗材</Button>
        </Space>
      </div>
      
      {/* 耗材统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card>
            <div className="stat-card">
              <h3>耗材总数</h3>
              <p className="stat-number">{statusStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>正常耗材</h3>
              <p className="stat-number">{statusStats.normal}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>短缺耗材</h3>
              <p className="stat-number">{statusStats.shortage}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>无货耗材</h3>
              <p className="stat-number">{statusStats.outOfStock}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card">
              <h3>总数量</h3>
              <p className="stat-number">{quantityStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>已用数量</h3>
              <p className="stat-number">{quantityStats.used}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>剩余数量</h3>
              <p className="stat-number">{quantityStats.remaining}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Search
              placeholder="搜索耗材名称、品牌或型号规格"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="按状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="正常">正常</Option>
              <Option value="短缺">短缺</Option>
              <Option value="无货">无货</Option>
            </Select>
          </Col>
          <Col span={6}>
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
                setStatusFilter('')
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
        dataSource={filteredConsumables} 
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showTotal: (total) => `共 ${total} 个耗材`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          }
        }}
        scroll={{ x: 1200 }}
        locale={{ emptyText: '暂无数据' }}
      />

      <Modal
        title={editingConsumable ? '编辑耗材' : '添加耗材'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={700}
      >
        <ConsumableForm 
          consumable={editingConsumable}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* 耗材详情模态框 */}
      <Modal
        title="耗材详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[<Button key="close" onClick={() => setShowDetail(false)}>关闭</Button>]}
        width={800}
      >
        {selectedConsumable && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="耗材名称">{selectedConsumable.name}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedConsumable.brand}</Descriptions.Item>
            <Descriptions.Item label="型号规格">{selectedConsumable.modelSpecification}</Descriptions.Item>
            <Descriptions.Item label="总数量">{selectedConsumable.totalQuantity} {selectedConsumable.unit}</Descriptions.Item>
            <Descriptions.Item label="已用数量">{selectedConsumable.usedQuantity} {selectedConsumable.unit}</Descriptions.Item>
            <Descriptions.Item label="剩余数量">
              <Tag color={
                selectedConsumable.remainingQuantity < 10 ? 'red' :
                selectedConsumable.remainingQuantity < 30 ? 'orange' : 'green'
              }>
                {selectedConsumable.remainingQuantity} {selectedConsumable.unit}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                selectedConsumable.status === '正常' ? 'green' :
                selectedConsumable.status === '短缺' ? 'orange' : 'red'
              }>
                {selectedConsumable.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所在仓库">{selectedConsumable.location}</Descriptions.Item>
            <Descriptions.Item label="备注">{selectedConsumable.remark || '-'}</Descriptions.Item>
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

export default ConsumableList
