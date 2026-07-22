"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User, Phone, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { isCustomerLoggedIn } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (mounted && !isCustomerLoggedIn) {
      router.push("/login");
    }
  }, [isCustomerLoggedIn, router, mounted]);

  if (!mounted || !isCustomerLoggedIn) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setStatus("error");
      setMessage("Будь ласка, заповніть всі обов'язкові поля");
      return;
    }

    setStatus("loading");
    try {
      await api.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      });
      setStatus("success");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Не вдалося зберегти дані");
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 min-h-[70vh] transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-2xl shadow-xl dark:shadow-2xl/10 transition-colors duration-300">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">
            Завершення реєстрації
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors">
            Будь ласка, введіть ваші контактні дані для оформлення замовлень
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-400 dark:border-green-500 p-5 rounded-r-xl transition-colors">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-400 dark:text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-300 font-bold">
                  Профіль успішно оновлено! Перенаправлення на головну
                  сторінку...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-xl space-y-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  Ім'я
                </label>
                <input
                  type="text"
                  required
                  placeholder="Введіть ім'я"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  Прізвище
                </label>
                <input
                  type="text"
                  required
                  placeholder="Введіть прізвище"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  Номер телефону
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+380991234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="text-red-500 dark:text-red-400 text-sm text-center font-semibold">
                {message}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors shadow-md shadow-blue-100 dark:shadow-none flex items-center justify-center gap-1.5"
              >
                {status === "loading"
                  ? "Збереження..."
                  : "Зберегти та продовжити"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
