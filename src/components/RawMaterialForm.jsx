import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Upload, message, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const RawMaterialForm = ({ rawMaterial, onSave, onCancel }) => {
  const [form] = Form.useForm()
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if (rawMaterial) {
      form.setFieldsValue(rawMaterial)
      setImageUrl(rawMaterial.image || '')
    } else {
      form.resetFields()
      setImageUrl('')
    }
  }, [rawMaterial, form])

  const handleSubmit = (values) => {
    // 计算剩余数量
    const totalQuantity = values.totalQuantity || 0
    const usedQuantity = values.usedQuantity || 0
    const remainingQuantity = totalQuantity - usedQuantity

    const rawMaterialData = {
      ...values,
      remainingQuantity,
      image: imageUrl,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onSave(rawMaterialData)
  }

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      // 模拟上传成功，实际项目中应该调用真实的上传接口
      setImageUrl(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=raw%20material%20item&image_size=square`)
      message.success(`${info.file.name} 上传成功`)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="productName"
        label="原材料名称"
        rules={[{ required: true, message: '请输入原材料名称' }]}
      >
        <Input placeholder="请输入原材料名称" />
      </Form.Item>

      <Form.Item
        name="brand"
        label="品牌"
      >
        <Input placeholder="请输入品牌" />
      </Form.Item>

      <Form.Item
        name="specification"
        label="规格"
      >
        <Input placeholder="请输入规格" />
      </Form.Item>

      <Form.Item
        name="totalQuantity"
        label="总数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入总数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="usedQuantity"
        label="已用数量"
        rules={[{ type: 'number', min: 0 }]}
      >
        <InputNumber placeholder="请输入已用数量" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="unit"
        label="单位"
      >
        <Input placeholder="请输入单位" />
      </Form.Item>

      <Form.Item
        name="supplier"
        label="供应商"
      >
        <Input placeholder="请输入供应商" />
      </Form.Item>

      <Form.Item
        name="location"
        label="所在仓库"
      >
        <Input placeholder="请输入所在仓库" />
      </Form.Item>

      <Form.Item
        name="company"
        label="所属公司"
      >
        <Input placeholder="请输入所属公司" />
      </Form.Item>

      <Form.Item
        name="remark"
        label="备注"
      >
        <Input.TextArea placeholder="请输入备注" rows={3} />
      </Form.Item>

      <Form.Item
        name="image"
        label="图片"
      >
        <Upload
          name="file"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          onChange={handleUpload}
          listType="picture"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        {imageUrl && (
          <div style={{ marginTop: 10 }}>
            <img src={imageUrl} alt="原材料图片" style={{ width: 100, height: 100, objectFit: 'cover' }} />
          </div>
        )}
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginRight: 10 }}>
          保存
        </Button>
        <Button onClick={onCancel}>
          取消
        </Button>
      </Form.Item>
    </Form>
  )
}

export default RawMaterialForm