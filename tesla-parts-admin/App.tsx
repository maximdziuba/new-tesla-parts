import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { ProductList } from "./components/ProductList";
import { ProductForm } from "./components/ProductForm";
import { OrderList } from "./components/OrderList";
import { Login } from "./components/Login";
import CategoryList from "./components/CategoryList";
import { SettingsPage } from "./pages/SettingsPage";
import { CMSPage } from "./pages/CMSPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { ResetPasswordPage } from "./pages/ResetPassword"; // Import ResetPasswordPage
import { useAuth } from "./AuthContext"; // Import useAuth
import { CustomerList } from "./components/CustomerList";
import { PromoCodeList } from "./components/PromoCodeList";
import { EmailCampaigns } from "./components/EmailCampaigns";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SettingsPlaceholder = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-bold mb-4">Налаштування</h2>
    <p className="text-gray-500">
      Налаштування магазину, валюти та облікового запису адміністратора.
    </p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/edit/:id" element={<ProductForm />} />
                  <Route path="/orders" element={<OrderList />} />
                  <Route path="/customers" element={<CustomerList />} />
                  <Route path="/promocodes" element={<PromoCodeList />} />
                  <Route path="/email-campaigns" element={<EmailCampaigns />} />
                  <Route path="/categories" element={<CategoryList />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route
                    path="/settings/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/cms" element={<CMSPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
