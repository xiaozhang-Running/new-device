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
  Spin, 
  Popconfirm,
  InputNumber,
  Row,
  Col
} from 'antd'

const { TextArea } = Input
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons'
import moment from 'moment'
import { deviceApi, projectOutboundApi, projectInboundApi, cacheManager } from '../services/api'
import { get, post, put, del } from '../services/request'
import { useReactToPrint } from 'react-to-print'

const { Option } = Select

function ProjectInbound() {
  const [form] = Form.useForm()
  const [selectedOutboundOrder, setSelectedOutboundOrder] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [inboundHistory, setInboundHistory] = useState([])
  const [outboundHistory, setOutboundHistory] = useState([])
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [currentEditInbound, setCurrentEditInbound] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // 入库单号
  const [inboundNumber, setInboundNumber] = useState('')
  
  // 预览相关state
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [previewData, setPreviewData] = useState({
    inboundNumber: '',
    projectName: '',
    projectTime: '',
    usageLocation: '',
    projectManager: '',
    contactPhone: '',
    handler: '',
    inspector: '',
    warehouseKeeper: '',
    inboundDate: '',
    remark: '',
    items: []
  })
  const printRef = useRef(null)
  
  // 配置react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `项目入库单-${previewData.inboundNumber || '预览'}`,
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
          border-collapse: collapse !important;
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
        /* 入库单号样式 */
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
        /* 打印时项目信息按2行展示 */
        .preview-content > div:nth-child(2) .ant-row {
          display: flex;
          flex-wrap: wrap;
        }
        .preview-content > div:nth-child(2) .ant-col {
          flex: 0 0 50%;
          max-width: 50%;
        }
        /* 缩小入库状态列宽 */
        .preview-content table th:nth-child(11),
        .preview-content table td:nth-child(11) {
          min-width: 30px;
          width: 30px;
        }
        /* 移除滚动条 */
        ::-webkit-scrollbar {
          display: none !important;
        }
        scrollbar {
          display: none !important;
        }
      }
    `,
    onBeforePrint: () => {
      console.log('开始打印...')
      return Promise.resolve()
    },
    onAfterPrint: () => {
      console.log('打印完成')
    },
    onPrintError: (error) => {
      console.error('打印错误:', error)
      message.error('打印失败，请重试')
    }
  })

  // 生成入库单号
  const generateInboundNumber = () => {
    const prefix = 'PRO-IN-'
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchData()
  }, [])

  // 当新建入库模态框打开时生成入库单号
  useEffect(() => {
    if (createModalVisible) {
      const newInboundNumber = generateInboundNumber()
      setInboundNumber(newInboundNumber)
    }
  }, [createModalVisible])

  // 获取数据
  const fetchData = async () => {
    setLoading(true)
    try {
      // 清除缓存，确保获取最新数据
      if (window.cacheManager) {
        console.log('清除入库和出库记录缓存')
        window.cacheManager.invalidate('project-inbounds')
        window.cacheManager.invalidate('project-outbounds')
      }
      
      // 获取入库历史
      const inboundData = await projectInboundApi.getProjectInbounds(false) // 禁用缓存
      console.log('获取到的入库单数据:', inboundData)
      // 处理可能的value字段包装
      let processedInboundData = inboundData
      if (inboundData && typeof inboundData === 'object' && 'value' in inboundData) {
        processedInboundData = inboundData.value
      }
      console.log('处理后的入库单数据:', processedInboundData)
      // 确保是数组
      if (Array.isArray(processedInboundData)) {
        // 标准化字段名，确保入库单号正确显示
        const normalizedInbounds = processedInboundData.map(item => {
          // 提取标准化的字段映射函数
          const normalizeItemFields = (item) => ({
            ...item,
            deviceCode: item.deviceCode || item.DeviceCode || '',
            snCode: item.snCode || item.SnCode || item.serialNumber || item.SerialNumber || item.SN || item.sn || '',
            equipmentId: item.equipmentId || item.EquipmentId || 0,
            equipmentName: item.equipmentName || item.EquipmentName || item.ItemName || item.itemName || '',
            status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '',
            accessories: item.accessories || item.Accessories || ''
          });

          // 标准化items数组中的字段
          let normalizedItems = [];
          if (item.items && Array.isArray(item.items)) {
            normalizedItems = item.items.map(normalizeItemFields);
          } else if (item.Items && Array.isArray(item.Items)) {
            normalizedItems = item.Items.map(normalizeItemFields);
          }
          
          return {
            ...item,
            // 标准化入库单号字段
            inboundNumber: item.inboundNumber || item.InboundNumber,
            // 标准化其他字段
            projectName: item.projectName || item.ProjectName,
            projectManager: item.projectManager || item.ProjectManager,
            handler: item.handler || item.Handler,
            status: item.status || item.Status,
            // 标准化时间字段，用于排序
            createdAt: item.createdAt || item.CreatedAt || item.inboundDate || item.InboundDate,
            inboundDate: item.inboundDate || item.InboundDate,
            // 标准化items数组
            items: normalizedItems,
            Items: normalizedItems
          };
        })
        
        // 按创建时间或入库时间降序排序，最新的放在最前面
        const sortedInbounds = normalizedInbounds.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.inboundDate || 0)
          const dateB = new Date(b.createdAt || b.inboundDate || 0)
          return dateB - dateA
        })
        
        console.log('标准化并排序后的入库记录:', sortedInbounds)
        setInboundHistory(sortedInbounds)
      } else {
        console.error('入库单数据格式错误，不是数组:', processedInboundData)
        setInboundHistory([])
      }
      
      // 获取出库历史
      const outboundData = await projectOutboundApi.getProjectOutbounds(false) // 禁用缓存
      console.log('获取到的出库单数据:', outboundData)
      // 处理可能的value字段包装
      let processedOutboundData = outboundData
      if (outboundData && typeof outboundData === 'object' && 'value' in outboundData) {
        processedOutboundData = outboundData.value
      }
      console.log('处理后的出库单数据:', processedOutboundData)
      // 确保是数组
      if (Array.isArray(processedOutboundData)) {
        // 转换数据格式以匹配表格列定义
        const formattedOutbounds = processedOutboundData.map(item => {
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
            outboundId: item.outboundNumber || item.OutboundNumber,
            projectName: item.projectName || item.ProjectName,
            projectTime: item.projectTime || item.ProjectTime,
            recipient: item.recipient || item.Recipient,
            outboundDate: item.outboundDate ? new Date(item.outboundDate).toISOString().split('T')[0] : (item.OutboundDate ? new Date(item.OutboundDate).toISOString().split('T')[0] : ''),
            status: item.isCompleted ? '已完成' : '待确认',
            inboundStatus: item.inboundStatus || item.InboundStatus || '未入库',
            outboundType: item.outboundType || item.OutboundType,
            logisticsMethod: item.logisticsMethod || item.LogisticsMethod,
            usageLocation: item.usageLocation || item.UsageLocation,
            projectManager: item.projectManager || item.ProjectManager,
            contactPhone: item.contactPhone || item.ContactPhone,
            returnDate: item.returnDate || (item.ReturnDate ? new Date(item.ReturnDate).toISOString().split('T')[0] : ''),
            warehouseKeeper: item.warehouseKeeper || item.WarehouseKeeper,
            remark: item.remark || item.Remark,
            items: items,
            OutboundImages: item.outboundImages || item.OutboundImages || ''
          }
        })
        // 筛选出库状态为已完成且入库状态不是已完成的出库单
        const confirmedOutbounds = formattedOutbounds.filter(order => 
          order.status === '已完成' && 
          order.inboundStatus !== '已完成'
        )
        console.log('筛选后的出库单:', confirmedOutbounds)
        setOutboundHistory(confirmedOutbounds)
      } else {
        console.error('出库单数据格式错误，不是数组:', processedOutboundData)
        setOutboundHistory([])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      message.error('获取数据失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理出库单选择
  const handleOutboundOrderSelect = async (orderId) => {
    console.log('选择的出库单ID:', orderId)
    const order = outboundHistory.find(o => o.id === orderId)
    console.log('找到的出库单:', order)
    if (order) {
      setSelectedOutboundOrder(order)
      // 初始化可入库项，默认数量为0（未入库）
      // 尝试不同的字段名来获取设备明细
      const items = order.items || order.Items || order.projectOutboundItems || order.ProjectOutboundItems || order.ProjectOutboundItem || order.projectOutboundItem || []
      console.log('获取到的设备明细:', items)
      
      // 获取设备详细信息
      const initialItems = await Promise.all(items.map(async (item, index) => {
        console.log('设备明细项:', item)
        // 检测是否为耗材类型（根据物品名称或类型）
        const isConsumable = item.itemType === 3 || item.ItemType === 3 || 
                          item.name?.includes('耗材') || item.Name?.includes('耗材') ||
                          item.equipmentName?.includes('别针') || item.EquipmentName?.includes('别针') ||
                          item.equipmentName?.includes('耗材') || item.EquipmentName?.includes('耗材') ||
                          item.itemName?.includes('耗材') || item.ItemName?.includes('耗材')
        console.log('是否为耗材:', isConsumable)
        
        // 从设备表获取设备详细信息
        let deviceCode = item.DeviceCode || item.deviceCode
        let accessories = item.Accessories || item.accessories || item.accessory || item.Accessory || item.equipmentAccessories || item.EquipmentAccessories
        let equipmentName = item.EquipmentName || item.equipmentName || item.ItemName || item.itemName || item.Name || item.name
        
        // 优先使用设备ID，其次使用itemId
        const equipmentId = item.equipmentId || item.EquipmentId || item.itemId || item.ItemId
        const itemType = item.ItemType || item.itemType || (isConsumable ? 3 : 1)
        console.log('设备ID:', equipmentId, '设备类型:', itemType)
        
        // 检查item是否有DeviceCode字段，无论其值是否为空
        const hasDeviceCode = 'DeviceCode' in item || 'deviceCode' in item
        if (hasDeviceCode) {
          deviceCode = item.DeviceCode || item.deviceCode || '无'
          console.log('直接使用出库单中的设备编号:', deviceCode)
        } else if (equipmentId) {
          // 尝试从专用设备表获取
          try {
            console.log('尝试从专用设备表获取设备信息，equipmentId:', equipmentId)
            const deviceData = await deviceApi.getSpecialEquipment(equipmentId)
            console.log('专用设备API响应:', deviceData)
            
            if (deviceData) {
              deviceCode = deviceData.DeviceCode || deviceData.deviceCode
              accessories = deviceData.Accessories || deviceData.accessories || '无'
              equipmentName = equipmentName || deviceData.Name || deviceData.name
              console.log('从专用设备表获取的设备编号:', deviceCode)
              console.log('从专用设备表获取的配件:', accessories)
              console.log('从专用设备表获取的设备名称:', equipmentName)
            }
          } catch (specialError) {
            console.log('专用设备表未找到，equipmentId:', equipmentId, '错误:', specialError.message)
            
            // 尝试从通用设备表获取
            try {
              console.log('尝试从通用设备表获取设备信息，equipmentId:', equipmentId)
              const deviceData = await deviceApi.getGeneralEquipment(equipmentId)
              console.log('通用设备API响应:', deviceData)
              
              if (deviceData) {
                deviceCode = deviceData.DeviceCode || deviceData.deviceCode
                accessories = deviceData.Accessories || deviceData.accessories || '无'
                equipmentName = equipmentName || deviceData.Name || deviceData.name
                console.log('从通用设备表获取的设备编号:', deviceCode)
                console.log('从通用设备表获取的配件:', accessories)
                console.log('从通用设备表获取的设备名称:', equipmentName)
              }
            } catch (generalError) {
              console.log('通用设备表也未找到，equipmentId:', equipmentId, '错误:', generalError.message)
              // 设备不存在时，使用默认值，不影响整个流程
              deviceCode = equipmentId.toString()
              accessories = '无'
            }
          }
        }
        
        return {
            ...item,
            id: `${order.id}-${index}`, // 添加唯一ID
            inboundQuantity: isConsumable ? (item.quantity || item.Quantity || 0) : 0, // 耗材类物品默认加载原始数量，非耗材类默认0
            isMarkedInbound: false, // 默认未标记入库
            // 标准化字段名
            deviceCode: deviceCode || '无',
            accessories: accessories || '无',
            itemType: itemType,
            isConsumable: isConsumable,
            equipmentId: equipmentId || 0,
            EquipmentId: equipmentId || 0,
            equipmentName: equipmentName,
            ItemName: equipmentName,
            // 标准化设备状态字段
            status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常',
            Status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常'
          }
      }))
      
      console.log('初始化的入库项:', initialItems)
      setSelectedItems(initialItems)
    }
  }

  // 处理入库数量变更
  const handleInboundQuantityChange = (id, value) => {
    setSelectedItems(prev => {
      return prev.map(item => 
        item.id === id ? { ...item, inboundQuantity: value } : item
      )
    })
  }

  // 处理全选/取消全选
  const handleSelectAll = (selected) => {
    setSelectedItems(prev => {
      return prev.map(item => ({
        ...item,
        inboundQuantity: selected ? item.quantity : 0
      }))
    })
  }

  // 处理部分入库
  const handlePartialInbound = async (record) => {
    // 检查当前入库记录状态，如果已经是部分入库，则显示确认提示
    const currentStatus = record.status || record.Status;
    if (currentStatus === '部分入库') {
      Modal.confirm({
        title: '确认再次部分入库',
        content: '该入库记录已经是部分入库状态，确定要再次执行部分入库操作吗？',
        onOk: async () => {
          await executePartialInbound(record);
        }
      });
    } else {
      await executePartialInbound(record);
    }
  }

  // 执行部分入库操作
  const executePartialInbound = async (record) => {
    try {
      // 准备入库数据，从 selectedItems 获取最新的设备状态
      // 使用 selectedItems 而不是 record.items，以确保获取用户最新修改的设备状态
      console.log('准备部分入库，selectedItems:', selectedItems)
      const itemsData = selectedItems && selectedItems.length > 0 ? selectedItems.map(item => ({
        id: item.id || item.Id || 0,
        projectInboundId: item.projectInboundId || item.ProjectInboundId || 0,
        EquipmentId: item.equipmentId || item.EquipmentId || item.itemId || item.ItemId || 0, // 优先使用设备ID，其次使用itemId
        EquipmentName: item.equipmentName || item.EquipmentName || item.itemName || item.ItemName || '',
        DeviceCode: item.deviceCode || item.DeviceCode || '', // 设备编号
        SnCode: item.snCode || item.SnCode || item.serialNumber || item.SerialNumber || item.SN || item.sn || '', // SN码
        Brand: item.brand || item.Brand || '',
        Model: item.model || item.Model || '',
        Quantity: item.quantity || item.Quantity || 0,
        Unit: item.unit || item.Unit || '',
        Accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || '',
        // 优先使用用户最新修改的状态（status 或 Status）
        Status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常',
        ItemType: item.itemType || item.ItemType || (item.isConsumable ? 3 : 1)
      })) : (record.items ? record.items.map(item => ({
        id: item.id || item.Id || 0,
        projectInboundId: item.projectInboundId || item.ProjectInboundId || 0,
        EquipmentId: item.equipmentId || item.EquipmentId || item.itemId || item.ItemId || 0, // 优先使用设备ID，其次使用itemId
        EquipmentName: item.equipmentName || item.EquipmentName || item.itemName || item.ItemName || '',
        DeviceCode: item.deviceCode || item.DeviceCode || '', // 设备编号
        SnCode: item.snCode || item.SnCode || item.serialNumber || item.SerialNumber || item.SN || item.sn || '', // SN码
        Brand: item.brand || item.Brand || '',
        Model: item.model || item.Model || '',
        Quantity: item.quantity || item.Quantity || 0,
        Unit: item.unit || item.Unit || '',
        Accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || '',
        // 优先使用用户最新修改的状态（status 或 Status）
        Status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常',
        ItemType: item.itemType || item.ItemType || (item.isConsumable ? 3 : 1)
      })) : [])
      
      console.log('准备的入库数据:', itemsData)
      
      const inboundData = {
        id: record.id || record.Id || 0,
        inboundNumber: record.inboundNumber || record.InboundNumber || '',
        outboundOrderId: record.outboundOrderId || record.OutboundOrderId || record.outboundId || record.OutboundId || 0,
        projectName: record.projectName || record.ProjectName || '',
        projectManager: record.projectManager || record.ProjectManager || '',
        contactPhone: record.contactPhone || record.ContactPhone || '',
        projectTime: record.projectTime || record.ProjectTime || '',
        usageLocation: record.usageLocation || record.UsageLocation || '',
        handler: record.handler || record.Handler || '',
        inspector: record.inspector || record.Inspector || '',
        warehouseKeeper: record.warehouseKeeper || record.WarehouseKeeper || '',
        inboundDate: record.inboundDate || record.InboundDate || '',
        remark: record.remark || record.Remark || '',
        status: '部分入库',
        isCompleted: false,
        Items: itemsData
      }
      
      // 标记为部分入库
      console.log('发送部分入库请求:', inboundData)
      const response = await projectInboundApi.updateProjectInbound(record.id, inboundData)
      console.log('部分入库响应:', response)
      
      // 清除缓存
      cacheManager.invalidate('project-inbounds')
      cacheManager.invalidate('project-outbounds')
      // 刷新数据
      await fetchData()
      message.success('部分入库成功')
    } catch (error) {
      console.error('部分入库失败:', error)
      message.error('部分入库失败，请重试')
    }
  }

  // 处理全部入库
  const handleFullInbound = async (record) => {
    // 确认是否已全部归还
    Modal.confirm({
      title: '确认全部入库',
      content: '您确定所有设备都已归还吗？',
      onOk: async () => {
        try {
          // 准备入库数据，从 selectedItems 获取最新的设备状态
          // 使用 selectedItems 而不是 record.items，以确保获取用户最新修改的设备状态
          console.log('准备全部入库，selectedItems:', selectedItems)
          const itemsData = selectedItems && selectedItems.length > 0 ? selectedItems.map(item => ({
            id: item.id || item.Id || 0,
            projectInboundId: item.projectInboundId || item.ProjectInboundId || 0,
            EquipmentId: item.equipmentId || item.EquipmentId || item.itemId || item.ItemId || 0, // 优先使用设备ID，其次使用itemId
            EquipmentName: item.equipmentName || item.EquipmentName || item.itemName || item.ItemName || '',
            DeviceCode: item.deviceCode || item.DeviceCode || '', // 设备编号
            Brand: item.brand || item.Brand || '',
            Model: item.model || item.Model || '',
            Quantity: item.quantity || item.Quantity || 0,
            Unit: item.unit || item.Unit || '',
            Accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || '',
            // 优先使用用户最新修改的状态（status 或 Status）
            Status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常',
            ItemType: item.itemType || item.ItemType || (item.isConsumable ? 3 : 1)
          })) : (record.items ? record.items.map(item => ({
            id: item.id || item.Id || 0,
            projectInboundId: item.projectInboundId || item.ProjectInboundId || 0,
            EquipmentId: item.equipmentId || item.EquipmentId || item.itemId || item.ItemId || 0, // 优先使用设备ID，其次使用itemId
            EquipmentName: item.equipmentName || item.EquipmentName || item.itemName || item.ItemName || '',
            DeviceCode: item.deviceCode || item.DeviceCode || '', // 设备编号
            Brand: item.brand || item.Brand || '',
            Model: item.model || item.Model || '',
            Quantity: item.quantity || item.Quantity || 0,
            Unit: item.unit || item.Unit || '',
            Accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || '',
            // 优先使用用户最新修改的状态（status 或 Status）
            Status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '正常',
            ItemType: item.itemType || item.ItemType || (item.isConsumable ? 3 : 1)
          })) : [])
          
          console.log('准备的入库数据:', itemsData)
          
          const inboundData = {
            id: record.id || record.Id || 0,
            inboundNumber: record.inboundNumber || record.InboundNumber || '',
            outboundOrderId: record.outboundOrderId || record.OutboundOrderId || record.outboundId || record.OutboundId || 0,
            projectName: record.projectName || record.ProjectName || '',
            projectManager: record.projectManager || record.ProjectManager || '',
            contactPhone: record.contactPhone || record.ContactPhone || '',
            projectTime: record.projectTime || record.ProjectTime || '',
            usageLocation: record.usageLocation || record.UsageLocation || '',
            handler: record.handler || record.Handler || '',
            inspector: record.inspector || record.Inspector || '',
            warehouseKeeper: record.warehouseKeeper || record.WarehouseKeeper || '',
            inboundDate: record.inboundDate || record.InboundDate || '',
            remark: record.remark || record.Remark || '',
            status: '全部入库',
            isCompleted: true,
            Items: itemsData
          }
          
          // 标记为全部入库
          console.log('发送全部入库请求:', inboundData)
          const response = await projectInboundApi.updateProjectInbound(record.id, inboundData)
          console.log('全部入库响应:', response)
          
          // 清除缓存
          cacheManager.invalidate('project-inbounds')
          cacheManager.invalidate('project-outbounds')
          // 刷新数据
          await fetchData()
          message.success('全部入库成功')
        } catch (error) {
          console.error('全部入库失败:', error)
          message.error('全部入库失败，请重试')
        }
      }
    })
  }

  // 删除入库记录
  const handleDeleteInbound = async (id) => {
    try {
      console.log('开始删除入库记录，ID:', id)
      // 调用 API 删除入库记录
      const response = await projectInboundApi.deleteProjectInbound(id)
      console.log('删除入库记录响应:', response)
      // 清除缓存
      cacheManager.invalidate('project-inbounds')
      cacheManager.invalidate('project-outbounds')
      // 刷新数据
      await fetchData()
      message.success('删除入库记录成功')
    } catch (error) {
      console.error('删除入库记录失败:', error)
      console.error('错误堆栈:', error.stack)
      message.error('删除入库记录失败，请重试')
    }
  }

  // 处理表单提交
  const handleSubmit = async (values) => {
    if (!selectedOutboundOrder) {
      message.error('请选择出库单')
      return
    }

    // 检查是否有选择入库设备
    const hasInboundItems = selectedItems.some(item => item.isMarkedInbound)
    if (!hasInboundItems) {
      message.error('请至少选择一项入库设备')
      return
    }

    // 检查入库数量是否合理
    const invalidItem = selectedItems.find(item => 
      item.isMarkedInbound && (item.inboundQuantity < 0 || item.inboundQuantity > item.quantity)
    )
    if (invalidItem) {
      message.error(`入库数量必须在 0 到 ${invalidItem.quantity} 之间`)
      return
    }

    // 对于编辑操作，保持原有的状态；对于新创建的入库记录，初始状态为未入库
    const status = currentEditInbound ? (currentEditInbound.status || currentEditInbound.Status || '未入库') : '未入库'

    setSubmitting(true)
    try {
      // 构建入库数据
      const itemsData = selectedItems
        .filter(item => item.isMarkedInbound)
        .map(item => ({
          id: 0, // 使用0作为新项的ID，让后端自动生成
          projectInboundId: item.projectInboundId || item.ProjectInboundId || 0,
          EquipmentId: item.equipmentId || item.EquipmentId || item.itemId || item.ItemId || 0,
          EquipmentName: item.equipmentName || item.EquipmentName || item.ItemName || '',
          SnCode: item.snCode || item.SnCode || item.serialNumber || item.SerialNumber || item.SN || item.sn || '', // SN码
          Brand: item.brand || item.Brand || '',
          Model: item.model || item.Model || '',
          Quantity: item.inboundQuantity || 0,
          Unit: item.unit || item.Unit || '',
          Status: item.status || item.Status || item.DeviceStatus || '正常',
          ItemType: item.itemType || item.ItemType || (item.isConsumable ? 3 : 1), // 1=专用设备, 2=通用设备, 3=耗材
          DeviceCode: item.deviceCode || item.DeviceCode || '',
          Accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || ''
        }))
      
      // 确保selectedOutboundOrder存在
      if (!selectedOutboundOrder) {
        message.error('请选择出库单');
        setSubmitting(false);
        return;
      }
      
      // 构建完整的dto对象，确保包含所有必填字段
      const dto = {
        id: currentEditInbound ? (currentEditInbound.id || currentEditInbound.Id || 0) : 0,
        inboundNumber: currentEditInbound ? (currentEditInbound.inboundNumber || currentEditInbound.InboundNumber) : inboundNumber,
        outboundOrderId: selectedOutboundOrder.id || 0,
        projectName: selectedOutboundOrder.projectName || '',
        projectManager: selectedOutboundOrder.projectManager || '',
        contactPhone: selectedOutboundOrder.contactPhone || '',
        projectTime: selectedOutboundOrder.projectTime || '',
        usageLocation: selectedOutboundOrder.usageLocation || selectedOutboundOrder.UsageLocation || '',
        handler: values.handler || '',
        inspector: values.inspector || '',
        warehouseKeeper: values.warehouseKeeper || '',
        inboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : '',
        remark: values.remark || '',
        status: status,
        isCompleted: currentEditInbound ? (currentEditInbound.isCompleted || false) : false,
        Items: itemsData
      };
      
      // 确保所有必填字段都有值
      if (!dto.inboundNumber) dto.inboundNumber = inboundNumber;
      if (!dto.projectName) dto.projectName = selectedOutboundOrder.projectName || '';
      if (!dto.projectManager) dto.projectManager = selectedOutboundOrder.projectManager || '';
      if (!dto.contactPhone) dto.contactPhone = selectedOutboundOrder.contactPhone || '';
      
      const inboundData = dto;
      
      console.log('发送的请求数据:', JSON.stringify(inboundData, null, 2));

      // 判断是创建还是更新
      if (currentEditInbound) {
        // 更新现有入库记录
        const response = await projectInboundApi.updateProjectInbound(currentEditInbound.id, inboundData)
        message.success(`项目${status === '全部入库' ? '全部' : '部分'}入库更新成功`)
      } else {
        // 创建新入库记录
        const response = await projectInboundApi.createProjectInbound(inboundData)
        message.success(`项目${status === '全部入库' ? '全部' : '部分'}入库成功`)
      }
      
      // 清除缓存
      cacheManager.invalidate('project-inbounds')
      cacheManager.invalidate('project-outbounds')
      // 刷新数据
      await fetchData()
      
      // 重置表单和选择
      form.resetFields()
      setSelectedOutboundOrder(null)
      setSelectedItems([])
      setCreateModalVisible(false)
      setEditModalVisible(false)
      setCurrentEditInbound(null)
    } catch (error) {
      console.error('创建入库记录失败:', error)
      message.error('创建入库记录失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }



  // 编辑入库记录
  const editInboundRecord = async (record) => {
    console.log('编辑入库记录:', record)
    setCurrentEditInbound(record)
    // 查找对应的出库单
    // 尝试从不同字段获取出库单ID
    const outboundOrderId = record.outboundOrderId || record.OutboundOrderId || record.outboundId || record.OutboundId
    console.log('出库单ID:', outboundOrderId)
    
    // 从outboundHistory中查找出库单
    let outboundOrder = outboundHistory.find(o => o.id === outboundOrderId)
    
    // 如果在outboundHistory中找不到，重新获取出库历史数据
    if (!outboundOrder) {
      console.log('在现有出库历史中未找到出库单，重新获取数据...')
      try {
        // 获取出库历史
        const outboundData = await get('/InOutbound/project-outbounds')
        // 处理可能的value字段包装
        const processedOutboundData = outboundData.value || outboundData
        console.log('重新获取的出库单:', processedOutboundData)
        // 再次尝试查找
        outboundOrder = processedOutboundData.find(o => o.id === outboundOrderId)
        
        // 如果通过ID找不到，尝试通过项目名称匹配
        if (!outboundOrder && record.projectName) {
          console.log('通过ID未找到出库单，尝试通过项目名称匹配...')
          outboundOrder = processedOutboundData.find(o => o.projectName === record.projectName)
        }
        
        // 更新outboundHistory
        setOutboundHistory(processedOutboundData)
      } catch (error) {
        console.error('获取出库历史失败:', error)
      }
    }
    
    console.log('找到的出库单:', outboundOrder)
    
    if (outboundOrder) {
      setSelectedOutboundOrder(outboundOrder)
      // 初始化可入库项，已入库的设备数量保持不变，未入库的设备数量为0
      // 尝试不同的字段名来获取设备明细
      const items = outboundOrder.items || outboundOrder.Items || outboundOrder.projectOutboundItems || outboundOrder.ProjectOutboundItems || []
      console.log('出库单设备明细:', items)
      
      // 获取设备详细信息
      const initialItems = await Promise.all(items.map(async (item, index) => {
        // 尝试不同的字段名匹配已入库的物品
        // 优先使用 equipmentId 进行匹配，如果 equipmentId 不存在则使用 equipmentName
        const itemEquipId = item.equipmentId || item.EquipmentId
        const itemEquipName = item.equipmentName || item.EquipmentName || item.itemName || item.ItemName
        
        // 检测是否为耗材类型（根据物品名称或类型）
        const isConsumable = item.itemType === 3 || item.ItemType === 3 || 
                          item.name?.includes('耗材') || item.Name?.includes('耗材') ||
                          item.equipmentName?.includes('别针') || item.EquipmentName?.includes('别针') ||
                          item.equipmentName?.includes('耗材') || item.EquipmentName?.includes('耗材') ||
                          item.itemName?.includes('耗材') || item.ItemName?.includes('耗材')
        
        // 尝试从不同字段名获取入库设备列表
        const inboundItems = record.items || record.Items || []
        // 对于非耗材类型的设备，使用EquipmentId进行精确匹配
        // 对于耗材类型的物品，使用EquipmentName进行匹配
        const existingItem = inboundItems.find(i => {
          // 对于非耗材类型的设备，优先使用EquipmentId进行匹配
          if (!isConsumable) {
            const itemEquipId = item.equipmentId || item.EquipmentId || item.itemId || item.ItemId
            const iEquipId = i.EquipmentId || i.equipmentId
            return itemEquipId && iEquipId && itemEquipId === iEquipId
          } else {
            // 对于耗材类型的物品，使用物品名称进行匹配
            const itemEquipName = item.EquipmentName || item.equipmentName || item.ItemName || item.itemName
            const iEquipName = i.EquipmentName || i.equipmentName
            return itemEquipName && iEquipName && itemEquipName === iEquipName
          }
        })
        console.log('物品:', itemEquipName, '现有入库项:', existingItem)
        
        // 从设备表获取设备详细信息
        let deviceCode = item.DeviceCode || item.deviceCode
        let accessories = item.Accessories || item.accessories || item.accessory || item.Accessory || item.equipmentAccessories || item.EquipmentAccessories
        
        // 优先使用设备ID，其次使用itemId
        const equipmentId = item.equipmentId || item.EquipmentId || item.itemId || item.ItemId
        const itemType = item.ItemType || item.itemType || (isConsumable ? 3 : 1)
        console.log('设备ID:', equipmentId, '设备类型:', itemType)
        
        if (equipmentId && !isConsumable) {
          // 尝试从专用设备表获取
          try {
            console.log('尝试从专用设备表获取设备信息，equipmentId:', equipmentId)
            const deviceData = await deviceApi.getSpecialEquipment(equipmentId)
            console.log('专用设备API响应:', deviceData)
            
            if (deviceData) {
              deviceCode = deviceData.DeviceCode || deviceData.deviceCode
              accessories = deviceData.Accessories || deviceData.accessories || '无'
              console.log('从专用设备表获取的设备编号:', deviceCode)
              console.log('从专用设备表获取的配件:', accessories)
            }
          } catch (specialError) {
            console.log('专用设备表未找到，equipmentId:', equipmentId, '错误:', specialError.message)
            
            // 尝试从通用设备表获取
            try {
              console.log('尝试从通用设备表获取设备信息，equipmentId:', equipmentId)
              const deviceData = await deviceApi.getGeneralEquipment(equipmentId)
              console.log('通用设备API响应:', deviceData)
              
              if (deviceData) {
                deviceCode = deviceData.DeviceCode || deviceData.deviceCode
                accessories = deviceData.Accessories || deviceData.accessories || '无'
                console.log('从通用设备表获取的设备编号:', deviceCode)
                console.log('从通用设备表获取的配件:', accessories)
              }
            } catch (generalError) {
              console.log('通用设备表也未找到，equipmentId:', equipmentId, '错误:', generalError.message)
              // 设备不存在时，使用默认值，不影响整个流程
              deviceCode = equipmentId.toString()
              accessories = '无'
            }
          }
        }
        
        // 确定设备名称
        let equipmentName = item.equipmentName || item.EquipmentName || item.itemName || item.ItemName || item.Name || item.name
        // 确定品牌
        let brand = item.brand || item.Brand
        // 确定型号
        let model = item.model || item.Model
        // 确定单位
        let unit = item.unit || item.Unit
        // 确定数量
        let quantity = item.quantity || item.Quantity
        
        // 如果是已入库的设备，使用已入库记录中的信息
        if (existingItem) {
          equipmentName = existingItem.equipmentName || existingItem.EquipmentName || existingItem.itemName || existingItem.ItemName || equipmentName
          brand = existingItem.brand || existingItem.Brand || brand
          model = existingItem.model || existingItem.Model || model
          unit = existingItem.unit || existingItem.Unit || unit
          quantity = existingItem.quantity || existingItem.Quantity || quantity
          deviceCode = existingItem.deviceCode || existingItem.DeviceCode || deviceCode
          accessories = existingItem.accessories || existingItem.Accessories || existingItem.accessory || existingItem.Accessory || existingItem.equipmentAccessories || existingItem.EquipmentAccessories || accessories
        }
        
        return {
          ...item,
          id: `${outboundOrder.id}-${index}`, // 添加唯一ID
          inboundQuantity: existingItem ? existingItem.quantity : (isConsumable ? (item.quantity || item.Quantity || 0) : 0),
          isMarkedInbound: !!existingItem, // 如果有 existingItem 则标记为已入库
          // 标准化字段名
          deviceCode: deviceCode || '无',
          accessories: accessories || '无',
          itemType: itemType,
          isConsumable: isConsumable,
          equipmentId: equipmentId || 0,
          EquipmentId: equipmentId || 0,
          equipmentName: equipmentName,
          ItemName: equipmentName,
          brand: brand,
          Brand: brand,
          model: model,
          Model: model,
          unit: unit,
          Unit: unit,
          quantity: quantity,
          Quantity: quantity,
          // 使用已入库记录中的状态，如果存在
          status: existingItem ? (existingItem.status || existingItem.Status || existingItem.deviceStatus || existingItem.DeviceStatus) : (item.status || item.Status || item.deviceStatus || item.DeviceStatus),
          Status: existingItem ? (existingItem.status || existingItem.Status || existingItem.deviceStatus || existingItem.DeviceStatus) : (item.status || item.Status || item.deviceStatus || item.DeviceStatus)
        }
      }))
      
      console.log('初始化的入库项:', initialItems)
      setSelectedItems(initialItems)
      
      // 设置入库单号
      setInboundNumber(record.inboundNumber || record.InboundNumber)
      
      // 设置表单字段值
      form.setFieldsValue({
        outboundOrderId: outboundOrder.id,
        handler: record.handler || record.Handler,
        inspector: record.inspector || record.Inspector,
        warehouseKeeper: record.warehouseKeeper || record.WarehouseKeeper,
        inboundDate: record.inboundDate || record.InboundDate ? moment(record.inboundDate || record.InboundDate) : null,
        remark: record.remark || record.Remark
      })
      
      setEditModalVisible(true)
    } else {
      console.error('未找到对应的出库单')
      message.error('未找到对应的出库单，请刷新页面重试')
    }
  }

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>设备名称</span>,
      dataIndex: 'ItemName',
      key: 'equipmentName',
      width: 140,
      render: (text, record) => (
        <div style={{ fontSize: '14px' }}>
          {text || record.ItemName || record.EquipmentName || record.equipmentName || ''}
        </div>
      )
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>设备编号</span>,
      dataIndex: 'DeviceCode',
      key: 'deviceCode',
      width: 120,
      render: (text, record) => {
        console.log('设备编号:', text, record.deviceCode, record.DeviceCode, record.equipmentId, record.EquipmentId)
        return (
          <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
            {text || record.deviceCode || record.DeviceCode || ''}
          </div>
        )
      }
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>SN码</span>,
      dataIndex: 'SnCode',
      key: 'snCode',
      width: 120,
      render: (text, record) => {
        return (
          <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
            {text || record.snCode || record.SnCode || record.serialNumber || record.SerialNumber || ''}
          </div>
        )
      }
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>品牌</span>,
      dataIndex: 'Brand',
      key: 'brand',
      width: 90,
      align: 'center',
      render: (text, record) => (
        <div style={{ fontSize: '14px' }}>
          {text || record.brand || record.Brand || ''}
        </div>
      )
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>型号</span>,
      dataIndex: 'Model',
      key: 'model',
      width: 100,
      render: (text, record) => (
        <div style={{ fontSize: '14px' }}>
          {text || record.model || record.Model || ''}
        </div>
      )
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>数量</span>,
      dataIndex: 'Quantity',
      key: 'quantity',
      width: 90,
      align: 'center',
      render: (text, record) => {
        console.log('设备类型:', record.itemType, record.ItemType, '是否为耗材:', record.isConsumable)
        // 只有耗材类型的数据，数量格为可编辑
        const isConsumable = record.isConsumable || record.itemType === 3 || record.ItemType === 3
        console.log('是否为耗材:', isConsumable)
        if (isConsumable) {
          return (
            <InputNumber 
              min={0} 
              max={record.quantity || record.Quantity}
              defaultValue={record.inboundQuantity || 0}
              onChange={(value) => handleInboundQuantityChange(record.id, value)}
              style={{ fontSize: '14px' }}
            />
          )
        } else {
          return (
            <div style={{ fontSize: '14px' }}>
              {text || record.quantity || record.Quantity || ''}
            </div>
          )
        }
      }
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>单位</span>,
      dataIndex: 'Unit',
      key: 'unit',
      width: 70,
      align: 'center',
      render: (text, record) => (
        <div style={{ fontSize: '14px' }}>
          {text || record.unit || record.Unit || ''}
        </div>
      )
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>配件</span>,
      dataIndex: 'Accessories',
      key: 'accessories',
      flex: 1,
      render: (text, record) => {
        console.log('配件信息:', text, record.accessories, record.Accessories, record.accessory, record.Accessory)
        return (
          <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {text || record.accessories || record.Accessories || record.accessory || record.Accessory || '无'}
          </div>
        )
      }
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>设备状态</span>,
      dataIndex: 'DeviceStatus',
      key: 'status',
      width: 110,
      align: 'center',
      render: (text, record) => {
        // 使用当前记录的最新状态值
        const currentStatus = record.status || record.Status || record.DeviceStatus || text || '正常'
        console.log('设备状态渲染:', record.equipmentName || record.EquipmentName, '当前状态:', currentStatus, 'record.status:', record.status, 'record.Status:', record.Status, 'record.DeviceStatus:', record.DeviceStatus)
        return (
          <Select 
            value={currentStatus}
            style={{ width: 110, fontSize: '14px' }}
            onChange={(value) => {
              console.log('设备状态变更:', record.equipmentName || record.EquipmentName, '从', currentStatus, '到', value)
              // 处理设备状态变更
              setSelectedItems(prev => {
                return prev.map(item => 
                  item.id === record.id ? { ...item, status: value || '正常', Status: value || '正常', DeviceStatus: value || '正常', deviceStatus: value || '正常' } : item
                )
              })
            }}
          >
            <Option value="正常">正常</Option>
            <Option value="损坏">损坏</Option>
            <Option value="丢失">丢失</Option>
          </Select>
        )
      }
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>备注</span>,
      dataIndex: 'Remark',
      key: 'remark',
      width: 130,
      render: (text, record) => (
        <Input.TextArea 
          rows={1} 
          defaultValue={text || record.remark || record.Remark || ''}
          onChange={(e) => {
            // 处理备注变更
            setSelectedItems(prev => {
              return prev.map(item => 
                item.id === record.id ? { ...item, remark: e.target.value, Remark: e.target.value } : item
              )
            })
          }}
          style={{ fontSize: '14px' }}
        />
      )
    },
    {
      title: <span style={{ fontWeight: 'bold', fontSize: '15px' }}>操作</span>,
      key: 'action',
      width: 110,
      align: 'center',
      render: (_, record) => {
        const isMarked = record.isMarkedInbound
        return (
          <Button 
            type={isMarked ? "default" : "primary"}
            icon={isMarked ? <CloseOutlined /> : <CheckOutlined />}
            style={isMarked ? { backgroundColor: '#f6ffed', borderColor: '#b7eb8f', color: '#52c41a', fontSize: '13px' } : { fontSize: '13px' }}
            onClick={() => {
              if (isMarked) {
                // 取消标记入库
                setSelectedItems(prev => {
                  return prev.map(item => 
                    item.id === record.id ? { ...item, isMarkedInbound: false, inboundQuantity: record.isConsumable ? (item.quantity || item.Quantity || 0) : 0 } : item
                  )
                })
                message.info('已取消标记入库')
              } else {
                // 标记入库操作
                setSelectedItems(prev => {
                  return prev.map(item => 
                    item.id === record.id ? { 
                      ...item, 
                      isMarkedInbound: true,
                      inboundQuantity: record.isConsumable ? item.inboundQuantity : (item.quantity || item.Quantity || 0)
                    } : item
                  )
                })
                message.success('标记入库成功')
              }
            }}
          >
            {isMarked ? '取消标记' : '标记入库'}
          </Button>
        )
      }
    }
  ]

  // 入库历史表格列
  const historyColumns = [
    {
      title: '入库单号',
      dataIndex: 'inboundNumber',
      key: 'inboundNumber'
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '项目负责人',
      dataIndex: 'projectManager',
      key: 'projectManager'
    },
    {
      title: '操作人',
      dataIndex: 'handler',
      key: 'handler'
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
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => previewInbound(record)}>预览</Button>
          {record.status === '部分入库' && (
            <Button icon={<EditOutlined />} onClick={() => editInboundRecord(record)}>
              编辑
            </Button>
          )}
          <Button type="primary" onClick={() => handlePartialInbound(record)} disabled={record.status === '全部入库'}>
            部分入库
          </Button>
          <Button type="default" onClick={() => handleFullInbound(record)} disabled={record.status === '全部入库'}>
            全部入库
          </Button>
          <Popconfirm
            title="确定要删除这条入库记录吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDeleteInbound(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="danger" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]



  // 预览入库记录
  const previewInbound = async (record) => {
    console.log('预览入库记录:', record)
    console.log('入库记录items:', record.items || record.Items)
    
    // 如果有items，打印第一个item的所有字段
    const items = record.items || record.Items
    if (items && items.length > 0) {
      console.log('第一个item的所有字段:', JSON.stringify(items[0], null, 2))
    }
    
    // 构建预览数据
    const inboundItems = record.items || record.Items || []
    
    const previewDataObj = {
      inboundNumber: record.inboundNumber || '',
      projectName: record.projectName || '',
      projectTime: record.projectTime || '',
      usageLocation: record.usageLocation || '',
      projectManager: record.projectManager || '',
      contactPhone: record.contactPhone || '',
      handler: record.handler || '',
      inspector: record.inspector || '',
      warehouseKeeper: record.warehouseKeeper || '',
      inboundDate: record.inboundDate ? new Date(record.inboundDate).toISOString().split('T')[0] : '',
      remark: record.remark || '',
      items: inboundItems.map((item, index) => {
        console.log(`处理item ${index}:`, item)
        // 处理设备编号和SN码
        const deviceId = item.deviceCode || item.DeviceCode || item.equipmentId || item.EquipmentId || ''
        const snCode = item.snCode || item.SnCode || item.serialNumber || item.SerialNumber || item.SN || item.sn || ''
        console.log(`item ${index} deviceId:`, deviceId, 'snCode:', snCode)
        console.log(`item ${index} equipmentId:`, item.equipmentId, 'EquipmentId:', item.EquipmentId)
        console.log(`item ${index} deviceCode:`, item.deviceCode, 'DeviceCode:', item.DeviceCode)
        console.log(`item ${index} snCode:`, item.snCode, 'SnCode:', item.SnCode)
        return {
          id: `${record.id}-${index}`, // 添加唯一ID
          type: item.itemType === 1 ? '专用设备' : item.itemType === 2 ? '通用设备' : '耗材',
          name: item.ItemName || item.EquipmentName || item.equipmentName || item.itemName || item.Name || item.name || '',
          deviceId: deviceId,
          deviceCode: item.deviceCode || item.DeviceCode || '',
          equipmentId: item.equipmentId || item.EquipmentId || 0, // 设备ID
          snCode: snCode,
          SnCode: item.SnCode || item.snCode || snCode,
          brand: item.brand || item.Brand || '',
          model: item.model || item.Model || '',
          quantity: item.quantity || item.Quantity || 0,
          unit: item.unit || item.Unit || '',
          accessories: item.accessories || item.Accessories || item.accessory || item.Accessory || item.equipmentAccessories || item.EquipmentAccessories || '',
          status: item.status || item.Status || item.deviceStatus || item.DeviceStatus || '',
          remark: item.remark || item.Remark || '',
          isInbound: true
        }
      })
    }
    
    console.log('预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    setPreviewModalVisible(true)
  }

  // 处理新建入库单的预览
  const handlePreview = async (values) => {
    console.log('处理新建入库单预览:', values, selectedOutboundOrder, selectedItems)
    
    // 构建预览数据
    const previewDataObj = {
      inboundNumber: inboundNumber, // 显示生成的入库单号
      projectName: selectedOutboundOrder?.projectName || '',
      projectTime: selectedOutboundOrder?.projectTime || '',
      usageLocation: selectedOutboundOrder?.usageLocation || selectedOutboundOrder?.UsageLocation || '',
      projectManager: selectedOutboundOrder?.projectManager || '',
      contactPhone: selectedOutboundOrder?.contactPhone || '',
      handler: values.handler || '',
      inspector: values.inspector || '',
      warehouseKeeper: values.warehouseKeeper || '',
      inboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : '',
      remark: values.remark || '',
      items: selectedItems
        .map((item, index) => ({
          id: `${inboundNumber}-${index}`, // 添加唯一ID
          type: item.itemType === 1 ? '专用设备' : item.itemType === 2 ? '通用设备' : '耗材',
          name: item.ItemName || item.EquipmentName || item.equipmentName || '',
          deviceId: item.deviceCode || item.DeviceCode || item.EquipmentId || item.equipmentId || '', // 优先使用设备编号，其次使用设备ID
          equipmentId: item.equipmentId || item.EquipmentId || 0, // 设备ID
          snCode: item.snCode || item.SnCode || item.SerialNumber || item.serialNumber || item.SN || item.sn || '', // SN码
          brand: item.Brand || item.brand || '',
          model: item.Model || item.model || '',
          quantity: item.isMarkedInbound ? (item.inboundQuantity || 0) : 0,
          unit: item.Unit || item.unit || '',
          accessories: item.Accessories || item.accessories || item.accessory || item.Accessory || '',
          status: item.status || item.DeviceStatus || item.Status || '',
          remark: item.remark || item.Remark || '',
          isInbound: item.isMarkedInbound
        }))
    }
    
    console.log('新建入库单预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    setPreviewModalVisible(true)
  }

  return (
    <div className="project-inbound">
      <style>{`
        .marked-inbound-row {
          background-color: #f6ffed !important;
        }
        .marked-inbound-row:hover {
          background-color: #d9f7be !important;
        }
        .preview-marked-row {
          background-color: #f6ffed !important;
        }
        .preview-marked-row:hover {
          background-color: #d9f7be !important;
        }
      `}</style>
      <Card 
        title="入库历史记录" 
        className="mt-4"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setCurrentEditInbound(null)
              setCreateModalVisible(true)
            }}
            disabled={loading}
          >
            新建入库
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>加载中...</p>
          </div>
        ) : (
          <Table 
            columns={historyColumns} 
            dataSource={inboundHistory} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* 新建/编辑入库模态框 */}
      <Modal
        title={editModalVisible ? "编辑入库记录" : "项目入库"}
        open={createModalVisible || editModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          setEditModalVisible(false)
          form.resetFields()
          setSelectedOutboundOrder(null)
          setSelectedItems([])
          setCurrentEditInbound(null)
        }}
        footer={null}
        width={1800}
        style={{ top: 5, height: '98vh' }}
        styles={{ body: { height: 'calc(98vh - 100px)', overflow: 'auto' } }}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={() => {}}
        >
          <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item 
            label="入库单号" 
            disabled
          >
            <Input 
              value={inboundNumber} 
              placeholder="自动生成"
              disabled
              style={{ 
                backgroundColor: '#fafafa',
                borderColor: '#d9d9d9'
              }}
            />
          </Form.Item>

          <Form.Item 
            name="outboundOrderId" 
            label="选择出库单" 
            rules={[{ required: true, message: '请选择出库单' }]}
          >
            <Select 
              placeholder="请选择出库单"
              onChange={handleOutboundOrderSelect}
              disabled={editModalVisible} // 编辑时不允许选择其他出库单
              style={{ width: '100%' }}
            >
              {outboundHistory.map(order => (
                <Option key={order.id} value={order.id}>
                  出库单 #{order.id} - {order.projectName} ({order.outboundDate || order.projectTime})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

          {selectedOutboundOrder && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ marginBottom: 24, padding: '16px', border: '1px solid #e8e8e8', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>入库信息</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>项目名称</label>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedOutboundOrder.projectName || ''}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>项目时间</label>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedOutboundOrder.projectTime || ''}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>使用地</label>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedOutboundOrder.usageLocation || selectedOutboundOrder.UsageLocation || ''}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>项目负责人</label>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedOutboundOrder.projectManager || ''}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>联系电话</label>
                    <div style={{ fontSize: '14px', color: '#333' }}>{selectedOutboundOrder.contactPhone || ''}</div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#1890ff' }}>入库物品</h3>
                <Button 
                  type="default" 
                  onClick={() => handleSelectAll(true)}
                >
                  全选
                </Button>
              </div>
              <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                <Table 
                  columns={inboundItemColumns} 
                  dataSource={selectedItems} 
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 1200 }}
                  size="middle"
                  rowClassName={(record) => record.isMarkedInbound ? 'marked-inbound-row' : ''}
                />
              </div>
              {selectedItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fafafa', borderRadius: '8px', marginTop: '16px' }}>
                  <p style={{ margin: 0, color: '#999' }}>该出库单没有设备明细</p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
            <Form.Item 
              name="handler" 
              label="经办人" 
              rules={[{ required: true, message: '请输入经办人' }]}
            >
              <Input placeholder="请输入经办人" />
            </Form.Item>

            <Form.Item 
              name="inspector" 
              label="检测人" 
              rules={[{ required: true, message: '请输入检测人' }]}
            >
              <Input placeholder="请输入检测人" />
            </Form.Item>

            <Form.Item 
              name="warehouseKeeper" 
              label="库管" 
              rules={[{ required: true, message: '请输入库管' }]}
            >
              <Input placeholder="请输入库管" />
            </Form.Item>

            <Form.Item 
              name="inboundDate" 
              label="入库日期" 
              rules={[{ required: true, message: '请选择入库日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Form.Item 
              name="remark" 
              label="备注"
            >
              <Input.TextArea rows={3} placeholder="请输入备注信息" />
            </Form.Item>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button 
              onClick={() => {
                setCreateModalVisible(false)
                setEditModalVisible(false)
                form.resetFields()
                setSelectedOutboundOrder(null)
                setSelectedItems([])
                setCurrentEditInbound(null)
              }}
            >
              取消
            </Button>
            <Button 
              onClick={() => {
                form.validateFields().then(values => {
                  handlePreview(values)
                })
              }}
            >
              预览
            </Button>
            <Button 
              type="primary" 
              loading={submitting}
              onClick={() => {
                form.validateFields().then(values => {
                  handleSubmit(values)
                })
              }}
            >
              提交入库
            </Button>
          </div>
        </Form>
      </Modal>



      {/* 预览模态框 */}
      <Modal
        title="入库单预览"
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
          <Button key="save" type="primary" onClick={handlePrint}>
            保存PDF
          </Button>
        ]}
      >
        <div ref={printRef} className="preview-content" style={{ padding: '20px', maxHeight: '75vh', overflow: 'auto', backgroundColor: '#fff' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2>项目入库单</h2>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            {/* 第一行：入库单号 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col span={24}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>入库单号:</strong> {previewData.inboundNumber}</p>
              </Col>
            </Row>
            
            {/* 项目信息行：项目名称、项目时间、使用地、项目负责人、联系电话 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>项目名称:</strong> {previewData.projectName}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>项目时间:</strong> {previewData.projectTime}</p>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <p style={{ margin: 0 }}><strong>使用地:</strong> {previewData.usageLocation}</p>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <p style={{ margin: 0 }}><strong>项目负责人:</strong> {previewData.projectManager}</p>
              </Col>
              <Col xs={24} sm={4} md={4}>
                <p style={{ margin: 0 }}><strong>联系电话:</strong> {previewData.contactPhone}</p>
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
                  render: (text, record) => {
                    console.log('设备编号渲染:', text, 'record:', record)
                    // 优先使用deviceCode字段，然后是deviceId，最后是equipmentId
                    const value = record.deviceCode || record.DeviceCode || text || record.equipmentId || record.EquipmentId || '-'
                    return (
                      <div style={{ 
                        whiteSpace: 'normal', 
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}>
                        {value}
                      </div>
                    )
                  }
                },
                {
                  title: 'SN码',
                  dataIndex: 'snCode',
                  key: 'snCode',
                  width: '10%',
                  render: (text, record) => {
                    console.log('SN码渲染:', text, 'record:', record)
                    // 优先使用text，然后是SnCode，最后是snCode
                    const value = text || record.SnCode || record.snCode || '-'
                    return (
                      <div style={{ 
                        whiteSpace: 'normal', 
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}>
                        {value}
                      </div>
                    )
                  }
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
                  width: '8%',
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
                  width: '20%',
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
                  width: '6%'
                },
                {
                  title: '入库状态',
                  dataIndex: 'isInbound',
                  key: 'isInbound',
                  width: '4%',
                  render: (text) => (
                    <div style={{ textAlign: 'center' }}>
                      {text ? (
                        <CheckOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                      ) : (
                        <div style={{ width: '16px' }}></div>
                      )}
                    </div>
                  )
                },
                {
                  title: '备注',
                  dataIndex: 'remark',
                  key: 'remark',
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
                }
              ]} 
              dataSource={previewData.items || []} 
              rowKey={(record) => record.deviceId || record.id}
              pagination={false}
              size="small"
              bordered
              style={{ width: '100%' }}
              rowClassName={(record) => record.isInbound ? 'preview-marked-row' : ''}
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
            {/* 签收信息行：经办人、检测人、库管、入库时间 */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>经办人:</strong> {previewData.handler}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>检测人:</strong> {previewData.inspector}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>库管:</strong> {previewData.warehouseKeeper}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>入库时间:</strong> {previewData.inboundDate}</p>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProjectInbound