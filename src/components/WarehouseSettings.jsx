import { useState, useEffect } from 'react'
import { Form, Input, Select, Button, message, Card, Space, Table, Modal, Popconfirm, Spin } from 'antd'
import { warehouseApi } from '../services/api'

const { Option } = Select

function WarehouseSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)

  // 初始化加载仓库数据
  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    setFetchLoading(true)
    try {
      const data = await warehouseApi.getWarehouses()
      setWarehouses(data)
    } catch (error) {
      console.error('获取仓库列表失败:', error)
      message.error('获取仓库列表失败')
    } finally {
      setFetchLoading(false)
    }
  }

  const showModal = (record = null) => {
    if (record) {
      setEditingRecord(record)
      form.setFieldsValue(record)
    } else {
      setEditingRecord(null)
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setEditingRecord(null)
    form.resetFields()
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      if (editingRecord) {
        // 编辑现有仓库
        await warehouseApi.updateWarehouse(editingRecord.id, values)
        message.success('仓库编辑成功')
      } else {
        // 添加新仓库
        await warehouseApi.createWarehouse(values)
        message.success('仓库添加成功')
      }
      setModalVisible(false)
      form.resetFields()
      // 重新加载仓库列表
      await fetchWarehouses()
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await warehouseApi.deleteWarehouse(id)
      message.success('仓库删除成功')
      // 重新加载仓库列表
      await fetchWarehouses()
    } catch (error) {
      console.error('删除仓库失败:', error)
      message.error('删除仓库失败，请重试')
    }
  }

  const columns = [
    { title: '仓库名称', dataIndex: 'warehouseName', key: 'warehouseName' },
    { title: '仓库位置', dataIndex: 'location', key: 'location' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
    { title: '仓库容量', dataIndex: 'capacity', key: 'capacity' },
    { title: '仓库状态', dataIndex: 'status', key: 'status' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => showModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此仓库吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="page-content">
      <div className="flex justify-between items-center mb-4">
        <h2>仓库管理</h2>
        <Button type="primary" onClick={() => showModal()}>
          添加仓库
        </Button>
      </div>
      <Card>
        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table columns={columns} dataSource={warehouses} rowKey="id" />
        )}
      </Card>

      <Modal
        title={editingRecord ? "编辑仓库" : "添加仓库"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: '正常'
          }}
        >
          <Form.Item
            name="warehouseName"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input placeholder="请输入仓库名称" />
          </Form.Item>

          <Form.Item
            name="location"
            label="仓库位置"
          >
            <Input placeholder="请输入仓库位置" />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="仓库容量"
          >
            <Input type="number" placeholder="请输入仓库容量" />
          </Form.Item>

          <Form.Item
            name="status"
            label="仓库状态"
          >
            <Select placeholder="请选择仓库状态">
              <Option value="正常">正常</Option>
              <Option value="维护中">维护中</Option>
              <Option value="停用">停用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? "保存修改" : "添加仓库"}
              </Button>
              <Button onClick={handleCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WarehouseSettings