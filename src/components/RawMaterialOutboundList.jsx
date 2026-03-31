import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Card, Row, Col, Descriptions, Tag, DatePicker, Select } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import RawMaterialOutboundForm from './RawMaterialOutboundForm'
import { get, post } from '../services/request'

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

  // 模拟数据
  const mockOutbounds = [
    {
      id: 1,
      orderNumber: 'RM-OUT-20260301-001',
      outboundDate: '2026-03-01',
      department: '生产部',
      handler: '张三',
      recipient: '李四',
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
      handler: '王五',
      recipient: '赵六',
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
      handler: '张三',
      recipient: '孙七',
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
        setOutbounds(outboundData)

        // 获取原材料列表
        const materialData = await get('/RawMaterial')
        setRawMaterials(materialData)
      } catch (error) {
        console.error('获取数据失败:', error)
        // 使用模拟数据作为 fallback
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
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(outbound => 
        outbound.orderNumber.toLowerCase().includes(text) ||
        outbound.department.toLowerCase().includes(text) ||
        outbound.handler.toLowerCase().includes(text) ||
        outbound.recipient.toLowerCase().includes(text)
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

  const handleDelete = (id) => {
    setOutbounds(outbounds.filter(outbound => outbound.id !== id))
    message.success('出库记录删除成功')
  }

  const handleSave = async (outbound) => {
    try {
      const dto = {
        id: outbound.id,
        outboundNumber: outbound.orderNumber,
        outboundDate: new Date(outbound.outboundDate),
        recipient: outbound.recipient,
        operator: outbound.handler,
        status: '已完成',
        remark: outbound.remark,
        items: outbound.items.map(item => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          remark: item.remark
        }))
      }

      if (outbound.id) {
        // 编辑现有出库记录（暂时未实现）
        setOutbounds(outbounds.map(o => o.id === outbound.id ? outbound : o))
        message.success('出库记录更新成功')
      } else {
        // 添加新出库记录
        const newOutbound = await post('/InOutbound/raw-material-outbounds', dto)
        // 转换数据格式以匹配前端状态
        const formattedOutbound = {
          id: newOutbound.id,
          orderNumber: newOutbound.outboundNumber,
          outboundDate: newOutbound.outboundDate.split('T')[0],
          department: outbound.department,
          handler: newOutbound.operator,
          recipient: newOutbound.recipient,
          remark: newOutbound.remark,
          items: newOutbound.items.map(item => {
            const rawMaterial = rawMaterials.find(m => m.id === item.rawMaterialId)
            return {
              ...item,
              rawMaterial: rawMaterial
            }
          }),
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
        setOutbounds([...outbounds, formattedOutbound])
        message.success('出库记录添加成功')

        // 重新获取原材料数据以更新库存
        const materialData = await get('/RawMaterial')
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
      width: 180
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      key: 'outboundDate',
      width: 120
    },
    {
      title: '出库部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      render: (department) => (
        <Tag color="blue">{department}</Tag>
      )
    },
    {
      title: '经手人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100
    },
    {
      title: '接收人',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 100
    },
    {
      title: '原材料数量',
      dataIndex: 'items',
      key: 'itemsCount',
      width: 120,
      align: 'center',
      render: (items) => items.length
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160
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
    totalOutbounds: outbounds.length,
    totalItems: outbounds.reduce((sum, o) => sum + o.items.length, 0)
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
        <Col span={8}>
          <Card>
            <div className="stat-card">
              <h3>出库记录总数</h3>
              <p className="stat-number">{stats.totalOutbounds}</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>出库原材料种类</h3>
              <p className="stat-number">{stats.totalItems}</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
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
        rowKey="id"
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
        width={800}
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
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedOutbound && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="出库单号">{selectedOutbound.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="出库日期">{selectedOutbound.outboundDate}</Descriptions.Item>
              <Descriptions.Item label="出库部门">{selectedOutbound.department}</Descriptions.Item>
              <Descriptions.Item label="经手人">{selectedOutbound.handler}</Descriptions.Item>
              <Descriptions.Item label="接收人">{selectedOutbound.recipient}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedOutbound.createdAt}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selectedOutbound.remark || '-'}</Descriptions.Item>
            </Descriptions>
            
            <h3 style={{ marginBottom: 16 }}>出库原材料明细</h3>
            <Table
              columns={[
                {
                  title: '原材料名称',
                  dataIndex: 'rawMaterial.productName',
                  key: 'productName'
                },
                {
                  title: '品牌',
                  dataIndex: 'rawMaterial.brand',
                  key: 'brand'
                },
                {
                  title: '规格',
                  dataIndex: 'rawMaterial.specification',
                  key: 'specification'
                },
                {
                  title: '出库数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'center'
                },
                {
                  title: '单位',
                  dataIndex: 'rawMaterial.unit',
                  key: 'unit',
                  align: 'center'
                }
              ]}
              dataSource={selectedOutbound.items}
              pagination={false}
              rowKey={(record, index) => index}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RawMaterialOutboundList