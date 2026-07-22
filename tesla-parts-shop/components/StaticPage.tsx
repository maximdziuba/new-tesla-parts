import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import SeoHead from "./SeoHead";
import { StaticSeoRecord } from "../types";

interface StaticPageProps {
  slug: string;
  onBack: () => void;
  seo?: StaticSeoRecord | null;
}

// Map of slugs to Ukrainian titles and content for fallback
const PAGE_FALLBACKS: { [key: string]: { title: string; content: string } } = {
  about: {
    title: "Про нас",
    content:
      "TeslaFix — ваш надійний постачальник запчастин для електромобілів Tesla. Ми працюємо, щоб ваш електрокар завжди був у ідеальному стані.",
  },
  delivery: {
    title: "Доставка та оплата",
    content:
      "Доставка здійснюється Новою Поштою по всій Україні. Оплата можлива при отриманні (накладений платіж) або на розрахунковий рахунок.",
  },
  returns: {
    title: "Повернення та обмін",
    content:
      "Ви можете повернути або обміняти товар протягом 14 днів з моменту покупки, якщо він не був у використанні та зберіг свій товарний вигляд.",
  },
  faq: {
    title: "Часті питання",
    content:
      "Чи є у вас гарантія? Так, на більшість запчастин діє гарантія від 1 до 6 місяців. Чи відправляєте ви в день замовлення? Так, якщо замовлення оформлено до 15:00.",
  },
  contacts: {
    title: "Контакти",
    content:
      "Ми знаходимося у Києві. Телефон для зв’язку: +38 (067) 000-00-00. Електронна пошта: info@teslafix.com.ua",
  },
  "privacy-policy": {
    title: "Політика конфіденційності",
    content:
      "Ваші персональні дані використовуються виключно для обробки замовлень та покращення якості сервісу. Ми гарантуємо конфіденційність.",
  },
  "terms-of-service": {
    title: "Умови використання",
    content:
      "Користуючись нашим сайтом, ви погоджуєтесь з правилами оформлення замовлень та надання послуг нашого магазину.",
  },
};

const StaticPage: React.FC<StaticPageProps> = ({ slug, onBack, seo }) => {
  const [page, setPage] = useState<{ title: string; content: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const data = await api.getPage(slug);
        if (data && data.is_published) {
          setPage({ title: data.title, content: data.content });
        } else {
          // Fallback if page not found or not published
          setPage(PAGE_FALLBACKS[slug] || null);
        }
      } catch (e) {
        console.error("Failed to load page", e);
        setPage(PAGE_FALLBACKS[slug] || null);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <div className="flex justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const fallbackTitle = `${page?.title || PAGE_FALLBACKS[slug]?.title || "Магазин запчастин"}`;
  const rawContent = page?.content ? page.content.replace(/<[^>]+>/g, " ") : "";
  const trimmedContent = rawContent.trim();
  const fallbackDescription =
    trimmedContent.length === 0
      ? "Auto Parts Store — інтернет-магазин запчастин для електромобілів."
      : trimmedContent.length > 160
        ? `${trimmedContent.slice(0, 157).trimEnd()}...`
        : trimmedContent;

  return (
    <div className="py-12 max-w-2xl mx-auto transition-colors">
      <SeoHead
        title={seo?.meta_title}
        description={seo?.meta_description}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
      />
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        {page?.title || PAGE_FALLBACKS[slug]?.title || slug}
      </h1>

      {page ? (
        <div
          className="text-gray-600 dark:text-slate-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: page.content.replace(/\n/g, "<br />"),
          }}
        />
      ) : (
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
          Ця сторінка знаходиться в розробці.
        </p>
      )}

      <button
        onClick={onBack}
        className="mt-8 text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>{" "}
        Повернутись на головну
      </button>
    </div>
  );
};

export default StaticPage;
