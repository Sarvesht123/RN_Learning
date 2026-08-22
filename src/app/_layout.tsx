import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from '@/context/CartContext';
import { colors } from '@/constants/colors';
import { CustomerProvider } from '@/context/CustomerContext';
import { WishlistProvider } from '@/context/WishlistContext';
export default function RootLayout() {
  return (
    <CustomerProvider>
      <WishlistProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
        </CartProvider>
      </WishlistProvider>
    </CustomerProvider>
  );
}
