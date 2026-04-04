import React, { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Card, Row, Col, Descriptions, Tag, DatePicker, Select } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useReactToPrint } from 'react-to-print'
import RawMaterialOutboundForm from './RawMaterialOutboundForm'
import { get, post, del } from '../services/request'

const { Search } = Input
const { RangePicker } = DatePicker
const { Option } = Select

const RawMaterialOutboundList = () => {
  const [outbounds, setOutbounds] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingOutbound, setEditingOutbound] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedOutbound, setSelectedOutbound] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [department, setDepartment] = useState('')
  const [filteredOutbounds, setFilteredOutbounds] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const printRef = useRef(null)

  // 模拟数据
  const mockOutbounds = [
    {
      id: 1,
      orderNumber: 'RM-OUT-20260301-001',
      outboundDate: '2026-03-01',
      department: '生产部',
      applicant: '李四',
      handler: '张三',
      warehouseKeeper: '王五',
      status: '已完成',
      remark: '生产领料',
      items: [
        {
          rawMaterialId: 1,
          quantity: 100,
          rawMaterial: {
            id: 1,
            productName: '钢材',
            brand: '宝钢',
            specification: 'Q235 10mm',
            unit: '吨'
          }
        },
        {
          rawMaterialId: 2,
          quantity: 50,
          rawMaterial: {
            id: 2,
            productName: '铝材',
            brand: '中铝',
            specification: '6061 5mm',
            unit: '吨'
          }
        }
      ],
      createdAt: '2026-03-01 10:00:00',
      updatedAt: '2026-03-01 10:00:00'
    },
    {
      id: 2,
      orderNumber: 'RM-OUT-20260302-002',
      outboundDate: '2026-03-02',
      department: '研发部',
      applicant: '赵六',
      handler: '王五',
      warehouseKeeper: '孙七',
      status: '已完成',
      remark: '研发实验',
      items: [
        {
          rawMaterialId: 3,
          quantity: 200,
          rawMaterial: {
            id: 3,
            productName: '塑料颗粒',
            brand: '中石化',
            specification: 'PP 1000',
            unit: '公斤'
          }
        }
      ],
      createdAt: '2026-03-02 14:30:00',
      updatedAt: '2026-03-02 14:30:00'
    },
    {
      id: 3,
      orderNumber: 'RM-OUT-20260303-003',
      outboundDate: '2026-03-03',
      department: '生产部',
      applicant: '孙七',
      handler: '张三',
      warehouseKeeper: '王五',
      status: '已完成',
      remark: '批量生产',
      items: [
        {
          rawMaterialId: 1,
          quantity: 200,
          rawMaterial: {
            id: 1,
            productName: '钢材',
            brand: '宝钢',
            specification: 'Q235 10mm',
            unit: '吨'
          }
        },
        {
          rawMaterialId: 4,
          quantity: 30,
          rawMaterial: {
            id: 4,
            productName: '铜材',
            brand: '江铜',
            specification: 'T2 8mm',
            unit: '吨'
          }
        },
        {
          rawMaterialId: 5,
          quantity: 1000,
          rawMaterial: {
            id: 5,
            productName: '木材',
            brand: '东北林场',
            specification: '松木 2x4',
            unit: '根'
          }
        }
      ],
      createdAt: '2026-03-03 09:15:00',
      updatedAt: '2026-03-03 09:15:00'
    }
  ]

  // 模拟原材料数据
  const mockRawMaterials = [
    { id: 1, productName: '钢材', brand: '宝钢', specification: 'Q235 10mm', remainingQuantity: 700, unit: '吨' },
    { id: 2, productName: '铝材', brand: '中铝', specification: '6061 5mm', remainingQuantity: 300, unit: '吨' },
    { id: 3, productName: '塑料颗粒', brand: '中石化', specification: 'PP 1000', remainingQuantity: 1000, unit: '公斤' },
    { id: 4, productName: '铜材', brand: '江铜', specification: 'T2 8mm', remainingQuantity: 150, unit: '吨' },
    { id: 5, productName: '木材', brand: '东北林场', specification: '松木 2x4', remainingQuantity: 5000, unit: '根' }
  ]

  useEffect(() => {
    // 从API获取数据
    const fetchData = async () => {
      setLoading(true)
      try {
        // 获取原材料出库记录
        const outboundData = await get('/InOutbound/raw-material-outbounds')
        console.log('从后端获取的原始数据:', outboundData)
        // 检查第一条记录的所有字段
        if (outboundData.length > 0) {
          console.log('第一条记录的所有字段:', Object.keys(outboundData[0]))
          console.log('第一条记录的完整数据:', outboundData[0])
        }
        // 转换后端返回的数据格式，将大写开头的字段名转换为小写
        console.log('后端返回的每条记录的 Id:', outboundData.map(item => item.Id))
        console.log('后端返回的每条记录的 Id (小写):', outboundData.map(item => item.id))
        const formattedOutbounds = outboundData
          .map(outbound => ({
            id: outbound.Id || outbound.id,
            orderNumber: outbound.OutboundNumber || outbound.outboundNumber,
            outboundDate: (outbound.OutboundDate || outbound.outboundDate) ? (outbound.OutboundDate || outbound.outboundDate).split('T')[0] : new Date().toISOString().split('T')[0],
            department: outbound.Department || outbound.department,
            applicant: outbound.Applicant || outbound.applicant,
            handler: outbound.Handler || outbound.handler,
            warehouseKeeper: outbound.WarehouseKeeper || outbound.warehouseKeeper,
            status: outbound.Status || outbound.status || '已完成',
            remark: outbound.Remark || outbound.remark,
            items: (outbound.Items || outbound.items) ? (outbound.Items || outbound.items).map(item => ({
              rawMaterialId: item.RawMaterialId || item.rawMaterialId,
              quantity: item.Quantity || item.quantity,
              remark: item.Remark || item.remark
            })) : [],
            createdAt: outbound.CreatedAt || outbound.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
            updatedAt: outbound.UpdatedAt || outbound.updatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19)
          }))
        console.log('转换后的数据:', formattedOutbounds)
        console.log('转换后每条记录的 id:', formattedOutbounds.map(item => item.id))
        setOutbounds(formattedOutbounds)

        // 获取原材料列表
        const materialData = await get('/RawMaterials')
        setRawMaterials(materialData)
      } catch (error) {
        console.error('获取数据失败:', error)
        // 使用模拟数据作为 fallback
        console.log('使用模拟数据:', mockOutbounds)
        setOutbounds(mockOutbounds)
        setRawMaterials(mockRawMaterials)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 过滤出库数据
  useEffect(() => {
    let result = [...outbounds]
    
    console.log('原始 outbounds 数组:', outbounds)
    console.log('每条记录的 id:', outbounds.map(item => item.id))
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(outbound => 
        outbound.orderNumber.toLowerCase().includes(text) ||
        outbound.department.toLowerCase().includes(text) ||
        outbound.handler.toLowerCase().includes(text) ||
        (outbound.applicant && outbound.applicant.toLowerCase().includes(text))
      )
    }
    
    // 日期范围过滤
    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day').toISOString()
      const endDate = dateRange[1].endOf('day').toISOString()
      result = result.filter(outbound => {
        const outboundDate = new Date(outbound.outboundDate).toISOString()
        return outboundDate >= startDate && outboundDate <= endDate
      })
    }
    
    // 部门过滤
    if (department) {
      result = result.filter(outbound => outbound.department === department)
    }
    
    console.log('过滤后的 filteredOutbounds:', result)
    setFilteredOutbounds(result)
  }, [outbounds, searchText, dateRange, department])

  const handleAdd = () => {
    setEditingOutbound(null)
    setShowForm(true)
  }

  const handleEdit = (outbound) => {
    setEditingOutbound(outbound)
    setShowForm(true)
  }

  const handleDetail = (outbound) => {
    setSelectedOutbound(outbound)
    setShowDetail(true)
  }

  const handleDelete = async (id) => {
    try {
      console.log('删除出库记录，id:', id)
      console.log('id 的类型:', typeof id)
      console.log('id === undefined:', id === undefined)
      console.log('id === null:', id === null)
      console.log('id === \'\':', id === '')
      console.log('isNaN(Number(id)):', isNaN(Number(id)))
      console.log('Number(id) <= 0:', Number(id) <= 0)
      console.log('!id:', !id)
      console.log('outbounds 数组:', outbounds)
      
      // 更严格的检查，确保 id 是有效的
      if (!id || id === undefined || id === null || id === '' || isNaN(Number(id)) || Number(id) <= 0) {
        console.log('ID 无效，返回')
        message.error('出库记录 ID 无效')
        return
      }
      
      const numericId = Number(id)
      console.log('准备删除，numericId:', numericId)
      
      // 再次检查，确保 numericId 是有效的
      if (isNaN(numericId) || numericId <= 0) {
        console.log('ID 不是有效的正数，返回')
        message.error('出库记录 ID 必须是有效的正数')
        return
      }
      
      await del(`/InOutbound/raw-material-outbounds/${numericId}`)
      setOutbounds(outbounds.filter(outbound => outbound.id !== numericId))
      message.success('出库记录删除成功，库存已恢复')
      
      // 重新获取原材料数据以更新库存
      const materialData = await get('/RawMaterials')
      setRawMaterials(materialData)
    } catch (error) {
      console.error('删除出库记录失败:', error)
      message.error(error.message || '删除出库记录失败')
    }
  }

  // 配置react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `原材料出库单-${selectedOutbound?.orderNumber || '预览'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 12px;
          line-height: 1.2;
        }
        .preview-content {
          padding: 10px;
        }
        .preview-content h2 {
          text-align: center;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .preview-content h3 {
          margin-top: 0;
          margin-bottom: 12px;
          border-bottom: 2px solid #1890ff;
          padding-bottom: 6px;
          font-size: 14px;
        }
        .preview-content > div {
          margin-bottom: 15px;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          padding: 12px;
        }
        .preview-content table {
          width: 100%;
          border-collapse: collapse;
        }
        .preview-content table th,
        .preview-content table td {
          border: 1px solid #e8e8e8;
          padding: 6px;
          text-align: left;
          font-size: 11px;
        }
        .preview-content table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
      }
    `
  })

  // 保存PDF功能
  const handleSavePDF = () => {
    message.info('保存PDF功能开发中')
  }

  // 根据原材料ID获取名称
  const getRawMaterialName = (id) => {
    const material = rawMaterials.find(m => m.id === id)
    return material ? material.productName : '无'
  }

  // 根据原材料ID获取规格
  const getRawMaterialSpecification = (id) => {
    const material = rawMaterials.find(m => m.id === id)
    return material ? material.specification : '无'
  }

  // 根据原材料ID获取单位
  const getRawMaterialUnit = (id) => {
    const material = rawMaterials.find(m => m.id === id)
    return material ? material.unit : '无'
  }

  // 根据原材料ID获取品牌
  const getRawMaterialBrand = (id) => {
    const material = rawMaterials.find(m => m.id === id)
    return material ? material.brand : '无'
  }

  const handleSave = async (outbound) => {
    try {
      const dto = {
        Id: outbound.id,
        OutboundNumber: outbound.orderNumber,
        OutboundDate: new Date(outbound.outboundDate),
        Department: outbound.department,
        Applicant: outbound.applicant,
        Handler: outbound.handler,
        WarehouseKeeper: outbound.warehouseKeeper,
        Status: '已完成',
        Remark: outbound.remark,
        Items: outbound.items.map(item => ({
          RawMaterialId: item.rawMaterialId,
          Quantity: item.quantity,
          Remark: item.remark
        }))
      }

      if (outbound.id) {
        // 编辑现有出库记录（暂时未实现）
        setOutbounds(outbounds.map(o => o.id === outbound.id ? outbound : o))
        message.success('出库记录更新成功')
      } else {
        // 添加新出库记录
        await post('/InOutbound/raw-material-outbounds', dto)
        message.success('出库记录添加成功')

        // 重新获取所有出库记录，确保显示最新数据
        const outboundData = await get('/InOutbound/raw-material-outbounds')
        console.log('重新获取的出库记录:', outboundData)
        console.log('后端返回的每条记录的 Id:', outboundData.map(item => item.Id))
        const formattedOutbounds = outboundData
          .map(outbound => ({
            id: outbound.Id,
            orderNumber: outbound.OutboundNumber,
            outboundDate: outbound.OutboundDate ? outbound.OutboundDate.split('T')[0] : new Date().toISOString().split('T')[0],
            department: outbound.Department,
            applicant: outbound.Applicant,
            handler: outbound.Handler,
            warehouseKeeper: outbound.WarehouseKeeper,
            status: outbound.Status || '已完成',
            remark: outbound.Remark,
            items: outbound.Items ? outbound.Items.map(item => ({
              rawMaterialId: item.RawMaterialId,
              quantity: item.Quantity,
              remark: item.Remark
            })) : [],
            createdAt: outbound.CreatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
            updatedAt: outbound.UpdatedAt || new Date().toISOString().replace('T', ' ').substring(0, 19)
          }))
        console.log('转换后的数据:', formattedOutbounds)
        console.log('转换后每条记录的 id:', formattedOutbounds.map(item => item.id))
        setOutbounds(formattedOutbounds)
        console.log('更新后的 outbounds 数组:', formattedOutbounds)

        // 重新获取原材料数据以更新库存
        const materialData = await get('/RawMaterials')
        setRawMaterials(materialData)
      }
      setShowForm(false)
    } catch (error) {
      console.error('保存出库记录失败:', error)
      message.error(error.message || '保存出库记录失败')
    }
  }

  const columns = [
    {
      title: '出库单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
      render: (orderNumber) => orderNumber || '无'
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100
    },
    {
      title: '申请部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      render: (department) => (
        <Tag color="blue">{department}</Tag>
      )
    },
    {
      title: '经办人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate',
      width: 120
    },
    {
      title: '出库状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : 'orange'}>
          {status || '已完成'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />}
            onClick={() => handleDetail(record)}
          >
            预览
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个出库记录吗？"
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

  // 计算统计数据
  const stats = {
    totalOutbounds: outbounds.length
  }

  return (
    <div className="raw-material-outbound-list">
      <div className="page-header">
        <h2>原材料出库管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建原材料出库单
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <div className="stat-card">
              <h3>出库记录总数</h3>
              <p className="stat-number">{stats.totalOutbounds}</p>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>今日出库</h3>
              <p className="stat-number">
                {outbounds.filter(o => o.outboundDate === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和过滤区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Search
              placeholder="搜索出库单号、部门或人员"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择部门"
              value={department}
              onChange={(value) => setDepartment(value)}
            >
              <Option value="">全部</Option>
              <Option value="生产部">生产部</Option>
              <Option value="研发部">研发部</Option>
              <Option value="质检部">质检部</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              onClick={() => {
                setSearchText('')
                setDateRange(null)
                setDepartment('')
              }}
            >
              重置过滤
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredOutbounds} 
        loading={loading}
        rowKey={(record) => record.id || `outbound-${Math.random().toString(36).substr(2, 9)}`}
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条出库记录`
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingOutbound ? '编辑原材料出库单' : '新建原材料出库单'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={1200}
      >
        <RawMaterialOutboundForm 
          outbound={editingOutbound}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          rawMaterials={rawMaterials}
        />
      </Modal>

      {/* 出库记录详情模态框 */}
      <Modal
        title="出库记录详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        width={800}
        centered
        destroyOnHidden
        styles={{
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          content: {
            top: 20
          }
        }}
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>,
          <Button key="print" type="default" onClick={handlePrint} style={{ marginRight: 16 }}>
            打印
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePDF}>
            保存PDF
          </Button>
        ]}
        className="preview-modal"
      >
        <div ref={printRef} className="preview-content" style={{ padding: '20px', maxHeight: '75vh', overflow: 'auto', backgroundColor: '#fff' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2>原材料出库单</h2>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            {/* 出库单号 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col span={24}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>出库单号:</strong> {selectedOutbound?.orderNumber}</p>
              </Col>
            </Row>
            {/* 申请人、申请部门 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={12} md={12}>
                <p style={{ margin: 0 }}><strong>申请人:</strong> {selectedOutbound?.applicant || '-'}</p>
              </Col>
              <Col xs={24} sm={12} md={12}>
                <p style={{ margin: 0 }}><strong>申请部门:</strong> {selectedOutbound?.department}</p>
              </Col>
            </Row>
            {/* 经办人、库管、出库日期、状态 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>经办人:</strong> {selectedOutbound?.handler}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>库管:</strong> {selectedOutbound?.warehouseKeeper || '-'}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>出库日期:</strong> {selectedOutbound?.outboundDate}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>状态:</strong> 
                  <Tag color={selectedOutbound?.status === '已完成' ? 'green' : 'orange'}>
                    {selectedOutbound?.status || '已完成'}
                  </Tag>
                </p>
              </Col>
            </Row>
          </div>
          
          {/* 出库物品 */}
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>出库物品</h3>
            <Table 
              columns={[
                { title: '序号', dataIndex: 'key', key: 'key' },
                { title: '原材料名称', dataIndex: 'rawMaterialName', key: 'rawMaterialName' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '出库数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                { title: '单位', dataIndex: 'unit', key: 'unit', align: 'center' },
                { title: '备注', dataIndex: 'remark', key: 'remark' }
              ]} 
              dataSource={selectedOutbound?.items?.map((item, index) => ({
                key: item.rawMaterialId || index + 1,
                rawMaterialId: item.rawMaterialId,
                rawMaterialName: getRawMaterialName(item.rawMaterialId),
                brand: getRawMaterialBrand(item.rawMaterialId),
                specification: getRawMaterialSpecification(item.rawMaterialId),
                quantity: item.quantity,
                unit: getRawMaterialUnit(item.rawMaterialId),
                remark: item.remark || '无'
              })) || []} 
              rowKey="key"
              pagination={false}
              size="small"
              bordered
              style={{ width: '100%' }}
            />
          </div>
          
          {/* 备注 */}
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>备注</h3>
            <p style={{ margin: 0 }}>{selectedOutbound?.remark || '无'}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RawMaterialOutboundList