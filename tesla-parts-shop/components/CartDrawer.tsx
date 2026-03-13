'use client';

import React from 'react';
import { CartItem, Currency } from '../types';
import { X, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { DEFAULT_EXCHANGE_RATE_UAH_PER_USD } from '../constants';
import { formatCurrency } from '../utils/currency';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

const CartDrawer: React.FC = () => {
  const {
    isCartOpen: isOpen,
    setIsCartOpen,
    cart: items,
    currency,
    uahPerUsd,
    updateQuantity: onUpdateQuantity,
    removeItem: onRemoveItem,
  } = useApp();

  const router = useRouter();
  const onClose = () => setIsCartOpen(false);

  const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;

  const getItemUsdPrice = (item: CartItem) => {
    if (item.priceUSD && item.priceUSD > 0) return item.priceUSD;
    if (item.priceUAH && item.priceUAH > 0 && effectiveRate > 0) {
      return item.priceUAH / effectiveRate;
    }
    return 0;
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const formatPrice = (item: CartItem, quantity = 1) => {
    const usdPrice = getItemUsdPrice(item) * quantity;
    const amount = currency === Currency.USD ? usdPrice : usdPrice * effectiveRate;
    return formatAmount(amount);
  };

  const totalUSD = items.reduce((sum, item) => sum + getItemUsdPrice(item) * item.quantity, 0);
  const totalDisplay = currency === Currency.USD ? totalUSD : totalUSD * effectiveRate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 shadow-xl animate-slide-in transition-colors">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100 dark:border-slate-800">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition group">
              <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                <ArrowLeft size={24} className="mr-2"/>  Повернутись до покупок
              </div>
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Кошик ({items.length})</h2>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-slate-500">
                <p>Ваш кошик порожній</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{item.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-md">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-sm font-medium w-8 text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-sm font-bold dark:text-white">{formatPrice(item, item.quantity)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 self-start p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-slate-800 px-4 py-6 bg-gray-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span>Всього</span>
                <span>{formatAmount(totalDisplay)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mb-4 text-center">Вартість доставки розраховується за тарифами перевізника</p>
              <button
                onClick={() => { onClose(); router.push('/checkout'); }}
                className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-800 transition shadow-md"
              >
                Оформити замовлення
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
