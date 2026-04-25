import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ScrollToTop from '../components/layout/ScrollToTop';
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import ProductsPage from '../pages/Products/ProductsPage';
import CartPage from '../pages/Cart/CartPage';
import ProductDetailsPage from '../pages/ProductDetails/ProductDetailsPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import OrderSuccessPage from '../pages/Checkout/OrderSuccessPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import SearchPage from '../pages/Search/SearchPage';

// Placeholder pages - replace with real ones later
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p style={{ color: '#6B7280', marginTop: '1rem' }}>This page is coming soon.</p>
  </div>
);

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
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:slug" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<PlaceholderPage title="Admin Panel" />} />
          <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
