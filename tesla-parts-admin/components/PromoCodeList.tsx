import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Customer } from '../types';
import { 
  Ticket, Plus, Trash2, Search, Users, Check, X, 
  Percent, DollarSign, Award, AlertCircle 
} from 'lucide-react';

interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percent' | 'usd' | 'uah';
  discount_value: number;
  scope: 'everyone' | 'selected';
  is_active: boolean;
  customer_ids: number[];
}

export const PromoCodeList: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'usd' | 'uah'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [scope, setScope] = useState<'everyone' | 'selected'>('everyone');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  
  // Filters and search inside form/table
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [searchPromoQuery, setSearchPromoQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promoData, customerData] = await Promise.all([
        ApiService.getPromoCodes(),
        ApiService.getCustomers()
      ]);
      setPromoCodes(promoData);
      setCustomers(customerData);
    } catch (e) {
      console.error("Failed to load promo codes data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percent');
    setDiscountValue('');
    setScope('everyone');
    setSelectedCustomerIds([]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setCode(promo.code);
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value.toString());
    setScope(promo.scope);
    setSelectedCustomerIds(promo.customer_ids || []);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей промокод?")) return;
    try {
      await ApiService.deletePromoCode(id);
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Failed to delete promo code", e);
      alert("Не вдалося видалити промокод");
    }
  };

  const handleToggleCustomer = (customerId: number) => {
    setSelectedCustomerIds(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllFiltered = (filteredIds: number[]) => {
    setSelectedCustomerIds(prev => {
      const otherSelected = prev.filter(id => !filteredIds.includes(id));
      // if all filtered are already selected, unselect them
      const allFilteredSelected = filteredIds.every(id => prev.includes(id));
      if (allFilteredSelected) {
        return otherSelected;
      } else {
        return [...otherSelected, ...filteredIds];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Введіть код промокоду");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      alert("Введіть коректне значення знижки");
      return;
    }
    if (discountType === 'percent' && val > 100) {
      alert("Відсоткова знижка не може бути більшою за 100%");
      return;
    }
    if (scope === 'selected' && selectedCustomerIds.length === 0) {
      alert("Оберіть хоча б одного клієнта для цього промокоду");
      return;
    }

    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: val,
      scope,
      customer_ids: scope === 'selected' ? selectedCustomerIds : []
    };

    try {
      if (editingId) {
        const updated = await ApiService.updatePromoCode(editingId, payload);
        setPromoCodes(prev => prev.map(p => p.id === editingId ? updated : p));
      } else {
        const created = await ApiService.createPromoCode(payload);
        setPromoCodes(prev => [created, ...prev]);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message || "Не вдалося зберегти промокод");
    }
  };

  // Filter customers shown in selected users selector
  const filteredCustomers = customers.filter(c => {
    const q = searchCustomerQuery.toLowerCase();
    if (!q) return true;
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const filteredPromoCodes = promoCodes.filter(p => {
    const q = searchPromoQuery.toLowerCase();
    if (!q) return true;
    return p.code.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Завантаження промокодів...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Шукати промокоди..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
            value={searchPromoQuery}
            onChange={(e) => setSearchPromoQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer shadow-md shadow-blue-100"
        >
          <Plus size={16} />
          Створити промокод
        </button>
      </div>

      {/* Promocodes Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromoCodes.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
            <Ticket className="mx-auto w-12 h-12 text-gray-300 mb-3" />
            <p className="font-semibold text-slate-500">Промокодів не знайдено</p>
            <p className="text-xs text-gray-400 mt-1">Створіть свій перший промокод для клієнтів</p>
          </div>
        ) : (
          filteredPromoCodes.map(promo => (
            <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300 flex items-center justify-end p-4">
                <Ticket className="text-blue-100 w-10 h-10 transform translate-x-2 -translate-y-2 group-hover:rotate-12 transition-transform" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold tracking-wider rounded-lg text-sm border border-blue-100">
                    {promo.code}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    promo.scope === 'everyone' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    <Users size={10} />
                    {promo.scope === 'everyone' ? 'Для всіх' : 'Для обраних'}
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-slate-800">
                    {promo.discount_type === 'percent' && `${promo.discount_value}%`}
                    {promo.discount_type === 'usd' && `$${promo.discount_value}`}
                    {promo.discount_type === 'uah' && `${promo.discount_value} грн`}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mt-1">
                    Розмір знижки на замовлення
                  </div>
                </div>

                {promo.scope === 'selected' && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>Доступно для клієнтів:</span>
                    <span className="font-bold text-slate-800 px-2 py-0.5 bg-white rounded border border-slate-200">
                      {promo.customer_ids?.length || 0} осіб
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleOpenEdit(promo)}
                  className="flex-grow py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold rounded-xl text-xs transition border border-gray-100 hover:border-blue-100 cursor-pointer"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-gray-100 hover:border-rose-100 cursor-pointer"
                  title="Видалити промокод"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Редагування промокоду' : 'Створення нового промокоду'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Вкажіть правила нарахування знижки та коло клієнтів</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {/* Code field */}
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Код промокоду</label>
                  <input
                    type="text"
                    required
                    placeholder="Напр. AUTUMN20"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-bold uppercase tracking-wider"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                {/* Scope */}
                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Область дії</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold cursor-pointer"
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                  >
                    <option value="everyone">Для всіх (глобально)</option>
                    <option value="selected">Для обраних користувачів</option>
                  </select>
                </div>

                {/* Discount type */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Тип знижки</label>
                  <select
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold cursor-pointer"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                  >
                    <option value="percent">Відсоток (%)</option>
                    <option value="usd">Долари ($)</option>
                    <option value="uah">Гривні (грн)</option>
                  </select>
                </div>

                {/* Discount value */}
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Значення знижки</label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="any"
                    placeholder={discountType === 'percent' ? '15' : '100'}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-bold"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Customer selector (if scope is 'selected') */}
              {scope === 'selected' && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Оберіть клієнтів</h4>
                      <p className="text-xs text-gray-400 font-medium">Оберіть користувачів, яким буде доступна знижка</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded-lg text-xs">
                      Обрано: {selectedCustomerIds.length} осіб
                    </span>
                  </div>

                  {/* Customer search & select all */}
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Шукати клієнта за іменем, email..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs"
                        value={searchCustomerQuery}
                        onChange={(e) => setSearchCustomerQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectAllFiltered(filteredCustomers.map(c => c.id))}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      {filteredCustomers.every(c => selectedCustomerIds.includes(c.id)) ? 'Зняти виділення' : 'Виділити всі'}
                    </button>
                  </div>

                  {/* Scrollable list */}
                  <div className="border border-slate-100 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-50 custom-scrollbar bg-slate-50/50 p-1">
                    {filteredCustomers.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 text-xs">Клієнтів не знайдено</div>
                    ) : (
                      filteredCustomers.map(c => {
                        const isChecked = selectedCustomerIds.includes(c.id);
                        return (
                          <div 
                            key={c.id} 
                            onClick={() => handleToggleCustomer(c.id)}
                            className="flex items-center justify-between p-2.5 hover:bg-white hover:shadow-sm rounded-lg transition cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-800">
                                {c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : 'Клієнт без імені'}
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium">
                                {c.email} {c.phone && `• ${c.phone}`}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isChecked && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-100 bg-white sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-700 hover:text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md shadow-blue-100"
                >
                  {editingId ? 'Зберегти зміни' : 'Створити промокод'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
