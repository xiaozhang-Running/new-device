import React, { useState, useEffect } from 'react'
import { Table, Button, Space, message, Popconfirm, Card, Row, Col, Descriptions, Tag, Input, Modal } from 'antd'
import { DeleteOutlined, SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import { get, del } from '../services/request'

const { Search } = Input

const ScrapEquipmentList = () => {
  const [scrapEquipments, setScrapEquipments] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedScrap, setSelectedScrap] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [filteredScraps, setFilteredScraps] = useState([])

  // 从API获取报废设备数据
  const fetchScrapEquipments = async () => {
    setLoading(true)
    try {
      const data = await get('/Device/scrap-equipments')
      setScrapEquipments(data)
    } catch (error) {
      message.error('获取报废设备数据失败')
      console.error('Error fetching scrap equipments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScrapEquipments()
  }, [])

  // 过滤报废设备数据
  useEffect(() => {
    let result = [...scrapEquipments]
    
    // 搜索过滤
    if (searchText) {
      const text = searchText.toLowerCase()
      result = result.filter(scrap => 
        scrap.equipmentName?.toLowerCase().includes(text) ||
        scrap.scrapReason?.toLowerCase().includes(text) ||
        scrap.deviceCode?.toLowerCase().includes(text) ||
        scrap.serialNumber?.toLowerCase().includes(text) ||
        scrap.brand?.toLowerCase().includes(text) ||
        scrap.model?.toLowerCase().includes(text)
      )
    }
    
    setFilteredScraps(result)
  }, [scrapEquipments, searchText])

  const handleDelete = async (id) => {
    try {
      await del(`/Device/scrap-equipments/${id}`)
      message.success('报废设备记录删除成功')
      fetchScrapEquipments()
    } catch (error) {
      message.error('删除报废设备记录失败')
      console.error('Error deleting scrap equipment:', error)
    }
  }

  const handleDetail = (scrap) => {
    setSelectedScrap(scrap)
    setShowDetail(true)
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'equipmentName',
      key: 'equipmentName',
      width: 150,
      fixed: 'left'
    },
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      key: 'deviceCode',
      width: 120
    },
    {
      title: 'SN码',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      width: 120
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: '所属公司',
      dataIndex: 'company',
      key: 'company',
      width: 120
    },
    {
      title: '报废原因',
      dataIndex: 'scrapReason',
      key: 'scrapReason',
      width: 200,
      ellipsis: true
    },
    {
      title: '报废日期',
      dataIndex: 'scrapDate',
      key: 'scrapDate',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '状态',
      dataIndex: 'scrapStatus',
      key: 'scrapStatus',
      width: 100,
      render: (status) => (
        <Tag color="red">{status || '已报废'}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary"
            icon={<EyeOutlined />} 
            onClick={() => handleDetail(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这个报废设备记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="scrap-equipment-list">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#f5222d', fontSize: '32px', fontWeight: 'bold' }}>
                {scrapEquipments.length}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>报废设备总数</div>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 搜索和操作区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10} lg={8}>
            <Search
              placeholder="搜索设备名称、编号、SN码、品牌、型号或报废原因"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={14} lg={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => setSearchText('')}
              >
                重置筛选
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchScrapEquipments}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* 数据表格 */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredScraps} 
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          scroll={{ x: 1300 }}
          size="middle"
        />
      </Card>

      {/* 详情模态框 */}
      <Modal
        title="报废设备详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowDetail(false)}>
            关闭
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {selectedScrap && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="设备名称">{selectedScrap.equipmentName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="设备编号">{selectedScrap.deviceCode || '-'}</Descriptions.Item>
                  <Descriptions.Item label="SN码">{selectedScrap.serialNumber || '-'}</Descriptions.Item>
                  <Descriptions.Item label="品牌">{selectedScrap.brand || '-'}</Descriptions.Item>
                  <Descriptions.Item label="型号">{selectedScrap.model || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="数量">{selectedScrap.quantity || 0}</Descriptions.Item>
                  <Descriptions.Item label="单位">{selectedScrap.unit || '-'}</Descriptions.Item>
                  <Descriptions.Item label="配件">{selectedScrap.accessories || '-'}</Descriptions.Item>
                  <Descriptions.Item label="所在仓库">{selectedScrap.warehouse || '-'}</Descriptions.Item>
                  <Descriptions.Item label="所属公司">{selectedScrap.company || '-'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="报废原因">{selectedScrap.scrapReason || '-'}</Descriptions.Item>
                  <Descriptions.Item label="报废日期">{selectedScrap.scrapDate ? new Date(selectedScrap.scrapDate).toLocaleDateString() : '-'}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color="red">{selectedScrap.scrapStatus || '已报废'}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ScrapEquipmentList
