import React, { useEffect, useState } from "react";
import { ApiService } from "../services/api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, Loader } from "lucide-react";

interface SeoRecord {
  id: number;
  slug: string;
  meta_title: string;
  meta_description: string;
}

const AdminSeoSettings: React.FC = () => {
  const [seoRecords, setSeoRecords] = useState<SeoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSeoData = async () => {
      try {
        const data = await ApiService.getStaticSeo();
        setSeoRecords(data);
      } catch (error) {
        console.error("Failed to fetch SEO data", error);
        alert("Failed to load SEO settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSeoData();
  }, []);

  const handleUpdate = (
    slug: string,
    field: "meta_title" | "meta_description",
    value: string,
  ) => {
    setSeoRecords((prev) =>
      prev.map((record) =>
        record.slug === slug ? { ...record, [field]: value } : record,
      ),
    );
  };

  const handleSave = async (slug: string) => {
    const record = seoRecords.find((r) => r.slug === slug);
    if (!record) return;

    setSaving((prev) => ({ ...prev, [slug]: true }));
    try {
      await ApiService.updateStaticSeo(slug, {
        meta_title: record.meta_title,
        meta_description: record.meta_description,
      });
      // Optional: show a success message
    } catch (error) {
      console.error(`Failed to save SEO for ${slug}`, error);
      alert(`Failed to save settings for ${slug}.`);
    } finally {
      setTimeout(() => {
        setSaving((prev) => ({ ...prev, [slug]: false }));
      }, 1000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading SEO Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">
          SEO статичних сторінок
        </h1>
      </div>
      <div className="space-y-8">
        {seoRecords.map((record) => (
          <div
            key={record.slug}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-600">
                Сторінка: {record.slug.replace(/_/g, " ")}
              </h2>
              <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                URL: /{record.slug}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={record.meta_title}
                  onChange={(e) =>
                    handleUpdate(record.slug, "meta_title", e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                  placeholder="Заголовок для вкладки..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={record.meta_description}
                  onChange={(e) =>
                    handleUpdate(
                      record.slug,
                      "meta_description",
                      e.target.value,
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all resize-none"
                  rows={3}
                  placeholder="Короткий опис для Google..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => handleSave(record.slug)}
                disabled={saving[record.slug]}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-bold text-sm disabled:opacity-50 min-w-[140px]"
              >
                {saving[record.slug] ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    <span>ЗБЕРЕЖЕННЯ</span>
                  </div>
                ) : (
                  "ЗБЕРЕГТИ"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSeoSettings;
