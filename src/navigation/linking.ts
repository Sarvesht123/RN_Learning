import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['ane://', 'https://app.example.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Tabs: {
            screens: {
              Home: '',
              Categories: 'categories',
              Cart: 'cart',
              Account: 'account',
              Info: 'info',
            },
          },
          Product: 'product/:sku',
          Category: 'category/:id',
          Search: 'search',
          Checkout: 'checkout',
          Orders: 'orders',
          OrderDetails: 'orders/:orderNumber',
          OrderSuccess: 'order-success',
          Wishlist: 'wishlist',
          SeoRoute: '*seoPath',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
};
