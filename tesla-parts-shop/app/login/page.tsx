'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginCustomer } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.loginCustomer({ email, password });
      await loginCustomer(res.access_token);
      
      // Fetch user profile info to check completeness
      const me = await api.getMe();
      setStatus('success');
      if (!me.first_name || !me.phone) {
        router.push('/profile/setup');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-10 rounded-xl shadow-lg dark:shadow-2xl/10 transition-colors duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white transition-colors">
            Вхід до акаунта
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 placeholder-gray-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div className="flex justify-end text-sm">
            <Link href="/forgot-password" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Забули пароль?
            </Link>
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
              {status === 'loading' ? 'Вхід...' : 'Увійти'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Ще немає акаунта? Зареєструватися
          </Link>
        </div>
      </div>
    </div>
  );
}
