import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ApiService } from "../services/api";
import { Category, Subcategory, Product } from "../types";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Folder,
  Image as ImageIcon,
  CornerDownRight,
  Pencil,
  Check,
  X,
  ArrowLeftRight,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface SubcategoryItemProps {
  subcategory: Subcategory;
  categoryId: number;
  categories: Category[];
  level?: number;
  onDelete: (id: number) => void;
  onCreate: (
    categoryId: number,
    name: string,
    code?: string,
    parentId?: number,
    file?: File,
    sortOrder?: number,
  ) => void;
  onEdit: (
    id: number,
    name: string,
    code: string,
    parentId?: number,
    file?: File,
    sortOrder?: number,
  ) => void;
  onTransfer: (
    id: number,
    targetCategoryId: number,
    targetParentId: number | undefined,
    mode: "move" | "copy",
  ) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateProductSort: (
    product: Product,
    newSortOrder: number,
  ) => Promise<void>;
  onUpdateSubcategorySort: (
    subcategory: Subcategory,
    newSortOrder: number,
  ) => Promise<void>;
}

const collectDescendantIds = (sub: Subcategory): number[] => {
  if (!sub.subcategories || sub.subcategories.length === 0) return [];
  const ids: number[] = [];
  sub.subcategories.forEach((child) => {
    ids.push(child.id, ...collectDescendantIds(child));
  });
  return ids;
};

const collectProductIdsInSubtree = (sub: Subcategory, ids: Set<string>) => {
  sub.products?.forEach((p) => ids.add(p.id));
  sub.subcategories?.forEach((child) => collectProductIdsInSubtree(child, ids));
};

const flattenSubcategoriesForSelect = (
  subs: Subcategory[] | undefined,
  excludeIds: Set<number>,
  depth = 0,
): { id: number; label: string }[] => {
  if (!subs) return [];
  const result: { id: number; label: string }[] = [];
  subs.forEach((item) => {
    if (excludeIds.has(item.id)) {
      return;
    }
    const prefix = depth > 0 ? `${"--".repeat(depth)} ` : "";
    result.push({ id: item.id, label: `${prefix}${item.name}` });
    if (item.subcategories && item.subcategories.length > 0) {
      result.push(
        ...flattenSubcategoriesForSelect(
          item.subcategories,
          excludeIds,
          depth + 1,
        ),
      );
    }
  });
  return result;
};

