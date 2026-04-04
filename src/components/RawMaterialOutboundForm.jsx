import React, { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, message, Table, InputNumber, Space, Row, Col } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import moment from 'moment'

const { Option } = Select
const { TextArea } = Input

const RawMaterialOutboundForm = ({ outbound, onSave, onCancel, rawMaterials = [] }) => {
  const [form] = Form.useForm()
  const [selectedRawMaterials, setSelectedRawMaterials] = useState([])

  // 模拟原材料数据（实际应该从API获取）
  const mockRawMaterials = rawMaterials.length > 0 ? rawMaterials : [
    { id: 1, productName: '钢材', brand: '宝钢', specification: 'Q235 10mm', remainingQuantity: 700, unit: '吨' },
    { id: 2, productName: '铝材', brand: '中铝', specification: '6061 5mm', remainingQuantity: 300, unit: '吨' },
    { id: 3, productName: '塑料颗粒', brand: '中石化', specification: 'PP 1000', remainingQuantity: 1000, unit: '公斤' },
    { id: 4, productName: '铜材', brand: '江铜', specification: 'T2 8mm', remainingQuantity: 150, unit: '吨' },
    { id: 5, productName: '木材', brand: '东北林场', specification: '松木 2x4', remainingQuantity: 5000, unit: '根' }
  ]

  useEffect(() => {
    if (outbound) {
      form.setFieldsValue({
        orderNumber: outbound.orderNumber,
        outboundDate: outbound.outboundDate ? moment(outbound.outboundDate) : null,
        department: outbound.department,
        applicant: outbound.applicant,
        handler: outbound.handler,
        warehouseKeeper: outbound.warehouseKeeper,
        remark: outbound.remark
      })
      setSelectedRawMaterials(outbound.items || [])
    } else {
      form.resetFields()
      // 为新建出库单设置默认出库单号
      const defaultOrderNumber = `RM-OUT-${moment().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      form.setFieldsValue({ orderNumber: defaultOrderNumber })
      setSelectedRawMaterials([])
    }
  }, [outbound, form])

  const handleAddRawMaterial = () => {
    setSelectedRawMaterials([...selectedRawMaterials, { rawMaterialId: null, quantity: 1, rawMaterial: null }])
  }

  const handleRemoveRawMaterial = (index) => {
    const newItems = [...selectedRawMaterials]
    newItems.splice(index, 1)
    setSelectedRawMaterials(newItems)
  }

  const handleRawMaterialChange = (index, field, value) => {
    const newItems = [...selectedRawMaterials]
    if (field === 'rawMaterialId') {
      const selectedMaterial = mockRawMaterials.find(m => m.id === value)
      newItems[index] = {
        ...newItems[index],
        rawMaterialId: value,
        rawMaterial: selectedMaterial
      }
    } else if (field === 'quantity') {
      newItems[index] = {
        ...newItems[index],
        quantity: value
      }
    }
    setSelectedRawMaterials(newItems)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 验证是否选择了原材料
      if (selectedRawMaterials.length === 0) {
        message.error('请至少添加一种原材料')
        return
      }

      // 验证每个原材料的数量
      for (let i = 0; i < selectedRawMaterials.length; i++) {
        const item = selectedRawMaterials[i]
        if (!item.rawMaterialId) {
          message.error(`请选择第${i + 1}行的原材料`)
          return
        }
        if (!item.quantity || item.quantity <= 0) {
          message.error(`请输入第${i + 1}行的有效数量`)
          return
        }
        const selectedMaterial = mockRawMaterials.find(m => m.id === item.rawMaterialId)
        if (item.quantity > selectedMaterial.remainingQuantity) {
          message.error(`第${i + 1}行的出库数量超过了剩余库存`)
          return
        }
      }

      const outboundData = {
        id: outbound?.id,
        orderNumber: values.orderNumber, // 使用前端生成的出库单号
        outboundDate: values.outboundDate ? values.outboundDate.format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        department: values.department,
        applicant: values.applicant,
        handler: values.handler,
        warehouseKeeper: values.warehouseKeeper,
        remark: values.remark,
        items: selectedRawMaterials.map(item => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          rawMaterial: item.rawMaterial
        }))
      }

      onSave(outboundData)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const columns = [
    {
      title: '原材料',
      dataIndex: 'rawMaterial',
      key: 'rawMaterial',
      render: (_, record) => (
        <Select
          style={{ width: 300 }}
          placeholder="选择原材料"
          value={record.rawMaterialId}
          onChange={(value) => handleRawMaterialChange(record.key, 'rawMaterialId', value)}
        >
          {mockRawMaterials.map(material => (
            <Option key={material.id} value={material.id}>
              {material.productName} - {material.specification} (剩余: {material.remainingQuantity} {material.unit})
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: '型号规格',
      dataIndex: 'specification',
      key: 'specification',
      render: (_, record) => record.rawMaterial?.specification || ''
    },
    {
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          style={{ width: 100 }}
          min={1}
          max={record.rawMaterial?.remainingQuantity || 99999}
          value={record.quantity}
          onChange={(value) => handleRawMaterialChange(record.key, 'quantity', value)}
        />
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      render: (_, record) => record.rawMaterial?.unit || ''
    },
    {
      title: '库存数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      render: (_, record) => record.rawMaterial?.remainingQuantity || 0
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemoveRawMaterial(record.key)}
        >
          删除
        </Button>
      )
    }
  ]

  // 为表格数据添加key
  const tableData = selectedRawMaterials.map((item, index) => ({
    ...item,
    key: index
  }))

  return (
    <div className="raw-material-outbound-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderNumber: outbound ? outbound.orderNumber : `RM-OUT-${moment().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="orderNumber"
              label="出库单号"
              rules={[{ required: true, message: '请输入出库单号' }]}
            >
              <Input 
                placeholder="请输入出库单号" 
                disabled={true} 
              />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <h3>出库原材料</h3>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddRawMaterial}
            style={{ marginBottom: 16 }}
          >
            添加原材料
          </Button>
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            rowKey="key"
          />
        </div>

        <Row gutter={16}>
          <Col span={4}>
            <Form.Item
              name="applicant"
              label="申请人"
              rules={[{ required: true, message: '请输入申请人' }]}
            >
              <Input placeholder="请输入申请人" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="department"
              label="申请部门"
              rules={[{ required: true, message: '请输入申请部门' }]}
            >
              <Input placeholder="请输入申请部门" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="handler"
              label="经办人"
              rules={[{ required: true, message: '请输入经办人' }]}
            >
              <Input placeholder="请输入经办人" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="warehouseKeeper"
              label="库管"
              rules={[{ required: true, message: '请输入库管' }]}
            >
              <Input placeholder="请输入库管" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="outboundDate"
              label="出库日期"
              rules={[{ required: true, message: '请选择出库日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            {/* 留空，保持布局平衡 */}
          </Col>
        </Row>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={4} placeholder="请输入备注信息" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
            <Button onClick={onCancel}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default RawMaterialOutboundForm