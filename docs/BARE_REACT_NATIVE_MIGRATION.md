# Bare React Native Migration

## Summary

The mobile application was migrated from Expo managed workflow and Expo Router to the React Native Community CLI 0.86.2 template. Existing commerce screens, components, contexts, hooks, fixtures, assets, backend module, and Magento business logic were retained.

Expo SDK 57 maps to React Native 0.86 and React 19.2.3. The Community CLI template requires Node 22.11 or newer; Node 22 LTS should be used locally and in CI.

## Architecture change

Previous entry and routing:

- `expo-router/entry`
- file routes under `src/app`
- Expo `Stack`, `useRouter`, `useLocalSearchParams`, and manual bottom tabs

New entry and routing:

- `index.js` registers `App.tsx`
- React Navigation root, native-stack, auth, main-stack, and bottom-tab navigators under `src/navigation`
- screen implementations under `src/screens/<Feature>`
- typed params in `src/navigation/types.ts`
- deep-link mapping in `src/navigation/linking.ts`

Route mapping:

| Previous route | React Navigation route |
| --- | --- |
| `/` | `Tabs > Home` |
| `/categories` | `Tabs > Categories` |
| `/category/[id]` | `Category { id, title? }` |
| `/product/[sku]` | `Product { sku }` |
| `/search` | `Search` |
| `/cart` | `Tabs > Cart` |
| `/checkout` | `Checkout` |
| `/login` | `Auth > Login` |
| `/register` | `Auth > Register` |
| `/forgot-password` | `Auth > ForgotPassword` |
| `/account` | `Tabs > Account` |
| `/orders` | `Orders` |
| `/orders/:orderNumber` | `OrderDetails` |
| `/order-success` | `OrderSuccess` |
| `/wishlist` | `Wishlist` |
| `/info` | `Tabs > Info` |
| Magento `*.html` | `SeoRoute` resolver |

## Magento and environment configuration

The existing `src/services/commerce.ts` operations and the in-progress user checkout changes were preserved. Generic authenticated transport now lives in `src/api/client/graphqlClient.ts`; compatibility exports are provided under `src/api/magento` and `src/services/magento`.

Copy `.env.example` to `.env` and set `MAGENTO_GRAPHQL_URL`. No Magento URL or credential is embedded in the application. `react-native-config` supplies native build environment values.

Existing operations retained include products, categories, product details, search, CMS/SEO routes, login, registration, customer token use, customer cart reconciliation, item add/update/remove during checkout, delivery source/slot selection, addresses, shipping methods, payment methods, coupons, and order placement. Password-reset email support was added.

Known Magento application work:

- Replace the sample orders UI with the authenticated customer-orders query and render complete order details.
- Persist customer tokens securely and restore sessions; current state remains memory-only as before.
- Expand remote-cart synchronization outside the existing checkout reconciliation path.
- Replace fixed checkout address/phone demonstration values with customer-selected data.

## Dependencies

Added:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-config`
- `react-native-onesignal`
- `klaviyo-react-native-sdk`
- `react-native-geolocation-service`
- React Native Community CLI build/test/Metro packages

Retained native support packages: `react-native-gesture-handler`, `react-native-safe-area-context`, and `react-native-screens`.

Removed: Expo runtime, Expo Router, Expo UI/image/linking/splash/status/system/web packages, React Native Web, Expo ESLint config, Reanimated/worklets used only by the starter splash, and unused Expo starter source files.

## Native services

- `src/services/notifications/OneSignalService.ts` centralizes OneSignal initialization, permission, and customer identity.
- `src/services/klaviyo/KlaviyoService.ts` centralizes Viewed Product, Added to Cart, Started Checkout, Placed Order, and Active on Site events.
- `src/services/location/LocationService.ts` handles Android and iOS runtime permissions and current position.
- `src/services/payments` defines a provider-neutral authorization contract.

SDK identifiers remain empty by default. OneSignal/Klaviyo production push setup still requires vendor dashboards, FCM `google-services.json`, APNs credentials/capabilities, and the iOS OneSignal notification service extension. A concrete payment SDK cannot be linked until the provider and merchant configuration are selected.

## Android

The Community CLI project is under `android/`. Its manifest includes internet, Android 13 notification, coarse/fine location permissions, the `ane` custom scheme, and a placeholder HTTPS App Link. Replace `app.example.com`, host a valid `assetlinks.json`, then enable verification. Release builds must use a private release keystore and Gradle/CI secrets; the generated debug signing configuration is not for Play submission.

Commands:

```bash
npm start
npm run android
npm run android:debug-apk
npm run android:release-apk
npm run android:bundle
```

The verified debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## iOS

The Community CLI Xcode project and Podfile are under `ios/`. `Info.plist` contains the `ane` URL scheme and location description, and `AppDelegate.swift` forwards custom/universal links to React Native.

On macOS:

```bash
cd ios
bundle install
bundle exec pod install
open RNLearningNative.xcworkspace
```

Configure Signing & Capabilities for Push Notifications, Background Modes/remote notifications, and Associated Domains (`applinks:<production-domain>`). Host a matching `apple-app-site-association` file. iOS was prepared but not built because this migration ran on Ubuntu.

## Verification record

- `npm install`: passed (npm reported 15 transitive audit findings; no breaking forced audit update was applied).
- `npm run typecheck`: passed.
- `npm run lint`: passed with warnings only.
- `npx react-native doctor`: JDK, Android SDK, `ANDROID_HOME`, and Gradle passed; Android Studio/device/ADB checks cannot pass in the headless restricted environment.
- `cd android && ./gradlew clean assembleDebug`: passed.
- iOS build: not tested on Ubuntu.

Before runtime testing, use Node 22 LTS, create `.env`, start an emulator/device, and add vendor push credentials.
