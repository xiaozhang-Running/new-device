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
  Row, 
  Col, 
  InputNumber, 
  Spin 
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

const { Option } = Select

// API调用函数
const fetchInboundHistory = async () => {
  try {
    const response = await fetch('http://localhost:5054/api/InOutbound/consumable-purchase-inbounds');
    if (!response.ok) {
      throw new Error('获取入库历史失败');
    }
    const data = await response.json();
    return data.map(item => ({
      id: item.id,
      orderNumber: item.inboundNumber,
      deliveryPerson: item.deliveryPerson || '未知送货人',
      inspector: item.inspector || '未知检验人员',
      inboundPerson: item.inboundPerson || '未知入库人',
      inboundDate: item.inboundDate ? new Date(item.inboundDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      operator: item.handler || '未知操作人',
      status: '已完成',
      items: item.items.map(item => ({
        type: '耗材',
        name: item.consumableName,
        brand: item.brand,
        model: item.model,
        unit: item.unit,
        inventory: item.inventory || 0,
        quantity: item.quantity,
        deviceId: `HC${item.consumableName}001` // 临时生成耗材编号
      }))
    }));
  } catch (error) {
    console.error('获取入库历史失败:', error);
    message.error('获取入库历史失败');
    return [];
  }
};

const createConsumablePurchaseInbound = async (data) => {
  try {
    const response = await fetch('http://localhost:5054/api/InOutbound/consumable-purchase-inbounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deliveryPerson: data.deliveryPerson,
        inspector: data.inspector,
        inboundPerson: data.inboundPerson,
        inboundDate: data.inboundDate,
        handler: data.inboundPerson, // 使用入库人作为操作人
        warehouseKeeper: data.inspector, // 使用检验人员作为仓管员
        remark: data.remark || '',
        items: data.items.map(item => ({
          consumableName: item.name,
          brand: item.brand,
          model: item.model,
          unit: item.unit,
          quantity: item.quantity,
          status: item.status || '正常',
          snCode: item.snCode || '',
          accessories: item.accessories || ''
        }))
      })
    });
    if (!response.ok) {
      throw new Error('创建入库单失败');
    }
    const result = await response.json();
    message.success('耗材采购入库成功');
    return result;
  } catch (error) {
    console.error('创建入库单失败:', error);
    message.error('创建入库单失败');
    return null;
  }
};

