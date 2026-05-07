//update
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import DeliveredReviewPrompt from './DeliveredReviewPrompt';

const MainLayout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <DeliveredReviewPrompt />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
