import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import AdminSeoSettings from "../components/AdminSeoSettings";

export const SettingsPage: React.FC = () => {
  const [rate, setRate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [savingRate, setSavingRate] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [viber, setViber] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [savingTelegramSettings, setSavingTelegramSettings] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [footerText, setFooterText] = useState("");
  const [savingContactInfo, setSavingContactInfo] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadRate();
    // eslint-disable-next-line react-hooks/immutability
    loadSocialLinks();
    // eslint-disable-next-line react-hooks/immutability
    loadTelegramSettings();
    // eslint-disable-next-line react-hooks/immutability
    loadContactInfo();
  }, []);

  const loadRate = async () => {
    try {
      const data = await ApiService.getSetting("exchange_rate");
      setRate(data.value);
    } catch (e) {
      console.error("Failed to load rate", e);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialLinks = async () => {
    try {
      const data = await ApiService.getSocialLinks();
      setInstagram(data.instagram);
      setTelegram(data.telegram);
      setViber(data.viber);
      setWhatsapp(data.whatsapp);
    } catch (e) {
      console.error("Failed to load social links", e);
    }
  };

  const loadContactInfo = async () => {
    const fetchValue = async (key: string) => {
      try {
        const setting = await ApiService.getSetting(key);
        return setting.value || "";
      } catch {
        return "";
      }
    };
    const [emailValue, phoneValue, footerDescValue, footerTextValue] =
      await Promise.all([
        fetchValue("contact_email"),
        fetchValue("contact_phone"),
        fetchValue("footer_description"),
        fetchValue("footer_text"),
      ]);
    setContactEmail(emailValue);
    setContactPhone(phoneValue);
    setFooterDescription(footerDescValue);
    setFooterText(footerTextValue);
  };

  const loadTelegramSettings = async () => {
    try {
      const token = await ApiService.getSetting("telegram_bot_token");
      setBotToken(token.value || "");
    } catch {
      setBotToken("");
    }
    try {
      const chat = await ApiService.getSetting("telegram_chat_id");
      setChatId(chat.value || "");
    } catch {
      setChatId("");
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRate(true);
    try {
      await ApiService.updateSetting("exchange_rate", rate);
      alert("Курс збережено!");
    } catch (e) {
      console.error("Failed to save rate", e);
      alert("Помилка при збереженні");
    } finally {
      setSavingRate(false);
    }
  };

  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      await ApiService.updateSocialLinks({
        instagram,
        telegram,
        viber,
        whatsapp,
      });
      alert("Посилання збережено!");
    } catch (e) {
      console.error("Failed to save social links", e);
      alert("Помилка при збереженні");
    } finally {
      setSavingSocial(false);
    }
  };

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContactInfo(true);
    try {
      await Promise.all([
        ApiService.updateSetting("contact_email", contactEmail),
        ApiService.updateSetting("contact_phone", contactPhone),
        ApiService.updateSetting("footer_description", footerDescription),
        ApiService.updateSetting("footer_text", footerText),
      ]);
      alert("Контактні дані збережено!");
    } catch (e) {
      console.error("Failed to save contact info", e);
      alert("Помилка при збереженні контактних даних");
    } finally {
      setSavingContactInfo(false);
    }
  };

  const handleSaveTelegramSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegramSettings(true);
    try {
      await Promise.all([
        ApiService.updateSetting("telegram_bot_token", botToken),
        ApiService.updateSetting("telegram_chat_id", chatId),
      ]);
      alert("Телеграм налаштування збережено!");
    } catch (e) {
      console.error("Failed to save telegram settings", e);
      alert("Помилка при збереженні телеграм налаштувань");
    } finally {
      setSavingTelegramSettings(false);
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Налаштування</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSaveRate} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              Курс долара (USD до UAH)
            </label>
            <div className="flex items-center">
              <span className="text-slate-400 font-bold mr-3">1 USD = </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 font-black text-slate-900 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-bold">
                  UAH
                </span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-blue-400 mt-3 uppercase tracking-tight">
              Використовується для автоматичного перерахунку цін на сайті
            </p>
          </div>

          <button
            type="submit"
            disabled={savingRate}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm disabled:opacity-50"
          >
            {savingRate ? "Збереження..." : "Зберегти курс"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
            Соціальні мережі
          </h2>
        </div>
        <form onSubmit={handleSaveSocial} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Instagram Link
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Telegram Link
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="https://t.me/..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Viber Link
              </label>
              <input
                type="text"
                value={viber}
                onChange={(e) => setViber(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="viber://chat?number=..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                WhatsApp Link
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="https://wa.me/..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSocial}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm disabled:opacity-50"
          >
            {savingSocial ? "Збереження..." : "Зберегти посилання"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
            Контактна інформація
          </h2>
        </div>
        <form onSubmit={handleSaveContactInfo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Email магазину
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="info@teslafix.com.ua"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Телефонний номер
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                placeholder="+38 (0XX) XXX-XX-XX"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Опис під логотипом (footer)
            </label>
            <textarea
              value={footerDescription}
              onChange={(e) => setFooterDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all resize-none"
              rows={3}
              placeholder="Короткий текст про магазин у футері"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Текст футера (copyright)
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
              placeholder="© 2026 TeslaFix. Всі права захищені."
            />
          </div>

          <button
            type="submit"
            disabled={savingContactInfo}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm disabled:opacity-50"
          >
            {savingContactInfo ? "Збереження..." : "Зберегти контактні дані"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
            Сповіщення в Telegram
          </h2>
        </div>
        <form onSubmit={handleSaveTelegramSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-mono transition-all"
                placeholder="123456789:ABCDEF..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-mono transition-all"
                placeholder="-100XXXXXXXXX"
              />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            ID чату або каналу, куди будуть надходити нові замовлення. Бот має
            бути доданий в цей чат як адміністратор.
          </p>

          <button
            type="submit"
            disabled={savingTelegramSettings}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm disabled:opacity-50"
          >
            {savingTelegramSettings
              ? "Збереження..."
              : "Зберегти Telegram налаштування"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <AdminSeoSettings />
      </div>
    </div>
  );
};
