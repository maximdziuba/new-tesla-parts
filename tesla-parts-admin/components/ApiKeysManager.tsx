import React, { useState, useEffect } from "react";
import { ApiService } from "../services/api";

export const ApiKeysManager: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDiscount, setNewKeyDiscount] = useState<number>(0);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      const data = await ApiService.getApiKeys();
      setKeys(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiService.createApiKey({
        name: newKeyName,
        discount_percent: newKeyDiscount,
      });
      setCreatedKey(res.raw_key);
      setNewKeyName("");
      setNewKeyDiscount(0);
      fetchKeys();
    } catch {
      alert("Failed to create key");
    }
  };

  const handleRevoke = async (id: number) => {
    if (
      !window.confirm("Відкликати цей ключ? Він перестане працювати негайно.")
    )
      return;
    try {
      await ApiService.revokeApiKey(id);
      fetchKeys();
    } catch {
      alert("Failed to revoke key");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Видалити цей ключ остаточно?")) return;
    try {
      await ApiService.deleteApiKey(id);
      fetchKeys();
    } catch {
      alert("Failed to delete key");
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-xl font-bold mb-4">API Ключі (Partner API)</h2>
      <p className="text-gray-500 mb-6">
        Керування ключами доступу для сторонніх сервісів (СТО). Ліміт запитів:
        100 на годину для кожного ключа.
      </p>

      {createdKey && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700 font-semibold">
            Новий ключ створено успішно!
          </p>
          <p className="text-sm text-green-600 mb-2">
            Скопіюйте його зараз, ви більше не зможете його побачити:
          </p>
          <code className="bg-white px-2 py-1 rounded border border-green-200 text-lg font-mono text-gray-800 break-all">
            {createdKey}
          </code>
          <button
            onClick={() => setCreatedKey(null)}
            className="ml-4 text-sm text-green-700 underline"
          >
            Сховати
          </button>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="flex gap-4 items-end mb-8 bg-gray-50 p-4 rounded-lg"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Назва СТО (Опис)
          </label>
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            placeholder="Напр. СТО Магніт"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Знижка (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={newKeyDiscount}
            onChange={(e) => setNewKeyDiscount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Згенерувати ключ
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Назва
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Префікс Ключа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Знижка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Виклики (за міс.)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((k) => (
              <tr key={k.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {k.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {k.key_prefix}.***
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {k.discount_percent}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {k.requests_this_month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {k.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Активний
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Відкликаний
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {k.is_active && (
                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="text-orange-600 hover:text-orange-900 mr-4"
                    >
                      Відкликати
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Немає згенерованих ключів
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
