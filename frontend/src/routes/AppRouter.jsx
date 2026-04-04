//update
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../Pages/Home/HomePage';
import LoginPage from '../Pages/Login/LoginPage';
import ProfilePage from '../Pages/Profile/ProfilePage';

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
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Navigate to="/login?mode=register" replace />} />
                <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                    <Route path="/account" element={<ProfilePage />} />
                    <Route path="/products" element={<PlaceholderPage title="All Products" />} />
                    <Route path="/category/:slug" element={<PlaceholderPage title="Category" />} />
                    <Route path="/product/:id" element={<PlaceholderPage title="Product Details" />} />
                    <Route path="/cart" element={<PlaceholderPage title="Shopping Cart" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
                    <Route path="/checkout" element={<PlaceholderPage title="Checkout" />} />
                    <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" />} />
                    <Route path="/search" element={<PlaceholderPage title="Search" />} />
                    <Route path="/admin" element={<PlaceholderPage title="Admin Panel" />} />
                    <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
