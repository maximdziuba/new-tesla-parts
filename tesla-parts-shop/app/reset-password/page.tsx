'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Паролі не співпадають');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Токен відновлення паролю відсутній');
      return;
    }

    setStatus('loading');
    try {
      await api.resetPassword({
        token,
        password,
        confirm_password: confirmPassword
      });
      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Помилка при оновленні паролю. Можливо, посилання застаріло.');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-xl shadow-lg dark:shadow-2xl/10 transition-colors duration-300 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Помилка</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Токен відновлення паролю відсутній.</p>
        <div className="mt-6 text-center">
          <Link href="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Повернутися до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-xl shadow-lg dark:shadow-2xl/10 transition-colors duration-300">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">
          Новий пароль
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors">
          Встановіть новий пароль для вашого акаунта
        </p>
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-400 dark:border-green-500 p-4 rounded-r-md transition-colors">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Пароль успішно оновлено! Перенаправлення на сторінку входу...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">Новий пароль</label>
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
              <label htmlFor="confirm-password" className="sr-only">Підтвердіть пароль</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Підтвердіть новий пароль"
              />
            </div>
          </div>

          {status === 'error' && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center">{message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {status === 'loading' ? 'Оновлення...' : 'Підтвердити новий пароль'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-600 dark:text-slate-400">Завантаження...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
