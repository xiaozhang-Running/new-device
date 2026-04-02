import React, { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, message, Button, Row, Col } from 'antd'
import { warehouseApi, companyApi, imageApi } from '../services/api'
import ImageUpload from './ImageUpload'

const { Option } = Select

const ConsumableForm = ({ consumable, onSave, onCancel }) => {
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
      // 重置图片数组，确保ImageUpload组件重新加载耗材的图片
      setImages([])
    } else {
      form.resetFields()
      setImages([])
    }
  }, [consumable, form])

  const handleSubmit = (values) => {
    // 计算数量相关字段
    let usedQuantity, remainingQuantity, totalQuantity, originalQuantity, status;
    
    if (consumable && consumable.id) {
      // 编辑模式：使用原始值作为默认值
      usedQuantity = values.usedQuantity !== undefined ? values.usedQuantity : consumable.usedQuantity || 0
      remainingQuantity = values.remainingQuantity !== undefined ? values.remainingQuantity : consumable.remainingQuantity || 0
      originalQuantity = values.originalQuantity !== undefined ? values.originalQuantity : consumable.originalQuantity || 0
      totalQuantity = values.totalQuantity !== undefined ? values.totalQuantity : (remainingQuantity + usedQuantity)
    } else {
      // 新增模式：使用表单值或默认值
      usedQuantity = values.usedQuantity || 0
      remainingQuantity = values.remainingQuantity || 0
      totalQuantity = remainingQuantity + usedQuantity
      originalQuantity = values.originalQuantity || totalQuantity
    }
    
    // 根据剩余数量设置状态
    status = '正常'
    if (remainingQuantity <= 0) {
      status = '无货'
    } else if (remainingQuantity < 10) {
      status = '短缺'
    }

    // 构建要提交的数据对象
    const consumableData = {
      totalQuantity,
      usedQuantity,
      originalQuantity,
      remainingQuantity,
      status,
      images: images, // 添加图片数组
      updatedAt: new Date().toISOString().split('T')[0]
    }

    // 只添加用户修改过的字段
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null) {
        consumableData[key] = values[key]
      }
    })

    // 如果是编辑模式，添加id属性
    if (consumable && consumable.id) {
      consumableData.id = consumable.id
    }

    onSave(consumableData)
  }



  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="name"
            label="耗材名称"
            rules={[{ required: true, message: '请输入耗材名称' }]}
          >
            <Input placeholder="请输入耗材名称" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="brand"
            label="品牌"
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="modelSpecification"
            label="型号规格"
          >
            <Input placeholder="请输入型号规格" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="totalQuantity"
            label="总数量"
            rules={[{ type: 'number', min: 0 }]}
          >
            <InputNumber placeholder="请输入总数量" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="originalQuantity"
            label="原始数量"
            rules={[{ type: 'number', min: 0 }]}
          >
            <InputNumber placeholder="请输入原始数量" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="usedQuantity"
            label="已用数量"
            rules={[{ type: 'number', min: 0 }]}
          >
            <InputNumber placeholder="请输入已用数量" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
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
        </Col>
        <Col span={8}>
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
        </Col>
        <Col span={8}>
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
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
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
        </Col>
        <Col span={24}>
          <Form.Item
            label="图片"
          >
            <ImageUpload 
              entityId={consumable?.id || 0} 
              entityType={3} // 3表示耗材
              type="equipment"
              onImagesUpdated={setImages}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
              保存
            </Button>
            <Button onClick={onCancel}>
              取消
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default ConsumableForm
