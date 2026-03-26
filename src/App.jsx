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
import SpecialEquipmentPurchaseInbound from './components/SpecialEquipmentPurchaseInbound'
import GeneralEquipmentPurchaseInbound from './components/GeneralEquipmentPurchaseInbound'
import ConsumablePurchaseInbound from './components/ConsumablePurchaseInbound'
import WarehouseSettings from './components/WarehouseSettings'
import CompanySettings from './components/CompanySettings'
import LoginForm from './components/LoginForm'

const { Header, Sider, Content } = Layout

function App() {
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [scrapView, setScrapView] = useState('list') // 'list' or 'form'

  // 处理登录
  const handleLogin = (userData) => {
    setUser(userData)
    setLoginVisible(false)
  }

  // 处理登出
  const handleLogout = () => {
    setUser(null)
    setLoginVisible(true)
    message.success('登出成功')
  }

  // 处理菜单点击
  const handleMenuClick = (e) => {
    setSelectedKey(e.key)
  }

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
      case 'special-equipment-purchase-inbound':
        return <SpecialEquipmentPurchaseInbound />
      case 'general-equipment-purchase-inbound':
        return <GeneralEquipmentPurchaseInbound />
      case 'consumable-purchase-inbound':
        return <ConsumablePurchaseInbound />
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
                    key: 'special-equipment-purchase-inbound',
                    label: '专用设备入库'
                  },
                  {
                    key: 'general-equipment-purchase-inbound',
                    label: '通用设备入库'
                  },
                  {
                    key: 'consumable-purchase-inbound',
                    label: '耗材入库'
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

  return loginVisible ? <LoginForm onLogin={handleLogin} /> : renderLayout()
}

export default App