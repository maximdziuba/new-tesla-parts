import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Order } from '../types';
import { Search, Truck, CreditCard, Pencil, Check, X, Trash2, Eye, MessageSquare } from 'lucide-react';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTtnOrderId, setEditingTtnOrderId] = useState<number | null>(null);
  const [editingTtnValue, setEditingTtnValue] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                <th className="px-6 py-5">Коментар</th>
                <th className="px-6 py-5">Товари</th>
                <th className="px-6 py-5">Статус</th>
                <th className="px-6 py-5">ТТН</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSortedOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
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
                    {order.comment ? (
                      <MessageSquare size={16} className="text-blue-500" title="Є коментар" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{item.quantity}x</span>
                          <span className="truncate max-w-[120px]" title={item.product_name || item.product_id}>{item.product_name || item.product_id}</span>
                        </div>
                      ))}
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
                          onClick={(e) => e.stopPropagation()}
                          className="w-full border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                          autoFocus
                        />
                        <button onClick={(e) => { e.stopPropagation(); handleUpdateTtn(order.id); }} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingTtnOrderId(null); }} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 mr-auto">{order.ttn || '---'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-all"
                          title="Переглянути деталі"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTtnOrderId(order.id);
                            setEditingTtnValue(order.ttn || '');
                          }}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                          title="Редагувати ТТН"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
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
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Замовлень немає.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Замовлення #{selectedOrder.id}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Клієнт</h3>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                    <p className="text-sm text-slate-500 font-medium">{selectedOrder.customer_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Доставка</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-slate-800">{selectedOrder.delivery_city}</p>
                    <p className="text-slate-500 font-medium">{selectedOrder.delivery_branch}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Товари</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100/50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="px-4 py-3">Назва</th>
                        <th className="px-4 py-3 text-center">К-сть</th>
                        <th className="px-4 py-3 text-right">Ціна</th>
                        <th className="px-4 py-3 text-right">Разом</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 text-xs">Немає фото</div>
                              )}
                              <div>
                                {item.product_name ? (
                                  <a href={`#/products/edit/${item.product_id}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors block">
                                    {item.product_name}
                                  </a>
                                ) : (
                                  <div className="font-bold text-slate-900">Товар видалено</div>
                                )}
                                <div className="text-[10px] text-gray-400 font-mono mt-1">{item.product_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">{item.quantity}</span>
                          </td>
                          <td className="px-4 py-4 text-right font-bold">${item.price_at_purchase.toFixed(2)}</td>
                          <td className="px-4 py-4 text-right font-black text-slate-900">${(item.price_at_purchase * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-blue-600 text-white font-black uppercase tracking-widest text-xs">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right">Всього:</td>
                        <td className="px-4 py-4 text-right text-sm font-black">${selectedOrder.totalUSD.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Оплата</h3>
                   <div className="flex items-center gap-2">
                     <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                       <CreditCard size={14} className="text-slate-500" />
                       <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{selectedOrder.payment_method}</span>
                     </div>
                   </div>
                </div>
                {selectedOrder.ttn && (
                   <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">ТТН</h3>
                     <p className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                       {selectedOrder.ttn}
                     </p>
                   </div>
                )}
              </div>

              {selectedOrder.comment && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-3">Коментар до замовлення</h3>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{selectedOrder.comment}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-sm active:scale-95"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
