import AppRouter from './routes/AppRouter';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <AppRouter />
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
