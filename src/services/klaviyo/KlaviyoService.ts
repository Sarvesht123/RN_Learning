import { Klaviyo } from 'klaviyo-react-native-sdk';

import { env } from '@/config/env';

export type CommerceEventProperties = Record<string, string | number | boolean | string[]>;

class KlaviyoService {
  initialize() {
    if (env.klaviyoPublicApiKey) Klaviyo.initialize(env.klaviyoPublicApiKey);
  }

  track(name: 'Viewed Product' | 'Added to Cart' | 'Started Checkout' | 'Placed Order' | 'Active on Site', properties: CommerceEventProperties = {}, value?: number) {
    Klaviyo.createEvent({ name, properties, ...(value === undefined ? {} : { value }) });
  }
}

export const klaviyoService = new KlaviyoService();
