import { useState } from 'react'
import { Layout, Menu, Button, Space, message } from 'antd'
import { 
  DashboardOutlined, 
  ShopOutlined, 
  ToolOutlined, 
  AppstoreOutlined, 
  MedicineBoxOutlined, 
  BranchesOutlined, 
  BuildOutlined, 
  DeleteOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  UserOutlined, 
  HistoryOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import './App.css'
import DeviceList from './components/DeviceList'
import GeneralDeviceList from './components/GeneralDeviceList'
import ConsumableList from './components/ConsumableList'
import RawMaterialList from './components/RawMaterialList'
import RepairEquipmentList from './components/RepairEquipmentList'
import ScrapEquipmentList from './components/ScrapEquipmentList'
import ScrapEquipmentForm from './components/ScrapEquipmentForm'
import ProjectOutbound from './components/ProjectOutbound'
import ProjectInbound from './components/ProjectInbound'
import RawMaterialOutboundList from './components/RawMaterialOutboundList'
import RawMaterialInboundList from './components/RawMaterialInboundList'
import UserList from './components/UserList'
import LogList from './components/LogList'
import InventoryManagement from './components/InventoryManagement'
import EquipmentPurchaseInbound from './components/EquipmentPurchaseInbound'
import WarehouseSettings from './components/WarehouseSettings'
import CompanySettings from './components/CompanySettings'
import { userApi } from './services/api'

const { Header, Sider, Content } = Layout

// 模拟用户数据
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: '系统管理员' },
  { id: 2, username: 'warehouse', password: 'warehouse123', role: '仓库管理员' },
  { id: 3, username: 'project', password: 'project123', role: '项目负责人' },
  { id: 4, username: 'finance', password: 'finance123', role: '财务人员' }
]

