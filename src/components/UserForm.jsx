import { useState, useEffect } from 'react'
import { Form, Input, Select, Switch, Button, Space, message } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'

const { Option } = Select

const UserForm = ({ user, onSave, onCancel }) => {
  const [form] = Form.useForm()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setIsEditing(true)
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      })
    } else {
      setIsEditing(false)
      form.resetFields()
      // 设置默认角色为普通用户
      form.setFieldsValue({
        role: '普通用户'
      })
    }
  }, [user, form])

  // 角色选项
  const roleOptions = [
    { value: '系统管理员', label: '系统管理员' },
    { value: '仓库管理员', label: '仓库管理员' },
    { value: '项目负责人', label: '项目负责人' },
    { value: '财务人员', label: '财务人员' },
    { value: '普通用户', label: '普通用户' }
  ]

  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: '请输入用户名' },
      { min: 3, max: 20, message: '用户名长度应在3-20个字符之间' },
      { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
    ],
    email: [
      { required: false, message: '请输入邮箱' },
      { type: 'email', message: '请输入有效的邮箱地址' }
    ],
    fullName: [
      { required: true, message: '请输入姓名' },
      { min: 2, max: 50, message: '姓名长度应在2-50个字符之间' }
    ],
    role: [
      { required: true, message: '请选择角色' }
    ],
    password: [
      { required: !isEditing, message: '请输入密码' },
      { min: 6, message: '密码长度至少为6个字符' }
    ]
  }

  // 处理表单提交
  const handleSubmit = (values) => {
    try {
      // 构建用户数据
      const userData = {
        Username: values.username,
        Email: values.email,
        FullName: values.fullName,
        Role: values.role
      }

      // 只有在添加新用户或修改密码时才包含密码
      if (!isEditing || values.password) {
        userData.Password = values.password
      }

      onSave(userData)
    } catch (error) {
      message.error('保存失败，请重试')
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      {/* 隐藏字段用于欺骗浏览器自动填充 */}
      <input type="text" style={{ display: 'none' }} autoComplete="username" />
      <input type="password" style={{ display: 'none' }} autoComplete="password" />

      <Form.Item
        name="username"
        label="用户名"
        rules={rules.username}
      >
        <Input placeholder="请输入用户名" disabled={isEditing} autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="fullName"
        label="姓名"
        rules={rules.fullName}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={rules.email}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      <Form.Item
        name="role"
        label="角色"
        rules={rules.role}
      >
        <Select placeholder="请选择角色">
          {roleOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={rules.password}
      >
        <Input.Password
          placeholder={isEditing ? '留空表示不修改密码' : '请输入密码'}
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          autoComplete="new-password"
          onFocus={(e) => {
            // 清除可能由浏览器自动填充的值
            if (isEditing && e.target.value) {
              form.setFieldsValue({ password: '' })
            }
          }}
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="状态"
        valuePropName="checked"
      >
        <Switch checkedChildren="启用" unCheckedChildren="禁用" />
      </Form.Item>

      <Form.Item>
        <Space style={{ float: 'right' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">
            {isEditing ? '更新' : '添加'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default UserForm