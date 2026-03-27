import React, { useState, useEffect } from 'react';

const ScrapEquipmentForm = ({ onSuccess }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [scrapReason, setScrapReason] = useState('');
  const [scrapDate, setScrapDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      // 获取专用设备
      const specialResponse = await fetch('http://localhost:5055/api/Device/special-equipments');
      const specialDevices = await specialResponse.json();
      
      // 获取通用设备
      const generalResponse = await fetch('http://localhost:5055/api/Device/general-equipments');
      const generalDevices = await generalResponse.json();
      
      // 合并设备列表
      const allDevices = [
        ...specialDevices.map(d => ({ ...d, type: '专用设备' })),
        ...generalDevices.map(d => ({ ...d, type: '通用设备' }))
      ];
      
      setDevices(allDevices);
      setError(null);
    } catch (err) {
      setError('获取设备列表失败');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDeviceId || !scrapReason) {
      setError('请填写完整信息');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5055/api/Device/scrap-equipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          equipmentId: parseInt(selectedDeviceId),
          scrapReason,
          scrapDate: new Date(scrapDate).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('提交失败');
      }

      setSuccess(true);
      setSelectedDeviceId('');
      setScrapReason('');
      setScrapDate(new Date().toISOString().split('T')[0]);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // 3秒后清除成功提示
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && devices.length === 0) {
    return <div className="flex justify-center items-center p-8">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">设备报废申请</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          报废申请提交成功！
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">选择设备</label>
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">请选择设备</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.type})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">报废原因</label>
          <textarea
            value={scrapReason}
            onChange={(e) => setScrapReason(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded"
            required
            placeholder="请输入报废原因"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">报废日期</label>
          <input
            type="date"
            value={scrapDate}
            onChange={(e) => setScrapDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '提交中...' : '提交报废申请'}
        </button>
      </form>
    </div>
  );
};

export default ScrapEquipmentForm;