import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Card, Row, Col, Input, Select, DatePicker, Descriptions, Tag, Tabs, Badge, Modal, Form, InputNumber, message, Switch } from 'antd'
const { TextArea } = Input
import { SearchOutlined, FilterOutlined, EyeOutlined, ReloadOutlined, DownloadOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { deviceApi } from '../services/api'
import * as XLSX from 'xlsx'

const { Option } = Select
const { RangePicker } = DatePicker
const { Search } = Input

const InventoryManagement = () => {
  // 获取当前用户角色
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  
  const currentUser = getCurrentUser()
  const userRole = currentUser?.role || ''
  
  // 检查用户是否有权限访问特定功能
  const hasPermission = (requiredRoles) => {
    return requiredRoles.includes(userRole)
  }
  
  // 普通用户只允许查看，其他角色允许所有操作
  const canPerformActions = hasPermission(['系统管理员', '仓库管理员', '项目负责人', '财务人员'])
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
  const [alertModalVisible, setAlertModalVisible] = useState(false)
  const [alertItems, setAlertItems] = useState([])
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportType, setReportType] = useState('turnover')
  const [alertThreshold, setAlertThreshold] = useState(20) // 预警阈值默认20%
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(false) // 自动预警开关
  const [adjustHistory, setAdjustHistory] = useState([]) // 库存调整历史记录
  const [historyModalVisible, setHistoryModalVisible] = useState(false) // 历史记录模态框

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
        // 获取耗材数据
        const consumables = await deviceApi.getConsumables()
        // 获取原材料数据
        const rawMaterials = await deviceApi.getRawMaterials()
        
        // 转换设备数据为库存数据格式
        const inventoryData = []
        
        // 处理专用设备
        specialEquipments.forEach((equipment, index) => {
          // UseStatus: 0=未使用, 1=使用中
          const usedQuantity = equipment.useStatus === 1 || equipment.useStatus === '使用中' ? equipment.quantity : 0
          inventoryData.push({
            id: index + 1,
            originalId: equipment.id,
            category: '专用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: usedQuantity,
            remainingQuantity: equipment.quantity - usedQuantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
        
        // 处理通用设备
        generalEquipments.forEach((equipment, index) => {
          // UseStatus: 0=未使用, 1=使用中
          const usedQuantity = equipment.useStatus === 1 || equipment.useStatus === '使用中' ? equipment.quantity : 0
          inventoryData.push({
            id: specialEquipments.length + index + 1,
            originalId: equipment.id,
            category: '通用设备',
            name: equipment.name,
            brand: equipment.brand || '',
            model: equipment.model || '',
            totalQuantity: equipment.quantity,
            usedQuantity: usedQuantity,
            remainingQuantity: equipment.quantity - usedQuantity,
            unit: equipment.unit || '台',
            warehouse: equipment.warehouse || '主仓库',
            location: equipment.location || '',
            status: equipment.status || '正常',
            lastUpdated: equipment.purchaseDate || new Date().toISOString().split('T')[0]
          })
        })
        
        // 处理耗材
        consumables.forEach((consumable, index) => {
          inventoryData.push({
            id: specialEquipments.length + generalEquipments.length + index + 1,
            originalId: consumable.id,
            category: '耗材',
            name: consumable.name,
            brand: consumable.brand || '',
            model: consumable.modelSpecification || '',
            totalQuantity: consumable.totalQuantity,
            usedQuantity: consumable.usedQuantity,
            remainingQuantity: consumable.remainingQuantity,
            unit: consumable.unit || '个',
            warehouse: '主仓库',
            location: consumable.location || '',
            status: consumable.status || '正常',
            lastUpdated: consumable.updatedAt ? new Date(consumable.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          })
        })
        
        // 处理原材料
        rawMaterials.forEach((rawMaterial, index) => {
          inventoryData.push({
            id: specialEquipments.length + generalEquipments.length + consumables.length + index + 1,
            originalId: rawMaterial.id,
            category: '原材料',
            name: rawMaterial.productName,
            brand: rawMaterial.brand || '',
            model: rawMaterial.specification || '',
            totalQuantity: rawMaterial.totalQuantity,
            usedQuantity: rawMaterial.usedQuantity,
            remainingQuantity: rawMaterial.remainingQuantity,
            unit: rawMaterial.unit || 'kg',
            warehouse: '原材料仓库',
            location: rawMaterial.location || '',
            status: '正常',
            lastUpdated: rawMaterial.updatedAt ? new Date(rawMaterial.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          })
        })
        
        // 使用API返回的数据（包括空数组）
        setInventory(inventoryData)
      } catch (error) {
        console.error('获取库存数据失败:', error)
        // API调用失败时，使用模拟数据
        setInventory(mockInventory)
        message.warning('无法连接到服务器，显示演示数据')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInventory()
  }, [])

  // 计算汇总数据
  useEffect(() => {
    let filteredItems = [...inventory]
    
    // 应用筛选条件
    if (searchText) {
      const text = searchText.toLowerCase()
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(text) ||
        item.brand.toLowerCase().includes(text) ||
        item.model.toLowerCase().includes(text)
      )
    }
    
    if (categoryFilter) {
      filteredItems = filteredItems.filter(item => item.category === categoryFilter)
    }
    
    if (statusFilter) {
      filteredItems = filteredItems.filter(item => item.status === statusFilter)
    }

    const summary = []
    const grouped = {}

    // 按类别分组
    filteredItems.forEach(item => {
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
  }, [inventory, searchText, categoryFilter, statusFilter])

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
    adjustForm.setFieldsValue({
      quantity: 0,
      reason: ''
    })
    setAdjustType('increase')
    setAdjustModalVisible(true)
  }

  // 处理库存调整
  const handleAdjustSubmit = async (values) => {
    const { quantity, reason } = values
    if (!quantity) {
      message.error('请输入调整数量')
      return
    }

    setLoading(true)
    try {
      // 找到当前要调整的物品
      const itemToAdjust = inventory.find(item => 
        item.name === currentItem.name && 
        item.brand === currentItem.brand && 
        item.model === currentItem.model && 
        item.category === currentItem.category
      )

      if (!itemToAdjust || !itemToAdjust.originalId) {
        message.error('找不到要调整的物品')
        setLoading(false)
        return
      }

      const newQuantity = adjustType === 'increase' 
        ? itemToAdjust.totalQuantity + quantity 
        : itemToAdjust.totalQuantity - quantity
      
      if (newQuantity < 0) {
        message.error('调整后库存不能为负数')
        setLoading(false)
        return
      }

      // 计算新的剩余数量，确保不小于0
      const newRemaining = adjustType === 'increase' 
        ? itemToAdjust.remainingQuantity + quantity 
        : itemToAdjust.remainingQuantity - quantity

      // 确保剩余数量不小于0，且不大于总数量
      const finalRemaining = Math.max(0, Math.min(newRemaining, newQuantity))
      // 计算新的已使用数量
      const newUsedQuantity = newQuantity - finalRemaining

      // 调用后端API保存调整
      let success = false
      
      switch (itemToAdjust.category) {
        case '专用设备':
          // 调用专用设备更新API
          const specialEquipmentData = {
            ...itemToAdjust,
            quantity: newQuantity,
            name: itemToAdjust.name,
            brand: itemToAdjust.brand,
            model: itemToAdjust.model,
            unit: itemToAdjust.unit,
            warehouse: itemToAdjust.warehouse,
            location: itemToAdjust.location,
            status: itemToAdjust.status
          }
          await deviceApi.updateSpecialEquipment(itemToAdjust.originalId, specialEquipmentData)
          success = true
          break
          
        case '通用设备':
          // 调用通用设备更新API
          const generalEquipmentData = {
            ...itemToAdjust,
            quantity: newQuantity,
            name: itemToAdjust.name,
            brand: itemToAdjust.brand,
            model: itemToAdjust.model,
            unit: itemToAdjust.unit,
            warehouse: itemToAdjust.warehouse,
            location: itemToAdjust.location,
            status: itemToAdjust.status
          }
          await deviceApi.updateGeneralEquipment(itemToAdjust.originalId, generalEquipmentData)
          success = true
          break
          
        case '耗材':
          // 调用耗材更新API
          const consumableData = {
            ...itemToAdjust,
            totalQuantity: newQuantity,
            usedQuantity: newUsedQuantity,
            remainingQuantity: finalRemaining,
            name: itemToAdjust.name,
            brand: itemToAdjust.brand,
            modelSpecification: itemToAdjust.model,
            unit: itemToAdjust.unit,
            location: itemToAdjust.location
          }
          await deviceApi.updateConsumable(itemToAdjust.originalId, consumableData)
          success = true
          break
          
        case '原材料':
          // 调用原材料更新API
          const rawMaterialData = {
            ...itemToAdjust,
            totalQuantity: newQuantity,
            usedQuantity: newUsedQuantity,
            remainingQuantity: finalRemaining,
            productName: itemToAdjust.name,
            brand: itemToAdjust.brand,
            specification: itemToAdjust.model,
            unit: itemToAdjust.unit,
            location: itemToAdjust.location
          }
          await deviceApi.updateRawMaterial(itemToAdjust.originalId, rawMaterialData)
          success = true
          break
      }

      if (success) {
        // 记录库存调整历史
        const historyRecord = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          category: itemToAdjust.category,
          name: itemToAdjust.name,
          brand: itemToAdjust.brand,
          model: itemToAdjust.model,
          adjustType: adjustType === 'increase' ? '增加' : '减少',
          quantity: quantity,
          reason: reason,
          oldTotalQuantity: itemToAdjust.totalQuantity,
          newTotalQuantity: newQuantity,
          oldUsedQuantity: itemToAdjust.usedQuantity,
          newUsedQuantity: newUsedQuantity,
          oldRemainingQuantity: itemToAdjust.remainingQuantity,
          newRemainingQuantity: finalRemaining,
          operator: currentUser?.username || '未知用户'
        }

        // 更新历史记录
        setAdjustHistory(prev => [historyRecord, ...prev])

        // 更新前端库存数据
        const updatedInventory = inventory.map(item => {
          if (item.name === currentItem.name && 
              item.brand === currentItem.brand && 
              item.model === currentItem.model && 
              item.category === currentItem.category) {
            return {
              ...item,
              totalQuantity: newQuantity,
              usedQuantity: newUsedQuantity,
              remainingQuantity: finalRemaining,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          }
          return item
        })

        setInventory(updatedInventory)
        setAdjustModalVisible(false)
        message.success('库存调整成功')
      }
    } catch (error) {
      console.error('库存调整失败:', error)
      message.error('库存调整失败，请重试')
    } finally {
      setLoading(false)
    }
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
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          {canPerformActions && (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleAdjustInventory(record)}
            >
              调整库存
            </Button>
          )}
        </Space>
      )
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
    }
  ]

  // 计算库存统计
  const inventoryStats = {
    totalItems: inventory.length,
    totalQuantity: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
    usedQuantity: inventory.reduce((sum, item) => sum + item.usedQuantity, 0),
    remainingQuantity: inventory.reduce((sum, item) => sum + item.remainingQuantity, 0),
    lowStock: inventory.filter(item => item.totalQuantity > 0 && (item.remainingQuantity / item.totalQuantity) < (alertThreshold / 100)).length,
    outOfStock: inventory.filter(item => item.remainingQuantity === 0).length
  }

  // 检查库存预警
  const checkInventoryAlerts = () => {
    const threshold = alertThreshold / 100
    const lowStockItems = inventory.filter(item => item.totalQuantity > 0 && (item.remainingQuantity / item.totalQuantity) < threshold)
    const outOfStockItems = inventory.filter(item => item.remainingQuantity === 0)
    const alertItemsList = [...lowStockItems, ...outOfStockItems]
    setAlertItems(alertItemsList)
    setAlertModalVisible(alertItemsList.length > 0)
  }

  // 自动检查库存预警
  useEffect(() => {
    if (autoAlertEnabled) {
      const checkInterval = setInterval(() => {
        checkInventoryAlerts()
      }, 3600000) // 每小时检查一次
      
      return () => clearInterval(checkInterval)
    }
  }, [autoAlertEnabled, inventory, alertThreshold])

  // 生成库存报表数据
  const generateReport = (type) => {
    switch (type) {
      case 'turnover':
        // 库存周转率报表
        return inventory.map(item => ({
          name: item.name,
          brand: item.brand,
          model: item.model,
          category: item.category,
          totalQuantity: item.totalQuantity,
          usedQuantity: item.usedQuantity,
          turnoverRate: item.totalQuantity > 0 ? (item.usedQuantity / item.totalQuantity * 100).toFixed(2) : '0.00'
        }))
      case 'value':
        // 库存价值报表
        return inventory.map(item => ({
          name: item.name,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: item.totalQuantity,
          estimatedValue: (item.totalQuantity * 100).toFixed(2) // 模拟价值
        }))
      case 'abc':
        // ABC分析报表
        return inventory.map(item => ({
          name: item.name,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: item.totalQuantity,
          value: item.totalQuantity * 100, // 模拟价值
          abcClass: item.totalQuantity > 50 ? 'A' : item.totalQuantity > 20 ? 'B' : 'C'
        }))
      default:
        return []
    }
  }

  // 导出库存数据为Excel
  const handleExport = () => {
    try {
      // 准备导出数据
      const exportData = summaryData.map(item => ({
        '类别': item.category,
        '名称': item.name,
        '品牌': item.brand,
        '型号': item.model,
        '总数': item.totalQuantity,
        '已使用': item.usedQuantity,
        '剩余': item.remainingQuantity,
        '单位': item.unit
      }))

      // 创建工作簿和工作表
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '库存汇总')

      // 生成文件名
      const fileName = `库存报表_${new Date().toISOString().split('T')[0]}.xlsx`

      // 导出文件
      XLSX.writeFile(wb, fileName)
      message.success('库存报表导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请重试')
    }
  }

  // 导出库存报表数据为Excel
  const handleExportReport = () => {
    try {
      // 准备导出数据
      const reportData = generateReport(reportType)
      
      // 创建工作簿和工作表
      const ws = XLSX.utils.json_to_sheet(reportData)
      const wb = XLSX.utils.book_new()
      
      // 根据报表类型设置工作表名称
      let sheetName = '库存报表'
      switch (reportType) {
        case 'turnover':
          sheetName = '库存周转率'
          break
        case 'value':
          sheetName = '库存价值'
          break
        case 'abc':
          sheetName = 'ABC分析'
          break
      }
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // 生成文件名
      const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`

      // 导出文件
      XLSX.writeFile(wb, fileName)
      message.success('库存报表导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败，请重试')
    }
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
              // 获取耗材数据
              const consumables = await deviceApi.getConsumables()
              // 获取原材料数据
              const rawMaterials = await deviceApi.getRawMaterials()
              
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
              
              // 处理耗材
              consumables.forEach((consumable, index) => {
                inventoryData.push({
                  id: specialEquipments.length + generalEquipments.length + index + 1,
                  category: '耗材',
                  name: consumable.name,
                  brand: consumable.brand || '',
                  model: consumable.modelSpecification || '',
                  totalQuantity: consumable.totalQuantity,
                  usedQuantity: consumable.usedQuantity,
                  remainingQuantity: consumable.remainingQuantity,
                  unit: consumable.unit || '个',
                  warehouse: '主仓库',
                  location: consumable.location || '',
                  status: consumable.status || '正常',
                  lastUpdated: consumable.updatedAt ? new Date(consumable.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })
              })
              
              // 处理原材料
              rawMaterials.forEach((rawMaterial, index) => {
                inventoryData.push({
                  id: specialEquipments.length + generalEquipments.length + consumables.length + index + 1,
                  category: '原材料',
                  name: rawMaterial.productName,
                  brand: rawMaterial.brand || '',
                  model: rawMaterial.specification || '',
                  totalQuantity: rawMaterial.totalQuantity,
                  usedQuantity: rawMaterial.usedQuantity,
                  remainingQuantity: rawMaterial.remainingQuantity,
                  unit: rawMaterial.unit || 'kg',
                  warehouse: '原材料仓库',
                  location: rawMaterial.location || '',
                  status: '正常',
                  lastUpdated: rawMaterial.updatedAt ? new Date(rawMaterial.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })
              })
              
              // 如果API返回的数据为空，则清空库存显示
              if (inventoryData.length === 0) {
                setInventory([])
                message.info('仓库中暂无数据')
              } else {
                setInventory(inventoryData)
                message.success('库存数据刷新成功')
              }
            } catch (error) {
              console.error('获取库存数据失败:', error)
              message.error('获取库存数据失败')
            } finally {
              setLoading(false)
            }
          }}>
            刷新
          </Button>
          {canPerformActions && (
            <>
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button type="primary" onClick={checkInventoryAlerts}>
                库存预警
              </Button>
              <Button type="primary" onClick={() => setReportModalVisible(true)}>
                库存报表
              </Button>
              <Button type="primary" onClick={() => setHistoryModalVisible(true)}>
                调整历史
              </Button>
            </>
          )}
        </Space>
      </div>
      
      {/* 库存统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16, flexWrap: 'nowrap', overflowX: 'auto' }}>
        <Col span={4}>
          <Card>
            <div className="stat-card">
              <h3>库存项目数</h3>
              <p className="stat-number">{inventoryStats.totalItems}</p>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>总数量</h3>
              <p className="stat-number">{inventoryStats.totalQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>已使用</h3>
              <p className="stat-number">{inventoryStats.usedQuantity}</p>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>库存不足</h3>
              <p className="stat-number">{inventoryStats.lowStock}</p>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>缺货项目</h3>
              <p className="stat-number">{inventoryStats.outOfStock}</p>
            </div>
          </Card>
        </Col>
        <Col span={4}>
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
        
        {/* 预警设置 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Space>
              <span>库存预警阈值: {alertThreshold}%</span>
              <InputNumber 
                min={5} 
                max={50} 
                step={5} 
                value={alertThreshold} 
                onChange={setAlertThreshold}
                style={{ width: 100 }}
              />
            </Space>
          </Col>
          <Col span={12}>
            <Space style={{ float: 'right' }}>
              <span>自动预警</span>
              <Switch 
                checked={autoAlertEnabled} 
                onChange={setAutoAlertEnabled}
              />
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* 标签页切换汇总视图和详细视图 */}
      <Tabs 
        defaultActiveKey="summary"
        items={[
          {
            key: 'summary',
            label: '汇总视图',
            children: (
              <Table 
                columns={summaryColumns} 
                dataSource={summaryData} 
                loading={loading}
                rowKey={(record) => `${record.name}-${record.brand}-${record.model}`}
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
            )
          },
          ...(canPerformActions ? [{
            key: 'detail',
            label: '详细视图',
            children: (
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
            )
          }] : [])
        ]}
      />


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

      {/* 库存预警模态框 */}
      <Modal
        title="库存预警"
        open={alertModalVisible}
        onCancel={() => setAlertModalVisible(false)}
        width={800}
      >
        <div>
          <h3 style={{ marginBottom: 16 }}>库存不足项目</h3>
          <Table 
            columns={[
              {
                title: '类别',
                dataIndex: 'category',
                key: 'category',
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
                title: '总数',
                dataIndex: 'totalQuantity',
                key: 'totalQuantity'
              },
              {
                title: '剩余',
                dataIndex: 'remainingQuantity',
                key: 'remainingQuantity',
                render: (remaining, record) => {
                  const percentage = (remaining / record.totalQuantity) * 100
                  let color = ''
                  if (percentage === 0) {
                    color = 'red'
                  } else if (percentage < 20) {
                    color = 'orange'
                  }
                  return <span style={{ color, fontWeight: 'bold' }}>{remaining}</span>
                }
              },
              {
                title: '单位',
                dataIndex: 'unit',
                key: 'unit'
              }
            ]} 
            dataSource={alertItems} 
            rowKey="id"
            pagination={false}
          />
        </div>
      </Modal>

      {/* 库存报表模态框 */}
      <Modal
        title="库存报表"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        width={1000}
        footer={[
          ...(canPerformActions ? [
            <Button 
              key="export" 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => handleExportReport()}
            >
              导出
            </Button>
          ] : []),
          <Button key="close" onClick={() => setReportModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 200, marginBottom: 16 }}
          >
            <Option value="turnover">库存周转率</Option>
            <Option value="value">库存价值</Option>
            <Option value="abc">ABC分析</Option>
          </Select>

          {reportType === 'turnover' && (
            <Table 
              columns={[
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '类别', dataIndex: 'category', key: 'category' },
                { title: '总数量', dataIndex: 'totalQuantity', key: 'totalQuantity' },
                { title: '已使用', dataIndex: 'usedQuantity', key: 'usedQuantity' },
                { title: '周转率(%)', dataIndex: 'turnoverRate', key: 'turnoverRate' }
              ]} 
              dataSource={generateReport('turnover')} 
              rowKey={(record) => `${record.name}-${record.brand}-${record.model}`}
            />
          )}

          {reportType === 'value' && (
            <Table 
              columns={[
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '类别', dataIndex: 'category', key: 'category' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '估计价值(元)', dataIndex: 'estimatedValue', key: 'estimatedValue' }
              ]} 
              dataSource={generateReport('value')} 
              rowKey={(record) => `${record.name}-${record.brand}-${record.model}`}
            />
          )}

          {reportType === 'abc' && (
            <Table 
              columns={[
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '类别', dataIndex: 'category', key: 'category' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '价值(元)', dataIndex: 'value', key: 'value' },
                { 
                  title: 'ABC分类', 
                  dataIndex: 'abcClass', 
                  key: 'abcClass',
                  render: (abcClass) => {
                    let color = ''
                    switch (abcClass) {
                      case 'A':
                        color = 'red'
                        break
                      case 'B':
                        color = 'orange'
                        break
                      case 'C':
                        color = 'green'
                        break
                      default:
                        color = 'gray'
                    }
                    return <Tag color={color}>{abcClass}</Tag>
                  }
                }
              ]} 
              dataSource={generateReport('abc')} 
              rowKey={(record) => `${record.name}-${record.brand}-${record.model}`}
            />
          )}
        </div>
      </Modal>

      {/* 库存调整历史记录模态框 */}
      <Modal
        title="库存调整历史记录"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Table 
          columns={[
            { 
              title: '时间', 
              dataIndex: 'timestamp', 
              key: 'timestamp',
              render: (timestamp) => new Date(timestamp).toLocaleString()
            },
            { title: '类别', dataIndex: 'category', key: 'category' },
            { title: '名称', dataIndex: 'name', key: 'name' },
            { title: '品牌', dataIndex: 'brand', key: 'brand' },
            { title: '型号', dataIndex: 'model', key: 'model' },
            { 
              title: '调整类型', 
              dataIndex: 'adjustType', 
              key: 'adjustType',
              render: (adjustType) => <Tag color={adjustType === '增加' ? 'green' : 'red'}>{adjustType}</Tag>
            },
            { title: '调整数量', dataIndex: 'quantity', key: 'quantity' },
            { title: '调整原因', dataIndex: 'reason', key: 'reason' },
            { title: '操作人', dataIndex: 'operator', key: 'operator' },
            { 
              title: '库存变化', 
              key: 'change',
              render: (_, record) => (
                <div>
                  <p>总数量: {record.oldTotalQuantity} → {record.newTotalQuantity}</p>
                  <p>已使用: {record.oldUsedQuantity} → {record.newUsedQuantity}</p>
                  <p>剩余: {record.oldRemainingQuantity} → {record.newRemainingQuantity}</p>
                </div>
              )
            }
          ]} 
          dataSource={adjustHistory} 
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Modal>
    </div>
  )
}

export default InventoryManagement