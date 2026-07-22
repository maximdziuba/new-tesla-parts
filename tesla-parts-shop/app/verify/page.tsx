"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/services/api";

function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("registerEmail");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(stored);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Паролі не співпадають");
      return;
    }

    setStatus("loading");
    try {
      await api.verifyCustomer({
        token,
        password,
        confirm_password: confirmPassword,
      });
      setStatus("success");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-xl shadow-lg dark:shadow-2xl/10 transition-colors duration-300 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Помилка
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Токен підтвердження відсутній.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-xl shadow-lg dark:shadow-2xl/10 transition-colors duration-300">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">
          Встановлення пароля
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Придумайте надійний пароль для вашого акаунта
        </p>
      </div>

      {status === "success" ? (
        <div className="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-400 dark:border-green-500 p-4 rounded-r-md transition-colors">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400 dark:text-green-500"
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
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Пароль успішно встановлено! Перенаправлення на сторінку входу...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Hidden username field for browser password manager context */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                Новий пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Новий пароль"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Підтвердіть пароль
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Підтвердіть пароль"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center">
              {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {status === "loading" ? "Обробка..." : "Підтвердити"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="text-slate-600 dark:text-slate-400">
            Завантаження...
          </div>
        }
      >
        <VerifyForm />
      </Suspense>
    </div>
  );
}
