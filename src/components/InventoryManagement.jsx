import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Row, Col, Input, Select, DatePicker, Descriptions, Tag, Tabs, Badge, Modal, Form, InputNumber, message } from 'antd'
const { TextArea } = Input
import { SearchOutlined, FilterOutlined, EyeOutlined, ReloadOutlined, DownloadOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { deviceApi } from '../services/api'

const { Option } = Select
const { RangePicker } = DatePicker
const { Search } = Input
const { TabPane } = Tabs

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredInventory, setFilteredInventory] = useState([])
  const [summaryData, setSummaryData] = useState([])
  const [adjustModalVisible, setAdjustModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [adjustForm] = Form.useForm()
  const [adjustType, setAdjustType] = useState('increase')

  // 模拟数据
  const mockInventory = [
    // 专用设备
    {
      id: 1,
      category: '专用设备',
      name: '服务器',
      brand: 'Dell',
      model: 'PowerEdge R740',
      totalQuantity: 10,
      usedQuantity: 6,
      remainingQuantity: 4,
      unit: '台',
      warehouse: '主仓库',
      location: '机房A',
      status: '正常',
      lastUpdated: '2026-03-20'
    },
    {
      id: 2,
      category: '专用设备',
      name: '交换机',
      brand: 'Cisco',
      model: 'Catalyst 9300',
      totalQuantity: 15,
      usedQuantity: 10,
      remainingQuantity: 5,
      unit: '台',
      warehouse: '主仓库',
      location: '机房B',
      status: '正常',
      lastUpdated: '2026-03-19'
    },
    // 通用设备
    {
      id: 3,
      category: '通用设备',
      name: '笔记本电脑',
      brand: 'Lenovo',
      model: 'ThinkPad X1 Carbon',
      totalQuantity: 20,
      usedQuantity: 15,
      remainingQuantity: 5,
      unit: '台',
      warehouse: '主仓库',
      location: '仓库1',
      status: '正常',
      lastUpdated: '2026-03-18'
    },
    {
      id: 4,
      category: '通用设备',
      name: '显示器',
      brand: 'Dell',
      model: 'U2419H',
      totalQuantity: 30,
      usedQuantity: 25,
      remainingQuantity: 5,
      unit: '台',
      warehouse: '主仓库',
      location: '仓库1',
      status: '正常',
      lastUpdated: '2026-03-17'
    },
    // 耗材
    {
      id: 5,
      category: '耗材',
      name: '打印纸',
      brand: '得力',
      model: 'A4 70g',
      totalQuantity: 100,
      usedQuantity: 60,
      remainingQuantity: 40,
      unit: '包',
      warehouse: '主仓库',
      location: '仓库2',
      status: '正常',
      lastUpdated: '2026-03-16'
    },
    {
      id: 6,
      category: '耗材',
      name: '墨盒',
      brand: 'HP',
      model: '802',
      totalQuantity: 50,
      usedQuantity: 30,
      remainingQuantity: 20,
      unit: '个',
      warehouse: '主仓库',
      location: '仓库2',
      status: '正常',
      lastUpdated: '2026-03-15'
    },
    // 原材料
    {
      id: 7,
      category: '原材料',
      name: '钢材',
      brand: '宝钢',
      model: 'Q235',
      totalQuantity: 500,
      usedQuantity: 300,
      remainingQuantity: 200,
      unit: 'kg',
      warehouse: '原材料仓库',
      location: '原料区',
      status: '正常',
      lastUpdated: '2026-03-14'
    },
    {
      id: 8,
      category: '原材料',
      name: '铝材',
      brand: '西南铝',
      model: '6061',
      totalQuantity: 300,
      usedQuantity: 150,
      remainingQuantity: 150,
      unit: 'kg',
      warehouse: '原材料仓库',
      location: '原料区',
      status: '正常',
      lastUpdated: '2026-03-13'
    }
  ]

  useEffect(() => {
    // 从API获取数据
    const fetchInventory = async () => {
      setLoading(true)
      try {
        // 获取专用设备数据
        const specialEquipments = await deviceApi.getSpecialEquipments()
        // 获取通用设备数据
        const generalEquipments = await deviceApi.getGeneralEquipments()
        
        // 转换设备数据为库存数据格式
        const inventoryData = []
        
        // 处理专用设备
        specialEquipments.forEach((equipment, index) => {
          inventoryData.push({
            id: index + 1,
            category: '专用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: equipment.useStatus === '使用中' ? equipment.quantity : 0,
            remainingQuantity: equipment.useStatus === '使用中' ? 0 : equipment.quantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
        
        // 处理通用设备
        generalEquipments.forEach((equipment, index) => {
          inventoryData.push({
            id: specialEquipments.length + index + 1,
            category: '通用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: equipment.useStatus === '使用中' ? equipment.quantity : 0,
            remainingQuantity: equipment.useStatus === '使用中' ? 0 : equipment.quantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
        
        setInventory(inventoryData)
      } catch (error) {
        console.error('获取库存数据失败:', error)
        message.error('获取库存数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInventory()
  }, [])

  // 计算汇总数据
  useEffect(() => {
    const summary = []
    const grouped = {}

    // 按类别分组
    inventory.forEach(item => {
      if (item.category === '专用设备' || item.category === '通用设备') {
        const key = `${item.name}-${item.brand}-${item.model}`
        if (!grouped[key]) {
          grouped[key] = {
            category: item.category,
            name: item.name,
            brand: item.brand,
            model: item.model,
            totalQuantity: 0,
            usedQuantity: 0,
            remainingQuantity: 0,
            unit: item.unit
          }
        }
        grouped[key].totalQuantity += item.totalQuantity
        grouped[key].usedQuantity += item.usedQuantity
        grouped[key].remainingQuantity += item.remainingQuantity
      } else {
        // 耗材和原材料直接汇总
        const key = `${item.name}-${item.brand}-${item.model}`
        if (!grouped[key]) {
          grouped[key] = {
            category: item.category,
            name: item.name,
            brand: item.brand,
            model: item.model,
            totalQuantity: 0,
            usedQuantity: 0,
            remainingQuantity: 0,
            unit: item.unit
          }
        }
        grouped[key].totalQuantity += item.totalQuantity
        grouped[key].usedQuantity += item.usedQuantity
        grouped[key].remainingQuantity += item.remainingQuantity
      }
    })

    // 转换为数组
    Object.values(grouped).forEach(item => {
      summary.push(item)
    })

    setSummaryData(summary)
  }, [inventory])

  // 过滤库存数据
  useEffect(() => {
    let result = [...inventory]
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(text) ||
        item.brand.toLowerCase().includes(text) ||
        item.model.toLowerCase().includes(text)
      )
    }
    
    // 类别过滤
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter)
    }
    
    // 状态过滤
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter)
    }
    
    setFilteredInventory(result)
  }, [inventory, searchText, categoryFilter, statusFilter])

  // 打开库存调整模态框
  const handleAdjustInventory = (item) => {
    setCurrentItem(item)
    setAdjustForm({
      quantity: 0,
      reason: ''
    })
    setAdjustType('increase')
    setAdjustModalVisible(true)
  }

  // 处理库存调整
  const handleAdjustSubmit = (values) => {
    const { quantity, reason } = values
    if (!quantity) {
      message.error('请输入调整数量')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const updatedInventory = inventory.map(item => {
        if (item.id === currentItem.id) {
          const newQuantity = adjustType === 'increase' 
            ? item.totalQuantity + quantity 
            : item.totalQuantity - quantity
          
          if (newQuantity < 0) {
            message.error('调整后库存不能为负数')
            setLoading(false)
            return item
          }

          const newRemaining = adjustType === 'increase' 
            ? item.remainingQuantity + quantity 
            : item.remainingQuantity - quantity

          return {
            ...item,
            totalQuantity: newQuantity,
            remainingQuantity: newRemaining < 0 ? 0 : newRemaining,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        }
        return item
      })

      setInventory(updatedInventory)
      setAdjustModalVisible(false)
      message.success('库存调整成功')
      setLoading(false)
    }, 500)
  }

  // 汇总视图列
  const summaryColumns = [
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        let color = ''
        switch (category) {
          case '专用设备':
            color = 'blue'
            break
          case '通用设备':
            color = 'green'
            break
          case '耗材':
            color = 'orange'
            break
          case '原材料':
            color = 'purple'
            break
          default:
            color = 'gray'
        }
        return <Tag color={color}>{category}</Tag>
      }
    },
    {
      title: '名称',
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
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150
    },
    {
      title: '总数',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '已使用',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '剩余',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 80,
      align: 'center',
      render: (remaining, record) => {
        const percentage = (remaining / record.totalQuantity) * 100
        let color = ''
        if (percentage < 20) {
          color = 'red'
        } else if (percentage < 50) {
          color = 'orange'
        } else {
          color = 'green'
        }
        return <span style={{ color, fontWeight: 'bold' }}>{remaining}</span>
      }
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center'
    }
  ]

  // 详细视图列
  const detailColumns = [
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        let color = ''
        switch (category) {
          case '专用设备':
            color = 'blue'
            break
          case '通用设备':
            color = 'green'
            break
          case '耗材':
            color = 'orange'
            break
          case '原材料':
            color = 'purple'
            break
          default:
            color = 'gray'
        }
        return <Tag color={color}>{category}</Tag>
      }
    },
    {
      title: '名称',
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
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150
    },
    {
      title: '总数',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '已使用',
      dataIndex: 'usedQuantity',
      key: 'usedQuantity',
      width: 80,
      align: 'center'
    },
    {
      title: '剩余',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 80,
      align: 'center',
      render: (remaining, record) => {
        const percentage = (remaining / record.totalQuantity) * 100
        let color = ''
        if (percentage < 20) {
          color = 'red'
        } else if (percentage < 50) {
          color = 'orange'
        } else {
          color = 'green'
        }
        return <span style={{ color, fontWeight: 'bold' }}>{remaining}</span>
      }
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center'
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status) => {
        let color = ''
        switch (status) {
          case '正常':
            color = 'green'
            break
          case '不足':
            color = 'orange'
            break
          case '缺货':
            color = 'red'
            break
          default:
            color = 'blue'
        }
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleAdjustInventory(record)}
          >
            调整库存
          </Button>
        </Space>
      )
    }
  ]

  // 计算库存统计
  const inventoryStats = {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
    usedQuantity: inventory.reduce((sum, item) => sum + item.usedQuantity, 0),
    remainingQuantity: inventory.reduce((sum, item) => sum + item.remainingQuantity, 0),
    lowStock: inventory.filter(item => (item.remainingQuantity / item.totalQuantity) < 0.2).length,
    outOfStock: inventory.filter(item => item.remainingQuantity === 0).length
  }

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h2>库存管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={async () => {
            setLoading(true)
            try {
              // 获取专用设备数据
              const specialEquipments = await deviceApi.getSpecialEquipments()
              // 获取通用设备数据
              const generalEquipments = await deviceApi.getGeneralEquipments()
              
              // 转换设备数据为库存数据格式
              const inventoryData = []
              
              // 处理专用设备
        specialEquipments.forEach((equipment, index) => {
          inventoryData.push({
            id: index + 1,
            category: '专用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: equipment.useStatus === '使用中' ? equipment.quantity : 0,
            remainingQuantity: equipment.useStatus === '使用中' ? 0 : equipment.quantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
        
        // 处理通用设备
        generalEquipments.forEach((equipment, index) => {
          inventoryData.push({
            id: specialEquipments.length + index + 1,
            category: '通用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: equipment.useStatus === '使用中' ? equipment.quantity : 0,
            remainingQuantity: equipment.useStatus === '使用中' ? 0 : equipment.quantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
              
              setInventory(inventoryData)
              message.success('库存数据刷新成功')
            } catch (error) {
              console.error('获取库存数据失败:', error)
              message.error('获取库存数据失败')
            } finally {
              setLoading(false)
            }
          }}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />}>
            导出
          </Button>
        </Space>
      </div>
      
      {/* 库存统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>库存项目数</h3>
              <p className="stat-number">{inventoryStats.totalItems}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>总数量</h3>
              <p className="stat-number">{inventoryStats.totalQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>已使用</h3>
              <p className="stat-number">{inventoryStats.usedQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>库存不足</h3>
              <p className="stat-number">{inventoryStats.lowStock}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>缺货项目</h3>
              <p className="stat-number">{inventoryStats.outOfStock}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#722ed1' }}>
              <h3>剩余总量</h3>
              <p className="stat-number">{inventoryStats.remainingQuantity}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Search
              placeholder="搜索名称、品牌、型号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="按类别筛选"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="专用设备">专用设备</Option>
              <Option value="通用设备">通用设备</Option>
              <Option value="耗材">耗材</Option>
              <Option value="原材料">原材料</Option>
            </Select>
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
              <Option value="不足">不足</Option>
              <Option value="缺货">缺货</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              onClick={() => {
                setSearchText('')
                setCategoryFilter('')
                setStatusFilter('')
              }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>
      
      {/* 标签页切换汇总视图和详细视图 */}
      <Tabs defaultActiveKey="summary">
        <TabPane tab="汇总视图" key="summary">
          <Table 
            columns={summaryColumns} 
            dataSource={summaryData} 
            loading={loading}
            rowKey="name"
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `共 ${total} 个汇总项`
            }}
            scroll={{ x: 1000 }}
            components={{
              body: (props) => {
                const { data } = props;
                if (data.length === 0) {
                  return (
                    <tbody>
                      <tr key="empty">
                        <td colSpan={summaryColumns.length} style={{ textAlign: 'center' }}>
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
        </TabPane>
        <TabPane tab="详细视图" key="detail">
          <Table 
            columns={detailColumns} 
            dataSource={filteredInventory} 
            loading={loading}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showTotal: (total) => `共 ${total} 个库存项`
            }}
            scroll={{ x: 1200 }}
            components={{
              body: (props) => {
                const { data } = props;
                if (data.length === 0) {
                  return (
                    <tbody>
                      <tr key="empty">
                        <td colSpan={detailColumns.length} style={{ textAlign: 'center' }}>
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
        </TabPane>
      </Tabs>

      {/* 库存调整模态框 */}
      <Modal
        title="调整库存"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentItem && (
          <div>
            <Descriptions bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="类别">
                <Tag color={
                  currentItem.category === '专用设备' ? 'blue' :
                  currentItem.category === '通用设备' ? 'green' :
                  currentItem.category === '耗材' ? 'orange' : 'purple'
                }>
                  {currentItem.category}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="名称">{currentItem.name}</Descriptions.Item>
              <Descriptions.Item label="品牌">{currentItem.brand}</Descriptions.Item>
              <Descriptions.Item label="型号">{currentItem.model}</Descriptions.Item>
              <Descriptions.Item label="当前库存">{currentItem.totalQuantity} {currentItem.unit}</Descriptions.Item>
              <Descriptions.Item label="剩余库存">{currentItem.remainingQuantity} {currentItem.unit}</Descriptions.Item>
            </Descriptions>

            <Form
              form={adjustForm}
              layout="vertical"
              onFinish={handleAdjustSubmit}
            >
              <Form.Item label="调整类型" required>
                <Select
                  value={adjustType}
                  onChange={setAdjustType}
                  style={{ width: '100%' }}
                >
                  <Option value="increase">
                    <Space>
                      <PlusOutlined /> 增加库存
                    </Space>
                  </Option>
                  <Option value="decrease">
                    <Space>
                      <MinusOutlined /> 减少库存
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item 
                label="调整数量" 
                name="quantity"
                rules={[{ required: true, message: '请输入调整数量' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="请输入调整数量"
                />
              </Form.Item>

              <Form.Item 
                label="调整原因" 
                name="reason"
                rules={[{ required: true, message: '请输入调整原因' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入调整原因"
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setAdjustModalVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    确认调整
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InventoryManagement