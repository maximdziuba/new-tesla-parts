import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ApiService } from '../services/api';
import { ArrowLeft, Upload, X, Plus, Settings } from 'lucide-react';
import { Category, Subcategory } from '../types';

interface CategoryAssignment {
    id: string;
    categoryId: number | null;
    subcategoryPath: number[];
}

const generateAssignmentId = () => `assignment-${Math.random().toString(36).slice(2)}-${Date.now()}`;

const createEmptyAssignment = (): CategoryAssignment => ({
    id: generateAssignmentId(),
    categoryId: null,
    subcategoryPath: [],
});

const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/300';

interface SubcategorySelectorProps {
    assignmentId: string;
    level: number;
    subs: Subcategory[];
    value: string | number;
    onChange: (assignmentId: string, level: number, value: string) => void;
}

const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
    assignmentId,
    level,
    subs,
    value,
    onChange
}) => {
    // Use a local state variable for the selection as requested
    const [currentSelection, setCurrentSelection] = useState(value);

    // Synchronize local state with props when they change (e.g., when the category is reset)
    useEffect(() => {
        setCurrentSelection(value);
    }, [value]);

    return (
        <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {level === 0 ? "Підкатегорія" : `Підкатегорія (рівень ${level + 1})`}
            </label>
            <select
                value={currentSelection}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setCurrentSelection(newValue);
                    onChange(assignmentId, level, newValue);
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white transition-all text-sm font-medium"
            >
                <option value="">Оберіть підкатегорію</option>
                {subs.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                        {sub.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [keptImages, setKeptImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryAssignments, setCategoryAssignments] = useState<CategoryAssignment[]>(() => [createEmptyAssignment()]);
    const [pendingSubcategoryIds, setPendingSubcategoryIds] = useState<number[] | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subcategory_id: undefined as number | undefined,
        priceUAH: 0,
        priceUSD: 0,
        description: '',
        inStock: true,
        sort_order: undefined as number | undefined,
        detail_number: '',
        cross_number: '',
        meta_title: '',
        meta_description: ''
    });

    const [exchangeRate, setExchangeRate] = useState<number>(40); // Default fallback

    useEffect(() => {
        loadCategories();
        loadExchangeRate();
        if (isEditMode && id) {
            loadProduct(id);
        }
    }, [id]);

    useEffect(() => {
        if (!isEditMode) {
            const params = new URLSearchParams(location.search);
            const subId = params.get('subcategory_id');
            const catId = params.get('category_id');

            if (subId) {
                setPendingSubcategoryIds([Number(subId)]);
            } else {
                setCategoryAssignments([createEmptyAssignment()]);
                setPendingSubcategoryIds(null);
            }
        }
    }, [isEditMode, location.search]);

    const loadProduct = async (productId: string) => {
        try {
            const product = await ApiService.getProduct(productId);
            setFormData({
                name: product.name,
                category: product.category || '',
                subcategory_id: product.subcategory_id,
                priceUAH: product.priceUAH,
                priceUSD: product.priceUSD || 0,
                description: product.description,
                inStock: product.inStock,
                sort_order: product.sort_order || 0,
                detail_number: product.detail_number || '',
                cross_number: product.cross_number || '',
                meta_title: product.meta_title || '',
                meta_description: product.meta_description || ''
            });

            if (product.images && product.images.length > 0) {
                setKeptImages(product.images);
            } else if (product.image && product.image !== PLACEHOLDER_IMAGE_URL) {
                setKeptImages([product.image]);
            } else {11
                setKeptImages([]);
            }

            const productSubcategoryIds =
                (product.subcategory_ids && product.subcategory_ids.length > 0)
                    ? product.subcategory_ids
                    : product.subcategory_id
                        ? [product.subcategory_id]
                        : [];
            setPendingSubcategoryIds(productSubcategoryIds);
        } catch (e) {
            console.error("Failed to load product", e);
        }
    };

    const loadExchangeRate = async () => {
        try {
            const data = await ApiService.getSetting('exchange_rate');
            setExchangeRate(parseFloat(data.value) || 40);
        } catch (e) {
            console.error("Failed to load exchange rate", e);
        }
    };

    const handleUsdChange = (usd: number) => {
        setFormData(prev => ({
            ...prev,
            priceUSD: usd,
            priceUAH: Math.round(usd * exchangeRate)
        }));
    };

    const loadCategories = async () => {
        try {
            const data = await ApiService.getCategories();
            setCategories(data);
        } catch (e) {
            console.error("Failed to load categories", e);
        }
    };

    const subcategoryPathMap = useMemo(() => {
        const map = new Map<number, { categoryId: number; path: number[] }>();
        const traverse = (subs: Subcategory[] | undefined, path: number[], categoryId: number) => {
            if (!subs) return;
            subs.forEach(sub => {
                const currentPath = [...path, sub.id];
                map.set(sub.id, { categoryId, path: currentPath });
                if (sub.subcategories && sub.subcategories.length > 0) {
                    traverse(sub.subcategories, currentPath, categoryId);
                }
            });
        };
        categories.forEach(category => {
            traverse(category.subcategories, [], category.id);
        });
        return map;
    }, [categories]);

    const buildAssignmentsFromIds = (ids: number[]): CategoryAssignment[] => {
        const uniqueIds = Array.from(new Set(ids));
        const assignments: CategoryAssignment[] = [];
        uniqueIds.forEach(subId => {
            const info = subcategoryPathMap.get(subId);
            if (!info) return;
            assignments.push({
                id: generateAssignmentId(),
                categoryId: info.categoryId,
                subcategoryPath: [...info.path],
            });
        });
        return assignments.length ? assignments : [createEmptyAssignment()];
    };

    useEffect(() => {
        if (!pendingSubcategoryIds || pendingSubcategoryIds.length === 0 || categories.length === 0) {
            return;
        }
        const assignments = buildAssignmentsFromIds(pendingSubcategoryIds);
        if (assignments.length) {
            setCategoryAssignments(assignments);
            setPendingSubcategoryIds(null);
        }
    }, [pendingSubcategoryIds, categories, subcategoryPathMap]);

    useEffect(() => {
        const names = categoryAssignments
            .map(assignment => {
                if (assignment.categoryId === null) return null;
                const cat = categories.find(c => c.id === assignment.categoryId);
                return cat?.name || null;
            })
            .filter((name): name is string => Boolean(name));
        const uniqueNames = Array.from(new Set(names));
        const combined = uniqueNames.join(', ');
        setFormData(prev => {
            if (prev.category === combined) {
                return prev;
            }
            return { ...prev, category: combined };
        });
    }, [categoryAssignments, categories]);

    const handleAssignmentCategoryChange = (assignmentId: string, value: string) => {
        const numericValue = value ? Number(value) : null;
        setCategoryAssignments(prev =>
            prev.map(assignment =>
                assignment.id === assignmentId
                    ? { ...assignment, categoryId: numericValue, subcategoryPath: [] }
                    : assignment
            )
        );
    };

    const handleAssignmentSubcategoryChange = (assignmentId: string, level: number, value: string) => {
        setCategoryAssignments(prev =>
            prev.map(assignment => {
                if (assignment.id !== assignmentId) return assignment;
                const newPath = [...assignment.subcategoryPath];
                if (!value) {
                    newPath.splice(level);
                } else {
                    newPath[level] = Number(value);
                    newPath.splice(level + 1);
                }
                return { ...assignment, subcategoryPath: newPath };
            })
        );
    };

    const getSubcategoriesForAssignmentLevel = (assignment: CategoryAssignment, level: number): Subcategory[] => {
        if (assignment.categoryId === null) return [];
        const category = categories.find(c => c.id === assignment.categoryId);
        if (!category) return [];

        let currentSubs = category.subcategories || [];
        for (let i = 0; i < level; i++) {
            const id = assignment.subcategoryPath[i];
            if (!id) return [];
            const found = currentSubs.find(sub => sub.id === id);
            if (!found || !found.subcategories) {
                return [];
            }
            currentSubs = found.subcategories;
        }
        return currentSubs || [];
    };

    const renderSubcategorySelectors = (assignment: CategoryAssignment) => {
        if (assignment.categoryId === null) {
            return <p className="text-sm text-gray-500 mt-2">Оберіть категорію, щоб вибрати підкатегорії</p>;
        }

        const dropdowns: React.ReactNode[] = [];
        let level = 0;
        let continueLoop = true;

        while (continueLoop) {
            const subs = getSubcategoriesForAssignmentLevel(assignment, level);
            if (subs.length === 0) {
                if (level === 0) {
                    dropdowns.push(
                        <p key={`${assignment.id}-empty`} className="text-sm text-gray-500 mt-2">
                            У цій категорії ще немає підкатегорій
                        </p>
                    );
                }
                break;
            }

            const currentSelection = assignment.subcategoryPath[level] ?? '';
            dropdowns.push(
                <SubcategorySelector
                    key={`${assignment.id}-level-${level}`}
                    assignmentId={assignment.id}
                    level={level}
                    subs={subs}
                    value={currentSelection}
                    onChange={handleAssignmentSubcategoryChange}
                />
            );

            if (currentSelection) {
                const selectedSub = subs.find(sub => sub.id === Number(currentSelection));
                if (selectedSub && selectedSub.subcategories && selectedSub.subcategories.length > 0) {
                    level++;
                } else {
                    continueLoop = false;
                }
            } else {
                continueLoop = false;
            }
        }

        return dropdowns;
    };

    const handleAddAssignment = () => {
        setCategoryAssignments(prev => [...prev, createEmptyAssignment()]);
    };

    const handleRemoveAssignment = (assignmentId: string) => {
        setCategoryAssignments(prev => {
            if (prev.length <= 1) {
                return prev;
            }
            return prev.filter(assignment => assignment.id !== assignmentId);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const hasInvalidAssignment = categoryAssignments.some(
                assignment => assignment.categoryId === null || assignment.subcategoryPath.length === 0
            );
            if (hasInvalidAssignment) {
                alert('Заповніть категорію та підкатегорію для кожного блоку або видаліть зайві');
                setLoading(false);
                return;
            }

            const selectedSubcategoryIds = categoryAssignments
                .map(assignment => assignment.subcategoryPath[assignment.subcategoryPath.length - 1])
                .filter((id): id is number => typeof id === 'number');
            const uniqueSubcategoryIds = Array.from(new Set(selectedSubcategoryIds));

            if (uniqueSubcategoryIds.length === 0) {
                alert('Оберіть хоча б одну підкатегорію');
                setLoading(false);
                return;
            }

            const categoryNames = Array.from(
                new Set(
                    categoryAssignments
                        .map(assignment => {
                            if (assignment.categoryId === null) return null;
                            const cat = categories.find(c => c.id === assignment.categoryId);
                            return cat?.name || null;
                        })
                        .filter((name): name is string => Boolean(name))
                )
            );
            const categoryLabel = categoryNames.join(', ');
            const primarySubcategoryId = uniqueSubcategoryIds[0];

            const basePayload = {
                ...formData,
                category: categoryLabel || formData.category,
                subcategory_id: primarySubcategoryId,
                subcategory_ids: uniqueSubcategoryIds,
                files,
            };

            if (isEditMode && id) {
                await ApiService.updateProduct(id, { ...basePayload, kept_images: keptImages });
            } else {
                await ApiService.createProduct(basePayload);
            }
            navigate(-1);
        } catch (e) {
            console.error(e);
            alert(isEditMode ? 'Не вдалося оновити товар' : 'Не вдалося створити товар');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="inline-flex items-center text-gray-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Назад до списку
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 transition-all">
                <h1 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">{isEditMode ? 'Редагувати товар' : 'Новий товар'}</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Назва товару</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 font-bold text-slate-800"
                                placeholder="Наприклад: Передній бампер Model 3"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Номер деталі</label>
                            <input
                                type="text"
                                value={formData.detail_number}
                                onChange={e => setFormData({ ...formData, detail_number: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 font-mono text-sm"
                                placeholder="112201-00-A"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Cross-номер</label>
                            <input
                                type="text"
                                value={formData.cross_number}
                                onChange={e => setFormData({ ...formData, cross_number: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 font-mono text-sm"
                                placeholder="5Q0972887B"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Порядок (Sort)</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 font-bold"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50/30 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <label className="block text-sm font-black uppercase tracking-widest text-blue-600">Категорії та зв'язки</label>
                                <p className="text-[10px] font-bold text-blue-400 mt-1 uppercase">Оберіть де саме відображати цей товар</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddAssignment}
                                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-white px-3 py-2 rounded-lg shadow-sm border border-blue-100 transition-all"
                            >
                                <Plus size={14} />
                                Додати
                            </button>
                        </div>
                        <div className="space-y-4">
                            {categoryAssignments.map((assignment, index) => (
                                <div key={assignment.id} className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center text-[10px] font-black">{index + 1}</div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Зв'язок з каталогом
                                            </span>
                                        </div>
                                        {categoryAssignments.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                title="Видалити"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Основна модель (Категорія)</label>
                                            <select
                                                value={assignment.categoryId ?? ''}
                                                onChange={e => handleAssignmentCategoryChange(assignment.id, e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white transition-all text-sm font-bold text-slate-700"
                                            >
                                                <option value="">Оберіть модель</option>
                                                {categories.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {renderSubcategorySelectors(assignment)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ціна в доларах (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.1"
                                    value={formData.priceUSD}
                                    onChange={e => handleUsdChange(Number(e.target.value))}
                                    onWheel={e => e.currentTarget.blur()}
                                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-black text-lg text-slate-900"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ціна в гривнях (UAH)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-gray-400 font-bold">₴</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.priceUAH}
                                    readOnly
                                    className="w-full border border-gray-100 rounded-xl pl-8 pr-4 py-3 bg-gray-100 text-gray-500 font-black text-lg cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] font-bold text-emerald-600 mt-2 uppercase tracking-tight">Автоматично за курсом: {exchangeRate} грн/$</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Фотографії товару</label>
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">
                                        Натисніть або перетягніть файли
                                    </span>
                                    <span className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG, WEBP до 10MB</span>
                                </div>
                            </div>

                            {/* Existing Images (Edit Mode) */}
                            {keptImages.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Галерея на сайті:</p>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {keptImages.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square">
                                                <img
                                                    src={img}
                                                    alt={`existing-${idx}`}
                                                    className="w-full h-full object-cover rounded-xl border border-gray-100 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setKeptImages(keptImages.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 border border-red-100"
                                                    title="Видалити"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Image Previews */}
                            {files.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Нові файли до завантаження:</p>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="relative group aspect-square">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`preview-${idx}`}
                                                    className="w-full h-full object-cover rounded-xl border-2 border-emerald-100 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1.5 shadow-md hover:bg-red-50 transition-all border border-red-100"
                                                    title="Видалити"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Опис товару</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 text-sm leading-relaxed"
                            placeholder="Опишіть стан деталі, сумісність та інші важливі характеристики..."
                        />
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings size={18} className="text-slate-400" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-600">SEO Оптимізація</h2>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={formData.meta_title}
                                    onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm bg-white"
                                    placeholder="Наприклад: Купити передній бампер Tesla Model 3 | Оригінал"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Meta Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.meta_description}
                                    onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm bg-white resize-none"
                                    placeholder="Короткий опис, який клієнти побачать у Google..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                name="toggle"
                                id="inStock"
                                checked={formData.inStock}
                                onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                style={{
                                    right: formData.inStock ? '0' : 'auto',
                                    borderColor: formData.inStock ? '#10b981' : '#d1d5db'
                                }}
                            />
                            <label htmlFor="inStock" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${formData.inStock ? 'bg-emerald-400' : 'bg-gray-300'}`}></label>
                        </div>
                        <label htmlFor="inStock" className="text-sm font-bold text-slate-700 uppercase tracking-tight ml-2">
                            Товар в наявності та доступний для замовлення
                        </label>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 font-black text-lg shadow-xl shadow-blue-100 uppercase tracking-widest transform active:scale-[0.99]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Збереження...</span>
                                </div>
                            ) : (isEditMode ? 'Зберегти зміни' : 'Опублікувати товар')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
