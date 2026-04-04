import React, { useState } from 'react'
import { Upload, Button, message, Modal, Table, Alert, Space, Typography, Divider, Card, Row, Col, Tag } from 'antd'
import { UploadOutlined, DownloadOutlined, FileExcelOutlined, InfoCircleOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const { Text, Title } = Typography

// 各模块的模板配置
const moduleTemplates = {
  device: {
    name: '专用设备',
    requiredFields: ['设备名称', '设备编号'],
    optionalFields: ['SN码', '品牌', '型号', '数量', '单位', '配件', '所在仓库', '所属公司', '设备状态', '使用状态', '描述'],
    example: {
      '设备名称': '服务器',
      '设备编号': 'SV001',
      'SN码': 'SN123456789',
      '品牌': 'Dell',
      '型号': 'PowerEdge R740',
      '数量': 1,
      '单位': '台',
      '配件': '电源线、网线',
      '所在仓库': '主仓库',
      '所属公司': '科技有限公司',
      '设备状态': '正常',
      '使用状态': '未使用',
      '描述': '高性能服务器'
    }
  },
  generalDevice: {
    name: '通用设备',
    requiredFields: ['设备名称', '设备编号'],
    optionalFields: ['SN码', '品牌', '型号', '数量', '单位', '配件', '所在仓库', '所属公司', '设备状态', '使用状态', '描述'],
    example: {
      '设备名称': '打印机',
      '设备编号': 'PR001',
      'SN码': 'SN987654321',
      '品牌': 'HP',
      '型号': 'LaserJet Pro',
      '数量': 2,
      '单位': '台',
      '配件': '墨盒、数据线',
      '所在仓库': '主仓库',
      '所属公司': '科技有限公司',
      '设备状态': '正常',
      '使用状态': '使用中',
      '描述': '办公用打印机'
    }
  },
  consumable: {
    name: '耗材',
    requiredFields: ['耗材名称'],
    optionalFields: ['品牌', '型号规格', '总数量', '已用数量', '剩余数量', '单位', '位置', '备注'],
    example: {
      '耗材名称': 'A4打印纸',
      '品牌': '得力',
      '型号规格': 'A4 70g',
      '总数量': 100,
      '已用数量': 20,
      '剩余数量': 80,
      '单位': '包',
      '位置': '仓库A区',
      '备注': '日常办公用品'
    },
    tips: [
      '总数量 = 已用数量 + 剩余数量',
      '如果只填写剩余数量，系统会自动计算总数量',
      '数量字段支持阿拉伯数字，如：100、50、0'
    ]
  },
  rawMaterial: {
    name: '原材料',
    requiredFields: ['原材料名称'],
    optionalFields: ['品牌', '型号规格', '总数量', '已用数量', '单位', '供应商', '位置', '备注'],
    example: {
      '原材料名称': '钢材',
      '品牌': '宝钢',
      '型号规格': 'Q235 10mm',
      '总数量': 500,
      '已用数量': 100,
      '单位': 'kg',
      '供应商': '宝钢集团',
      '位置': '原材料仓库',
      '备注': '建筑用钢材'
    },
    tips: [
      '总数量和已用数量必须为数字',
      '剩余数量 = 总数量 - 已用数量（自动计算）',
      '数量字段支持阿拉伯数字，如：100、50、0'
    ]
  }
}

const FileUpload = ({ onImport, module = 'device', onDownloadTemplate }) => {
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [columns, setColumns] = useState([])
  const [validationResult, setValidationResult] = useState(null)
  const [templateVisible, setTemplateVisible] = useState(false)

  const template = moduleTemplates[module] || moduleTemplates.device

  // 下载模板
  const handleDownloadTemplate = () => {
    if (onDownloadTemplate) {
      onDownloadTemplate()
      return
    }

    // 默认模板生成
    const ws = XLSX.utils.json_to_sheet([template.example])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, template.name)
    XLSX.writeFile(wb, `${template.name}导入模板.xlsx`)
    message.success('模板下载成功')
  }

  const handleUpload = (file) => {
    setFileList([file])
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) {
          message.warning('Excel文件为空或格式不正确')
          setFileList([])
          return
        }

        setPreviewData(jsonData)
        
        // 动态生成列名
        const keys = Object.keys(jsonData[0])
        const dynamicColumns = keys.map(key => ({
          title: key,
          dataIndex: key,
          key: key
        }))
        setColumns(dynamicColumns)
        
        // 验证数据
        validateData(jsonData)
        setPreviewVisible(true)
      } catch (error) {
        message.error('Excel文件解析失败：' + error.message)
        console.error('Excel解析错误:', error)
        setFileList([])
      }
    }
    reader.onerror = (error) => {
      message.error('文件读取失败：' + error.message)
      console.error('文件读取错误:', error)
      setFileList([])
    }
    reader.readAsBinaryString(file)
    return false
  }

  // 验证数据
  const validateData = (data) => {
    const result = {
      total: data.length,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: []
    }

    data.forEach((item, index) => {
      const rowNum = index + 2 // Excel行号从2开始（1是表头）
      let isValid = true

      // 检查必填字段
      template.requiredFields.forEach(field => {
        const value = item[field]
        if (!value || String(value).trim() === '') {
          isValid = false
          result.errors.push({
            row: rowNum,
            field: field,
            message: `第${rowNum}行：${field}不能为空`
          })
        }
      })

      // 检查数量字段是否为数字
      const quantityFields = ['数量', '总数量', '已用数量', '剩余数量']
      quantityFields.forEach(field => {
        if (item[field] !== undefined && item[field] !== '') {
          const num = parseFloat(item[field])
          if (isNaN(num)) {
            result.warnings.push({
              row: rowNum,
              field: field,
              message: `第${rowNum}行：${field} "${item[field]}" 不是有效的数字，将使用0`
            })
          }
        }
      })

      if (isValid) {
        result.valid++
      } else {
        result.invalid++
      }
    })

    setValidationResult(result)
  }

  const handleImport = () => {
    if (!validationResult || validationResult.valid === 0) {
      message.error('没有有效的数据可以导入，请检查Excel文件')
      return
    }

    if (validationResult.invalid > 0) {
      Modal.confirm({
        title: '数据验证警告',
        icon: <WarningOutlined />,
        content: (
          <div>
            <p>共有 {validationResult.total} 条数据：</p>
            <p><CheckCircleOutlined style={{ color: '#52c41a' }} /> 有效数据：{validationResult.valid} 条</p>
            <p><WarningOutlined style={{ color: '#faad14' }} /> 无效数据：{validationResult.invalid} 条</p>
            {validationResult.errors.length > 0 && (
              <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 10 }}>
                <Text type="danger">错误详情：</Text>
                <ul>
                  {validationResult.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}><Text type="danger">{error.message}</Text></li>
                  ))}
                  {validationResult.errors.length > 5 && (
                    <li><Text type="secondary">还有 {validationResult.errors.length - 5} 个错误...</Text></li>
                  )}
                </ul>
              </div>
            )}
            <p style={{ marginTop: 10 }}>是否继续导入有效数据？</p>
          </div>
        ),
        onOk: () => {
          doImport()
        }
      })
    } else {
      doImport()
    }
  }

  const doImport = () => {
    // 过滤出有效数据
    const validData = previewData.filter((item, index) => {
      return validationResult.errors.every(error => error.row !== index + 2)
    })

    onImport(validData)
    setFileList([])
    setPreviewVisible(false)
    setValidationResult(null)
    message.success(`成功导入 ${validData.length} 个${template.name}`)
  }

  // 显示模板说明
  const showTemplateHelp = () => {
    setTemplateVisible(true)
  }

  return (
    <div className="file-upload">
      <Space>
        <Upload
          name="file"
          accept=".xlsx, .xls"
          fileList={fileList}
          beforeUpload={handleUpload}
          onRemove={() => {
            setFileList([])
            setValidationResult(null)
          }}
        >
          <Button icon={<FileExcelOutlined />}>导入Excel文件</Button>
        </Upload>
        
        <Button icon={<InfoCircleOutlined />} onClick={showTemplateHelp}>
          导入说明
        </Button>
      </Space>

      {/* 模板说明弹窗 */}
      <Modal
        title={`${template.name}导入说明`}
        open={templateVisible}
        onCancel={() => setTemplateVisible(false)}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            下载模板文件
          </Button>,
          <Button key="close" onClick={() => setTemplateVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <Alert
          title="导入须知"
          description={`导入${template.name}数据前，请确保Excel文件格式正确。建议先下载模板文件，按照模板格式填写数据。`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Card title="必填字段" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            {template.requiredFields.map(field => (
              <Col key={field}>
                <Tag color="red">{field}</Tag>
              </Col>
            ))}
          </Row>
        </Card>

        <Card title="可选字段" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            {template.optionalFields.map(field => (
              <Col key={field}>
                <Tag color="blue">{field}</Tag>
              </Col>
            ))}
          </Row>
        </Card>

        {template.tips && (
          <Card title="填写提示" size="small">
            <ul>
              {template.tips.map((tip, idx) => (
                <li key={idx}><Text>{tip}</Text></li>
              ))}
            </ul>
          </Card>
        )}

        <Divider />

        <Title level={5}>示例数据</Title>
        <Table
          dataSource={[{ ...template.example, key: 'example' }]}
          columns={Object.keys(template.example).map(key => ({
            title: key,
            dataIndex: key,
            key: key
          }))}
          pagination={false}
          size="small"
          bordered
        />
      </Modal>

      {/* 文件预览弹窗 */}
      <Modal
        title="文件预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            取消
          </Button>,
          <Button 
            key="import" 
            type="primary" 
            onClick={handleImport}
            disabled={!validationResult || validationResult.valid === 0}
          >
            导入 ({validationResult?.valid || 0} 条有效数据)
          </Button>
        ]}
        width={900}
      >
        {validationResult && (
          <Alert
            title="数据验证结果"
            description={
              <Space direction="vertical">
                <Text>共 {validationResult.total} 条数据</Text>
                <Text type="success"><CheckCircleOutlined /> 有效：{validationResult.valid} 条</Text>
                {validationResult.invalid > 0 && (
                  <Text type="warning"><WarningOutlined /> 无效：{validationResult.invalid} 条</Text>
                )}
              </Space>
            }
            type={validationResult.invalid > 0 ? 'warning' : 'success'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {validationResult?.warnings.length > 0 && (
          <Alert
            title="数据警告"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationResult.warnings.slice(0, 3).map((warning, idx) => (
                  <li key={idx}>{warning.message}</li>
                ))}
                {validationResult.warnings.length > 3 && (
                  <li>还有 {validationResult.warnings.length - 3} 个警告...</li>
                )}
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table 
          columns={columns} 
          dataSource={previewData.map((item, index) => ({ ...item, key: index }))} 
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Modal>
    </div>
  )
}

export default FileUpload
