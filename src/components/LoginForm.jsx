import { useState } from 'react';
import { Button, message } from 'antd';
import { userApi } from '../services/api';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 使用API登录
      const response = await userApi.login({ Username: username, Password: password });
      onLogin({
        id: 1,
        username: response.Username || response.username,
        role: response.Role || response.role
      });
      message.success('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-logo" style={{ textAlign: 'center' }}>
          <img src="/company-logo.png" alt="公司Logo" style={{ width: '200px', height: 'auto', marginBottom: '20px', display: 'block', margin: '0 auto 20px' }} />
        </div>
        <h2>仓库管理系统</h2>
        <div className="form-group">
          <label>用户名</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
          />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </div>
        <Button 
          type="primary" 
          onClick={handleLogin} 
          loading={loading}
          style={{ width: '100%', marginTop: 20 }}
        >
          登录
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;