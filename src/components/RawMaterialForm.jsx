import React, { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, message, Button } from 'antd'
import request from '../services/request'
import ImageUpload from './ImageUpload'

const { Option } = Select

const RawMaterialForm = ({ rawMaterial, onSave, onCancel }) => {
  const [form] = Form.useForm()
  const [warehouses, setWarehouses] = useState([])
  const [companies, setCompanies] = useState([])
  const [fetchingData, setFetchingData] = useState(false)
  const [images, setImages] = useState([])

  // 获取仓库和公司列表
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true)
      try {
        const [warehouseList, companyList] = await Promise.all([
          request.get('/Warehouse'),
          request.get('/Company')
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
      // 字段映射：前端字段 -> 表单字段（后端API字段）
      const formValues = {
        id: rawMaterial.id,
        productName: rawMaterial.name || rawMaterial.productName,
        brand: rawMaterial.brand,
        specification: rawMaterial.modelSpecification || rawMaterial.specification,
        totalQuantity: rawMaterial.totalQuantity,
        usedQuantity: rawMaterial.usedQuantity,
        unit: rawMaterial.unit,
        supplier: rawMaterial.supplier,
        location: rawMaterial.location,
        company: rawMaterial.company,
        remark: rawMaterial.remark
      }
      form.setFieldsValue(formValues)
      // 重置图片数组，确保ImageUpload组件重新加载原材料的图片
      setImages([])
    } else {
      form.resetFields()
      setImages([])
    }
  }, [rawMaterial, form])

  const handleSubmit = (values) => {
    // 计算剩余数量
    const totalQuantity = values.totalQuantity || 0
    const usedQuantity = values.usedQuantity || 0
    const remainingQuantity = totalQuantity - usedQuantity

    // 字段映射：表单字段（后端API字段） -> 前端字段
    const rawMaterialData = {
      id: values.id || rawMaterial?.id,
      productName: values.productName,
      brand: values.brand,
      specification: values.specification,
      totalQuantity: totalQuantity,
      usedQuantity: usedQuantity,
      remainingQuantity: remainingQuantity,
      unit: values.unit,
      supplier: values.supplier,
      location: values.location,
      company: values.company,
      remark: values.remark,
      images: images, // 添加图片数组
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onSave(rawMaterialData)
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
        label="图片"
      >
        <ImageUpload 
          entityId={rawMaterial?.id || 0} 
          entityType={4} // 4表示原材料
          type="equipment"
          onImagesUpdated={setImages}
        />
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
