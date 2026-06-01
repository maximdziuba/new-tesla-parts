'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { User, LogOut, Mail, Calendar, ShoppingBag, Package, Phone, ChevronRight, Percent } from 'lucide-react';
import { api } from '@/services/api';
import { OrderRead, Currency } from '@/types';
import { formatCurrency } from '@/utils/currency';

function ProfileContent() {
  const { isCustomerLoggedIn, logoutCustomer, currency } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'info';
  
  const [mounted, setMounted] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isCustomerLoggedIn) {
      router.push('/login');
    }
  }, [isCustomerLoggedIn, router, mounted]);

  useEffect(() => {
    if (mounted && isCustomerLoggedIn) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [info, ordersData] = await Promise.all([
            api.getMe(),
            api.getMyOrders()
          ]);
          setCustomerInfo(info);
          setOrders(ordersData);
        } catch (err) {
          console.error('Failed to load profile data', err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [mounted, isCustomerLoggedIn]);

  if (!mounted || !isCustomerLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    logoutCustomer();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      'new': { label: 'Нове', color: 'bg-blue-100 text-blue-800' },
      'processing': { label: 'В обробці', color: 'bg-yellow-100 text-yellow-800' },
      'shipped': { label: 'Відправлено', color: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Доставлено', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Скасовано', color: 'bg-red-100 text-red-800' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Мій кабінет</h1>
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => router.push('/profile?tab=info')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'info' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            Особисті дані
          </button>
          <button 
            onClick={() => router.push('/profile?tab=orders')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition ${tab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
          >
            Мої замовлення
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-8">
        {/* Main Content Area */}
        <div className="flex-grow">
          {loading ? (
            <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-12 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Завантаження даних...</p>
            </div>
          ) : tab === 'info' ? (
            <div className="bg-white dark:bg-slate-800 shadow rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="px-6 py-8 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                      <Mail className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Email</p>
                      <p className="text-slate-900 dark:text-white font-semibold truncate text-lg">{customerInfo?.email || 'Не вказано'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                      <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Дата реєстрації</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-lg">
                        {customerInfo?.created_at ? new Date(customerInfo.created_at).toLocaleDateString('uk-UA') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                      <User className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Ім'я та Прізвище</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-lg">
                        {customerInfo?.first_name || customerInfo?.last_name ? `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim() : 'Не вказано'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg">
                      <Phone className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Телефон</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-lg">{customerInfo?.phone || 'Не вказано'}</p>
                    </div>
                  </div>

                  {((customerInfo?.discount_value !== undefined ? customerInfo.discount_value : customerInfo?.discount_percent) > 0) && (
                    <div className="flex items-start gap-4 p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30 animate-in zoom-in duration-200">
                      <div className="bg-blue-600 text-white p-3 rounded-lg shadow-md shadow-blue-200 dark:shadow-none">
                        <Percent size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-extrabold tracking-wider mb-1">Персональна знижка</p>
                        <p className="text-blue-950 dark:text-blue-100 font-extrabold text-2xl">
                          {(() => {
                            const val = customerInfo.discount_value !== undefined ? customerInfo.discount_value : customerInfo.discount_percent;
                            const dtype = customerInfo.discount_type || 'percent';
                            if (dtype === 'percent') return `${val}%`;
                            if (dtype === 'usd') return `$${val}`;
                            return `${val} грн`;
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-8">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <LogOut size={20} />
                    <span className="text-sm">Хочете завершити сеанс?</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto px-8 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors border border-red-100 dark:border-red-900/20"
                  >
                    Вийти з акаунта
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 shadow rounded-xl p-16 text-center border border-slate-100 dark:border-slate-700">
                  <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                    <Package className="text-slate-300" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">У вас ще немає замовлень</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Зробіть своє перше замовлення і воно з'явиться тут для відстеження статусу.</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-xl transition shadow-lg shadow-blue-200 dark:shadow-none"
                  >
                    Почати покупки
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-slate-800 shadow rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-md transition duration-300">
                    <div className="p-5 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-5">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                            <Package className="text-blue-600 dark:text-blue-400" size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xl">Замовлення #{order.id}</h4>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Від {new Date(order.created_at).toLocaleDateString('uk-UA')} о {new Date(order.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Сума до сплати</p>
                          <p className="font-bold text-slate-900 dark:text-white text-2xl">
                            {formatCurrency(currency === Currency.UAH ? order.totalUAH : order.totalUSD, currency)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-700/20 rounded-xl p-6 border border-slate-100 dark:border-slate-700/50">
                        <h5 className="text-xs uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-4">Склад замовлення</h5>
                        <div className="space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                              <div className="flex items-center gap-3">
                                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs">{item.quantity}x</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px] md:max-w-md">{item.product_name}</span>
                              </div>
                              <span className="text-slate-900 dark:text-slate-100 font-bold whitespace-nowrap">
                                {formatCurrency(currency === Currency.UAH ? (item.price_at_purchase * (order.totalUAH / (order.totalUSD || 1))) : item.price_at_purchase, currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.ttn && (
                        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                              <Package size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-blue-600/60 dark:text-blue-400/60 uppercase tracking-tighter">ТТН Нова Пошта</p>
                              <p className="text-blue-900 dark:text-blue-200 font-mono text-lg tracking-wider font-bold">{order.ttn}</p>
                            </div>
                          </div>
                          <a 
                            href={`https://novaposhta.ua/tracking/?cargo_number=${order.ttn}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-200 dark:shadow-none"
                          >
                            Відстежити посилку <ChevronRight size={16} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Завантаження...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
