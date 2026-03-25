import { useState, useEffect } from 'react'
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
  Tabs 
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs

// 模拟数据 - 项目出库历史（用于入库选择）
const mockOutboundHistory = [
  {
    id: 1,
    projectName: '项目1',
    outboundDate: '2026-03-20',
    operator: 'admin',
    status: '已完成',
    items: [
      { type: '专用设备', name: '专用设备A', model: 'Model-A', specification: '规格A', quantity: 2 },
      { type: '通用设备', name: '通用设备B', model: 'G-Model-B', specification: '通用规格B', quantity: 1 },
      { type: '耗材', name: '耗材A', model: 'C-Model-A', specification: '耗材规格A', quantity: 10 }
    ]
  },
  {
    id: 2,
    projectName: '项目2',
    outboundDate: '2026-03-18',
    operator: 'warehouse',
    status: '已完成',
    items: [
      { type: '专用设备', name: '专用设备B', model: 'Model-B', specification: '规格B', quantity: 1 },
      { type: '耗材', name: '耗材B', model: 'C-Model-B', specification: '耗材规格B', quantity: 20 }
    ]
  }
]

// 模拟数据 - 入库历史
const mockInboundHistory = [
  {
    id: 1,
    projectName: '项目1',
    outboundOrderId: 1,
    inboundDate: '2026-03-22',
    operator: 'warehouse',
    status: '已完成',
    items: [
      { type: '专用设备', name: '专用设备A', quantity: 1 },
      { type: '通用设备', name: '通用设备B', quantity: 1 }
    ]
  }
]

function ProjectInbound() {
  const [form] = Form.useForm()
  const [selectedOutboundOrder, setSelectedOutboundOrder] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [inboundHistory, setInboundHistory] = useState(mockInboundHistory)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [currentInboundDetail, setCurrentInboundDetail] = useState(null)

  // 处理出库单选择
  const handleOutboundOrderSelect = (orderId) => {
    const order = mockOutboundHistory.find(o => o.id === orderId)
    if (order) {
      setSelectedOutboundOrder(order)
      // 初始化可入库项，默认数量为出库数量
      const initialItems = order.items.map(item => ({
        ...item,
        inboundQuantity: item.quantity
      }))
      setSelectedItems(initialItems)
    }
  }

  // 处理入库数量变更
  const handleInboundQuantityChange = (index, value) => {
    setSelectedItems(prev => {
      const updated = [...prev]
      updated[index].inboundQuantity = value
      return updated
    })
  }

  // 移除入库项
  const removeInboundItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  // 处理表单提交
  const handleSubmit = (values) => {
    if (!selectedOutboundOrder) {
      message.error('请选择出库单')
      return
    }

    if (selectedItems.length === 0) {
      message.error('请至少选择一项入库物品')
      return
    }

    // 检查入库数量是否合理
    const invalidItem = selectedItems.find(item => 
      item.inboundQuantity <= 0 || item.inboundQuantity > item.quantity
    )
    if (invalidItem) {
      message.error(`入库数量必须在 1 到 ${invalidItem.quantity} 之间`)
      return
    }

    // 模拟提交
    setTimeout(() => {
      const newInbound = {
        id: inboundHistory.length + 1,
        projectName: selectedOutboundOrder.projectName,
        outboundOrderId: selectedOutboundOrder.id,
        inboundDate: values.inboundDate.format('YYYY-MM-DD'),
        operator: '当前用户',
        status: '已完成',
        items: selectedItems.map(item => ({
          type: item.type,
          name: item.name,
          quantity: item.inboundQuantity
        }))
      }

      setInboundHistory(prev => [newInbound, ...prev])
      message.success('项目入库成功')
      
      // 重置表单和选择
      form.resetFields()
      setSelectedOutboundOrder(null)
      setSelectedItems([])
    }, 1000)
  }

  // 查看入库详情
  const viewInboundDetail = (record) => {
    setCurrentInboundDetail(record)
    setDetailModalVisible(true)
  }

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '名称',
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
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '入库数量',
      dataIndex: 'inboundQuantity',
      key: 'inboundQuantity',
      render: (text, record, index) => (
        <Input.Number 
          min={1} 
          max={record.quantity} 
          defaultValue={record.quantity}
          onChange={(value) => handleInboundQuantityChange(index, value)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record, index) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeInboundItem(index)}
        >
          移除
        </Button>
      )
    }
  ]

  // 入库历史表格列
  const historyColumns = [
    {
      title: '入库单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName'
    },
    {
      title: '对应出库单号',
      dataIndex: 'outboundOrderId',
      key: 'outboundOrderId'
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      key: 'inboundDate'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
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
        <Button onClick={() => viewInboundDetail(record)}>查看详情</Button>
      )
    }
  ]

  return (
    <div className="project-inbound">
      <Card title="项目入库管理" className="mb-4">
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Form.Item 
            name="outboundOrderId" 
            label="选择出库单" 
            rules={[{ required: true, message: '请选择出库单' }]}
          >
            <Select 
              placeholder="请选择出库单"
              onChange={handleOutboundOrderSelect}
            >
              {mockOutboundHistory.map(order => (
                <Option key={order.id} value={order.id}>
                  出库单 #{order.id} - {order.projectName} ({order.outboundDate})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="inboundDate" 
            label="入库日期" 
            rules={[{ required: true, message: '请选择入库日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="remark" 
            label="备注"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          {selectedOutboundOrder && (
            <Form.Item label="入库物品">
              <Table 
                columns={inboundItemColumns} 
                dataSource={selectedItems} 
                rowKey={(record, index) => index}
                pagination={false}
              />
            </Form.Item>
          )}

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              确认入库
            </Button>
            <Button onClick={() => {
              form.resetFields()
              setSelectedOutboundOrder(null)
              setSelectedItems([])
            }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="入库历史记录" className="mt-4">
        <Table 
          columns={historyColumns} 
          dataSource={inboundHistory} 
          rowKey="id"
        />
      </Card>

      {/* 入库详情模态框 */}
      <Modal
        title="入库详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentInboundDetail && (
          <div>
            <p><strong>入库单号:</strong> {currentInboundDetail.id}</p>
            <p><strong>项目名称:</strong> {currentInboundDetail.projectName}</p>
            <p><strong>对应出库单号:</strong> {currentInboundDetail.outboundOrderId}</p>
            <p><strong>入库日期:</strong> {currentInboundDetail.inboundDate}</p>
            <p><strong>操作人:</strong> {currentInboundDetail.operator}</p>
            <p><strong>状态:</strong> {currentInboundDetail.status}</p>
            <h4 className="mt-4">入库物品</h4>
            <Table 
              columns={[
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' }
              ]} 
              dataSource={currentInboundDetail.items} 
              rowKey={(record, index) => index}
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProjectInbound