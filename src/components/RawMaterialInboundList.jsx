import React, { useState, useEffect } from 'react'
import { Table, Button, message, Space, Modal, Card, Tag, Spin, Row, Col, Input, DatePicker, Form, Select, InputNumber } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { get, post, del } from '../services/request'

const { Option } = Select
const { TextArea } = Input

// API调用函数
const fetchInboundHistory = async () => {
  try {
    const data = await get('/InOutbound/raw-material-inbounds');
    return data.map(item => ({
      id: item.id,
      orderNumber: item.inboundNumber,
      deliveryPerson: '', // 后端DTO中没有该字段
      inspector: '', // 后端DTO中没有该字段
      inboundPerson: item.handler || '未知入库人',
      inboundDate: new Date().toISOString().split('T')[0], // 临时使用当前日期
      operator: item.handler || '未知操作人',
      status: item.status || '待处理',
      supplier: item.supplier || '未知供应商',
      remark: item.remark || '',
      items: item.items.map(item => ({
        type: '原材料',
        name: '', // 需要根据rawMaterialId查询
        specification: '', // 后端DTO中没有该字段
        unit: '', // 后端DTO中没有该字段
        inventory: 0, // 需要根据rawMaterialId查询
        quantity: item.quantity
      }))
    }));
  } catch (error) {
    console.error('获取入库历史失败:', error);
    message.error('获取入库历史失败');
    return [];
  }
};

const createRawMaterialInbound = async (data, rawMaterials) => {
  try {
    // 转换数据格式以匹配后端API的期望
    const dto = {
      supplier: data.supplier || '',
      handler: data.inboundPerson,
      warehouseKeeper: data.inspector,
      remark: data.remark || '',
      items: data.items.map(item => ({
        rawMaterialId: item.rawMaterialId,
        quantity: item.quantity,
        remark: item.rawMaterialId <= 0 ? `名称:${item.name};规格:${item.specification};单位:${item.unit}` : item.remark
      }))
    };

    const result = await post('/InOutbound/raw-material-inbounds', dto);
    message.success('原材料采购入库成功');
    return result;
  } catch (error) {
    console.error('创建入库单失败:', error);
    message.error(error.message || '创建入库单失败');
    return null;
  }
};

// API调用函数 - 获取原材料列表
const fetchRawMaterials = async () => {
  try {
    const data = await get('/RawMaterials');
    return data.map(item => ({
      id: item.id,
      name: item.productName,
      specification: item.specification || '',
      unit: item.unit || '',
      status: item.status || '',
      quantity: item.remainingQuantity || 0
    }));
  } catch (error) {
    console.error('获取原材料失败:', error);
    // 使用模拟数据作为后备
    return [
      { id: 1, name: '钢材', specification: 'Φ10mm', unit: 'kg', quantity: 50 },
      { id: 2, name: '铝材', specification: '1mm', unit: 'kg', quantity: 30 },
      { id: 3, name: '塑料', specification: '颗粒', unit: 'kg', quantity: 100 },
      { id: 4, name: '电线', specification: '2.5mm²', unit: 'm', quantity: 200 }
    ];
  }
};

