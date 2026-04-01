import { useState } from 'react';
import { Button, message } from 'antd';
import { userApi } from '../services/api';

// 模拟用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: '系统管理员' },
  { id: 2, username: 'warehouse', password: 'warehouse123', role: '仓库管理员' },
  { id: 3, username: 'project', password: 'project123', role: '项目负责人' },
  { id: 4, username: 'finance', password: 'finance123', role: '财务人员' }
];

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 尝试使用API登录
      const response = await userApi.login({ Username: username, Password: password });
      onLogin({
        id: 1,
        username: response.Username || response.username,
        role: response.Role || response.role
      });
      message.success('登录成功');
    } catch (error) {
      // 如果API登录失败，回退到模拟登录
      console.warn('API登录失败，使用模拟登录:', error);
      const foundUser = mockUsers.find(u => u.username === username && u.password === password);
      if (foundUser) {
        // 模拟登录时，生成一个假的token并存储到localStorage中
        // 假token格式: fake-token-<role>-<timestamp>
        // 对角色名称进行编码，避免空格导致的分割问题
        const encodedRole = encodeURIComponent(foundUser.role);
        const fakeToken = `fake-token-${encodedRole}-${Date.now()}`;
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('user', JSON.stringify(foundUser));
        console.log('模拟登录成功，token长度:', fakeToken.length);
        onLogin(foundUser);
        message.success('登录成功');
      } else {
        message.error('用户名或密码错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>设备仓库管理系统</h2>
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
        <div className="login-hint">
          <p>测试账号：</p>
          <p>系统管理员：admin / admin123</p>
          <p>仓库管理员：warehouse / warehouse123</p>
          <p>项目负责人：project / project123</p>
          <p>财务人员：finance / finance123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;