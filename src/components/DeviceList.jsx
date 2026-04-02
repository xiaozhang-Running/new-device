import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, Card, Row, Col, Descriptions, Tag, Image } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons'
import DeviceForm from './DeviceForm'
import FileUpload from './FileUpload'
import { deviceApi, imageApi, cacheManager } from '../services/api'
import { useListData, useImageLoader, useImagePreview } from '../hooks'



const { Option } = Select
const { Search } = Input

// 数据处理函数
const processDeviceData = (data) => {
  const formattedDevices = data.map(item => ({
    id: item.id || item.Id,
    name: item.name || item.Name,
    deviceCode: item.deviceCode || item.DeviceCode,
    serialNumber: item.serialNumber || item.SerialNumber || '',
    brand: item.brand || item.Brand || '',
    model: item.model || item.Model || '',
    quantity: item.quantity || item.Quantity || 1,
    unit: item.unit || item.Unit || '台',
    accessories: item.accessories || item.Accessories || '',
    image: ((item.imageUrl || item.ImageUrl || item.image) || '').replace(/apiapi/g, '/api/') || '',
    imageUrl: ((item.imageUrl || item.ImageUrl || item.image) || '').replace(/apiapi/g, '/api/') || '',
    images: [],
    warehouse: item.warehouse || item.Warehouse || '主仓库',
    company: item.company || item.Company || '',
    status: item.status || item.Status || '正常',
    useStatus: item.useStatus || (item.UseStatus === 0 ? '未使用' : item.UseStatus === 1 ? '使用中' : item.UseStatus === 2 ? '停用' : item.UseStatus === 3 ? '闲置' : '未使用'),
    projectName: item.projectName || item.ProjectName || '',
    projectTime: item.projectTime || item.ProjectTime || '',
    location: item.location || item.Location || '',
    description: item.description || item.Description || '',
    purchaseDate: item.purchaseDate || item.PurchaseDate || new Date().toISOString().split('T')[0],
    purchasePrice: item.purchasePrice || item.PurchasePrice || 0
  }));
  
  // 按设备名称排序
  formattedDevices.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  
  return formattedDevices;
};

