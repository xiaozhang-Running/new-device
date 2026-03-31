import { useState, useEffect } from 'react'
import { Form, Input, Button, message, Card, Space, Table, Modal, Popconfirm, Spin } from 'antd'
import { companyApi } from '../services/api'

function CompanySettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [companies, setCompanies] = useState([])
  const [fetchLoading, setFetchLoading] = useState(true)

  // 初始化加载公司数据
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setFetchLoading(true)
    try {
      const data = await companyApi.getCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('获取公司列表失败:', error)
      message.error('获取公司列表失败')
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
        // 编辑现有公司
        await companyApi.updateCompany(editingRecord.id, values)
        message.success('公司编辑成功')
      } else {
        // 添加新公司
        await companyApi.createCompany(values)
        message.success('公司添加成功')
      }
      setModalVisible(false)
      form.resetFields()
      // 重新加载公司列表
      await fetchCompanies()
    } catch (error) {
      console.error('操作失败:', error)
      message.error('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await companyApi.deleteCompany(id)
      message.success('公司删除成功')
      // 重新加载公司列表
      await fetchCompanies()
    } catch (error) {
      console.error('删除公司失败:', error)
      message.error('删除公司失败，请重试')
    }
  }

  const columns = [
    { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '公司地址', dataIndex: 'companyAddress', key: 'companyAddress' },
    { title: '联系电话', dataIndex: 'companyPhone', key: 'companyPhone' },
    { title: '电子邮箱', dataIndex: 'companyEmail', key: 'companyEmail' },
    { title: '营业执照号', dataIndex: 'businessLicense', key: 'businessLicense' },
    { title: '税务登记号', dataIndex: 'taxNumber', key: 'taxNumber' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => showModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此公司吗？"
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
        <h2>公司管理</h2>
        <Button type="primary" onClick={() => showModal()}>
          添加公司
        </Button>
      </div>
      <Card>
        {fetchLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table columns={columns} dataSource={companies} rowKey="id" />
        )}
      </Card>

      <Modal
        title={editingRecord ? "编辑公司" : "添加公司"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="companyName"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>

          <Form.Item
            name="companyAddress"
            label="公司地址"
          >
            <Input placeholder="请输入公司地址" />
          </Form.Item>

          <Form.Item
            name="companyPhone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="companyEmail"
            label="电子邮箱"
          >
            <Input placeholder="请输入电子邮箱" />
          </Form.Item>

          <Form.Item
            name="businessLicense"
            label="营业执照号"
          >
            <Input placeholder="请输入营业执照号" />
          </Form.Item>

          <Form.Item
            name="taxNumber"
            label="税务登记号"
          >
            <Input placeholder="请输入税务登记号" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? "保存修改" : "添加公司"}
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

export default CompanySettings