function App() {
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrapView, setScrapView] = useState('list') // 'list' or 'form'

  // 处理登录
  const handleLogin = async () => {
    setLoading(true)
    try {
      // 尝试使用API登录
      const response = await userApi.login({ Username: username, Password: password })
      setUser({
        id: 1,
        username: response.Username,
        role: response.Role
      })
      setLoginVisible(false)
      message.success('登录成功')
    } catch (error) {
      // 如果API登录失败，回退到模拟登录
      console.warn('API登录失败，使用模拟登录:', error)
      const foundUser = mockUsers.find(u => u.username === username && u.password === password)
      if (foundUser) {
        setUser(foundUser)
        setLoginVisible(false)
        message.success('登录成功')
      } else {
        message.error('用户名或密码错误')
      }
    } finally {
      setLoading(false)
    }
  }

  // 处理登出
  const handleLogout = () => {
    setUser(null)
    setLoginVisible(true)
    setUsername('')
    setPassword('')
    message.success('登出成功')
  }

  // 处理菜单点击
  const handleMenuClick = (e) => {
    setSelectedKey(e.key)
  }

  // 渲染登录表单
  const renderLoginForm = () => (
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
  )

  // 渲染看板页面
  const renderDashboard = () => (
    <div className="dashboard">
      <h2>系统看板</h2>
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon">
            <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </div>
          <div className="card-content">
            <h3>库存总值</h3>
            <p>¥ 1,250,000</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <ToolOutlined style={{ fontSize: 24, color: '#52c41a' }} />
          </div>
          <div className="card-content">
            <h3>设备总数</h3>
            <p>128</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <BuildOutlined style={{ fontSize: 24, color: '#faad14' }} />
          </div>
          <div className="card-content">
            <h3>待维修设备</h3>
            <p>12</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <DeleteOutlined style={{ fontSize: 24, color: '#f5222d' }} />
          </div>
          <div className="card-content">
            <h3>报废设备</h3>
            <p>5</p>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染主内容
  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return renderDashboard()
      case 'inventory':
        return <InventoryManagement />
      case 'special-device':
        return <DeviceList />
      case 'general-device':
        return <GeneralDeviceList />
      case 'consumables':
        return <ConsumableList />
      case 'raw-materials':
        return <RawMaterialList />
      case 'repair':
        return <RepairEquipmentList />
      case 'scrap':
        return (
          <div className="page-content">
            <div className="flex justify-between items-center mb-4">
              <h2>报废设备管理</h2>
              <div>
                <Button 
                  type={scrapView === 'list' ? 'primary' : 'default'}
                  onClick={() => setScrapView('list')}
                  style={{ marginRight: 8 }}
                >
                  报废设备列表
                </Button>
                <Button 
                  type={scrapView === 'form' ? 'primary' : 'default'}
                  onClick={() => setScrapView('form')}
                >
                  设备报废申请
                </Button>
              </div>
            </div>
            {scrapView === 'list' ? (
              <ScrapEquipmentList />
            ) : (
              <ScrapEquipmentForm onSuccess={() => setScrapView('list')} />
            )}
          </div>
        )
      case 'outbound':
        return <div className="page-content"><h2>出库管理</h2><p>出库管理功能正在开发中...</p></div>
      case 'project-outbound':
        return <ProjectOutbound />
      case 'raw-material-outbound':
        return <RawMaterialOutboundList />
      case 'inbound':
        return <div className="page-content"><h2>入库管理</h2><p>入库管理功能正在开发中...</p></div>
      case 'project-inbound':
        return <ProjectInbound />
      case 'equipment-purchase-inbound':
        return <EquipmentPurchaseInbound />
      case 'raw-material-inbound':
        return <RawMaterialInboundList />
      case 'warehouse-settings':
        return <WarehouseSettings />
      case 'company-settings':
        return <CompanySettings />
      case 'users':
        return <UserList />
      case 'logs':
        return <LogList />
      default:
        return renderDashboard()
    }
  }

  // 渲染系统布局
  const renderLayout = () => (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        backgroundColor: '#1890ff', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ShopOutlined style={{ fontSize: 24, marginRight: 16 }} />
          <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>设备仓库管理系统</h1>
        </div>
        <Space style={{ color: 'white' }}>
          <span>欢迎，{user?.username} ({user?.role})</span>
          <Button 
            type="text" 
            icon={<LogoutOutlined />} 
            style={{ color: 'white' }} 
            onClick={handleLogout}
          >
            登出
          </Button>
        </Space>
      </Header>
      <Layout>
        <Sider width={200} style={{ backgroundColor: '#f0f2f5' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: '看板'
              },
              {
                key: 'inventory',
                icon: <ShopOutlined />,
                label: '库存管理'
              },
              {
                key: 'special-device',
                icon: <ToolOutlined />,
                label: '专用设备管理'
              },
              {
                key: 'general-device',
                icon: <AppstoreOutlined />,
                label: '通用设备管理'
              },
              {
                key: 'consumables',
                icon: <MedicineBoxOutlined />,
                label: '耗材管理'
              },
              {
                key: 'raw-materials',
                icon: <BranchesOutlined />,
                label: '原材料管理'
              },
              {
                key: 'repair',
                icon: <BuildOutlined />,
                label: '待维修设备管理'
              },
              {
                key: 'scrap',
                icon: <DeleteOutlined />,
                label: '报废设备管理'
              },
              {
                key: 'outbound',
                icon: <ExportOutlined />,
                label: '出库管理',
                children: [
                  {
                    key: 'project-outbound',
                    label: '项目出库'
                  },
                  {
                    key: 'raw-material-outbound',
                    label: '原材料出库'
                  }
                ]
              },
              {
                key: 'inbound',
                icon: <ImportOutlined />,
                label: '入库管理',
                children: [
                  {
                    key: 'project-inbound',
                    label: '项目入库'
                  },
                  {
                    key: 'equipment-purchase-inbound',
                    label: '设备采购入库'
                  },
                  {
                    key: 'raw-material-inbound',
                    label: '原材料入库'
                  }
                ]
              },
              {
                key: 'warehouse',
                icon: <SettingOutlined />,
                label: '仓库管理',
                children: [
                  {
                    key: 'warehouse-settings',
                    label: '仓库设置'
                  },
                  {
                    key: 'company-settings',
                    label: '公司设置'
                  }
                ]
              },
              {
                key: 'users',
                icon: <UserOutlined />,
                label: '用户管理'
              },
              {
                key: 'logs',
                icon: <HistoryOutlined />,
                label: '日志管理'
              }
            ]}
          />
        </Sider>
        <Content style={{ padding: '24px' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )

  return loginVisible ? renderLoginForm() : renderLayout()
}

export default App