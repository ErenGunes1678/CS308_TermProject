import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRouter />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
