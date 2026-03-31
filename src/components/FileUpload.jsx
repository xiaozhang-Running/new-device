import React, { useState } from 'react'
import { Upload, Button, message, Modal, Table } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'

const FileUpload = ({ onImport, module = 'device' }) => {
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [columns, setColumns] = useState([])

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
        setPreviewData(jsonData)
        
        // 动态生成列名
        if (jsonData.length > 0) {
          const keys = Object.keys(jsonData[0])
          const dynamicColumns = keys.map(key => ({
            title: key,
            dataIndex: key,
            key: key
          }))
          setColumns(dynamicColumns)
        } else {
          setColumns([])
          message.warning('Excel文件为空或格式不正确')
        }
        
        setPreviewVisible(true)
      } catch (error) {
        message.error('Excel文件解析失败：' + error.message)
        console.error('Excel解析错误:', error)
      }
    }
    reader.onerror = (error) => {
      message.error('文件读取失败：' + error.message)
      console.error('文件读取错误:', error)
    }
    reader.readAsBinaryString(file)
    return false
  }

  const handleImport = () => {
    // 数据验证
    let validatedData = []
    let errorMessage = ''
    let successMessage = ''
    
    if (module === 'consumable') {
      // 耗材模块：只检查必填字段：耗材名称
      validatedData = previewData.filter(item => {
        const name = item['耗材名称'] || item['名称'] || item['consumableName'] || item.name
        return name
      })
      
      if (validatedData.length === 0) {
        errorMessage = '没有有效的数据可以导入，请检查Excel文件格式，确保包含耗材名称'
        message.error(errorMessage)
        return
      }
      successMessage = `成功导入 ${validatedData.length} 个耗材`
    } else if (module === 'rawMaterial') {
      // 原材料模块：只检查必填字段：原材料名称
      validatedData = previewData.filter(item => {
        const name = item['原材料名称'] || item['名称'] || item['productName'] || item.name
        return name
      })
      
      if (validatedData.length === 0) {
        errorMessage = '没有有效的数据可以导入，请检查Excel文件格式，确保包含原材料名称'
        message.error(errorMessage)
        return
      }
      successMessage = `成功导入 ${validatedData.length} 个原材料`
    } else {
      // 设备模块：检查设备名称和设备编号
      validatedData = previewData.filter(item => {
        const name = item['设备名称'] || item['名称'] || item['deviceName'] || item.name
        const deviceCode = item['设备编号'] || item['编号'] || item['deviceCode'] || item.deviceCode
        
        return name && deviceCode
      })
      
      if (validatedData.length === 0) {
        errorMessage = '没有有效的数据可以导入，请检查Excel文件格式，确保包含设备名称和设备编号'
        message.error(errorMessage)
        return
      }
      successMessage = `成功导入 ${validatedData.length} 个设备`
    }
    
    onImport(validatedData)
    setFileList([])
    setPreviewVisible(false)
    message.success(successMessage)
  }

  return (
    <div className="file-upload">
      <Upload
        name="file"
        accept=".xlsx, .xls"
        fileList={fileList}
        beforeUpload={handleUpload}
        onRemove={() => setFileList([])}
      >
        <Button icon={<UploadOutlined />}>导入Excel文件</Button>
      </Upload>

      <Modal
        title="文件预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPreviewVisible(false)}>
            取消
          </Button>,
          <Button key="import" type="primary" onClick={handleImport}>
            导入
          </Button>
        ]}
        width={800}
      >
        <Table 
          columns={columns} 
          dataSource={previewData.map((item, index) => ({ ...item, key: index }))} 
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  )
}

export default FileUpload