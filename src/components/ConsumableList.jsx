import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import ConsumableForm from './ConsumableForm'
import FileUpload from './FileUpload'

const { Option } = Select
const { Search } = Input

const ConsumableList = () => {
  const [consumables, setConsumables] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingConsumable, setEditingConsumable] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedConsumable, setSelectedConsumable] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [filteredConsumables, setFilteredConsumables] = useState([])

  // 模拟数据
  const mockConsumables = [
    {
      id: 1,
      name: '打印纸',
      brand: '得力',
      modelSpecification: 'A4 80g',
      totalQuantity: 100,
      originalQuantity: 100,
      usedQuantity: 30,
      remainingQuantity: 70,
      unit: '包',
      company: '科技有限公司',
      status: '正常',
      accessories: '无',
      remark: '办公用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=office%20paper%20consumable&image_size=square',
      location: '仓库A',
      createdAt: '2026-01-01',
      updatedAt: '2026-03-01'
    },
    {
      id: 2,
      name: '墨盒',
      brand: 'HP',
      modelSpecification: 'HP 80A',
      totalQuantity: 50,
      originalQuantity: 50,
      usedQuantity: 20,
      remainingQuantity: 30,
      unit: '个',
      company: '科技有限公司',
      status: '正常',
      accessories: '无',
      remark: '打印机用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=printer%20ink%20cartridge&image_size=square',
      location: '仓库B',
      createdAt: '2026-01-02',
      updatedAt: '2026-03-02'
    },
    {
      id: 3,
      name: '硒鼓',
      brand: 'Canon',
      modelSpecification: 'CRG-045',
      totalQuantity: 30,
      originalQuantity: 30,
      usedQuantity: 15,
      remainingQuantity: 15,
      unit: '个',
      company: '科技有限公司',
      status: '正常',
      accessories: '无',
      remark: '激光打印机用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=laser%20printer%20toner%20cartridge&image_size=square',
      location: '仓库B',
      createdAt: '2026-01-03',
      updatedAt: '2026-03-03'
    },
    {
      id: 4,
      name: '鼠标',
      brand: '罗技',
      modelSpecification: 'M185',
      totalQuantity: 20,
      originalQuantity: 20,
      usedQuantity: 10,
      remainingQuantity: 10,
      unit: '个',
      company: '科技有限公司',
      status: '正常',
      accessories: '电池',
      remark: '办公用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=computer%20mouse&image_size=square',
      location: '仓库A',
      createdAt: '2026-01-04',
      updatedAt: '2026-03-04'
    },
    {
      id: 5,
      name: '键盘',
      brand: '雷柏',
      modelSpecification: 'V500',
      totalQuantity: 15,
      originalQuantity: 15,
      usedQuantity: 8,
      remainingQuantity: 7,
      unit: '个',
      company: '科技有限公司',
      status: '正常',
      accessories: '无',
      remark: '办公用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=computer%20keyboard&image_size=square',
      location: '仓库A',
      createdAt: '2026-01-05',
      updatedAt: '2026-03-05'
    },
    {
      id: 6,
      name: 'U 盘',
      brand: '闪迪',
      modelSpecification: '32GB',
      totalQuantity: 25,
      originalQuantity: 25,
      usedQuantity: 12,
      remainingQuantity: 13,
      unit: '个',
      company: '科技有限公司',
      status: '正常',
      accessories: '无',
      remark: '办公用',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=USB%20flash%20drive&image_size=square',
      location: '仓库A',
      createdAt: '2026-01-06',
      updatedAt: '2026-03-06'
    }
  ]

  useEffect(() => {
    // 从API获取数据
    const fetchConsumables = async () => {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:5055/api/Consumable')
        if (response.ok) {
          const data = await response.json()
          // 确保每个对象都有唯一的key属性
          const dataWithKey = data.map((item, index) => ({
            ...item,
            key: item.id || index
          }))
          setConsumables(dataWithKey)
          setFilteredConsumables(dataWithKey)
        } else {
          message.error('获取耗材数据失败')
        }
      } catch (error) {
        message.error('网络错误，请检查后端服务是否运行')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConsumables()
  }, [])

  // 过滤耗材数据
  useEffect(() => {
    const fetchFilteredConsumables = async () => {
      setLoading(true)
      try {
        let url = 'http://localhost:5055/api/Consumable?'
        let params = []
        
        if (searchText) {
          params.push(`search=${encodeURIComponent(searchText)}`)
        }
        
        if (statusFilter) {
          params.push(`status=${encodeURIComponent(statusFilter)}`)
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
          // 确保每个对象都有唯一的key属性
          const dataWithKey = data.map((item, index) => ({
            ...item,
            key: item.id || index
          }))
          setFilteredConsumables(dataWithKey)
        } else {
          message.error('获取过滤数据失败')
        }
      } catch (error) {
        message.error('网络错误，请检查后端服务是否运行')
      } finally {
        setLoading(false)
      }
    }
    
    fetchFilteredConsumables()
  }, [searchText, statusFilter, locationFilter])

  const handleAdd = () => {
    setEditingConsumable(null)
    setShowForm(true)
  }

  const handleEdit = (consumable) => {
    setEditingConsumable(consumable)
    setShowForm(true)
  }

  const handleDetail = (consumable) => {
    setSelectedConsumable(consumable)
    setShowDetail(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5055/api/Consumable/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
          setConsumables(consumables.filter(consumable => consumable.id !== id))
          setFilteredConsumables(filteredConsumables.filter(consumable => consumable.id !== id))
          message.success('耗材删除成功')
        } else {
          message.error('删除耗材失败')
        }
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleSave = async (consumable) => {
    try {
      if (consumable.id) {
        // 编辑现有耗材
        const response = await fetch(`http://localhost:5054/api/Consumable/${consumable.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(consumable)
        })
        
        if (response.ok) {
          const updatedConsumable = await response.json()
          // 确保更新后的耗材有key属性
          const updatedConsumableWithKey = {
            ...updatedConsumable,
            key: updatedConsumable.id
          }
          setConsumables(consumables.map(c => c.id === consumable.id ? updatedConsumableWithKey : c))
          setFilteredConsumables(filteredConsumables.map(c => c.id === consumable.id ? updatedConsumableWithKey : c))
          message.success('耗材更新成功')
        } else {
          message.error('更新耗材失败')
        }
      } else {
        // 添加新耗材
        const response = await fetch('http://localhost:5054/api/Consumable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(consumable)
        })
        
        if (response.ok) {
          const newConsumable = await response.json()
          // 确保新耗材有key属性
          const newConsumableWithKey = {
            ...newConsumable,
            key: newConsumable.id
          }
          setConsumables([...consumables, newConsumableWithKey])
          setFilteredConsumables([...filteredConsumables, newConsumableWithKey])
          message.success('耗材添加成功')
        } else {
          message.error('添加耗材失败')
        }
      }
      setShowForm(false)
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleImport = async (data) => {
    // 处理导入的数据
    const importedConsumables = data.map(item => {
      // 尝试不同的列名
      const name = item['耗材名称'] || item['名称'] || item['consumableName'] || item.name
      const brand = item['品牌'] || item['brand'] || item.brand
      const modelSpecification = item['型号规格'] || item['规格'] || item['model'] || item.modelSpecification || item.model
      const unit = item['单位'] || item['unit'] || item.unit
      const status = item['状态'] || item['status'] || item.status
      const location = item['位置'] || item['location'] || item.location
      const remark = item['备注'] || item['remark'] || item.remark || ''
      
      // 处理数量字段，确保转换为数字
      let usedQuantityValue = 0
      let remainingQuantityValue = 0
      
      // 处理已用数量
      if (item['已用数量'] !== undefined && item['已用数量'] !== null) {
        usedQuantityValue = parseInt(item['已用数量']) || 0
      } else if (item['usedQuantity'] !== undefined && item['usedQuantity'] !== null) {
        usedQuantityValue = parseInt(item['usedQuantity']) || 0
      } else if (item.usedQuantity !== undefined && item.usedQuantity !== null) {
        usedQuantityValue = parseInt(item.usedQuantity) || 0
      }
      
      // 处理剩余数量
      if (item['剩余数量'] !== undefined && item['剩余数量'] !== null) {
        remainingQuantityValue = parseInt(item['剩余数量']) || 0
      } else if (item['remainingQuantity'] !== undefined && item['remainingQuantity'] !== null) {
        remainingQuantityValue = parseInt(item['remainingQuantity']) || 0
      } else if (item.remainingQuantity !== undefined && item.remainingQuantity !== null) {
        remainingQuantityValue = parseInt(item.remainingQuantity) || 0
      }
      
      // 计算总数量
      const usedQty = usedQuantityValue
      const remainingQty = remainingQuantityValue
      const totalQty = remainingQty + usedQty
      
      // 根据剩余数量设置状态
      let itemStatus = status || '正常'
      if (remainingQty <= 0) {
        itemStatus = '无货'
      } else if (remainingQty < 10) {
        itemStatus = '短缺'
      }
      
      return {
        name,
        brand,
        modelSpecification,
        totalQuantity: totalQty,
        originalQuantity: totalQty,
        usedQuantity: usedQty,
        remainingQuantity: remainingQty,
        unit,
        company: '科技有限公司',
        status: itemStatus,
        accessories: '',
        remark,
        image: '',
        location
      }
    })
    
    // 逐个调用API添加耗材
    let successCount = 0
    for (const consumable of importedConsumables) {
      try {
        const response = await fetch('http://localhost:5054/api/Consumable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(consumable)
        })
        if (response.ok) {
          successCount++
        }
      } catch (error) {
        console.error('导入耗材失败:', error)
      }
    }
    
    // 重新获取耗材列表
    try {
      const response = await fetch('http://localhost:5054/api/Consumable')
      if (response.ok) {
        const data = await response.json()
        // 确保每个对象都有唯一的key属性
        const dataWithKey = data.map((item, index) => ({
          ...item,
          key: item.id || index
        }))
        setConsumables(dataWithKey)
        setFilteredConsumables(dataWithKey)
      }
    } catch (error) {
      console.error('获取耗材列表失败:', error)
    }
    
    message.success(`成功导入 ${successCount} 个耗材`)
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      // 调用后端API清空所有耗材
      const response = await fetch('http://localhost:5054/api/Consumable', {
        method: 'DELETE'
      })
      if (response.ok) {
        // 清空本地状态
        setConsumables([])
        setFilteredConsumables([])
        message.success('所有耗材已清空')
      } else {
        throw new Error('清空耗材失败')
      }
    } catch (error) {
      console.error('清空耗材失败:', error)
      message.error('清空耗材失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '耗材名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '型号规格',
      dataIndex: 'modelSpecification',
      key: 'modelSpecification',
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
        const color = remainingQuantity < 10 ? 'red' : remainingQuantity < 30 ? 'orange' : 'green'
        return <span style={{ color }}>{remainingQuantity}</span>
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = ''
        switch (status) {
          case '正常':
            color = 'green'
            break
          case '短缺':
            color = 'orange'
            break
          case '无货':
            color = 'red'
            break
          default:
            color = 'blue'
        }
        return <span style={{ color }}>{status}</span>
      }
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
            alt="耗材图片" 
            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
          />
        );
      }
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
            title="确定要删除这个耗材吗？"
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加耗材
          </Button>
          <Popconfirm
            title="确定要清空所有耗材吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>
              清空耗材
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      {/* 耗材状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>耗材总数</h3>
              <p className="stat-number">{statusStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>正常耗材</h3>
              <p className="stat-number">{statusStats.normal}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>短缺耗材</h3>
              <p className="stat-number">{statusStats.shortage}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>无货耗材</h3>
              <p className="stat-number">{statusStats.outOfStock}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 耗材数量统计卡片 */}
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
          pageSize: 10,
          showTotal: (total) => `共 ${total} 个耗材`
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
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={600}
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
            <Descriptions.Item label="创建时间">{selectedConsumable.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedConsumable.updatedAt || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ConsumableList