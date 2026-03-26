import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, DatePicker, Card, Row, Col, Descriptions, Tag, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons'
import DeviceForm from './DeviceForm'
import FileUpload from './FileUpload'
import { deviceApi } from '../services/api'

const { Option } = Select
const { RangePicker } = DatePicker
const { Search } = Input

const DeviceList = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [filteredDevices, setFilteredDevices] = useState([])
  const [searchParams, setSearchParams] = useState({})

  // 模拟数据
  const mockDevices = [
    {
      id: 1,
      name: '服务器',
      deviceCode: 'DEV-2024-001',
      serialNumber: 'SN123456',
      brand: 'Dell',
      model: 'PowerEdge R740',
      quantity: 1,
      unit: '台',
      accessories: '键盘、鼠标、显示器',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=server%20equipment%20in%20data%20center&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '正常',
      useStatus: '使用中',
      location: '机房A',
      description: '高性能服务器',
      purchaseDate: '2024-01-01',
      purchasePrice: 15000
    },
    {
      id: 2,
      name: '交换机',
      deviceCode: 'DEV-2024-002',
      serialNumber: 'SN789012',
      brand: 'Cisco',
      model: 'Catalyst 9300',
      quantity: 1,
      unit: '台',
      accessories: '电源线、配置线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=network%20switch%20equipment&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '正常',
      useStatus: '使用中',
      location: '机房B',
      description: '企业级交换机',
      purchaseDate: '2024-02-01',
      purchasePrice: 8000
    },
    {
      id: 3,
      name: '路由器',
      deviceCode: 'DEV-2024-003',
      serialNumber: 'SN345678',
      brand: 'Huawei',
      model: 'AR6120',
      quantity: 1,
      unit: '台',
      accessories: '天线、电源线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=network%20router%20equipment&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '待维修',
      useStatus: '停用',
      location: '机房A',
      description: '企业级路由器',
      purchaseDate: '2024-03-01',
      purchasePrice: 5000
    },
    {
      id: 4,
      name: '防火墙',
      deviceCode: 'DEV-2024-004',
      serialNumber: 'SN987654',
      brand: 'Juniper',
      model: 'SRX300',
      quantity: 1,
      unit: '台',
      accessories: '电源线、配置线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=network%20firewall%20equipment&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '正常',
      useStatus: '使用中',
      location: '机房A',
      description: '企业级防火墙',
      purchaseDate: '2024-04-01',
      purchasePrice: 12000
    },
    {
      id: 5,
      name: 'UPS电源',
      deviceCode: 'DEV-2024-005',
      serialNumber: 'SN654321',
      brand: 'APC',
      model: 'SMT1500',
      quantity: 1,
      unit: '台',
      accessories: '电池、电源线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=UPS%20power%20supply%20equipment&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '正常',
      useStatus: '使用中',
      location: '机房B',
      description: '不间断电源',
      purchaseDate: '2024-05-01',
      purchasePrice: 3000
    },
    {
      id: 6,
      name: '存储设备',
      deviceCode: 'DEV-2024-006',
      serialNumber: 'SN321654',
      brand: 'NetApp',
      model: 'FAS2720',
      quantity: 1,
      unit: '台',
      accessories: '硬盘、数据线',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=network%20storage%20equipment&image_size=square',
      warehouse: '主仓库',
      company: '科技有限公司',
      status: '待维修',
      useStatus: '停用',
      location: '机房A',
      description: '网络存储设备',
      purchaseDate: '2024-06-01',
      purchasePrice: 25000
    }
  ]

  useEffect(() => {
    // 从API获取数据
    const fetchDevices = async () => {
      setLoading(true)
      try {
        console.log('开始获取设备列表...')
        const data = await deviceApi.getSpecialEquipments()
        console.log('获取到设备数据:', data)
        // 转换API返回的数据格式以匹配前端期望的格式
        const formattedDevices = data.map(item => ({
          id: item.id || item.Id,
          name: item.name || item.Name,
          deviceCode: item.deviceCode || item.DeviceCode,
          serialNumber: item.serialNumber || item.SerialNumber || '',
          brand: item.brand || item.Brand || '',
          model: item.model || item.Model || '',
          quantity: item.quantity || item.Quantity || 1,
          unit: item.unit || item.Unit || '台',
          accessories: item.accessories || item.Accessories || '',
          image: item.imageUrl || item.ImageUrl || item.image || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.name || item.Name)}%20equipment&image_size=square`,
          warehouse: item.warehouse || item.Warehouse || '主仓库',
          company: item.company || item.Company || '',
          status: item.status || item.Status || '正常',
          useStatus: item.useStatus || item.UseStatus || '未使用',
          location: item.location || item.Location || '',
          description: item.description || item.Description || '',
          purchaseDate: item.purchaseDate || item.PurchaseDate || new Date().toISOString().split('T')[0],
          purchasePrice: item.purchasePrice || item.PurchasePrice || 0
        }))
        console.log('格式化后的设备数据:', formattedDevices)
        setDevices(formattedDevices)
        // 直接设置filteredDevices，确保数据立即显示
        setFilteredDevices(formattedDevices)
      } catch (error) {
        console.error('获取设备列表失败:', error)
        message.error('获取设备列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    console.log('开始搜索...')
    let result = [...devices]
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(device => 
        device.name.toLowerCase().includes(text) ||
        device.brand.toLowerCase().includes(text) ||
        device.model.toLowerCase().includes(text) ||
        device.serialNumber.toLowerCase().includes(text) ||
        device.warehouse.toLowerCase().includes(text)
      )
    }
    
    // 状态过滤
    if (statusFilter) {
      result = result.filter(device => device.status === statusFilter)
    }
    
    // 位置过滤 - 同时考虑location和warehouse字段
    if (locationFilter) {
      result = result.filter(device => 
        device.location === locationFilter || 
        device.warehouse === locationFilter
      )
    }
    
    console.log('过滤后的设备数据:', result)
    setFilteredDevices(result)
    setSearchParams({ searchText, statusFilter, locationFilter })
  }

  // 当设备数据变化时，保持当前的过滤状态
  useEffect(() => {
    // 初始加载时设置filteredDevices
    if (filteredDevices.length === 0) {
      setFilteredDevices(devices)
    } else {
      // 设备更新时，保持当前的过滤状态
      // 这里可以添加逻辑来更新filteredDevices中的对应设备
      setFilteredDevices(prev => prev.map(device => {
        const updatedDevice = devices.find(d => d.id === device.id)
        return updatedDevice || device
      }))
    }
  }, [devices])

  const handleAdd = () => {
    setEditingDevice(null)
    setShowForm(true)
  }

  const handleEdit = (device) => {
    setEditingDevice(device)
    setShowForm(true)
  }

  const handleDetail = (device) => {
    setSelectedDevice(device)
    setShowDetail(true)
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await deviceApi.deleteSpecialEquipment(id)
      setDevices(devices.filter(device => device.id !== id))
      message.success('设备删除成功')
    } catch (error) {
      console.error('删除设备失败:', error)
      message.error('删除设备失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (device) => {
    setLoading(true)
    try {
      if (device.id) {
        // 编辑现有设备
        const updatedDevice = await deviceApi.updateSpecialEquipment(device.id, {
          Name: device.name || '',
          DeviceCode: device.deviceCode || '',
          SerialNumber: device.serialNumber || '',
          Brand: device.brand || '',
          Model: device.model || '',
          Quantity: device.quantity || 1,
          Unit: device.unit || '台',
          Accessories: device.accessories || '',
          ImageUrl: device.imageUrl || '',
          Company: device.company || '',
          Status: device.status || '正常',
          UseStatus: device.useStatus || '未使用',
          Location: device.location || '',
          Description: device.description || '',
          PurchaseDate: device.purchaseDate || '',
          PurchasePrice: device.purchasePrice || 0
        })
        // 转换返回的数据格式以匹配前端期望的格式
        const formattedUpdatedDevice = {
          id: updatedDevice.id || updatedDevice.Id,
          name: updatedDevice.name || updatedDevice.Name,
          deviceCode: updatedDevice.deviceCode || updatedDevice.DeviceCode,
          serialNumber: updatedDevice.serialNumber || updatedDevice.SerialNumber || '',
          brand: updatedDevice.brand || updatedDevice.Brand || '',
          model: updatedDevice.model || updatedDevice.Model || '',
          quantity: updatedDevice.quantity || updatedDevice.Quantity || 1,
          unit: updatedDevice.unit || updatedDevice.Unit || '台',
          accessories: updatedDevice.accessories || updatedDevice.Accessories || '',
          image: updatedDevice.imageUrl || updatedDevice.ImageUrl || device.imageUrl || device.image,
          warehouse: updatedDevice.warehouse || updatedDevice.Warehouse || '主仓库',
          company: updatedDevice.company || updatedDevice.Company || '',
          status: updatedDevice.status || updatedDevice.Status || '正常',
          useStatus: updatedDevice.useStatus || updatedDevice.UseStatus || '未使用',
          location: updatedDevice.location || updatedDevice.Location || '',
          description: updatedDevice.description || updatedDevice.Description || '',
          purchaseDate: updatedDevice.purchaseDate || updatedDevice.PurchaseDate || new Date().toISOString().split('T')[0],
          purchasePrice: updatedDevice.purchasePrice || updatedDevice.PurchasePrice || 0
        }
        setDevices(devices.map(d => d.id === device.id ? formattedUpdatedDevice : d))
        message.success('设备更新成功')
      } else {
        // 添加新设备
        const deviceData = {
          Name: device.name || '',
          DeviceCode: device.deviceCode || '',
          SerialNumber: device.serialNumber || '',
          Brand: device.brand || '',
          Model: device.model || '',
          Quantity: device.quantity || 1,
          Unit: device.unit || '台',
          Accessories: device.accessories || '',
          ImageUrl: device.imageUrl || '',
          Warehouse: device.warehouse || '主仓库',
          Company: device.company || '',
          Status: device.status || '正常',
          UseStatus: device.useStatus || '未使用',
          Location: device.location || '',
          Description: device.description || '',
          PurchaseDate: device.purchaseDate || '',
          PurchasePrice: device.purchasePrice || 0
        };
        console.log('发送到后端的数据:', deviceData);
        console.log('设备数据类型:', typeof device);
        console.log('设备名称类型:', typeof device.name);
        console.log('设备编号类型:', typeof device.deviceCode);
        const newDevice = await deviceApi.createSpecialEquipment(deviceData)
        // 转换返回的数据格式以匹配前端期望的格式
        const formattedDevice = {
          id: newDevice.id || newDevice.Id,
          name: newDevice.name || newDevice.Name,
          deviceCode: newDevice.deviceCode || newDevice.DeviceCode,
          serialNumber: newDevice.serialNumber || newDevice.SerialNumber || '',
          brand: newDevice.brand || newDevice.Brand || '',
          model: newDevice.model || newDevice.Model || '',
          quantity: newDevice.quantity || newDevice.Quantity || 1,
          unit: newDevice.unit || newDevice.Unit || '台',
          accessories: newDevice.accessories || newDevice.Accessories || '',
          image: newDevice.imageUrl || newDevice.ImageUrl || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(newDevice.name || newDevice.Name)}%20equipment&image_size=square`,
          warehouse: newDevice.warehouse || newDevice.Warehouse || '主仓库',
          company: newDevice.company || newDevice.Company || '',
          status: newDevice.status || newDevice.Status || '正常',
          useStatus: newDevice.useStatus || newDevice.UseStatus || '未使用',
          location: newDevice.location || newDevice.Location || '',
          description: newDevice.description || newDevice.Description || '',
          purchaseDate: newDevice.purchaseDate || newDevice.PurchaseDate || new Date().toISOString().split('T')[0],
          purchasePrice: newDevice.purchasePrice || newDevice.PurchasePrice || 0
        }
        setDevices([...devices, formattedDevice])
        message.success('设备添加成功')
      }
    } catch (error) {
      console.error('保存设备失败:', error)
      if (error.message.includes('重复键') || error.message.includes('duplicate')) {
        message.error('设备编号已存在，请输入新的设备编号')
      } else {
        message.error('保存设备失败')
      }
    } finally {
      setLoading(false)
      setShowForm(false)
    }
  }

  const handleImport = async (data) => {
    setLoading(true)
    try {
      console.log('开始导入数据:', data)
      const importedDevices = []
      for (const item of data) {
        // 尝试不同的列名
        const name = item['设备名称'] || item['名称'] || item['deviceName'] || item.name
        const deviceCode = item['设备编号'] || item['编号'] || item['deviceCode'] || item.deviceCode
        const serialNumber = item['SN码'] || item['序列号'] || item['serial'] || item['serialNumber'] || item.serialNumber
        const brand = item['品牌'] || item['brand'] || item.brand
        const model = item['型号'] || item['model'] || item.model
        const quantity = parseInt(item['数量'] || item['qty'] || item['quantity'] || item.quantity || 1)
        const unit = item['单位'] || item['unit'] || item.unit || '台'
        const accessories = item['配件'] || item['accessories'] || item.accessories || ''
        const warehouse = item['所在仓库'] || item['仓库'] || item['warehouse'] || item.warehouse || '主仓库'
        const company = item['所属公司'] || item['公司'] || item['company'] || item.company || '科技有限公司'
        const status = item['设备状态'] || item['状态'] || item['status'] || item.status || '正常'
        const useStatus = item['使用状态'] || item['useStatus'] || item.useStatus || '未使用'
        const location = item['位置'] || item['location'] || item.location
        const description = item['描述'] || item['desc'] || item['description'] || item.description || ''
        
        // 处理日期格式
        let purchaseDate = item['购买日期'] || item['purchaseDate'] || item.purchaseDate
        if (purchaseDate && typeof purchaseDate === 'number') {
          // 处理Excel日期格式
          const date = new Date((purchaseDate - 25569) * 86400 * 1000)
          purchaseDate = date.toISOString().split('T')[0]
        } else if (purchaseDate && typeof purchaseDate === 'string') {
          // 尝试解析各种日期格式
          const parsedDate = new Date(purchaseDate)
          if (!isNaN(parsedDate.getTime())) {
            purchaseDate = parsedDate.toISOString().split('T')[0]
          }
        }
        
        // 处理价格格式
        let purchasePrice = item['购买价格'] || item['价格'] || item['purchasePrice'] || item.purchasePrice
        if (typeof purchasePrice === 'string') {
          // 移除货币符号和千位分隔符
          purchasePrice = parseFloat(purchasePrice.replace(/[^\d.]/g, ''))
        }
        purchasePrice = parseFloat(purchasePrice) || 0
        
        // 生成模拟图片URL
        const image = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(name)}%20equipment&image_size=square`
        
        // 验证必填字段
        if (!name || !deviceCode) {
          console.error('设备名称或设备编号为空:', item)
          continue
        }
        
        // 准备设备数据
        const deviceData = {
          Name: name.trim(),
          DeviceCode: deviceCode.trim(),
          SerialNumber: typeof serialNumber === 'string' ? serialNumber.trim() : serialNumber?.toString() || '',
          Brand: typeof brand === 'string' ? brand.trim() : brand?.toString() || '',
          Model: typeof model === 'string' ? model.trim() : model?.toString() || '',
          Quantity: quantity,
          Unit: typeof unit === 'string' ? unit.trim() : unit?.toString() || '',
          Accessories: typeof accessories === 'string' ? accessories.trim() : accessories?.toString() || '',
          ImageUrl: image,
          Company: typeof company === 'string' ? company.trim() : company?.toString() || '',
          Status: typeof status === 'string' ? status.trim() : status?.toString() || '',
          UseStatus: typeof useStatus === 'string' ? useStatus.trim() : useStatus?.toString() || '',
          Location: typeof location === 'string' ? location.trim() : location?.toString() || '',
          Description: typeof description === 'string' ? description.trim() : description?.toString() || '',
          PurchaseDate: purchaseDate,
          PurchasePrice: purchasePrice
        }
        
        console.log('准备发送设备数据:', deviceData)
        
        // 调用后端API保存设备
        const newDevice = await deviceApi.createSpecialEquipment(deviceData)
        
        console.log('收到后端返回的设备数据:', newDevice)
        
        // 格式化返回的设备数据
        const formattedDevice = {
          id: newDevice.Id,
          name: newDevice.Name,
          deviceCode: newDevice.DeviceCode,
          serialNumber: newDevice.SerialNumber || '',
          brand: newDevice.Brand || '',
          model: newDevice.Model || '',
          quantity: newDevice.Quantity || 1,
          unit: newDevice.Unit || '台',
          accessories: newDevice.Accessories || '',
          image: newDevice.ImageUrl || image,
          warehouse: newDevice.Warehouse || '主仓库',
          company: newDevice.Company || '',
          status: newDevice.Status || '正常',
          useStatus: newDevice.UseStatus || '未使用',
          location: newDevice.Location || '',
          description: newDevice.Description || '',
          purchaseDate: newDevice.PurchaseDate || purchaseDate || new Date().toISOString().split('T')[0],
          purchasePrice: newDevice.PurchasePrice || 0
        }
        
        importedDevices.push(formattedDevice)
      }
      
      setDevices([...devices, ...importedDevices])
      message.success(`成功导入 ${importedDevices.length} 个设备到数据库`)
    } catch (error) {
      console.error('导入设备失败:', error)
      message.error('导入设备失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    setLoading(true)
    try {
      // 调用后端API清空所有专用设备
      await deviceApi.clearAllSpecialEquipments()
      // 清空本地状态
      setDevices([])
      setFilteredDevices([])
      message.success('所有专用设备已清空')
    } catch (error) {
      console.error('清空设备失败:', error)
      message.error('清空设备失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 120
    },
    {
      title: 'SN码',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
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
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: '配件',
      dataIndex: 'accessories',
      key: 'accessories',
      width: 150,
      ellipsis: true
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <img 
          src={image} 
          alt="设备图片" 
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '所在仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 100
    },
    {
      title: '所属公司',
      dataIndex: 'company',
      key: 'company',
      width: 120
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = ''
        switch (status) {
          case '正常':
            color = 'green'
            break
          case '待维修':
            color = 'orange'
            break
          case '报废':
            color = 'red'
            break
          default:
            color = 'blue'
        }
        return <span style={{ color }}>{status}</span>
      }
    },
    {
      title: '使用状态',
      dataIndex: 'useStatus',
      key: 'useStatus',
      width: 100,
      render: (useStatus) => {
        let color = ''
        switch (useStatus) {
          case '使用中':
            color = 'green'
            break
          case '停用':
            color = 'orange'
            break
          case '闲置':
            color = 'blue'
            break
          case '未使用':
            color = 'gray'
            break
          default:
            color = 'gray'
        }
        return <span style={{ color }}>{useStatus}</span>
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
            icon={<EyeOutlined />} 
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
            title="确定要删除这个设备吗？"
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

  // 计算设备状态统计
  console.log('计算状态统计，设备数量:', devices.length)
  const statusStats = {
    normal: devices.filter(device => device.status === '正常').length,
    repair: devices.filter(device => device.status === '待维修').length,
    scrap: devices.filter(device => device.status === '报废').length,
    total: devices.length
  }
  console.log('状态统计结果:', statusStats)

  return (
    <div className="device-list">
      <div className="page-header">
        <h2>专用设备管理</h2>
        <Space>
          <FileUpload onImport={handleImport} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加设备
          </Button>
          <Popconfirm
            title="确定要清空所有专用设备吗？此操作不可撤销！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>
              清空设备
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      {/* 设备状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>设备总数</h3>
              <p className="stat-number">{statusStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>正常设备</h3>
              <p className="stat-number">{statusStats.normal}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>待维修设备</h3>
              <p className="stat-number">{statusStats.repair}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>报废设备</h3>
              <p className="stat-number">{statusStats.scrap}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Search
              placeholder="搜索设备名称、品牌、型号或序列号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => handleSearch()}
              onPressEnter={() => handleSearch()}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
              enterButton
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
              <Option value="待维修">待维修</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="按位置筛选"
              value={locationFilter}
              onChange={setLocationFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="机房A">机房A</Option>
              <Option value="机房B">机房B</Option>
              <Option value="仓库">仓库</Option>
              <Option value="使用中">使用中</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button 
                onClick={() => {
                  setSearchText('')
                  setStatusFilter('')
                  setLocationFilter('')
                  setSearchParams({})
                  setFilteredDevices(devices)
                }}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredDevices} 
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `共 ${total} 个设备`
        }}
        scroll={{ x: 1500 }}
        locale={{ emptyText: '暂无数据' }}
      />

      <Modal
        title={editingDevice ? '编辑设备' : '添加设备'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={700}
      >
        <DeviceForm 
          device={editingDevice}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* 设备详情模态框 */}
      <Modal
        title="设备详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedDevice && (
          <div key="device-detail">
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="设备名称" key="name">{selectedDevice.name}</Descriptions.Item>
                  <Descriptions.Item label="设备编号" key="deviceCode">{selectedDevice.deviceCode}</Descriptions.Item>
                  <Descriptions.Item label="SN码" key="serialNumber">{selectedDevice.serialNumber}</Descriptions.Item>
                  <Descriptions.Item label="品牌" key="brand">{selectedDevice.brand}</Descriptions.Item>
                  <Descriptions.Item label="型号" key="model">{selectedDevice.model}</Descriptions.Item>
                  <Descriptions.Item label="数量" key="quantity">{selectedDevice.quantity}</Descriptions.Item>
                  <Descriptions.Item label="单位" key="unit">{selectedDevice.unit}</Descriptions.Item>
                  <Descriptions.Item label="配件" key="accessories">{selectedDevice.accessories || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="所在仓库" key="warehouse">{selectedDevice.warehouse || selectedDevice.Warehouse}</Descriptions.Item>
                  <Descriptions.Item label="所属公司" key="company">{selectedDevice.company}</Descriptions.Item>
                  <Descriptions.Item label="设备状态" key="status">
                    <Tag color={
                      selectedDevice.status === '正常' ? 'green' :
                      selectedDevice.status === '待维修' ? 'orange' : 'red'
                    } key="status-tag">
                      {selectedDevice.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="使用状态" key="useStatus">
                    <Tag color={
                      selectedDevice.useStatus === '使用中' ? 'green' :
                      selectedDevice.useStatus === '停用' ? 'orange' : 'blue'
                    } key="useStatus-tag">
                      {selectedDevice.useStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="位置" key="location">{selectedDevice.location}</Descriptions.Item>
                  <Descriptions.Item label="购买日期" key="purchaseDate">{selectedDevice.purchaseDate}</Descriptions.Item>
                  <Descriptions.Item label="购买价格" key="purchasePrice">¥{selectedDevice.purchasePrice}</Descriptions.Item>
                  <Descriptions.Item label="描述" key="description">{selectedDevice.description || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            {selectedDevice.image && (
              <div style={{ marginTop: 20 }} key="image-container">
                <h4>设备图片</h4>
                <Image 
                  src={selectedDevice.image} 
                  style={{ width: 200, height: 200, objectFit: 'cover' }} 
                  key="device-image"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DeviceList