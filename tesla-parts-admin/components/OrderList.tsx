import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Order } from '../types';
import { Search, Truck, CreditCard, Pencil, Check, X, Trash2 } from 'lucide-react';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTtnOrderId, setEditingTtnOrderId] = useState<number | null>(null);
  const [editingTtnValue, setEditingTtnValue] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ApiService.getOrders();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredAndSortedOrders = React.useMemo(() => {
    const filtered = orders.filter(order => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;

      const customerName = `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase();
      const ttn = (order.ttn || '').toLowerCase();
      
      return customerName.includes(query) || ttn.includes(query);
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [orders, sortOrder, searchQuery]);

  const handleUpdateTtn = async (orderId: number) => {
    try {
      const isRemoved = editingTtnValue.trim() === '';
      const newStatus = isRemoved ? 'cancelled' : 'processed';
      await ApiService.updateOrderTtn(orderId, editingTtnValue);
      await ApiService.updateOrderStatus(orderId, newStatus);

      setOrders(prevOrders => prevOrders.map(order =>
        order.id === orderId 
          ? { ...order, ttn: editingTtnValue, status: newStatus } 
          : order
      ));
      setEditingTtnOrderId(null);
      setEditingTtnValue('');
    } catch (e) {
      console.error("Failed to update order", e);
      alert("Failed to update order details");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
    try {
      await ApiService.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error("Failed to delete order", e);
      alert("Failed to delete order");
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'new':
        return { text: 'Нове', className: 'bg-amber-100 text-amber-700' };
      case 'processed':
        return { text: 'Оброблено', className: 'bg-emerald-100 text-emerald-700' };
      case 'cancelled':
        return { text: 'Відмінено', className: 'bg-rose-100 text-rose-700' };
      default:
        return { text: status, className: 'bg-slate-100 text-slate-700' };
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Завантаження...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Пошук за TTN або Ім'ям..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">Сортувати:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="py-2.5 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white text-sm font-bold text-slate-700 transition-all cursor-pointer"
            >
              <option value="newest">Спочатку нові</option>
              <option value="oldest">Спочатку старі</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">ID & Дата</th>
                <th className="px-6 py-5">Клієнт</th>
                <th className="px-6 py-5">Доставка</th>
                <th className="px-6 py-5">Сума</th>
                <th className="px-6 py-5">Оплата</th>
                <th className="px-6 py-5">Статус</th>
                <th className="px-6 py-5">ТТН</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">#{order.id}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800">{order.customer_first_name} {order.customer_last_name}</div>
                    <div className="text-xs text-gray-500 font-medium">{order.customer_phone}</div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <Truck size={14} className="mt-0.5 text-blue-500 flex-shrink-0" />
                      <div className="text-xs leading-relaxed">
                        <div className="font-bold">{order.delivery_city}</div>
                        <div className="text-gray-400 font-medium">{order.delivery_branch}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">${(order.totalUSD ?? 0).toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{(order.totalUAH ?? 0).toFixed(2)} ₴</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase w-fit tracking-tighter">
                      <CreditCard size={10} />
                      {order.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${statusDisplay.className}`}>
                      {statusDisplay.text}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {editingTtnOrderId === order.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTtnValue}
                          onChange={(e) => setEditingTtnValue(e.target.value)}
                          className="w-full border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                          autoFocus
                        />
                        <button onClick={() => handleUpdateTtn(order.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingTtnOrderId(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 mr-auto">{order.ttn || '---'}</span>
                        <button
                          onClick={() => {
                            setEditingTtnOrderId(order.id);
                            setEditingTtnValue(order.ttn || '');
                          }}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                          title="Редагувати ТТН"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-gray-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                          title="Видалити замовлення"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
              {filteredAndSortedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Замовлень немає.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
