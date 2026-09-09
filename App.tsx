import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { CartProvider } from '@/context/CartContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { klaviyoService } from '@/services/klaviyo/KlaviyoService';
import { oneSignalService } from '@/services/notifications/OneSignalService';

export default function App() {
  useEffect(() => {
    oneSignalService.initialize();
    klaviyoService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <CustomerProvider>
          <WishlistProvider>
            <CartProvider>
              <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
              <RootNavigator />
            </CartProvider>
          </WishlistProvider>
        </CustomerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
