import { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Card, 
  Tabs,
  Row,
  Col,
  InputNumber,
  Spin 
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select
const { TabPane } = Tabs

// API调用函数
const fetchInboundHistory = async () => {
  try {
    const response = await fetch('http://localhost:5054/api/InOutbound/equipment-purchase-inbounds');
    if (!response.ok) {
      throw new Error('获取入库历史失败');
    }
    const data = await response.json();
    return data.map(item => ({
      id: item.id,
      orderNumber: item.inboundNumber,
      supplier: item.supplier || '未知供应商',
      inboundDate: new Date().toISOString().split('T')[0], // 临时使用当前日期
      operator: item.handler || '未知操作人',
      status: '已完成',
      items: item.items.map(item => ({
        type: '设备', // 临时设置类型
        name: item.equipmentName,
        brand: item.brand,
        model: item.model,
        specification: item.specification || '',
        unit: item.unit,
        inventory: item.inventory || 0,
        quantity: item.quantity,
        deviceId: `YD${item.equipmentName}001` // 临时生成设备编号
      }))
    }));
  } catch (error) {
    console.error('获取入库历史失败:', error);
    message.error('获取入库历史失败');
    return [];
  }
};

const createEquipmentPurchaseInbound = async (data) => {
  try {
    const response = await fetch('http://localhost:5054/api/InOutbound/equipment-purchase-inbounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        supplier: data.supplier,
        handler: '当前用户', // 临时使用
        warehouseKeeper: '当前用户', // 临时使用
        remark: data.remark || '',
        items: data.items.map(item => ({
          equipmentName: item.name,
          brand: item.brand,
          model: item.model,
          specification: item.specification,
          unit: item.unit,
          inventory: item.inventory,
          quantity: item.quantity,
          status: '正常'
        }))
      })
    });
    if (!response.ok) {
      throw new Error('创建入库单失败');
    }
    const result = await response.json();
    message.success('设备采购入库成功');
    return result;
  } catch (error) {
    console.error('创建入库单失败:', error);
    message.error('创建入库单失败');
    return null;
  }
};

