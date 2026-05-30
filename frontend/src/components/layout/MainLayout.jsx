//update
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import DeliveredReviewPrompt from './DeliveredReviewPrompt';
import ToastNotifications from './ToastNotifications';

const MainLayout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <DeliveredReviewPrompt />
            <main>
                <Outlet />
            </main>
            <Footer />
            <ToastNotifications />
        </div>
    );
};

export default MainLayout;
