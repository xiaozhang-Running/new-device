import React, { useState, useEffect } from 'react'
import { Table, Button, message, Space, Modal, Card, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import RawMaterialInboundForm from './RawMaterialInboundForm'

const RawMaterialInboundList = () => {
  const [inbounds, setInbounds] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingInbound, setEditingInbound] = useState(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [viewingInbound, setViewingInbound] = useState(null)

  // 模拟数据获取
  useEffect(() => {
    // 模拟原材料数据
    const mockRawMaterials = [
      { id: 1, productName: '钢材', specification: 'Φ10mm', unit: '吨' },
      { id: 2, productName: '铝材', specification: '1mm', unit: '吨' },
      { id: 3, productName: '塑料', specification: '颗粒', unit: '千克' },
      { id: 4, productName: '电线', specification: '2.5mm²', unit: '米' }
    ]
    setRawMaterials(mockRawMaterials)

    // 模拟入库记录数据
    const mockInbounds = [
      {
        id: 1,
        inboundNumber: 'RM-IN-20260301',
        inboundDate: '2026-03-01',
        deliveryPerson: '张三',
        company: '供应商A',
        supplier: '供应商A',
        operator: '李四',
        status: '已完成',
        remark: '常规采购',
        rawMaterialInboundItems: [
          { id: 1, rawMaterialId: 1, quantity: 10, specification: 'Φ10mm', remark: '' },
          { id: 2, rawMaterialId: 2, quantity: 5, specification: '1mm', remark: '' }
        ]
      },
      {
        id: 2,
        inboundNumber: 'RM-IN-20260302',
        inboundDate: '2026-03-02',
        deliveryPerson: '王五',
        company: '供应商B',
        supplier: '供应商B',
        operator: '赵六',
        status: '待处理',
        remark: '紧急采购',
        rawMaterialInboundItems: [
          { id: 3, rawMaterialId: 3, quantity: 100, specification: '颗粒', remark: '' },
          { id: 4, rawMaterialId: 4, quantity: 500, specification: '2.5mm²', remark: '' }
        ]
      }
    ]
    setInbounds(mockInbounds)
  }, [])

  const handleAdd = () => {
    setEditingInbound(null)
    setIsModalVisible(true)
  }

  const handleEdit = (inbound) => {
    setEditingInbound(inbound)
    setIsModalVisible(true)
  }

  const handleView = (inbound) => {
    setViewingInbound(inbound)
    setIsViewModalVisible(true)
  }

  const handleDelete = (id) => {
    // 模拟删除操作
    setInbounds(inbounds.filter(item => item.id !== id))
    message.success('删除成功')
  }

  const handleSave = (data) => {
    // 模拟保存操作
    if (editingInbound) {
      // 编辑
      setInbounds(inbounds.map(item => 
        item.id === editingInbound.id ? { ...item, ...data } : item
      ))
      message.success('编辑成功')
    } else {
      // 新增
      const newInbound = {
        id: Date.now(),
        ...data
      }
      setInbounds([...inbounds, newInbound])
      message.success('添加成功')
    }
    setIsModalVisible(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '已完成':
        return 'green'
      case '待处理':
        return 'blue'
      case '已取消':
        return 'red'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'inboundNumber',
      key: 'inboundNumber'
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      key: 'inboundDate'
    },
    {
      title: '送货人',
      dataIndex: 'deliveryPerson',
      key: 'deliveryPerson'
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            size="small"
          >
            查看
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  const itemColumns = [
    {
      title: '原材料',
      dataIndex: 'rawMaterialId',
      key: 'rawMaterialId',
      render: (value) => {
        const material = rawMaterials.find(m => m.id === value)
        return material ? material.productName : ''
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card title="原材料入库管理" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建入库单
        </Button>
      }>
        <Table 
          columns={columns} 
          dataSource={inbounds} 
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingInbound ? "编辑入库单" : "新建入库单"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <RawMaterialInboundForm
          onSave={handleSave}
          onCancel={() => setIsModalVisible(false)}
          rawMaterials={rawMaterials}
        />
      </Modal>

      <Modal
        title="查看入库单详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingInbound && (
          <div>
            <Card title="入库单信息" style={{ marginBottom: 20 }}>
              <p><strong>入库单号：</strong>{viewingInbound.inboundNumber}</p>
              <p><strong>入库日期：</strong>{viewingInbound.inboundDate}</p>
              <p><strong>送货人：</strong>{viewingInbound.deliveryPerson}</p>
              <p><strong>公司：</strong>{viewingInbound.company}</p>
              <p><strong>供应商：</strong>{viewingInbound.supplier}</p>
              <p><strong>操作人：</strong>{viewingInbound.operator}</p>
              <p><strong>状态：</strong>
                <Tag color={getStatusColor(viewingInbound.status)}>
                  {viewingInbound.status}
                </Tag>
              </p>
              <p><strong>备注：</strong>{viewingInbound.remark}</p>
            </Card>
            <Card title="入库项目">
              <Table 
                columns={itemColumns} 
                dataSource={viewingInbound.rawMaterialInboundItems}
                rowKey="id"
                pagination={false}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RawMaterialInboundList