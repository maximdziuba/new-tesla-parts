import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import Sidebar from '../components/Sidebar';
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
    <html lang="uk" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#f8fafc]">
        <AppProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <div className="flex flex-grow w-full relative">
            <Sidebar />
            <div className="flex-grow flex flex-col min-w-0">
                <main className="flex-grow px-4 py-8 md:px-8">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
          </div>
          <CartDrawer />
        </AppProvider>
      </body>
    </html>
  );
}
