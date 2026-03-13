import React, { useState, useMemo, useEffect } from 'react';
import { Product, Currency } from '../types';
import { ShoppingCart, ArrowLeft, Check, ChevronLeft, ChevronRight, Truck, ShieldCheck } from 'lucide-react';
import { DEFAULT_EXCHANGE_RATE_UAH_PER_USD } from '../constants';
import SeoHead from './SeoHead';
import { formatCurrency } from '../utils/currency';
import { api } from '../services/api';

interface ProductPageProps {
    product: Product;
    currency: Currency;
    uahPerUsd: number;
    onAddToCart: (product: Product) => void;
    onBack: () => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ product, currency, uahPerUsd, onAddToCart, onBack }) => {
    // Combine main image with additional images and remove duplicates
    const allImages = useMemo(
        () => Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean))),
        [product.image, product.images]
    );
    const [selectedImage, setSelectedImage] = useState(allImages[0]);
    const [added, setAdded] = useState(false);
    const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);
    const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;

    useEffect(() => {
        const fetchDeliveryInfo = async () => {
            const page = await api.getPage('delivery');
            if (page && page.content) {
                setDeliveryInfo(page.content);
            }
        };
        fetchDeliveryInfo();
    }, []);

    const fallbackTitle = `${product.name}`;
    const fallbackDescription = useMemo(() => {
        const trimmed = product.meta_description?.trim();
        if (trimmed) return trimmed;
        const desc = product.description?.trim();
        if (desc) {
            const shortened = desc.length > 160 ? `${desc.slice(0, 157).trimEnd()}...` : desc;
            return shortened;
        }
        return `Buy ${product.name} at Auto Parts Store`;
    }, [product.meta_description, product.description, product.name]);
    const seoImage = selectedImage || product.image;

    const handleAddToCart = () => {
        onAddToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handlePrevImage = () => {
        const currentIndex = allImages.indexOf(selectedImage);
        const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[prevIndex]);
    };

    const handleNextImage = () => {
        const currentIndex = allImages.indexOf(selectedImage);
        const nextIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[nextIndex]);
    };

    const getDisplayPrice = () => {
        const priceUSD = product.priceUSD && product.priceUSD > 0
            ? product.priceUSD
            : (product.priceUAH && product.priceUAH > 0 && effectiveRate > 0
                ? product.priceUAH / effectiveRate
                : 0);
        const amount = currency === Currency.USD ? priceUSD : priceUSD * effectiveRate;
        return formatCurrency(amount, currency);
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <SeoHead
                title={product.meta_title || product.name}
                description={product.meta_description}
                fallbackTitle={product.name} // Якщо немає meta_title, візьме назву
                fallbackDescription={`Купити ${product.name} за ціною ${product.priceUAH} грн`}
                image={product.image}

                // ВАЖЛИВО: Передаємо дані для Schema
                type="product"
                price={product.priceUAH}
                currency="UAH"
                availability={product.inStock}
                deliveryInfo={deliveryInfo}
            />
            <button
                onClick={onBack}
                className="flex items-center text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors group"
            >
                <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Назад
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="flex flex-col md:flex-row">
                    {/* Image Gallery */}
                    <div className="md:w-1/2 p-6 bg-gray-50 dark:bg-slate-900/50">
                        <div className="relative">
                            <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-800 mb-4 shadow-sm border border-gray-100 dark:border-slate-700">
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full p-2 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full p-2 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-all shadow-md"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === img ? 'border-blue-600' : 'border-transparent hover:border-gray-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                        <div className="mb-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                        {product.category}
                                    </span>
                                    {product.detail_number && (
                                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                            Part #: {product.detail_number}
                                        </span>
                                    )}
                                    {product.cross_number && (
                                        <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                            Cross #: {product.cross_number}
                                        </span>
                                    )}
                                </div>
                                {product.inStock ? (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        В наявності
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        Немає в наявності
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">{product.name}</h1>

                            <div className="mb-8">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {getDisplayPrice()}
                                </div>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-slate-300 mb-8">
                                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Опис</h3>
                                <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-slate-700">
                            <button
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${added
                                    ? 'bg-green-600 text-white'
                                    : product.inStock
                                        ? 'bg-blue-600 text-white hover:bg-blue-800 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {added ? (
                                    <>
                                        <Check size={24} />
                                        Додано в кошик
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={24} />
                                        {product.inStock ? 'Купити' : 'Немає в наявності'}
                                    </>
                                )}
                            </button>
                            
                            {/* Delivery & Payment Info */}
                            {deliveryInfo && (
                                <div className="mt-8 bg-gray-50 dark:bg-slate-900/30 rounded-xl p-5 border border-gray-100 dark:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-2 mb-3 text-slate-900 dark:text-white font-bold">
                                        <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                                        <h3>Доставка та оплата</h3>
                                    </div>
                                    <div className="text-gray-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-2 custom-scrollbar text-sm leading-relaxed">
                                        <p className="whitespace-pre-line">{deliveryInfo}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
