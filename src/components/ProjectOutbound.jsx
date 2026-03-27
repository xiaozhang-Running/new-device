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
  Col,
  InputNumber,
  Drawer
} from 'antd'

const { TextArea } = Input
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { deviceApi, projectOutboundApi, imageApi } from '../services/api'

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
  
  // 图片上传
  const [selectedImages, setSelectedImages] = useState([])

  // 处理图片选择
  const handleImageChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedImages(Array.from(files))
    }
  }

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
          name: consumable.name,
          model: consumable.brand,
          specification: consumable.modelSpecification,
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

  // 从后端获取出库记录
  useEffect(() => {
    const fetchOutboundHistory = async () => {
      try {
        const response = await projectOutboundApi.getProjectOutbounds()
        console.log('出库记录:', response)
        // 转换数据格式以匹配表格列定义
        const formattedHistory = response.map(item => ({
          id: item.id,
          outboundId: item.outboundNumber,
          projectName: item.projectName,
          projectTime: item.projectTime,
          recipient: item.recipient,
          outboundDate: item.outboundDate ? new Date(item.outboundDate).toISOString().split('T')[0] : '',
          status: item.isCompleted ? '已完成' : '待确认',
          items: item.projectOutboundItems || []
        }))
        setOutboundHistory(formattedHistory)
      } catch (error) {
        console.error('获取出库记录失败:', error)
        message.error('获取出库记录失败')
      }
    }

    fetchOutboundHistory()
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
          status: d.status
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
          status: d.status
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
          status: d.status
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
          status: d.status
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
    // 检查设备是否已添加
    if (currentDeviceType === 'special') {
      const existingIndex = selectedSpecialDevices.findIndex(item => item.deviceId === device.deviceId)
      if (existingIndex >= 0) {
        message.warning('该设备已添加到已选物品中')
        return
      }
      setSelectedSpecialDevices(prev => [...prev, { ...device, quantity: 1 }])
    } else if (currentDeviceType === 'general') {
      const existingIndex = selectedGeneralDevices.findIndex(item => item.deviceId === device.deviceId)
      if (existingIndex >= 0) {
        message.warning('该设备已添加到已选物品中')
        return
      }
      setSelectedGeneralDevices(prev => [...prev, { ...device, quantity: 1 }])
    }
    message.success('设备已添加到已选物品')
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
        <InputNumber 
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
      dataIndex: 'outboundId',
      key: 'outboundId'
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
      title: '项目时间',
      dataIndex: 'projectTime',
      key: 'projectTime'
    },
    {
      title: '领用人',
      dataIndex: 'recipient',
      key: 'recipient'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <div title={`项目名称: ${record.projectName}\n项目时间: ${record.projectTime}`}>
          {text}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => viewOutboundDetail(record)}>查看详情</Button>
          {record.status === '待确认' && (
            <Button type="primary" onClick={() => confirmOutbound(record.id)}>确认出库</Button>
          )}
          <Button danger onClick={() => deleteOutbound(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  // 处理新建出库单
  const handleCreateOutbound = async () => {
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
        name: consumable.name,
        model: consumable.brand,
        specification: consumable.modelSpecification,
        inventory: consumable.remainingQuantity || 0,
        unit: consumable.unit
      })))
    } catch (error) {
      console.error('获取设备数据失败:', error)
      message.error('获取设备数据失败')
    } finally {
      setLoading(false)
      // 显示模态框
      setCreateModalVisible(true)
      // 模态框显示后重置表单
      setTimeout(() => {
        form.resetFields()
      }, 100)
    }
  }

  // 确认出库操作
  const confirmOutbound = async (outboundId) => {
    try {
      await projectOutboundApi.completeProjectOutbound(outboundId)
      
      // 重新获取出库记录，确保项目名称和项目时间正确显示
      const updatedOutbounds = await projectOutboundApi.getProjectOutbounds(false);
      const outboundHistoryData = updatedOutbounds.map(outbound => ({
        id: outbound.id,
        outboundId: outbound.outboundNumber,
        projectName: outbound.projectName,
        projectTime: outbound.projectTime,
        recipient: outbound.recipient,
        outboundDate: outbound.outboundDate ? new Date(outbound.outboundDate).toISOString().split('T')[0] : '',
        status: outbound.isCompleted ? '已完成' : '待确认',
        items: [] // 简化处理，实际应用中可以从outbound.ProjectOutboundItems获取
      }));
      setOutboundHistory(outboundHistoryData);
      
      message.success('出库确认成功')
    } catch (error) {
      console.error('确认出库失败:', error);
      message.error('出库确认失败：' + (error.message || '未知错误'))
    }
  }

  // 删除出库记录
  const deleteOutbound = async (outboundId) => {
    try {
      await projectOutboundApi.deleteProjectOutbound(outboundId)
      setOutboundHistory(prev => prev.filter(item => item.id !== outboundId))
      message.success('出库记录已删除')
    } catch (error) {
      if (error.message.includes('404')) {
        message.error('出库记录不存在，删除失败')
      } else {
        message.error('删除出库记录失败：' + error.message)
      }
    }
  }

  // 处理表单提交
  const handleSubmit = async (values) => {
    console.log('开始提交出库单:', values);
    const now = new Date().toISOString();
    const projectOutboundItems = [
      ...selectedSpecialDevices.map(item => ({
        ItemType: 1, // 1表示专用设备
        ItemId: item.id || item.deviceId || 0,
        ItemName: item.name,
        DeviceCode: item.deviceCode,
        Brand: item.brand,
        Model: item.model,
        Quantity: item.quantity || 1,
        Unit: item.unit,
        Accessories: item.accessories,
        Remark: item.remark,
        DeviceStatus: item.status,
        CreatedAt: now
      })),
      ...selectedGeneralDevices.map(item => ({
        ItemType: 2, // 2表示通用设备
        ItemId: item.id || item.deviceId || 0,
        ItemName: item.name,
        DeviceCode: item.deviceCode,
        Brand: item.brand,
        Model: item.model,
        Quantity: item.quantity || 1,
        Unit: item.unit,
        Accessories: item.accessories,
        Remark: item.remark,
        DeviceStatus: item.status,
        CreatedAt: now
      })),
      ...selectedConsumables.map(item => ({
        ItemType: 3, // 3表示耗材
        ItemId: item.id || 0,
        ItemName: item.name,
        DeviceCode: item.deviceCode,
        Brand: item.brand,
        Model: item.model,
        Quantity: item.quantity || 1,
        Unit: item.unit,
        Accessories: item.accessories,
        Remark: item.remark,
        DeviceStatus: item.status,
        CreatedAt: now
      }))
    ]

    console.log('已选物品数量:', projectOutboundItems.length);
    if (projectOutboundItems.length === 0) {
      message.error('请至少选择一项设备或耗材')
      return
    }

    try {
      // 检查项目名称是否重复
      console.log('开始检查项目名称重复');
      let projectName = values['项目名称'] || '未知项目';
      console.log('原始项目名称:', projectName);
      const existingOutbounds = await projectOutboundApi.getProjectOutbounds();
      console.log('已存在的出库单数量:', existingOutbounds.length);
      const isDuplicate = existingOutbounds.some(outbound => 
        outbound.ProjectName === projectName && !outbound.ProjectName.includes('补发')
      );
      console.log('是否重复:', isDuplicate);
      
      if (isDuplicate) {
        projectName += ' 补发';
        console.log('修改后的项目名称:', projectName);
      }

      // 先创建出库单，不包含图片
      const outboundData = {
        OutboundNumber: 'temp', // 临时值，后端会覆盖
        OutboundDate: values['出库时间'] ? values['出库时间'].toISOString() : new Date().toISOString(),
        ProjectName: projectName,
        ProjectTime: values['项目时间'] || '',
        ProjectManager: values['项目负责人'] || '',
        Recipient: values['领用人'] || '',
        OutboundType: values['领用方式'] || '',
        ContactPhone: values['联系电话'] || '',
        UsageLocation: values['使用地'] || '',
        ReturnDate: values['预计归还时间'] ? values['预计归还时间'].toISOString() : null,
        WarehouseKeeper: values['库管'] || '',
        LogisticsMethod: null,
        OutboundImages: '', // 先空着，后续更新
        Remark: values.remark || '',
        ProjectOutboundItems: projectOutboundItems.map(item => {
          // 只保留必要的字段，完全移除Outbound字段
          return {
            ItemType: item.ItemType,
            ItemId: Number(item.ItemId),
            ItemName: item.ItemName,
            DeviceCode: item.DeviceCode || '',
            Brand: item.Brand || '',
            Model: item.Model || '',
            Quantity: item.Quantity || 1,
            Unit: item.Unit || '',
            Accessories: item.Accessories || '',
            Remark: item.Remark || '',
            DeviceStatus: item.DeviceStatus || '',
            CreatedAt: item.CreatedAt
          };
        })
      }

      console.log('发送出库单数据:', outboundData);
      console.log('开始调用createProjectOutbound');
      const createResponse = await projectOutboundApi.createProjectOutbound(outboundData);
      console.log('createProjectOutbound响应:', createResponse);
      
      // 上传图片
      let imageUrls = ''
      if (selectedImages.length > 0) {
        setLoading(true)
        const uploadPromises = selectedImages.map(async (image) => {
          const formData = new FormData()
          formData.append('file', image)
          try {
            const uploadResponse = await imageApi.uploadInOutboundImage(createResponse.id, 'outbound', formData)
            return uploadResponse
          } catch (error) {
            console.error('上传图片失败:', error)
            return null
          }
        })
        const results = await Promise.all(uploadPromises)
        const imagePaths = results.filter(url => url).flat() // 后端返回的是数组
        imageUrls = imagePaths.join(',')
        setLoading(false)
        
        // 更新出库单，添加图片URL
        if (imageUrls) {
          await projectOutboundApi.updateProjectOutbound(createResponse.id, {
            OutboundImages: imageUrls
          })
        }
      }

      const newOutbound = {
        id: createResponse.id,
        outboundId: createResponse.outboundNumber,
        projectName: createResponse.projectName,
        projectTime: createResponse.projectTime,
        recipient: createResponse.recipient,
        outboundDate: createResponse.outboundDate ? new Date(createResponse.outboundDate).toISOString().split('T')[0] : '',
        status: '待确认',
        items: projectOutboundItems
      }

      setOutboundHistory(prev => [newOutbound, ...prev])
      message.success('项目出库单提交成功')
      
      // 重置表单和选择
      form.resetFields()
      setSelectedSpecialDevices([])
      setSelectedGeneralDevices([])
      setSelectedConsumables([])
      setSelectedImages([])
      setCreateModalVisible(false)
    } catch (error) {
      console.error('提交出库单失败:', error);
      message.error('项目出库单提交失败：' + (error.message || '未知错误'))
    }
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
        width={1600}
        style={{ top: 10, height: '95vh' }}
        styles={{ body: { height: 'calc(95vh - 100px)', overflow: 'auto' } }}
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
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Form.Item 
                name="outboundId" 
                label="出库单号" 
                initialValue={`PROOUT${Date.now()}`}
              >
                <Input disabled placeholder="系统自动生成" />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
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
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
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
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Form.Item 
                name="项目名称" 
                label="项目名称" 
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <Form.Item 
                name="项目时间" 
                label="项目时间" 
                rules={[{ required: true, message: '请输入项目时间' }]}
              >
                <Input placeholder="请输入项目时间" />
              </Form.Item>
            </div>
          </div>

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
            label="图片添加" 
          >
            <Input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            {selectedImages.length > 0 && (
              <div className="mt-2">
                <p>已选择 {selectedImages.length} 张图片</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedImages.map((file, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`预览 ${index + 1}`} 
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '12px', marginTop: '4px' }}>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Form.Item>

          <Row gutter={[16, 16]} className="mt-4">
            {/* 左侧：已选物品窗口 */}
            <Col span={16}>
              <Card title="已选物品" variant="outlined" style={{ height: '500px', overflow: 'auto' }}>
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {record.type === '耗材' && (
                            <InputNumber 
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
                        </div>
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
            <Col span={8}>
              <Card title="可选物品" variant="outlined" style={{ height: '700px' }}>
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
                          <div style={{ height: '550px', overflow: 'auto' }}>
                            <Table 
                              columns={[
                                {
                                  title: '设备名称',
                                  dataIndex: 'name',
                                  key: 'name',
                                  width: '50%'
                                },
                                {
                                  title: '库存数量',
                                  dataIndex: 'inventory',
                                  key: 'inventory',
                                  width: '30%'
                                },
                                {
                                  title: '操作',
                                  key: 'action',
                                  width: '20%',
                                  render: (_, record) => (
                                    <Button 
                                      type="primary"
                                      onClick={() => openDeviceDetailModal(record, 'special')}
                                      style={{ width: '100%' }}
                                    >
                                      选择
                                    </Button>
                                  )
                                }
                              ]} 
                              dataSource={specialDevices} 
                              rowKey="id"
                              loading={loading}
                              pagination={{ 
                                pageSize: 5, 
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total) => `共 ${total} 条记录`,
                                showQuickJumper: true,
                                size: 'small',
                                position: 'bottom'
                              }}
                              style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
                            />
                          </div>
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
                          <div style={{ height: '550px', overflow: 'auto' }}>
                            <Table 
                              columns={[
                                {
                                  title: '设备名称',
                                  dataIndex: 'name',
                                  key: 'name',
                                  width: '50%'
                                },
                                {
                                  title: '库存数量',
                                  dataIndex: 'inventory',
                                  key: 'inventory',
                                  width: '30%'
                                },
                                {
                                  title: '操作',
                                  key: 'action',
                                  width: '20%',
                                  render: (_, record) => (
                                    <Button 
                                      type="primary"
                                      onClick={() => openDeviceDetailModal(record, 'general')}
                                      style={{ width: '100%' }}
                                    >
                                      选择
                                    </Button>
                                  )
                                }
                              ]} 
                              dataSource={generalDevices} 
                              rowKey="id"
                              loading={loading}
                              pagination={{ 
                                pageSize: 5, 
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total) => `共 ${total} 条记录`,
                                showQuickJumper: true,
                                size: 'small',
                                position: 'bottom'
                              }}
                              style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
                            />
                          </div>
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
                          <div style={{ height: '550px', overflow: 'auto' }}>
                            <Table 
                              columns={[
                                {
                                  title: '设备名称',
                                  dataIndex: 'name',
                                  key: 'name',
                                  width: '50%'
                                },
                                {
                                  title: '库存数量',
                                  dataIndex: 'inventory',
                                  key: 'inventory',
                                  width: '30%'
                                },
                                {
                                  title: '操作',
                                  key: 'action',
                                  width: '20%',
                                  render: (_, record) => (
                                    <Button 
                                      type="primary"
                                      onClick={() => handleConsumableSelect(record.id, 1)}
                                      style={{ width: '100%' }}
                                    >
                                      选择
                                    </Button>
                                  )
                                }
                              ]} 
                              dataSource={consumables} 
                              rowKey="id"
                              pagination={{ 
                                pageSize: 5, 
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showTotal: (total) => `共 ${total} 条记录`,
                                showQuickJumper: true,
                                size: 'small',
                                position: 'bottom'
                              }}
                              loading={loading}
                              style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Form.Item 
            name="remark" 
            label="备注"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入备注信息"
            />
          </Form.Item>

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

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              提交出库
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

      {/* 设备详情抽屉 */}
      <Drawer
        title={`${currentDeviceGroup?.name} - 详细设备清单`}
        placement="right"
        onClose={() => setDeviceDetailModalVisible(false)}
        open={deviceDetailModalVisible}
        width={1000}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    addDeviceFromDetail(record);
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
      </Drawer>
    </div>
  )
}

export default ProjectOutbound