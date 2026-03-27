import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import RawMaterialForm from './RawMaterialForm'
import FileUpload from './FileUpload'

const { Option } = Select
const { Search } = Input

const RawMaterialList = () => {
  const [rawMaterials, setRawMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRawMaterial, setEditingRawMaterial] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [filteredRawMaterials, setFilteredRawMaterials] = useState([])

  // 从API获取数据
  useEffect(() => {
    const fetchRawMaterials = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:5055/api/RawMaterials')
        if (response.ok) {
          const data = await response.json()
          // 确保每个对象都有唯一的key属性，并且数量字段为数字类型
          const dataWithKey = data.map((item, index) => {
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
          setRawMaterials(dataWithKey)
          setFilteredRawMaterials(dataWithKey)
        } else {
          message.error('获取原材料数据失败')
        }
      } catch (error) {
        message.error('网络错误，请检查后端服务是否运行')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRawMaterials()
  }, [])

  // 过滤原材料数据
  useEffect(() => {
    const fetchFilteredRawMaterials = async () => {
      setLoading(true)
      try {
        let url = 'http://localhost:5055/api/RawMaterials?'
        let params = []
        
        if (searchText) {
          params.push(`search=${encodeURIComponent(searchText)}`)
        }
        
        if (locationFilter) {
          params.push(`location=${encodeURIComponent(locationFilter)}`)
        }
        
        url += params.join('&')
        
        // 如果没有参数，移除末尾的?符号
        url = url.replace(/\?$/, '')
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          // 确保每个对象都有唯一的key属性，并且数量字段为数字类型
          const dataWithKey = data.map((item, index) => {
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
          setFilteredRawMaterials(dataWithKey)
        } else {
          message.error('获取过滤数据失败')
        }
      } catch (error) {
        message.error('网络错误，请检查后端服务是否运行')
      } finally {
        setLoading(false)
      }
    }
    
    fetchFilteredRawMaterials()
  }, [searchText, locationFilter])

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
    try {
      const response = await fetch(`http://localhost:5055/api/RawMaterials/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
          setRawMaterials(rawMaterials.filter(rawMaterial => rawMaterial.id !== id))
          setFilteredRawMaterials(filteredRawMaterials.filter(rawMaterial => rawMaterial.id !== id))
          message.success('原材料删除成功')
        } else {
          message.error('删除原材料失败')
        }
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleSave = async (rawMaterial) => {
    try {
      // 确保数量字段为数字类型
      const processedRawMaterial = {
        ...rawMaterial,
        totalQuantity: parseInt(rawMaterial.totalQuantity) || 0,
        usedQuantity: parseInt(rawMaterial.usedQuantity) || 0
      }
      
      if (processedRawMaterial.id) {
        // 编辑现有原材料
        const response = await fetch(`http://localhost:5055/api/RawMaterials/${processedRawMaterial.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(processedRawMaterial)
        })
        
        if (response.ok) {
          const updatedRawMaterial = await response.json()
          // 确保更新后的原材料有key属性，并且数量字段为数字类型
          const updatedRawMaterialWithKey = {
            ...updatedRawMaterial,
            key: updatedRawMaterial.id,
            totalQuantity: parseInt(updatedRawMaterial.totalQuantity) || 0,
            usedQuantity: parseInt(updatedRawMaterial.usedQuantity) || 0,
            remainingQuantity: parseInt(updatedRawMaterial.remainingQuantity) || 0
          }
          setRawMaterials(rawMaterials.map(r => r.id === processedRawMaterial.id ? updatedRawMaterialWithKey : r))
          setFilteredRawMaterials(filteredRawMaterials.map(r => r.id === processedRawMaterial.id ? updatedRawMaterialWithKey : r))
          message.success('原材料更新成功')
        } else {
          message.error('更新原材料失败')
        }
      } else {
        // 添加新原材料
        const response = await fetch('http://localhost:5055/api/RawMaterials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(processedRawMaterial)
        })
        
        if (response.ok) {
          const newRawMaterial = await response.json()
          // 确保新原材料有key属性，并且数量字段为数字类型
          const newRawMaterialWithKey = {
            ...newRawMaterial,
            key: newRawMaterial.id,
            totalQuantity: parseInt(newRawMaterial.totalQuantity) || 0,
            usedQuantity: parseInt(newRawMaterial.usedQuantity) || 0,
            remainingQuantity: parseInt(newRawMaterial.remainingQuantity) || 0
          }
          setRawMaterials([...rawMaterials, newRawMaterialWithKey])
          setFilteredRawMaterials([...filteredRawMaterials, newRawMaterialWithKey])
          message.success('原材料添加成功')
        } else {
          message.error('添加原材料失败')
        }
      }
      setShowForm(false)
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleImport = async (data) => {
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
      const remainingQty = totalQty - usedQty
      
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
    
    // 使用批量导入API
    try {
      // 调试：打印发送的数据
      console.log('发送的导入数据:', { RawMaterials: importedRawMaterials });
      
      const response = await fetch('http://localhost:5055/api/RawMaterials/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ RawMaterials: importedRawMaterials })
      })
      
      if (response.ok) {
        const result = await response.json()
        const successCount = result
        
        // 重新获取原材料列表
        const fetchResponse = await fetch('http://localhost:5055/api/RawMaterials')
        if (fetchResponse.ok) {
          const data = await fetchResponse.json()
          // 确保每个对象都有唯一的key属性，并且数量字段为数字类型
          const dataWithKey = data.map((item, index) => {
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
          setRawMaterials(dataWithKey)
          setFilteredRawMaterials(dataWithKey)
        }
        
        message.success(`成功导入 ${successCount} 个原材料`)
      } else {
        // 获取详细的错误信息
        try {
          const errorData = await response.json()
          console.error('导入失败:', JSON.stringify(errorData, null, 2))
          console.error('错误状态:', response.status)
          console.error('错误状态文本:', response.statusText)
          
          // 显示详细的错误信息
          let errorMessage = '导入原材料失败: '
          if (errorData.errors) {
            errorMessage += Object.entries(errorData.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ')
          } else {
            errorMessage += errorData.title || '未知错误'
          }
          message.error(errorMessage)
        } catch (error) {
          console.error('解析错误响应失败:', error)
          message.error(`导入原材料失败: 服务器返回错误 ${response.status}`)
        }
      }
    } catch (error) {
      console.error('导入原材料失败:', error)
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      // 调用后端API清空所有原材料
      const response = await fetch('http://localhost:5055/api/RawMaterials', {
        method: 'DELETE'
      })
      if (response.ok) {
        // 清空本地状态
        setRawMaterials([])
        setFilteredRawMaterials([])
        message.success('所有原材料已清空')
      } else {
        throw new Error('清空原材料失败')
      }
    } catch (error) {
      console.error('清空原材料失败:', error)
      message.error('清空原材料失败')
    } finally {
      setLoading(false)
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
          <Popconfirm
            title="确定要清空所有原材料吗？此操作不可撤销！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>
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
      
      <Table 
        columns={columns} 
        dataSource={filteredRawMaterials} 
        loading={loading}
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
                    <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                      暂无数据
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