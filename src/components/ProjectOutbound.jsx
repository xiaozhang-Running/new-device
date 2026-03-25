import { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Card, 
  Tabs,
  Row,
  Col
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { deviceApi } from '../services/api'

const { Option } = Select
const { TabPane } = Tabs

// 模拟数据 - 详细设备清单
const mockDetailedSpecialDevices = [
  { id: 1, deviceId: 'SD001', name: '专用设备A', brand: '品牌1', model: 'Model-A', specification: '规格A', unit: '台', accessories: '配件1', status: '可用' },
  { id: 2, deviceId: 'SD002', name: '专用设备A', brand: '品牌1', model: 'Model-A', specification: '规格A', unit: '台', accessories: '配件1', status: '可用' },
  { id: 3, deviceId: 'SD003', name: '专用设备A', brand: '品牌1', model: 'Model-A', specification: '规格A', unit: '台', accessories: '配件1', status: '可用' },
  { id: 4, deviceId: 'SD004', name: '专用设备B', brand: '品牌2', model: 'Model-B', specification: '规格B', unit: '套', accessories: '配件2', status: '可用' },
  { id: 5, deviceId: 'SD005', name: '专用设备B', brand: '品牌2', model: 'Model-B', specification: '规格B', unit: '套', accessories: '配件2', status: '可用' },
  { id: 6, deviceId: 'SD006', name: '专用设备C', brand: '品牌3', model: 'Model-C', specification: '规格C', unit: '个', accessories: '配件3', status: '可用' }
]

const mockDetailedGeneralDevices = [
  { id: 1, deviceId: 'GD001', name: '通用设备A', brand: '品牌A', model: 'G-Model-A', specification: '通用规格A', unit: '台', accessories: '通用配件1', status: '可用' },
  { id: 2, deviceId: 'GD002', name: '通用设备A', brand: '品牌A', model: 'G-Model-A', specification: '通用规格A', unit: '台', accessories: '通用配件1', status: '可用' },
  { id: 3, deviceId: 'GD003', name: '通用设备B', brand: '品牌B', model: 'G-Model-B', specification: '通用规格B', unit: '个', accessories: '通用配件2', status: '可用' },
  { id: 4, deviceId: 'GD004', name: '通用设备B', brand: '品牌B', model: 'G-Model-B', specification: '通用规格B', unit: '个', accessories: '通用配件2', status: '可用' },
  { id: 5, deviceId: 'GD005', name: '通用设备C', brand: '品牌C', model: 'G-Model-C', specification: '通用规格C', unit: '套', accessories: '通用配件3', status: '可用' }
]

const mockConsumables = [
  { id: 1, name: '耗材A', model: 'C-Model-A', specification: '耗材规格A', inventory: 100 },
  { id: 2, name: '耗材B', model: 'C-Model-B', specification: '耗材规格B', inventory: 80 },
  { id: 3, name: '耗材C', model: 'C-Model-C', specification: '耗材规格C', inventory: 120 }
]

// 按名称、品牌、型号分组的设备数据
const mockSpecialDevices = [
  { id: 1, name: '专用设备A', brand: '品牌1', model: 'Model-A', specification: '规格A', inventory: 3 },
  { id: 2, name: '专用设备B', brand: '品牌2', model: 'Model-B', specification: '规格B', inventory: 2 },
  { id: 3, name: '专用设备C', brand: '品牌3', model: 'Model-C', specification: '规格C', inventory: 1 }
]

const mockGeneralDevices = [
  { id: 1, name: '通用设备A', brand: '品牌A', model: 'G-Model-A', specification: '通用规格A', inventory: 2 },
  { id: 2, name: '通用设备B', brand: '品牌B', model: 'G-Model-B', specification: '通用规格B', inventory: 2 },
  { id: 3, name: '通用设备C', brand: '品牌C', model: 'G-Model-C', specification: '通用规格C', inventory: 1 }
]

const mockProjects = [
  { id: 1, name: '项目1', description: '项目描述1' },
  { id: 2, name: '项目2', description: '项目描述2' },
  { id: 3, name: '项目3', description: '项目描述3' }
]

const mockOutboundHistory = [
  {
    id: 1,
    projectName: '项目1',
    outboundDate: '2026-03-20',
    operator: 'admin',
    status: '已完成',
    items: [
      { type: '专用设备', name: '专用设备A', quantity: 2 },
      { type: '通用设备', name: '通用设备B', quantity: 1 },
      { type: '耗材', name: '耗材A', quantity: 10 }
    ]
  },
  {
    id: 2,
    projectName: '项目2',
    outboundDate: '2026-03-18',
    operator: 'warehouse',
    status: '已完成',
    items: [
      { type: '专用设备', name: '专用设备B', quantity: 1 },
      { type: '耗材', name: '耗材B', quantity: 20 }
    ]
  }
]

function ProjectOutbound() {
  const [form] = Form.useForm()
  const [selectedSpecialDevices, setSelectedSpecialDevices] = useState([])
  const [selectedGeneralDevices, setSelectedGeneralDevices] = useState([])
  const [selectedConsumables, setSelectedConsumables] = useState([])
  const [outboundHistory, setOutboundHistory] = useState(mockOutboundHistory)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentOutboundDetail, setCurrentOutboundDetail] = useState(null)
  const [deviceDetailModalVisible, setDeviceDetailModalVisible] = useState(false)
  const [currentDeviceType, setCurrentDeviceType] = useState('')
  const [currentDeviceGroup, setCurrentDeviceGroup] = useState(null)
  const [filteredDetailedDevices, setFilteredDetailedDevices] = useState([])
  
  // 真实设备数据
  const [specialDevices, setSpecialDevices] = useState([])
  const [generalDevices, setGeneralDevices] = useState([])
  const [consumables, setConsumables] = useState([])
  const [loading, setLoading] = useState(false)
  const [brandFilter, setBrandFilter] = useState('')

  // 从后端获取设备数据（从库存表）
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true)
      try {
        // 从库存表获取专用设备
        const specialInventoryDevices = await deviceApi.getSpecialInventoryDevices()
        console.log('库存专用设备数据:', specialInventoryDevices)
        setSpecialDevices(specialInventoryDevices.map(device => ({
          id: device.id,
          equipmentId: device.equipmentId,
          name: device.name,
          brand: device.brand,
          model: device.model,
          specification: device.specification,
          inventory: device.inventoryQuantity || 0,
          unit: device.unit,
          warehouse: device.warehouse
        })))

        // 从库存表获取通用设备
        const generalInventoryDevices = await deviceApi.getGeneralInventoryDevices()
        console.log('库存通用设备数据:', generalInventoryDevices)
        setGeneralDevices(generalInventoryDevices.map(device => ({
          id: device.id,
          equipmentId: device.equipmentId,
          name: device.name,
          brand: device.brand,
          model: device.model,
          specification: device.specification,
          inventory: device.inventoryQuantity || 0,
          unit: device.unit,
          warehouse: device.warehouse
        })))

        // 从后端获取耗材数据
        const consumablesData = await deviceApi.getConsumables()
        console.log('耗材数据:', consumablesData)
        setConsumables(consumablesData.map(consumable => ({
          id: consumable.id,
          name: consumable.productName,
          model: consumable.brand,
          specification: consumable.specification,
          inventory: consumable.remainingQuantity || 0,
          unit: consumable.unit
        })))
      } catch (error) {
        console.error('获取设备数据失败:', error)
        message.error('获取设备数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  // 打开设备详情模态框
  const openDeviceDetailModal = async (device, deviceType) => {
    setCurrentDeviceType(deviceType)
    setCurrentDeviceGroup(device)
    setLoading(true)
    
    try {
      if (deviceType === 'special') {
        const devices = await deviceApi.getSpecialEquipmentDetails(device.name, device.brand)
        console.log('专用设备详情:', devices)
        setFilteredDetailedDevices(devices.map(d => ({
          id: d.id,
          deviceId: d.deviceCode,
          name: d.name,
          brand: d.brand,
          model: d.model,
          specification: d.specification,
          unit: d.unit,
          accessories: d.accessories,
          status: d.useStatus
        })))
      } else if (deviceType === 'general') {
        const devices = await deviceApi.getGeneralEquipmentDetails(device.name, device.brand)
        console.log('通用设备详情:', devices)
        setFilteredDetailedDevices(devices.map(d => ({
          id: d.id,
          deviceId: d.deviceCode,
          name: d.name,
          brand: d.brand,
          model: d.model,
          specification: d.specification,
          unit: d.unit,
          accessories: d.accessories,
          status: d.useStatus
        })))
      }
    } catch (error) {
      console.error('获取设备详情失败:', error)
      message.error('获取设备详情失败')
    } finally {
      setLoading(false)
      setDeviceDetailModalVisible(true)
    }
  }

  // 按品牌筛选设备详情
  const handleBrandFilter = async (brand) => {
    setBrandFilter(brand)
    setLoading(true)
    
    try {
      if (currentDeviceType === 'special') {
        const devices = await deviceApi.getSpecialEquipmentDetails(currentDeviceGroup.name, brand)
        setFilteredDetailedDevices(devices.map(d => ({
          id: d.id,
          deviceId: d.deviceCode,
          name: d.name,
          brand: d.brand,
          model: d.model,
          specification: d.specification,
          unit: d.unit,
          accessories: d.accessories,
          status: d.useStatus
        })))
      } else if (currentDeviceType === 'general') {
        const devices = await deviceApi.getGeneralEquipmentDetails(currentDeviceGroup.name, brand)
        setFilteredDetailedDevices(devices.map(d => ({
          id: d.id,
          deviceId: d.deviceCode,
          name: d.name,
          brand: d.brand,
          model: d.model,
          specification: d.specification,
          unit: d.unit,
          accessories: d.accessories,
          status: d.useStatus
        })))
      }
    } catch (error) {
      console.error('筛选设备详情失败:', error)
      message.error('筛选设备详情失败')
    } finally {
      setLoading(false)
    }
  }

  // 从详情模态框添加设备
  const addDeviceFromDetail = (device) => {
    if (currentDeviceType === 'special') {
      setSelectedSpecialDevices(prev => {
        const existingIndex = prev.findIndex(item => item.deviceId === device.deviceId)
        if (existingIndex >= 0) {
          message.warning('该设备已添加到已选物品中')
          return prev
        } else {
          message.success('设备已添加到已选物品')
          return [...prev, { ...device, quantity: 1 }]
        }
      })
    } else if (currentDeviceType === 'general') {
      setSelectedGeneralDevices(prev => {
        const existingIndex = prev.findIndex(item => item.deviceId === device.deviceId)
        if (existingIndex >= 0) {
          message.warning('该设备已添加到已选物品中')
          return prev
        } else {
          message.success('设备已添加到已选物品')
          return [...prev, { ...device, quantity: 1 }]
        }
      })
    }
  }

  // 处理专用设备选择
  const handleSpecialDeviceSelect = (deviceId, quantity) => {
    const device = specialDevices.find(d => d.id === deviceId)
    if (device) {
      openDeviceDetailModal(device, 'special')
    }
  }

  // 处理通用设备选择
  const handleGeneralDeviceSelect = (deviceId, quantity) => {
    const device = generalDevices.find(d => d.id === deviceId)
    if (device) {
      openDeviceDetailModal(device, 'general')
    }
  }

  // 处理耗材选择
  const handleConsumableSelect = (consumableId, quantity) => {
    const consumable = consumables.find(c => c.id === consumableId)
    if (!consumable) return

    setSelectedConsumables(prev => {
      const existingIndex = prev.findIndex(item => item.id === consumableId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity = quantity
        return updated
      } else {
        return [...prev, { ...consumable, quantity: quantity || 1 }]
      }
    })
  }

  // 移除专用设备
  const removeSpecialDevice = (deviceId) => {
    setSelectedSpecialDevices(prev => prev.filter(item => item.deviceId !== deviceId))
  }

  // 移除通用设备
  const removeGeneralDevice = (deviceId) => {
    setSelectedGeneralDevices(prev => prev.filter(item => item.deviceId !== deviceId))
  }

  // 移除耗材
  const removeConsumable = (consumableId) => {
    setSelectedConsumables(prev => prev.filter(item => item.id !== consumableId))
  }



  // 查看出库详情
  const viewOutboundDetail = (record) => {
    setCurrentOutboundDetail(record)
    setDetailModalVisible(true)
  }

  // 专用设备选择表格列
  const specialDeviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeSpecialDevice(record.deviceId)}
        >
          移除
        </Button>
      )
    }
  ]

  // 通用设备选择表格列
  const generalDeviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeGeneralDevice(record.deviceId)}
        >
          移除
        </Button>
      )
    }
  ]

  // 耗材选择表格列
  const consumableColumns = [
    {
      title: '耗材名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '库存数量',
      dataIndex: 'inventory',
      key: 'inventory'
    },
    {
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <Input.Number 
          min={1} 
          max={record.inventory} 
          defaultValue={1}
          onChange={(value) => handleConsumableSelect(record.id, value)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeConsumable(record.id)}
        >
          移除
        </Button>
      )
    }
  ]

  // 出库历史表格列
  const historyColumns = [
    {
      title: '出库单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => viewOutboundDetail(record)}>查看详情</Button>
      )
    }
  ]

  // 处理新建出库单
  const handleCreateOutbound = async () => {
    form.resetFields()
    setSelectedSpecialDevices([])
    setSelectedGeneralDevices([])
    setSelectedConsumables([])
    
    // 重新获取设备和耗材数据，确保显示最新的数据库数据
    setLoading(true)
    try {
      // 从库存表获取专用设备
      const specialInventoryDevices = await deviceApi.getSpecialInventoryDevices()
      setSpecialDevices(specialInventoryDevices.map(device => ({
        id: device.id,
        equipmentId: device.equipmentId,
        name: device.name,
        brand: device.brand,
        model: device.model,
        specification: device.specification,
        inventory: device.inventoryQuantity || 0,
        unit: device.unit,
        warehouse: device.warehouse
      })))

      // 从库存表获取通用设备
      const generalInventoryDevices = await deviceApi.getGeneralInventoryDevices()
      setGeneralDevices(generalInventoryDevices.map(device => ({
        id: device.id,
        equipmentId: device.equipmentId,
        name: device.name,
        brand: device.brand,
        model: device.model,
        specification: device.specification,
        inventory: device.inventoryQuantity || 0,
        unit: device.unit,
        warehouse: device.warehouse
      })))

      // 从后端获取耗材数据
      const consumablesData = await deviceApi.getConsumables()
      console.log('耗材数据:', consumablesData)
      setConsumables(consumablesData.map(consumable => ({
        id: consumable.id,
        name: consumable.productName,
        model: consumable.brand,
        specification: consumable.specification,
        inventory: consumable.remainingQuantity || 0,
        unit: consumable.unit
      })))
    } catch (error) {
      console.error('获取设备数据失败:', error)
      message.error('获取设备数据失败')
    } finally {
      setLoading(false)
    }
    
    setCreateModalVisible(true)
  }

  // 处理表单提交
  const handleSubmit = (values) => {
    const allItems = [
      ...selectedSpecialDevices.map(item => ({ type: '专用设备', ...item })),
      ...selectedGeneralDevices.map(item => ({ type: '通用设备', ...item })),
      ...selectedConsumables.map(item => ({ type: '耗材', ...item }))
    ]

    if (allItems.length === 0) {
      message.error('请至少选择一项设备或耗材')
      return
    }

    // 模拟提交
    setTimeout(() => {
      const newOutbound = {
        id: outboundHistory.length + 1,
        outboundId: values.outboundId || `OUT${Date.now()}`,
        projectName: values['项目名称'] || '未知项目',
        领用方式: values['领用方式'] || '',
        物流方式: values['物流方式'] || '',
        项目时间: values['项目时间'] || '',
        使用地: values['使用地'] || '',
        项目负责人: values['项目负责人'] || '',
        联系电话: values['联系电话'] || '',
        预计归还时间: values['预计归还时间'] ? values['预计归还时间'].format('YYYY-MM-DD') : '',
        领用人: values['领用人'] || '',
        库管: values['库管'] || '',
        出库时间: values['出库时间'] ? values['出库时间'].format('YYYY-MM-DD') : '',
        remark: values.remark || '',
        status: '已完成',
        items: allItems
      }

      setOutboundHistory(prev => [newOutbound, ...prev])
      message.success('项目出库成功')
      
      // 重置表单和选择
      form.resetFields()
      setSelectedSpecialDevices([])
      setSelectedGeneralDevices([])
      setSelectedConsumables([])
      setCreateModalVisible(false)
    }, 1000)
  }

  return (
    <div className="project-outbound">
      <Card 
        title="项目出库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateOutbound}>
            新建出库单
          </Button>
        }
      >
        <Table 
          columns={historyColumns} 
          dataSource={outboundHistory} 
          rowKey="id"
        />
      </Card>

      {/* 新建出库单模态框 */}
      <Modal
        title="新建出库单"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        width={1400}
        style={{ top: 20, height: '90vh' }}
        styles={{ body: { height: 'calc(90vh - 100px)', overflow: 'auto' } }}
        footer={null}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          initialValues={{
            remark: `1.设备丢失：按照设备实际价格赔偿（不高于市场价）；
2.设备损坏但仍能使用：按照设备实际价格50%赔偿；
3.设备损坏不能使用：按照设备实际价格赔偿（不高于市场价）。`
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6} lg={3.8} xl={3.8}>
              <Form.Item 
                name="outboundId" 
                label="出库单号" 
                initialValue={`PROOUT${Date.now()}`}
              >
                <Input disabled placeholder="系统自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3.8} xl={3.8}>
              <Form.Item 
                name="领用方式" 
                label="领用方式" 
                rules={[{ required: true, message: '请选择领用方式' }]}
              >
                <Select placeholder="请选择领用方式">
                  <Option value="元动自用">元动自用</Option>
                  <Option value="对外租借">对外租借</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={3.8} xl={3.8}>
              <Form.Item 
                name="物流方式" 
                label="物流方式" 
                rules={[{ required: true, message: '请选择物流方式' }]}
              >
                <Select placeholder="请选择物流方式">
                  <Option value="随身携带">随身携带</Option>
                  <Option value="顺丰速运">顺丰速运</Option>
                  <Option value="跨越物流">跨越物流</Option>
                  <Option value="德邦物流">德邦物流</Option>
                  <Option value="其他方式">其他方式</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={5.8} xl={5.8}>
              <Form.Item 
                name="项目名称" 
                label="项目名称" 
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6.8} xl={6.8}>
              <Form.Item 
                name="项目时间" 
                label="项目时间" 
                rules={[{ required: true, message: '请输入项目时间' }]}
              >
                <Input placeholder="请输入项目时间" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item 
                name="使用地" 
                label="使用地" 
                rules={[{ required: true, message: '请输入使用地' }]}
              >
                <Input placeholder="请输入使用地" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item 
                name="项目负责人" 
                label="项目负责人" 
                rules={[{ required: true, message: '请输入项目负责人' }]}
              >
                <Input placeholder="请输入项目负责人" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item 
                name="联系电话" 
                label="联系电话" 
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={6}>
              <Form.Item 
                name="预计归还时间" 
                label="预计归还时间" 
                rules={[{ required: true, message: '请选择预计归还时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="图片" 
            label="图片添加" 
          >
            <Input type="file" multiple />
          </Form.Item>

          <Row gutter={[16, 16]} className="mt-4">
            {/* 左侧：已选物品窗口 */}
            <Col span={12}>
              <Card title="已选物品" variant="outlined">
                <Table 
                  columns={[
                    {
                      title: '类型',
                      dataIndex: 'type',
                      key: 'type'
                    },
                    {
                      title: '设备名称',
                      dataIndex: 'name',
                      key: 'name'
                    },
                    {
                      title: '设备编号',
                      dataIndex: 'deviceId',
                      key: 'deviceId'
                    },
                    {
                      title: '品牌',
                      dataIndex: 'brand',
                      key: 'brand'
                    },
                    {
                      title: '型号',
                      dataIndex: 'model',
                      key: 'model'
                    },
                    {
                      title: '数量',
                      dataIndex: 'quantity',
                      key: 'quantity'
                    },
                    {
                      title: '单位',
                      dataIndex: 'unit',
                      key: 'unit'
                    },
                    {
                      title: '配件',
                      dataIndex: 'accessories',
                      key: 'accessories'
                    },
                    {
                      title: '设备状态',
                      dataIndex: 'status',
                      key: 'status'
                    },
                    {
                      title: '备注',
                      dataIndex: 'remark',
                      key: 'remark'
                    },
                    {
                      title: '操作',
                      key: 'action',
                      render: (_, record) => (
                        <Space>
                          {record.type === '耗材' && (
                            <Input.Number 
                              min={1} 
                              max={record.inventory} 
                              value={record.quantity} 
                              onChange={(value) => handleConsumableSelect(record.id, value)}
                              style={{ width: 80 }}
                            />
                          )}
                          <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={() => {
                              if (record.type === '专用设备') {
                                removeSpecialDevice(record.deviceId);
                              } else if (record.type === '通用设备') {
                                removeGeneralDevice(record.deviceId);
                              } else if (record.type === '耗材') {
                                removeConsumable(record.id);
                              }
                            }}
                          >
                            移除
                          </Button>
                        </Space>
                      )
                    }
                  ]} 
                  dataSource={[
                    ...selectedSpecialDevices.map(item => ({ type: '专用设备', ...item })),
                    ...selectedGeneralDevices.map(item => ({ type: '通用设备', ...item })),
                    ...selectedConsumables.map(item => ({ type: '耗材', ...item }))
                  ]} 
                  rowKey={(record) => record.deviceId || record.id}
                  pagination={false}
                  scroll={{ x: 1200 }}
                />
              </Card>
            </Col>

            {/* 右侧：可选物品窗口 */}
            <Col span={12}>
              <Card title="可选物品" variant="outlined" style={{ height: '500px', overflow: 'auto' }}>
                <Tabs 
                  defaultActiveKey="special-device"
                  items={[
                    {
                      key: 'special-device',
                      label: '专用设备',
                      children: (
                        <div>
                          <div className="mb-4">
                            <Select 
                              placeholder="选择专用设备" 
                              style={{ width: '100%' }}
                              onChange={(value) => handleSpecialDeviceSelect(value, 1)}
                            >
                              {specialDevices.map(device => (
                                <Option key={device.id} value={device.id}>
                                  {device.name} ({device.brand}) - {device.model} - 库存: {device.inventory}
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <Table 
                            columns={[
                              {
                                title: '设备名称',
                                dataIndex: 'name',
                                key: 'name'
                              },
                              {
                                title: '库存数量',
                                dataIndex: 'inventory',
                                key: 'inventory'
                              },
                              {
                                title: '操作',
                                key: 'action',
                                render: (_, record) => (
                                  <Button 
                                    type="primary"
                                    onClick={() => openDeviceDetailModal(record, 'special')}
                                  >
                                    选择
                                  </Button>
                                )
                              }
                            ]} 
                            dataSource={specialDevices} 
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                          />
                        </div>
                      )
                    },
                    {
                      key: 'general-device',
                      label: '通用设备',
                      children: (
                        <div>
                          <div className="mb-4">
                            <Select 
                              placeholder="选择通用设备" 
                              style={{ width: '100%' }}
                              onChange={(value) => handleGeneralDeviceSelect(value, 1)}
                            >
                              {generalDevices.map(device => (
                                <Option key={device.id} value={device.id}>
                                  {device.name} ({device.brand}) - {device.model} - 库存: {device.inventory}
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <Table 
                            columns={[
                              {
                                title: '设备名称',
                                dataIndex: 'name',
                                key: 'name'
                              },
                              {
                                title: '库存数量',
                                dataIndex: 'inventory',
                                key: 'inventory'
                              },
                              {
                                title: '操作',
                                key: 'action',
                                render: (_, record) => (
                                  <Button 
                                    type="primary"
                                    onClick={() => openDeviceDetailModal(record, 'general')}
                                  >
                                    选择
                                  </Button>
                                )
                              }
                            ]} 
                            dataSource={generalDevices} 
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                          />
                        </div>
                      )
                    },
                    {
                      key: 'consumables',
                      label: '耗材',
                      children: (
                        <div>
                          <div className="mb-4">
                            <Select 
                              placeholder="选择耗材" 
                              style={{ width: '100%' }}
                              onChange={(value) => handleConsumableSelect(value, 1)}
                            >
                              {consumables.map(consumable => (
                                <Option key={consumable.id} value={consumable.id}>
                                  {consumable.name} ({consumable.model}) - 库存: {consumable.inventory}
                                </Option>
                              ))}
                            </Select>
                          </div>
                          <Table 
                            columns={[
                              {
                                title: '设备名称',
                                dataIndex: 'name',
                                key: 'name'
                              },
                              {
                                title: '库存数量',
                                dataIndex: 'inventory',
                                key: 'inventory'
                              },
                              {
                                title: '操作',
                                key: 'action',
                                render: (_, record) => (
                                  <Button 
                                    type="primary"
                                    onClick={() => handleConsumableSelect(record.id, 1)}
                                  >
                                    选择
                                  </Button>
                                )
                              }
                            ]} 
                            dataSource={consumables.filter(consumable => 
                              !selectedConsumables.some(item => item.id === consumable.id)
                            )} 
                            rowKey="id"
                            pagination={false}
                            loading={loading}
                          />
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-4">
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="领用人" 
                label="领用人" 
                rules={[{ required: true, message: '请输入领用人' }]}
              >
                <Input placeholder="请输入领用人" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="库管" 
                label="库管" 
                rules={[{ required: true, message: '请输入库管' }]}
              >
                <Input placeholder="请输入库管" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="出库时间" 
                label="出库时间" 
                rules={[{ required: true, message: '请选择出库时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="remark" 
            label="备注"
          >
            <Input.TextArea 
              rows={6} 
              placeholder="请输入备注信息"
            />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              确认出库
            </Button>
            <Button onClick={() => {
              form.resetFields()
              setSelectedSpecialDevices([])
              setSelectedGeneralDevices([])
              setSelectedConsumables([])
              setCreateModalVisible(false)
            }}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 出库详情模态框 */}
      <Modal
        title="出库详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentOutboundDetail && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>出库单号:</strong> {currentOutboundDetail.outboundId}</p>
                <p><strong>项目名称:</strong> {currentOutboundDetail.projectName}</p>
                <p><strong>领用方式:</strong> {currentOutboundDetail['领用方式']}</p>
                <p><strong>物流方式:</strong> {currentOutboundDetail['物流方式']}</p>
                <p><strong>项目时间:</strong> {currentOutboundDetail['项目时间']}</p>
                <p><strong>使用地:</strong> {currentOutboundDetail['使用地']}</p>
              </Col>
              <Col span={12}>
                <p><strong>项目负责人:</strong> {currentOutboundDetail['项目负责人']}</p>
                <p><strong>联系电话:</strong> {currentOutboundDetail['联系电话']}</p>
                <p><strong>预计归还时间:</strong> {currentOutboundDetail['预计归还时间']}</p>
                <p><strong>领用人:</strong> {currentOutboundDetail['领用人']}</p>
                <p><strong>库管:</strong> {currentOutboundDetail['库管']}</p>
                <p><strong>出库时间:</strong> {currentOutboundDetail['出库时间']}</p>
                <p><strong>状态:</strong> {currentOutboundDetail.status}</p>
              </Col>
            </Row>
            <p className="mt-4"><strong>备注:</strong> {currentOutboundDetail.remark || '无'}</p>
            <h4 className="mt-4">出库物品</h4>
            <Table 
              columns={[
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' }
              ]} 
              dataSource={currentOutboundDetail.items} 
              rowKey={(record, index) => index}
              pagination={false}
            />
          </div>
        )}
      </Modal>

      {/* 设备详情模态框 */}
      <Modal
        title={`${currentDeviceGroup?.name} - 详细设备清单`}
        open={deviceDetailModalVisible}
        onCancel={() => setDeviceDetailModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setDeviceDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div className="mb-4">
          <label className="mr-2">按品牌筛选:</label>
          <Select 
            placeholder="选择品牌" 
            style={{ width: 200 }} 
            value={brandFilter}
            onChange={handleBrandFilter}
          >
            <Option value="">全部品牌</Option>
            {Array.from(new Set(filteredDetailedDevices.map(d => d.brand))).map(brand => (
              <Option key={brand} value={brand}>{brand}</Option>
            ))}
          </Select>
        </div>
        <Table 
          columns={[
            { title: '设备编号', dataIndex: 'deviceId', key: 'deviceId' },
            { title: '品牌', dataIndex: 'brand', key: 'brand' },
            { title: '型号', dataIndex: 'model', key: 'model' },
            { title: '规格', dataIndex: 'specification', key: 'specification' },
            { title: '单位', dataIndex: 'unit', key: 'unit' },
            { title: '配件', dataIndex: 'accessories', key: 'accessories' },
            { title: '状态', dataIndex: 'status', key: 'status' },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Button 
                  type="primary"
                  onClick={() => {
                    addDeviceFromDetail(record);
                    message.success('设备已添加到已选物品');
                  }}
                >
                  添加
                </Button>
              )
            }
          ]} 
          dataSource={filteredDetailedDevices} 
          rowKey="deviceId"
          loading={loading}
          pagination={false}
        />
      </Modal>
    </div>
  )
}

export default ProjectOutbound