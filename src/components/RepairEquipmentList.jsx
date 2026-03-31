import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, DatePicker, Card, Row, Col, Descriptions, Tag, Form, InputNumber } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { get, post, put, del } from '../services/request'

const { Option } = Select
const { RangePicker } = DatePicker
const { Search } = Input
const { TextArea } = Input

const RepairEquipmentList = () => {
  const [repairEquipments, setRepairEquipments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRepair, setEditingRepair] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredRepairs, setFilteredRepairs] = useState([])
  const [form] = Form.useForm()

  // 从API获取维修设备数据
  const fetchRepairEquipments = async () => {
    setLoading(true)
    try {
      const data = await get('/Repair')
      setRepairEquipments(data)
    } catch (error) {
      message.error('获取维修设备数据失败')
      console.error('Error fetching repair equipments:', error)
    } finally {
      setLoading(false)
    }
  }

  // 从设备创建维修记录
  const createRepairFromDevice = async (deviceType, equipmentId, faultDescription, repairPerson, remark) => {
    try {
      await post('/Repair/CreateFromDevice', {
        deviceType,
        equipmentId,
        faultDescription,
        repairPerson,
        remark
      })
      message.success('维修记录创建成功')
      fetchRepairEquipments()
      return true
    } catch (error) {
      message.error('创建维修记录失败')
      console.error('Error creating repair from device:', error)
      return false
    }
  }

  useEffect(() => {
    fetchRepairEquipments()
  }, [])

  // 过滤维修设备数据
  useEffect(() => {
    let result = [...repairEquipments]
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(repair => 
        repair.equipmentName.toLowerCase().includes(text) ||
        repair.equipmentCode.toLowerCase().includes(text) ||
        repair.faultDescription.toLowerCase().includes(text) ||
        repair.repairPerson.toLowerCase().includes(text)
      )
    }
    
    // 状态过滤
    if (statusFilter) {
      result = result.filter(repair => repair.repairStatus === statusFilter)
    }
    
    setFilteredRepairs(result)
  }, [repairEquipments, searchText, statusFilter])

  const handleAdd = () => {
    setEditingRepair(null)
    form.resetFields()
    setShowForm(true)
  }

  const handleEdit = (repair) => {
    setEditingRepair(repair)
    form.setFieldsValue({
      equipmentId: repair.equipmentId,
      equipmentName: repair.equipmentName,
      equipmentCode: repair.equipmentCode,
      faultDescription: repair.faultDescription,
      repairDate: repair.repairDate,
      repairCost: repair.repairCost,
      repairPerson: repair.repairPerson,
      repairStatus: repair.repairStatus,
      remark: repair.remark
    })
    setShowForm(true)
  }

  const handleDetail = (repair) => {
    setSelectedRepair(repair)
    setShowDetail(true)
  }

  const handleDelete = async (id) => {
    try {
      await del(`/Repair/${id}`)
      message.success('维修记录删除成功')
      fetchRepairEquipments()
    } catch (error) {
      message.error('删除维修记录失败')
      console.error('Error deleting repair equipment:', error)
    }
  }

  const handleSave = async (values) => {
    try {
      if (editingRepair) {
        // 编辑现有维修记录
        await put(`/Repair/${editingRepair.id}`, values)
        message.success('维修记录更新成功')
        fetchRepairEquipments()
      } else {
        // 添加新维修记录
        await post('/Repair', values)
        message.success('维修记录添加成功')
        fetchRepairEquipments()
      }
      setShowForm(false)
    } catch (error) {
      message.error('保存维修记录失败')
      console.error('Error saving repair equipment:', error)
    }
  }

  const handleCompleteRepair = async (id) => {
    try {
      const repair = repairEquipments.find(r => r.id === id)
      const updatedRepair = { ...repair, repairStatus: '已完成' }
      await put(`/Repair/${id}`, updatedRepair)
      message.success('维修完成')
      fetchRepairEquipments()
    } catch (error) {
      message.error('更新维修状态失败')
      console.error('Error completing repair:', error)
    }
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 120
    },
    {
      title: '设备编号',
      dataIndex: 'equipmentCode',
      key: 'equipmentCode',
      width: 120
    },
    {
      title: '故障描述',
      dataIndex: 'faultDescription',
      key: 'faultDescription',
      width: 200,
      ellipsis: true
    },
    {
      title: '维修日期',
      dataIndex: 'repairDate',
      key: 'repairDate',
      width: 120
    },
    {
      title: '维修费用',
      dataIndex: 'repairCost',
      key: 'repairCost',
      width: 100,
      render: (cost) => `¥${cost}`
    },
    {
      title: '维修人员',
      dataIndex: 'repairPerson',
      key: 'repairPerson',
      width: 100
    },
    {
      title: '维修状态',
      dataIndex: 'repairStatus',
      key: 'repairStatus',
      width: 100,
      render: (status) => {
        let color = ''
        switch (status) {
          case '待维修':
            color = 'orange'
            break
          case '维修中':
            color = 'blue'
            break
          case '已完成':
            color = 'green'
            break
          default:
            color = 'gray'
        }
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          {record.repairStatus !== '已完成' && (
            <Button 
              type="success" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleCompleteRepair(record.id)}
            >
              完成维修
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个维修记录吗？"
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

  // 计算维修状态统计
  const statusStats = {
    pending: repairEquipments.filter(repair => repair.repairStatus === '待维修').length,
    inProgress: repairEquipments.filter(repair => repair.repairStatus === '维修中').length,
    completed: repairEquipments.filter(repair => repair.repairStatus === '已完成').length,
    total: repairEquipments.length
  }

  return (
    <div className="repair-equipment-list">
      <div className="page-header">
        <h2>待维修设备管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加维修记录
        </Button>
      </div>
      
      {/* 维修状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div className="stat-card">
              <h3>维修记录总数</h3>
              <p className="stat-number">{statusStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>待维修</h3>
              <p className="stat-number">{statusStats.pending}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#1890ff' }}>
              <h3>维修中</h3>
              <p className="stat-number">{statusStats.inProgress}</p>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>已完成</h3>
              <p className="stat-number">{statusStats.completed}</p>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Search
              placeholder="搜索设备名称、编号、故障描述或维修人员"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="按维修状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="待维修">待维修</Option>
              <Option value="维修中">维修中</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              onClick={() => {
                setSearchText('')
                setStatusFilter('')
              }}
            >
              重置筛选
            </Button>
          </Col>
        </Row>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredRepairs} 
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `共 ${total} 个维修记录`
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingRepair ? '编辑维修记录' : '添加维修记录'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="equipmentId"
            label="设备ID"
            rules={[{ required: true, message: '请输入设备ID' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="equipmentName"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="equipmentCode"
            label="设备编号"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="faultDescription"
            label="故障描述"
            rules={[{ required: true, message: '请输入故障描述' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="repairDate"
            label="维修日期"
            rules={[{ required: true, message: '请选择维修日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="repairCost"
            label="维修费用"
            rules={[{ required: true, message: '请输入维修费用' }]}
          >
            <InputNumber style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item
            name="repairPerson"
            label="维修人员"
            rules={[{ required: true, message: '请输入维修人员' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="repairStatus"
            label="维修状态"
            rules={[{ required: true, message: '请选择维修状态' }]}
          >
            <Select>
              <Option value="待维修">待维修</Option>
              <Option value="维修中">维修中</Option>
              <Option value="已完成">已完成</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setShowForm(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 维修记录详情模态框 */}
      <Modal
        title="维修记录详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedRepair && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="设备名称">{selectedRepair.equipmentName}</Descriptions.Item>
              <Descriptions.Item label="设备编号">{selectedRepair.equipmentCode}</Descriptions.Item>
              <Descriptions.Item label="故障描述">{selectedRepair.faultDescription}</Descriptions.Item>
              <Descriptions.Item label="维修日期">{selectedRepair.repairDate}</Descriptions.Item>
              <Descriptions.Item label="维修费用">¥{selectedRepair.repairCost}</Descriptions.Item>
              <Descriptions.Item label="维修人员">{selectedRepair.repairPerson}</Descriptions.Item>
              <Descriptions.Item label="维修状态">
                <Tag color={
                  selectedRepair.repairStatus === '待维修' ? 'orange' :
                  selectedRepair.repairStatus === '维修中' ? 'blue' : 'green'
                }>
                  {selectedRepair.repairStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="备注">{selectedRepair.remark || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRepair.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedRepair.updatedAt}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RepairEquipmentList