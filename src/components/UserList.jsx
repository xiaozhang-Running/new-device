import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, message, Popconfirm, Input, Select, DatePicker } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import UserForm from './UserForm'
import dayjs from 'dayjs'
import { userApi } from '../services/api'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const UserList = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // 获取用户数据
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await userApi.getUsers(false)
      // 转换数据格式，确保所有字段都存在
      const formattedUsers = response.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || user.username,
        role: user.role || '普通用户',
        isActive: true, // 后端暂时没有返回这个字段，默认设为true
        isLockedOut: false, // 后端暂时没有返回这个字段，默认设为false
        createdAt: dayjs(), // 后端暂时没有返回这个字段，默认设为当前时间
        lastLoginAt: dayjs() // 后端暂时没有返回这个字段，默认设为当前时间
      }))
      setUsers(formattedUsers)
    } catch (error) {
      message.error('获取用户数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 过滤用户
  useEffect(() => {
    let result = [...users]
    
    if (searchText) {
      result = result.filter(user => 
        user.username.includes(searchText) || 
        user.fullName.includes(searchText) || 
        user.email.includes(searchText)
      )
    }
    
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter)
    }
    
    if (statusFilter) {
      result = result.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }
    
    setFilteredUsers(result)
  }, [users, searchText, roleFilter, statusFilter])

  // 处理添加用户
  const handleAddUser = () => {
    // 先关闭模态框，确保状态重置
    setIsModalVisible(false)
    // 延迟打开模态框，确保状态更新
    setTimeout(() => {
      setEditingUser(null)
      setIsModalVisible(true)
    }, 100)
  }

  // 处理编辑用户
  const handleEditUser = (user) => {
    setEditingUser(user)
    setIsModalVisible(true)
  }

  // 处理删除用户
  const handleDeleteUser = async (userId) => {
    try {
      await userApi.deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
      message.success('用户删除成功')
    } catch (error) {
      message.error('删除用户失败')
    }
  }

  // 处理用户状态切换
  const handleToggleStatus = async (user) => {
    try {
      await userApi.updateUserStatus(user.id, !user.isActive)
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      )
      setUsers(updatedUsers)
      message.success(`用户${user.isActive ? '禁用' : '启用'}成功`)
    } catch (error) {
      message.error('更新用户状态失败')
    }
  }

  // 处理用户锁定/解锁
  const handleToggleLock = async (user) => {
    try {
      await userApi.updateUserLockStatus(user.id, !user.isLockedOut)
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, isLockedOut: !u.isLockedOut } : u
      )
      setUsers(updatedUsers)
      message.success(`用户${user.isLockedOut ? '解锁' : '锁定'}成功`)
    } catch (error) {
      message.error('更新用户锁定状态失败')
    }
  }

  // 处理用户保存
  const handleUserSave = async (userData) => {
    try {
      if (editingUser) {
        // 编辑现有用户
        const updatedUser = await userApi.updateUser(editingUser.id, userData)
        const updatedUsers = users.map(u => 
          u.id === editingUser.id ? { ...u, ...updatedUser, updatedAt: dayjs() } : u
        )
        setUsers(updatedUsers)
        message.success('用户更新成功')
      } else {
        // 添加新用户
        const newUser = await userApi.createUser(userData)
        setUsers([...users, { 
          ...newUser, 
          fullName: newUser.fullName || newUser.username,
          isActive: true,
          isLockedOut: false,
          createdAt: dayjs(),
          lastLoginAt: dayjs()
        }])
        message.success('用户添加成功')
      }
      setIsModalVisible(false)
      // 重置 editingUser，确保下次添加用户时表单为空
      setEditingUser(null)
    } catch (error) {
      message.error('保存用户失败')
      // 即使失败也重置 editingUser
      setEditingUser(null)
    }
  }

  // 角色选项
  const roleOptions = [
    { value: '系统管理员', label: '系统管理员' },
    { value: '仓库管理员', label: '仓库管理员' },
    { value: '项目负责人', label: '项目负责人' },
    { value: '财务人员', label: '财务人员' },
    { value: '普通用户', label: '普通用户' }
  ]

  // 列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: roleOptions,
      onFilter: (value, record) => record.role === value
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <span style={{ color: isActive ? '#52c41a' : '#f5222d' }}>
          {isActive ? '活跃' : '禁用'}
        </span>
      ),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '禁用', value: 'inactive' }
      ],
      onFilter: (value, record) => value === 'active' ? record.isActive : !record.isActive
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 150,
      render: (lastLoginAt) => lastLoginAt ? lastLoginAt.format('YYYY-MM-DD HH:mm') : '从未'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt) => createdAt.format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            >
              删除
            </Button>
          </Popconfirm>
          <Button
            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.isActive ? '禁用' : '启用'}
          </Button>
          {record.isLockedOut ? (
            <Button
              icon={<UnlockOutlined />}
              size="small"
              onClick={() => handleToggleLock(record)}
            >
              解锁
            </Button>
          ) : (
            <Button
              icon={<LockOutlined />}
              size="small"
              onClick={() => handleToggleLock(record)}
            >
              锁定
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>用户管理</h2>
        <div className="header-actions">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        </div>
      </div>
      
      <div className="filter-section">
        <Space size="middle" style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索用户名、姓名或邮箱"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="选择角色"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 150 }}
            allowClear
          >
            {roleOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="active">活跃</Option>
            <Option value="inactive">禁用</Option>
          </Select>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        scroll={{ x: 1200 }}
      />
      
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <UserForm 
          key={editingUser ? editingUser.id : Date.now()} 
          user={editingUser} 
          onSave={handleUserSave} 
          onCancel={() => setIsModalVisible(false)} 
        />
      </Modal>
    </div>
  )
}

export default UserList