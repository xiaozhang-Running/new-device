import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, DatePicker, Select, Table, Button, message, Card, Space, Popconfirm, Row, Col, Modal, Checkbox } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined, CopyOutlined, ImportOutlined } from '@ant-design/icons'

const { Option } = Select
const { TextArea } = Input

const RawMaterialInboundForm = ({ onSave, onCancel, rawMaterials = [] }) => {
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [isBatchAddModalVisible, setIsBatchAddModalVisible] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [batchQuantity, setBatchQuantity] = useState(1)
  const [batchSpecification, setBatchSpecification] = useState('')
  const [batchRemark, setBatchRemark] = useState('')
  
  // 原材料表单状态
  const [materialForm, setMaterialForm] = useState({
    rawMaterialId: '',
    quantity: 1,
    specification: '',
    remark: '',
    unit: ''
  })
  
  // 库存数量
  const [inventoryQuantity, setInventoryQuantity] = useState(0)
  
  // 操作类型：existing（已有原材料）或 new（新原材料）
  const [materialType, setMaterialType] = useState('existing')
  
  // 新原材料名称
  const [newMaterialName, setNewMaterialName] = useState('')

  useEffect(() => {
    // 自动生成入库单号：RM-IN-年月日-时分秒
    const generateInboundNumber = () => {
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
      const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '')
      return `RM-IN-${dateStr}-${timeStr}`
    }

    form.resetFields()
    form.setFieldsValue({
      inboundNumber: generateInboundNumber()
    })
    setItems([])
  }, [])

  const handleSubmit = (values) => {
    if (items.length === 0) {
      message.error('请添加至少一个入库项目')
      return
    }

    const inboundData = {
      ...values,
      inboundDate: values.inboundDate.format('YYYY-MM-DD'),
      rawMaterialInboundItems: items.map(item => ({
        rawMaterialId: item.rawMaterialId,
        quantity: item.quantity,
        specification: item.specification,
        remark: item.remark
      }))
    }

    // 生成入库记录，不直接更新到仓库
    message.loading('正在生成入库记录...')
    setTimeout(() => {
      onSave(inboundData)
      message.success('入库记录生成成功，请在入库记录中点击确认入库按钮更新到仓库')
    }, 1000)
  }

  const handleAddItem = () => {
    setEditingItem({ id: Date.now(), rawMaterialId: '', quantity: 1, specification: '', remark: '' })
  }

  const handleEditItem = (item) => {
    setEditingItem({ ...item })
  }

  const handleSaveItem = () => {
    let itemData = { ...editingItem }
    
    // 处理新原材料的情况
    if (editingItem.rawMaterialId === 'new') {
      const newRawMaterialName = editingItem.newRawMaterialName
      if (!newRawMaterialName) {
        message.error('请输入新原材料名称')
        return
      }
      // 生成临时ID，实际后端会分配真实ID
      itemData.rawMaterialId = `new-${Date.now()}`
      itemData.productName = newRawMaterialName
    }
    
    if (editingItem.id) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, ...itemData } : item
      ))
    } else {
      setItems([...items, itemData])
    }
    setEditingItem(null)
  }

  // 处理原材料选择变化，自动填充规格
  const handleRawMaterialChange = (value) => {
    if (value) {
      const selectedMaterial = rawMaterials.find(m => m.id === value)
      if (selectedMaterial && editingItem) {
        setEditingItem(prev => ({
          ...prev,
          specification: selectedMaterial.specification
        }))
      }
    }
  }

  const handleCancelItem = () => {
    setEditingItem(null)
  }

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  // 当rawMaterials更新时，更新当前选择的原材料的库存数量
  useEffect(() => {
    if (materialForm.rawMaterialId) {
      const selectedMaterial = rawMaterials.find(m => m.id === materialForm.rawMaterialId)
      if (selectedMaterial) {
        setInventoryQuantity(selectedMaterial.remainingQuantity || 0)
      }
    }
  }, [rawMaterials, materialForm.rawMaterialId])

  // 处理原材料表单变更
  const handleMaterialFormChange = (field, value) => {
    if (field === 'rawMaterialId') {
      // 当选择原材料时，自动填充规格、单位和库存数量
      const selectedMaterial = rawMaterials.find(m => m.id === value)
      if (selectedMaterial) {
        setMaterialForm(prev => ({
          ...prev,
          rawMaterialId: value,
          specification: selectedMaterial.modelSpecification || selectedMaterial.specification || '',
          unit: selectedMaterial.unit || ''
        }))
        // 设置库存数量（剩余数量）
        setInventoryQuantity(selectedMaterial.remainingQuantity || 0)
      } else {
        setMaterialForm(prev => ({ ...prev, rawMaterialId: value }))
        setInventoryQuantity(0)
      }
    } else {
      setMaterialForm(prev => ({ ...prev, [field]: value }))
    }
  }

  // 添加入库项目
  const addInboundItem = () => {
    if (materialType === 'existing') {
      // 已有原材料
      if (!materialForm.rawMaterialId) {
        message.error('请选择原材料')
        return
      }
      if (!materialForm.quantity || materialForm.quantity <= 0) {
        message.error('请输入有效的数量')
        return
      }

      const selectedMaterial = rawMaterials.find(m => m.id === materialForm.rawMaterialId)
      const newItem = {
        id: Date.now(),
        rawMaterialId: materialForm.rawMaterialId,
        quantity: materialForm.quantity,
        specification: materialForm.specification || selectedMaterial?.modelSpecification || selectedMaterial?.specification || '',
        remark: materialForm.remark,
        unit: materialForm.unit,
        productName: selectedMaterial?.name || selectedMaterial?.productName || ''
      }
      setItems([...items, newItem])
    } else {
      // 新原材料
      if (!newMaterialName) {
        message.error('请输入新原材料名称')
        return
      }
      if (!materialForm.quantity || materialForm.quantity <= 0) {
        message.error('请输入有效的数量')
        return
      }

      const newItem = {
        id: Date.now(),
        rawMaterialId: 0, // 使用0表示新原材料
        quantity: materialForm.quantity,
        specification: materialForm.specification,
        remark: materialForm.remark,
        unit: materialForm.unit,
        productName: newMaterialName
      }
      setItems([...items, newItem])
    }

    // 重置表单
    setMaterialForm({
      rawMaterialId: '',
      quantity: 1,
      specification: '',
      remark: '',
      unit: ''
    })
    setNewMaterialName('')
    setMaterialType('existing')
  }

  // 批量添加相关方法
  const handleOpenBatchAddModal = () => {
    setSelectedMaterials([])
    setBatchQuantity(1)
    setBatchSpecification('')
    setBatchRemark('')
    setIsBatchAddModalVisible(true)
  }

  const handleMaterialSelect = (materialId) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId)
      } else {
        return [...prev, materialId]
      }
    })
  }

  const handleBatchAdd = () => {
    if (selectedMaterials.length === 0) {
      message.error('请至少选择一个原材料')
      return
    }

    const newItems = selectedMaterials.map(materialId => {
      const material = rawMaterials.find(m => m.id === materialId)
      return {
        id: Date.now() + Math.random(),
        rawMaterialId: materialId,
        quantity: batchQuantity,
        specification: batchSpecification || material?.specification || '',
        remark: batchRemark
      }
    })

    setItems([...items, ...newItems])
    setIsBatchAddModalVisible(false)
    message.success(`成功添加 ${selectedMaterials.length} 个原材料项目`)
  }

  const handleCancelBatchAdd = () => {
    setIsBatchAddModalVisible(false)
  }

  const columns = [
    {
      title: '原材料',
      dataIndex: 'rawMaterialId',
      key: 'rawMaterialId',
      render: (value, record) => {
        // 处理新创建的原材料
        if (value === 0 || (value && value.toString().startsWith('new-'))) {
          return record.productName || ''
        }
        const material = rawMaterials.find(m => m.id === value)
        return material ? (material.name || material.productName) : ''
      }
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      render: (value, record) => {
        if (value) {
          return value
        }
        const material = rawMaterials.find(m => m.id === record.rawMaterialId)
        return material ? (material.modelSpecification || material.specification) : ''
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEditItem(record)}
            size="small"
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
            />
          </Popconfirm>
        </Space>
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    }
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card title="原材料入库" style={{ marginBottom: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="inboundNumber"
                label="入库单号"
                rules={[{ required: true, message: '请输入入库单号' }]}
              >
                <Input placeholder="请输入入库单号" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                initialValue="待处理"
              >
                <Select>
                  <Option value="待处理">待处理</Option>
                  <Option value="已完成">已完成</Option>
                  <Option value="已取消">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Card title="入库项目" style={{ margin: '20px 0' }}>
            <Card title="原材料信息" variant="outlined" style={{ marginBottom: 16 }}>
              {/* 操作类型选择 */}
              <Row gutter={[16, 16]} className="mb-4">
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="操作类型">
                    <Select 
                      value={materialType}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        setMaterialType(value);
                        // 当切换到新原材料时，重置库存数量为0
                        if (value === 'new') {
                          setInventoryQuantity(0);
                        }
                      }}
                    >
                      <Option value="existing">已有原材料</Option>
                      <Option value="new">新原材料</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              {/* 原材料信息字段 */}
              <Row gutter={[16, 16]}>
                {/* 已有原材料选择 */}
                {materialType === 'existing' && (
                  <>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="原材料名称">
                        <Select 
                          showSearch
                          allowClear
                          value={materialForm.rawMaterialId || undefined}
                          style={{ width: '100%' }}
                          placeholder="请选择原材料"
                          onChange={(value) => handleMaterialFormChange('rawMaterialId', value)}
                          filterOption={(input, option) => {
                            const children = option?.children;
                            const childrenStr = typeof children === 'string' ? children : '';
                            return childrenStr.toLowerCase().includes(input.toLowerCase());
                          }}
                        >
                          {rawMaterials.map(material => (
                            <Option key={material.id} value={material.id}>
                              {material.productName} ({material.specification})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Form.Item label="规格">
                        <Input 
                          value={materialForm.specification}
                          onChange={(e) => handleMaterialFormChange('specification', e.target.value)}
                          placeholder="请输入规格"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
                
                {/* 新原材料输入 */}
                {materialType === 'new' && (
                  <>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="新原材料名称">
                        <Input 
                          value={newMaterialName}
                          onChange={(e) => setNewMaterialName(e.target.value)}
                          placeholder="请输入新原材料名称"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12} md={4}>
                      <Form.Item label="规格">
                        <Input 
                          value={materialForm.specification}
                          onChange={(e) => handleMaterialFormChange('specification', e.target.value)}
                          placeholder="请输入规格"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
                
                <Col xs={24} sm={12} md={3}>
                  <Form.Item label="采购数量">
                    <InputNumber 
                      min={1} 
                      value={materialForm.quantity}
                      onChange={(value) => handleMaterialFormChange('quantity', value)}
                      style={{ width: '100%' }}
                      placeholder="请输入采购数量"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={3}>
                  <Form.Item label="库存数量">
                    <InputNumber 
                      value={inventoryQuantity}
                      style={{ width: '100%' }}
                      placeholder="库存数量"
                      disabled
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={3}>
                  <Form.Item label="单位">
                    <Input 
                      value={materialForm.unit}
                      onChange={(e) => handleMaterialFormChange('unit', e.target.value)}
                      placeholder="请输入单位"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12} md={5}>
                  <Form.Item label="备注">
                    <Input 
                      value={materialForm.remark}
                      onChange={(e) => handleMaterialFormChange('remark', e.target.value)}
                      placeholder="请输入备注"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item className="mt-4">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={addInboundItem}
                  style={{ width: '100%' }}
                >
                  添加到入库项目
                </Button>
              </Form.Item>
            </Card>
            


            <Table 
              columns={columns} 
              dataSource={items} 
              rowKey="id"
              pagination={false}
            />
          </Card>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="deliveryPerson"
                label="送货人"
              >
                <Input placeholder="请输入送货人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="operator"
                label="操作人"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input placeholder="请输入操作人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="inboundDate"
                label="入库日期"
                rules={[{ required: true, message: '请选择入库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remark"
            label="备注"
          >
            <TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交入库
              </Button>
              <Button onClick={onCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* 批量添加模态框 */}
        <Modal
          title="批量添加原材料"
          open={isBatchAddModalVisible}
          onCancel={handleCancelBatchAdd}
          footer={[
            <Button key="cancel" onClick={handleCancelBatchAdd}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={handleBatchAdd}>
              批量添加
            </Button>
          ]}
          width={800}
        >
          <div style={{ marginBottom: 16 }}>
            <h4>选择原材料</h4>
            <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #f0f0f0', padding: 12 }}>
              {rawMaterials.map(material => (
                <Checkbox
                  key={material.id}
                  checked={selectedMaterials.includes(material.id)}
                  onChange={() => handleMaterialSelect(material.id)}
                  style={{ display: 'block', marginBottom: 8 }}
                >
                  {material.productName} ({material.specification})
                </Checkbox>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <h4>批量设置</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="数量">
                  <InputNumber
                    value={batchQuantity}
                    onChange={setBatchQuantity}
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="规格">
                  <Input
                    value={batchSpecification}
                    onChange={(e) => setBatchSpecification(e.target.value)}
                    placeholder="批量规格（留空使用原材料默认规格）"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="备注">
                  <Input
                    value={batchRemark}
                    onChange={(e) => setBatchRemark(e.target.value)}
                    placeholder="批量备注"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Modal>


      </Card>
    </div>
  )
}

export default RawMaterialInboundForm