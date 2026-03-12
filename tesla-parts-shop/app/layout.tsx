import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Магазин запчастин',
  description: 'Купуйте оригінальні та перевірені запчастини для Tesla з доставкою по Україні.',
  icons: {
    icon: '/tesla-favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#f8fafc]">
        <AppProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
