import { useState, useEffect, useRef } from 'react'
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
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { get, post, del } from '../services/request'
import { useReactToPrint } from 'react-to-print'

const { Option } = Select

// API调用函数
const fetchInboundHistory = async () => {
  try {
    const data = await get('/InOutbound/special-equipment-purchase-inbounds');
    return data.map(item => ({
      id: item.id,
      orderNumber: item.inboundNumber,
      deliveryPerson: item.deliveryPerson || '未知送货人',
      inspector: item.inspector || '未知检验人员',
      inboundPerson: item.inboundPerson || '未知入库人',
      inboundDate: item.inboundDate ? new Date(item.inboundDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      operator: item.handler || '未知操作人',
      status: item.status || '待确认',
      items: item.items.map((item, index) => ({
        type: '专用设备',
        name: item.equipmentName,
        brand: item.brand,
        model: item.model,
        specification: item.specification || '',
        unit: item.unit,
        inventory: item.inventory || 0,
        quantity: item.quantity,
        deviceId: item.deviceCode || `YD${item.equipmentName}${index + 1}`, // 使用后端返回的设备编号或临时生成唯一编号
        snCode: item.serialNumber || item.SnCode || item.snCode || '', // 处理SN码
        accessories: item.remark || item.Accessories || item.accessories || '', // 处理配件
        status: item.status || item.DeviceStatus || '' // 处理设备状态
      }))
    }));
  } catch (error) {
    console.error('获取入库历史失败:', error);
    message.error('获取入库历史失败');
    return [];
  }
};

const createSpecialEquipmentPurchaseInbound = async (data) => {
  try {
    // 生成入库单号: SPE-IN-时间戳
    const inboundNumber = `SPE-IN-${new Date().getTime()}`;
    
    const requestData = {
      InboundNumber: inboundNumber,
      DeliveryPerson: data.deliveryPerson,
      Inspector: data.inspector,
      InboundPerson: data.inboundPerson,
      InboundDate: data.inboundDate ? data.inboundDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ') : new Date().toISOString(),
      Handler: data.inboundPerson, // 使用入库人作为操作人
      WarehouseKeeper: data.inspector, // 使用检验人员作为仓管员
      Remark: data.remark || '',
      Items: data.items.map(item => ({
          EquipmentName: item.name,
          Brand: item.brand,
          Model: item.model,
          Unit: item.unit,
          Quantity: item.quantity,
          Status: item.status || '正常',
          DeviceCode: item.deviceId,
          SnCode: item.snCode || '',
          Accessories: item.accessories || ''
        }))
    };
    
    console.log('发送的请求数据:', JSON.stringify(requestData, null, 2));
    
    const response = await post('/InOutbound/special-equipment-purchase-inbounds', requestData);
    
    console.log('成功响应数据:', JSON.stringify(response, null, 2));
    message.success('专用设备采购入库成功');
    return response;
  } catch (error) {
    console.error('创建入库单失败:', error);
    message.error('创建入库单失败');
    return null;
  }
};

// 删除专用设备采购入库记录
const deleteSpecialEquipmentPurchaseInbound = async (id) => {
  try {
    await del(`/InOutbound/special-equipment-purchase-inbounds/${id}`);
    message.success('删除入库记录成功');
    return true;
  } catch (error) {
    console.error('删除入库记录失败:', error);
    message.error('删除入库记录失败');
    return false;
  }
};

// 生成设备编号
const generateDeviceId = async (name, brand, model) => {
  try {
    const params = {
      deviceName: name,
      brand: brand || '',
      deviceType: 1
    };
    if (model) {
      params.model = model;
    }
    const deviceCode = await get('/InOutbound/generate-device-code', { params });
    return deviceCode;
  } catch (error) {
    console.error('生成设备编号失败:', error);
    // 失败时使用基于时间戳的备用方案，确保编号唯一且连续
    const timestamp = Date.now() % 1000;
    return `YD-${name}-${timestamp.toString().padStart(3, '0')}`;
  }
};

// 模拟供应商列表
const mockSuppliers = [
  { id: 1, name: '供应商A' },
  { id: 2, name: '供应商B' },
  { id: 3, name: '供应商C' },
  { id: 4, name: '供应商D' }
];

// API调用函数 - 获取专用设备列表
const fetchSpecialEquipments = async () => {
  try {
    const data = await get('/Device/special-equipments');
    return data.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand || '',
      model: item.model || '',
      specification: item.specification || '',
      unit: item.unit || '',
      status: item.status || '',
      quantity: item.quantity || 0
    }));
  } catch (error) {
    console.error('获取专用设备失败:', error);
    return [];
  }
};

function SpecialEquipmentPurchaseInbound() {
  const [form] = Form.useForm()
  const [inboundHistory, setInboundHistory] = useState([])
  const [createModalVisible, setCreateModalVisible] = useState(false)
  // 预览相关state
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [previewData, setPreviewData] = useState({})
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
  
  // 打印ref
  const printRef = useRef(null)

  // 配置react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `专用设备入库单-${previewData.inboundNumber || '预览'}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 5mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        // 确保内容已渲染
        setTimeout(resolve, 100)
      })
    },
    onAfterPrint: () => {
      message.success('打印完成')
    },
    onPrintError: (error) => {
      message.error('打印失败: ' + error.message)
    }
  })

  // 处理保存PDF - 使用相同的打印方式，用户可以在打印对话框中选择保存为PDF
  const handleSavePDF = () => {
    handlePrint()
  }

  // 加载入库历史和设备列表
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
      
      // 加载专用设备列表
      loadDevices();
    };
    loadInitialData();
  }, []);

  // 加载设备列表
  const loadDevices = async () => {
    setDevicesLoading(true);
    try {
      const deviceList = await fetchSpecialEquipments();
      // 按设备名称分组，计算每个设备名称的库存数量（状态为正常的设备数量）
      const deviceMap = new Map();
      deviceList.forEach(device => {
        const key = device.name;
        if (!deviceMap.has(key)) {
          deviceMap.set(key, {
            ...device,
            inventory: 0
          });
        }
        // 只计算状态为正常的设备数量
        if (device.status === '正常' || device.status === '可用') {
          deviceMap.get(key).inventory += device.quantity || 0;
        }
      });
      // 转换为数组
      const uniqueDevices = Array.from(deviceMap.values());
      setDevices(uniqueDevices);
    } catch (error) {
      console.error('加载设备列表失败:', error);
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  // 处理设备表单变更
  const handleDeviceFormChange = (field, value) => {
    if (field === 'name') {
      // 当选择设备名称时，自动填充相关信息
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
    // 如果修改了名称、品牌或型号，重新生成设备编号
    if (field === 'name' || field === 'brand' || field === 'model') {
      setSelectedDevice(null);
    }
  };

  // 添加入库项
  const addInboundItem = async () => {
    const { name, brand, model, unit, quantity } = deviceForm;
    
    // 详细验证每个字段
    if (!name) {
      message.error('请选择设备名称');
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

    // 专用设备，数量是多少就添加多少条数据
    const newItems = [];
    
    // 先获取基础设备编号
    console.log('调用generateDeviceId:', name, brand, model);
    const baseDeviceId = await generateDeviceId(name, brand, model);
    console.log('获取到的基础设备编号:', baseDeviceId);
    
    // 提取编号中的数字部分
    const parts = baseDeviceId.split('-');
    let sequence = 1;
    if (parts.length >= 3) {
      const sequencePart = parts[parts.length - 1];
      if (!isNaN(parseInt(sequencePart))) {
        sequence = parseInt(sequencePart);
        console.log('提取到的序列号:', sequence);
      }
    }
    console.log('序列号:', sequence);
    
    // 为每个数量生成递增的设备编号
    for (let i = 0; i < quantity; i++) {
      let deviceId;
      if (i === 0) {
        deviceId = baseDeviceId;
      } else {
        // 生成递增的编号
        const newSequence = sequence + i;
        parts[parts.length - 1] = newSequence.toString().padStart(3, '0');
        deviceId = parts.join('-');
      }
      console.log('生成的设备编号:', deviceId);
      
      newItems.push({
        key: Date.now() + i,
        type: '专用设备',
        name,
        brand,
        model,
        unit,
        inventory: deviceForm.inventory,
        quantity: 1,
        deviceId,
        snCode: '',
        accessories: '',
        status: '正常'
      });
    }
    setInboundItems(prev => [...prev, ...newItems]);

    // 重置设备表单
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
      const result = await createSpecialEquipmentPurchaseInbound({
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

  // 删除入库记录
  const handleDeleteInbound = async (record) => {
    try {
      const success = await deleteSpecialEquipmentPurchaseInbound(record.id);
      if (success) {
        // 重新加载入库历史
        const history = await fetchInboundHistory();
        setInboundHistory(history);
        
        // 清除设备列表缓存并刷新
        if (typeof window !== 'undefined' && window.cacheManager) {
          window.cacheManager.invalidate('special-equipments');
        }
      }
    } catch (error) {
      console.error('删除入库记录失败:', error);
      message.error('删除入库记录失败');
    }
  };

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '设备编号',
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
      title: '单位',
      dataIndex: 'unit',
      key: 'unit'
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

  // 确认入库
  const confirmInbound = async (record) => {
    try {
      const response = await post(`/InOutbound/special-equipment-purchase-inbounds/${record.id}/confirm`, {});
      message.success('确认入库成功');
      // 重新加载入库历史
      const history = await fetchInboundHistory();
      setInboundHistory(history);
      
      // 清除设备列表缓存并刷新
      if (typeof window !== 'undefined' && window.cacheManager) {
        window.cacheManager.invalidate('special-equipments');
      }
    } catch (error) {
      console.error('确认入库失败:', error);
      // 检查错误信息，显示更友好的错误提示
      if (error.message && error.message.includes('入库记录不存在')) {
        message.error('入库记录不存在，可能已被删除');
        // 重新加载入库历史，更新状态
        const history = await fetchInboundHistory();
        setInboundHistory(history);
      } else {
        message.error('确认入库失败');
      }
    }
  };

  // 预览入库记录
  const previewInbound = async (record) => {
    console.log('预览入库记录:', record)
    
    // 构建预览数据
    const inboundItems = record.items || []
    
    const previewDataObj = {
      inboundNumber: record.orderNumber || '',
      deliveryPerson: record.deliveryPerson || '',
      inspector: record.inspector || '',
      inboundPerson: record.inboundPerson || '',
      inboundDate: record.inboundDate || '',
      operator: record.operator || '',
      remark: record.remark || '',
      items: inboundItems.map(item => ({
        type: '专用设备',
        name: item.name || '',
        deviceId: item.deviceId || '',
        snCode: item.snCode || '',
        brand: item.brand || '',
        model: item.model || '',
        quantity: item.quantity || 0,
        unit: item.unit || '',
        accessories: item.accessories || '',
        status: item.status || ''
      }))
    }
    
    console.log('预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    setPreviewModalVisible(true)
  }

  // 处理新建入库单的预览
  const handlePreview = () => {
    console.log('处理新建入库单预览')
    
    // 获取表单值
    const values = form.getFieldsValue()
    
    // 构建预览数据
    const previewDataObj = {
      inboundNumber: values.orderNumber || `SPE-IN-${Date.now()}`,
      deliveryPerson: values.deliveryPerson || '',
      inspector: values.inspector || '',
      inboundPerson: values.inboundPerson || '',
      inboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : '',
      operator: values.inboundPerson || '',
      remark: values.remark || '',
      items: inboundItems.map(item => ({
        type: '专用设备',
        name: item.name || '',
        deviceId: item.deviceId || '',
        snCode: item.snCode || '',
        brand: item.brand || '',
        model: item.model || '',
        quantity: item.quantity || 0,
        unit: item.unit || '',
        accessories: item.accessories || '',
        status: item.status || ''
      }))
    }
    
    console.log('新建入库单预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    setPreviewModalVisible(true)
  }

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
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => previewInbound(record)}>预览</Button>
          {record.status === '待确认' && (
            <Button type="primary" onClick={() => confirmInbound(record)}>确认入库</Button>
          )}
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteInbound(record)}>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="special-equipment-purchase-inbound">
      <Card 
        title="专用设备采购入库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateInbound}>
            新建专用设备采购入库单
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

      {/* 新建专用设备采购入库单模态框 */}
      <Modal
        title="新建专用设备采购入库单"
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
                initialValue={`SPE-IN-${new Date().getTime()}`}
              >
                <Input disabled placeholder="自动生成" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-4">
            {/* 设备信息表单 */}
            <Col span={24}>
              <Card title="设备信息" variant="outlined">
                <div className="form-container">
                  {/* 设备类型选择 */}
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="操作类型">
                        <Select 
                          value={deviceType}
                          style={{ width: '100%' }}
                          onChange={(value) => setDeviceType(value)}
                        >
                          <Option value="existing">已有设备新增</Option>
                          <Option value="new">新设备增加</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  {/* 设备信息字段 */}
                  <Row gutter={[16, 16]}>
                    {/* 已有设备选择 */}
                    {deviceType === 'existing' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="设备名称">
                            <Select 
                              showSearch
                              allowClear
                              value={deviceForm.name || undefined}
                              style={{ width: '100%' }}
                              placeholder="请选择设备名称"
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
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="单位">
                            <Input 
                              value={deviceForm.unit}
                              onChange={(e) => handleDeviceFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    
                    {/* 新设备输入 */}
                    {deviceType === 'new' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="设备名称">
                            <Input 
                              value={deviceForm.name}
                              onChange={(e) => handleDeviceFormChange('name', e.target.value)}
                              placeholder="请输入新设备名称"
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
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="单位">
                            <Input 
                              value={deviceForm.unit}
                              onChange={(e) => handleDeviceFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
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
              提交入库
            </Button>
            <Button type="default" onClick={handlePreview} style={{ marginRight: 16 }}>
              预览
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

      {/* 预览模态框 */}
      <Modal
        title="入库单预览"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width="90%"
        zIndex={9999}
        mask={true}
        styles={{
          modal: { 
            top: 50, 
            maxWidth: 1400, 
            zIndex: 9999, 
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px'
          },
          body: { 
            padding: 0,
            backgroundColor: '#fff',
            overflow: 'auto'
          },
          header: {
            backgroundColor: '#fff',
            borderBottom: '1px solid #e8e8e8'
          },
          footer: {
            backgroundColor: '#fff',
            borderTop: '1px solid #e8e8e8'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
        className="preview-modal"
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            关闭
          </Button>,
          <Button key="print" type="default" onClick={handlePrint} style={{ marginRight: 16 }}>
            打印
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePDF}>
            保存PDF
          </Button>
        ]}
      >
        <div ref={printRef} className="preview-content" style={{ padding: '20px', maxHeight: '75vh', overflow: 'auto', backgroundColor: '#fff' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2>专用设备入库单</h2>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            {/* 第一行：入库单号 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col span={24}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>入库单号:</strong> {previewData.inboundNumber}</p>
              </Col>
            </Row>
            
            {/* 第二行：送货人、检验人员、入库人 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>送货人:</strong> {previewData.deliveryPerson}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>检验人员:</strong> {previewData.inspector}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>入库人:</strong> {previewData.inboundPerson}</p>
              </Col>
            </Row>
            
            {/* 第三行：入库日期、操作人、备注 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>入库日期:</strong> {previewData.inboundDate}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>操作人:</strong> {previewData.operator}</p>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <p style={{ margin: 0 }}><strong>备注:</strong> {previewData.remark || '无'}</p>
              </Col>
            </Row>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>入库物品</h3>
            <Table 
              columns={[
                {
                  title: '设备名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: '15%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '设备编号',
                  dataIndex: 'deviceId',
                  key: 'deviceId',
                  width: '12%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: 'SN码',
                  dataIndex: 'snCode',
                  key: 'snCode',
                  width: '12%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '品牌',
                  dataIndex: 'brand',
                  key: 'brand',
                  width: '10%'
                },
                {
                  title: '型号',
                  dataIndex: 'model',
                  key: 'model',
                  width: '12%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '数量',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: '8%'
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: '8%'
                },
                {
                  title: '配件',
                  dataIndex: 'accessories',
                  key: 'accessories',
                  width: '15%',
                  render: (text) => (
                    <div style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-all',
                      lineHeight: '1.4'
                    }}>
                      {text || '-'}
                    </div>
                  )
                },
                {
                  title: '设备状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: '10%'
                }
              ]} 
              dataSource={previewData.items || []}
              rowKey={(record) => `${record.deviceId || 'unknown'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
              pagination={false}
              size="small"
              bordered
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SpecialEquipmentPurchaseInbound