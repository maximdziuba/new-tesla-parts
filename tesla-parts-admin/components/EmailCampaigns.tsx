import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { Customer } from "../types";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Mail,
  Users,
  Plus,
  Trash2,
  Send,
  Search,
  Check,
  X,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Layers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface EmailListCustomer {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface EmailList {
  id: number;
  name: string;
  created_at: string;
  customers: EmailListCustomer[];
}

export const EmailCampaigns: React.FC = () => {
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lists" | "direct">("lists");

  // Create List Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [searchCustomerQuery, setSearchCustomerQuery] = useState("");

  // Send Campaign Modal State
  const [isSendCampaignOpen, setIsSendCampaignOpen] = useState(false);
  const [targetList, setTargetList] = useState<EmailList | null>(null);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");
  const [sending, setSending] = useState(false);

  // Direct Mail Form State
  const [directSubject, setDirectSubject] = useState("");
  const [directBody, setDirectBody] = useState("");
  const [directEmails, setDirectEmails] = useState("");
  const [directCustomerIds, setDirectCustomerIds] = useState<number[]>([]);
  const [searchDirectCustomerQuery, setSearchDirectCustomerQuery] =
    useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listData, customerData] = await Promise.all([
        ApiService.getEmailLists(),
        ApiService.getCustomers(),
      ]);
      setEmailLists(listData);
      setCustomers(customerData);
    } catch (e) {
      console.error("Failed to load email campaigns data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      alert("Вкажіть назву списку");
      return;
    }

    try {
      const created = await ApiService.createEmailList({
        name: listName.trim(),
        customer_ids: selectedCustomerIds,
      });
      setEmailLists((prev) => [...prev, created]);
      setIsCreateOpen(false);
      setListName("");
      setSelectedCustomerIds([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Не вдалося створити список");
    }
  };

  const handleDeleteList = async (id: number) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей список розсилки?"))
      return;
    try {
      await ApiService.deleteEmailList(id);
      setEmailLists((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error("Failed to delete list", e);
      alert("Не вдалося видалити список розсилки");
    }
  };

  const handleOpenSendCampaign = (list: EmailList) => {
    setTargetList(list);
    setCampaignSubject("");
    setCampaignBody("");
    setIsSendCampaignOpen(true);
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetList) return;
    if (!campaignSubject.trim() || !campaignBody.trim()) {
      alert("Заповніть тему та текст повідомлення");
      return;
    }

    try {
      setSending(true);
      const res = await ApiService.sendCampaignToList(targetList.id, {
        subject: campaignSubject.trim(),
        body: campaignBody.trim(),
      });
      alert(res.message || "Розсилку успішно запущено!");
      setIsSendCampaignOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Не вдалося надіслати розсилку");
    } finally {
      setSending(false);
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSubject.trim() || !directBody.trim()) {
      alert("Заповніть тему та текст повідомлення");
      return;
    }

    const emailArr = directEmails
      .split(/[\n,;]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (directCustomerIds.length === 0 && emailArr.length === 0) {
      alert(
        "Оберіть хоча б одного клієнта або введіть хоча б одну email адресу",
      );
      return;
    }

    try {
      setSending(true);
      const res = await ApiService.sendDirectCampaign({
        subject: directSubject.trim(),
        body: directBody.trim(),
        customer_ids: directCustomerIds,
        emails: emailArr,
      });
      alert(res.message || "Повідомлення надіслано успішно!");
      setDirectSubject("");
      setDirectBody("");
      setDirectEmails("");
      setDirectCustomerIds([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Не вдалося відправити повідомлення");
    } finally {
      setSending(false);
    }
  };

  const handleToggleCustomerForList = (id: number) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const handleToggleCustomerForDirect = (id: number) => {
    setDirectCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const filteredCustomersForList = customers.filter((c) => {
    const q = searchCustomerQuery.toLowerCase();
    if (!q) return true;
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const filteredCustomersForDirect = customers.filter((c) => {
    const q = searchDirectCustomerQuery.toLowerCase();
    if (!q) return true;
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Завантаження даних розсилок...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-4 rounded-2xl shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab("lists")}
          className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "lists"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Списки розсилки
        </button>
        <button
          onClick={() => setActiveTab("direct")}
          className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "direct"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Пряма розсилка
        </button>
      </div>

      {activeTab === "lists" ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* List Controls */}
          <div className="flex justify-end bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => {
                setListName("");
                setSelectedCustomerIds([]);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 active:scale-[0.98] transition cursor-pointer shadow-md shadow-blue-100"
            >
              <Plus size={16} />
              Створити список
            </button>
          </div>

          {/* Email Lists cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emailLists.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-400">
                <Users className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p className="font-semibold text-slate-500">
                  Списків розсилки не створено
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Згрупуйте клієнтів для зручної та швидкої розсилки
                </p>
              </div>
            ) : (
              emailLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-800 line-clamp-1">
                        {list.name}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs border border-slate-200 whitespace-nowrap">
                        ID: #{list.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 py-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="text-base font-extrabold text-slate-800">
                          {list.customers?.length || 0} осіб
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          Загальна кількість отримувачів
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      Створено: {new Date(list.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => handleOpenSendCampaign(list)}
                      disabled={!list.customers || list.customers.length === 0}
                      className="flex-grow py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Send size={12} />
                      Надіслати
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="px-3 py-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition border border-gray-100 hover:border-rose-100 cursor-pointer"
                      title="Видалити список"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Direct dispatch form */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <Sparkles className="text-blue-600 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">
              Миттєве пряме розсилання
            </h3>
          </div>

          <form onSubmit={handleSendDirect} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Тема листа
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Введіть тему повідомлення..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold"
                    value={directSubject}
                    onChange={(e) => setDirectSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Текст повідомлення
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Напишіть ваше повідомлення для клієнтів (підтримується звичайний текст)..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                    value={directBody}
                    onChange={(e) => setDirectBody(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    Додаткові адреси отримувачів
                  </label>
                  <p className="text-[10px] text-gray-400 font-medium mb-2">
                    Введіть додаткові email-адреси через кому або з нового рядка
                  </p>
                  <textarea
                    rows={3}
                    placeholder="customer1@example.com, test@example.com"
                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs"
                    value={directEmails}
                    onChange={(e) => setDirectEmails(e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column: Customer Selection */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Оберіть клієнтів
                  </label>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded-lg text-[10px]">
                    Обрано: {directCustomerIds.length} осіб
                  </span>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Пошук клієнта за іменем, email..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs"
                    value={searchDirectCustomerQuery}
                    onChange={(e) =>
                      setSearchDirectCustomerQuery(e.target.value)
                    }
                  />
                </div>

                {/* Customer list scrollable */}
                <div className="border border-slate-100 rounded-xl flex-grow overflow-y-auto divide-y divide-gray-50 custom-scrollbar bg-slate-50/50 p-1.5 h-64 md:h-[350px]">
                  {filteredCustomersForDirect.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs">
                      Клієнтів не знайдено
                    </div>
                  ) : (
                    filteredCustomersForDirect.map((c) => {
                      const isChecked = directCustomerIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleToggleCustomerForDirect(c.id)}
                          className="flex items-center justify-between p-2.5 hover:bg-white hover:shadow-sm rounded-lg transition cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {c.first_name || c.last_name
                                ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
                                : "Клієнт без імені"}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">
                              {c.email}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-100"
              >
                <Send size={14} />
                {sending ? "Відправка..." : "Запустити пряму розсилку"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create List */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Створити список розсилки
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Згрупуйте клієнтів за інтересами чи статусом
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateList}
              className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col custom-scrollbar"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Назва списку
                </label>
                <input
                  type="text"
                  required
                  placeholder="Напр. Отримувачі персональних знижок"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>

              <div className="space-y-3 flex-grow flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Оберіть клієнтів
                  </label>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-[10px]">
                    Обрано: {selectedCustomerIds.length} осіб
                  </span>
                </div>

                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Шукати за іменем чи email..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-xs"
                    value={searchCustomerQuery}
                    onChange={(e) => setSearchCustomerQuery(e.target.value)}
                  />
                </div>

                <div className="border border-slate-100 rounded-xl overflow-y-auto divide-y divide-gray-50 custom-scrollbar bg-slate-50/50 p-1.5 max-h-48">
                  {filteredCustomersForList.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-xs font-medium">
                      Клієнтів не знайдено
                    </div>
                  ) : (
                    filteredCustomersForList.map((c) => {
                      const isChecked = selectedCustomerIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleToggleCustomerForList(c.id)}
                          className="flex items-center justify-between p-2 hover:bg-white hover:shadow-sm rounded-lg transition cursor-pointer"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {c.first_name || c.last_name
                                ? `${c.first_name || ""} ${c.last_name || ""}`.trim()
                                : "Клієнт без імені"}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {c.email}
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check size={10} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md shadow-blue-100"
                >
                  Створити список
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Send Campaign */}
      {isSendCampaignOpen && targetList && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Запуск маркетингової розсилки
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Список отримувачів:{" "}
                  <span className="font-semibold text-blue-600">
                    {targetList.name}
                  </span>{" "}
                  ({targetList.customers?.length || 0} осіб)
                </p>
              </div>
              <button
                onClick={() => setIsSendCampaignOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendCampaign} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Тема листа
                </label>
                <input
                  type="text"
                  required
                  placeholder="Вкажіть тему розсилки..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm font-semibold"
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Текст листа
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Напишіть ваше повідомлення..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm"
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsSendCampaignOpen(false)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-gray-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95 shadow-md shadow-blue-100 flex items-center justify-center gap-1.5"
                >
                  <Send size={12} />
                  {sending ? "Надсилання..." : "Запустити розсилку"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
