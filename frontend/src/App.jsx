import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import './styles/site-scale.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <AppRouter />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
