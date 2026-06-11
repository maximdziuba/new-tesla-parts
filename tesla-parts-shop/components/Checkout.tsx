import React, { useState, useEffect } from 'react';
import { PaymentMethod, CartItem, Currency, OrderData } from '../types';
import { api } from '../services/api';
import { Truck, Building, Wallet} from 'lucide-react';
import NovaPostWidget from '../components/NovaPostWidget'; // Ensure this path is correct
import { DEFAULT_EXCHANGE_RATE_UAH_PER_USD } from '../constants';
import { formatCurrency } from '../utils/currency';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/navigation';

interface CheckoutProps {
  cartItems: CartItem[];
  currency: Currency;
  uahPerUsd: number;
  onSuccess: () => void;
  totalUSD: number;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, currency, uahPerUsd, onSuccess, totalUSD }) => {
  const { isCustomerLoggedIn } = useApp();
  const router = useRouter();
  
  // --- Form State ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.IBAN);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'usd' | 'uah'>('percent');
  const [discountValue, setDiscountValue] = useState(0);

  // --- Promo Code State ---
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [promoCodeSuccess, setPromoCodeSuccess] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  // --- Guest Registration Offer Modal ---
  const [showOfferModal, setShowOfferModal] = useState(false);

  // --- Save Default Address Modal State ---
  const [showSaveAddressModal, setShowSaveAddressModal] = useState(false);
  const [currentDefaultAddress, setCurrentDefaultAddress] = useState('');
  const [pendingOrder, setPendingOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    if (isCustomerLoggedIn) {
      const fetchUserInfo = async () => {
        try {
          const user = await api.getMe();
          if (user.first_name) setFirstName(user.first_name);
          if (user.last_name) setLastName(user.last_name);
          if (user.phone) {
             const formatted = formatPhoneNumber(user.phone);
             setPhone(formatted);
          }
          if (user.discount_type) {
            setDiscountType(user.discount_type);
          }
          const val = user.discount_value !== undefined ? user.discount_value : user.discount_percent;
          if (val) {
            setDiscountValue(val);
          }
          if (user.default_address) {
            setCurrentDefaultAddress(user.default_address);
            try {
              const parsed = JSON.parse(user.default_address);
              if (parsed && parsed.city && parsed.branch) {
                setDeliveryData({
                  city: parsed.city,
                  branch: parsed.branch,
                  address: parsed.address || '',
                  ref: parsed.ref || ''
                });
              }
            } catch (e) {
              const parts = user.default_address.split(', ');
              const city = parts[0] || '';
              const branch = parts.slice(1).join(', ') || '';
              setDeliveryData({
                city,
                branch,
                address: '',
                ref: ''
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch user info for checkout", err);
        }
      };
      fetchUserInfo();
    }
  }, [isCustomerLoggedIn]);
  
  // --- Delivery State (Simplified) ---
  // We no longer need arrays for cities/warehouses. We just store the final result.
  const [deliveryData, setDeliveryData] = useState<{ 
    city: string; 
    branch: string; 
    ref: string;
    address: string;
  } | null>(null);

  const [processing, setProcessing] = useState(false);

  // Scrolls the view to the upper side of the screen
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Handlers ---

  const handleNovaPostSelect = (data: { ref: string; description: string; city: string; address: string }) => {
    setDeliveryData({
      city: data.city,
      branch: data.description, // e.g., "Department No 1"
      address: data.address,    // e.g., "Kyiv, Khreshchatyk str..."
      ref: data.ref             // UUID for backend
    });
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    const parts = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 8),
      digits.slice(8, 10),
    ].filter(Boolean);
    return parts.join(' ');
  };

  const validatePhone = (value: string) => {
    const pattern = /^0\d{2}\s\d{3}\s\d{2}\s\d{2}$/;
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 10) {
      setPhoneError("Номер має містити 10 цифр у форматі 0XX XXX XX XX");
      return false;
    }
    if (!pattern.test(value)) {
      setPhoneError("Номер має бути у форматі 0XX XXX XX XX");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    if (!formatted) {
      setPhoneError(null);
      return;
    }

    const digits = formatted.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError(null);
      return;
    }

    validatePhone(formatted);
  };

  const executeOrderCreation = async (order: OrderData) => {
    setProcessing(true);
    try {
      await api.createOrder(order);
      if (!isCustomerLoggedIn) {
        setShowOfferModal(true);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error("Order failed", err);
      alert("Виникла помилка при оформленні. Спробуйте ще раз.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDefaultAddress = async (save: boolean) => {
    setShowSaveAddressModal(false);
    if (save && pendingOrder && deliveryData) {
      setProcessing(true);
      try {
        const addressJson = JSON.stringify({
          city: deliveryData.city,
          branch: deliveryData.branch,
          address: deliveryData.address,
          ref: deliveryData.ref
        });
        await api.updateProfile({
          first_name: firstName,
          last_name: lastName,
          phone: phone.replace(/\s/g, ''),
          default_address: addressJson
        });
        setCurrentDefaultAddress(addressJson);
      } catch (err) {
        console.error("Failed to save default address", err);
      }
    }
    if (pendingOrder) {
      await executeOrderCreation(pendingOrder);
      setPendingOrder(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      alert("Будь ласка, введіть коректний номер телефону");
      return;
    }

    if (!deliveryData) {
      alert("Будь ласка, оберіть відділення доставки на мапі");
      return;
    }

    setProcessing(true);

    const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;
    let discountAmountUSD = 0;
    if (discountType === 'percent') {
      discountAmountUSD = totalUSD * (discountValue / 100);
    } else if (discountType === 'usd') {
      discountAmountUSD = discountValue;
    } else if (discountType === 'uah') {
      discountAmountUSD = discountValue / effectiveRate;
    }
    const finalTotalUSD = Math.max(0, totalUSD - discountAmountUSD);

    const order: OrderData = {
      items: cartItems,
      totalUSD: Number(finalTotalUSD.toFixed(2)),
      customer: { firstName, lastName, phone },
      delivery: { 
        city: deliveryData.city, 
        branch: `${deliveryData.branch} (${deliveryData.address})` // Save full info
      },
      paymentMethod,
      createdAt: new Date().toISOString(),
      // Optional: You can add deliveryRef to your OrderData type if you want to store the UUID
      // deliveryRef: deliveryData.ref 
    };

    const selectedAddressString = JSON.stringify({
      city: deliveryData.city,
      branch: deliveryData.branch,
      address: deliveryData.address,
      ref: deliveryData.ref
    });

    const isDifferent = currentDefaultAddress !== selectedAddressString && 
                        currentDefaultAddress !== `${deliveryData.city}, ${deliveryData.branch}`;

    if (isCustomerLoggedIn && isDifferent) {
      setPendingOrder(order);
      setProcessing(false);
      setShowSaveAddressModal(true);
    } else {
      await executeOrderCreation(order);
    }
  };

  const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  const formatItemPrice = (item: CartItem) => {
    const priceUSD = item.priceUSD && item.priceUSD > 0
      ? item.priceUSD
      : (item.priceUAH && item.priceUAH > 0 && effectiveRate > 0 ? item.priceUAH / effectiveRate : 0);
    const amount = currency === Currency.USD ? priceUSD : priceUSD * effectiveRate;
    return formatAmount(amount);
  };
  const totalUAH = totalUSD * effectiveRate;
  
  let discountAmountUSD = 0;
  if (discountType === 'percent') {
    discountAmountUSD = totalUSD * (discountValue / 100);
  } else if (discountType === 'usd') {
    discountAmountUSD = discountValue;
  } else if (discountType === 'uah') {
    discountAmountUSD = discountValue / effectiveRate;
  }

  const finalTotalUSD = Math.max(0, totalUSD - discountAmountUSD);
  const finalTotalUAH = finalTotalUSD * effectiveRate;
  
  const totalDisplayAmount = currency === Currency.UAH ? totalUAH : totalUSD;
  const finalTotalDisplayAmount = currency === Currency.UAH ? finalTotalUAH : finalTotalUSD;
  const discountDisplayAmount = currency === Currency.UAH ? (discountAmountUSD * effectiveRate) : discountAmountUSD;

  if (cartItems.length === 0) {
    return <div className="p-8 text-center text-gray-500">Кошик порожній</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-8">

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Contact Info */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-300">1</div>
                Контактні дані
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Ім'я</label>
                  <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Прізвище</label>
                  <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Телефон</label>
                  <input
                    required
                    type="tel"
                    placeholder="0XX XX XX XX"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className={`w-full border dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none transition-colors ${phoneError ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{phoneError}</p>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Delivery (Using NovaPostWidget) */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-300">2</div>
                Доставка <span className="text-red-500 dark:text-red-400 font-bold ml-2 text-sm flex items-center gap-1"><Truck size={14} /> Nova Post</span>
              </h2>
              
              <div className="space-y-4">
                {/* The Map Widget */}
                <NovaPostWidget onSelect={handleNovaPostSelect} />

                {/* Validation / Selection Message */}
                {deliveryData ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-300 flex flex-col">
                    <span className="font-bold">✓ Вибрано:</span>
                    <span>{deliveryData.city}</span>
                    <span>{deliveryData.branch}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-500 mt-1">{deliveryData.address}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-slate-500 italic pl-1">
                    * Оберіть відділення або поштомат на карті вище
                  </div>
                )}
              </div>
            </section>

            {/* 3. Payment */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-300">3</div>
                Оплата
              </h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === PaymentMethod.IBAN ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                  <input type="radio" name="payment" value={PaymentMethod.IBAN} checked={paymentMethod === PaymentMethod.IBAN} onChange={() => setPaymentMethod(PaymentMethod.IBAN)} className="text-blue-600 focus:ring-blue-600" />
                  <div className="ml-3 flex items-center gap-3">
                    <Building className="text-gray-600 dark:text-slate-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Оплата на рахунок ФОП</div>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === PaymentMethod.COD ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}>
                  <input type="radio" name="payment" value={PaymentMethod.COD} checked={paymentMethod === PaymentMethod.COD} onChange={() => setPaymentMethod(PaymentMethod.COD)} className="text-blue-600 focus:ring-blue-600" />
                  <div className="ml-3 flex items-center gap-3">
                    <Wallet className="text-gray-600 dark:text-slate-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Накладений платіж</div>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </form>

        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 sticky top-24 transition-colors">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Ваше замовлення</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-slate-900 rounded flex-shrink-0 border border-gray-100 dark:border-slate-700">
                    <img src={item.image} className="w-full h-full object-cover rounded" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-2 dark:text-slate-200">{item.name}</div>
                    <div className="text-gray-500 dark:text-slate-500">{item.quantity} x {formatItemPrice(item)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="mb-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Промокод
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Введіть промокод"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={!!appliedPromoCode}
                  className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono w-full"
                />
                {appliedPromoCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromoCode(null);
                      setPromoCodeInput('');
                      setPromoCodeSuccess(null);
                      if (isCustomerLoggedIn) {
                        const restoreInfo = async () => {
                          try {
                            const user = await api.getMe();
                            if (user.discount_type) {
                              setDiscountType(user.discount_type);
                            } else {
                              setDiscountType('percent');
                            }
                            const val = user.discount_value !== undefined ? user.discount_value : user.discount_percent;
                            setDiscountValue(val || 0);
                          } catch {
                            setDiscountType('percent');
                            setDiscountValue(0);
                          }
                        };
                        restoreInfo();
                      } else {
                        setDiscountType('percent');
                        setDiscountValue(0);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition animate-in fade-in duration-250 cursor-pointer text-center"
                  >
                    Скасувати
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!promoCodeInput.trim()) return;
                      try {
                        const res = await api.validatePromoCode(promoCodeInput);
                        setDiscountType(res.discount_type);
                        setDiscountValue(res.discount_value);
                        setAppliedPromoCode(res.code);
                        setPromoCodeSuccess(`Промокод ${res.code} застосовано!`);
                        setPromoCodeError(null);
                      } catch (err: any) {
                        setPromoCodeError(err.message || 'Недійсний промокод');
                        setPromoCodeSuccess(null);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition cursor-pointer text-center"
                  >
                    Застосувати
                  </button>
                )}
              </div>
              {promoCodeError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">{promoCodeError}</p>
              )}
              {promoCodeSuccess && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{promoCodeSuccess}</p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Сума товарів</span>
                <span>{formatAmount(totalDisplayAmount)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold animate-in fade-in duration-200">
                  <span>
                    {(() => {
                      const prefix = appliedPromoCode ? `Промокод (${appliedPromoCode})` : 'Персональна знижка';
                      if (discountType === 'percent') return `${prefix} (${discountValue}%)`;
                      if (discountType === 'usd') return `${prefix} ($${discountValue})`;
                      return `${prefix} (${discountValue} грн)`;
                    })()}
                  </span>
                  <span>-{formatAmount(discountDisplayAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Доставка</span>
                <span className="text-xs">(за тарифами перевізника)</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-700 mt-2">
                <span>Разом</span>
                <span>{formatAmount(finalTotalDisplayAmount)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              disabled={processing}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-800 dark:hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {processing ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-pulse"></span>
              ) : (
                "Підтвердити замовлення"
              )}
            </button>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 text-center">
              Натискаючи кнопку, ви погоджуєтесь з умовами <Link href="/info/terms-of-service" className="text-blue-600 dark:text-blue-400 hover:underline">публічної оферти</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Guest Registration Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              🎉 Замовлення оформлено!
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 text-center">
              Дякуємо! Ваше замовлення успішно прийнято. 
              <br />
              <span className="block mt-2 font-medium text-blue-600 dark:text-blue-400">
                Бажаєте отримувати персональні знижки та сповіщення про акції?
              </span>
              Створіть особистий кабінет! Зареєстровані користувачі завжди отримують персональні знижки на наступні покупки та оперативні повідомлення про нові пропозиції.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onSuccess();
                  router.push('/register');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Створити акаунт
              </button>
              <button
                onClick={() => {
                  onSuccess();
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Ні, дякую (продовжити без акаунта)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Address Modal */}
      {showSaveAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              📍 Зберегти адресу за замовчуванням?
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6 text-center">
              Ви обрали нову адресу доставки:
              <span className="block font-semibold mt-2 text-slate-800 dark:text-white">
                {deliveryData?.city}, {deliveryData?.branch}
              </span>
              <span className="block mt-2">
                Бажаєте зберегти її як адресу за замовчуванням у вашому профілі?
              </span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleSaveDefaultAddress(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-medium py-3 rounded-xl transition-colors cursor-pointer"
              >
                Ні
              </button>
              <button
                onClick={() => handleSaveDefaultAddress(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Так, зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

