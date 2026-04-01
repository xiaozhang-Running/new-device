import React, { useState, useEffect } from 'react'
import { Form, Select, Input, DatePicker, Button, message, Card, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { get, post } from '../services/request'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

const ScrapEquipmentForm = ({ onSuccess }) => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      // 获取专用设备
      const specialDevices = await get('/Device/special-equipments')
      
      // 获取通用设备
      const generalDevices = await get('/Device/general-equipments')
      
      // 合并设备列表
      const allDevices = [
        ...specialDevices.map(d => ({ ...d, type: '专用设备' })),
        ...generalDevices.map(d => ({ ...d, type: '通用设备' }))
      ]
      
      setDevices(allDevices)
    } catch (err) {
      message.error('获取设备列表失败')
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      
      await post('/Device/scrap-equipments', {
        equipmentId: values.deviceId,
        scrapReason: values.scrapReason,
        scrapDate: values.scrapDate.format('YYYY-MM-DDTHH:mm:ss')
      })

      message.success('报废申请提交成功！')
      form.resetFields()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      message.error('提交失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="scrap-equipment-form">
      <div className="page-header">
        <h2>设备报废申请</h2>
      </div>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            scrapDate: dayjs()
          }}
        >
          <Form.Item
            name="deviceId"
            label="选择设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select
              placeholder="请选择设备"
              style={{ width: '100%' }}
              loading={loading && devices.length === 0}
            >
              {devices.map((device) => (
                <Option key={device.id} value={device.id}>
                  {device.name} ({device.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="scrapReason"
            label="报废原因"
            rules={[{ required: true, message: '请输入报废原因' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入详细的报废原因"
            />
          </Form.Item>
          
          <Form.Item
            name="scrapDate"
            label="报废日期"
            rules={[{ required: true, message: '请选择报废日期' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<PlusOutlined />}
              >
                提交报废申请
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ScrapEquipmentForm