// 生成耗材编号
const generateConsumableId = async (name, brand, model) => {
  try {
    const response = await fetch(`http://localhost:5054/api/InOutbound/generate-device-code?deviceName=${encodeURIComponent(name)}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&deviceType=3`);
    if (!response.ok) {
      throw new Error('生成耗材编号失败');
    }
    const deviceCode = await response.text();
    return deviceCode;
  } catch (error) {
    console.error('生成耗材编号失败:', error);
    // 失败时使用备用方案
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HC-${name}-${randomNum}`;
  }
};

// 模拟供应商列表
const mockSuppliers = [
  { id: 1, name: '供应商A' },
  { id: 2, name: '供应商B' },
  { id: 3, name: '供应商C' },
  { id: 4, name: '供应商D' }
];

// API调用函数 - 获取耗材列表
const fetchConsumables = async () => {
  try {
    const response = await fetch('http://localhost:5054/api/Consumable');
    if (!response.ok) {
      throw new Error('获取耗材失败');
    }
    const data = await response.json();
    return data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand || '',
      model: item.modelSpecification || '',
      unit: item.unit || '',
      status: item.status || '',
      quantity: item.remainingQuantity || 0
    }));
  } catch (error) {
    console.error('获取耗材失败:', error);
    return [];
  }
};

function ConsumablePurchaseInbound() {
  const [form] = Form.useForm()
  const [inboundHistory, setInboundHistory] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentInboundDetail, setCurrentInboundDetail] = useState(null)
  const [inboundItems, setInboundItems] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [deviceForm, setDeviceForm] = useState({
    name: '',
    brand: '',
    model: '',
    unit: '',
    inventory: 0,
    quantity: 1
  })
  const [deviceType, setDeviceType] = useState('existing') // 'existing' 或 'new'
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState([])
  const [devicesLoading, setDevicesLoading] = useState(false)

  // 加载入库历史和耗材列表
  useEffect(() => {
    const loadInitialData = async () => {
      // 加载入库历史
      setLoading(true);
      try {
        const history = await fetchInboundHistory();
        setInboundHistory(history);
      } catch (error) {
        console.error('加载入库历史失败:', error);
        setInboundHistory([]);
      } finally {
        setLoading(false);
      }
      
      // 加载耗材列表
      loadDevices();
    };
    loadInitialData();
  }, []);

  // 加载耗材列表
  const loadDevices = async () => {
    setDevicesLoading(true);
    try {
      const deviceList = await fetchConsumables();
      // 按耗材名称分组，计算每个耗材名称的库存数量
      const deviceMap = new Map();
      deviceList.forEach(device => {
        const key = device.name;
        if (!deviceMap.has(key)) {
          deviceMap.set(key, {
            ...device,
            inventory: 0
          });
        }
        deviceMap.get(key).inventory += device.quantity || 0;
      });
      // 转换为数组
      const uniqueDevices = Array.from(deviceMap.values());
      setDevices(uniqueDevices);
    } catch (error) {
      console.error('加载耗材列表失败:', error);
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  // 处理耗材表单变更
  const handleDeviceFormChange = (field, value) => {
    if (field === 'name') {
      // 当选择耗材名称时，自动填充相关信息
      const selectedDevice = devices.find(device => device.name === value);
      if (selectedDevice) {
        setDeviceForm(prev => ({
          ...prev,
          name: value,
          brand: selectedDevice.brand || '',
          model: selectedDevice.model || '',
          unit: selectedDevice.unit || '',
          inventory: selectedDevice.inventory || 0
        }));
      } else {
        setDeviceForm(prev => ({ ...prev, name: value, inventory: 0 }));
      }
    } else {
      setDeviceForm(prev => ({ ...prev, [field]: value }));
    }
    // 如果修改了名称、品牌或型号，重新生成耗材编号
    if (field === 'name' || field === 'brand' || field === 'model') {
      setSelectedDevice(null);
    }
  };

  // 添加入库项
  const addInboundItem = async () => {
    const { name, brand, model, unit, quantity } = deviceForm;
    
    // 详细验证每个字段
    if (!name) {
      message.error('请选择耗材名称');
      return;
    }
    if (!brand) {
      message.error('请填写品牌');
      return;
    }
    if (!unit) {
      message.error('请填写单位');
      return;
    }
    if (!quantity || quantity <= 0) {
      message.error('请输入有效的采购数量');
      return;
    }

    // 耗材只添加一条数据
    const deviceId = await generateConsumableId(name, brand, model);
    const newItem = {
      key: Date.now(),
      type: '耗材',
      name,
      brand,
      model,
      unit,
      inventory: deviceForm.inventory,
      quantity,
      deviceId,
      snCode: '',
      accessories: '',
      status: '正常'
    };
    setInboundItems(prev => [...prev, newItem]);

    // 重置耗材表单
    setDeviceForm({
      name: '',
      brand: '',
      model: '',
      unit: '',
      inventory: 0,
      quantity: 1
    });
    setSelectedDevice(null);
  };

  // 移除入库项
  const removeInboundItem = (key) => {
    setInboundItems(prev => prev.filter(item => item.key !== key));
  };

  // 处理新建入库单
  const handleCreateInbound = () => {
    form.resetFields();
    setInboundItems([]);
    setSelectedDevice(null);
    setDeviceForm({
      name: '',
      brand: '',
      model: '',
      unit: '',
      inventory: 0,
      quantity: 1
    });
    setCreateModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    if (inboundItems.length === 0) {
      message.error('请至少添加一项入库物品');
      return;
    }

    setLoading(true);
    try {
      const result = await createConsumablePurchaseInbound({
        deliveryPerson: values.deliveryPerson,
        inspector: values.inspector,
        inboundPerson: values.inboundPerson,
        inboundDate: values.inboundDate,
        remark: values.remark,
        items: inboundItems
      });
      
      if (result) {
        // 重新加载入库历史
        const history = await fetchInboundHistory();
        setInboundHistory(history);
        
        // 重置表单和选择
        form.resetFields();
        setInboundItems([]);
        setCreateModalVisible(false);
      }
    } catch (error) {
      console.error('提交入库单失败:', error);
      message.error('提交入库单失败');
    } finally {
      setLoading(false);
    }
  };

  // 查看入库详情
  const viewInboundDetail = (record) => {
    setCurrentInboundDetail(record);
    setDetailModalVisible(true);
  };

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '耗材名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '耗材编号',
      dataIndex: 'deviceId',
      key: 'deviceId'
    },
    {
      title: 'SN码',
      dataIndex: 'snCode',
      key: 'snCode',
      render: (_, record) => (
        <Input 
          value={record.snCode || ''} 
          onChange={(e) => {
            const newItems = inboundItems.map(item => 
              item.key === record.key 
                ? { ...item, snCode: e.target.value }
                : item
            );
            setInboundItems(newItems);
          }}
          placeholder="请输入SN码"
        />
      )
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
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
    },
    {
      title: '配件',
      dataIndex: 'accessories',
      key: 'accessories',
      render: (_, record) => (
        <Input 
          value={record.accessories || ''} 
          onChange={(e) => {
            const newItems = inboundItems.map(item => 
              item.key === record.key 
                ? { ...item, accessories: e.target.value }
                : item
            );
            setInboundItems(newItems);
          }}
          placeholder="请输入配件"
        />
      )
    },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => (
        <Select 
          value={record.status || '正常'} 
          style={{ width: '100%' }}
          onChange={(value) => {
            const newItems = inboundItems.map(item => 
              item.key === record.key 
                ? { ...item, status: value }
                : item
            );
            setInboundItems(newItems);
          }}
        >
          <Option value="正常">正常</Option>
          <Option value="待维修">待维修</Option>
          <Option value="已报废">已报废</Option>
        </Select>
      )
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
  ];

  // 入库历史表格列
  const historyColumns = [
    {
      title: '入库单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: '送货人',
      dataIndex: 'deliveryPerson',
      key: 'deliveryPerson'
    },
    {
      title: '检验人员',
      dataIndex: 'inspector',
      key: 'inspector'
    },
    {
      title: '入库人',
      dataIndex: 'inboundPerson',
      key: 'inboundPerson'
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
  ];

  return (
    <div className="consumable-purchase-inbound">
      <Card 
        title="耗材采购入库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateInbound}>
            新建耗材采购入库单
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

      {/* 新建耗材采购入库单模态框 */}
      <Modal
        title="新建耗材采购入库单"
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
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="orderNumber" 
                label="入库单号" 
                rules={[{ required: true, message: '请输入入库单号' }]}
                initialValue="自动生成"
              >
                <Input disabled placeholder="自动生成" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-4">
            {/* 耗材信息表单 */}
            <Col span={24}>
              <Card title="耗材信息" variant="outlined">
                <div className="form-container">
                  {/* 耗材类型选择 */}
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="操作类型">
                        <Select 
                          value={deviceType}
                          style={{ width: '100%' }}
                          onChange={(value) => setDeviceType(value)}
                        >
                          <Option value="existing">已有耗材新增</Option>
                          <Option value="new">新耗材增加</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  {/* 耗材信息字段 */}
                  <Row gutter={[16, 16]}>
                    {/* 已有耗材选择 */}
                    {deviceType === 'existing' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="耗材名称">
                            <Select 
                              showSearch
                              allowClear
                              value={deviceForm.name || undefined}
                              style={{ width: '100%' }}
                              placeholder="请选择耗材名称"
                              loading={devicesLoading}
                              onChange={(value) => handleDeviceFormChange('name', value)}
                              filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              optionLabelProp="label"
                            >
                              {devices.map(device => (
                                <Option key={device.id} value={device.name} label={device.name}>
                                  {device.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="品牌">
                            <Input 
                              value={deviceForm.brand}
                              onChange={(e) => handleDeviceFormChange('brand', e.target.value)}
                              placeholder="请输入品牌"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="型号">
                            <Input 
                              value={deviceForm.model}
                              onChange={(e) => handleDeviceFormChange('model', e.target.value)}
                              placeholder="请输入型号"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="单位">
                            <Input 
                              value={deviceForm.unit}
                              onChange={(e) => handleDeviceFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="采购数量">
                            <InputNumber 
                              min={1} 
                              value={deviceForm.quantity}
                              onChange={(value) => handleDeviceFormChange('quantity', value)}
                              style={{ width: '100%' }}
                              placeholder="请输入采购数量"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="库存数量">
                            <InputNumber 
                              min={0} 
                              value={deviceForm.inventory}
                              style={{ width: '100%' }}
                              placeholder="库存数量"
                              disabled
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    
                    {/* 新耗材输入 */}
                    {deviceType === 'new' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="耗材名称">
                            <Input 
                              value={deviceForm.name}
                              onChange={(e) => handleDeviceFormChange('name', e.target.value)}
                              placeholder="请输入新耗材名称"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="品牌">
                            <Input 
                              value={deviceForm.brand}
                              onChange={(e) => handleDeviceFormChange('brand', e.target.value)}
                              placeholder="请输入品牌"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="型号">
                            <Input 
                              value={deviceForm.model}
                              onChange={(e) => handleDeviceFormChange('model', e.target.value)}
                              placeholder="请输入型号"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="单位">
                            <Input 
                              value={deviceForm.unit}
                              onChange={(e) => handleDeviceFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="采购数量">
                            <InputNumber 
                              min={1} 
                              value={deviceForm.quantity}
                              onChange={(value) => handleDeviceFormChange('quantity', value)}
                              style={{ width: '100%' }}
                              placeholder="请输入采购数量"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="库存数量">
                            <InputNumber 
                              min={0} 
                              value={0}
                              style={{ width: '100%' }}
                              placeholder="库存数量"
                              disabled
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
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
            </Col>
          </Row>

          {/* 已选物品表格 */}
          <Card title="已选物品" variant="outlined" className="mt-4">
            <Table 
              columns={inboundItemColumns} 
              dataSource={inboundItems} 
              rowKey="key"
              pagination={false}
            />
          </Card>

          <Row gutter={[16, 16]} className="mt-4">
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="deliveryPerson" 
                label="送货人" 
                rules={[{ required: true, message: '请输入送货人' }]}
              >
                <Input placeholder="请输入送货人" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="inspector" 
                label="检验人员" 
                rules={[{ required: true, message: '请输入检验人员' }]}
              >
                <Input placeholder="请输入检验人员" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="inboundPerson" 
                label="入库人" 
                rules={[{ required: true, message: '请输入入库人' }]}
              >
                <Input placeholder="请输入入库人" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
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
            className="mt-4"
          >
            <Input.TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              确认入库
            </Button>
            <Button onClick={() => {
              form.resetFields();
              setInboundItems([]);
              setSelectedDevice(null);
              setDeviceForm({
                name: '',
                brand: '',
                model: '',
                unit: '',
                inventory: 0,
                quantity: 1
              });
              setCreateModalVisible(false);
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
                <p><strong>送货人:</strong> {currentInboundDetail.deliveryPerson}</p>
                <p><strong>检验人员:</strong> {currentInboundDetail.inspector}</p>
              </Col>
              <Col span={12}>
                <p><strong>入库人:</strong> {currentInboundDetail.inboundPerson}</p>
                <p><strong>入库日期:</strong> {currentInboundDetail.inboundDate}</p>
                <p><strong>操作人:</strong> {currentInboundDetail.operator}</p>
                <p><strong>状态:</strong> {currentInboundDetail.status}</p>
              </Col>
            </Row>
            <h4 className="mt-4">入库物品</h4>
            <Table 
              columns={[
                { title: '耗材名称', dataIndex: 'name', key: 'name' },
                { title: '耗材编号', dataIndex: 'deviceId', key: 'deviceId' },
                { title: 'SN码', dataIndex: 'snCode', key: 'snCode' },
                { title: '品牌', dataIndex: 'brand', key: 'brand' },
                { title: '型号', dataIndex: 'model', key: 'model' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '配件', dataIndex: 'accessories', key: 'accessories' },
                { title: '设备状态', dataIndex: 'status', key: 'status' }
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

export default ConsumablePurchaseInbound
