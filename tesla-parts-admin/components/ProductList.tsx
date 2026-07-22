import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { Product } from "../types";
import {
  Search,
  Plus,
  Filter,
  Trash2,
  Pencil,
  ArrowUpDown,
  Star,
} from "lucide-react";

import { Link } from "react-router-dom";

const extractCategories = (value?: string) => {
  if (!value) return [];
  return value
    .split(",")
    .map((cat) => cat.trim())
    .filter(Boolean);
};

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Всі");
  const [sortBy, setSortBy] = useState<string>("default");
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];
    if (categoryFilter !== "Всі") {
      result = result.filter((p) =>
        extractCategories(p.category).includes(categoryFilter),
      );
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const cleanSearch = lower.replace(/-/g, "");
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.detail_number &&
            p.detail_number
              .toLowerCase()
              .replace(/-/g, "")
              .includes(cleanSearch)) ||
          (p.cross_number && p.cross_number.toLowerCase().includes(lower)),
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.priceUSD || 0) - (b.priceUSD || 0);
        case "price-desc":
          return (b.priceUSD || 0) - (a.priceUSD || 0);
        case "cross-asc":
          return (a.cross_number || "").localeCompare(b.cross_number || "");
        case "cross-desc":
          return (b.cross_number || "").localeCompare(a.cross_number || "");
        case "date-newest":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        default:
          // Backend default or preserved order
          return 0;
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, sortBy, products]);

  const handleDelete = async (id: string) => {
    if (confirm("Ви впевнені, що хочете видалити цей товар?")) {
      await ApiService.deleteProduct(id);
      setSelectedProducts((prev) => prev.filter((pid) => pid !== id));
      fetchProducts();
    }
  };

  const handleToggleFavourite = async (id: string) => {
    try {
      await ApiService.toggleFavourite(id);
      fetchProducts();
    } catch (error) {
      console.error("Failed to toggle favourite", error);
      alert("Помилка при зміні статусу популярного товару");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedProducts((prev) =>
      prev.filter((pid) => products.some((product) => product.id === pid)),
    );
  }, [products]);

  const allVisibleIds = filteredProducts.map((p) => p.id);
  const isAllSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedProducts.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProducts((prev) =>
        prev.filter((id) => !allVisibleIds.includes(id)),
      );
    } else {
      setSelectedProducts((prev) =>
        Array.from(new Set([...prev, ...allVisibleIds])),
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!confirm(`Видалити ${selectedProducts.length} товар(и)?`)) return;
    try {
      await ApiService.bulkDeleteProducts(selectedProducts);
      setSelectedProducts([]);
      fetchProducts();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Не вдалося видалити вибрані товари");
    }
  };

  if (loading) return <div className="p-8 text-center">Завантаження...</div>;

  const categories = [
    "Всі",
    ...Array.from(
      new Set(products.flatMap((p) => extractCategories(p.category))),
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-80 lg:w-96">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Пошук за назвою..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={handleBulkDelete}
            disabled={selectedProducts.length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border flex-1 sm:flex-none ${
              selectedProducts.length === 0
                ? "text-gray-300 border-gray-100 cursor-not-allowed"
                : "text-red-600 border-red-100 hover:bg-red-50"
            }`}
          >
            <Trash2 size={16} />
            <span className="whitespace-nowrap font-medium text-sm">
              Видалити вибрані
            </span>
            {selectedProducts.length > 0 && (
              <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {selectedProducts.length}
              </span>
            )}
          </button>

          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">За замовчуванням</option>
              <option value="name-asc">Назва (А-Я)</option>
              <option value="name-desc">Назва (Я-А)</option>
              <option value="price-asc">Ціна (дешевше)</option>
              <option value="price-desc">Ціна (дорожче)</option>
              <option value="cross-asc">Cross-номер (A-Z)</option>
              <option value="cross-desc">Cross-номер (Z-A)</option>
              <option value="date-newest">Спочатку нові</option>
              <option value="date-oldest">Спочатку старі</option>
            </select>
            <ArrowUpDown
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          <Link
            to="/products/new"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm flex-1 sm:flex-none"
          >
            <Plus size={20} />
            <span className="whitespace-nowrap">Додати Товар</span>
          </Link>
        </div>
      </div>

      <div className="px-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Всього товарів:{" "}
          <span className="text-slate-900">{products.length}</span>
          {filteredProducts.length !== products.length && (
            <>
              {" "}
              • Знайдено:{" "}
              <span className="text-blue-600">{filteredProducts.length}</span>
            </>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4">Товар</th>
                <th className="px-6 py-4">Категорія</th>
                <th className="px-6 py-4">Наявність</th>
                <th className="px-6 py-4">Ціна</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1 max-w-[250px]">
                          {product.description}
                        </div>
                        {product.cross_number && (
                          <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                            Cross: {product.cross_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.inStock ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                        В наявності
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold uppercase">
                        Немає
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {product.priceUSD} $
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggleFavourite(product.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.is_favourite
                            ? "text-amber-500 hover:bg-amber-50"
                            : "text-gray-400 hover:bg-gray-100 hover:text-amber-500"
                        }`}
                        title={
                          product.is_favourite
                            ? "Видалити з популярних"
                            : "Додати в популярні"
                        }
                      >
                        <Star
                          size={16}
                          className={product.is_favourite ? "fill-current" : ""}
                        />
                      </button>
                      <Link
                        to={`/products/edit/${product.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Редагувати"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Видалити"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Товарів не знайдено.
          </div>
        )}
      </div>
    </div>
  );
};