const DeviceList = () => {
  // 使用通用列表数据Hook
  const {
    data: devices,
    filteredData: filteredDevices,
    setFilteredData,
    loading,
    error,
    refresh,
    updateItem,
    deleteItem,
    addItem
  } = useListData({
    fetchApi: deviceApi.getSpecialEquipments,
    processData: processDeviceData,
    errorMessage: '获取设备列表失败'
  });

  // 使用图片加载Hook
  const imageLoaderOptions = useMemo(() => ({
    equipmentType: 1,
    loadDelay: 100
  }), []);
  
  const {
    loadImagesBatch,
    getEquipmentImages,
    refreshImages
  } = useImageLoader(imageLoaderOptions);

  // 使用ref存储loadImagesBatch，避免useEffect频繁触发
  const loadImagesBatchRef = useRef(loadImagesBatch);
  useEffect(() => {
    loadImagesBatchRef.current = loadImagesBatch;
  }, [loadImagesBatch]);

  // 使用图片预览Hook
  const {
    previewVisible,
    previewImages,
    currentImageIndex,
    openPreview,
    closePreview,
    setCurrentImageIndex
  } = useImagePreview();

  // 本地状态
  const [showForm, setShowForm] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [useStatusFilter, setUseStatusFilter] = useState('')

  // 缓存设备ID列表，只有当设备ID真正变化时才触发加载
  const deviceIds = useMemo(() => {
    return filteredDevices.map(device => device.id);
  }, [filteredDevices]);

  // 批量加载图片 - 只在设备ID列表真正变化时触发
  useEffect(() => {
    if (deviceIds.length > 0) {
      loadImagesBatchRef.current(deviceIds);
    }
  }, [deviceIds]);

  // 搜索处理
  const handleSearch = useCallback(() => {
    let result = [...devices];
    
    if (searchText) {
      const text = searchText.toLowerCase();
      result = result.filter(device => 
        (device.name && device.name.toLowerCase().includes(text)) ||
        (device.brand && device.brand.toLowerCase().includes(text)) ||
        (device.model && device.model.toLowerCase().includes(text)) ||
        (device.serialNumber && device.serialNumber.toLowerCase().includes(text)) ||
        (device.warehouse && device.warehouse.toLowerCase().includes(text))
      );
    }
    
    if (statusFilter) {
      result = result.filter(device => device.status === statusFilter);
    }
    
    if (useStatusFilter) {
      result = result.filter(device => device.useStatus === useStatusFilter);
    }
    
    setFilteredData(result);
  }, [devices, searchText, statusFilter, useStatusFilter, setFilteredData]);

  // 当搜索条件变化时自动搜索
  useEffect(() => {
    handleSearch();
  }, [searchText, statusFilter, useStatusFilter, handleSearch]);

  const handleAdd = () => {
    setEditingDevice(null);
    setShowForm(true);
  };

  const handleEdit = async (device) => {
    // 确保加载设备的最新图片
    await refreshImages(device.id);
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleDetail = async (device) => {
    // 确保加载设备的最新图片
    await refreshImages(device.id);
    // 获取最新的设备数据
    const updatedDevice = {
      ...device,
      images: getEquipmentImages(device.id).images
    };
    setSelectedDevice(updatedDevice);
    setShowDetail(true);
  };

  const handleImagePreview = (images) => {
    const imageUrls = images.map(img => img.url);
    openPreview(imageUrls, 0);
  };

  const handleDelete = async (id) => {
    try {
      await deviceApi.deleteSpecialEquipment(id);
      deleteItem(id);
      message.success('设备删除成功');
    } catch (error) {
      console.error('删除设备失败:', error);
      message.error('删除设备失败');
    }
  };

  const handleSave = async (device) => {
    try {
      if (device.id) {
        // 编辑现有设备
        await handleUpdateDevice(device);
      } else {
        // 添加新设备
        await handleCreateDevice(device);
      }
    } catch (error) {
      console.error('保存设备失败:', error);
      if (error.message && (error.message.includes('重复键') || error.message.includes('duplicate'))) {
        message.error('设备编号已存在，请输入新的设备编号');
      } else {
        message.error('保存设备失败');
      }
    } finally {
      setShowForm(false);
    }
  };

  const handleUpdateDevice = async (device) => {
    // 获取当前设备的所有图片
    const currentImages = await imageApi.getEquipmentImages(device.id, 1);
    const currentImageIds = currentImages.map(img => img.Id || img.id);
    
    // 获取用户保留的图片ID
    const retainedImageIds = (device.images || [])
      .filter(img => img.id && typeof img.id === 'string' && !img.id.startsWith('temp_'))
      .map(img => img.id);
    
    // 删除用户已移除的图片
    for (const imageId of currentImageIds) {
      if (!retainedImageIds.includes(imageId)) {
        try {
          await imageApi.deleteEquipmentImage(imageId);
        } catch (error) {
          console.error('删除图片失败:', error);
        }
      }
    }
    
    // 上传新的临时图片
    const tempImages = (device.images || [])
      .filter(img => img.id && typeof img.id === 'string' && img.id.startsWith('temp_') && img.originFileObj);
    
    if (tempImages.length > 0) {
      const formData = new FormData();
      tempImages.forEach(img => {
        if (img.originFileObj) {
          formData.append('files', img.originFileObj);
        }
      });
      
      try {
        await imageApi.uploadEquipmentImage(device.id, 1, formData);
      } catch (error) {
        console.error('上传临时图片失败:', error);
        message.error('上传图片失败');
      }
    }
    
    // 清除图片缓存
    cacheManager.invalidate(`equipment-images-${device.id}-1`);
    // 清除设备列表缓存，确保其他用户的修改能够及时反映
    cacheManager.invalidate('special-equipments');
    
    // 获取最新的图片信息
    const updatedImages = await imageApi.getEquipmentImages(device.id, 1);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';
    const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
    const imageUrl = updatedImages && updatedImages.length > 0 
      ? `${cleanBaseUrl}/api/Image/data/${updatedImages[0].Id || updatedImages[0].id}` 
      : '';
    
    // 构建更新的图片数组
    const deviceImages = updatedImages.map(img => ({
      id: img.Id || img.id,
      url: `${cleanBaseUrl}/api/Image/data/${img.Id || img.id}`
    }));
    
    const updatedDevice = await deviceApi.updateSpecialEquipment(device.id, {
      Name: device.name || '',
      DeviceCode: device.deviceCode || '',
      SerialNumber: device.serialNumber || '',
      Brand: device.brand || '',
      Model: device.model || '',
      Quantity: device.quantity || 1,
      Unit: device.unit || '台',
      Accessories: device.accessories || '',
      ImageUrl: imageUrl,
      Warehouse: device.warehouse || '主仓库',
      Company: device.company || '',
      Status: device.status || '正常',
      UseStatus: device.useStatus || '未使用',
      Description: device.description || ''
    });

    // 刷新数据
    await refresh();
    // 刷新图片
    await refreshImages(device.id);
    // 更新设备数据中的图片信息
    updateItem(device.id, {
      image: imageUrl || '',
      imageUrl: imageUrl || '',
      images: deviceImages
    });
    message.success('设备更新成功');
  };

  const handleCreateDevice = async (device) => {
    const deviceData = {
      Name: device.name || '',
      DeviceCode: device.deviceCode || '',
      SerialNumber: device.serialNumber || '',
      Brand: device.brand || '',
      Model: device.model || '',
      Quantity: device.quantity || 1,
      Unit: device.unit || '台',
      Accessories: device.accessories || '',
      ImageUrl: '',
      Warehouse: device.warehouse || '主仓库',
      Company: device.company || '',
      Status: device.status || '正常',
      UseStatus: device.useStatus || '未使用',
      Description: device.description || ''
    };

    const newDevice = await deviceApi.createSpecialEquipment(deviceData);
    
    // 如果有临时图片，上传它们
    if (device.images && device.images.length > 0) {
      const tempImages = device.images.filter(img => 
        img.id && typeof img.id === 'string' && img.id.startsWith('temp_')
      );
      
      if (tempImages.length > 0) {
        const formData = new FormData();
        tempImages.forEach(img => {
          if (img.originFileObj) {
            formData.append('files', img.originFileObj);
          }
        });
        
        try {
          await imageApi.uploadEquipmentImage(newDevice.id || newDevice.Id, 1, formData);
        } catch (error) {
          console.error('上传临时图片失败:', error);
          message.error('上传图片失败');
        }
      }
    }

    // 刷新数据
    await refresh();
    // 刷新图片
    await refreshImages(newDevice.id || newDevice.Id);
    message.success('设备添加成功');
  };

  // 导出设备数据到Excel
  const handleImport = async (data) => {
    try {
      if (!data || data.length === 0) {
        message.warning('没有有效的数据可以导入');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // 获取所有现有的设备，以检查设备编号是否已存在
      const existingDevices = await deviceApi.getSpecialEquipments();
      const existingDeviceCodes = new Set(existingDevices.map(device => device.DeviceCode));

      for (const item of data) {
        try {
          // 验证必填字段
          if (!item['设备名称'] || !item['设备编号']) {
            errorCount++;
            continue;
          }

          // 检查设备编号是否已存在
          const deviceCode = item['设备编号'] || '';
          if (existingDeviceCodes.has(deviceCode)) {
            console.error('设备编号已存在:', deviceCode);
            errorCount++;
            continue;
          }

          // 构建设备数据
          const deviceData = {
            Name: item['设备名称'] || '',
            DeviceCode: deviceCode,
            SerialNumber: item['SN码'] ? String(item['SN码']) : '',
            Brand: item['品牌'] || '',
            Model: item['型号'] || '',
            Quantity: item['数量'] || 1,
            Unit: item['单位'] || '台',
            Accessories: item['配件'] || '',
            ImageUrl: '',
            Warehouse: item['所在仓库'] || '主仓库',
            Company: item['所属公司'] || '',
            Status: item['设备状态'] || '正常',
            UseStatus: item['使用状态'] || '未使用',
            Description: item['描述'] || ''
          };

          // 调用API创建设备
          await deviceApi.createSpecialEquipment(deviceData);
          successCount++;
          // 将新设备的编号添加到集合中，以避免重复导入同一批次中的重复编号
          existingDeviceCodes.add(deviceCode);
        } catch (error) {
          console.error('导入设备失败:', error);
          errorCount++;
        }
      }

      // 刷新设备列表
      await refresh();
      message.success(`成功导入 ${successCount} 条设备，失败 ${errorCount} 条`);
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败: ' + (error.message || '未知错误'));
    }
  };

  const handleExport = async () => {
    try {
      const dataToExport = filteredDevices.length > 0 ? filteredDevices : devices;
      
      if (dataToExport.length === 0) {
        message.warning('没有可导出的数据');
        return;
      }

      const exportData = dataToExport.map(device => ({
        '设备名称': device.name || '',
        '设备编号': device.deviceCode || '',
        'SN码': device.serialNumber || '',
        '品牌': device.brand || '',
        '型号': device.model || '',
        '数量': device.quantity || 0,
        '单位': device.unit || '',
        '配件': device.accessories || '',
        '所在仓库': device.warehouse || '',
        '所属公司': device.company || '',
        '设备状态': device.status || '',
        '使用状态': device.useStatus || '',
        '描述': device.description || ''
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '专用设备');

      const colWidths = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
        { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 20 },
        { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 25 }
      ];
      ws['!cols'] = colWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `专用设备清单_${timestamp}.xlsx`;

      XLSX.writeFile(wb, fileName);
      message.success(`成功导出 ${exportData.length} 条设备数据`);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败: ' + (error.message || '未知错误'));
    }
  };

  const handleClearAll = async () => {
    try {
      await deviceApi.clearAllSpecialEquipments();
      // 刷新设备列表
      await refresh();
      message.success('所有专用设备已清空');
    } catch (error) {
      console.error('清空设备失败:', error);
      message.error('清空设备失败');
    }
  };

  const columns = [
    { title: '设备名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '设备编号', dataIndex: 'deviceCode', key: 'deviceCode', width: 120 },
    { title: 'SN码', dataIndex: 'serialNumber', key: 'serialNumber', width: 120 },
    { title: '品牌', dataIndex: 'brand', key: 'brand', width: 100 },
    { title: '型号', dataIndex: 'model', key: 'model', width: 150 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80, align: 'center' },
    { title: '配件', dataIndex: 'accessories', key: 'accessories', width: 150, ellipsis: true },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images, record) => {
        const deviceImages = getEquipmentImages(record.id);
        const hasImages = deviceImages.images && deviceImages.images.length > 0;
        const displayImage = hasImages ? deviceImages.mainImage : (record.image || null);
        
        return (
          <div 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={async () => {
              if (!hasImages) {
                await refreshImages(record.id);
              }
              const updatedImages = getEquipmentImages(record.id);
              if (updatedImages.images && updatedImages.images.length > 0) {
                handleImagePreview(updatedImages.images);
              } else {
                message.info('该设备暂无图片');
              }
            }}
          >
            {displayImage ? (
              <img 
                src={displayImage} 
                alt="设备图片" 
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <div 
                style={{ 
                  width: 60, 
                  height: 60, 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px'
                }}
              >
                无图片
              </div>
            )}
            {hasImages && deviceImages.images.length > 1 && (
              <div style={{ 
                position: 'absolute', bottom: 0, right: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white', 
                fontSize: '12px', padding: '2px 6px', borderRadius: '10px'
              }}>
                +{deviceImages.images.length - 1}
              </div>
            )}
          </div>
        );
      }
    },
    { title: '所在仓库', dataIndex: 'warehouse', key: 'warehouse', width: 100 },
    { title: '所属公司', dataIndex: 'company', key: 'company', width: 120 },
    {
      title: '设备状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = '';
        switch (status) {
          case '正常': color = 'green'; break;
          case '待维修': color = 'orange'; break;
          case '报废': color = 'red'; break;
          default: color = 'blue';
        }
        return <span style={{ color }}>{status}</span>;
      }
    },
    {
      title: '使用状态',
      dataIndex: 'useStatus',
      key: 'useStatus',
      width: 150,
      render: (useStatus, record) => {
        let color = '';
        switch (useStatus) {
          case '使用中': color = 'green'; break;
          case '未使用': color = 'gray'; break;
          default: color = 'gray';
        }
        if (useStatus === '使用中' && (record.projectName || record.projectTime)) {
          return (
            <div style={{ color }} title={`项目名称: ${record.projectName || '未知'}\n项目时间: ${record.projectTime || '未知'}`}>
              {useStatus}
              {record.projectName && <div style={{ fontSize: '12px', marginTop: '2px' }}>{record.projectName}</div>}
              {record.projectTime && <div style={{ fontSize: '11px', color: '#666' }}>{record.projectTime}</div>}
            </div>
          );
        }
        return <span style={{ color }}>{useStatus}</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleDetail(record)}>查看</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm
            title="确定要删除这个设备吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 计算设备状态统计
  const statusStats = {
    normal: devices.filter(device => device.status === '正常').length,
    repair: devices.filter(device => device.status === '待维修').length,
    scrap: devices.filter(device => device.status === '报废').length,
    other: devices.filter(device => {
      const status = device.status;
      return status !== '正常' && status !== '待维修' && status !== '报废';
    }).length,
    total: devices.length
  };

  return (
    <div className="device-list">
      <div className="page-header">
        <h2>专用设备管理</h2>
        <Space>
          <FileUpload onImport={handleImport} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加设备</Button>
          <Button onClick={handleExport}>导出设备</Button>
          <Popconfirm
            title="确定要清空所有专用设备吗？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />}>清空设备</Button>
          </Popconfirm>
        </Space>
      </div>
      
      {/* 设备状态统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card>
            <div className="stat-card">
              <h3>设备总数</h3>
              <p className="stat-number">{statusStats.total}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#52c41a' }}>
              <h3>正常设备</h3>
              <p className="stat-number">{statusStats.normal}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#faad14' }}>
              <h3>待维修设备</h3>
              <p className="stat-number">{statusStats.repair}</p>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <div className="stat-card" style={{ color: '#f5222d' }}>
              <h3>报废设备</h3>
              <p className="stat-number">{statusStats.scrap}</p>
            </div>
          </Card>
        </Col>
        {statusStats.other > 0 && (
          <Col span={3}>
            <Card>
              <div className="stat-card" style={{ color: '#1890ff' }}>
                <h3>其他状态设备</h3>
                <p className="stat-number">{statusStats.other}</p>
              </div>
            </Card>
          </Col>
        )}
      </Row>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Search
              placeholder="搜索设备名称、品牌、型号或序列号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => handleSearch()}
              onPressEnter={() => handleSearch()}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
              enterButton
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="按状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="正常">正常</Option>
              <Option value="待维修">待维修</Option>
              <Option value="报废">报废</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="按使用状态筛选"
              value={useStatusFilter}
              onChange={setUseStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="使用中">使用中</Option>
              <Option value="未使用">未使用</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={() => {
                setSearchText('');
                setStatusFilter('');
                setUseStatusFilter('');
              }}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Table 
        columns={columns} 
        dataSource={filteredDevices} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个设备` }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingDevice ? '编辑设备' : '添加设备'}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={700}
      >
        <DeviceForm 
          device={editingDevice}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          deviceType="special"
        />
      </Modal>

      {/* 设备详情模态框 */}
      <Modal
        title="设备详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[<Button key="close" onClick={() => setShowDetail(false)}>关闭</Button>]}
        width={800}
      >
        {selectedDevice && (
          <>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="设备名称">{selectedDevice.name}</Descriptions.Item>
                  <Descriptions.Item label="设备编号">{selectedDevice.deviceCode}</Descriptions.Item>
                  <Descriptions.Item label="SN码">{selectedDevice.serialNumber}</Descriptions.Item>
                  <Descriptions.Item label="品牌">{selectedDevice.brand}</Descriptions.Item>
                  <Descriptions.Item label="型号">{selectedDevice.model}</Descriptions.Item>
                  <Descriptions.Item label="数量">{selectedDevice.quantity}</Descriptions.Item>
                  <Descriptions.Item label="单位">{selectedDevice.unit}</Descriptions.Item>
                  <Descriptions.Item label="配件">{selectedDevice.accessories || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="所在仓库">{selectedDevice.warehouse}</Descriptions.Item>
                  <Descriptions.Item label="所属公司">{selectedDevice.company}</Descriptions.Item>
                  <Descriptions.Item label="设备状态">
                    <Tag color={selectedDevice.status === '正常' ? 'green' : selectedDevice.status === '待维修' ? 'orange' : 'red'}>
                      {selectedDevice.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="使用状态">
                    <Tag color={selectedDevice.useStatus === '使用中' ? 'green' : 'gray'}>
                      {selectedDevice.useStatus}
                    </Tag>
                  </Descriptions.Item>
                  {selectedDevice.useStatus === '使用中' && (
                    <>
                      <Descriptions.Item label="项目名称">{selectedDevice.projectName || '-'}</Descriptions.Item>
                      <Descriptions.Item label="项目时间">{selectedDevice.projectTime || '-'}</Descriptions.Item>
                    </>
                  )}
                  <Descriptions.Item label="描述">{selectedDevice.description || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            {/* 显示设备图片 */}
            {selectedDevice.images && selectedDevice.images.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4>设备图片</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {selectedDevice.images.map((img, index) => (
                    <div key={`detail-image-${index}`} style={{ cursor: 'pointer' }} onClick={() => handleImagePreview(selectedDevice.images)}>
                      <Image src={img.url} style={{ width: 150, height: 150, objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
      
      {/* 图片预览模态框 */}
      <Modal
        title={`图片预览 (${currentImageIndex + 1}/${previewImages.length})`}
        open={previewVisible}
        onCancel={closePreview}
        footer={[<Button key="close" onClick={closePreview}>关闭</Button>]}
        width={800}
      >
        {previewImages.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <Image src={previewImages[currentImageIndex]} style={{ maxWidth: '100%', maxHeight: 500 }} />
            {previewImages.length > 1 && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
                <Button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? previewImages.length - 1 : prev - 1))}>上一张</Button>
                <Button onClick={() => setCurrentImageIndex((prev) => (prev === previewImages.length - 1 ? 0 : prev + 1))}>下一张</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeviceList;