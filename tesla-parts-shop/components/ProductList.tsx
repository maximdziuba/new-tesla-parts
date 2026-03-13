import React from 'react';
import { Product, Currency } from '../types';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { DEFAULT_EXCHANGE_RATE_UAH_PER_USD } from '../constants';
import { formatCurrency } from '../utils/currency';

interface ProductListProps {
  products: Product[];
  currency: Currency;
  uahPerUsd: number;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  title?: string;
}

const ProductList: React.FC<ProductListProps> = ({ products, currency, uahPerUsd, onAddToCart, onProductClick, title }) => {
  const effectiveRate = uahPerUsd > 0 ? uahPerUsd : DEFAULT_EXCHANGE_RATE_UAH_PER_USD;

  const getUsdPrice = (product: Product) => {
    if (product.priceUSD && product.priceUSD > 0) return product.priceUSD;
    if (product.priceUAH && product.priceUAH > 0 && effectiveRate > 0) {
      return product.priceUAH / effectiveRate;
    }
    return 0;
  };

  const formatPrice = (product: Product) => {
    const usd = getUsdPrice(product);
    const amount = currency === Currency.USD ? usd : usd * effectiveRate;
    return formatCurrency(amount, currency);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="text-gray-400 dark:text-slate-500 mb-4 flex justify-center"><AlertCircle size={48} /></div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Товарів не знайдено</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Спробуйте змінити параметри пошуку або обрати іншу категорію.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {title && <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-l-4 border-blue-600 pl-4">{title}</h2>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className="relative w-full pb-[100%] bg-gray-100 dark:bg-slate-900">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover xl:group-hover:scale-105 transition-transform duration-300"
              />
              {!product.inStock && (
                <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  Немає в наявності
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</div>
              {product.detail_number && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.detail_number}</div>
              )}
              {product.cross_number && (
                <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">Cross: {product.cross_number}</div>
              )}
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem] active:text-blue-600 dark:active:text-blue-400 xl:group-hover:text-blue-600 dark:xl:group-hover:text-blue-400 transition-colors">
                {product.name}
              </h3>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatPrice(product)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  disabled={!product.inStock}
                  className={`p-2 rounded-full transition ${product.inStock
                    ? 'bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white active:bg-blue-600 dark:active:bg-blue-500 active:text-white xl:hover:bg-blue-600 dark:xl:hover:bg-blue-500 xl:hover:text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  aria-label="Додати в кошик"
                >
                  <ShoppingBag size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;