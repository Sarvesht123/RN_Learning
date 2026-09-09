import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CategoryScreen from '@/screens/Category/CategoryScreen';
import CheckoutScreen from '@/screens/Checkout/CheckoutScreen';
import { OrderDetailsScreen } from '@/screens/Orders/OrderDetailsScreen';
import OrdersScreen from '@/screens/Orders/OrdersScreen';
import OrderSuccessScreen from '@/screens/OrderSuccess/OrderSuccessScreen';
import ProductScreen from '@/screens/Product/ProductScreen';
import SearchScreen from '@/screens/Search/SearchScreen';
import SeoRouteScreen from '@/screens/SeoRoute/SeoRouteScreen';
import WishlistScreen from '@/screens/Wishlist/WishlistScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="SeoRoute" component={SeoRouteScreen} />
    </Stack.Navigator>
  );
}
