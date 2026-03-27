import React, { useState, useEffect } from 'react';

const ScrapEquipmentList = () => {
  const [scrapEquipments, setScrapEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScrapEquipments();
  }, []);

  const fetchScrapEquipments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5055/api/Device/scrap-equipments');
      if (!response.ok) {
        throw new Error('Failed to fetch scrap equipments');
      }
      const data = await response.json();
      setScrapEquipments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setScrapEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个报废设备记录吗？')) {
      try {
        const response = await fetch(`http://localhost:5055/api/Device/scrap-equipments/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to delete scrap equipment');
        }
        fetchScrapEquipments();
      } catch (err) {
        alert('删除失败: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">加载中...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center p-8 text-red-500">错误: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">报废设备列表</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">设备名称</th>
              <th className="py-2 px-4 border-b">报废原因</th>
              <th className="py-2 px-4 border-b">报废日期</th>
              <th className="py-2 px-4 border-b">状态</th>
              <th className="py-2 px-4 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {scrapEquipments.length === 0 ? (
              <tr key="empty">
                <td colSpan="6" className="py-4 px-4 text-center">暂无报废设备记录</td>
              </tr>
            ) : (
              scrapEquipments.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{equipment.id}</td>
                  <td className="py-2 px-4 border-b">{equipment.equipmentName}</td>
                  <td className="py-2 px-4 border-b">{equipment.scrapReason}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(equipment.scrapDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                      {equipment.scrapStatus}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button 
                      onClick={() => handleDelete(equipment.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScrapEquipmentList;