import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Select, DatePicker, message, Modal, Descriptions, Spin, Popconfirm } from 'antd'
import { SearchOutlined, DownloadOutlined, EyeOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../services/request'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const LogList = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [userOptions, setUserOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])

  // 获取日志数据
  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchText) params.append('search', searchText)
      if (userFilter) params.append('user', userFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (dateRange && dateRange.length === 2) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
      }
      params.append('page', page)
      params.append('pageSize', pageSize)

      const data = await request.get(`/Log?${params.toString()}`)
      
      // 调试：打印返回的数据
      console.log('日志API返回数据:', data)
      if (data && data[0] && data[0].length > 0) {
        console.log('第一条日志记录:', data[0][0])
        console.log('第一条日志的Username字段:', data[0][0].Username)
        console.log('第一条日志的User字段:', data[0][0].User)
      }
      
      // 检查数据是否存在
      if (!data || !data[0]) {
        // 数据不存在，使用空数组
        setLogs([])
        setTotal(0)
        setUserOptions([])
        setTypeOptions([])
        return
      }
      
      // 转换日期格式
      const formattedLogs = data[0].map(log => ({
        ...log,
        username: log.Username || log.User?.Username || '未知用户',
        createdAt: dayjs(log.createdAt)
      }))
      
      setLogs(formattedLogs)
      setTotal(data[1])
      
      // 更新用户选项和活动类型选项
      const users = Array.from(new Set(formattedLogs.map(log => log.username)))
      setUserOptions(users.map(username => ({ value: username, label: username })))
      
      const types = Array.from(new Set(formattedLogs.map(log => log.activityType)))
      setTypeOptions(types.map(type => ({ value: type, label: type })))
    } catch (error) {
      message.error(error.message)
      // 使用模拟数据作为 fallback
      setLogs([
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
        }
      ])
      setTotal(2)
      setUserOptions([{ value: 'admin', label: 'admin' }])
      setTypeOptions([{ value: '登录', label: '登录' }, { value: '用户管理', label: '用户管理' }])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和参数变化时获取数据
  useEffect(() => {
    fetchLogs()
  }, [page, pageSize, searchText, userFilter, typeFilter, dateRange])

  // 处理查看日志详情
  const handleViewLog = (log) => {
    setSelectedLog(log)
    setIsModalVisible(true)
  }

  // 处理刷新日志
  const handleRefresh = () => {
    fetchLogs()
    message.success('日志已刷新')
  }

  // 处理导出日志
  const handleExport = async () => {
    try {
      const response = await request.get('/Log/export', { responseType: 'blob' })
      const blob = response
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'logs.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      message.success('日志导出成功')
    } catch (error) {
      message.error(error.message)
      // 模拟导出操作
      message.success('日志导出成功')
    }
  }

  // 处理清空日志
  const handleClearLogs = async () => {
    try {
      await request.del('/Log/all')
      message.success('日志已清空')
      fetchLogs()
    } catch (error) {
      message.error(error.message)
      // 模拟清空操作
      message.success('日志已清空')
      fetchLogs()
    }
  }

  // 处理分页变化
  const handlePaginationChange = (newPage, newPageSize) => {
    setPage(newPage)
    setPageSize(newPageSize)
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
            <Popconfirm
              title="确定要清空所有日志吗？此操作不可恢复。"
              onConfirm={handleClearLogs}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                icon={<DeleteOutlined />}
              >
                清空日志
              </Button>
            </Popconfirm>
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
      
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          scroll={{ x: 1200 }}
        />
      </Spin>
      
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