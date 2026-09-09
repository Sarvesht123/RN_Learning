import Config from 'react-native-config';

function required(name: string, value?: string) {
  if (!value) throw new Error(`${name} is not configured. Copy .env.example to .env.`);
  return value;
}

export const env = {
  get magentoGraphqlUrl() { return required('MAGENTO_GRAPHQL_URL', Config.MAGENTO_GRAPHQL_URL); },
  magentoStoreCode: Config.MAGENTO_STORE_CODE || 'default',
  useMocks: Config.USE_MOCKS === 'true',
  allowFixtureFallback: Config.ALLOW_FIXTURE_FALLBACK === 'true',
  sourceCode: Config.MAGENTO_SOURCE_CODE || '',
  oneSignalAppId: Config.ONESIGNAL_APP_ID || '',
  klaviyoPublicApiKey: Config.KLAVIYO_PUBLIC_API_KEY || '',
} as const;