// 生成设备编号
const generateDeviceId = (name, brand, model) => {
  return `YD${name}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// 模拟供应商列表
const mockSuppliers = [
  { id: 1, name: '供应商A' },
  { id: 2, name: '供应商B' },
  { id: 3, name: '供应商C' },
  { id: 4, name: '供应商D' }
];

function EquipmentPurchaseInbound() {
  const [form] = Form.useForm()
  const [inboundHistory, setInboundHistory] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentInboundDetail, setCurrentInboundDetail] = useState(null)
  const [inboundItems, setInboundItems] = useState([])
  const [currentDeviceType, setCurrentDeviceType] = useState('专用设备')
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    brand: '',
    model: '',
    specification: '',
    unit: '',
    inventory: 0,
    quantity: 1
  })
  const [loading, setLoading] = useState(false)

  // 加载入库历史
  useEffect(() => {
    const loadInboundHistory = async () => {
      setLoading(true);
      try {
        const history = await fetchInboundHistory();
        setInboundHistory(history);
      } catch (error) {
        console.error('加载入库历史失败:', error);
        // 即使API调用失败，也显示空列表，避免界面崩溃
        setInboundHistory([]);
      } finally {
        setLoading(false);
      }
    };
    loadInboundHistory();
  }, []);

  // 处理设备类型变更
  const handleDeviceTypeChange = (type) => {
    setCurrentDeviceType(type)
    setSelectedDevice(null)
    setDeviceForm({
      name: '',
      brand: '',
      model: '',
      specification: '',
      unit: '',
      inventory: 0,
      quantity: 1,
      unitPrice: 0
    })
  }



  // 处理设备表单变更
  const handleDeviceFormChange = (field, value) => {
    setDeviceForm(prev => ({ ...prev, [field]: value }))
    // 如果修改了名称、品牌或型号，重新生成设备编号
    if (field === 'name' || field === 'brand' || field === 'model') {
      setSelectedDevice(null)
    }
  }

  // 添加入库项
  const addInboundItem = () => {
    const { name, brand, model, specification, unit, quantity } = deviceForm
    
    if (!name || !brand || !model || !specification || !unit || quantity <= 0) {
      message.error('请填写完整的设备信息')
      return
    }

    if (currentDeviceType === '耗材') {
      // 耗材只添加一条数据
      const deviceId = generateDeviceId(name, brand, model)
      const newItem = {
        key: Date.now(),
        type: currentDeviceType,
        name,
        brand,
        model,
        specification,
        unit,
        inventory: deviceForm.inventory,
        quantity,
        deviceId
      }
      setInboundItems(prev => [...prev, newItem])
    } else {
      // 专用设备和通用设备，数量是多少就添加多少条数据
      const newItems = []
      for (let i = 0; i < quantity; i++) {
        const deviceId = generateDeviceId(name, brand, model)
        newItems.push({
          key: Date.now() + i,
          type: currentDeviceType,
          name,
          brand,
          model,
          specification,
          unit,
          inventory: deviceForm.inventory,
          quantity: 1,
          deviceId
        })
      }
      setInboundItems(prev => [...prev, ...newItems])
    }

    // 重置设备表单
    setDeviceForm({
      name: '',
      brand: '',
      model: '',
      specification: '',
      unit: '',
      inventory: 0,
      quantity: 1
    })
    setSelectedDevice(null)
  }

  // 移除入库项
  const removeInboundItem = (key) => {
    setInboundItems(prev => prev.filter(item => item.key !== key))
  }

  // 处理入库项变更
  const handleItemChange = (key, field, value) => {
    setInboundItems(prev => prev.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    ))
  }

  // 处理新建入库单
  const handleCreateInbound = () => {
    form.resetFields()
    setInboundItems([])
    setCurrentDeviceType('专用设备')
    setSelectedDevice(null)
    setDeviceForm({
      name: '',
      brand: '',
      model: '',
      specification: '',
      unit: '',
      inventory: 0,
      quantity: 1
    })
    setCreateModalVisible(true)
  }

  // 处理表单提交
  const handleSubmit = async (values) => {
    if (inboundItems.length === 0) {
      message.error('请至少添加一项入库物品')
      return
    }

    setLoading(true)
    try {
      const result = await createEquipmentPurchaseInbound({
        supplier: values.supplier,
        remark: values.remark,
        items: inboundItems
      })
      
      if (result) {
        // 重新加载入库历史
        const history = await fetchInboundHistory()
        setInboundHistory(history)
        
        // 重置表单和选择
        form.resetFields()
        setInboundItems([])
        setCreateModalVisible(false)
      }
    } catch (error) {
      console.error('提交入库单失败:', error)
      message.error('提交入库单失败')
    } finally {
      setLoading(false)
    }
  }

  // 查看入库详情
  const viewInboundDetail = (record) => {
    setCurrentInboundDetail(record)
    setDetailModalVisible(true)
  }

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: '库存数量',
      dataIndex: 'inventory',
      key: 'inventory'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeInboundItem(record.key)}
        >
          移除
        </Button>
      )
    }
  ]

  // 入库历史表格列
  const historyColumns = [
    {
      title: '入库单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      key: 'inboundDate'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => viewInboundDetail(record)}>查看详情</Button>
      )
    }
  ]

  return (
    <div className="equipment-purchase-inbound">
      <Card 
        title="设备采购入库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateInbound}>
            新建设备采购入库单
          </Button>
        }
      >
        <Spin spinning={loading} description="加载中...">
          <Table 
            columns={historyColumns} 
            dataSource={inboundHistory} 
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              defaultPageSize: 10
            }}
          />
        </Spin>
      </Card>

      {/* 新建设备采购入库单模态框 */}
      <Modal
        title="新建设备采购入库单"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        width={1400}
        style={{ top: 20 }}
        footer={null}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="orderNumber" 
                label="入库单号" 
                rules={[{ required: true, message: '请输入入库单号' }]}
                initialValue="自动生成"
              >
                <Input disabled placeholder="自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="supplier" 
                label="供应商" 
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  {mockSuppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item 
                name="inboundDate" 
                label="入库日期" 
                rules={[{ required: true, message: '请选择入库日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* 添加物品区域 */}
          <Card title="添加物品" variant="outlined" className="mt-4">
            <div className="form-container">
              {/* 设备类型选择 */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="设备类型">
                    <Select 
                      value={currentDeviceType}
                      onChange={handleDeviceTypeChange}
                      style={{ width: '100%' }}
                    >
                      <Option value="专用设备">专用设备</Option>
                      <Option value="通用设备">通用设备</Option>
                      <Option value="耗材">耗材</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="设备名称">
                    <Input 
                      value={deviceForm.name}
                      onChange={(e) => handleDeviceFormChange('name', e.target.value)}
                      placeholder="请输入设备名称"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="品牌">
                    <Input 
                      value={deviceForm.brand}
                      onChange={(e) => handleDeviceFormChange('brand', e.target.value)}
                      placeholder="请输入品牌"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="型号">
                    <Input 
                      value={deviceForm.model}
                      onChange={(e) => handleDeviceFormChange('model', e.target.value)}
                      placeholder="请输入型号"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="单位">
                    <Input 
                      value={deviceForm.unit}
                      onChange={(e) => handleDeviceFormChange('unit', e.target.value)}
                      placeholder="请输入单位"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="规格">
                    <Input 
                      value={deviceForm.specification}
                      onChange={(e) => handleDeviceFormChange('specification', e.target.value)}
                      placeholder="请输入规格"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="库存数量">
                    <InputNumber 
                      min={0} 
                      value={deviceForm.inventory}
                      onChange={(value) => handleDeviceFormChange('inventory', value)}
                      style={{ width: '100%' }}
                      placeholder="请输入库存数量"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="数量">
                    <InputNumber 
                      min={1} 
                      value={deviceForm.quantity}
                      onChange={(value) => handleDeviceFormChange('quantity', value)}
                      style={{ width: '100%' }}
                      placeholder="请输入数量"
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
                  添加到已选物品
                </Button>
              </Form.Item>
            </div>
          </Card>

          {/* 已选物品表格 */}
          <Card title="已选物品" variant="outlined" className="mt-4">
            <Table 
              columns={inboundItemColumns} 
              dataSource={inboundItems} 
              rowKey="key"
              pagination={false}
            />
          </Card>

          <Form.Item 
            name="remark" 
            label="备注"
            className="mt-4"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              确认入库
            </Button>
            <Button onClick={() => {
              form.resetFields()
              setInboundItems([])
              setCurrentDeviceType('专用设备')
              setSelectedDevice(null)
              setDeviceForm({
                name: '',
                brand: '',
                model: '',
                specification: '',
                unit: '',
                inventory: 0,
                quantity: 1
              })
              setCreateModalVisible(false)
            }}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 入库详情模态框 */}
      <Modal
        title="入库详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentInboundDetail && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <p><strong>入库单号:</strong> {currentInboundDetail.orderNumber}</p>
                <p><strong>供应商:</strong> {currentInboundDetail.supplier}</p>
                <p><strong>入库日期:</strong> {currentInboundDetail.inboundDate}</p>
              </Col>
              <Col span={12}>
                <p><strong>操作人:</strong> {currentInboundDetail.operator}</p>
                <p><strong>状态:</strong> {currentInboundDetail.status}</p>
              </Col>
            </Row>
            <h4 className="mt-4">入库物品</h4>
            <Table 
              columns={[
                { title: '设备编号', dataIndex: 'deviceId', key: 'deviceId' },
                { title: '类型', dataIndex: 'type', key: 'type' },
                { title: '名称', dataIndex: 'name', key: 'name' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '库存数量', dataIndex: 'inventory', key: 'inventory' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' }
              ]} 
              dataSource={currentInboundDetail.items} 
              rowKey={(record, index) => index}
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EquipmentPurchaseInbound