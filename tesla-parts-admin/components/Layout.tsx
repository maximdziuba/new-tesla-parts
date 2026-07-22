import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Menu,
  LogOut,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Car,
  Layers,
  FileText,
  MessageSquare,
  Key,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronLeft,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
  Users,
  Ticket,
  Mail,
} from "lucide-react";
import { useAuth } from "../AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  to: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  active: boolean;
  collapsed: boolean;
}) => (
  <Link
    to={to}
    title={collapsed ? label : undefined}
    className={`flex items-center rounded-lg transition-all duration-200 ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"} ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-700 hover:bg-gray-50 hover:text-blue-600"
    }`}
  >
    <Icon size={20} className="shrink-0" />
    {!collapsed && (
      <span className="font-semibold whitespace-nowrap overflow-hidden transition-all duration-200">
        {label}
      </span>
    )}
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/":
        return "Дашборд";
      case "/products":
        return "Товари";
      case "/orders":
        return "Замовлення";
      case "/customers":
        return "Клієнти";
      case "/categories":
        return "Категорії";
      case "/settings":
        return "Налаштування";
      case "/cms":
        return "Контент";
      case "/feedback":
        return "Відгуки";
      case "/promocodes":
        return "Промокоди";
      case "/email-campaigns":
        return "Маркетингові розсилки";
      default:
        return "Адмін Панель";
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"} w-64 flex flex-col transition-colors shadow-2xl lg:shadow-none`}
      >
        <div
          className={`flex items-center border-b border-gray-100 transition-all duration-300 ${collapsed ? "justify-center p-4" : "gap-3 p-6"}`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0 shadow-sm">
            <span className="font-bold text-white text-lg">T</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight overflow-hidden transition-all duration-300">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                TeslaFix
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Admin
              </span>
            </div>
          )}
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
            Меню керування
          </div>
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Огляд"
            active={location.pathname === "/"}
            collapsed={collapsed}
          />
          <SidebarItem
            to="/orders"
            icon={ShoppingCart}
            label="Замовлення"
            active={location.pathname === "/orders"}
            collapsed={collapsed}
          />
          <SidebarItem
            to="/customers"
            icon={Users}
            label="Клієнти"
            active={
              location.pathname === "/customers" ||
              location.pathname.startsWith("/customers/")
            }
            collapsed={collapsed}
          />
          <SidebarItem
            to="/categories"
            icon={Layers}
            label="Категорії"
            active={location.pathname === "/categories"}
            collapsed={collapsed}
          />
          <SidebarItem
            to="/products"
            icon={Package}
            label="Товари"
            active={
              location.pathname === "/products" ||
              location.pathname.startsWith("/products/")
            }
            collapsed={collapsed}
          />

          <div className="pt-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
              Маркетинг
            </div>
            <SidebarItem
              to="/promocodes"
              icon={Ticket}
              label="Промокоди"
              active={location.pathname === "/promocodes"}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/email-campaigns"
              icon={Mail}
              label="Розсилки"
              active={location.pathname === "/email-campaigns"}
              collapsed={collapsed}
            />
          </div>

          <div className="pt-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
              Сайт та контент
            </div>
            <SidebarItem
              to="/cms"
              icon={FileText}
              label="Сторінки"
              active={location.pathname === "/cms"}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/feedback"
              icon={MessageSquare}
              label="Відгуки"
              active={location.pathname === "/feedback"}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/settings"
              icon={Settings}
              label="Налаштування"
              active={location.pathname === "/settings"}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/settings/reset-password"
              icon={Key}
              label="Безпека"
              active={location.pathname === "/settings/reset-password"}
              collapsed={collapsed}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title={collapsed ? "Вийти" : undefined}
            className={`flex items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && (
              <span className="font-semibold whitespace-nowrap overflow-hidden">
                Вийти
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-gray-50 text-slate-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
              <button
                className="hidden lg:flex p-2 rounded-md hover:bg-gray-50 text-gray-400 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-sm font-bold text-slate-900">
                  Адміністратор
                </span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter text-right">
                  Повний доступ
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100 shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#f8fafc] custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
