import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, message, Row, Col, Upload, Image } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const DeviceForm = ({ device, onSave, onCancel }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (device) {
      const formattedDevice = {
        ...device,
        purchaseDate: device.purchaseDate ? dayjs(device.purchaseDate) : null
      }
      form.setFieldsValue(formattedDevice)
      setImageUrl(device.image || '')
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }, [device, form])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // 格式化日期为字符串
      const formattedValues = {
        ...values,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : ''
      }
      
      onSave(formattedValues)
    } catch (error) {
      message.error('表单验证失败，请检查输入内容')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (info) => {
    if (info.file.status === 'uploading') {
      return
    }
    if (info.file.status === 'done') {
      // 实际项目中，这里应该上传到服务器并获取URL
      // 这里使用模拟URL
      const mockUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=equipment%20device&image_size=square`
      setImageUrl(mockUrl)
      form.setFieldsValue({ image: mockUrl })
      message.success(`${info.file.name} 上传成功`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 600 }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="设备名称"
            name="name"
            rules={[
              { required: true, message: '请输入设备名称' }
            ]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="设备编号"
            name="deviceCode"
            rules={[
              { required: true, message: '请输入设备编号' }
            ]}
          >
            <Input placeholder="请输入设备编号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="品牌"
            name="brand"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="型号"
            name="model"
          >
            <Input placeholder="请输入型号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="SN码"
            name="serialNumber"
          >
            <Input placeholder="请输入SN码" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="数量"
            name="quantity"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入数量"
              min={1}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="单位"
            name="unit"
          >
            <Input placeholder="请输入单位" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="所在仓库"
            name="warehouse"
          >
            <Input placeholder="请输入所在仓库" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="所属公司"
            name="company"
          >
            <Input placeholder="请输入所属公司" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="设备状态"
            name="status"
          >
            <Select placeholder="请选择设备状态">
              <Option value="正常">正常</Option>
              <Option value="待维修">待维修</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="使用状态"
            name="useStatus"
          >
            <Select placeholder="请选择使用状态">
              <Option value="使用中">使用中</Option>
              <Option value="停用">停用</Option>
              <Option value="闲置">闲置</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="位置"
            name="location"
          >
            <Input placeholder="请输入位置" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="配件"
        name="accessories"
        rules={[
          { max: 100, message: '配件最多100个字符' }
        ]}
      >
        <Input placeholder="请输入配件，多个配件用逗号分隔" />
      </Form.Item>

      <Form.Item
        label="图片"
        name="image"
      >
        <div>
          {imageUrl && (
            <Image 
              src={imageUrl} 
              style={{ width: 100, height: 100, marginBottom: 10 }} 
            />
          )}
          <Upload
            name="file"
            listType="picture"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleImageChange}
          >
            <Button icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
        </div>
      </Form.Item>

      <Form.Item
        label="描述"
        name="description"
        rules={[
          { max: 200, message: '描述最多200个字符' }
        ]}
      >
        <TextArea rows={4} placeholder="请输入设备描述" />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="购买日期"
            name="purchaseDate"
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择购买日期" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="购买价格"
            name="purchasePrice"
            rules={[
              { type: 'number', min: 0, message: '价格必须大于等于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入购买价格"
              min={0}
              precision={2}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space style={{ float: 'right' }}>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            保存
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default DeviceForm