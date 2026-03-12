'use client';

import React, { useEffect } from 'react';

interface SeoHeadProps {
  title?: string | null;
  description?: string | null;
  image?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;

  // Нові пропси для Schema.org
  type?: 'website' | 'product'; // Тип сторінки
  price?: number;               // Ціна (для товарів)
  currency?: string;            // Валюта (за замовчуванням UAH)
  availability?: boolean;       // Чи є в наявності
  deliveryInfo?: string | null; // Інформація про доставку
}

const DEFAULT_TITLE = 'Магазин запчастин';
const DEFAULT_DESCRIPTION = 'Auto Parts Store пропонує запчастини та аксесуари для вашого електромобіля.';

const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  image,
  fallbackTitle,
  fallbackDescription,
  type = 'website',
  price,
  currency = 'UAH',
  availability = true,
  deliveryInfo
}) => {
  const safeTitle = title?.trim() || fallbackTitle?.trim() || DEFAULT_TITLE;
  let safeDescription = description?.trim() || fallbackDescription?.trim() || DEFAULT_DESCRIPTION;

  if (type === 'product' && deliveryInfo) {
    const deliverySummary = deliveryInfo.split('\n').filter(l => l.trim().length > 0).slice(0, 3).join('. ');
    const truncatedDelivery = deliverySummary.length > 150 ? deliverySummary.slice(0, 147) + '...' : deliverySummary;
    if (!safeDescription.includes(truncatedDelivery.slice(0, 20))) {
        safeDescription = `${safeDescription} ${truncatedDelivery}`;
    }
  }

  useEffect(() => {
    document.title = safeTitle;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', safeDescription);
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = safeDescription;
      document.head.appendChild(meta);
    }

    // Update OG tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    updateOgTag('og:title', safeTitle);
    updateOgTag('og:description', safeDescription);
    updateOgTag('og:type', type === 'product' ? 'product' : 'website');
    updateOgTag('og:url', window.location.href);
    if (image) {
      updateOgTag('og:image', image);
    }

    // Structured Data
    let structuredDataText = '';
    if (type === 'product') {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const priceValidUntil = nextYear.toISOString().split('T')[0];
        
        const structuredData = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": safeTitle,
          "image": image ? [image] : [],
          "description": safeDescription,
          "brand": {
            "@type": "Brand",
            "name": "Tesla"
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": currency,
            "priceValidUntil": priceValidUntil,
            "price": price,
            "availability": availability ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/UsedCondition"
          }
        };
        structuredDataText = JSON.stringify(structuredData);
    }

    const existingScript = document.querySelector('script[type="application/ld+json"].dynamic-seo');
    if (existingScript) {
        if (structuredDataText) {
            existingScript.textContent = structuredDataText;
        } else {
            existingScript.remove();
        }
    } else if (structuredDataText) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.className = 'dynamic-seo';
        script.textContent = structuredDataText;
        document.head.appendChild(script);
    }

  }, [safeTitle, safeDescription, image, type, price, currency, availability]);

  return null;
};

export default SeoHead;
