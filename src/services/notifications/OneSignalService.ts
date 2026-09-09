import { OneSignal } from 'react-native-onesignal';

import { env } from '@/config/env';

class OneSignalService {
  initialize() {
    if (env.oneSignalAppId) OneSignal.initialize(env.oneSignalAppId);
  }

  requestPermission() {
    return OneSignal.Notifications.requestPermission(true);
  }

  identifyCustomer(customerId: string) {
    OneSignal.login(customerId);
  }

  logout() {
    OneSignal.logout();
  }
}

export const oneSignalService = new OneSignalService();
