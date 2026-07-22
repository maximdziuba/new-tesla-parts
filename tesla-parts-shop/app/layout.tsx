import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import Sidebar from "../components/Sidebar";
import ScrollToTop from "../components/ScrollToTop";
import { Suspense } from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Script from "next/script";
config.autoAddCss = false;

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Магазин запчастин",
  description:
    "Купуйте оригінальні та перевірені запчастини для Tesla з доставкою по Україні.",
  icons: {
    icon: [
      {
        url: "https://www.teslafix.com.ua/tesla-fix.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NJ3WGQLB');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Tesla Fix",
              url: "https://teslafix.com.ua",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#f8fafc]">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NJ3WGQLB"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18028036676"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18028036676');
          `}
        </Script>
        <AppProvider>
          <ScrollToTop />
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <div className="flex flex-grow w-full relative">
            <Sidebar />
            <div className="flex-grow flex flex-col min-w-0">
              <main className="flex-grow px-4 py-8 md:px-8">
                <div className="container mx-auto">{children}</div>
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
