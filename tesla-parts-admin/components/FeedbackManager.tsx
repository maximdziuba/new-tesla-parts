import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";
import {
  Trash2,
  Upload,
  Plus,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  X,
  Loader,
} from "lucide-react";

interface Feedback {
  id: number;
  image_url: string;
  created_at: string;
  sort_order: number;
}

export const FeedbackManager: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFeedback();
      setFeedback(data);
    } catch (e) {
      console.error("Failed to load feedback", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      // Default sort order will be 0, but we could find the max and add 1
      const maxSort =
        feedback.length > 0
          ? Math.max(...feedback.map((f) => f.sort_order))
          : 0;
      await ApiService.createFeedback(selectedFile, maxSort + 1);
      setSelectedFile(null);
      loadFeedback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Не вдалося завантажити відгук");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Видалити цей відгук?")) return;
    try {
      await ApiService.deleteFeedback(id);
      loadFeedback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Не вдалося видалити відгук");
    }
  };

  const handleUpdateSort = async (id: number, newSortOrder: number) => {
    try {
      await ApiService.updateFeedbackSort(id, newSortOrder);
      loadFeedback();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      alert("Не вдалося змінити порядок");
    }
  };

  if (loading && feedback.length === 0) {
    return <div className="text-center py-8">Завантаження...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">
            Керування відгуками
          </h2>
        </div>
      </div>

      <div className="mb-8 p-6 bg-blue-50/30 rounded-2xl border border-blue-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-blue-600" />
          Завантажити новий скріншот відгуку
        </h3>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="cursor-pointer bg-white hover:bg-gray-50 text-slate-600 px-4 py-3 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm transition-all font-bold text-sm">
            <ImageIcon size={20} className="text-blue-500" />
            <span>{selectedFile ? selectedFile.name : "Обрати файл"}</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {uploading ? "ЗАВАНТАЖЕННЯ..." : "ДОДАТИ ВІДГУК"}
            </button>
          )}
          {selectedFile && (
            <button
              onClick={() => setSelectedFile(null)}
              className="p-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {feedback.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-white">
              <img
                src={item.image_url}
                alt={`Відгук ${item.id}`}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="p-4 flex items-center justify-between bg-white border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => {
                      if (index > 0) {
                        handleUpdateSort(
                          item.id,
                          feedback[index - 1].sort_order + 1,
                        );
                      }
                    }}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === 0 ? "text-gray-200" : "text-gray-400 hover:text-blue-600"}`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (index < feedback.length - 1) {
                        handleUpdateSort(
                          item.id,
                          feedback[index + 1].sort_order - 1,
                        );
                      }
                    }}
                    disabled={index === feedback.length - 1}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${index === feedback.length - 1 ? "text-gray-200" : "text-gray-400 hover:text-blue-600"}`}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Видалити"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {feedback.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium tracking-tight">
            Відгуків поки не додано
          </p>
        </div>
      )}
    </div>
  );
};
