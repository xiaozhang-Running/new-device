import React, { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Upload, message, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { warehouseApi, companyApi } from '../services/api'

const { Option } = Select

const RawMaterialForm = ({ rawMaterial, onSave, onCancel }) => {
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
    if (rawMaterial) {
      form.setFieldsValue(rawMaterial)
      setImageUrl(rawMaterial.image || '')
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }, [rawMaterial, form])

  const handleSubmit = (values) => {
    // 计算剩余数量
    const totalQuantity = values.totalQuantity || 0
    const usedQuantity = values.usedQuantity || 0
    const remainingQuantity = totalQuantity - usedQuantity

    const rawMaterialData = {
      ...values,
      remainingQuantity,
      image: imageUrl,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onSave(rawMaterialData)
  }

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      // 模拟上传成功，实际项目中应该调用真实的上传接口
      setImageUrl(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=raw%20material%20item&image_size=square`)
      message.success(`${info.file.name} 上传成功`)
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
        name="productName"
        label="原材料名称"
        rules={[{ required: true, message: '请输入原材料名称' }]}
      >
        <Input placeholder="请输入原材料名称" />
      </Form.Item>

      <Form.Item
        name="brand"
        label="品牌"
      >
        <Input placeholder="请输入品牌" />
      </Form.Item>

      <Form.Item
        name="specification"
        label="规格"
      >
        <Input placeholder="请输入规格" />
      </Form.Item>

      <Form.Item
        name="totalQuantity"
        label="总数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入总数量" style={{ width: '100%' }} />
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
        <Input placeholder="请输入单位" />
      </Form.Item>

      <Form.Item
        name="supplier"
        label="供应商"
      >
        <Input placeholder="请输入供应商" />
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
        name="remark"
        label="备注"
      >
        <Input.TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>

      <Form.Item
        name="image"
        label="图片"
      >
        <Upload
          name="file"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          onChange={handleUpload}
          listType="picture"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        {imageUrl && (
          <div style={{ marginTop: 10 }}>
            <img src={imageUrl} alt="原材料图片" style={{ width: 100, height: 100, objectFit: 'cover' }} />
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

export default RawMaterialForm