const sortSubcategoriesTree = (
  subs: Subcategory[] | undefined,
): Subcategory[] => {
  if (!subs) return [];
  return [...subs]
    .sort((a, b) => {
      const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.id - b.id;
    })
    .map((sub) => ({
      ...sub,
      subcategories: sortSubcategoriesTree(sub.subcategories),
    }));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortCategoriesData = (cats: Category[]): Category[] => {
  return [...cats]
    .sort((a, b) => {
      const orderDiff = (b.sort_order ?? 0) - (a.sort_order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return a.id - b.id;
    })
    .map((cat) => ({
      ...cat,
      subcategories: sortSubcategoriesTree(cat.subcategories),
    }));
};

const SubcategoryItem: React.FC<SubcategoryItemProps> = ({
  subcategory,
  categoryId,
  categories,
  level = 0,
  onDelete,
  onCreate,
  onEdit,
  onTransfer,
  onDeleteProduct,
  onUpdateProductSort,
  onUpdateSubcategorySort,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferCategoryId, setTransferCategoryId] =
    useState<number>(categoryId);
  const [transferParentId, setTransferParentId] = useState<number | "">(
    subcategory.parent_id ?? "",
  );
  const [isTransferring, setIsTransferring] = useState(false);

  // New Child State
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  // Edit State
  const [editName, setEditName] = useState(subcategory.name);
  const [editCode, setEditCode] = useState(subcategory.code || "");
  const [editFile, setEditFile] = useState<File | null>(null);

  const productCount = useMemo(() => {
    const ids = new Set<string>();
    collectProductIdsInSubtree(subcategory, ids);
    return ids.size;
  }, [subcategory]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransferCategoryId(categoryId);
  }, [categoryId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransferParentId(subcategory.parent_id ?? "");
  }, [subcategory.parent_id]);

  const descendantIds = useMemo(
    () => new Set([subcategory.id, ...collectDescendantIds(subcategory)]),
    [subcategory],
  );

  const parentOptions = useMemo(() => {
    const targetCategory = categories.find(
      (cat) => cat.id === transferCategoryId,
    );
    if (!targetCategory) return [];
    return flattenSubcategoriesForSelect(
      targetCategory.subcategories,
      descendantIds,
    );
  }, [categories, transferCategoryId, descendantIds]);

  const handleAddChild = () => {
    if (!newName.trim()) return;
    onCreate(
      categoryId,
      newName,
      newCode,
      subcategory.id,
      newFile || undefined,
    );
    setNewName("");
    setNewCode("");
    setNewFile(null);
    setIsAddingChild(false);
    setIsExpanded(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onEdit(
      subcategory.id,
      editName,
      editCode,
      subcategory.parent_id ?? undefined,
      editFile || undefined,
    );
    setEditFile(null);
    setIsEditing(false);
  };

  const handleTransferAction = async (mode: "move" | "copy") => {
    if (!transferCategoryId) return;
    const parentIdValue =
      transferParentId === "" ? undefined : Number(transferParentId);
    try {
      setIsTransferring(true);
      await onTransfer(subcategory.id, transferCategoryId, parentIdValue, mode);
      setShowTransfer(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTransferring(false);
    }
  };

  const hasChildren =
    subcategory.subcategories && subcategory.subcategories.length > 0;
  const hasProducts = subcategory.products && subcategory.products.length > 0;
  const canExpand = hasChildren || hasProducts;

  // Find siblings for sorting
  const siblings = useMemo(() => {
    const parentCategory = categories.find((c) => c.id === categoryId);
    if (!parentCategory) return [];

    let rawSiblings: Subcategory[];
    if (!subcategory.parent_id) {
      rawSiblings = parentCategory.subcategories;
    } else {
      // Helper to find parent subcategory
      const findParentSub = (subs: Subcategory[]): Subcategory | undefined => {
        for (const s of subs) {
          if (s.id === subcategory.parent_id) return s;
          if (s.subcategories) {
            const found = findParentSub(s.subcategories);
            if (found) return found;
          }
        }
        return undefined;
      };
      const parentSub = findParentSub(parentCategory.subcategories);
      rawSiblings = parentSub?.subcategories || [];
    }
    // Sort DESC to match visual order
    return [...rawSiblings].sort(
      (a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0) || a.id - b.id,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, categoryId, subcategory.parent_id, subcategory.id]);

  const siblingIndex = siblings.findIndex((s) => s.id === subcategory.id);

  return (
    <div className="border-l border-gray-100 ml-4">
      <div
        className={`group flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 ${level > 0 ? "ml-4" : ""}`}
      >
        <div
          className={`flex items-center gap-2 text-gray-700 flex-1 ${canExpand ? "cursor-pointer" : ""}`}
          onClick={() => canExpand && setIsExpanded(!isExpanded)}
        >
          {canExpand && (
            <div className="p-1 hover:bg-gray-200 rounded">
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
          )}
          {!canExpand && <div className="w-6" />} {/* Spacer */}
          {/* Sorting Arrows for Subcategory */}
          <div
            className="flex flex-col items-center mr-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (siblingIndex > 0) {
                  const targetOrder =
                    (siblings[siblingIndex - 1].sort_order ?? 0) + 1;
                  onUpdateSubcategorySort(subcategory, targetOrder);
                }
              }}
              disabled={siblingIndex === 0}
              className={`p-0.5 ${siblingIndex === 0 ? "text-gray-100" : "text-gray-400 hover:text-blue-600"}`}
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={() => {
                if (siblingIndex < siblings.length - 1) {
                  const targetOrder =
                    (siblings[siblingIndex + 1].sort_order ?? 0) - 1;
                  onUpdateSubcategorySort(subcategory, targetOrder);
                }
              }}
              disabled={siblingIndex === siblings.length - 1}
              className={`p-0.5 ${siblingIndex === siblings.length - 1 ? "text-gray-100" : "text-gray-400 hover:text-blue-600"}`}
            >
              <ArrowDown size={12} />
            </button>
          </div>
          {isEditing ? (
            <div
              className="flex items-center gap-2 flex-1 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 w-32"
                autoFocus
              />
              <input
                type="text"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 w-20"
                placeholder="Код"
              />
              <div className="flex items-center gap-2">
                {subcategory.image && (
                  <img
                    src={subcategory.image}
                    alt=""
                    className="h-8 w-auto rounded object-contain bg-white border border-gray-200"
                  />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-colors">
                  <ImageIcon size={14} />
                  <span>Файл</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEditFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
              <button
                onClick={handleSaveEdit}
                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-md transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:bg-gray-100 p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              {subcategory.image ? (
                <img
                  src={subcategory.image}
                  alt=""
                  className="h-6 w-auto max-w-[4rem] rounded object-contain bg-white shadow-sm"
                />
              ) : (
                <Folder size={16} className="text-blue-400" />
              )}
              <span className="font-bold text-slate-700">
                {subcategory.name}
              </span>
              {subcategory.code && (
                <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded tracking-tighter">
                  ID: {subcategory.code}
                </span>
              )}
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                {productCount} тов.
              </span>
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-1">
            <Link
              to={`/products/new?subcategory_id=${subcategory.id}&category_id=${categoryId}`}
              className="text-gray-400 hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Додати товар"
            >
              <Package size={16} />
            </Link>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              title="Редагувати"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAddingChild(!isAddingChild);
              }}
              className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              title="Додати підкатегорію"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTransfer(!showTransfer);
              }}
              className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Перемістити / копіювати"
            >
              <ArrowLeftRight size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subcategory.id);
              }}
              className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="Видалити"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add Child Form */}
      {isAddingChild && (
        <div
          className={`ml-8 mt-2 mb-2 p-4 bg-blue-50/30 rounded-xl border border-blue-100 flex gap-3 items-center flex-wrap shadow-sm`}
        >
          <CornerDownRight size={16} className="text-blue-400" />
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[150px] border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
            placeholder="Назва..."
            autoFocus
          />
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="w-24 border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white"
            placeholder="Код"
          />

          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-white hover:bg-gray-50 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100 transition-all shadow-sm">
              <ImageIcon size={14} className="text-blue-500" />
              <span>Обрати фото</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewFile(e.target.files[0]);
                  } else {
                    setNewFile(null);
                  }
                }}
              />
            </label>
            {newFile && (
              <span className="text-[10px] text-blue-600 font-bold max-w-[100px] truncate">
                {newFile.name}
              </span>
            )}
          </div>

          <button
            onClick={handleAddChild}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-100"
          >
            Створити
          </button>
        </div>
      )}

      {/* Transfer Form */}
      {showTransfer && (
        <div className="ml-8 mt-2 mb-2 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={transferCategoryId}
              onChange={(e) => {
                const value = Number(e.target.value);
                setTransferCategoryId(value);
                setTransferParentId("");
              }}
              className="flex-1 border border-indigo-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={transferParentId}
              onChange={(e) => {
                const value = e.target.value;
                setTransferParentId(value === "" ? "" : Number(value));
              }}
              className="flex-1 border border-indigo-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
            >
              <option value="">Корінь категорії</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleTransferAction("move")}
              disabled={isTransferring}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
            >
              ПЕРЕМІСТИТИ
            </button>
            <button
              onClick={() => handleTransferAction("copy")}
              disabled={isTransferring}
              className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm disabled:opacity-50"
            >
              КОПІЮВАТИ
            </button>
            <button
              onClick={() => setShowTransfer(false)}
              className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 px-2 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Products List & Children */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Products List */}
          {hasProducts && (
            <div className="ml-8 mb-4 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  Товари в підкатегорії
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-tighter border-b border-gray-50">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center">Сорт.</th>
                      <th className="px-4 py-2">Назва товару</th>
                      <th className="px-4 py-2">Ціна</th>
                      <th className="px-4 py-2">Наявність</th>
                      <th className="px-4 py-2 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const sortedProducts = [...subcategory.products!].sort(
                        (a, b) =>
                          (b.sort_order ?? 0) - (a.sort_order ?? 0) ||
                          a.name.localeCompare(b.name),
                      );

                      return sortedProducts.map((product, idx) => (
                        <tr
                          key={product.id}
                          className="hover:bg-blue-50/20 transition-colors group/row"
                        >
                          <td className="px-4 py-2">
                            <div className="flex flex-col items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (idx > 0) {
                                    const targetOrder =
                                      (sortedProducts[idx - 1].sort_order ??
                                        0) + 1;
                                    onUpdateProductSort(product, targetOrder);
                                  }
                                }}
                                disabled={idx === 0}
                                className={`p-0.5 ${idx === 0 ? "text-gray-100" : "text-gray-300 hover:text-blue-600 transition-colors"}`}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (idx < sortedProducts.length - 1) {
                                    const targetOrder =
                                      (sortedProducts[idx + 1].sort_order ??
                                        0) - 1;
                                    onUpdateProductSort(product, targetOrder);
                                  }
                                }}
                                disabled={idx === sortedProducts.length - 1}
                                className={`p-0.5 ${idx === sortedProducts.length - 1 ? "text-gray-100" : "text-gray-300 hover:text-blue-600 transition-colors"}`}
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={product.image}
                                alt=""
                                className="w-8 h-8 rounded-md object-cover border border-gray-100 shadow-xs"
                              />
                              <div>
                                <div className="font-bold text-slate-700 group-hover/row:text-blue-600 transition-colors">
                                  {product.name}
                                </div>
                                <div className="text-[9px] font-bold text-gray-400 uppercase">
                                  {product.detail_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className="font-black text-slate-900">
                              {product.priceUSD} $
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`${product.inStock ? "text-emerald-600" : "text-red-500"} font-bold`}
                            >
                              {product.inStock ? "Так" : "Ні"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Link
                                to={`/products/edit/${product.id}`}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Pencil size={12} />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Видалити цей товар?")) {
                                    onDeleteProduct(product.id);
                                  }
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Children Subcategories */}
          {hasChildren && (
            <div className="ml-2">
              {subcategory.subcategories?.map((child) => (
                <SubcategoryItem
                  key={child.id}
                  subcategory={child}
                  categoryId={categoryId}
                  categories={categories}
                  level={level + 1}
                  onDelete={onDelete}
                  onCreate={onCreate}
                  onEdit={onEdit}
                  onTransfer={onTransfer}
                  onDeleteProduct={onDeleteProduct}
                  onUpdateProductSort={onUpdateProductSort}
                  onUpdateSubcategorySort={onUpdateSubcategorySort}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // New Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null);
  const [newCategoryMetaTitle, setNewCategoryMetaTitle] = useState("");
  const [newCategoryMetaDescription, setNewCategoryMetaDescription] =
    useState("");

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryFile, setEditCategoryFile] = useState<File | null>(null);
  const [editCategoryMetaTitle, setEditCategoryMetaTitle] = useState("");
  const [editCategoryMetaDescription, setEditCategoryMetaDescription] =
    useState("");

  // New Subcategory State (Top Level)
  const [newSubcategoryNames, setNewSubcategoryNames] = useState<{
    [key: number]: string;
  }>({});
  const [newSubcategoryCodes, setNewSubcategoryCodes] = useState<{
    [key: number]: string;
  }>({});
  const [newSubcategoryFiles, setNewSubcategoryFiles] = useState<{
    [key: number]: File | null;
  }>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      // Backend already sorts DESC
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryProductCount = (cat: Category) => {
    const ids = new Set<string>();
    cat.subcategories.forEach((sub) => collectProductIdsInSubtree(sub, ids));
    return ids.size;
  };

  const toggleExpand = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id],
    );
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await ApiService.createCategory(
        newCategoryName,
        newCategoryFile || undefined,
        undefined, // Auto sort order
        newCategoryMetaTitle,
        newCategoryMetaDescription,
      );
      setNewCategoryName("");
      setNewCategoryFile(null);
      setNewCategoryMetaTitle("");
      setNewCategoryMetaDescription("");
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Підтвердити?")) return;
    try {
      await ApiService.deleteCategory(id);
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message || "Не вдалося видалити категорію");
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
    setEditCategoryFile(null);
    setEditCategoryMetaTitle(category.meta_title || "");
    setEditCategoryMetaDescription(category.meta_description || "");
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    try {
      await ApiService.updateCategory(
        editingCategory,
        editCategoryName,
        editCategoryFile || undefined,
        undefined, // Preserve sort order
        editCategoryMetaTitle,
        editCategoryMetaDescription,
      );
      setEditingCategory(null);
      setEditCategoryFile(null);
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to update category");
    }
  };

  const handleUpdateCategorySort = async (
    category: Category,
    newSortOrder: number,
  ) => {
    try {
      await ApiService.updateCategory(
        category.id,
        category.name,
        undefined,
        newSortOrder,
        category.meta_title || undefined,
        category.meta_description || undefined,
      );
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to update category sort order");
    }
  };

  const handleCreateSubcategory = async (
    categoryId: number,
    name: string,
    code?: string,
    parentId?: number,
    file?: File,
    sortOrder?: number,
  ) => {
    if (!name?.trim()) return;

    try {
      await ApiService.createSubcategory(
        categoryId,
        name,
        code,
        parentId,
        file,
        sortOrder,
      );
      if (!parentId) {
        setNewSubcategoryNames((prev) => ({ ...prev, [categoryId]: "" }));
        setNewSubcategoryCodes((prev) => ({ ...prev, [categoryId]: "" }));
        setNewSubcategoryFiles((prev) => ({ ...prev, [categoryId]: null }));
      }
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to create subcategory");
    }
  };

  const triggerRootSubcategoryCreate = (category: Category) => {
    handleCreateSubcategory(
      category.id,
      newSubcategoryNames[category.id],
      newSubcategoryCodes[category.id],
      undefined,
      newSubcategoryFiles[category.id] || undefined,
      undefined, // Auto sort order
    );
  };

  const handleUpdateSubcategory = async (
    id: number,
    name: string,
    code: string,
    parentId?: number,
    file?: File,
    sortOrder?: number,
  ) => {
    try {
      await ApiService.updateSubcategory(
        id,
        name,
        code,
        parentId,
        file,
        sortOrder,
      );
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to update subcategory");
    }
  };

  const handleUpdateSubcategorySort = async (
    subcategory: Subcategory,
    newSortOrder: number,
  ) => {
    try {
      await ApiService.updateSubcategory(
        subcategory.id,
        subcategory.name,
        subcategory.code,
        subcategory.parent_id ?? undefined,
        undefined,
        newSortOrder,
      );
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Failed to update subcategory sort order");
    }
  };

  const handleDeleteSubcategory = async (id: number) => {
    if (!window.confirm("Підтвердити?")) return;
    try {
      await ApiService.deleteSubcategory(id);
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e.message || "Failed to delete subcategory");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await ApiService.deleteProduct(id);
      loadCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Не вдалося видалити товар");
    }
  };

  const handleUpdateProductSort = async (
    product: Product,
    newSortOrder: number,
  ) => {
    try {
      await ApiService.updateProduct(product.id, {
        ...product,
        sort_order: newSortOrder,
        // Ensure files is empty so we don't re-upload
        files: [],
        // Ensure kept_images includes existing images
        kept_images:
          product.images && product.images.length > 0
            ? product.images
            : [product.image],
      });
      loadCategories();
    } catch (error) {
      console.error(error);
      alert("Не вдалося змінити порядок");
    }
  };

  const handleTransferSubcategory = async (
    id: number,
    targetCategoryId: number,
    targetParentId: number | undefined,
    mode: "move" | "copy",
  ) => {
    try {
      if (mode === "move") {
        await ApiService.moveSubcategory(id, targetCategoryId, targetParentId);
      } else {
        await ApiService.copySubcategory(id, targetCategoryId, targetParentId);
      }
      loadCategories();
    } catch (error) {
      alert(
        mode === "move"
          ? "Failed to move subcategory"
          : "Failed to copy subcategory",
      );
      throw error;
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 font-medium tracking-tight">
        Завантаження...
      </div>
    );

  const sortedCategories = [...categories].sort(
    (a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 tracking-tight">
        Керування категоріями
      </h1>

      {/* Create Category Form */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-all">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
          <FolderPlus size={22} className="text-blue-600" />
          Додати нову категорію
        </h2>
        <form onSubmit={handleCreateCategory} className="space-y-6">
          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Назва категорії
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 font-medium"
                placeholder="Наприклад: Model 3"
                required
              />
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Обкладинка
              </label>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer bg-white hover:bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 border border-blue-100 w-full justify-center transition-all shadow-sm font-bold text-sm">
                  <ImageIcon size={18} />
                  <span>Завантажити фото</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewCategoryFile(e.target.files[0]);
                      } else {
                        setNewCategoryFile(null);
                      }
                    }}
                  />
                </label>
                {newCategoryFile && (
                  <span className="text-[10px] text-blue-600 font-bold truncate text-center px-2">
                    {newCategoryFile.name}
                  </span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold text-sm"
            >
              СТВОРИТИ
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={newCategoryMetaTitle}
                onChange={(e) => setNewCategoryMetaTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 text-sm"
                placeholder="Заголовок для вкладки браузера"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                SEO Description
              </label>
              <textarea
                value={newCategoryMetaDescription}
                onChange={(e) => setNewCategoryMetaDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50 text-sm resize-none"
                rows={2}
                placeholder="Короткий опис для Google"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {sortedCategories.map((category, idx) => (
          <div
            key={category.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between p-5 bg-gray-50/50 border-b border-gray-100 group">
              {editingCategory === category.id ? (
                <div className="flex flex-col gap-6 flex-1 pr-4">
                  <div className="flex flex-wrap gap-6 items-end">
                    <div className="flex-1 min-w-[180px]">
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="w-full border border-blue-200 rounded-xl px-3 py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                      {category.image && (
                        <img
                          src={category.image}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover bg-white border border-gray-200 shadow-xs"
                        />
                      )}
                      <label className="cursor-pointer bg-white hover:bg-blue-50 text-blue-600 px-3 py-2 rounded-xl inline-flex items-center gap-2 text-xs font-bold border border-blue-100 transition-all shadow-sm">
                        <ImageIcon size={16} />
                        <span>ЗМІНИТИ ФОТО</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEditCategoryFile(e.target.files[0]);
                            } else {
                              setEditCategoryFile(null);
                            }
                          }}
                        />
                      </label>
                      {editCategoryFile && (
                        <span className="text-[10px] text-blue-600 font-bold truncate max-w-[100px]">
                          {editCategoryFile.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUpdateCategory}
                        className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="bg-gray-200 text-gray-500 p-2 rounded-xl hover:bg-gray-300 transition-all shadow-sm"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={editCategoryMetaTitle}
                        onChange={(e) =>
                          setEditCategoryMetaTitle(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        SEO Description
                      </label>
                      <textarea
                        value={editCategoryMetaDescription}
                        onChange={(e) =>
                          setEditCategoryMetaDescription(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-sm resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => toggleExpand(category.id)}
                >
                  <div
                    className={`p-1 rounded-md transition-colors ${expandedCategories.includes(category.id) ? "bg-blue-100 text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`}
                  >
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  {category.image && (
                    <img
                      src={category.image}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover bg-white shadow-sm border border-gray-100"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </span>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                        {category.subcategories.length} ПІДКАТЕГОРІЙ
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded leading-none">
                        {getCategoryProductCount(category)} ТОВАРІВ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!editingCategory && (
                <div className="flex items-center gap-1 pr-2">
                  {/* Sorting Arrows for Category */}
                  <div className="flex flex-col items-center mr-3">
                    <button
                      onClick={() => {
                        if (idx > 0) {
                          const targetOrder =
                            (sortedCategories[idx - 1].sort_order ?? 0) + 1;
                          handleUpdateCategorySort(category, targetOrder);
                        }
                      }}
                      disabled={idx === 0}
                      className={`p-0.5 transition-colors ${idx === 0 ? "text-gray-100" : "text-gray-300 hover:text-blue-600"}`}
                      title="Вгору"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (idx < sortedCategories.length - 1) {
                          const targetOrder =
                            (sortedCategories[idx + 1].sort_order ?? 0) - 1;
                          handleUpdateCategorySort(category, targetOrder);
                        }
                      }}
                      disabled={idx === sortedCategories.length - 1}
                      className={`p-0.5 transition-colors ${idx === sortedCategories.length - 1 ? "text-gray-100" : "text-gray-300 hover:text-blue-600"}`}
                      title="Вниз"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <Link
                    to={`/products/new?category_id=${category.id}`}
                    className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl transition-all"
                    title="Додати товар"
                  >
                    <Package size={20} />
                  </Link>
                  <button
                    onClick={() => startEditCategory(category)}
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all"
                    title="Редагувати"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                    title="Видалити"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="p-6 bg-white animate-fade-in">
                {/* Category Products (Directly in Category, No Subcategory) */}
                {category.products && category.products.length > 0 && (
                  <div className="mb-8 bg-blue-50/20 border border-blue-100 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-blue-50/50 px-4 py-2.5 border-b border-blue-100 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                        ТОВАРИ БЕЗ ПІДКАТЕГОРІЇ
                      </span>
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="text-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-white/50 text-gray-400 text-[9px] font-black uppercase tracking-tighter">
                          <tr>
                            <th className="px-4 py-2 w-12 text-center">
                              СОРТ.
                            </th>
                            <th className="px-4 py-2">ТОВАР</th>
                            <th className="px-4 py-2 text-center">ЦІНА</th>
                            <th className="px-4 py-2 text-center">СТАТУС</th>
                            <th className="px-4 py-2 text-right">ДІЇ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                          {(() => {
                            const sortedCatProducts = [
                              ...category.products,
                            ].sort(
                              (a, b) =>
                                (b.sort_order ?? 0) - (a.sort_order ?? 0) ||
                                a.name.localeCompare(b.name),
                            );

                            return sortedCatProducts.map((product, idx) => (
                              <tr
                                key={product.id}
                                className="hover:bg-white transition-colors group/p"
                              >
                                <td className="px-4 py-2">
                                  <div className="flex flex-col items-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (idx > 0) {
                                          const targetOrder =
                                            (sortedCatProducts[idx - 1]
                                              .sort_order ?? 0) + 1;
                                          handleUpdateProductSort(
                                            product,
                                            targetOrder,
                                          );
                                        }
                                      }}
                                      disabled={idx === 0}
                                      className={`p-0.5 transition-colors ${idx === 0 ? "text-gray-100" : "text-gray-300 hover:text-blue-600"}`}
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          idx <
                                          sortedCatProducts.length - 1
                                        ) {
                                          const targetOrder =
                                            (sortedCatProducts[idx + 1]
                                              .sort_order ?? 0) - 1;
                                          handleUpdateProductSort(
                                            product,
                                            targetOrder,
                                          );
                                        }
                                      }}
                                      disabled={
                                        idx === sortedCatProducts.length - 1
                                      }
                                      className={`p-0.5 transition-colors ${idx === sortedCatProducts.length - 1 ? "text-gray-100" : "text-gray-300 hover:text-blue-600"}`}
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={product.image}
                                      alt=""
                                      className="w-9 h-9 rounded-lg object-cover border border-gray-100 shadow-sm"
                                    />
                                    <div>
                                      <div className="font-bold text-slate-800 group-hover/p:text-blue-600 transition-colors leading-none">
                                        {product.name}
                                      </div>
                                      <div className="text-[9px] font-black text-gray-400 uppercase mt-1 tracking-tighter">
                                        {product.detail_number}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <span className="font-black text-slate-900">
                                    {product.priceUSD} $
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {product.inStock ? (
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                      Є
                                    </span>
                                  ) : (
                                    <span className="text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                      Ні
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Link
                                      to={`/products/edit/${product.id}`}
                                      className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <Pencil size={14} />
                                    </Link>
                                    <button
                                      onClick={() => {
                                        if (confirm("Видалити цей товар?")) {
                                          handleDeleteProduct(product.id);
                                        }
                                      }}
                                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subcategories List */}
                <div className="space-y-2 mb-8 pr-2 border-l border-blue-50 ml-2">
                  {category.subcategories.map((sub) => (
                    <SubcategoryItem
                      key={sub.id}
                      subcategory={sub}
                      categoryId={category.id}
                      categories={categories}
                      onDelete={handleDeleteSubcategory}
                      onCreate={handleCreateSubcategory}
                      onEdit={handleUpdateSubcategory}
                      onTransfer={handleTransferSubcategory}
                      onDeleteProduct={handleDeleteProduct}
                      onUpdateProductSort={handleUpdateProductSort}
                      onUpdateSubcategorySort={handleUpdateSubcategorySort}
                    />
                  ))}
                  {category.subcategories.length === 0 && (
                    <p className="text-xs text-gray-400 font-medium italic pl-8 py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      Немає створених підкатегорій для цієї моделі
                    </p>
                  )}
                </div>

                {/* Add Top-Level Subcategory */}
                <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl -mx-6 px-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      Додати нову кореневу підкатегорію
                    </span>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex-grow flex gap-3 min-w-[300px]">
                      <input
                        type="text"
                        value={newSubcategoryNames[category.id] || ""}
                        onChange={(e) =>
                          setNewSubcategoryNames((prev) => ({
                            ...prev,
                            [category.id]: e.target.value,
                          }))
                        }
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none bg-white font-medium"
                        placeholder="Назва..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            triggerRootSubcategoryCreate(category);
                        }}
                      />
                      <input
                        type="text"
                        value={newSubcategoryCodes[category.id] || ""}
                        onChange={(e) =>
                          setNewSubcategoryCodes((prev) => ({
                            ...prev,
                            [category.id]: e.target.value,
                          }))
                        }
                        className="w-24 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none bg-white font-black"
                        placeholder="Код"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            triggerRootSubcategoryCreate(category);
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-white hover:bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm transition-all text-xs font-bold whitespace-nowrap">
                          <ImageIcon size={16} />
                          <span>ОБРАТИ ФОТО</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setNewSubcategoryFiles((prev) => ({
                                ...prev,
                                [category.id]: file,
                              }));
                            }}
                          />
                        </label>
                        {newSubcategoryFiles[category.id] && (
                          <span className="text-[10px] text-blue-600 font-bold max-w-[120px] truncate">
                            {newSubcategoryFiles[category.id]?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => triggerRootSubcategoryCreate(category)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-100 uppercase tracking-tight"
                    >
                      Створити
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Категорій ще немає. Створіть першу!
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
