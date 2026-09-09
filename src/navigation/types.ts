import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Account: undefined;
  Info: undefined;
};

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  Category: { id: string; title?: string };
  Product: { sku: string };
  Search: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetails: { orderNumber: string };
  OrderSuccess: { number: string; total: string; delivery: string };
  Wishlist: undefined;
  SeoRoute: { seoPath: string | string[] };
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList> | undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
