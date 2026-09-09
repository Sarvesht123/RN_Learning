import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

import type { MainStackParamList, RootStackParamList } from './types';

type LegacyDestination =
  | string
  | { pathname: string; params?: Record<string, string> };

function destination(value: LegacyDestination) {
  const pathname = typeof value === 'string' ? value : value.pathname;
  const params = typeof value === 'string' ? {} : (value.params ?? {});
  if (pathname === '/' || pathname === '/categories' || pathname === '/cart' || pathname === '/account' || pathname === '/info') {
    const screen = pathname === '/' ? 'Home' : pathname.slice(1).replace(/^./, letter => letter.toUpperCase());
    return { root: 'Main' as const, params: { screen: 'Tabs', params: { screen } } };
  }
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    const screen = pathname === '/forgot-password' ? 'ForgotPassword' : pathname.slice(1).replace(/^./, letter => letter.toUpperCase());
    return { root: 'Auth' as const, params: { screen } };
  }
  const direct: Record<string, keyof MainStackParamList> = {
    '/search': 'Search', '/checkout': 'Checkout', '/orders': 'Orders', '/order-success': 'OrderSuccess', '/wishlist': 'Wishlist',
  };
  if (direct[pathname]) return { root: 'Main' as const, params: { screen: direct[pathname], params } };
  if (pathname === '/product/[sku]') return { root: 'Main' as const, params: { screen: 'Product', params } };
  if (pathname === '/category/[id]') return { root: 'Main' as const, params: { screen: 'Category', params } };
  return { root: 'Main' as const, params: { screen: 'SeoRoute', params: { seoPath: pathname.replace(/^\//, '') } } };
}

export function useRouter() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const go = (value: LegacyDestination) => navigation.navigate(destination(value) as never);
  return { push: go, navigate: go, replace: go, back: () => navigation.goBack() };
}

export function useLocalSearchParams<T extends object>() {
  return (useRoute<RouteProp<MainStackParamList>>().params ?? {}) as T;
}

export function usePathname() {
  return useRoute().name;
}
