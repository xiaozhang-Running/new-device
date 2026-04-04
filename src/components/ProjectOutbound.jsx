import { useState, useEffect, useRef } from 'react'
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
  Drawer,
  Upload
} from 'antd'

const { TextArea } = Input
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { deviceApi, projectOutboundApi, imageApi } from '../services/api'
import { useReactToPrint } from 'react-to-print'
import moment from 'moment'



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
  const [createModalVisible, setCreateModalVisible] = useState(false)
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
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [previewData, setPreviewData] = useState({
    outboundId: '',
    领用方式: '',
    物流方式: '',
    项目名称: '',
    项目时间: '',
    使用地: '',
    项目负责人: '',
    联系电话: '',
    预计归还时间: '',
    经办人: '',
    库管: '',
    出库时间: '',
    remark: '',
    items: [],
    images: []
  })
  
  // 编辑模式状态
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentEditId, setCurrentEditId] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentOutboundDetail, setCurrentOutboundDetail] = useState(null)

  // 打印ref
  const printRef = useRef(null)

  // 配置react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `项目出库单-${previewData.outboundId || '预览'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 8px;
          line-height: 0.9;
          margin: 0 !important;
          padding: 0 !important;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .preview-content {
          max-height: none !important;
          overflow: visible !important;
          margin: 0 auto !important;
          padding: 0 !important;
          width: 100%;
          max-width: 210mm;
        }
        table {
          page-break-inside: auto;
          line-height: 0.9;
          margin: 2px 0 !important;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
          line-height: 0.9;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        table, th, td {
          font-size: 9px;
          line-height: 0.9;
          padding: 1px !important;
          font-weight: normal !important;
          font-style: normal !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-size: 11px;
          line-height: 0.9;
          margin: 0.1em 0 !important;
          padding: 0 !important;
        }
        p {
          font-size: 8px;
          line-height: 0.9;
          margin: 0 !important;
          padding: 0 !important;
        }
        .preview-content h1 {
          font-size: 14px !important;
          line-height: 0.9;
          margin: 0.15em 0 !important;
        }
        .preview-content h3 {
          font-size: 10px !important;
          line-height: 0.9;
          margin: 0.1em 0 !important;
        }
        /* 出库单号样式 */
        .preview-content > div:nth-child(2) p:first-child {
          font-size: 10px !important;
        }
        /* 已选物品表格样式 */
        .preview-content > div:nth-child(3) table {
          font-size: 9px !important;
        }
        .preview-content > div:nth-child(3) table th,
        .preview-content > div:nth-child(3) table td {
          font-size: 9px !important;
          font-weight: normal !important;
          font-style: normal !important;
        }
        /* 备注栏样式 */
        .preview-content > div:nth-child(4) {
          font-size: 9px !important;
          font-style: italic !important;
          font-weight: bold !important;
          margin: 0.15em 0 !important;
        }
        .preview-content > div:nth-child(4) div {
          font-size: 9px !important;
          font-style: italic !important;
          font-weight: bold !important;
          line-height: 1.2;
          margin: 0.05em 0 !important;
          padding: 4px !important;
          min-height: 30px !important;
        }
        /* 签收信息样式 */
        .preview-content > div:nth-child(5) p {
          font-size: 10px !important;
        }
        /* 减小div之间的间距 */
        .preview-content > div {
          margin: 2px 0 !important;
          padding: 8px !important;
        }
        /* 减小表格内边距 */
        .preview-content table {
          border-collapse: collapse !important;
        }
        /* 减小标题与内容之间的间距 */
        .preview-content h3 {
          margin-bottom: 8px !important;
        }
      }
    `,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        // 确保内容已渲染
        setTimeout(resolve, 100)
      })
    },
    onAfterPrint: () => {
      message.success('打印完成')
    },
    onPrintError: (error) => {
      message.error('打印失败: ' + error.message)
    }
  })

  // 处理图片选择
  const handleImageChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedImages(Array.from(files))
    }
  }

  // 从后端获取设备数据（从库存表）
  const fetchDevices = async () => {
    setLoading(true)
    try {
      // 禁用缓存，确保获取最新数据
      const specialInventoryDevices = await deviceApi.getSpecialInventoryDevices(false)
      console.log('库存专用设备数据:', specialInventoryDevices)
      console.log('库存专用设备数量:', specialInventoryDevices.length)
      
      // 检查数据格式
      if (Array.isArray(specialInventoryDevices)) {
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
      } else {
        console.error('专用设备数据格式错误:', specialInventoryDevices)
        setSpecialDevices([])
      }

      // 禁用缓存，确保获取最新数据
      const generalInventoryDevices = await deviceApi.getGeneralInventoryDevices(false)
      console.log('库存通用设备数据:', generalInventoryDevices)
      console.log('库存通用设备数量:', generalInventoryDevices.length)
      
      // 检查数据格式
      if (Array.isArray(generalInventoryDevices)) {
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
      } else {
        console.error('通用设备数据格式错误:', generalInventoryDevices)
        setGeneralDevices([])
      }

      // 禁用缓存，确保获取最新数据
      const consumablesData = await deviceApi.getConsumables(false)
      console.log('耗材数据:', consumablesData)
      console.log('耗材数量:', consumablesData.length)
      
      // 检查数据格式
      if (Array.isArray(consumablesData)) {
        setConsumables(consumablesData.map(consumable => ({
          id: consumable.id || consumable.Id, // 支持大小写ID
          name: consumable.name,
          model: consumable.brand,
          specification: consumable.modelSpecification,
          inventory: consumable.remainingQuantity || 0,
          unit: consumable.unit
        })))
      } else {
        console.error('耗材数据格式错误:', consumablesData)
        setConsumables([])
      }
    } catch (error) {
      console.error('获取设备数据失败:', error)
      message.error('获取设备数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件初始化时获取设备数据
  useEffect(() => {
    fetchDevices()
  }, [])

  // 从后端获取出库记录
  useEffect(() => {
    const fetchOutboundHistory = async () => {
      try {
        console.log('开始获取出库记录...')
        // 清除缓存，确保获取最新数据
        if (window.cacheManager) {
          console.log('清除出库记录缓存')
          window.cacheManager.invalidate('project-outbounds')
        }
        const response = await projectOutboundApi.getProjectOutbounds(false) // 禁用缓存
        console.log('出库记录响应:', response)
        // 检查响应数据的结构
        if (response.length > 0) {
          console.log('第一个出库记录的结构:', response[0])
          console.log('第一个出库记录的所有键:', Object.keys(response[0]))
          console.log('第一个出库记录的ProjectOutboundItems:', response[0].ProjectOutboundItems)
          console.log('第一个出库记录的projectOutboundItems:', response[0].projectOutboundItems)
        }
        // 转换数据格式以匹配表格列定义
        const formattedHistory = response.map(item => {
          // 处理ProjectOutboundItems字段
          let items = []
          if (item.Items && Array.isArray(item.Items)) {
            items = item.Items
          } else if (item.ProjectOutboundItems && Array.isArray(item.ProjectOutboundItems)) {
            items = item.ProjectOutboundItems
          } else if (item.projectOutboundItems && Array.isArray(item.projectOutboundItems)) {
            items = item.projectOutboundItems
          }
          console.log('处理出库记录:', item.outboundNumber || item.OutboundNumber, 'items数量:', items.length)
          
          return {
        id: item.id,
        outboundId: item.outboundNumber || item.OutboundNumber || item.outboundId || item.OutboundId,
        projectName: item.projectName || item.ProjectName || item.Project || item.project,
        projectTime: item.projectTime || item.ProjectTime || item.ProjectDate || item.projectDate,
        projectLeader: item.projectManager || item.ProjectManager || item.projectLeader || item.ProjectLeader || item.负责人 || item.项目负责人,
        recipient: item.recipient || item.Recipient || item.operator || item.Operator || item.经办人,
        expectedReturnTime: item.returnDate || (item.ReturnDate ? new Date(item.ReturnDate).toISOString().split('T')[0] : '') || item.expectedReturnTime || item.ExpectedReturnTime || (item.预计归还时间 ? new Date(item.预计归还时间).toISOString().split('T')[0] : ''),
        usageType: item.outboundType || item.OutboundType || item.usageType || item.UsageType || item.领用类型 || item.出库类型,
        logisticsMethod: item.logisticsMethod || item.LogisticsMethod || item.logistics || item.Logistics || item.物流方式,
        outboundDate: item.outboundDate ? new Date(item.outboundDate).toISOString().split('T')[0] : (item.OutboundDate ? new Date(item.OutboundDate).toISOString().split('T')[0] : '') || (item.出库时间 ? new Date(item.出库时间).toISOString().split('T')[0] : ''),
        status: item.isCompleted ? '已完成' : '待确认',
        inboundStatus: item.inboundStatus || item.InboundStatus || '未入库',
        outboundType: item.outboundType || item.OutboundType || item.usageType || item.UsageType,
        usageLocation: item.usageLocation || item.UsageLocation || item.使用地 || item.使用地点,
        contactPhone: item.contactPhone || item.ContactPhone || item.phone || item.Phone || item.联系电话,
        warehouseKeeper: item.warehouseKeeper || item.WarehouseKeeper || item.库管 || item.仓库管理员,
        remark: item.remark || item.Remark || item.备注,
        items: items,
        OutboundImages: item.outboundImages || item.OutboundImages || ''
      }
        })
        console.log('格式化后的出库记录:', formattedHistory)
        setOutboundHistory(formattedHistory)
        console.log('出库记录获取成功')
      } catch (error) {
        console.error('获取出库记录失败:', error)
        console.error('错误堆栈:', error.stack)
        message.error('获取出库记录失败: ' + (error.message || '未知错误'))
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
      console.log('打开设备详情模态框:', device, '设备类型:', deviceType)
      console.log('设备名称:', device.name, '品牌:', device.brand)
      
      if (deviceType === 'special') {
        console.log('调用getSpecialEquipmentDetails API')
        const devices = await deviceApi.getSpecialEquipmentDetails(device.name, device.brand)
        console.log('专用设备详情:', devices)
        console.log('专用设备数量:', devices.length)
        // 检查设备详情数据中的deviceCode字段
        if (devices.length > 0) {
          console.log('第一个设备的完整数据:', devices[0])
          console.log('第一个设备的deviceCode:', devices[0].deviceCode)
          console.log('第一个设备的DeviceCode:', devices[0].DeviceCode)
          console.log('第一个设备的id:', devices[0].id)
        }
        setFilteredDetailedDevices(devices.map(d => ({
              id: d.id || d.Id || 0,
              deviceId: d.deviceCode || d.DeviceCode || (d.id || d.Id || 0).toString(),
              deviceCode: d.deviceCode || d.DeviceCode || '',
              serialNumber: d.serialNumber || d.SerialNumber || '',
              name: d.name || d.Name || currentDeviceGroup?.name || '',
              brand: d.brand || d.Brand,
              model: d.model || d.Model,
              specification: d.specification || d.Specification,
              unit: d.unit || d.Unit,
              accessories: d.accessories || d.Accessories,
              status: d.status || d.Status
            })))
      } else if (deviceType === 'general') {
        console.log('调用getGeneralEquipmentDetails API')
        const devices = await deviceApi.getGeneralEquipmentDetails(device.name, device.brand)
        console.log('通用设备详情:', devices)
        console.log('通用设备数量:', devices.length)
        // 检查设备详情数据中的deviceCode字段
        if (devices.length > 0) {
          console.log('第一个设备的deviceCode:', devices[0].deviceCode)
          console.log('第一个设备的DeviceCode:', devices[0].DeviceCode)
        }
        setFilteredDetailedDevices(devices.map(d => ({
              id: d.id || d.Id || 0,
              deviceId: d.deviceCode || d.DeviceCode || (d.id || d.Id || 0).toString(),
              deviceCode: d.deviceCode || d.DeviceCode || '',
              serialNumber: d.serialNumber || d.SerialNumber || '',
              name: d.name || d.Name || currentDeviceGroup?.name || '',
              brand: d.brand || d.Brand,
              model: d.model || d.Model,
              specification: d.specification || d.Specification,
              unit: d.unit || d.Unit,
              accessories: d.accessories || d.Accessories,
              status: d.status || d.Status
            })))
      }
    } catch (error) {
      console.error('获取设备详情失败:', error)
      console.error('错误堆栈:', error.stack)
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
              id: d.id || d.Id,
              deviceId: d.deviceCode || d.DeviceCode || (d.id || d.Id).toString(),
              deviceCode: d.deviceCode || d.DeviceCode || '',
              serialNumber: d.serialNumber || d.SerialNumber || '',
              name: d.name || currentDeviceGroup?.name || '',
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
              id: d.id || d.Id,
              deviceId: d.deviceCode || d.DeviceCode || (d.id || d.Id).toString(),
              deviceCode: d.deviceCode || d.DeviceCode || '',
              serialNumber: d.serialNumber || d.SerialNumber || '',
              name: d.name || currentDeviceGroup?.name || '',
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
    // 检查是否是修改已选耗材的数量
    const existingIndex = selectedConsumables.findIndex(item => item.id === consumableId)
    if (existingIndex >= 0) {
      // 更新已选耗材的数量
      setSelectedConsumables(prev => {
        const updated = [...prev]
        updated[existingIndex].quantity = quantity
        return updated
      })
    } else {
      // 添加新的耗材
      const consumable = consumables.find(c => c.id === consumableId)
      if (consumable) {
        setSelectedConsumables(prev => [...prev, { ...consumable, quantity: quantity || 1 }])
      }
    }
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





  // 预览出库记录
  const previewOutbound = async (record) => {
    console.log('预览出库记录:', record)
    console.log('出库记录所有键:', Object.keys(record))
    console.log('出库记录items:', record.items)
    
    // 总是从后端获取完整的出库记录数据，确保所有字段都能正确显示
    let items = record.items || []
    let fullRecord = record
    try {
      fullRecord = await projectOutboundApi.getProjectOutbound(record.id)
      console.log('从后端获取的完整记录:', fullRecord)
      // 尝试从不同字段名获取物品数据
      items = fullRecord.Items || fullRecord.items || fullRecord.ProjectOutboundItems || fullRecord.projectOutboundItems || []
      console.log('从后端获取的items:', items)
    } catch (error) {
      console.error('获取完整出库记录失败:', error)
    }
    
    // 构建预览数据
    const projectOutboundItems = []
    
    // 遍历所有物品，获取设备编号
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`第${i}个物品:`, item)
      
      // 处理字段名大小写问题
      const itemType = item.ItemType || item.itemType
      const itemName = item.ItemName || item.itemName || item.name
      let deviceCode = item.DeviceCode || item.deviceCode || item.deviceId || item.deviceID || ''
      const serialNumber = item.SerialNumber || item.serialNumber || ''
      const brand = item.Brand || item.brand
      const model = item.Model || item.model
      const quantity = item.Quantity || item.quantity
      const unit = item.Unit || item.unit
      const accessories = item.Accessories || item.accessories || ''
      const deviceStatus = item.DeviceStatus || item.deviceStatus || item.status || '正常'
      
      // 直接使用ProjectOutboundItem中的DeviceCode字段，不再尝试根据ItemId获取设备详情
      // 因为ItemId可能不是设备的实际ID，而是ProjectOutboundItem的ID
      
      console.log(`第${i}个物品处理后的字段:`, { itemType, itemName, deviceCode, brand, model, quantity, unit, accessories, deviceStatus })
      
      projectOutboundItems.push({
        ...item,
        type: itemType === 1 ? '专用设备' : itemType === 2 ? '通用设备' : '耗材',
        name: itemName,
        deviceId: deviceCode || '',
        serialNumber: serialNumber || '',
        brand: brand || '',
        model: model || '',
        quantity: quantity,
        unit: unit || '',
        accessories: accessories || '',
        status: deviceStatus || ''
      })
    }
    console.log('映射后的items:', projectOutboundItems)
    
    // 处理fullRecord字段大小写问题
    const outboundId = fullRecord.outboundId || fullRecord.OutboundId || fullRecord.outboundNumber || fullRecord.OutboundNumber || ''
    const outboundType = fullRecord.outboundType || fullRecord.OutboundType || ''
    // 将物流方式数字值转换为对应的字符串值
    const logisticsMethodNum = fullRecord.logisticsMethod || fullRecord.LogisticsMethod
    const logisticsMethod = {
      1: '随身携带',
      2: '顺丰速运',
      3: '跨越物流',
      4: '德邦物流',
      5: '其他方式'
    }[logisticsMethodNum] || ''
    const projectName = fullRecord.projectName || fullRecord.ProjectName || ''
    const projectTime = fullRecord.projectTime || fullRecord.ProjectTime || ''
    const usageLocation = fullRecord.usageLocation || fullRecord.UsageLocation || ''
    const projectManager = fullRecord.projectManager || fullRecord.ProjectManager || ''
    const contactPhone = fullRecord.contactPhone || fullRecord.ContactPhone || ''
    const returnDate = fullRecord.returnDate || fullRecord.ReturnDate || ''
    const recipient = fullRecord.recipient || fullRecord.Recipient || ''
    const warehouseKeeper = fullRecord.warehouseKeeper || fullRecord.WarehouseKeeper || ''
    // 确保正确获取出库日期
    const outboundDate = fullRecord.outboundDate || fullRecord.OutboundDate || ''
    const remark = fullRecord.remark || fullRecord.Remark || ''
    
    console.log('处理后的record字段:', { outboundId, outboundType, logisticsMethod, projectName, projectTime, usageLocation, projectManager, contactPhone, returnDate, recipient, warehouseKeeper, outboundDate, remark })
    
    // 加载图片
    const imageField = fullRecord.outboundImages || fullRecord.OutboundImages || ''
    console.log('图片字段值:', imageField)
    const images = []
    
    // 直接从后端获取图片列表，不依赖OutboundImages字段
    if (fullRecord.id) {
      try {
        // baseUrl 已经是 http://192.168.10.72:5057/api，所以不需要再添加 /api
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.72:5057/api'
        console.log('尝试获取出入库图片列表，出库单ID:', fullRecord.id)
        
        // 直接使用fetch API获取图片列表，绕过缓存
        const token = localStorage.getItem('token')
        const imageListResponse = await fetch(`${baseUrl}/Image/in-outbound/${fullRecord.id}?orderType=1`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        })
        
        if (imageListResponse.ok) {
          const imageList = await imageListResponse.json()
          console.log('获取到的图片列表:', imageList)
          
          if (imageList && imageList.length > 0) {
            // 使用后端返回的图片数据
            for (const img of imageList) {
              // 尝试获取图片ID，支持大小写
              const imageId = img.id || img.Id || img.ID
              console.log('获取到的图片ID:', imageId)
              
              if (imageId) {
                // 使用正确的API端点获取图片数据
                // baseUrl 已经包含 /api，所以只需要添加 /Image/data/${imageId}
                const imageUrl = `${baseUrl}/Image/data/${imageId}`
                // 尝试使用fetch API获取图片数据，并带上Authorization token
                try {
                  const response = await fetch(imageUrl, {
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : ''
                    }
                  })
                  if (response.ok) {
                    // 将图片数据转换为Data URL
                    const blob = await response.blob()
                    const dataUrl = URL.createObjectURL(blob)
                    images.push(dataUrl)
                    console.log('成功获取图片数据:', dataUrl)
                  } else {
                    console.error('获取图片失败:', response.status)
                    images.push(imageUrl)
                  }
                } catch (error) {
                  console.error('获取图片失败:', error)
                  images.push(imageUrl)
                }
              }
            }
          } else if (imageField) {
            // 如果无法获取图片列表，但有原始URL，使用原始URL
            console.log('加载图片:', imageField)
            const imageUrls = imageField.split(',').filter(url => url && url.trim())
            console.log('图片URLs:', imageUrls)
            
            if (imageUrls.length > 0) {
              for (const url of imageUrls) {
                const fullUrl = url.startsWith('http') ? url : baseUrl + url
                images.push(fullUrl)
              }
            }
          }
        } else {
          console.error('获取图片列表失败:', imageListResponse.status)
          // 即使失败，如果有原始URL，使用原始URL
          if (imageField) {
            const imageUrls = imageField.split(',').filter(url => url && url.trim())
            for (const url of imageUrls) {
              const fullUrl = url.startsWith('http') ? url : baseUrl + url
              images.push(fullUrl)
            }
          }
        }
      } catch (error) {
        console.error('加载图片失败:', error)
        // 即使失败，如果有原始URL，使用原始URL
        if (imageField) {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.72:5057/api'
          const imageUrls = imageField.split(',').filter(url => url && url.trim())
          for (const url of imageUrls) {
            const fullUrl = url.startsWith('http') ? url : baseUrl + url
            images.push(fullUrl)
          }
        }
      }
    } else if (imageField) {
      // 如果没有出库单ID，但有原始URL，使用原始URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.10.72:5057/api'
      const imageUrls = imageField.split(',').filter(url => url && url.trim())
      for (const url of imageUrls) {
        const fullUrl = url.startsWith('http') ? url : baseUrl + url
        images.push(fullUrl)
      }
    }
    
    console.log('最终图片列表:', images)
    
    const previewDataObj = {
      outboundId: outboundId,
      领用方式: outboundType,
      物流方式: logisticsMethod,
      项目名称: projectName,
      项目时间: projectTime,
      使用地: usageLocation,
      项目负责人: projectManager,
      联系电话: contactPhone,
      预计归还时间: returnDate ? new Date(returnDate).toISOString().split('T')[0] : '',
      经办人: recipient,
      库管: warehouseKeeper,
      出库时间: outboundDate ? new Date(outboundDate).toISOString().split('T')[0] : '',
      remark: remark,
      items: projectOutboundItems,
      images: images // 出库记录的图片
    }
    console.log('预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    
    // 强制重新渲染，确保数据更新后再显示模态框
    setTimeout(() => {
      console.log('设置预览模态框为可见')
      setPreviewModalVisible(true)
    }, 100)
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
      title: '项目时间',
      dataIndex: 'projectTime',
      key: 'projectTime'
    },
    {
      title: '项目负责人',
      dataIndex: 'projectLeader',
      key: 'projectLeader'
    },
    {
      title: '经办人',
      dataIndex: 'recipient',
      key: 'recipient'
    },
    {
      title: '预计归还时间',
      dataIndex: 'expectedReturnTime',
      key: 'expectedReturnTime',
      render: (text) => {
        if (!text) return ''
        // 确保只显示日期部分，不显示时间部分
        if (text.includes('T')) {
          return text.split('T')[0]
        }
        return text
      }
    },
    {
      title: '领用类型',
      dataIndex: 'usageType',
      key: 'usageType'
    },
    {
      title: '物流方式',
      dataIndex: 'logisticsMethod',
      key: 'logisticsMethod',
      render: (text) => {
        const logisticsMethodMap = {
          1: '随身携带',
          2: '顺丰速运',
          3: '跨越物流',
          4: '德邦物流',
          5: '其他方式'
        };
        return logisticsMethodMap[text] || '';
      }
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate'
    },
    {
      title: '出库状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <div title={`项目名称: ${record.projectName}\n项目时间: ${record.projectTime}`}>
          {text}
        </div>
      )
    },
    {
      title: '入库状态',
      dataIndex: 'inboundStatus',
      key: 'inboundStatus',
      render: (text, record) => (
        <div>
          {text || '未入库'}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => previewOutbound(record)}>预览</Button>
          {record.status === '待确认' && (
            <Button type="primary" onClick={() => confirmOutbound(record.id)}>确认出库</Button>
          )}
          {record.status === '待确认' && (
            <Button onClick={() => handleEditOutbound(record)}>编辑</Button>
          )}
          <Button danger onClick={() => deleteOutbound(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  // 处理编辑出库单
  const handleEditOutbound = async (record) => {
    console.log('编辑出库单:', record)
    console.log('出库单items:', record.items)
    console.log('出库单OutboundImages:', record.OutboundImages)
    
    // 设置编辑模式
    setIsEditMode(true)
    setCurrentEditId(record.id)
    
    // 清空已选物品和图片，准备重新加载
    setSelectedSpecialDevices([])
    setSelectedGeneralDevices([])
    setSelectedConsumables([])
    setSelectedImages([])
    
    // 重新获取设备和耗材数据，确保显示最新的数据库数据
    setLoading(true)
    let fullRecord = null
    try {
      // 直接从后端获取最新的出库单详情，而不是使用缓存的记录
      fullRecord = await projectOutboundApi.getProjectOutbound(record.id)
      console.log('从后端获取的完整出库单详情:', fullRecord)
      
      // 从库存表获取专用设备（禁用缓存）
      const specialInventoryDevices = await deviceApi.getSpecialInventoryDevices(false)
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

      // 从库存表获取通用设备（禁用缓存）
      const generalInventoryDevices = await deviceApi.getGeneralInventoryDevices(false)
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

      // 从后端获取耗材数据（禁用缓存）
      const consumablesData = await deviceApi.getConsumables(false)
      console.log('耗材数据:', consumablesData)
      setConsumables(consumablesData.map(consumable => ({
        id: consumable.id,
        name: consumable.name,
        model: consumable.brand,
        specification: consumable.modelSpecification,
        inventory: consumable.remainingQuantity || 0,
        unit: consumable.unit
      })))
      
      // 填充已选物品
      // 尝试从不同字段名获取物品数据
      const items = fullRecord.items || fullRecord.Items || fullRecord.projectOutboundItems || fullRecord.ProjectOutboundItems || []
      console.log('开始填充已选物品，items长度:', items.length)
      console.log('items数据:', items)
      
      // 确保items是数组
      const processedItems = Array.isArray(items) ? items : []
      console.log('处理后的items:', processedItems)
      
      // 检查ItemType字段的实际值
      if (processedItems.length > 0) {
        console.log('第一个item的结构:', processedItems[0])
        console.log('第一个item的所有键:', Object.keys(processedItems[0]))
        console.log('第一个item的ItemType:', processedItems[0].ItemType, '类型:', typeof processedItems[0].ItemType)
        console.log('第一个item的itemType:', processedItems[0].itemType, '类型:', typeof processedItems[0].itemType)
        console.log('第一个item的ItemName:', processedItems[0].ItemName, 'name:', processedItems[0].name)
        console.log('第一个item的DeviceCode:', processedItems[0].DeviceCode, 'deviceCode:', processedItems[0].deviceCode, 'deviceId:', processedItems[0].deviceId)
        console.log('第一个item的Id:', processedItems[0].Id, 'id:', processedItems[0].id)
        console.log('第一个item的ItemId:', processedItems[0].ItemId, 'itemId:', processedItems[0].itemId)
        // 遍历所有items，检查ItemType
        processedItems.forEach((item, index) => {
          console.log(`Item ${index} ItemType:`, item.ItemType, 'ItemName:', item.ItemName, 'DeviceCode:', item.DeviceCode, 'deviceCode:', item.deviceCode, 'deviceId:', item.deviceId, 'Id:', item.Id, 'id:', item.id, 'ItemId:', item.ItemId, 'itemId:', item.itemId)
        })
      } else {
        console.log('items数组为空')
      }
      
      // 检查从后端获取的完整record数据
      console.log('完整的record数据:', fullRecord)
      
      // 检查record的所有字段
      console.log('record的所有键:', Object.keys(fullRecord))
      console.log('record的OutboundImages:', fullRecord.OutboundImages)
      console.log('record的outboundImages:', fullRecord.outboundImages)
      
      // 尝试不同的ItemType匹配方式
      // 先尝试所有物品，不管ItemType
      const allItems = processedItems.map(item => {
        // 优先使用DeviceCode作为设备编号，如果为空则使用itemId作为备选
        let deviceId = item.DeviceCode || item.deviceCode || item.ItemId || item.itemId || ''
        // 优先使用ItemType作为物品类型
        let itemType = item.ItemType || item.itemType || 1
        return {
          ...item,
          deviceId,
          ItemType: itemType,
          ItemId: item.ItemId || item.itemId || item.EquipmentId || item.equipmentId,
          ItemName: item.ItemName || item.itemName || item.EquipmentName || item.equipmentName || item.name,
          name: item.ItemName || item.itemName || item.EquipmentName || item.equipmentName || item.name,
          Brand: item.brand || item.Brand,
          Model: item.model || item.Model,
          Quantity: item.quantity || item.Quantity || 1,
          Unit: item.unit || item.Unit,
          Accessories: item.accessories || item.Accessories || '',
          DeviceStatus: item.status || item.DeviceStatus || item.Status || '正常',
          status: item.status || item.DeviceStatus || item.Status || '正常',
          serialNumber: item.SerialNumber || item.serialNumber || ''
        }
      })
      console.log('映射后的物品数据:', allItems)
      console.log('所有物品数量:', allItems.length)
      console.log('所有物品数据:', allItems)
      
      // 直接使用ProjectOutboundItem中的DeviceCode字段，不再尝试根据ItemId获取设备详情
      // 因为ItemId可能不是设备的实际ID，而是ProjectOutboundItem的ID
      for (let item of allItems) {
        // 确保deviceId字段存在
        if (!item.deviceId || item.deviceId === '') {
          item.deviceId = item.DeviceCode || item.deviceCode || ''
        }
        // 确保ItemType字段存在且正确
        if (!item.ItemType && !item.itemType) {
          // 根据物品名称或其他属性判断类型
          item.ItemType = 1; // 默认设为专用设备
        }
      }
      console.log('更新设备编号后的物品数据:', allItems)
      
      // 根据ItemType分类物品
      const specialItems = allItems.filter(item => {
        const itemType = item.ItemType || item.itemType
        return itemType === 1 || itemType === '1' || itemType === '专用设备'
      })
      console.log('专用设备数量:', specialItems.length)
      console.log('专用设备数据:', specialItems)
      
      const generalItems = allItems.filter(item => {
        const itemType = item.ItemType || item.itemType
        return itemType === 2 || itemType === '2' || itemType === '通用设备'
      })
      console.log('通用设备数量:', generalItems.length)
      console.log('通用设备数据:', generalItems)
      
      const consumableItems = allItems.filter(item => {
        const itemType = item.ItemType || item.itemType
        return itemType === 3 || itemType === '3' || itemType === '耗材'
      })
      console.log('耗材数量:', consumableItems.length)
      console.log('耗材数据:', consumableItems)
      
      // 确保所有物品都有类型
      const allItemsWithType = allItems.map(item => {
        const itemType = item.ItemType || item.itemType
        let type = ''
        if (itemType === 1 || itemType === '1' || itemType === '专用设备') {
          type = '专用设备'
        } else if (itemType === 2 || itemType === '2' || itemType === '通用设备') {
          type = '通用设备'
        } else if (itemType === 3 || itemType === '3' || itemType === '耗材') {
          type = '耗材'
        } else {
          type = '其他'
        }
        return {
          ...item,
          type
        }
      })
      console.log('带类型的物品数据:', allItemsWithType)
      
      // 重新分类带类型的物品
      const specialItemsWithType = allItemsWithType.filter(item => item.type === '专用设备')
      const generalItemsWithType = allItemsWithType.filter(item => item.type === '通用设备')
      const consumableItemsWithType = allItemsWithType.filter(item => item.type === '耗材')
      const otherItemsWithType = allItemsWithType.filter(item => item.type === '其他')
      
      console.log('重新分类后的专用设备数量:', specialItemsWithType.length)
      console.log('重新分类后的通用设备数量:', generalItemsWithType.length)
      console.log('重新分类后的耗材数量:', consumableItemsWithType.length)
      console.log('重新分类后的其他物品数量:', otherItemsWithType.length)
      
      // 如果没有按类型分类成功，尝试按设备名称和其他属性分类
      if (specialItemsWithType.length === 0 && generalItemsWithType.length === 0 && consumableItemsWithType.length === 0) {
        console.log('按ItemType分类失败，尝试按其他方式分类')
        // 将所有物品添加到专用设备中，确保能看到已选物品
        const fallbackItems = allItemsWithType
        console.log('回退方案：将所有物品添加到专用设备', fallbackItems.length)
        setSelectedSpecialDevices(fallbackItems)
        setSelectedGeneralDevices([])
        setSelectedConsumables([])
      } else {
        console.log('按ItemType分类成功')
        setSelectedSpecialDevices(specialItemsWithType)
        setSelectedGeneralDevices(generalItemsWithType)
        setSelectedConsumables(consumableItemsWithType)
        
        // 如果有其他类型的物品，也添加到专用设备中
        if (otherItemsWithType.length > 0) {
          console.log('将其他类型物品添加到专用设备:', otherItemsWithType.length)
          setSelectedSpecialDevices(prev => [...prev, ...otherItemsWithType])
        }
      }
      
      // 加载图片
      // 直接从后端获取图片列表，不依赖OutboundImages字段
      let hasLoadedImages = false
      if (fullRecord.id) {
        try {
          const images = await imageApi.getInOutboundImages(fullRecord.id, 'outbound')
          console.log('直接从后端获取的图片列表:', images)
          
          if (images && images.length > 0) {
            // baseUrl 已经是 http://localhost:5055/api，所以不需要再添加 /api
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api'
            const loadedImages = []
            
            console.log('图片列表中的每个对象:', images)
            
            for (const img of images) {
              console.log('图片对象:', img)
              console.log('图片对象的所有键:', Object.keys(img))
              
              // 尝试获取图片ID，支持大小写
              const imageId = img.id || img.Id || img.ID
              console.log('获取到的图片ID:', imageId)
              
              if (imageId) {
                // baseUrl 已经包含 /api，所以只需要添加 /Image/data/${imageId}
                const imageUrl = `${baseUrl}/Image/data/${imageId}`
                // 获取图片名称，支持大小写
                const imageName = img.imageName || img.ImageName || img.IMAGE_NAME || `image_${imageId}.jpg`
                console.log('获取到的图片名称:', imageName)
                
                // 尝试使用fetch API获取图片数据，并带上Authorization token
                try {
                  const token = localStorage.getItem('token')
                  const response = await fetch(imageUrl, {
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : ''
                    }
                  })
                  if (response.ok) {
                    // 将图片数据转换为Data URL
                    const blob = await response.blob()
                    const dataUrl = URL.createObjectURL(blob)
                    // 创建一个普通对象来模拟File对象，包含Data URL
                    const file = {
                      name: imageName,
                      url: dataUrl,
                      type: blob.type,
                      // 为了兼容Upload组件，添加一些必要的属性
                      uid: `image_${imageId}`,
                      status: 'done'
                    }
                    loadedImages.push(file)
                    console.log('添加到loadedImages的文件:', file)
                  } else {
                    console.error('获取图片失败:', response.status)
                    // 如果获取失败，创建一个只包含URL的对象
                    const file = {
                      name: imageName,
                      url: imageUrl,
                      type: 'image/jpeg',
                      // 为了兼容Upload组件，添加一些必要的属性
                      uid: `image_${imageId}`,
                      status: 'done'
                    }
                    loadedImages.push(file)
                  }
                } catch (error) {
                  console.error('获取图片失败:', error)
                  // 如果发生错误，创建一个只包含URL的对象
                  const file = {
                    name: imageName,
                    url: imageUrl,
                    type: 'image/jpeg',
                    // 为了兼容Upload组件，添加一些必要的属性
                    uid: `image_${imageId}`,
                    status: 'done'
                  }
                  loadedImages.push(file)
                }
              } else {
                console.log('图片对象没有ID字段:', img)
              }
            }
            
            setSelectedImages(loadedImages)
            console.log('直接从后端加载的图片:', loadedImages)
            hasLoadedImages = true
          }
        } catch (error) {
          console.error('直接从后端获取图片列表失败:', error)
        }
      }
      
      // 如果直接从后端获取图片失败，尝试使用OutboundImages字段
      if (!hasLoadedImages) {
        const imageField = fullRecord.OutboundImages || fullRecord.outboundImages || ''
        console.log('图片字段值:', imageField)
        console.log('fullRecord.OutboundImages:', fullRecord.OutboundImages)
        console.log('fullRecord.outboundImages:', fullRecord.outboundImages)
        
        if (imageField) {
          console.log('加载图片:', imageField)
          const imageUrls = imageField.split(',').filter(url => url && url.trim())
          console.log('图片URLs:', imageUrls)
          
          if (imageUrls.length > 0) {
            // 尝试从后端获取图片数据
            try {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api'
              const loadedImages = []
              
              // 尝试获取出入库图片列表
              if (fullRecord.id) {
                console.log('尝试获取出入库图片列表，出库单ID:', fullRecord.id)
                const images = await imageApi.getInOutboundImages(fullRecord.id, 'outbound')
                console.log('获取到的图片列表:', images)
                
                if (images && images.length > 0) {
                  // 使用后端返回的图片数据
                  for (const img of images) {
                    if (img.Id) {
                      // 使用正确的API端点获取图片数据
                      // baseUrl 已经包含 /api，所以只需要添加 /Image/data/${img.Id}
                      const imageUrl = `${baseUrl}/Image/data/${img.Id}`
                      // 创建一个虚拟的File对象，只包含URL信息
                      const file = new File([], imageUrl, { type: 'image/jpeg' })
                      // 添加一个url属性，方便前端显示
                      file.url = imageUrl
                      file.name = `image_${img.Id}.jpg`
                      loadedImages.push(file)
                    }
                  }
                } else {
                  // 如果无法获取图片列表，使用原始URL
                  for (const url of imageUrls) {
                    const fullUrl = url.startsWith('http') ? url : baseUrl + url
                    const file = new File([], fullUrl, { type: 'image/jpeg' })
                    file.url = fullUrl
                    file.name = `image_${Date.now()}.jpg`
                    loadedImages.push(file)
                  }
                }
              } else {
                // 如果没有出库单ID，使用原始URL
                for (const url of imageUrls) {
                  const fullUrl = url.startsWith('http') ? url : baseUrl + url
                  const file = new File([], fullUrl, { type: 'image/jpeg' })
                  file.url = fullUrl
                  file.name = `image_${Date.now()}.jpg`
                  loadedImages.push(file)
                }
              }
              
              setSelectedImages(loadedImages)
              console.log('加载的图片:', loadedImages)
            } catch (error) {
              console.error('加载图片失败:', error)
              // 即使失败，也使用原始URL创建图片对象
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api'
              const loadedImages = imageUrls.map(url => {
                const fullUrl = url.startsWith('http') ? url : baseUrl + url
                const file = new File([], fullUrl, { type: 'image/jpeg' })
                file.url = fullUrl
                file.name = `image_${Date.now()}.jpg`
                return file
              })
              setSelectedImages(loadedImages)
              console.log('使用原始URL创建图片对象:', loadedImages)
            }
          } else {
            setSelectedImages([]) // 清空现有图片
            console.log('图片URLs为空')
          }
        } else {
          setSelectedImages([]) // 清空现有图片
          console.log('未加载图片，图片字段为空')
        }
      }
      
      // 检查record中可能的图片字段
      console.log('record中可能的图片字段:')
      console.log('record.OutboundImages:', fullRecord.OutboundImages)
      console.log('record.outboundImages:', fullRecord.outboundImages)
      console.log('record.images:', fullRecord.images)
      
      // 显示模态框
      setCreateModalVisible(true)
      
      // 模态框显示后填充表单数据
      setTimeout(() => {
        if (fullRecord) {
          // 将物流方式数字值转换为对应的字符串值
          const logisticsMethodNum = fullRecord.logisticsMethod || fullRecord.LogisticsMethod
          const logisticsMethodStr = {
            1: '随身携带',
            2: '顺丰速运',
            3: '跨越物流',
            4: '德邦物流',
            5: '其他方式'
          }[logisticsMethodNum] || '随身携带' // 默认值为'随身携带'
          
          form.setFieldsValue({
            outboundId: fullRecord.outboundId || fullRecord.OutboundId || fullRecord.outboundNumber || fullRecord.OutboundNumber,
            '领用方式': fullRecord.outboundType || fullRecord.OutboundType || fullRecord.handler || fullRecord.Handler || '元动自用',
            '物流方式': logisticsMethodStr,
            '项目名称': fullRecord.projectName || fullRecord.ProjectName,
            '项目时间': fullRecord.projectTime || fullRecord.ProjectTime,
            '使用地': fullRecord.usageLocation || fullRecord.UsageLocation,
            '项目负责人': fullRecord.projectManager || fullRecord.ProjectManager,
            '联系电话': fullRecord.contactPhone || fullRecord.ContactPhone,
            '预计归还时间': (fullRecord.returnDate || fullRecord.ReturnDate) ? moment((fullRecord.returnDate || fullRecord.ReturnDate)) : null,
            '经办人': fullRecord.recipient || fullRecord.Recipient,
            '库管': fullRecord.warehouseKeeper || fullRecord.WarehouseKeeper,
            '出库时间': (fullRecord.outboundDate || fullRecord.OutboundDate) ? moment((fullRecord.outboundDate || fullRecord.OutboundDate)) : null,
            'remark': fullRecord.remark || fullRecord.Remark
          })
        }
      }, 100)
      
    } catch (error) {
      console.error('获取设备数据失败:', error)
      console.error('错误堆栈:', error.stack)
      message.error('获取设备数据失败')
      // 即使出错也要显示模态框，避免用户操作被卡住
      setCreateModalVisible(true)
    } finally {
      setLoading(false)
    }
  }

  // 处理新建项目出库单
  const handleCreateOutbound = async () => {
    // 重置编辑模式状态
    setIsEditMode(false)
    setCurrentEditId(null)
    
    setSelectedSpecialDevices([])
    setSelectedGeneralDevices([])
    setSelectedConsumables([])
    
    // 重新获取设备和耗材数据，确保显示最新的数据库数据
    setLoading(true)
    try {
      // 从库存表获取专用设备（禁用缓存，确保获取最新数据）
      const specialInventoryDevices = await deviceApi.getSpecialInventoryDevices(false)
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

      // 从库存表获取通用设备（禁用缓存，确保获取最新数据）
      const generalInventoryDevices = await deviceApi.getGeneralInventoryDevices(false)
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

      // 从后端获取耗材数据（禁用缓存，确保获取最新数据）
      const consumablesData = await deviceApi.getConsumables(false)
      console.log('耗材数据:', consumablesData)
      setConsumables(consumablesData.map(consumable => ({
        id: consumable.id || consumable.Id, // 支持大小写ID
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
      console.log('开始确认出库，出库单ID:', outboundId);
      const response = await projectOutboundApi.completeProjectOutbound(outboundId);
      console.log('确认出库API响应:', response);
      
      // 重新获取出库记录，确保项目名称和项目时间正确显示
      console.log('开始重新获取出库记录');
      const updatedOutbounds = await projectOutboundApi.getProjectOutbounds(false);
      console.log('获取到的出库记录:', updatedOutbounds);
      const outboundHistoryData = updatedOutbounds.map(outbound => ({
        id: outbound.id,
        outboundId: outbound.outboundNumber,
        projectName: outbound.projectName,
        projectTime: outbound.projectTime,
        projectLeader: outbound.projectManager,
        recipient: outbound.recipient,
        expectedReturnTime: outbound.returnDate,
        usageType: outbound.outboundType,
        logisticsMethod: outbound.logisticsMethod,
        outboundDate: outbound.outboundDate ? new Date(outbound.outboundDate).toISOString().split('T')[0] : '',
        status: outbound.isCompleted ? '已完成' : '待确认',
        inboundStatus: outbound.inboundStatus || '未入库', // 使用后端返回的入库状态，默认为未入库
        items: [] // 简化处理，实际应用中可以从outbound.ProjectOutboundItems获取
      }));
      setOutboundHistory(outboundHistoryData);
      
      // 重新获取设备和耗材数据，确保显示最新的库存数据
      console.log('开始重新获取设备和耗材数据');
      await fetchDevices();
      console.log('设备和耗材数据获取完成');
      
      message.success('出库确认成功')
    } catch (error) {
      console.error('确认出库失败:', error);
      console.error('错误堆栈:', error.stack);
      message.error('出库确认失败：' + (error.message || '未知错误'))
    }
  }

  // 删除出库记录
  const deleteOutbound = async (outboundId) => {
    try {
      await projectOutboundApi.deleteProjectOutbound(outboundId)
      setOutboundHistory(prev => prev.filter(item => item.id !== outboundId))
      
      // 重新获取设备和耗材数据，确保显示最新的库存数据
      await fetchDevices();
      
      message.success('出库记录已删除')
    } catch (error) {
      if (error.message.includes('404')) {
        message.error('出库记录不存在，删除失败')
      } else {
        message.error('删除出库记录失败：' + error.message)
      }
    }
  }

  // 处理预览
  const handlePreview = () => {
    console.log('开始处理预览')
    
    // 获取表单值
    const values = form.getFieldsValue()
    
    // 构建预览数据
    const previewDataObj = {
      outboundId: values.outboundId || `PROOUT${Date.now()}`,
      领用方式: values['领用方式'] || '',
      物流方式: values['物流方式'] || '',
      项目名称: values['项目名称'] || '',
      项目时间: values['项目时间'] || '',
      使用地: values['使用地'] || '',
      项目负责人: values['项目负责人'] || '',
      联系电话: values['联系电话'] || '',
      预计归还时间: values['预计归还时间'] ? values['预计归还时间'].format('YYYY-MM-DD') : '',
      经办人: values['经办人'] || '',
      库管: values['库管'] || '',
      出库时间: values['出库时间'] ? values['出库时间'].format('YYYY-MM-DD') : '',
      remark: values.remark || '',
      items: [
        ...(selectedSpecialDevices || []).map(item => ({ ...item, type: '专用设备' })),
        ...(selectedGeneralDevices || []).map(item => ({ ...item, type: '通用设备' })),
        ...(selectedConsumables || []).map(item => ({ ...item, type: '耗材' }))
      ],
      images: (selectedImages || []).map(file => {
        if (file.url) {
          return file.url;
        } else if (file instanceof File) {
          return URL.createObjectURL(file);
        } else if (file.originFileObj && file.originFileObj instanceof File) {
          return URL.createObjectURL(file.originFileObj);
        }
        return '';
      }).filter(url => url)
    }
    
    console.log('构建预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    
    // 强制重新渲染
    setTimeout(() => {
      console.log('设置预览模态框为可见')
      setPreviewModalVisible(true)
    }, 50)
  }

  // 处理保存PDF - 使用相同的打印方式，用户可以在打印对话框中选择保存为PDF
  const handleSavePDF = () => {
    handlePrint()
  }

  // 处理表单提交
  const handleSubmit = async (values) => {
    console.log('开始提交出库单:', values);
    const now = new Date().toISOString();
    
    // 将物流方式字符串转换为数字值
    const logisticsMethodMap = {
      '随身携带': 1,
      '顺丰速运': 2,
      '跨越物流': 3,
      '德邦物流': 4,
      '其他方式': 5
    };
    const logisticsMethodNum = logisticsMethodMap[values['物流方式']] || null;
    console.log('物流方式数字值:', logisticsMethodNum);
    
    const projectOutboundItems = [
      ...selectedSpecialDevices.map(item => ({
        ItemType: 1, // 1表示专用设备
        ItemId: item.equipmentId || item.id || 0, // 使用equipmentId作为设备ID，确保ItemId是数字类型
        ItemName: item.name || '',
        DeviceCode: (item.deviceId || '').toString(), // 使用deviceId作为设备编号，确保是字符串类型
        SerialNumber: item.serialNumber || '', // 添加S/N码
        Brand: item.brand || '',
        Model: item.model || '',
        Quantity: item.quantity || 1,
        Unit: item.unit || '',
        Accessories: item.accessories || '',
        Remark: item.remark || '',
        DeviceStatus: item.status || '正常',
        CreatedAt: now
      })),
      ...selectedGeneralDevices.map(item => ({
        ItemType: 2, // 2表示通用设备
        ItemId: item.equipmentId || item.id || 0, // 使用equipmentId作为设备ID，确保ItemId是数字类型
        ItemName: item.name || '',
        DeviceCode: (item.deviceId || '').toString(), // 使用deviceId作为设备编号，确保是字符串类型
        SerialNumber: item.serialNumber || '', // 添加S/N码
        Brand: item.brand || '',
        Model: item.model || '',
        Quantity: item.quantity || 1,
        Unit: item.unit || '',
        Accessories: item.accessories || '',
        Remark: item.remark || '',
        DeviceStatus: item.status || '正常',
        CreatedAt: now
      })),
      ...selectedConsumables.map(item => ({
        ItemType: 3, // 3表示耗材
        ItemId: item.id || 0,
        ItemName: item.name || '',
        DeviceCode: (item.deviceId || '').toString(), // 使用deviceId作为设备编号，确保是字符串类型
        Brand: item.brand || '',
        Model: item.model || '',
        Quantity: item.quantity || 1,
        Unit: item.unit || '',
        Accessories: item.accessories || '',
        Remark: item.remark || '',
        DeviceStatus: item.status || '正常',
        CreatedAt: now
      }))
    ]

    console.log('已选物品数量:', projectOutboundItems.length);
    if (projectOutboundItems.length === 0) {
      message.error('请至少选择一项设备或耗材')
      return
    }

    try {
      console.log('编辑模式状态:', isEditMode);
      console.log('当前编辑ID:', currentEditId);
      
      let projectName = values['项目名称'] || '未知项目';
      
      if (!isEditMode) {
        // 新建模式：检查项目名称是否重复
        console.log('开始检查项目名称重复');
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
      }

      // 构建出库单数据 - 适配ProjectOutboundController格式
      const outboundData = {
        ProjectName: projectName,
        ProjectTime: values['项目时间'] || '',
        ProjectManager: values['项目负责人'] || '',
        Recipient: values['经办人'] || '',
        OutboundType: values['领用方式'] || '', // 将领用方式映射到OutboundType字段
        ContactPhone: values['联系电话'] || '',
        UsageLocation: values['使用地'] || '',
        ReturnDate: values['预计归还时间'] ? values['预计归还时间'].format('YYYY-MM-DD') : null,
        WarehouseKeeper: values['库管'] || '',
        LogisticsMethod: logisticsMethodNum, // 添加物流方式数字值
        Remark: values.remark || '',
        OutboundNumber: values.outboundId, // 使用表单中生成的出库单号
        OutboundDate: new Date().toISOString(), // 添加出库日期
        ProjectOutboundItems: projectOutboundItems
      }

      let response;
      if (isEditMode && currentEditId) {
        // 编辑模式：更新出库单
        // 构建正确的更新数据结构，确保所有必填字段都存在
        const updateData = {
          ...outboundData,
          Id: currentEditId
        };
        console.log('编辑出库单数据:', updateData);
        console.log('编辑出库单ID:', currentEditId);
        console.log('开始调用updateProjectOutbound');
        response = await projectOutboundApi.updateProjectOutbound(currentEditId, updateData);
        console.log('updateProjectOutbound响应:', response);
      } else {
        // 新建模式：创建出库单
        console.log('发送出库单数据:', outboundData);
        console.log('开始调用createProjectOutbound');
        response = await projectOutboundApi.createProjectOutbound(outboundData);
        console.log('createProjectOutbound响应:', response);
      }
      
      // 检查response是否存在（对于编辑模式，后端返回204 No Content，response会是undefined）
      if (!response && !isEditMode) {
        console.error('出库单创建失败，无法上传图片');
        throw new Error('出库单创建失败');
      }
      
      // 对于编辑模式，确保currentEditId存在
      if (isEditMode && !currentEditId) {
        console.error('编辑模式下缺少出库单ID，无法上传图片');
        throw new Error('编辑模式下缺少出库单ID');
      }
      
      // 上传图片
      if (selectedImages.length > 0) {
        setLoading(true)
        // 只上传用户新选择的本地文件，过滤掉从后端加载的虚拟File对象
        // 处理Upload组件的文件对象结构
        const newFiles = [];
        selectedImages.forEach(file => {
          // 检查是否是File实例或包含originFileObj
          if (file instanceof File) {
            newFiles.push(file);
          } else if (file.originFileObj && file.originFileObj instanceof File) {
            newFiles.push(file.originFileObj);
          }
        });
        console.log('准备上传的图片数量:', newFiles.length)
        
        // 对于编辑模式，使用currentEditId；对于新建模式，使用response中的ID
        const orderId = isEditMode ? currentEditId : (response?.Id || response?.id);
        console.log('获取到的orderId:', orderId)
        
        if (!orderId) {
          console.error('无法获取出库单ID，无法处理图片');
          setLoading(false);
          throw new Error('无法获取出库单ID');
        }
        
        if (newFiles.length > 0) {
          // 创建一个FormData，一次性上传所有图片
          const formData = new FormData()
          
          // 添加所有图片
          newFiles.forEach((image, index) => {
            console.log('添加文件到FormData:', image.name, image.type);
            formData.append('files', image, image.name);
          });
          
          // 检查FormData中的文件数量
          console.log('FormData中的文件数量:', newFiles.length);
          
          try {
            const uploadResponse = await imageApi.uploadInOutboundImage(orderId, 'outbound', formData)
            const imagePaths = uploadResponse || []
            console.log('上传成功的图片路径:', imagePaths)
          } catch (error) {
            console.error('上传图片失败:', error)
            setLoading(false)
            throw error
          }
        }
        
        // 重新获取所有图片，确保包含最新的图片状态
        const allImages = await imageApi.getInOutboundImages(orderId, 'outbound')
        console.log('重新获取的所有图片:', allImages)
        
        // 构建完整的图片URL列表
        const completeImageUrls = allImages.map(img => img.ImagePath).join(',')
        console.log('完整的图片URL列表:', completeImageUrls)
        
        // 更新出库单，添加完整的图片URL列表
        await projectOutboundApi.updateProjectOutbound(orderId, {
          OutboundImages: completeImageUrls,
          outboundImages: completeImageUrls
        })
        
        setLoading(false)
      }

      // 重新获取出库记录，确保显示最新数据
      const updatedOutbounds = await projectOutboundApi.getProjectOutbounds(false);
      const outboundHistoryData = updatedOutbounds.map(outbound => ({
        id: outbound.id,
        outboundId: outbound.outboundNumber,
        projectName: outbound.projectName,
        projectTime: outbound.projectTime,
        projectLeader: outbound.projectManager,
        recipient: outbound.recipient,
        expectedReturnTime: outbound.returnDate,
        usageType: outbound.outboundType,
        logisticsMethod: outbound.logisticsMethod,
        outboundDate: outbound.outboundDate ? new Date(outbound.outboundDate).toISOString().split('T')[0] : '',
        status: outbound.isCompleted ? '已完成' : '待确认',
        inboundStatus: outbound.isCompleted ? '已完成' : '未入库',
        outboundType: outbound.outboundType,
        usageLocation: outbound.usageLocation,
        projectManager: outbound.projectManager,
        contactPhone: outbound.contactPhone,
        returnDate: outbound.returnDate ? new Date(outbound.returnDate).toISOString().split('T')[0] : '',
        warehouseKeeper: outbound.warehouseKeeper,
        remark: outbound.remark,
        items: outbound.projectOutboundItems || [],
        OutboundImages: outbound.outboundImages || outbound.OutboundImages || ''
      }));
      setOutboundHistory(outboundHistoryData);

      message.success(isEditMode ? '项目出库单更新成功' : '项目出库单提交成功')
      
      // 重置表单和选择
      form.resetFields()
      setSelectedSpecialDevices([])
      setSelectedGeneralDevices([])
      setSelectedConsumables([])
      setSelectedImages([])
      setCreateModalVisible(false)
      
      // 重置编辑模式状态
      setIsEditMode(false)
      setCurrentEditId(null)
    } catch (error) {
      console.error('提交出库单失败:', error);
      message.error('项目出库单提交失败：' + (error.message || '未知错误'))
    }
  }

  return (
    <>
      <div className="project-outbound">
      <Card 
        title="项目出库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateOutbound}>
            新建项目出库单
          </Button>
        }
      >
        <Table 
          columns={historyColumns} 
          dataSource={outboundHistory} 
          rowKey="id"
        />
      </Card>

      {/* 新建项目出库单模态框 */}
      <Modal
        title="新建项目出库单"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        width={1800}
        style={{ top: 5, height: '98vh' }}
        styles={{ body: { height: 'calc(98vh - 100px)', overflow: 'auto' } }}
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
                initialValue={`PROOUT-${moment().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`}
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
            <Upload
              listType="picture-card"
              multiple
              accept="image/*"
              onBeforeUpload={() => false} // 完全阻止自动上传
              onChange={(info) => {
                console.log('Upload onChange info:', info);
                // 处理文件选择，只保留当前选中的文件
                const currentFiles = [];
                info.fileList.forEach(item => {
                  if (item.originFileObj) {
                    // 新选择的本地文件
                    const file = item.originFileObj;
                    file.url = URL.createObjectURL(file);
                    currentFiles.push(file);
                  } else if (item.url) {
                    // 从后端加载的图片（有url属性）
                    // 查找selectedImages中对应的文件
                    const existingFile = selectedImages.find(file => file.url === item.url);
                    if (existingFile) {
                      currentFiles.push(existingFile);
                    }
                  }
                });
                console.log('当前选中的文件数量:', currentFiles.length);
                setSelectedImages(currentFiles);
              }}
              onRemove={(file) => {
                console.log('Upload onRemove file:', file);
                // 从selectedImages中移除被删除的文件
                const updatedFiles = selectedImages.filter(item => {
                  // 对于本地文件，比较name和url
                  if (item.name && item.url) {
                    return !(item.name === file.name && item.url === file.url);
                  }
                  // 对于从后端加载的图片，比较url
                  return item.url !== file.url;
                });
                console.log('删除后剩余文件数量:', updatedFiles.length);
                setSelectedImages(updatedFiles);
                
                // 如果是从后端加载的图片，调用API删除
                if (file.url && file.url.includes('/api/Image/data/')) {
                  // 从URL中提取图片ID
                  const urlParts = file.url.split('/');
                  const imageId = urlParts[urlParts.length - 1];
                  if (imageId) {
                    console.log('删除图片ID:', imageId);
                    imageApi.deleteInOutboundImage(imageId).catch(error => {
                      console.error('删除图片失败:', error);
                    });
                  }
                }
              }}
              fileList={selectedImages.map((file, index) => ({
                uid: file.url ? `url-${file.url}` : `file-${index}`,
                name: file.name,
                status: 'done',
                url: file.url
              }))}
              customRequest={() => {}}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
            {selectedImages.length > 0 && (
              <div className="mt-2">
                <p>已选择 {selectedImages.length} 张图片</p>
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
                      key: 'deviceId',
                      render: (text, record) => record.type === '耗材' ? '-' : (text || '-')
                    },
                    {
                      title: 'SN码',
                      dataIndex: 'serialNumber',
                      key: 'serialNumber',
                      render: (text) => text || '-'
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
                                placement: 'bottom'
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
                                placement: 'bottom'
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
                                placement: 'bottom'
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
                name="经办人" 
                label="经办人" 
                rules={[{ required: true, message: '请输入经办人' }]}
              >
                <Input placeholder="请输入经办人" />
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
            <Button type="default" onClick={handlePreview} style={{ marginRight: 16 }}>
              预览
            </Button>
            <Button onClick={() => {
              form.resetFields()
              setSelectedSpecialDevices([])
              setSelectedGeneralDevices([])
              setSelectedConsumables([])
              setCreateModalVisible(false)
              // 重置编辑模式状态
              setIsEditMode(false)
              setCurrentEditId(null)
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
                <p><strong>经办人:</strong> {currentOutboundDetail['经办人']}</p>
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

      {/* 预览模态框 */}
      <Modal
        title="出库单预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width="90%"
        zIndex={9999}
        mask={true}
        styles={{
          modal: { 
            top: 50, 
            maxWidth: 1400, 
            zIndex: 9999, 
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          },
          body: { 
            padding: 0,
            backgroundColor: '#fff',
            overflow: 'auto'
          },
          header: {
            backgroundColor: '#fff',
            borderBottom: '1px solid #e8e8e8'
          },
          footer: {
            backgroundColor: '#fff',
            borderTop: '1px solid #e8e8e8'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
        className="preview-modal"
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          <Button key="print" type="default" onClick={handlePrint} style={{ marginRight: 16 }}>
            打印
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePDF}>
            保存PDF
          </Button>
        ]}
      >
        <div ref={printRef} className="preview-content" style={{ padding: '20px', maxHeight: '75vh', overflow: 'auto', backgroundColor: '#fff' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2>项目出库单</h2>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            {/* 第一行：出库单号 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col span={24}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>出库单号:</strong> {previewData.outboundId}</p>
              </Col>
            </Row>
            
            {/* 第二行：领用方式、物流方式 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>领用方式:</strong> {previewData.领用方式}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>物流方式:</strong> {previewData.物流方式}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}></p>
              </Col>
            </Row>
            
            {/* 第三行：项目名称、项目时间、使用地 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>项目名称:</strong> {previewData.项目名称}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>项目时间:</strong> {previewData.项目时间}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>使用地:</strong> {previewData.使用地}</p>
              </Col>
            </Row>
            
            {/* 第四行：项目负责人、联系电话、预计归还时间 */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>项目负责人:</strong> {previewData.项目负责人}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>联系电话:</strong> {previewData.联系电话}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>预计归还时间:</strong> {previewData.预计归还时间}</p>
              </Col>
            </Row>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>已选物品</h3>
            <Table 
              columns={[
                {
                  title: '类型',
                  dataIndex: 'type',
                  key: 'type',
                  width: '6%'
                },
                {
                  title: '设备名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: '12%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '设备编号',
                  dataIndex: 'deviceId',
                  key: 'deviceId',
                  width: '10%',
                  render: (text, record) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {record.type === '耗材' ? '-' : (text || '-')}
                    </div>
                  )
                },
                {
                  title: 'SN码',
                  dataIndex: 'serialNumber',
                  key: 'serialNumber',
                  width: '10%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '品牌',
                  dataIndex: 'brand',
                  key: 'brand',
                  width: '6%'
                },
                {
                  title: '型号',
                  dataIndex: 'model',
                  key: 'model',
                  width: '10%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: '4%'
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: '4%'
                },
                {
                  title: '配件',
                  dataIndex: 'accessories',
                  key: 'accessories',
                  width: '25%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '设备状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: '8%'
                }
              ]} 
              dataSource={previewData.items || []} 
              rowKey={(record) => record.deviceId || record.id}
              pagination={false}
              size="small"
              bordered
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>备注</h3>
            <div style={{ whiteSpace: 'pre-line', backgroundColor: '#fafafa', padding: '12px', borderRadius: '4px', minHeight: '60px' }}>
              {previewData.remark}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>签收信息</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>经办人:</strong> {previewData.经办人}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>库管:</strong> {previewData.库管}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>出库时间:</strong> {previewData.出库时间}</p>
              </Col>
            </Row>
          </div>

          {/* 图片预览区域 */}
          {previewData.images && previewData.images.length > 0 && (
            <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>附件图片</h3>
              <div className="preview-images" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {previewData.images.map((url, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    padding: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <img 
                      src={url} 
                      alt={`附件 ${index + 1}`} 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(url, '_blank')}
                    />
                    <span style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
                      图片 {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 设备详情抽屉 */}
      <Drawer
        title={`${currentDeviceGroup?.name} - 详细设备清单`}
        placement="right"
        onClose={() => setDeviceDetailModalVisible(false)}
        open={deviceDetailModalVisible}
        size={1000}
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
            { title: 'SN码', dataIndex: 'serialNumber', key: 'serialNumber' },
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
    </>
  )
}

export default ProjectOutbound