import React, { useState, useEffect, useCallback } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag, Spin } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import RawMaterialForm from './RawMaterialForm'
import FileUpload from './FileUpload'
import { rawMaterialService } from '../services/rawMaterialService'

const { Option } = Select
const { Search } = Input

const RawMaterialList = () => {
  // 基本状态
  const [rawMaterials, setRawMaterials] = useState([])
  const [filteredRawMaterials, setFilteredRawMaterials] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingRawMaterial, setEditingRawMaterial] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  
  // 细粒度加载状态
  const [loadingStates, setLoadingStates] = useState({
    initial: false,
    filter: false,
    add: false,
    edit: false,
    delete: false,
    import: false,
    clear: false,
    refresh: false
  })
  
  // 错误状态
  const [error, setError] = useState(null)
  
  // 缓存状态
  const [cache, setCache] = useState({
    fullList: null,
    lastFetch: null
  })
  
  // 防抖函数
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 更新加载状态的辅助函数
  const setLoading = (type, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [type]: isLoading
    }))
  }
  
  // 错误处理函数
  const handleError = (error, messageText) => {
    console.error(messageText, error)
    setError(messageText)
    message.error(messageText)
    // 3秒后自动清除错误
    setTimeout(() => setError(null), 3000)
  }
  
  // 处理数据格式化
  const processRawMaterialData = (data) => {
    return data.map((item, index) => {
      // 确保剩余数量正确计算
      const totalQty = parseInt(item.totalQuantity) || 0
      const usedQty = parseInt(item.usedQuantity) || 0
      const remainingQty = totalQty - usedQty
      
      return {
        ...item,
        key: item.id || index,
        totalQuantity: totalQty,
        usedQuantity: usedQty,
        remainingQuantity: remainingQty
      }
    })
  }
  
  // 从API获取数据
  const fetchRawMaterials = async (forceRefresh = false) => {
    setLoading('initial', true)
    try {
      // 检查缓存是否有效（5分钟内）
      const now = new Date()
      if (!forceRefresh && cache.fullList && cache.lastFetch && (now - cache.lastFetch) < 5 * 60 * 1000) {
        setRawMaterials(cache.fullList)
        setFilteredRawMaterials(cache.fullList)
        return
      }
      
      const data = await rawMaterialService.getRawMaterials()
      const dataWithKey = processRawMaterialData(data)
      
      // 更新状态和缓存
      setRawMaterials(dataWithKey)
      setFilteredRawMaterials(dataWithKey)
      setCache({
        fullList: dataWithKey,
        lastFetch: new Date()
      })
    } catch (error) {
      handleError(error, '获取原材料数据失败')
    } finally {
      setLoading('initial', false)
    }
  }
  
  // 初始加载数据
  useEffect(() => {
    fetchRawMaterials()
  }, [])

  // 防抖的过滤函数
  const debouncedFetchFiltered = useCallback(
    debounce(async () => {
      setLoading('filter', true)
      try {
        const params = {}
        
        if (searchText) {
          params.search = searchText
        }
        
        if (locationFilter) {
          params.location = locationFilter
        }
        
        const data = await rawMaterialService.getRawMaterials(params)
        const dataWithKey = processRawMaterialData(data)
        setFilteredRawMaterials(dataWithKey)
      } catch (error) {
        handleError(error, '获取过滤数据失败')
      } finally {
        setLoading('filter', false)
      }
    }, 300),
    [searchText, locationFilter]
  )
  
  // 过滤原材料数据
  useEffect(() => {
    debouncedFetchFiltered()
  }, [debouncedFetchFiltered])

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

  const handleDelete = async (id) => {
    setLoading('delete', true)
    try {
      await rawMaterialService.deleteRawMaterial(id)
      
      // 更新本地状态
      setRawMaterials(rawMaterials.filter(rawMaterial => rawMaterial.id !== id))
      setFilteredRawMaterials(filteredRawMaterials.filter(rawMaterial => rawMaterial.id !== id))
      message.success('原材料删除成功')
    } catch (error) {
      handleError(error, '删除原材料失败')
    } finally {
      setLoading('delete', false)
    }
  }

  const handleSave = async (rawMaterial) => {
    // 确定是添加还是编辑
    const isEditing = !!rawMaterial.id
    setLoading(isEditing ? 'edit' : 'add', true)
    
    try {
      // 确保数量字段为数字类型
      const processedRawMaterial = {
        ...rawMaterial,
        totalQuantity: parseInt(rawMaterial.totalQuantity) || 0,
        usedQuantity: parseInt(rawMaterial.usedQuantity) || 0
      }
      
      let result
      if (isEditing) {
        // 编辑现有原材料
        result = await rawMaterialService.updateRawMaterial(processedRawMaterial.id, processedRawMaterial)
      } else {
        // 添加新原材料
        result = await rawMaterialService.addRawMaterial(processedRawMaterial)
      }
      
      // 处理返回结果
      const processedResult = processRawMaterialData([result])[0]
      
      if (isEditing) {
        // 更新现有记录
        setRawMaterials(rawMaterials.map(r => r.id === processedResult.id ? processedResult : r))
        setFilteredRawMaterials(filteredRawMaterials.map(r => r.id === processedResult.id ? processedResult : r))
        message.success('原材料更新成功')
      } else {
        // 添加新记录
        setRawMaterials([...rawMaterials, processedResult])
        setFilteredRawMaterials([...filteredRawMaterials, processedResult])
        message.success('原材料添加成功')
      }
      
      setShowForm(false)
    } catch (error) {
      handleError(error, isEditing ? '更新原材料失败' : '添加原材料失败')
    } finally {
      setLoading(isEditing ? 'edit' : 'add', false)
    }
  }

  const handleImport = async (data) => {
    setLoading('import', true)
    
    try {
      // 处理导入的数据
      const importedRawMaterials = data.map(item => {
        // 尝试不同的列名
        const productName = item['原材料名称'] || item['名称'] || item['productName'] || item.name
        const brand = item['品牌'] || item['brand'] || item.brand
        const specification = item['规格'] || item['specification'] || item.specification
        const unit = item['单位'] || item['unit'] || item.unit
        const supplier = item['供应商'] || item['supplier'] || item.supplier
        const location = item['所在仓库'] || item['仓库'] || item['location'] || item.location
        const company = item['公司'] || item['所属公司'] || item['company'] || item.company
        const remark = item['备注'] || item['remark'] || item.remark || ''
        
        // 处理数量字段，确保转换为数字
        let totalQuantityValue = 0
        let usedQuantityValue = 0
        
        // 处理总数量
        if (item['总数量'] !== undefined && item['总数量'] !== null && item['总数量'] !== '') {
          totalQuantityValue = parseInt(item['总数量']) || 0
        } else if (item['数量'] !== undefined && item['数量'] !== null && item['数量'] !== '') {
          totalQuantityValue = parseInt(item['数量']) || 0
        } else if (item['totalQuantity'] !== undefined && item['totalQuantity'] !== null && item['totalQuantity'] !== '') {
          totalQuantityValue = parseInt(item['totalQuantity']) || 0
        } else if (item.totalQuantity !== undefined && item.totalQuantity !== null && item.totalQuantity !== '') {
          totalQuantityValue = parseInt(item.totalQuantity) || 0
        } else if (item['剩余数量'] !== undefined && item['剩余数量'] !== null && item['剩余数量'] !== '') {
          totalQuantityValue = parseInt(item['剩余数量']) || 0
        } else if (item.remainingQuantity !== undefined && item.remainingQuantity !== null && item.remainingQuantity !== '') {
          totalQuantityValue = parseInt(item.remainingQuantity) || 0
        }
        
        // 处理已用数量
        if (item['已用数量'] !== undefined && item['已用数量'] !== null && item['已用数量'] !== '') {
          usedQuantityValue = parseInt(item['已用数量']) || 0
        } else if (item['usedQuantity'] !== undefined && item['usedQuantity'] !== null && item['usedQuantity'] !== '') {
          usedQuantityValue = parseInt(item['usedQuantity']) || 0
        } else if (item.usedQuantity !== undefined && item.usedQuantity !== null && item.usedQuantity !== '') {
          usedQuantityValue = parseInt(item.usedQuantity) || 0
        }
        
        // 计算剩余数量
        const totalQty = totalQuantityValue > 0 ? totalQuantityValue : 0
        const usedQty = usedQuantityValue > 0 ? usedQuantityValue : 0
        
        return {
          productName,
          brand,
          specification,
          totalQuantity: totalQty,
          usedQuantity: usedQty,
          unit,
          supplier,
          location,
          company: company || '科技有限公司',
          remark,
          image: '',
          createdBy: 'system'
        }
      })
      
      // 调试：打印发送的数据
      console.log('发送的导入数据:', { RawMaterials: importedRawMaterials });
      
      // 使用批量导入API
      const successCount = await rawMaterialService.importRawMaterials(importedRawMaterials)
      
      // 重新获取原材料列表（强制刷新）
      await fetchRawMaterials(true)
      
      message.success(`成功导入 ${successCount} 个原材料`)
    } catch (error) {
      console.error('导入原材料失败:', error)
      handleError(error, '导入原材料失败')
    } finally {
      setLoading('import', false)
    }
  }

  const handleClearAll = async () => {
    setLoading('clear', true)
    try {
      // 调用后端API清空所有原材料
      await rawMaterialService.clearAllRawMaterials()
      
      // 清空本地状态
      setRawMaterials([])
      setFilteredRawMaterials([])
      message.success('所有原材料已清空')
    } catch (error) {
      console.error('清空原材料失败:', error)
      handleError(error, '清空原材料失败')
    } finally {
      setLoading('clear', false)
    }
  }

  const columns = [
    {
      title: '原材料名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '已用数量',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '剩余数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 80,
      align: 'center',
      render: (remainingQuantity) => {
        const quantity = parseInt(remainingQuantity) || 0
        const color = quantity < 100 ? 'red' : quantity < 500 ? 'orange' : 'green'
        return <span style={{ color }}>{quantity}</span>
      }
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 120
    },
    {
      title: '所在仓库',
      dataIndex: 'location',
      key: 'location',
      width: 100
    },
    {
      title: '所属公司',
      dataIndex: 'company',
      key: 'company',
      width: 120
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => {
        if (!image) {
          return null;
        }
        return (
          <img 
            src={image} 
            alt="原材料图片" 
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            onClick={() => handleDetail(record)}
          >
            查看
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个原材料吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 计算总数量统计
  const quantityStats = {
    total: rawMaterials.reduce((sum, r) => sum + (r.totalQuantity || 0), 0),
    used: rawMaterials.reduce((sum, r) => sum + (r.usedQuantity || 0), 0),
    remaining: rawMaterials.reduce((sum, r) => sum + (r.remainingQuantity || 0), 0)
  }

  return (
    <div className="raw-material-list">
      <div className="page-header">
        <h2>原材料管理</h2>
        <Space>
          <FileUpload onImport={handleImport} module="rawMaterial" />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加原材料
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            loading={loadingStates.refresh}
            onClick={() => {
              setLoading('refresh', true);
              fetchRawMaterials(true).finally(() => setLoading('refresh', false));
            }}
          >
            刷新数据
          </Button>
          <Popconfirm
            title="确定要清空所有原材料吗？此操作不可撤销！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger loading={loadingStates.clear}>
              清空原材料
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      {/* 原材料数量统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <div className="stat-card">
              <h3>总数量</h3>
              <p className="stat-number">{quantityStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>已用数量</h3>
              <p className="stat-number">{quantityStats.used}</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
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
              placeholder="搜索原材料名称、品牌或规格"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
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
                setLocationFilter('')
              }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>
      
      {/* 错误提示 */}
      {error && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 4, color: '#cf1322' }}>
          {error}
        </div>
      )}
      
      <Table 
        columns={columns} 
        dataSource={filteredRawMaterials} 
        loading={loadingStates.initial || loadingStates.filter}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `共 ${total} 个原材料`
        }}
        scroll={{ x: 1500 }}
        components={{
          body: (props) => {
            const { data } = props;
            if (data.length === 0) {
              return (
                <tbody>
                  <tr key="empty">
                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px 0' }}>
                      {loadingStates.initial || loadingStates.filter ? (
                        <Spin tip="加载中..." />
                      ) : (
                        '暂无数据'
                      )}
                    </td>
                  </tr>
                </tbody>
              );
            }
            return <tbody>{props.children}</tbody>;
          }
        }}
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
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedRawMaterial && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="原材料名称">{selectedRawMaterial.productName}</Descriptions.Item>
            <Descriptions.Item label="品牌">{selectedRawMaterial.brand || '-'}</Descriptions.Item>
            <Descriptions.Item label="规格">{selectedRawMaterial.specification}</Descriptions.Item>
            <Descriptions.Item label="总数量">{selectedRawMaterial.totalQuantity} {selectedRawMaterial.unit}</Descriptions.Item>
            <Descriptions.Item label="已用数量">{selectedRawMaterial.usedQuantity} {selectedRawMaterial.unit}</Descriptions.Item>
            <Descriptions.Item label="剩余数量">
              <Tag color={
                selectedRawMaterial.remainingQuantity < 100 ? 'red' :
                selectedRawMaterial.remainingQuantity < 500 ? 'orange' : 'green'
              }>
                {selectedRawMaterial.remainingQuantity} {selectedRawMaterial.unit}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="供应商">{selectedRawMaterial.supplier}</Descriptions.Item>
            <Descriptions.Item label="所在仓库">{selectedRawMaterial.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="所属公司">{selectedRawMaterial.company}</Descriptions.Item>
            <Descriptions.Item label="备注">{selectedRawMaterial.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedRawMaterial.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedRawMaterial.updatedAt || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default RawMaterialList