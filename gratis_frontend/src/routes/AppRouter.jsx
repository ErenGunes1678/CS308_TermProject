import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/public/HomePage';

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                {/* Add more routes here as you build pages */}
            </Route>
        </Routes>
    );
}
