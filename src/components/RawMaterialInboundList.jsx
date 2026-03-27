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

  // 从API获取数据
  useEffect(() => {
    const fetchRawMaterials = async () => {
      try {
        const response = await fetch('http://localhost:5055/api/RawMaterials')
        if (response.ok) {
          const data = await response.json()
          setRawMaterials(data)
        } else {
          // 使用模拟数据作为后备
          const mockRawMaterials = [
            { id: 1, productName: '钢材', specification: 'Φ10mm', remainingQuantity: 50 },
            { id: 2, productName: '铝材', specification: '1mm', remainingQuantity: 30 },
            { id: 3, productName: '塑料', specification: '颗粒', remainingQuantity: 100 },
            { id: 4, productName: '电线', specification: '2.5mm²', remainingQuantity: 200 }
          ]
          setRawMaterials(mockRawMaterials)
          message.warning('使用模拟原材料数据')
        }
      } catch (error) {
        // 使用模拟数据作为后备
        const mockRawMaterials = [
          { id: 1, productName: '钢材', specification: 'Φ10mm', remainingQuantity: 50 },
          { id: 2, productName: '铝材', specification: '1mm', remainingQuantity: 30 },
          { id: 3, productName: '塑料', specification: '颗粒', remainingQuantity: 100 },
          { id: 4, productName: '电线', specification: '2.5mm²', remainingQuantity: 200 }
        ]
        setRawMaterials(mockRawMaterials)
        message.warning('使用模拟原材料数据')
      }
    }

    const fetchInbounds = async () => {
      try {
        const response = await fetch('http://localhost:5055/api/InOutbound/raw-material-inbounds')
        if (response.ok) {
          const data = await response.json()
          // 转换数据格式以匹配前端组件的期望
          const formattedInbounds = data.map(item => ({
            id: item.id,
            inboundNumber: item.inboundNumber,
            inboundDate: new Date().toISOString().slice(0, 10), // 临时使用当前日期
            deliveryPerson: '', // 后端DTO中没有该字段
            company: item.supplier, // 使用supplier作为company
            supplier: item.supplier,
            operator: item.handler,
            status: item.status,
            remark: item.remark,
            rawMaterialInboundItems: item.items.map(item => ({
              id: item.id,
              rawMaterialId: item.rawMaterialId,
              quantity: item.quantity,
              specification: '', // 后端DTO中没有该字段
              remark: item.remark
            }))
          }))
          setInbounds(formattedInbounds)
        } else {
          message.error('获取入库记录失败')
        }
      } catch (error) {
        message.error('网络错误，请检查后端服务是否运行')
      }
    }

    fetchRawMaterials()
    fetchInbounds()
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

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5055/api/InOutbound/raw-material-inbounds/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 重新获取入库记录列表
        await fetchInbounds()
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
  }

  const handleSave = async (data) => {
    try {
      // 转换数据格式以匹配后端API的期望
      const dto = {
        supplier: data.supplier || data.company || '',
        handler: data.operator,
        warehouseKeeper: data.operator,
        remark: data.remark,
        items: data.rawMaterialInboundItems.map(item => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          remark: item.remark
        }))
      }

      const response = await fetch('http://localhost:5055/api/InOutbound/raw-material-inbounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dto)
      })

      if (response.ok) {
        const result = await response.json()
        // 重新获取入库记录列表
        await fetchInbounds()
        message.success('添加成功')
      } else {
        message.error('添加失败')
      }
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    } finally {
      setIsModalVisible(false)
    }
  }

  // 确认入库操作
  const handleConfirmInbound = async (inbound) => {
    try {
      message.loading('正在确认入库...')
      
      const response = await fetch('http://localhost:5055/api/InOutbound/raw-material-inbounds/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inbound.id)
      })

      if (response.ok) {
        // 重新获取入库记录列表
        await fetchInbounds()
        // 重新获取原材料列表以更新库存数量
        const fetchRawMaterialsAgain = async () => {
          try {
            const response = await fetch('http://localhost:5055/api/RawMaterials')
            if (response.ok) {
              const data = await response.json()
              setRawMaterials(data)
            }
          } catch (error) {
            console.error('获取原材料数据失败:', error)
          }
        }
        await fetchRawMaterialsAgain()
        message.success('入库成功，数据已更新到仓库')
      } else {
        message.error('确认入库失败')
      }
    } catch (error) {
      message.error('网络错误，请检查后端服务是否运行')
    }
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
          {record.status === '待处理' && (
            <Button 
              type="primary" 
              onClick={() => handleConfirmInbound(record)}
              size="small"
            >
              确认入库
            </Button>
          )}
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
        key={rawMaterials.length} // 当rawMaterials更新时，强制重新渲染模态框
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