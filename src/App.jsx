import { useState, useEffect } from 'react'
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
import Dashboard from './components/Dashboard'
import DeviceList from './components/DeviceList'
import GeneralDeviceList from './components/GeneralDeviceList'
import ConsumableList from './components/ConsumableList'
import RawMaterialList from './components/RawMaterialList'
import RepairEquipmentList from './components/RepairEquipmentList'
import ScrapEquipmentList from './components/ScrapEquipmentList'
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
import { userApi } from './services/api'

const { Header, Sider, Content } = Layout

function App() {
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)
  const [selectedKey, setSelectedKey] = useState('dashboard')

  // 从localStorage读取登录状态
  useEffect(() => {
    const savedUser = userApi.getCurrentUser()
    if (savedUser) {
      setUser(savedUser)
      setLoginVisible(false)
    }
  }, [])

  // 处理登录
  const handleLogin = (userData) => {
    setUser(userData)
    setLoginVisible(false)
  }

  // 处理登出
  const handleLogout = () => {
    userApi.logout()
    setUser(null)
    setLoginVisible(true)
    message.success('登出成功')
  }

  // 处理菜单点击
  const handleMenuClick = (e) => {
    setSelectedKey(e.key)
  }

  // 角色权限定义
  const rolePermissions = {
    '系统管理员': {
      menus: ['dashboard', 'inventory', 'special-device', 'general-device', 'consumables', 'raw-materials', 'repair', 'scrap', 'outbound', 'project-outbound', 'raw-material-outbound', 'inbound', 'project-inbound', 'special-equipment-purchase-inbound', 'general-equipment-purchase-inbound', 'consumable-purchase-inbound', 'raw-material-inbound', 'warehouse', 'warehouse-settings', 'company-settings', 'users', 'logs']
    },
    '仓库管理员': {
      menus: ['dashboard', 'inventory', 'special-device', 'general-device', 'consumables', 'raw-materials', 'repair', 'scrap', 'outbound', 'project-outbound', 'raw-material-outbound', 'inbound', 'project-inbound', 'special-equipment-purchase-inbound', 'general-equipment-purchase-inbound', 'consumable-purchase-inbound', 'raw-material-inbound']
    },
    '项目负责人': {
      menus: ['dashboard', 'inventory', 'special-device', 'general-device', 'consumables', 'raw-materials', 'outbound', 'project-outbound', 'inbound', 'project-inbound']
    },
    '财务人员': {
      menus: ['dashboard', 'inventory', 'special-device', 'general-device', 'consumables', 'raw-materials', 'logs']
    },
    '普通用户': {
      menus: ['dashboard', 'inventory']
    }
  }

  // 过滤菜单
  const filterMenuItems = (items) => {
    if (!user) {
      return []
    }

    // 获取用户角色，如果角色无效则默认为系统管理员
    const userRole = user.role && rolePermissions[user.role] ? user.role : '系统管理员'
    const userMenus = rolePermissions[userRole].menus

    return items.filter(item => {
      if (userMenus.includes(item.key)) {
        if (item.children) {
          item.children = item.children.filter(child => userMenus.includes(child.key))
        }
        return true
      }
      return false
    })
  }


  // 渲染主内容
  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />
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
            <h2>报废设备管理</h2>
            <ScrapEquipmentList />
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
        return <Dashboard />
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
          <img src="/new-logo.png" alt="系统Logo" style={{ width: '40px', height: '40px', marginRight: 16 }} />
          <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>仓库管理系统</h1>
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
            items={filterMenuItems([
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
            ])}
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