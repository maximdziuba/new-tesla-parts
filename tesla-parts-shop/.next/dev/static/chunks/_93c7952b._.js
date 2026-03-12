(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/SeoHead.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
const DEFAULT_TITLE = 'Auto Parts Store';
const DEFAULT_DESCRIPTION = 'Auto Parts Store пропонує запчастини та аксесуари для вашого електромобіля.';
const SeoHead = ({ title, description, image, fallbackTitle, fallbackDescription, type = 'website', price, currency = 'UAH', availability = true, deliveryInfo })=>{
    _s();
    const safeTitle = title?.trim() || fallbackTitle?.trim() || DEFAULT_TITLE;
    let safeDescription = description?.trim() || fallbackDescription?.trim() || DEFAULT_DESCRIPTION;
    if (type === 'product' && deliveryInfo) {
        const deliverySummary = deliveryInfo.split('\n').filter((l)=>l.trim().length > 0).slice(0, 3).join('. ');
        const truncatedDelivery = deliverySummary.length > 150 ? deliverySummary.slice(0, 147) + '...' : deliverySummary;
        if (!safeDescription.includes(truncatedDelivery.slice(0, 20))) {
            safeDescription = `${safeDescription} ${truncatedDelivery}`;
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SeoHead.useEffect": ()=>{
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
            const updateOgTag = {
                "SeoHead.useEffect.updateOgTag": (property, content)=>{
                    let tag = document.querySelector(`meta[property="${property}"]`);
                    if (tag) {
                        tag.setAttribute('content', content);
                    } else {
                        tag = document.createElement('meta');
                        tag.setAttribute('property', property);
                        tag.setAttribute('content', content);
                        document.head.appendChild(tag);
                    }
                }
            }["SeoHead.useEffect.updateOgTag"];
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
                    "image": image ? [
                        image
                    ] : [],
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
        }
    }["SeoHead.useEffect"], [
        safeTitle,
        safeDescription,
        image,
        type,
        price,
        currency,
        availability
    ]);
    return null;
};
_s(SeoHead, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = SeoHead;
const __TURBOPACK__default__export__ = SeoHead;
var _c;
__turbopack_context__.k.register(_c, "SeoHead");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/StaticPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SeoHead$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SeoHead.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
// Map of slugs to Ukrainian titles for fallback
const PAGE_TITLES = {
    about: 'Про нас',
    delivery: 'Доставка та оплата',
    returns: 'Повернення',
    faq: 'Часті питання',
    contacts: 'Контакти'
};
const StaticPage = ({ slug, onBack, seo })=>{
    _s();
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "StaticPage.useEffect": ()=>{
            const loadPage = {
                "StaticPage.useEffect.loadPage": async ()=>{
                    setLoading(true);
                    try {
                        const data = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].getPage(slug);
                        if (data && data.is_published) {
                            setPage({
                                title: data.title,
                                content: data.content
                            });
                        } else {
                            // Fallback if page not found or not published
                            setPage(null);
                        }
                    } catch (e) {
                        console.error('Failed to load page', e);
                        setPage(null);
                    } finally{
                        setLoading(false);
                    }
                }
            }["StaticPage.useEffect.loadPage"];
            loadPage();
        }
    }["StaticPage.useEffect"], [
        slug
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "py-12 max-w-2xl mx-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center py-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative w-10 h-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 border-4 border-tesla-red/20 rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/components/StaticPage.tsx",
                            lineNumber: 51,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 border-4 border-tesla-red border-t-transparent rounded-full animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/components/StaticPage.tsx",
                            lineNumber: 52,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/StaticPage.tsx",
                    lineNumber: 50,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 49,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/components/StaticPage.tsx",
            lineNumber: 48,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0));
    }
    const fallbackTitle = `${page?.title || PAGE_TITLES[slug] || 'Auto Parts Store'} | Auto Parts Store`;
    const rawContent = page?.content ? page.content.replace(/<[^>]+>/g, ' ') : '';
    const trimmedContent = rawContent.trim();
    const fallbackDescription = trimmedContent.length === 0 ? 'Auto Parts Store — інтернет-магазин запчастин для Tesla.' : trimmedContent.length > 160 ? `${trimmedContent.slice(0, 157).trimEnd()}...` : trimmedContent;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-12 max-w-2xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SeoHead$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                title: seo?.meta_title,
                description: seo?.meta_description,
                fallbackTitle: fallbackTitle,
                fallbackDescription: fallbackDescription
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 71,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold mb-6",
                children: page?.title || PAGE_TITLES[slug] || slug
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 77,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            page ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-600 leading-relaxed prose prose-lg max-w-none",
                dangerouslySetInnerHTML: {
                    __html: page.content.replace(/\n/g, '<br />')
                }
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 82,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-600 leading-relaxed",
                children: "Ця сторінка знаходиться в розробці."
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 87,
                columnNumber: 17
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onBack,
                className: "mt-8 text-tesla-red font-medium hover:underline",
                children: "← Повернутись на головну"
            }, void 0, false, {
                fileName: "[project]/components/StaticPage.tsx",
                lineNumber: 92,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/StaticPage.tsx",
        lineNumber: 70,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(StaticPage, "Ggpj4SYIOS38mA0HdnhZlsLRqEg=");
_c = StaticPage;
const __TURBOPACK__default__export__ = StaticPage;
var _c;
__turbopack_context__.k.register(_c, "StaticPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/info/[slug]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InfoPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaticPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/StaticPage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AppContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function InfoPage() {
    _s();
    const { slug } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const { staticSeo } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    if (!slug) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$StaticPage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        slug: slug,
        onBack: ()=>router.push('/'),
        seo: staticSeo[slug]
    }, void 0, false, {
        fileName: "[project]/app/info/[slug]/page.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(InfoPage, "p33LbFzVK6fZuzQvrpKjgdQRWeA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AppContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = InfoPage;
var _c;
__turbopack_context__.k.register(_c, "InfoPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_93c7952b._.js.map