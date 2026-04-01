import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Button, Space, message, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { deviceApi, warehouseApi, companyApi, imageApi } from '../services/api'
import { post } from '../services/request'
import ImageUpload from './ImageUpload'

const { Option } = Select
const { TextArea } = Input

const DeviceForm = ({ device, onSave, onCancel, deviceType = 'special' }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [companies, setCompanies] = useState([])
  const [fetchingData, setFetchingData] = useState(false)
  const [originalStatus, setOriginalStatus] = useState('')
  const [images, setImages] = useState([])

  // 获取仓库和公司列表
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true)
      try {
        const [warehouseList, companyList] = await Promise.all([
          warehouseApi.getWarehouses(),
          companyApi.getCompanies()
        ])
        setWarehouses(warehouseList || [])
        setCompanies(companyList || [])
      } catch (error) {
        console.error('获取仓库或公司列表失败:', error)
        message.error('获取仓库或公司列表失败')
      } finally {
        setFetchingData(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (device) {
      const formattedDevice = {
        ...device,
        purchaseDate: device.purchaseDate ? dayjs(device.purchaseDate) : null
      }
      form.setFieldsValue(formattedDevice)
      setOriginalStatus(device.status || '')
      // 重置图片数组，确保ImageUpload组件重新加载设备的图片
      setImages([])
    } else {
      form.resetFields()
      setOriginalStatus('')
      setImages([])
    }
  }, [device, form])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // 格式化日期为字符串
      const formattedValues = {
        ...values,
        quantity: values.quantity || 1,
        images: images // 添加图片数组
      }
      
      // 如果是编辑现有设备，添加id
      if (device && device.id) {
        formattedValues.id = device.id
        
        // 检查设备状态是否从非"待维修"变更为"待维修"
        if (originalStatus !== '待维修' && values.status === '待维修') {
          // 创建维修记录
          try {
            const response = await post('/Repair/CreateFromDevice', {
              deviceType: deviceType, // 使用传入的设备类型
              equipmentId: device.id,
              faultDescription: '设备状态变更为待维修',
              repairPerson: '系统自动',
              remark: '设备状态变更时自动创建'
            })
            message.success('维修记录创建成功')
          } catch (error) {
            console.error('创建维修记录失败:', error)
            message.error('网络错误，创建维修记录失败')
          }
        }
      }
      
      onSave(formattedValues)
    } catch (error) {
      message.error('表单验证失败，请检查输入内容')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 900 }}
    >
      <Row gutter={16}>
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item
            label="设备编号"
            name="deviceCode"
            rules={[
              { required: true, message: '请输入设备编号' },
              {
                validator: async (_, value) => {
                  if (value) {
                    try {
                      // 这里应该调用API检查设备编号是否存在
                      // 由于我们没有专门的API，这里暂时跳过
                      // 实际项目中应该添加一个检查设备编号唯一性的API
                    } catch (error) {
                      console.error('检查设备编号失败:', error)
                    }
                  }
                }
              }
            ]}
          >
            <Input placeholder="请输入设备编号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="品牌"
            name="brand"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="型号"
            name="model"
          >
            <Input placeholder="请输入型号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="SN码"
            name="serialNumber"
          >
            <Input placeholder="请输入SN码" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="数量"
            name="quantity"
            initialValue={1}
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
        <Col span={8}>
          <Form.Item
            label="单位"
            name="unit"
          >
            <Input placeholder="请输入单位" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="所在仓库"
            name="warehouse"
          >
            <Select 
              placeholder="请选择仓库"
              loading={fetchingData}
              allowClear
            >
              {warehouses.map(warehouse => (
                <Option key={warehouse.id} value={warehouse.warehouseName || warehouse.WarehouseName || warehouse.name}>
                  {warehouse.warehouseName || warehouse.WarehouseName || warehouse.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="所属公司"
            name="company"
          >
            <Select 
              placeholder="请选择公司"
              loading={fetchingData}
              allowClear
            >
              {companies.map(company => (
                <Option key={company.id} value={company.companyName || company.CompanyName || company.name}>
                  {company.companyName || company.CompanyName || company.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item
            label="使用状态"
            name="useStatus"
          >
            <Select placeholder="请选择使用状态">
              <Option value="使用中">使用中</Option>
              <Option value="未使用">未使用</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="配件"
            name="accessories"
            rules={[
              { max: 100, message: '配件最多100个字符' }
            ]}
          >
            <Input placeholder="请输入配件，多个配件用逗号分隔" />
          </Form.Item>
        </Col>
      </Row>



      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="图片"
          >
            <ImageUpload 
              entityId={device?.id || 0} 
              entityType={deviceType === 'special' ? 1 : 2} 
              type="equipment"
              onImagesUpdated={setImages}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="描述"
            name="description"
            rules={[
              { max: 200, message: '描述最多200个字符' }
            ]}
          >
            <TextArea rows={4} placeholder="请输入设备描述" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
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
        </Col>
      </Row>
    </Form>
  )
}

export default DeviceForm
