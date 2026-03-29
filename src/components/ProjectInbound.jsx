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
import axios from 'axios'
import moment from 'moment'
import { deviceApi } from '../services/api'
import { useReactToPrint } from 'react-to-print'

const { Option } = Select

// API 基础URL
const API_BASE_URL = 'http://localhost:5055/api/InOutbound'

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
          font-family: 'Microsoft YaHei', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
        }
        .preview-content {
          max-height: none !important;
          overflow: visible !important;
          padding: 0 !important;
        }
        table {
          page-break-inside: avoid;
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 10px 0 !important;
          font-size: 11px !important;
        }
        th, td {
          border: 1px solid #ddd !important;
          padding: 4px !important;
          text-align: left !important;
          font-size: 11px !important;
        }
        th:nth-child(1), td:nth-child(1) { width: 60px !important; text-align: center !important; font-size: 8px !important; line-height: 1.2 !important; padding: 2px !important; }
        th:nth-child(2), td:nth-child(2) { width: 80px !important; text-align: center !important; }
        th:nth-child(3), td:nth-child(3) { width: 120px !important; }
        th:nth-child(4), td:nth-child(4) { width: 100px !important; font-size: 9px !important; word-break: break-all !important; }
        th:nth-child(5), td:nth-child(5) { width: 80px !important; text-align: center !important; }
        th:nth-child(6), td:nth-child(6) { width: 90px !important; word-break: break-all !important; }
        th:nth-child(7), td:nth-child(7) { width: 70px !important; text-align: center !important; }
        th:nth-child(8), td:nth-child(8) { width: 60px !important; text-align: center !important; }
        th:nth-child(9), td:nth-child(9) { width: 120px !important; word-break: break-all !important; }
        th:nth-child(10), td:nth-child(10) { width: 100px !important; text-align: center !important; }
        th:nth-child(11), td:nth-child(11) { width: 100px !important; word-break: break-all !important; }
        th {
          background-color: #f2f2f2 !important;
          font-weight: bold !important;
        }
        tr {
          page-break-inside: avoid;
        }
        td {
          page-break-inside: avoid;
        }
        h1 {
          font-size: 18px !important;
          text-align: center !important;
          margin: 0 0 8px 0 !important;
        }
        h3 {
          font-size: 13px !important;
          margin: 0 0 8px 0 !important;
        }
        .ant-row {
          width: 100% !important;
          margin: 0 !important;
        }
        .ant-col {
          padding: 0 !important;
        }
        div {
          break-inside: avoid;
        }
        .preview-content > div {
          margin-bottom: 12px !important;
          padding: 10px !important;
        }
        .preview-content h3 {
          font-size: 13px !important;
          margin-bottom: 8px !important;
        }
        .preview-content .ant-row {
          margin-bottom: 8px !important;
          display: flex !important;
          flex-wrap: nowrap !important;
        }
        .preview-content .ant-col {
          margin-bottom: 0 !important;
          flex: 1 !important;
          min-width: 0 !important;
        }
        .preview-content .ant-col > div {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
        }
        .preview-content .ant-col > div > span:first-child {
          font-size: 11px !important;
          margin-bottom: 2px !important;
        }
        .preview-content .ant-col > div > span:last-child {
          font-size: 12px !important;
          font-weight: 500 !important;
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
      // 获取入库历史
      const inboundResponse = await axios.get(`${API_BASE_URL}/project-inbounds`)
      // 处理可能的value字段包装
      const inboundData = inboundResponse.data.value || inboundResponse.data
      setInboundHistory(inboundData)
      
      // 获取出库历史
      const outboundResponse = await axios.get(`${API_BASE_URL}/project-outbounds`)
      console.log('获取到的出库单数据:', outboundResponse.data)
      // 处理可能的value字段包装
      const outboundData = outboundResponse.data.value || outboundResponse.data
      // 筛选已确认出库的出库单
      const confirmedOutbounds = outboundData.filter(order => order.isCompleted === true)
      console.log('筛选后的出库单:', confirmedOutbounds)
      setOutboundHistory(confirmedOutbounds)
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
      const items = order.items || order.Items || order.projectOutboundItems || order.ProjectOutboundItems || []
      console.log('获取到的设备明细:', items)
      
      // 获取设备详细信息
      const initialItems = await Promise.all(items.map(async (item, index) => {
        console.log('设备明细项:', item)
        // 检测是否为耗材类型（根据物品名称或类型）
        const isConsumable = item.itemType === 3 || item.ItemType === 3 || 
                          item.name?.includes('耗材') || item.Name?.includes('耗材') ||
                          item.equipmentName?.includes('别针') || item.EquipmentName?.includes('别针') ||
                          item.equipmentName?.includes('耗材') || item.EquipmentName?.includes('耗材')
        console.log('是否为耗材:', isConsumable)
        
        // 从设备表获取设备详细信息
        let deviceCode = item.DeviceCode || item.deviceCode
        let accessories = item.Accessories || item.accessories || item.accessory || item.Accessory || item.equipmentAccessories || item.EquipmentAccessories
        
        const equipmentId = item.equipmentId || item.EquipmentId
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
        
        return {
            ...item,
            id: `${order.id}-${index}`, // 添加唯一ID
            inboundQuantity: isConsumable ? (item.quantity || item.Quantity || 0) : 0, // 耗材类物品默认加载原始数量，非耗材类默认0
            isMarkedInbound: false, // 默认未标记入库
            // 标准化字段名
            deviceCode: deviceCode || '无',
            accessories: accessories || '无',
            itemType: itemType,
            isConsumable: isConsumable
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
    try {
      // 标记为部分入库
      const response = await axios.put(`${API_BASE_URL}/project-inbounds/${record.id}`, {
        ...record,
        status: '部分入库'
      })
      
      // 释放设备使用状态
      if (record.items && record.items.length > 0) {
        for (const item of record.items) {
          const itemType = item.itemType || item.ItemType
          const equipmentId = item.equipmentId || item.EquipmentId
          
          if (equipmentId && itemType !== 3) {
            // 根据设备类型调用不同的API
            try {
              if (itemType === 1) {
                // 专用设备
                const equipment = await deviceApi.getSpecialEquipment(equipmentId)
                if (equipment) {
                  await deviceApi.updateSpecialEquipment(equipmentId, {
                    ...equipment,
                    useStatus: "未使用"
                  })
                }
              } else if (itemType === 2) {
                // 通用设备
                const equipment = await deviceApi.getGeneralEquipment(equipmentId)
                if (equipment) {
                  await deviceApi.updateGeneralEquipment(equipmentId, {
                    ...equipment,
                    useStatus: "未使用"
                  })
                }
              }
            } catch (e) {
              console.log(`释放设备使用状态失败 (ID: ${equipmentId}, Type: ${itemType}):`, e)
            }
          }
        }
      }
      
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
          // 标记为全部入库
          const response = await axios.put(`${API_BASE_URL}/project-inbounds/${record.id}`, {
            ...record,
            status: '全部入库'
          })
          
          // 释放设备使用状态
          if (record.items && record.items.length > 0) {
            for (const item of record.items) {
              const itemType = item.itemType || item.ItemType
              const equipmentId = item.equipmentId || item.EquipmentId
              
              if (equipmentId && itemType !== 3) {
                // 根据设备类型调用不同的API
                try {
                  if (itemType === 1) {
                    // 专用设备
                    const equipment = await deviceApi.getSpecialEquipment(equipmentId)
                    if (equipment) {
                      await deviceApi.updateSpecialEquipment(equipmentId, {
                        ...equipment,
                        useStatus: "未使用"
                      })
                    }
                  } else if (itemType === 2) {
                    // 通用设备
                    const equipment = await deviceApi.getGeneralEquipment(equipmentId)
                    if (equipment) {
                      await deviceApi.updateGeneralEquipment(equipmentId, {
                        ...equipment,
                        useStatus: "未使用"
                      })
                    }
                  }
                } catch (e) {
                  console.log(`释放设备使用状态失败 (ID: ${equipmentId}, Type: ${itemType}):`, e)
                }
              }
            }
          }
          
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
      // 调用 API 删除入库记录
      await axios.delete(`${API_BASE_URL}/project-inbounds/${id}`)
      // 刷新数据
      await fetchData()
      message.success('删除入库记录成功')
    } catch (error) {
      console.error('删除入库记录失败:', error)
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

    // 初始状态为未入库
    const status = '未入库'

    setSubmitting(true)
    try {
      // 构建入库数据
      const inboundData = {
        InboundNumber: currentEditInbound ? (currentEditInbound.inboundNumber || currentEditInbound.InboundNumber) : inboundNumber,
        OutboundOrderId: selectedOutboundOrder.id,
        ProjectName: selectedOutboundOrder.projectName,
        ProjectManager: selectedOutboundOrder.projectManager,
        ContactPhone: selectedOutboundOrder.contactPhone,
        ProjectTime: selectedOutboundOrder.projectTime || '',
        UsageLocation: selectedOutboundOrder.usageLocation || selectedOutboundOrder.UsageLocation || '',
        Handler: values.handler,
        Inspector: values.inspector,
        WarehouseKeeper: values.warehouseKeeper,
        InboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : '',
        Remark: values.remark || '',
        Status: status,
        Items: selectedItems
          .filter(item => item.isMarkedInbound)
          .map(item => ({
            EquipmentId: item.equipmentId || item.EquipmentId,
            EquipmentName: item.equipmentName || item.EquipmentName || item.ItemName,
            Brand: item.brand || item.Brand || '',
            Model: item.model || item.Model || '',
            Quantity: item.inboundQuantity,
            Unit: item.unit || item.Unit || '',
            Status: item.status || item.DeviceStatus || '',
            ItemType: item.itemType || item.ItemType || 1 // 1=专用设备, 2=通用设备, 3=耗材
          }))
      }

      // 判断是创建还是更新
      if (currentEditInbound) {
        // 更新现有入库记录
        const response = await axios.put(`${API_BASE_URL}/project-inbounds/${currentEditInbound.id}`, inboundData)
        message.success(`项目${status === '全部入库' ? '全部' : '部分'}入库更新成功`)
      } else {
        // 创建新入库记录
        const response = await axios.post(`${API_BASE_URL}/project-inbounds`, inboundData)
        message.success(`项目${status === '全部入库' ? '全部' : '部分'}入库成功`)
      }
      
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
        const outboundResponse = await axios.get(`${API_BASE_URL}/project-outbounds`)
        // 处理可能的value字段包装
        const outboundData = outboundResponse.data.value || outboundResponse.data
        // 筛选已确认出库的出库单
        const confirmedOutbounds = outboundData.filter(order => order.isCompleted === true)
        console.log('重新获取的出库单:', confirmedOutbounds)
        // 再次尝试查找
        outboundOrder = confirmedOutbounds.find(o => o.id === outboundOrderId)
        
        // 如果通过ID找不到，尝试通过项目名称匹配
        if (!outboundOrder && record.projectName) {
          console.log('通过ID未找到出库单，尝试通过项目名称匹配...')
          outboundOrder = confirmedOutbounds.find(o => o.projectName === record.projectName)
        }
        
        // 更新outboundHistory
        setOutboundHistory(confirmedOutbounds)
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
        
        const existingItem = record.items.find(i => {
          const iEquipId = i.equipmentId || i.EquipmentId
          
          // 只使用设备 ID 进行匹配，不使用名称作为后备方案
          // 这样可以确保只有真正已入库的设备才会被标记为已入库
          return itemEquipId && iEquipId && itemEquipId === iEquipId
        })
        console.log('物品:', itemEquipName, '现有入库项:', existingItem)
        // 检测是否为耗材类型（根据物品名称或类型）
        const isConsumable = item.itemType === 3 || item.ItemType === 3 || 
                          item.name?.includes('耗材') || item.Name?.includes('耗材') ||
                          item.equipmentName?.includes('别针') || item.EquipmentName?.includes('别针') ||
                          item.equipmentName?.includes('耗材') || item.EquipmentName?.includes('耗材')
        
        // 从设备表获取设备详细信息
        let deviceCode = item.DeviceCode || item.deviceCode
        let accessories = item.Accessories || item.accessories || item.accessory || item.Accessory || item.equipmentAccessories || item.EquipmentAccessories
        
        const equipmentId = item.equipmentId || item.EquipmentId
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
        
        return {
          ...item,
          id: `${outboundOrder.id}-${index}`, // 添加唯一ID
          inboundQuantity: existingItem ? existingItem.quantity : (isConsumable ? (item.quantity || item.Quantity || 0) : 0),
          isMarkedInbound: !!existingItem, // 如果有 existingItem 则标记为已入库
          // 标准化字段名
          deviceCode: deviceCode || '无',
          accessories: accessories || '无',
          itemType: itemType,
          isConsumable: isConsumable
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
            {text || record.deviceCode || record.DeviceCode || record.equipmentId || record.EquipmentId || ''}
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
      render: (text, record) => (
        <Select 
          defaultValue={text || record.status || record.Status || record.DeviceStatus || ''}
          style={{ width: 110, fontSize: '14px' }}
          onChange={(value) => {
            // 处理设备状态变更
            setSelectedItems(prev => {
              return prev.map(item => 
                item.id === record.id ? { ...item, status: value, DeviceStatus: value } : item
              )
            })
          }}
        >
          <Option value="正常">正常</Option>
          <Option value="损坏">损坏</Option>
          <Option value="丢失">丢失</Option>
        </Select>
      )
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
                  const updatedItems = prev.map(item => 
                    item.id === record.id ? { ...item, isMarkedInbound: false, inboundQuantity: record.isConsumable ? (item.quantity || item.Quantity || 0) : 0 } : item
                  )
                  message.info('已取消标记入库')
                  return updatedItems
                })
              } else {
                // 标记入库操作
                setSelectedItems(prev => {
                  const updatedItems = prev.map(item => 
                    item.id === record.id ? { 
                      ...item, 
                      isMarkedInbound: true,
                      inboundQuantity: record.isConsumable ? item.inboundQuantity : (item.quantity || item.Quantity || 0)
                    } : item
                  )
                  message.success('标记入库成功')
                  return updatedItems
                })
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
          <Button type="primary" onClick={() => handlePartialInbound(record)}>
            部分入库
          </Button>
          <Button type="default" onClick={() => handleFullInbound(record)}>
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
    
    // 构建预览数据
    const inboundItems = record.items || []
    
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
      items: inboundItems.map(item => ({
        type: item.itemType === 1 ? '专用设备' : item.itemType === 2 ? '通用设备' : '耗材',
        name: item.itemName || item.equipmentName || '',
        deviceId: item.deviceCode || item.equipmentId || '',
        brand: item.brand || '',
        model: item.model || '',
        quantity: item.quantity || 0,
        unit: item.unit || '',
        accessories: item.accessories || '',
        status: item.status || item.deviceStatus || '',
        remark: item.remark || item.Remark || '',
        isInbound: true
      }))
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
        .map(item => ({
          type: item.itemType === 1 ? '专用设备' : item.itemType === 2 ? '通用设备' : '耗材',
          name: item.ItemName || item.EquipmentName || item.equipmentName || '',
          deviceId: item.deviceCode || item.DeviceCode || item.equipmentId || item.EquipmentId || '',
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
        width={1200}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '80vh', overflow: 'auto' } }}
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
              icon={<EyeOutlined />}
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
              size="large"
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
        width="80%"
        zIndex={9999}
        mask={true}
        styles={{
          modal: { 
            top: 20, 
            maxWidth: 1000, 
            zIndex: 9999, 
            backgroundColor: '#fff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderRadius: '12px'
          },
          body: { 
            padding: 0,
            backgroundColor: '#f5f5f5',
            overflow: 'auto'
          },
          header: {
            backgroundColor: '#1890ff',
            borderBottom: 'none',
            padding: '16px 24px'
          },
          footer: {
            backgroundColor: '#fff',
            borderTop: '1px solid #e8e8e8',
            padding: '16px 24px'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          }
        }}
        className="preview-modal"
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)} size="large">
            关闭
          </Button>,
          <Button key="print" type="default" onClick={handlePrint} style={{ marginRight: 16 }} size="large" icon={<EyeOutlined />}>
            打印
          </Button>,
          <Button key="save" type="primary" onClick={handlePrint} size="large" icon={<CheckOutlined />}>
            保存PDF
          </Button>
        ]}
      >
        <div ref={printRef} className="preview-content" style={{ padding: '15px', maxHeight: '85vh', overflow: 'auto', backgroundColor: '#fff' }}>
          {/* 标题区域 */}
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center',
            borderBottom: '3px solid #1890ff',
            paddingBottom: '15px'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#1890ff',
              letterSpacing: '2px'
            }}>项目入库单</h1>
            <p style={{ margin: '6px 0 0 0', color: '#666', fontSize: '18px' }}>
              入库单号: <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>{previewData.inboundNumber || '待生成'}</span>
            </p>
          </div>
          
          {/* 项目信息卡片 */}
          <div style={{ 
            marginBottom: '16px', 
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#1890ff',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '4px', 
                height: '20px', 
                backgroundColor: '#1890ff',
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              项目信息
            </h3>
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#999', fontSize: '16px', marginBottom: '2px' }}>项目名称</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.projectName || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={4}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#999', fontSize: '16px', marginBottom: '2px' }}>项目时间</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.projectTime || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#999', fontSize: '16px', marginBottom: '2px' }}>使用地</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.usageLocation || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#999', fontSize: '16px', marginBottom: '2px' }}>项目负责人</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.projectManager || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={5}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#999', fontSize: '16px', marginBottom: '2px' }}>联系电话</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.contactPhone || '-'}</span>
                </div>
              </Col>
            </Row>
          </div>
          
          {/* 入库物品清单 */}
          <div style={{ 
            marginBottom: '16px', 
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#1890ff',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '4px', 
                height: '20px', 
                backgroundColor: '#1890ff',
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              入库物品清单
            </h3>
            <Table 
              columns={[
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>状态</span>,
                  dataIndex: 'isInbound',
                  key: 'isInbound',
                  width: '70px',
                  align: 'center',
                  render: (isInbound) => (
                    isInbound ? (
                      <span style={{ 
                        color: '#52c41a',
                        backgroundColor: '#f6ffed',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid #b7eb8f',
                        display: 'inline-block',
                        textAlign: 'center',
                        width: '50px'
                      }}>已入库</span>
                    ) : (
                      <span style={{ 
                        color: '#ff4d4f',
                        backgroundColor: '#fff2f0',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid #ffa39e',
                        display: 'inline-block',
                        textAlign: 'center',
                        width: '50px'
                      }}>未入库</span>
                    )
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>类型</span>,
                  dataIndex: 'type',
                  key: 'type',
                  width: '80px',
                  align: 'center',
                  render: (text) => <span style={{ fontSize: '16px' }}>{text || '-'}</span>
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>设备名称</span>,
                  dataIndex: 'name',
                  key: 'name',
                  width: '120px',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>设备编号</span>,
                  dataIndex: 'deviceId',
                  key: 'deviceId',
                  width: '100px',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>品牌</span>,
                  dataIndex: 'brand',
                  key: 'brand',
                  width: '80px',
                  align: 'center',
                  render: (text) => <span style={{ fontSize: '16px' }}>{text || '-'}</span>
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>型号</span>,
                  dataIndex: 'model',
                  key: 'model',
                  width: '90px',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                      fontSize: '16px'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>入库数量</span>,
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: '70px',
                  align: 'center',
                  render: (quantity, record) => (
                    <span style={{ 
                      fontWeight: 'bold',
                      color: quantity > 0 ? '#52c41a' : '#999',
                      fontSize: '16px'
                    }}>
                      {quantity}
                    </span>
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>单位</span>,
                  dataIndex: 'unit',
                  key: 'unit',
                  width: '60px',
                  align: 'center',
                  render: (text) => <span style={{ fontSize: '16px' }}>{text || '-'}</span>
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>配件</span>,
                  dataIndex: 'accessories',
                  key: 'accessories',
                  width: '120px',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                      fontSize: '14px'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>设备状态</span>,
                  dataIndex: 'status',
                  key: 'status',
                  width: '100px',
                  align: 'center',
                  render: (text) => <span style={{ fontSize: '16px' }}>{text || '-'}</span>
                },
                {
                  title: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>备注</span>,
                  dataIndex: 'remark',
                  key: 'remark',
                  width: '100px',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4',
                      fontSize: '14px'
                    }}>
                      {text || '-'}
                    </div>
                  )
                }
              ]} 
              dataSource={previewData.items || []} 
              rowKey={(record) => record.deviceId || record.id || Math.random()}
              pagination={false}
              size="middle"
              bordered
              style={{ width: '100%' }}
              scroll={{ x: 1400 }}
              rowClassName={(record) => record.isInbound ? 'preview-marked-row' : ''}
            />
          </div>
          
          {/* 备注 */}
          <div style={{ 
            marginBottom: '16px', 
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{ 
              margin: '0 0 10px 0', 
              color: '#1890ff',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '4px', 
                height: '20px', 
                backgroundColor: '#1890ff',
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              备注
            </h3>
            <div style={{ 
              whiteSpace: 'pre-line', 
              backgroundColor: '#fff', 
              padding: '12px', 
              borderRadius: '6px',
              minHeight: '40px',
              border: '1px solid #e8e8e8',
              color: '#333',
              lineHeight: '1.5',
              fontSize: '16px'
            }}>
              {previewData.remark || '无'}
            </div>
          </div>
          
          {/* 签收信息 */}
          <div style={{ 
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            padding: '15px',
            border: '1px solid #e8e8e8'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#1890ff',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '4px', 
                height: '20px', 
                backgroundColor: '#1890ff',
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              签收信息
            </h3>
            <Row gutter={[16, 12]}>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  backgroundColor: '#fff',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  <span style={{ color: '#999', fontSize: '16px', display: 'block', marginBottom: '2px' }}>经办人</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.handler || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  backgroundColor: '#fff',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  <span style={{ color: '#999', fontSize: '16px', display: 'block', marginBottom: '2px' }}>检测人</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.inspector || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  backgroundColor: '#fff',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  <span style={{ color: '#999', fontSize: '16px', display: 'block', marginBottom: '2px' }}>库管</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.warehouseKeeper || '-'}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div style={{ 
                  backgroundColor: '#fff',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e8e8e8'
                }}>
                  <span style={{ color: '#999', fontSize: '16px', display: 'block', marginBottom: '2px' }}>入库时间</span>
                  <span style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>{previewData.inboundDate || '-'}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProjectInbound