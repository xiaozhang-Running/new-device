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
import { API_BASE_URL } from '../config/api.js'

const { Option } = Select

// API调用函数
const fetchInboundHistory = async () => {
  try {
    const data = await get('/InOutbound/consumable-purchase-inbounds');
    return data.map(item => ({
      id: item.id,
      orderNumber: item.inboundNumber,
      deliveryPerson: item.deliveryPerson || '未知送货人',
      inspector: item.inspector || '未知检验人员',
      inboundPerson: item.inboundPerson || '未知入库人',
      inboundDate: item.inboundDate ? new Date(item.inboundDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      operator: item.handler || '未知操作人',
      status: item.status || '待确认',
      items: item.items.map(item => ({
        type: '耗材',
        name: item.consumableName,
        brand: item.brand,
        model: item.model,
        unit: item.unit,
        inventory: item.inventory || 0,
        quantity: item.quantity
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
    const result = await post('/InOutbound/consumable-purchase-inbounds', {
      InboundNumber: data.orderNumber,
      DeliveryPerson: data.deliveryPerson,
      Inspector: data.inspector,
      InboundPerson: data.inboundPerson,
      InboundDate: data.inboundDate && typeof data.inboundDate.toDate === 'function' ? data.inboundDate.toDate().toISOString() : new Date().toISOString(),
      Handler: data.inboundPerson, // 使用入库人作为操作人
      WarehouseKeeper: data.inspector, // 使用检验人员作为仓管员
      Remark: data.remark || '',
      Items: data.items.map(item => ({
        ConsumableName: item.name,
        Brand: item.brand,
        Model: item.model,
        Unit: item.unit,
        Quantity: item.quantity
      }))
    });
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
    const baseUrl = API_BASE_URL;
    let url = `${baseUrl}/InOutbound/generate-device-code?deviceName=${encodeURIComponent(name)}&brand=${encodeURIComponent(brand)}&deviceType=3`;
    if (model) {
      url += `&model=${encodeURIComponent(model)}`;
    }
    const response = await fetch(url);
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
    const data = await get('/Consumable');
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
    documentTitle: `耗材入库单-${previewData.orderNumber || '预览'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 8px;
          line-height: 0.9;
          margin: 0 !important;
          padding: 0 !important;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .preview-content {
          max-height: none !important;
          overflow: visible !important;
          margin: 0 auto !important;
          padding: 0 !important;
          width: 100%;
          max-width: 210mm;
        }
        table {
          page-break-inside: auto;
          line-height: 0.9;
          margin: 2px 0 !important;
          border-collapse: collapse !important;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
          line-height: 0.9;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        table, th, td {
          font-size: 9px;
          line-height: 0.9;
          padding: 1px !important;
          font-weight: normal !important;
          font-style: normal !important;
        }
        h1, h2, h3, h4, h5, h6 {
          font-size: 11px;
          line-height: 0.9;
          margin: 0.1em 0 !important;
          padding: 0 !important;
        }
        p {
          font-size: 8px;
          line-height: 0.9;
          margin: 0 !important;
          padding: 0 !important;
        }
        .preview-content h2 {
          font-size: 14px !important;
          line-height: 0.9;
          margin: 0.15em 0 !important;
        }
        .preview-content h3 {
          font-size: 10px !important;
          line-height: 0.9;
          margin: 0.1em 0 !important;
        }
        /* 入库单号样式 */
        .preview-content > div:nth-child(2) p:first-child {
          font-size: 10px !important;
        }
        /* 入库物品表格样式 */
        .preview-content > div:nth-child(3) table {
          font-size: 9px !important;
        }
        .preview-content > div:nth-child(3) table th,
        .preview-content > div:nth-child(3) table td {
          font-size: 9px !important;
          font-weight: normal !important;
          font-style: normal !important;
        }
        /* 送货人、检验人、库管、入库日期样式 */
        .preview-content > div:nth-child(4) p {
          font-size: 10px !important;
        }
        /* 备注栏样式 */
        .preview-content > div:nth-child(5) {
          font-size: 9px !important;
          font-style: italic !important;
          font-weight: bold !important;
          margin: 0.15em 0 !important;
        }
        .preview-content > div:nth-child(5) p {
          font-size: 9px !important;
          font-style: italic !important;
          font-weight: bold !important;
          line-height: 1.2;
          margin: 0.05em 0 !important;
          padding: 4px !important;
          min-height: 30px !important;
        }
        /* 减小div之间的间距 */
        .preview-content > div {
          margin: 2px 0 !important;
          padding: 8px !important;
        }
        /* 减小表格内边距 */
        .preview-content table {
          border-collapse: collapse !important;
        }
        /* 减小标题与内容之间的间距 */
        .preview-content h3 {
          margin-bottom: 8px !important;
        }
        /* 移除滚动条 */
        ::-webkit-scrollbar {
          display: none !important;
        }
        scrollbar {
          display: none !important;
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
  const addInboundItem = () => {
    const { name, brand, model, unit, quantity } = deviceForm;
    
    // 详细验证每个字段
    if (!name) {
      message.error('请选择耗材名称');
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
    const newItem = {
      key: Date.now(),
      type: '耗材',
      name,
      brand,
      model,
      unit,
      inventory: deviceForm.inventory,
      quantity
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

  // 生成入库单号
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `CON-IN-${timestamp}`;
  };

  // 处理新建入库单
  const handleCreateInbound = async () => {
    // 重新加载耗材列表
    await loadDevices();
    // 重置状态
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
    // 打开模态框
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
        orderNumber: values.orderNumber,
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
        type: '耗材',
        name: item.name || '',
        brand: item.brand || '',
        model: item.model || '',
        quantity: item.quantity || 0,
        unit: item.unit || ''
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
      inboundNumber: values.orderNumber || `CON-IN-${Date.now()}`,
      deliveryPerson: values.deliveryPerson || '',
      inspector: values.inspector || '',
      inboundPerson: values.inboundPerson || '',
      inboundDate: values.inboundDate ? values.inboundDate.format('YYYY-MM-DD') : '',
      operator: values.inboundPerson || '',
      remark: values.remark || '',
      items: inboundItems.map(item => ({
        type: '耗材',
        name: item.name || '',
        brand: item.brand || '',
        model: item.model || '',
        quantity: item.quantity || 0,
        unit: item.unit || ''
      }))
    }
    
    console.log('新建入库单预览数据:', previewDataObj)
    setPreviewData(previewDataObj)
    setPreviewModalVisible(true)
  }

  // 编辑入库单
  const editInbound = (record) => {
    // 实现编辑功能
    message.info('编辑功能开发中');
  };

  // 确认入库
  const confirmInbound = async (record) => {
    try {
      const response = await post(`/InOutbound/consumable-purchase-inbounds/${record.id}/confirm`, {});
      message.success('确认入库成功');
      // 重新加载入库历史
      const history = await fetchInboundHistory();
      setInboundHistory(history);
      
      // 清除耗材列表缓存并刷新
      if (typeof window !== 'undefined' && window.cacheManager) {
        window.cacheManager.invalidate('consumables');
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

  // 删除入库单
  const handleDeleteInbound = async (record) => {
    try {
      // 调用API删除入库单
      await del(`/InOutbound/consumable-purchase-inbounds/${record.id}`);
      message.success('删除入库记录成功');
      // 重新加载入库历史
      const history = await fetchInboundHistory();
      setInboundHistory(history);
      
      // 清除耗材列表缓存并刷新
      if (typeof window !== 'undefined' && window.cacheManager) {
        window.cacheManager.invalidate('consumables');
      }
    } catch (error) {
      console.error('删除入库记录失败:', error);
      message.error('删除入库记录失败');
    }
  };

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '耗材名称',
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
                initialValue={`CON-IN-${Date.now().toString().slice(-6)}`}
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
                label="检验人" 
                rules={[{ required: true, message: '请输入检验人' }]}
              >
                <Input placeholder="请输入检验人" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item 
                name="inboundPerson" 
                label="库管" 
                rules={[{ required: true, message: '请输入库管' }]}
              >
                <Input placeholder="请输入库管" />
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
            <h2>耗材入库单</h2>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            {/* 第一行：入库单号 */}
            <Row gutter={[16, 16]} style={{ marginBottom: '12px' }}>
              <Col span={24}>
                <p style={{ margin: 0, fontSize: '16px' }}><strong>入库单号:</strong> {previewData.inboundNumber}</p>
              </Col>
            </Row>
          </div>
          
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>入库物品</h3>
            <Table 
              columns={[
                {
                  title: '耗材名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: '20%',
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
                  width: '15%'
                },
                {
                  title: '型号',
                  dataIndex: 'model',
                  key: 'model',
                  width: '20%',
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
                  width: '10%'
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: '10%'
                }
              ]} 
              dataSource={previewData.items || []}
              rowKey={(record, index) => index}
              pagination={false}
              size="small"
              bordered
              style={{ width: '100%' }}
            />
          </div>
          
          {/* 送货人、检验人、库管、入库日期 - 放在入库物品下方，备注栏上方 */}
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>送货人:</strong> {previewData.deliveryPerson}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>检验人:</strong> {previewData.inspector}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>库管:</strong> {previewData.inboundPerson}</p>
              </Col>
              <Col xs={24} sm={6} md={6}>
                <p style={{ margin: 0 }}><strong>入库日期:</strong> {previewData.inboundDate}</p>
              </Col>
            </Row>
          </div>
          
          {/* 备注栏移动到最下方 */}
          <div style={{ marginBottom: '20px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>备注</h3>
            <p style={{ margin: 0 }}>{previewData.remark || '无'}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ConsumablePurchaseInbound
