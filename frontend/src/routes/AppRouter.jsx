import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/Home/HomePage';
import ProductsPage from '../pages/Products/ProductsPage';

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
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/category/:slug" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<PlaceholderPage title="Product Details" />} />
                    <Route path="/cart" element={<PlaceholderPage title="Shopping Cart" />} />
                    <Route path="/login" element={<PlaceholderPage title="Login" />} />
                    <Route path="/register" element={<PlaceholderPage title="Register" />} />
                    <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
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