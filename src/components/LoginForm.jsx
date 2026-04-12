import { useState, useEffect } from 'react';
import { Button, message, Checkbox, Form, Input, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { userApi } from '../services/api';

const LoginForm = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 从localStorage加载记住的用户名
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      form.setFieldsValue({ username: savedUsername });
      setRememberMe(true);
    }
  }, [form]);

  // 清除错误信息
  const clearErrorMessage = () => {
    setErrorMessage('');
  };

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 使用API登录
      const response = await userApi.login({ Username: values.username, Password: values.password });
      
      // 记住用户名
      if (values.remember) {
        localStorage.setItem('rememberedUsername', values.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      // 登录成功，传递用户信息
      onLogin({
        id: response.userId || response.UserId || 1,
        username: response.Username || response.username,
        role: response.Role || response.role
      });
      message.success('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      let errorMsg = '登录失败，请检查用户名和密码';
      
      // 根据错误类型提供更具体的提示
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        if (serverMessage.includes('用户不存在')) {
          errorMsg = '用户名不存在，请检查输入';
        } else if (serverMessage.includes('密码错误')) {
          errorMsg = '密码错误，请检查输入（注意大小写和符号）';
        } else if (serverMessage.includes('账号已被锁定')) {
          errorMsg = '账号已被锁定，请联系管理员或1小时后再试';
        } else if (serverMessage.includes('账号未激活')) {
          errorMsg = '账号未激活，请联系管理员';
        } else {
          errorMsg = serverMessage;
        }
      } else if (error.message.includes('网络')) {
        errorMsg = '网络连接失败，请检查网络设置';
      }
      
      setErrorMessage(errorMsg);
      // 3秒后自动清除错误信息
      setTimeout(clearErrorMessage, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form" style={{ width: 400, margin: '0 auto' }}>
        <div className="login-logo" style={{ textAlign: 'center' }}>
          <img 
            src="/company-logo.png" 
            alt="公司Logo" 
            style={{ 
              width: '180px', 
              height: 'auto', 
              marginBottom: '20px', 
              display: 'block', 
              margin: '0 auto 20px' 
            }} 
          />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>仓库管理系统</h2>
        
        {/* 错误提示区域 */}
        {errorMessage && (
          <Alert 
            message="登录失败" 
            description={errorMessage} 
            type="error" 
            showIcon 
            style={{ marginBottom: '20px' }} 
          />
        )}
        
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          onValuesChange={clearErrorMessage}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名长度至少为3个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon" />} 
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>
          

          
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住用户名</Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 40, fontSize: 16 }}
            >
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="#" style={{ marginRight: 20 }}>忘记密码？</a>
            <a href="#">联系管理员</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;