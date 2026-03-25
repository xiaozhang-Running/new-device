import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Select, DatePicker, message, Modal, Descriptions } from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

// 模拟日志数据
const mockLogs = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    activityType: '登录',
    activityDescription: '用户登录系统',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-23 10:00:00')
  },
  {
    id: 2,
    userId: 1,
    username: 'admin',
    activityType: '用户管理',
    activityDescription: '添加新用户 test',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-23 09:30:00')
  },
  {
    id: 3,
    userId: 2,
    username: 'warehouse',
    activityType: '设备管理',
    activityDescription: '更新设备信息',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-23 09:15:00')
  },
  {
    id: 4,
    userId: 3,
    username: 'project',
    activityType: '项目出库',
    activityDescription: '创建项目出库单',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-23 09:00:00')
  },
  {
    id: 5,
    userId: 1,
    username: 'admin',
    activityType: '系统设置',
    activityDescription: '修改系统配置',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-22 18:30:00')
  },
  {
    id: 6,
    userId: 2,
    username: 'warehouse',
    activityType: '入库管理',
    activityDescription: '处理设备采购入库',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-22 15:45:00')
  },
  {
    id: 7,
    userId: 4,
    username: 'finance',
    activityType: '财务操作',
    activityDescription: '生成财务报表',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-22 14:20:00')
  },
  {
    id: 8,
    userId: 3,
    username: 'project',
    activityType: '项目入库',
    activityDescription: '完成项目入库',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    createdAt: dayjs('2026-03-22 11:15:00')
  }
]

const LogList = () => {
  const [logs, setLogs] = useState(mockLogs)
  const [filteredLogs, setFilteredLogs] = useState(mockLogs)
  const [searchText, setSearchText] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

  // 过滤日志
  useEffect(() => {
    let result = [...logs]
    
    if (searchText) {
      result = result.filter(log => 
        log.activityDescription.includes(searchText) || 
        log.username.includes(searchText) ||
        log.ipAddress.includes(searchText)
      )
    }
    
    if (userFilter) {
      result = result.filter(log => log.username === userFilter)
    }
    
    if (typeFilter) {
      result = result.filter(log => log.activityType === typeFilter)
    }
    
    if (dateRange && dateRange.length === 2) {
      result = result.filter(log => 
        log.createdAt.isAfter(dateRange[0]) && 
        log.createdAt.isBefore(dateRange[1].add(1, 'day'))
      )
    }
    
    setFilteredLogs(result)
  }, [logs, searchText, userFilter, typeFilter, dateRange])

  // 获取唯一的用户列表
  const userOptions = Array.from(new Set(logs.map(log => log.username)))
    .map(username => ({ value: username, label: username }))

  // 获取唯一的活动类型列表
  const typeOptions = Array.from(new Set(logs.map(log => log.activityType)))
    .map(type => ({ value: type, label: type }))

  // 处理查看日志详情
  const handleViewLog = (log) => {
    setSelectedLog(log)
    setIsModalVisible(true)
  }

  // 处理刷新日志
  const handleRefresh = () => {
    // 模拟刷新操作
    message.success('日志已刷新')
  }

  // 处理导出日志
  const handleExport = () => {
    // 模拟导出操作
    message.success('日志导出成功')
  }

  // 列定义
  const columns = [
    {
      title: '日志ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      filters: userOptions,
      onFilter: (value, record) => record.username === value
    },
    {
      title: '活动类型',
      dataIndex: 'activityType',
      key: 'activityType',
      width: 120,
      filters: typeOptions,
      onFilter: (value, record) => record.activityType === value
    },
    {
      title: '活动描述',
      dataIndex: 'activityDescription',
      key: 'activityDescription',
      ellipsis: true
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => createdAt.format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          size="small" 
          onClick={() => handleViewLog(record)}
        >
          查看
        </Button>
      )
    }
  ]

  return (
    <div className="log-management">
      <div className="page-header">
        <h2>日志管理</h2>
        <div className="header-actions">
          <Space size="middle">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              刷新
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
            >
              导出
            </Button>
          </Space>
        </div>
      </div>
      
      <div className="filter-section">
        <Space size="middle" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索描述、用户或IP"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择用户"
            value={userFilter}
            onChange={setUserFilter}
            style={{ width: 150 }}
            allowClear
          >
            {userOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择活动类型"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
            allowClear
          >
            {typeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
            placeholder={['开始日期', '结束日期']}
          />
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredLogs}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        scroll={{ x: 1200 }}
      />
      
      <Modal
        title="日志详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="日志ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">{selectedLog.userId}</Descriptions.Item>
            <Descriptions.Item label="用户名">{selectedLog.username}</Descriptions.Item>
            <Descriptions.Item label="活动类型">{selectedLog.activityType}</Descriptions.Item>
            <Descriptions.Item label="活动描述">{selectedLog.activityDescription}</Descriptions.Item>
            <Descriptions.Item label="IP地址">{selectedLog.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="用户代理">{selectedLog.userAgent}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedLog.createdAt.format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default LogList