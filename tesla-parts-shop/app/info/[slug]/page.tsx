import React from "react";
import { api } from "../../../services/api";
import StaticPageClient from "../../../components/StaticPageClient";
import { Metadata } from "next";

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

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
    title: "Повернення та гарантія",
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

// eslint-disable-next-line react-refresh/only-export-components
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const seo = await api.getStaticSeo();
    const seoRecord = seo.find((s) => s.slug === resolvedParams.slug);

    let pageData = null;
    try {
      pageData = await api.getPage(resolvedParams.slug);

      // eslint-disable-next-line no-empty
    } catch {}

    const pageTitle =
      pageData?.title ||
      PAGE_FALLBACKS[resolvedParams.slug]?.title ||
      resolvedParams.slug;
    const rawContent = pageData?.content
      ? pageData.content.replace(/<[^>]+>/g, " ")
      : "";
    const fallbackDescription =
      rawContent.trim().slice(0, 157).trimEnd() ||
      `Дізнайтеся більше про ${pageTitle} на нашому сайті.`;

    return {
      title: seoRecord?.meta_title || `${pageTitle} | TeslaFix`,
      description: seoRecord?.meta_description || fallbackDescription,
    };
  } catch (e) {
    console.error("Failed to generate info page metadata:", e);
    return {
      title: "Інформаційна сторінка | TeslaFix",
      description: "Інформація про магазин запчастин для електромобілів Tesla.",
    };
  }
}

export default async function InfoPage({ params }: PageProps) {
  let pageData = null;
  let seoRecord = null;
  const resolvedParams = await params;

  try {
    const data = await api.getPage(resolvedParams.slug);
    if (data && data.is_published) {
      pageData = { title: data.title, content: data.content };
    }
  } catch (e) {
    console.error("Failed to load page data on server:", e);
  }

  if (!pageData) {
    pageData = PAGE_FALLBACKS[resolvedParams.slug] || null;
  }

  try {
    const seo = await api.getStaticSeo();
    seoRecord = seo.find((s) => s.slug === resolvedParams.slug) || null;
  } catch (e) {
    console.error("Failed to load seo details on server:", e);
  }

  return (
    <StaticPageClient
      slug={resolvedParams.slug}
      initialPage={pageData}
      initialSeo={seoRecord}
      fallbackTitle={
        PAGE_FALLBACKS[resolvedParams.slug]?.title || resolvedParams.slug
      }
    />
  );
}
