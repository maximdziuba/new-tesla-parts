import React, { useState } from "react";
import { ApiService } from "../services/api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Import Eye icons

export const ResetPasswordPage: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Новий пароль та підтвердження пароля не співпадають.");
      return;
    }
    if (newPassword.length < 6) {
      // Example: minimum password length
      setError("Новий пароль повинен бути щонайменше 6 символів.");
      return;
    }

    try {
      await ApiService.resetPassword(oldPassword, newPassword);
      setMessage(
        "Пароль успішно змінено! Будь ласка, увійдіть з новим паролем.",
      );
      setTimeout(() => {
        logout(); // Log out after successful password reset
        navigate("/login");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err.message || "Помилка при зміні пароля.");
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 leading-none">
          Зміна пароля
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 transition-all">
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Поточний пароль
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Новий пароль
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Підтвердження пароля
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50 text-sm font-medium transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div className="bg-emerald-50 text-emerald-600 text-xs p-4 rounded-xl border border-emerald-100 font-bold text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-4 rounded-xl border border-red-100 font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase tracking-widest mt-4 transform active:scale-[0.99]"
          >
            ОНОВИТИ ПАРОЛЬ
          </button>
        </form>
      </div>
    </div>
  );
};
