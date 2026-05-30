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
import OrderManagementPage from '../pages/Admin/OrderManagementPage';
import CommentModerationPage from '../pages/Admin/CommentModerationPage';
import ProductInventoryPage from '../pages/Admin/ProductInventoryPage';
import RefundRequestsPage from '../pages/Admin/RefundRequestsPage';
import PricingManagementPage from '../pages/Admin/PricingManagementPage';
import SearchPage from '../pages/Search/SearchPage';
import UnauthorizedPage from '../pages/Unauthorized/UnauthorizedPage';
import WishlistPage from '../pages/Wishlist/WishlistPage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';

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
    return <Navigate to="/admin/product-manager/deliveries" replace />;
  }

  if (user.role === 'sales_manager') {
    return <Navigate to="/admin/sales-manager/invoices" replace />;
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

const AccountRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'product_manager') {
    return <Navigate to="/admin/product-manager/deliveries" replace />;
  }

  if (user.role === 'sales_manager') {
    return <Navigate to="/admin/sales-manager/invoices" replace />;
  }

  return <ProfilePage />;
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
          <Route path="/account" element={<AccountRedirect />} />
          <Route path="/customer" element={<RoleRoute allowedRoles={['customer']}><ProfilePage /></RoleRoute>} />
          <Route path="/customer/orders" element={<RoleRoute allowedRoles={['customer']}><OrdersPage /></RoleRoute>} />
          <Route path="/customer/notifications" element={<RoleRoute allowedRoles={['customer']}><NotificationsPage /></RoleRoute>} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:slug" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<AccountRedirect />} />
          <Route path="/orders" element={<RoleRoute allowedRoles={['customer']}><OrdersPage /></RoleRoute>} />
          <Route path="/checkout" element={<RoleRoute allowedRoles={['customer']}><CheckoutPage /></RoleRoute>} />
          <Route path="/order-success" element={<RoleRoute allowedRoles={['customer']}><OrderSuccessPage /></RoleRoute>} />
          <Route path="/wishlist" element={<RoleRoute allowedRoles={['customer']}><WishlistPage /></RoleRoute>} />
          <Route path="/notifications" element={<Navigate to="/customer/notifications" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/product-manager" element={<Navigate to="/admin/product-manager/deliveries" replace />} />
          <Route path="/admin/product-manager/deliveries" element={<RoleRoute allowedRoles={['product_manager']}><OrderManagementPage /></RoleRoute>} />
          <Route path="/admin/product-manager/comments" element={<RoleRoute allowedRoles={['product_manager']}><CommentModerationPage /></RoleRoute>} />
          <Route path="/admin/product-manager/inventory" element={<RoleRoute allowedRoles={['product_manager']}><ProductInventoryPage /></RoleRoute>} />
          <Route path="/admin/sales-manager" element={<Navigate to="/admin/sales-manager/invoices" replace />} />
          <Route path="/admin/sales-manager/invoices" element={<RoleRoute allowedRoles={['sales_manager']}><PlaceholderPage title="Invoices" /></RoleRoute>} />
          <Route path="/admin/sales-manager/revenue" element={<RoleRoute allowedRoles={['sales_manager']}><PlaceholderPage title="Revenue" /></RoleRoute>} />
          <Route path="/admin/sales-manager/pricing" element={<RoleRoute allowedRoles={['sales_manager']}><PricingManagementPage /></RoleRoute>} />
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
