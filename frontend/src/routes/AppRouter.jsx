import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ScrollToTop from '../components/layout/ScrollToTop';
import { useAuth } from '../hooks/useAuth';
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import ProductsPage from '../pages/Products/ProductsPage';
import CartPage from '../pages/Cart/CartPage';
import ProductDetailsPage from '../pages/ProductDetails/ProductDetailsPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import OrderSuccessPage from '../pages/Checkout/OrderSuccessPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import ProductManagerDashboard from '../pages/Admin/ProductManager/ProductManagerDashboard';
import DeliveryListPage from '../pages/Admin/ProductManager/DeliveryListPage';
import CommentModerationPage from '../pages/Admin/ProductManager/CommentModerationPage';
import ProductInventoryPage from '../pages/Admin/ProductManager/ProductInventoryPage';
import SalesManagerDashboard from '../pages/Admin/Salesmanager/SalesManagerDashboard';
import InvoicesPage from '../pages/Admin/Salesmanager/InvoicesPage';
import RevenuePage from '../pages/Admin/Salesmanager/RevenuePage';
import PricingDiscountPage from '../pages/Admin/Salesmanager/PricingDiscountPage';
import RefundRequestsPage from '../pages/Admin/Salesmanager/RefundRequestsPage';
import SearchPage from '../pages/Search/SearchPage';
import UnauthorizedPage from '../pages/Unauthorized/UnauthorizedPage';
import WishlistPage from '../pages/Wishlist/WishlistPage';

// Placeholder pages - replace with real ones later
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p style={{ color: '#6B7280', marginTop: '1rem' }}>This page is coming soon.</p>
  </div>
);

const AdminRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'product_manager') {
    return <Navigate to="/admin/product-manager" replace />;
  }

  if (user.role === 'sales_manager') {
    return <Navigate to="/admin/sales-manager" replace />;
  }

  return <Navigate to="/customer" replace />;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={<Navigate to="/login?mode=register" replace />}
        />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/customer" element={<ProfilePage />} />
          <Route path="/customer/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:slug" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/product-manager" element={<RoleRoute allowedRoles={['product_manager']}><ProductManagerDashboard /></RoleRoute>} />
          <Route path="/admin/product-manager/deliveries" element={<RoleRoute allowedRoles={['product_manager']}><DeliveryListPage /></RoleRoute>} />
          <Route path="/admin/product-manager/comments" element={<RoleRoute allowedRoles={['product_manager']}><CommentModerationPage /></RoleRoute>} />
          <Route path="/admin/product-manager/inventory" element={<RoleRoute allowedRoles={['product_manager']}><ProductInventoryPage /></RoleRoute>} />
          <Route path="/admin/sales-manager" element={<RoleRoute allowedRoles={['sales_manager']}><SalesManagerDashboard /></RoleRoute>} />
          <Route path="/admin/sales-manager/invoices" element={<RoleRoute allowedRoles={['sales_manager']}><InvoicesPage /></RoleRoute>} />
          <Route path="/admin/sales-manager/revenue" element={<RoleRoute allowedRoles={['sales_manager']}><RevenuePage /></RoleRoute>} />
          <Route path="/admin/sales-manager/pricing" element={<RoleRoute allowedRoles={['sales_manager']}><PricingDiscountPage /></RoleRoute>} />
          <Route path="/admin/sales-manager/refunds" element={<RoleRoute allowedRoles={['sales_manager']}><RefundRequestsPage /></RoleRoute>} />
          <Route path="/admin/orders" element={<Navigate to="/admin/product-manager/deliveries" replace />} />
          <Route path="/admin/comments" element={<Navigate to="/admin/product-manager/comments" replace />} />
          <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
