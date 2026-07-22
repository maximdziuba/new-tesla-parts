import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { Customer, Order } from "../types";
import {
  Search,
  Percent,
  Eye,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Discount editing state
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(
    null,
  );
  const [editingDiscountValue, setEditingDiscountValue] = useState<string>("");
  const [editingDiscountType, setEditingDiscountType] = useState<
    "percent" | "usd" | "uah"
  >("percent");

  // Selected customer for viewing orders
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscountClick = (customer: Customer) => {
    setEditingDiscountId(customer.id);
    setEditingDiscountType(customer.discount_type || "percent");
    setEditingDiscountValue(
      (customer.discount_value !== undefined
        ? customer.discount_value
        : customer.discount_percent
      ).toString(),
    );
  };

  const handleSaveDiscount = async (customerId: number) => {
    const value = parseFloat(editingDiscountValue);
    if (isNaN(value) || value < 0) {
      alert("Введіть коректне додатнє значення знижки");
      return;
    }
    if (editingDiscountType === "percent" && value > 100) {
      alert("Знижка у відсотках не може перевищувати 100%");
      return;
    }

    try {
      await ApiService.updateCustomerDiscount(
        customerId,
        editingDiscountType,
        value,
      );
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                discount_type: editingDiscountType,
                discount_value: value,
                discount_percent:
                  editingDiscountType === "percent" ? value : 0.0,
              }
            : c,
        ),
      );
      setEditingDiscountId(null);
    } catch (e) {
      console.error("Failed to update discount", e);
      alert("Не вдалося оновити знижку");
    }
  };

  const handleViewOrdersClick = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    setCustomerOrders([]);
    try {
      const data = await ApiService.getCustomerOrders(customer.id);
      setCustomerOrders(data);
    } catch (e) {
      console.error("Failed to load customer orders", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredCustomers = React.useMemo(() => {
    return customers.filter((c) => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;

      const fullName =
        `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });
  }, [customers, searchQuery]);

  const getStatusDisplay = (orderStatus: string) => {
    switch (orderStatus) {
      case "new":
        return { text: "Нове", className: "bg-amber-100 text-amber-700" };
      case "processed":
        return {
          text: "Оброблено",
          className: "bg-emerald-100 text-emerald-700",
        };
      case "cancelled":
        return { text: "Відмінено", className: "bg-rose-100 text-rose-700" };
      default:
        return { text: orderStatus, className: "bg-slate-100 text-slate-700" };
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Завантаження клієнтів...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Search Filter Box */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Пошук клієнтів за Email, Ім'ям або Телефоном..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-5">Клієнт</th>
                <th className="px-6 py-5">Контакти</th>
                <th className="px-6 py-5">Дата реєстрації</th>
                <th className="px-6 py-5">Статус</th>
                <th className="px-6 py-5">Персональна знижка</th>
                <th className="px-6 py-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Клієнтів не знайдено
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-base">
                        {customer.first_name || customer.last_name
                          ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                          : "Не вказано"}
                      </div>
                      <div className="text-xs text-gray-400 font-bold mt-0.5">
                        ID: #{customer.id}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Mail size={14} className="text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Phone size={12} className="text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {new Date(customer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {customer.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <ShieldCheck size={12} />
                          Підтверджено
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <ShieldAlert size={12} />
                          Не підтверджено
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {editingDiscountId === customer.id ? (
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            className="px-1.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            value={editingDiscountType}
                            onChange={(e) =>
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              setEditingDiscountType(e.target.value as any)
                            }
                          >
                            <option value="percent">%</option>
                            <option value="usd">$</option>
                            <option value="uah">грн</option>
                          </select>
                          <input
                            type="number"
                            className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingDiscountValue}
                            onChange={(e) =>
                              setEditingDiscountValue(e.target.value)
                            }
                            min={0}
                            max={
                              editingDiscountType === "percent"
                                ? 100
                                : undefined
                            }
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveDiscount(customer.id)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition cursor-pointer"
                            title="Зберегти"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingDiscountId(null)}
                            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                            title="Скасувати"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              (customer.discount_value !== undefined
                                ? customer.discount_value
                                : customer.discount_percent) > 0
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-100"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {(() => {
                              const val =
                                customer.discount_value !== undefined
                                  ? customer.discount_value
                                  : customer.discount_percent;
                              const dtype = customer.discount_type || "percent";
                              if (val <= 0) return "0%";
                              if (dtype === "percent") return `${val}%`;
                              if (dtype === "usd") return `$${val}`;
                              return `${val} грн`;
                            })()}
                          </span>
                          <button
                            onClick={() => handleEditDiscountClick(customer)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="Змінити знижку"
                          >
                            <Percent size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleViewOrdersClick(customer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold rounded-lg text-xs border border-gray-100 hover:border-blue-100 transition shadow-sm cursor-pointer"
                      >
                        <Eye size={14} />
                        Замовлення
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Viewer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Замовлення користувача:{" "}
                  {selectedCustomer.first_name || selectedCustomer.last_name
                    ? `${selectedCustomer.first_name || ""} ${selectedCustomer.last_name || ""}`.trim()
                    : selectedCustomer.email}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Перегляд замовлень та покупок у системі
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {loadingOrders ? (
                <div className="py-12 text-center text-gray-500 font-medium">
                  Завантаження замовлень...
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-3">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} className="text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-500">
                    Замовлень не знайдено
                  </p>
                  <p className="text-xs text-gray-400">
                    Цей користувач ще не робив покупок у нашому магазині
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => {
                    const statusDisplay = getStatusDisplay(order.status);
                    return (
                      <div
                        key={order.id}
                        className="border border-gray-100 rounded-xl overflow-hidden hover:border-blue-100 transition shadow-sm"
                      >
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800 text-sm">
                              Замовлення #{order.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusDisplay.className}`}
                            >
                              {statusDisplay.text}
                            </span>
                            {order.ttn && (
                              <span className="text-xs text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-gray-200">
                                ТТН: {order.ttn}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {new Date(order.created_at).toLocaleDateString()} в{" "}
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs md:text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 font-bold text-[10px]">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-slate-700 font-medium truncate max-w-sm md:max-w-lg">
                                    {item.product_name || "Товар вилучено"}
                                  </span>
                                </div>
                                <span className="text-slate-800 font-bold">
                                  ${item.price_at_purchase}
                                </span>
                              </div>
                            ))}
                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                Сума замовлення
                              </span>
                              <span className="font-bold text-slate-900 text-base">
                                ${order.totalUSD}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold rounded-xl text-xs transition cursor-pointer"
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
