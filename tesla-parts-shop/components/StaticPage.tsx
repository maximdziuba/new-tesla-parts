import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SeoHead from './SeoHead';
import { StaticSeoRecord } from '../types';

interface StaticPageProps {
    slug: string;
    onBack: () => void;
    seo?: StaticSeoRecord | null;
}

// Map of slugs to Ukrainian titles for fallback
const PAGE_TITLES: { [key: string]: string } = {
    about: 'Про нас',
    delivery: 'Доставка та оплата',
    returns: 'Повернення',
    faq: 'Часті питання',
    contacts: 'Контакти'
};

const StaticPage: React.FC<StaticPageProps> = ({ slug, onBack, seo }) => {
    const [page, setPage] = useState<{ title: string; content: string } | null>(null);
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
                    setPage(null);
                }
            } catch (e) {
                console.error('Failed to load page', e);
                setPage(null);
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

    const fallbackTitle = `${page?.title || PAGE_TITLES[slug] || 'Магазин запчастин'}`;
    const rawContent = page?.content ? page.content.replace(/<[^>]+>/g, ' ') : '';
    const trimmedContent = rawContent.trim();
    const fallbackDescription =
        trimmedContent.length === 0
            ? 'Auto Parts Store — інтернет-магазин запчастин для електромобілів.'
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
                {page?.title || PAGE_TITLES[slug] || slug}
            </h1>

            {page ? (
                <div
                    className="text-gray-600 dark:text-slate-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
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
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Повернутись на головну
            </button>
        </div>
    );
};

export default StaticPage;