function RawMaterialInboundList() {
  const [form] = Form.useForm()
  const [inboundHistory, setInboundHistory] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [currentInboundDetail, setCurrentInboundDetail] = useState(null)
  const [inboundItems, setInboundItems] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [materialForm, setMaterialForm] = useState({
    rawMaterialId: '',
    name: '',
    specification: '',
    unit: '',
    inventory: 0,
    quantity: 1,
    remark: ''
  })
  const [materialType, setMaterialType] = useState('existing') // 'existing' 或 'new'
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [newMaterialName, setNewMaterialName] = useState('')

  // 加载入库历史和原材料列表
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
      
      // 加载原材料列表
      loadMaterials();
    };
    loadInitialData();
  }, []);

  // 加载原材料列表
  const loadMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const materialList = await fetchRawMaterials();
      setMaterials(materialList);
    } catch (error) {
      console.error('加载原材料列表失败:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // 处理原材料表单变更
  const handleMaterialFormChange = (field, value) => {
    if (field === 'rawMaterialId') {
      // 当选择原材料时，自动填充相关信息
      const selectedMaterial = materials.find(material => material.id === value);
      if (selectedMaterial) {
        setMaterialForm(prev => ({
          ...prev,
          rawMaterialId: value,
          name: selectedMaterial.name || '',
          specification: selectedMaterial.specification || '',
          unit: selectedMaterial.unit || '',
          inventory: selectedMaterial.quantity || 0
        }));
      } else {
        setMaterialForm(prev => ({ ...prev, rawMaterialId: value, inventory: 0 }));
      }
    } else {
      setMaterialForm(prev => ({ ...prev, [field]: value }));
    }
  };

  // 添加入库项
  const addInboundItem = () => {
    if (materialType === 'existing') {
      // 已有原材料
      if (!materialForm.rawMaterialId) {
        message.error('请选择原材料');
        return;
      }
      if (!materialForm.quantity || materialForm.quantity <= 0) {
        message.error('请输入有效的采购数量');
        return;
      }

      const selectedMaterial = materials.find(m => m.id === materialForm.rawMaterialId);
      const newItem = {
        key: Date.now(),
        type: '原材料',
        rawMaterialId: materialForm.rawMaterialId,
        name: selectedMaterial?.name || '',
        specification: materialForm.specification,
        unit: materialForm.unit,
        inventory: materialForm.inventory,
        quantity: materialForm.quantity,
        remark: materialForm.remark
      };
      setInboundItems(prev => [...prev, newItem]);
    } else {
      // 新原材料
      if (!newMaterialName) {
        message.error('请输入新原材料名称');
        return;
      }
      if (!materialForm.quantity || materialForm.quantity <= 0) {
        message.error('请输入有效的采购数量');
        return;
      }

      const newItem = {
        key: Date.now(),
        type: '原材料',
        rawMaterialId: 0, // 使用0表示新原材料
        name: newMaterialName,
        specification: materialForm.specification,
        unit: materialForm.unit,
        inventory: 0,
        quantity: materialForm.quantity,
        remark: materialForm.remark
      };
      setInboundItems(prev => [...prev, newItem]);
    }

    // 重置原材料表单
    setMaterialForm({
      rawMaterialId: '',
      name: '',
      specification: '',
      unit: '',
      inventory: 0,
      quantity: 1,
      remark: ''
    });
    setNewMaterialName('');
    setMaterialType('existing');
  };

  // 移除入库项
  const removeInboundItem = (key) => {
    setInboundItems(prev => prev.filter(item => item.key !== key));
  };

  // 生成入库单号
  const generateOrderNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toISOString().slice(11, 19).replace(/:/g, '');
    return `RM-IN-${dateStr}-${timeStr}`;
  };

  // 处理新建入库单
  const handleCreateInbound = () => {
    form.resetFields();
    setInboundItems([]);
    setSelectedMaterial(null);
    setMaterialForm({
      rawMaterialId: '',
      name: '',
      specification: '',
      unit: '',
      inventory: 0,
      quantity: 1,
      remark: ''
    });
    setNewMaterialName('');
    // 生成并设置入库单号
    const orderNumber = generateOrderNumber();
    form.setFieldsValue({ orderNumber });
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
      const result = await createRawMaterialInbound({
        orderNumber: values.orderNumber,
        supplier: values.supplier,
        deliveryPerson: values.deliveryPerson,
        inspector: values.inspector,
        inboundPerson: values.inboundPerson,
        inboundDate: values.inboundDate,
        remark: values.remark,
        items: inboundItems
      }, materials);
      
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

  // 确认入库
  const confirmInbound = async (record) => {
    try {
      // 调用API确认入库
      await post('/InOutbound/raw-material-inbounds/confirm', record.id);
      // 更新本地状态
      const updatedHistory = inboundHistory.map(item => {
        if (item.id === record.id) {
          return { ...item, status: '已完成' };
        }
        return item;
      });
      setInboundHistory(updatedHistory);
      message.success('确认入库成功');
    } catch (error) {
      console.error('确认入库失败:', error);
      message.error('确认入库失败');
    }
  };

  // 删除入库单
  const deleteInbound = async (record) => {
    try {
      // 调用API删除入库单
      await del(`/InOutbound/raw-material-inbounds/${record.id}`);
      // 更新本地状态
      const updatedHistory = inboundHistory.filter(item => item.id !== record.id);
      setInboundHistory(updatedHistory);
      message.success('删除入库单成功');
    } catch (error) {
      console.error('删除入库单失败:', error);
      message.error('删除入库单失败');
    }
  };

  // 入库项表格列
  const inboundItemColumns = [
    {
      title: '原材料名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification'
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
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
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
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier'
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
      key: 'status',
      render: (status) => {
        let color = 'default';
        switch (status) {
          case '已完成':
            color = 'green';
            break;
          case '待处理':
            color = 'blue';
            break;
          case '已取消':
            color = 'red';
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => viewInboundDetail(record)}>查看详情</Button>
          <Button 
            type="danger" 
            onClick={() => deleteInbound(record)}
          >
            删除
          </Button>
          {record.status !== '已完成' && (
            <Button 
              type="success" 
              onClick={() => confirmInbound(record)}
            >
              确认入库
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="raw-material-inbound">
      <Card 
        title="原材料采购入库管理" 
        className="mb-4"
        extra={
          <Button type="primary" onClick={handleCreateInbound}>
            新建原材料采购入库单
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

      {/* 新建原材料采购入库单模态框 */}
      <Modal
        title="新建原材料采购入库单"
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
              >
                <Input disabled placeholder="自动生成" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item 
                name="supplier" 
                label="供应商" 
                rules={[{ required: true, message: '请输入供应商' }]}
              >
                <Input placeholder="请输入供应商" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-4">
            {/* 原材料信息表单 */}
            <Col span={24}>
              <Card title="原材料信息" variant="outlined">
                <div className="form-container">
                  {/* 原材料类型选择 */}
                  <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="操作类型">
                        <Select 
                          value={materialType}
                          style={{ width: '100%' }}
                          onChange={(value) => setMaterialType(value)}
                        >
                          <Option value="existing">已有原材料新增</Option>
                          <Option value="new">新原材料增加</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  {/* 原材料信息字段 */}
                  <Row gutter={[16, 16]}>
                    {/* 已有原材料选择 */}
                    {materialType === 'existing' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="原材料名称">
                            <Select 
                              showSearch
                              allowClear
                              value={materialForm.rawMaterialId || undefined}
                              style={{ width: '100%' }}
                              placeholder="请选择原材料名称"
                              loading={materialsLoading}
                              onChange={(value) => handleMaterialFormChange('rawMaterialId', value)}
                              filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              optionLabelProp="label"
                            >
                              {materials.map(material => (
                                <Option key={material.id} value={material.id} label={material.name}>
                                  {material.name} ({material.specification})
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="规格">
                            <Input 
                              value={materialForm.specification}
                              onChange={(e) => handleMaterialFormChange('specification', e.target.value)}
                              placeholder="请输入规格"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
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
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="库存数量">
                            <InputNumber 
                              min={0} 
                              value={materialForm.inventory}
                              style={{ width: '100%' }}
                              placeholder="库存数量"
                              disabled
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
                          <Form.Item label="单位">
                            <Input 
                              value={materialForm.unit}
                              onChange={(e) => handleMaterialFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={5}>
                          <Form.Item label="备注">
                            <Input 
                              value={materialForm.remark}
                              onChange={(e) => handleMaterialFormChange('remark', e.target.value)}
                              placeholder="请输入备注"
                            />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    
                    {/* 新原材料输入 */}
                    {materialType === 'new' && (
                      <>
                        <Col xs={24} sm={12} md={4}>
                          <Form.Item label="原材料名称">
                            <Input 
                              value={newMaterialName}
                              onChange={(e) => setNewMaterialName(e.target.value)}
                              placeholder="请输入新原材料名称"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={3}>
                          <Form.Item label="规格">
                            <Input 
                              value={materialForm.specification}
                              onChange={(e) => handleMaterialFormChange('specification', e.target.value)}
                              placeholder="请输入规格"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={2}>
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
                              value={materialForm.unit}
                              onChange={(e) => handleMaterialFormChange('unit', e.target.value)}
                              placeholder="请输入单位"
                            />
                          </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12} md={5}>
                          <Form.Item label="备注">
                            <Input 
                              value={materialForm.remark}
                              onChange={(e) => handleMaterialFormChange('remark', e.target.value)}
                              placeholder="请输入备注"
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
            <TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" style={{ marginRight: 16 }}>
              提交入库
            </Button>
            <Button onClick={() => {
              form.resetFields();
              setInboundItems([]);
              setSelectedMaterial(null);
              setMaterialForm({
                rawMaterialId: '',
                name: '',
                specification: '',
                unit: '',
                inventory: 0,
                quantity: 1,
                remark: ''
              });
              setNewMaterialName('');
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
                <p><strong>供应商:</strong> {currentInboundDetail.supplier}</p>
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
                { title: '原材料名称', dataIndex: 'name', key: 'name' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单位', dataIndex: 'unit', key: 'unit' },
                { title: '备注', dataIndex: 'remark', key: 'remark' }
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

export default RawMaterialInboundList