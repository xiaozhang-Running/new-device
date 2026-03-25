import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, DatePicker, Select, Table, Button, message, Card, Space, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

const RawMaterialInboundForm = ({ onSave, onCancel, rawMaterials = [] }) => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [itemForm] = Form.useForm()

  useEffect(() => {
    form.resetFields()
    setItems([])
  }, [])

  const handleSubmit = async (values) => {
    if (items.length === 0) {
      message.error('请添加至少一个入库项目')
      return
    }

    const inboundData = {
      ...values,
      inboundDate: values.inboundDate.format('YYYY-MM-DD'),
      rawMaterialInboundItems: items.map(item => ({
        rawMaterialId: item.rawMaterialId,
        quantity: item.quantity,
        specification: item.specification,
        remark: item.remark
      }))
    }

    onSave(inboundData)
  }

  const handleAddItem = () => {
    setEditingItem({ id: Date.now(), rawMaterialId: '', quantity: 1, specification: '', remark: '' })
  }

  const handleEditItem = (item) => {
    setEditingItem({ ...item })
  }

  const handleSaveItem = () => {
    itemForm.validateFields().then(values => {
      if (editingItem.id) {
        setItems(items.map(item => 
          item.id === editingItem.id ? { ...item, ...values } : item
        ))
      } else {
        setItems([...items, { ...editingItem, ...values }])
      }
      setEditingItem(null)
      itemForm.resetFields()
    })
  }

  const handleCancelItem = () => {
    setEditingItem(null)
    itemForm.resetFields()
  }

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const columns = [
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
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditItem(record)}
            size="small"
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card title="原材料入库" style={{ marginBottom: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="inboundNumber"
            label="入库单号"
            rules={[{ required: true, message: '请输入入库单号' }]}
          >
            <Input placeholder="请输入入库单号" />
          </Form.Item>

          <Form.Item
            name="inboundDate"
            label="入库日期"
            rules={[{ required: true, message: '请选择入库日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="deliveryPerson"
            label="送货人"
          >
            <Input placeholder="请输入送货人" />
          </Form.Item>

          <Form.Item
            name="company"
            label="公司"
          >
            <Input placeholder="请输入公司" />
          </Form.Item>

          <Form.Item
            name="supplier"
            label="供应商"
          >
            <Input placeholder="请输入供应商" />
          </Form.Item>

          <Form.Item
            name="operator"
            label="操作人"
            rules={[{ required: true, message: '请输入操作人' }]}
          >
            <Input placeholder="请输入操作人" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="待处理"
          >
            <Select>
              <Option value="待处理">待处理</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>

          <Card title="入库项目" style={{ margin: '20px 0' }}>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              onClick={handleAddItem}
              style={{ marginBottom: 16 }}
            >
              添加入库项目
            </Button>
            
            {editingItem && (
              <Card style={{ marginBottom: 16 }}>
                <Form
                  form={itemForm}
                  layout="vertical"
                  initialValues={editingItem}
                >
                  <Form.Item
                    name="rawMaterialId"
                    label="原材料"
                    rules={[{ required: true, message: '请选择原材料' }]}
                  >
                    <Select placeholder="请选择原材料">
                      {rawMaterials.map(material => (
                        <Option key={material.id} value={material.id}>
                          {material.productName} ({material.specification})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="quantity"
                    label="数量"
                    rules={[{ required: true, message: '请输入数量' }, { type: 'number', min: 1 }]}
                  >
                    <InputNumber style={{ width: '100%' }} placeholder="请输入数量" />
                  </Form.Item>

                  <Form.Item
                    name="specification"
                    label="规格"
                  >
                    <Input placeholder="请输入规格" />
                  </Form.Item>

                  <Form.Item
                    name="remark"
                    label="备注"
                  >
                    <Input placeholder="请输入备注" />
                  </Form.Item>

                  <Space>
                    <Button 
                      type="primary" 
                      icon={<CheckOutlined />} 
                      onClick={handleSaveItem}
                    >
                      保存
                    </Button>
                    <Button 
                      icon={<CloseOutlined />} 
                      onClick={handleCancelItem}
                    >
                      取消
                    </Button>
                  </Space>
                </Form>
              </Card>
            )}

            <Table 
              columns={columns} 
              dataSource={items} 
              rowKey="id"
              pagination={false}
            />
          </Card>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交入库
              </Button>
              <Button onClick={onCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default RawMaterialInboundForm