import { useState, useEffect, useRef } from 'react'
import { Button, message } from 'antd'
import {
  ShopOutlined,
  ToolOutlined,
  BuildOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  UserOutlined
} from '@ant-design/icons'
import * as echarts from 'echarts'
import { deviceApi, projectOutboundApi, projectInboundApi } from '../services/api'

const Dashboard = () => {
  // 看板数据状态
  const [dashboardData, setDashboardData] = useState({
    totalDevices: 0,
    lentDevices: 0,
    repairDevices: 0,
    scrapDevices: 0,
    consumablesCount: 0,
    consumablesTotal: 0,
    rawMaterialsCount: 0,
    rawMaterialsTotal: 0,
    monthlyOutbound: 0,
    monthlyInbound: 0,
    recentOutbound: [],
    recentInbound: [],
    deviceStatus: {
      normal: 0,
      repair: 0,
      lent: 0,
      scrap: 0
    },
    inventoryAlerts: [],
    outboundTrend: [],
    inboundTrend: [],
    specialDevicesCount: 0,
    generalDevicesCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  
  // 图表refs
  const statusChartRef = useRef(null)
  const outboundTrendChartRef = useRef(null)
  const inboundTrendChartRef = useRef(null)
  const inventoryCategoryChartRef = useRef(null)
  const inOutComparisonChartRef = useRef(null)
  const statusChart = useRef(null)
  const outboundTrendChart = useRef(null)
  const inboundTrendChart = useRef(null)
  const inventoryCategoryChart = useRef(null)
  const inOutComparisonChart = useRef(null)
  
  // 获取看板数据
  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 获取设备数据
      let specialDevices = []
      let generalDevices = []
      let consumables = []
      let rawMaterials = []
      let outboundData = []
      let inboundData = []
      let errorCount = 0
      
      try {
        specialDevices = await deviceApi.getSpecialInventoryDevices()
      } catch (error) {
        console.error('获取专用设备数据失败:', error)
        errorCount++
      }
      
      try {
        generalDevices = await deviceApi.getGeneralInventoryDevices()
      } catch (error) {
        console.error('获取通用设备数据失败:', error)
        errorCount++
      }
      
      try {
        consumables = await deviceApi.getConsumables()
      } catch (error) {
        console.error('获取耗材数据失败:', error)
        errorCount++
      }
      
      try {
        rawMaterials = await deviceApi.getRawMaterials()
      } catch (error) {
        console.error('获取原材料数据失败:', error)
        errorCount++
      }
      
      try {
        outboundData = await projectOutboundApi.getProjectOutbounds(false)
      } catch (error) {
        console.error('获取出库数据失败:', error)
        errorCount++
      }
      
      try {
        inboundData = await projectInboundApi.getProjectInbounds(false)
      } catch (error) {
        console.error('获取入库数据失败:', error)
        errorCount++
      }
      
      // 计算设备总数
      const totalDevices = specialDevices.length + generalDevices.length
      
      // 计算待维修设备数
      const repairDevices = specialDevices.filter(d => d.status === '待维修').length + 
                         generalDevices.filter(d => d.status === '待维修').length
      
      // 计算报废设备数
      const scrapDevices = specialDevices.filter(d => d.status === '报废').length + 
                        generalDevices.filter(d => d.status === '报废').length
      
      // 计算借出设备数
      const lentDevices = specialDevices.filter(d => d.status === '借出').length + 
                         generalDevices.filter(d => d.status === '借出').length
      
      // 计算耗材统计
      const consumablesCount = consumables.length
      const consumablesTotal = consumables.reduce((sum, item) => sum + (item.remainingQuantity || 0), 0)
      
      // 计算原材料统计
      const rawMaterialsCount = rawMaterials.length
      const rawMaterialsTotal = rawMaterials.reduce((sum, item) => sum + (item.inventoryQuantity || 0), 0)
      
      // 计算本月出库数
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyOutbound = outboundData.filter(item => {
        const date = new Date(item.outboundDate || item.OutboundDate)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      }).length
      
      // 计算本月入库数
      let monthlyInbound = 0
      if (inboundData && Array.isArray(inboundData)) {
        monthlyInbound = inboundData.filter(item => {
          const date = new Date(item.inboundDate || item.InboundDate)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        }).length
      }
      
      // 计算设备状态分布
      const deviceStatus = {
        normal: specialDevices.filter(d => d.status === '正常').length + 
               generalDevices.filter(d => d.status === '正常').length,
        repair: repairDevices,
        lent: specialDevices.filter(d => d.status === '借出').length + 
              generalDevices.filter(d => d.status === '借出').length,
        scrap: scrapDevices
      }
      
      // 计算库存预警
      const inventoryAlerts = []
      consumables.forEach(item => {
        if (item.remainingQuantity < 20) {
          inventoryAlerts.push({
            type: 'warning',
            message: `${item.name}库存不足，剩余${item.remainingQuantity}件`,
            icon: '⚠️'
          })
        }
      })
      
      specialDevices.forEach(item => {
        if (item.inventoryQuantity < 5) {
          inventoryAlerts.push({
            type: 'warning',
            message: `${item.name}库存不足，剩余${item.inventoryQuantity}台`,
            icon: '⚠️'
          })
        }
      })
      
      generalDevices.forEach(item => {
        if (item.inventoryQuantity < 5) {
          inventoryAlerts.push({
            type: 'warning',
            message: `${item.name}库存不足，剩余${item.inventoryQuantity}台`,
            icon: '⚠️'
          })
        }
      })
      
      // 计算一个月前的日期
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      // 按出库日期排序，取最近一个月的记录，然后取前5条
      const recentOutbound = outboundData
        .filter(item => {
          const date = new Date(item.outboundDate || item.OutboundDate)
          return date >= oneMonthAgo
        })
        .sort((a, b) => {
          const dateA = new Date(a.outboundDate || a.OutboundDate)
          const dateB = new Date(b.outboundDate || b.OutboundDate)
          return dateB - dateA
        })
        .slice(0, 5)
      
      // 按入库日期排序，取最近一个月的记录，然后取前5条
      let recentInbound = []
      if (inboundData && Array.isArray(inboundData)) {
        recentInbound = inboundData
          .filter(item => {
            const date = new Date(item.inboundDate || item.InboundDate)
            return date >= oneMonthAgo
          })
          .sort((a, b) => {
            const dateA = new Date(a.inboundDate || a.InboundDate)
            const dateB = new Date(b.inboundDate || b.InboundDate)
            return dateB - dateA
          })
          .slice(0, 5)
      }
      
      // 计算最近6个月的出库趋势
      const outboundTrend = []
      const inboundTrend = []
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
        
        // 计算出库趋势
        const monthOutbound = outboundData.filter(item => {
          const date = new Date(item.outboundDate || item.OutboundDate)
          return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()
        }).length
        outboundTrend.push({
          month: monthStr,
          count: monthOutbound
        })
        
        // 计算入库趋势
        let monthInbound = 0
        if (inboundData && Array.isArray(inboundData)) {
          monthInbound = inboundData.filter(item => {
            const date = new Date(item.inboundDate || item.InboundDate)
            return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()
          }).length
        }
        inboundTrend.push({
          month: monthStr,
          count: monthInbound
        })
      }
      
      setDashboardData({
        totalDevices,
        lentDevices,
        repairDevices,
        scrapDevices,
        consumablesCount,
        consumablesTotal,
        rawMaterialsCount,
        rawMaterialsTotal,
        monthlyOutbound,
        monthlyInbound,
        recentOutbound,
        recentInbound,
        deviceStatus,
        inventoryAlerts,
        outboundTrend,
        inboundTrend,
        specialDevicesCount: specialDevices.length,
        generalDevicesCount: generalDevices.length
      })
      
      // 如果有错误，显示警告信息
      if (errorCount > 0) {
        message.warning(`获取数据时发生 ${errorCount} 个错误，部分数据可能不完整`)
      }
    } catch (error) {
      console.error('获取看板数据失败:', error)
      message.error('获取看板数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }
  
  // 初始加载数据
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  // 渲染图表
  useEffect(() => {
    // 渲染设备状态分布饼图
    if (statusChartRef.current && !loading) {
      try {
        if (statusChart.current) {
          statusChart.current.dispose()
          statusChart.current = null
        }
        statusChart.current = echarts.init(statusChartRef.current)
        
        const option = {
          title: {
            text: '设备状态分布',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['正常', '待维修', '借出', '报废']
          },
          series: [
            {
              name: '设备状态',
              type: 'pie',
              radius: '60%',
              center: ['50%', '60%'],
              data: [
                { value: dashboardData.deviceStatus.normal, name: '正常', itemStyle: { color: '#52c41a' } },
                { value: dashboardData.deviceStatus.repair, name: '待维修', itemStyle: { color: '#faad14' } },
                { value: dashboardData.deviceStatus.lent, name: '借出', itemStyle: { color: '#1890ff' } },
                { value: dashboardData.deviceStatus.scrap, name: '报废', itemStyle: { color: '#ff4d4f' } }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        
        statusChart.current.setOption(option)
      } catch (error) {
        console.error('渲染设备状态图表失败:', error)
      }
    }
    
    // 渲染出库趋势折线图
    if (outboundTrendChartRef.current && !loading) {
      try {
        if (outboundTrendChart.current) {
          outboundTrendChart.current.dispose()
          outboundTrendChart.current = null
        }
        outboundTrendChart.current = echarts.init(outboundTrendChartRef.current)
        
        const option = {
          title: {
            text: '出库趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: dashboardData.outboundTrend.map(item => item.month)
          },
          yAxis: {
            type: 'value',
            name: '数量'
          },
          series: [
            {
              data: dashboardData.outboundTrend.map(item => item.count),
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#1890ff'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: 'rgba(24, 144, 255, 0.5)'
                  }, {
                    offset: 1, color: 'rgba(24, 144, 255, 0.1)'
                  }]
                }
              }
            }
          ]
        }
        
        outboundTrendChart.current.setOption(option)
      } catch (error) {
        console.error('渲染出库趋势图表失败:', error)
      }
    }
    
    // 渲染入库趋势折线图
    if (inboundTrendChartRef.current && !loading) {
      try {
        if (inboundTrendChart.current) {
          inboundTrendChart.current.dispose()
          inboundTrendChart.current = null
        }
        inboundTrendChart.current = echarts.init(inboundTrendChartRef.current)
        
        const option = {
          title: {
            text: '入库趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: dashboardData.inboundTrend.map(item => item.month)
          },
          yAxis: {
            type: 'value',
            name: '数量'
          },
          series: [
            {
              data: dashboardData.inboundTrend.map(item => item.count),
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#52c41a'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                    offset: 0, color: 'rgba(82, 196, 26, 0.5)'
                  }, {
                    offset: 1, color: 'rgba(82, 196, 26, 0.1)'
                  }]
                }
              }
            }
          ]
        }
        
        inboundTrendChart.current.setOption(option)
      } catch (error) {
        console.error('渲染入库趋势图表失败:', error)
      }
    }
    
    // 渲染库存分类占比饼图
    if (inventoryCategoryChartRef.current && !loading) {
      try {
        if (inventoryCategoryChart.current) {
          inventoryCategoryChart.current.dispose()
          inventoryCategoryChart.current = null
        }
        inventoryCategoryChart.current = echarts.init(inventoryCategoryChartRef.current)
        
        const option = {
          title: {
            text: '库存分类占比',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            data: ['专用设备', '通用设备', '耗材', '原材料']
          },
          series: [
            {
              name: '库存分类',
              type: 'pie',
              radius: '60%',
              center: ['50%', '60%'],
              data: [
                { value: dashboardData.specialDevicesCount, name: '专用设备', itemStyle: { color: '#1890ff' } },
                { value: dashboardData.generalDevicesCount, name: '通用设备', itemStyle: { color: '#52c41a' } },
                { value: dashboardData.consumablesCount, name: '耗材', itemStyle: { color: '#faad14' } },
                { value: dashboardData.rawMaterialsCount, name: '原材料', itemStyle: { color: '#eb2f96' } }
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        
        inventoryCategoryChart.current.setOption(option)
      } catch (error) {
        console.error('渲染库存分类占比图表失败:', error)
      }
    }
    
    // 渲染出入库对比趋势图
    if (inOutComparisonChartRef.current && !loading) {
      try {
        if (inOutComparisonChart.current) {
          inOutComparisonChart.current.dispose()
          inOutComparisonChart.current = null
        }
        inOutComparisonChart.current = echarts.init(inOutComparisonChartRef.current)
        
        const option = {
          title: {
            text: '出入库对比趋势',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['出库', '入库'],
            bottom: 0
          },
          xAxis: {
            type: 'category',
            data: dashboardData.outboundTrend.map(item => item.month)
          },
          yAxis: {
            type: 'value',
            name: '数量'
          },
          series: [
            {
              name: '出库',
              data: dashboardData.outboundTrend.map(item => item.count),
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#1890ff'
              }
            },
            {
              name: '入库',
              data: dashboardData.inboundTrend.map(item => item.count),
              type: 'line',
              smooth: true,
              itemStyle: {
                color: '#52c41a'
              }
            }
          ]
        }
        
        inOutComparisonChart.current.setOption(option)
      } catch (error) {
        console.error('渲染出入库对比趋势图表失败:', error)
      }
    }
    
    // 响应式调整
    const handleResize = () => {
      try {
        statusChart.current?.resize()
        outboundTrendChart.current?.resize()
        inboundTrendChart.current?.resize()
        inventoryCategoryChart.current?.resize()
        inOutComparisonChart.current?.resize()
      } catch (error) {
        console.error('调整图表大小失败:', error)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      try {
        if (statusChart.current) {
          statusChart.current.dispose()
          statusChart.current = null
        }
        if (outboundTrendChart.current) {
          outboundTrendChart.current.dispose()
          outboundTrendChart.current = null
        }
        if (inboundTrendChart.current) {
          inboundTrendChart.current.dispose()
          inboundTrendChart.current = null
        }
        if (inventoryCategoryChart.current) {
          inventoryCategoryChart.current.dispose()
          inventoryCategoryChart.current = null
        }
        if (inOutComparisonChart.current) {
          inOutComparisonChart.current.dispose()
          inOutComparisonChart.current = null
        }
      } catch (error) {
        console.error('销毁图表实例失败:', error)
      }
    }
  }, [dashboardData, loading])
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>系统看板</h2>
        <Button 
          type="primary" 
          size="small"
          onClick={fetchDashboardData}
        >
          刷新数据
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon">
            <ToolOutlined style={{ fontSize: 24, color: '#52c41a' }} />
          </div>
          <div className="card-content">
            <h3>设备总数</h3>
            <p>{dashboardData.totalDevices}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <BuildOutlined style={{ fontSize: 24, color: '#faad14' }} />
          </div>
          <div className="card-content">
            <h3>待维修设备</h3>
            <p>{dashboardData.repairDevices}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <DeleteOutlined style={{ fontSize: 24, color: '#f5222d' }} />
          </div>
          <div className="card-content">
            <h3>报废设备</h3>
            <p>{dashboardData.scrapDevices}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </div>
          <div className="card-content">
            <h3>借出设备</h3>
            <p>{dashboardData.lentDevices}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <ExportOutlined style={{ fontSize: 24, color: '#722ed1' }} />
          </div>
          <div className="card-content">
            <h3>本月出库</h3>
            <p>{dashboardData.monthlyOutbound}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <ImportOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
          </div>
          <div className="card-content">
            <h3>本月入库</h3>
            <p>{dashboardData.monthlyInbound}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <MedicineBoxOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
          </div>
          <div className="card-content">
            <h3>耗材种类</h3>
            <p>{dashboardData.consumablesCount}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-icon">
            <ExperimentOutlined style={{ fontSize: 24, color: '#13c2c2' }} />
          </div>
          <div className="card-content">
            <h3>原材料种类</h3>
            <p>{dashboardData.rawMaterialsCount}</p>
          </div>
        </div>
      </div>
      
      {/* 最近出入库记录 */}
      <div className="dashboard-section">
        <h3>最近出入库记录</h3>
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          {/* 最近出库记录 */}
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '12px', color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>最近出库记录</h4>
            <div className="recent-outbound">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
              ) : dashboardData.recentOutbound.length > 0 ? (
                <div className="outbound-list">
                  {dashboardData.recentOutbound.map((item, index) => (
                    <div key={item.id} className="outbound-item">
                      <div className="outbound-info">
                        <div className="outbound-number">
                          出库单号: {item.outboundNumber || item.OutboundNumber}
                        </div>
                        <div className="outbound-project">
                          项目名称: {item.projectName || item.ProjectName}
                        </div>
                        <div className="outbound-date">
                          出库日期: {item.outboundDate ? new Date(item.outboundDate).toISOString().split('T')[0] : (item.OutboundDate ? new Date(item.OutboundDate).toISOString().split('T')[0] : '')}
                        </div>
                      </div>
                      <div className="outbound-status">
                        <span className={`status-badge ${item.isCompleted ? 'completed' : 'pending'}`}>
                          {item.isCompleted ? '已完成' : '待确认'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  暂无出库记录
                </div>
              )}
            </div>
          </div>
          
          {/* 最近入库记录 */}
          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '12px', color: '#52c41a', borderBottom: '2px solid #52c41a', paddingBottom: '8px' }}>最近入库记录</h4>
            <div className="recent-inbound">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
              ) : dashboardData.recentInbound.length > 0 ? (
                <div className="inbound-list">
                  {dashboardData.recentInbound.map((item, index) => (
                    <div key={item.id} className="outbound-item">
                      <div className="outbound-info">
                        <div className="outbound-number">
                          入库单号: {item.inboundNumber || item.InboundNumber}
                        </div>
                        <div className="outbound-project">
                          项目名称: {item.projectName || item.ProjectName}
                        </div>
                        <div className="outbound-date">
                          入库日期: {item.inboundDate ? new Date(item.inboundDate).toISOString().split('T')[0] : (item.InboundDate ? new Date(item.InboundDate).toISOString().split('T')[0] : '')}
                        </div>
                      </div>
                      <div className="outbound-status">
                        <span className={`status-badge ${item.isCompleted ? 'completed' : 'pending'}`}>
                          {item.isCompleted ? '已完成' : '待确认'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  暂无入库记录
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 图表区域 - 一行显示三个图表 */}
      <div className="dashboard-section">
        <h3>数据趋势分析</h3>
        <div className="charts-container" style={{ display: 'flex', gap: '20px', width: '100%' }}>
          {/* 出入库对比趋势 */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : (
              <div ref={inOutComparisonChartRef} style={{ width: '100%', height: '350px' }}></div>
            )}
          </div>
          
          {/* 出库趋势 */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : (
              <div ref={outboundTrendChartRef} style={{ width: '100%', height: '350px' }}></div>
            )}
          </div>
          
          {/* 入库趋势 */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : (
              <div ref={inboundTrendChartRef} style={{ width: '100%', height: '350px' }}></div>
            )}
          </div>
        </div>
      </div>
      
      {/* 新增图表区域 - 库存分类占比和设备状态分布 */}
      <div className="dashboard-section">
        <h3>库存分析</h3>
        <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
          {/* 库存分类占比 */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : (
              <div ref={inventoryCategoryChartRef} style={{ width: '100%', height: '350px' }}></div>
            )}
          </div>
          
          {/* 设备状态分布 */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : (
              <div ref={statusChartRef} style={{ width: '100%', height: '350px' }}></div>
            )}
          </div>
        </div>
      </div>
      
      {/* 库存预警和最近登录用户 */}
      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        {/* 库存预警 */}
        <div className="dashboard-section" style={{ flex: 1 }}>
          <h3>库存预警</h3>
          <div className="inventory-alert">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
            ) : dashboardData.inventoryAlerts.length > 0 ? (
              <>
                {dashboardData.inventoryAlerts
                  .slice(0, showAllAlerts ? undefined : 10)
                  .map((alert, index) => (
                    <div key={index} className={`alert-item ${alert.type}`}>
                      <span className="alert-icon">{alert.icon}</span>
                      <span className="alert-message">{alert.message}</span>
                    </div>
                  ))}
                {dashboardData.inventoryAlerts.length > 10 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button 
                      type="link" 
                      onClick={() => setShowAllAlerts(!showAllAlerts)}
                    >
                      {showAllAlerts ? '收起' : '加载更多'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无库存预警
              </div>
            )}
          </div>
        </div>
        
        {/* 最近登录用户 */}
        <div className="dashboard-section" style={{ flex: 1 }}>
          <h3>当前登录用户</h3>
          <div className="recent-users">
            <div className="user-item" style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
              <UserOutlined style={{ fontSize: 24, color: '#52c41a', marginRight: 12 }} />
              <div>
                <div style={{ fontWeight: 'bold', color: '#262626' }}>
                  {JSON.parse(localStorage.getItem('user') || '{}').username || '未知用户'}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  角色: {JSON.parse(localStorage.getItem('user') || '{}').role || '未知'}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  登录时间: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard