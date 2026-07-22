import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import { Pencil, Check, X, FileText } from "lucide-react";

interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  location: string;
}

export const PagesManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getPages();
      setPages(data);
    } catch (e) {
      console.error("Failed to load pages", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPage) return;
    try {
      await ApiService.updatePage(editingPage.id, {
        slug: editingPage.slug,
        title: editingPage.title,
        content: editingPage.content,
        is_published: editingPage.is_published,
        location: editingPage.location,
      });
      setEditingPage(null);
      loadPages();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Не вдалося оновити сторінку");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
          Керування сторінками
        </h2>
      </div>

      <div className="space-y-6">
        {pages.map((page) => (
          <div
            key={page.id}
            className="border border-gray-100 rounded-2xl p-6 bg-gray-50/30 hover:bg-gray-50 transition-all group"
          >
            {editingPage?.id === page.id ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      Заголовок сторінки
                    </label>
                    <input
                      type="text"
                      value={editingPage.title}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          title: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm font-bold transition-all bg-white"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group/check">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={editingPage.is_published}
                          onChange={(e) =>
                            setEditingPage({
                              ...editingPage,
                              is_published: e.target.checked,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-6 rounded-full transition-colors ${editingPage.is_published ? "bg-emerald-400" : "bg-gray-300"}`}
                        ></div>
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editingPage.is_published ? "translate-x-4" : ""}`}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                        Опубліковано на сайті
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Контент (Text/HTML)
                  </label>
                  <textarea
                    value={editingPage.content}
                    onChange={(e) =>
                      setEditingPage({
                        ...editingPage,
                        content: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 h-64 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm leading-relaxed transition-all bg-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Check size={18} />
                    <span>ЗБЕРЕГТИ</span>
                  </button>
                  <button
                    onClick={() => setEditingPage(null)}
                    className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <X size={18} />
                    <span>СКАСУВАТИ</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        /{page.slug}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${page.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {page.is_published ? "Active" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPage(page)}
                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl transition-all"
                    title="Редагувати вміст"
                  >
                    <Pencil size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {pages.length === 0 && !isCreating && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium tracking-tight">
              Сторінок поки не створено
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
