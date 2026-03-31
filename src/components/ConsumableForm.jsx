import React, { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Upload, message, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { warehouseApi, companyApi, imageApi } from '../services/api'

const { Option } = Select

const ConsumableForm = ({ consumable, onSave, onCancel }) => {
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')
  const [warehouses, setWarehouses] = useState([])
  const [companies, setCompanies] = useState([])
  const [fetchingData, setFetchingData] = useState(false)

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
    if (consumable) {
      form.setFieldsValue(consumable)
      setImageUrl(consumable.image || '')
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }, [consumable, form])

  const handleSubmit = (values) => {
    // 计算总数量，设置默认值
    const usedQuantity = values.usedQuantity || 0
    const remainingQuantity = values.remainingQuantity || 0
    const totalQuantity = remainingQuantity + usedQuantity
    const originalQuantity = values.originalQuantity || totalQuantity
    
    // 根据剩余数量设置状态
    let status = '正常'
    if (remainingQuantity <= 0) {
      status = '无货'
    } else if (remainingQuantity < 10) {
      status = '短缺'
    }

    const consumableData = {
      ...values,
      totalQuantity,
      usedQuantity,
      originalQuantity,
      remainingQuantity,
      status,
      image: imageUrl,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onSave(consumableData)
  }

  const handleUpload = async (info) => {
    if (info.file.status === 'done') {
      try {
        // 创建FormData对象
        const formData = new FormData()
        formData.append('file', info.file.originFileObj)
        
        // 临时使用0作为设备ID，后续会在保存设备时更新
        const equipmentId = consumable?.id || 0
        const equipmentType = 2 // 2表示通用设备（暂时使用，后续可能需要为耗材添加专门的类型）
        
        // 调用后端API上传图片
        const imagePaths = await imageApi.uploadEquipmentImage(equipmentId, equipmentType, formData)
        
        if (imagePaths && imagePaths.length > 0) {
          const imageUrl = imagePaths[0]
          setImageUrl(imageUrl)
          message.success(`${info.file.name} 上传成功`)
        } else {
          message.error('图片上传失败：未返回图片路径')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        message.error(`${info.file.name} 上传失败: ${error.message || '未知错误'}`)
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="耗材名称"
        rules={[{ required: true, message: '请输入耗材名称' }]}
      >
        <Input placeholder="请输入耗材名称" />
      </Form.Item>

      <Form.Item
        name="brand"
        label="品牌"
      >
        <Input placeholder="请输入品牌" />
      </Form.Item>

      <Form.Item
        name="modelSpecification"
        label="型号规格"
      >
        <Input placeholder="请输入型号规格" />
      </Form.Item>

      <Form.Item
        name="totalQuantity"
        label="总数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入总数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="originalQuantity"
        label="原始数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入原始数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="usedQuantity"
        label="已用数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入已用数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="unit"
        label="单位"
      >
        <Select placeholder="请选择单位">
          <Option value="个">个</Option>
          <Option value="包">包</Option>
          <Option value="箱">箱</Option>
          <Option value="套">套</Option>
          <Option value="件">件</Option>
          <Option value="瓶">瓶</Option>
          <Option value="盒">盒</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="company"
        label="所属公司"
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

      <Form.Item
        name="status"
        label="状态"
      >
        <Select placeholder="请选择状态">
          <Option value="正常">正常</Option>
          <Option value="短缺">短缺</Option>
          <Option value="无货">无货</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="accessories"
        label="配件"
      >
        <Input placeholder="请输入配件" />
      </Form.Item>

      <Form.Item
        name="remark"
        label="备注"
      >
        <Input.TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>

      <Form.Item
        name="location"
        label="所在仓库"
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

      <Form.Item
        name="image"
        label="图片"
      >
        <Upload
          name="file"
          beforeUpload={() => false}
          onChange={handleUpload}
          listType="picture"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        {imageUrl && (
          <div style={{ marginTop: 10 }}>
            <img src={imageUrl} alt="耗材图片" style={{ width: 100, height: 100, objectFit: 'cover' }} />
          </div>
        )}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
          保存
        </Button>
        <Button onClick={onCancel}>
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ConsumableForm
