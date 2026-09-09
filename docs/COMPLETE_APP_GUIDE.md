# RN Learning Storefront: Complete App Guide

This guide describes the current Android/iOS application after its migration to bare React Native. It covers the application structure, React Navigation, Magento GraphQL boundary, state, native services, build configuration, and known production work.

For a migration-specific file and dependency summary, also see [BARE_REACT_NATIVE_MIGRATION.md](BARE_REACT_NATIVE_MIGRATION.md).

## 1. Technology and responsibility boundaries

The mobile application uses:

- React Native Community CLI 0.86.2.
- React 19.2.3 and TypeScript.
- React Navigation 7 native stacks and bottom tabs.
- React Context for customer, wishlist, and local cart state.
- Adobe Commerce/Magento GraphQL as the commerce backend.
- `react-native-config` for environment-specific native configuration.
- OneSignal, Klaviyo, and native location service abstractions.
- A provider-neutral payment service boundary.

The React/Next.js website remains a separate frontend. Both frontends consume Magento APIs:

```text
Adobe Commerce / Magento
          |
       GraphQL
      /       \
Website/PWA   React Native
              Android/iOS
```

The app never connects directly to the Magento database. React Native sends GraphQL operations to Magento, where resolvers and Magento services perform authorization, validation, catalog, inventory, quote, and order work.

## 2. Repository map

```text
RN_Learning/
  android/                         Native Android Gradle project
  ios/                             Native iOS Xcode/CocoaPods project
  assets/                          Images and application artwork
  backend-module/ANE/App/          Custom Magento mobile query module
  config/                          Web/Magento infrastructure examples
  docs/                            Architecture and integration documentation

  src/
    api/
      client/graphqlClient.ts      Shared GraphQL HTTP transport
      graphql/index.ts             GraphQL transport exports
      magento/index.ts             Magento API compatibility exports
    components/                    Reusable React Native UI
    config/env.ts                  Typed native environment access
    constants/colors.ts            Shared application palette
    context/                       Customer, cart, and wishlist state
    data/                          Optional learning fixtures
    hooks/use-commerce.ts          Reusable asynchronous request hook
    navigation/                    Typed navigators and deep-link mapping
    screens/                       Feature-oriented application screens
    services/
      commerce.ts                  Magento operations and response mapping
      magento/                     Magento service exports
      notifications/              OneSignal abstraction
      klaviyo/                     Klaviyo event abstraction
      location/                    Runtime permissions and geolocation
      payments/                    Pluggable payment contract

  App.tsx                          Providers, SDK startup, root navigator
  index.js                         React Native AppRegistry entry
  app.json                         Native component/display name
  babel.config.js                 React Native preset and `@` alias
  metro.config.js                 React Native Metro configuration
  package.json                    Scripts and dependencies
  tsconfig.json                   Strict TypeScript configuration
  .env.example                    Public configuration template
```

Expo Router and `src/app` are no longer part of the runtime architecture. `android/` and `ios/` are source projects and must be committed; only their generated build products are ignored.

## 3. Installation and environment

Use Node 22.11 or newer. React Native 0.86 declares Node 22 as its supported minimum.

```bash
cp .env.example .env
npm install
```

Do not commit `.env`, server secrets, signing keys, APNs keys, or store credentials.

### Environment variables

`MAGENTO_GRAPHQL_URL`

- Required Magento endpoint, including `/graphql`.
- Example placeholder: `https://commerce.example.com/graphql`.
- There is no hardcoded production or staging fallback.

`MAGENTO_STORE_CODE`

- Magento store-view code.
- Defaults to `default`.
- Non-default values are sent through the `Store` request header.

`MAGENTO_SOURCE_CODE`

- Inventory source used by source-aware product availability and checkout.
- Must match a source configured in Magento.

`USE_MOCKS`

- Uses local learning fixtures when set to `true`.
- Keep `false` for real Magento integration testing.

`ALLOW_FIXTURE_FALLBACK`

- Allows selected catalog reads to fall back after an API failure.
- Keep disabled for production because fixture SKUs may not exist in Magento.

`ONESIGNAL_APP_ID`

- Public OneSignal application identifier.
- An empty value disables JavaScript initialization.

`KLAVIYO_PUBLIC_API_KEY`

- Klaviyo public Site ID.
- An empty value disables JavaScript initialization.

`src/config/env.ts` is the single typed access point for these values. `react-native-config` injects them into Android and iOS builds.

## 4. Application startup

### `index.js`

The Community CLI entry imports `App` and registers `RNLearningNative` through `AppRegistry`. The registered name must match `app.json` and the module name used by both native projects.

### `App.tsx`

`App` initializes OneSignal and Klaviyo once, then builds the shared provider tree:

```text
GestureHandlerRootView
  SafeAreaProvider
    CustomerProvider
      WishlistProvider
        CartProvider
          StatusBar
          RootNavigator
```

- `GestureHandlerRootView` supports React Navigation/native gesture integrations.
- `SafeAreaProvider` supplies correct screen insets.
- `CustomerProvider` owns current customer state.
- `WishlistProvider` owns locally saved SKUs.
- `CartProvider` owns the browsing cart.
- `RootNavigator` owns all application navigation and link handling.

## 5. Navigation architecture

Navigation code lives under `src/navigation`.

```text
RootNavigator
  MainNavigator
    BottomTabNavigator
      Home
      Categories
      Cart
      Account
      Info
    Category
    Product
    Search
    Checkout
    Orders
    OrderDetails
    OrderSuccess
    Wishlist
    SeoRoute
  AuthNavigator
    Login
    Register
    ForgotPassword
```

The auth navigator is presented from the root as a modal flow. This permits guest catalog browsing while keeping authentication screens grouped separately.

### Typed parameters

`src/navigation/types.ts` defines:

- `RootStackParamList`
- `AuthStackParamList`
- `MainStackParamList`
- `BottomTabParamList`

Important parameterized routes are:

```ts
Category: { id: string; title?: string };
Product: { sku: string };
OrderDetails: { orderNumber: string };
OrderSuccess: { number: string; total: string; delivery: string };
SeoRoute: { seoPath: string | string[] };
```

`src/navigation/router.ts` is a temporary compatibility layer that translates the former path-shaped navigation calls into typed React Navigation destinations. New code should prefer direct typed `navigation.navigate(...)` calls.

### Route mapping

| User destination | React Navigation screen |
| --- | --- |
| Home | `Main > Tabs > Home` |
| Categories | `Main > Tabs > Categories` |
| Category/PLP | `Main > Category { id, title? }` |
| Product/PDP | `Main > Product { sku }` |
| Search | `Main > Search` |
| Cart | `Main > Tabs > Cart` |
| Checkout | `Main > Checkout` |
| Account | `Main > Tabs > Account` |
| Orders | `Main > Orders` |
| Order detail | `Main > OrderDetails { orderNumber }` |
| Order success | `Main > OrderSuccess { ... }` |
| Wishlist | `Main > Wishlist` |
| CMS information | `Main > Tabs > Info` |
| Login/register/reset | `Auth > ...` |
| Magento SEO URL | `Main > SeoRoute` |

## 6. Deep links

`src/navigation/linking.ts` supports the custom scheme:

```text
ane://product/{sku}
ane://category/{id}
ane://cart
ane://checkout
```

It also contains `https://app.example.com` as an explicit placeholder for verified links.

Android intent filters are in `android/app/src/main/AndroidManifest.xml`. Before enabling `android:autoVerify`, replace the placeholder host and publish a matching `/.well-known/assetlinks.json` containing the production package and signing certificate.

iOS registers the `ane` scheme in `Info.plist`. `AppDelegate.swift` forwards custom URLs and universal-link activities to `RCTLinkingManager`. For production universal links, add the Associated Domains capability and publish the matching `apple-app-site-association` file.

## 7. Shared GraphQL transport

File: `src/api/client/graphqlClient.ts`

`graphqlRequest<T>(query, variables)` is the generic Magento transport. It:

1. reads the required endpoint from `env.magentoGraphqlUrl`;
2. creates an `AbortController` with an eight-second timeout;
3. sends a JSON `POST` containing `{ query, variables }`;
4. sends the optional Magento store-view header;
5. sends the bearer token for authenticated operations;
6. converts HTTP and GraphQL errors into thrown `Error` objects;
7. returns typed `payload.data`.

`setGraphqlBearerToken(token)` changes the authorization token used by subsequent requests.

Screens and components must not embed GraphQL strings. They call functions from the Magento service boundary.

## 8. Magento commerce service

File: `src/services/commerce.ts`

This file retains the existing Magento business operations and app-specific response mapping. `src/api/magento/index.ts` and `src/services/magento/index.ts` provide grouped exports without duplicating operations.

### Important types

- `ProductFilter`: category UID, search, brand, country, maximum price, stock flag, and source.
- `Category`: route ID, Magento UID, name, count, and children.
- `CmsPage`: identifier, title, heading, and plain content.
- `Banner`: ID, title, destination, and image.
- `Customer`: normalized customer identity.
- `OrderInput`: SKU quantities, address, phone, delivery, payment, and coupon.
- `Order`: Magento order number, final total, and effective delivery method.
- `MobileApiProduct`: raw custom-query product response.

### Product normalization

`stripHtml` removes markup and collapses whitespace. `mapMobileProduct` converts Magento snake-case fields into the UI `Product` type, creates native image sources, normalizes optional values, converts stock status to a boolean, and calculates display labels.

### Catalog functions

`fetchProducts(filter, sort, pageSize)`

- Creates `MobileProductFilterInput`.
- Applies category, brand, country, price, inventory source, and stock filters.
- Converts UI sorting into Magento field/direction input.
- Executes `mobileProducts` and maps the result.

`fetchProduct(sku)`

- Loads a single SKU through `mobileProducts`.
- Allows unavailable products to resolve so PDP can show their state.

`fetchCategories()`

- Calls Magento's standard `categories` query below root category `2`.
- Maps top-level and child categories.

`fetchSeoRoute(key)`

- Calls Magento `route(url: ...)`.
- Resolves an SEO path into either category UID or product SKU.
- Powers `SeoRouteScreen` without Expo Router catch-all files.

`fetchCmsPage(identifier)` loads and cleans a Magento CMS page.

`fetchHomeBanners()` reads `storeConfig.home_slider`, then maps the ANE banner query.

### Customer functions

`loginCustomer(email, password)`:

1. calls `generateCustomerToken`;
2. installs the token in the commerce and GraphQL clients;
3. loads authenticated `customer`;
4. maps the customer to the app shape.

`registerCustomer(input)` calls `createCustomerV2`, then signs the customer in.

`requestPasswordReset(email)` calls Magento's `requestPasswordResetEmail` mutation.

### Checkout orchestration

`placeOrder(input)` preserves the existing complete checkout sequence:

1. Reject signed-out or empty checkout.
2. Read customer addresses and `customerCart`.
3. Select the default or first saved shipping address.
4. Load ANE delivery locations.
5. Match the selected address to a delivery location.
6. Load express, scheduled, and collection source details.
7. Convert the UI delivery choice to Magento delivery codes.
8. Select a supported inventory source.
9. Call `assignCustomerSource` before item changes.
10. Create the desired local SKU/quantity map.
11. Remove server items absent locally.
12. Update changed server quantities.
13. Add missing local items.
14. Surface `addProductsToCart.user_errors`.
15. Set shipping and billing addresses.
16. Search and select an available delivery slot.
17. Read shipping methods, payment methods, and final prices.
18. Choose an available shipping method.
19. Match the desired cash/card payment method.
20. Apply a non-empty coupon.
21. Set shipping and payment methods.
22. Call `placeOrder`.
23. Validate and return `orderV2.number` plus the final total.

Magento remains authoritative for inventory, shipping, payment availability, discounts, tax, and order totals.

## 9. Custom Magento `mobileProducts` query

Files:

- `backend-module/ANE/App/etc/schema.graphqls`
- `backend-module/ANE/App/Model/Resolver/MobileProducts.php`

The custom query provides a deliberately small mobile DTO instead of Magento `ProductInterface`. It supports category UID, SKU, brand, country, size, price, stock, inventory source, search, paging, and name/price sorting.

The PHP resolver:

1. validates and normalizes inputs;
2. creates a store-scoped EAV product collection;
3. selects required attributes only;
4. filters enabled, catalog-visible products;
5. decodes GraphQL category UIDs;
6. applies SKU/search/attribute/price filters;
7. restricts sorting to approved fields;
8. applies source-aware MSI stock filtering when supplied;
9. otherwise uses aggregate stock status;
10. calculates total count;
11. maps labels, images, prices, discount, and availability.

The resolver is read-only. It does not modify catalog, inventory, index, quote, or order data.

## 10. Context state

### Customer context

File: `src/context/CustomerContext.tsx`

- `customer` is `Customer | null`.
- `signIn` calls Magento login and stores the returned customer.
- `register` calls Magento registration/login.
- `signOut` clears local customer state.

The token is still memory-only. Production work should store it in a secure native storage library, restore it on startup, and clear both the secure value and GraphQL bearer token during logout.

### Cart context

File: `src/context/CartContext.tsx`

- `addItem` increments or appends a SKU.
- `changeQuantity` changes quantity with a minimum of one.
- `removeItem` removes a SKU.
- `clearCart` empties the local array.

Browsing state is local. `placeOrder` reconciles it with Magento immediately before checkout.

### Wishlist context

File: `src/context/WishlistContext.tsx`

- Stores an array of saved SKUs.
- `toggle` adds/removes a SKU.
- `has` tests membership.

It is currently local and does not call Magento wishlist mutations.

## 11. Request hook

File: `src/hooks/use-commerce.ts`

`useCommerce<T>(loader, dependencies)` standardizes loading, error normalization, data storage, retry, and dependency-driven reloads. It is the normal screen boundary for catalog and CMS requests.

## 12. Screens

### Home

File: `src/screens/Home/HomeScreen.tsx`

Loads categories, banners, and product selections. It renders delivery choice, search entry, promotional banners, category cards, and product carousels.

### Categories and category/PLP

Files:

- `src/screens/Category/CategoriesScreen.tsx`
- `src/screens/Category/CategoryScreen.tsx`

The category index loads the Magento tree. Category screen receives `{ id, title? }`, calls `fetchProducts`, and combines Magento filters/sorting with the existing filter and sort modals.

### Product/PDP

File: `src/screens/Product/ProductScreen.tsx`

Receives `{ sku }`, loads the product and recommendations, manages quantity, toggles wishlist state, and adds repeated quantities to the local cart.

### Search

File: `src/screens/Search/SearchScreen.tsx`

Calls `fetchProducts({ search })`, renders recent suggestions for an empty query, and a product grid for active results.

### Cart and checkout

Files:

- `src/screens/Cart/CartScreen.tsx`
- `src/screens/Checkout/CheckoutScreen.tsx`

Cart owns coupon preview text and local quantity actions. Checkout maps the local cart into `OrderInput`, calls `placeOrder`, clears local state after success, and navigates to `OrderSuccess`.

The current checkout address/phone values and scheduled-slot display are learning defaults. Production checkout must use customer-selected address and API-returned slots.

### Authentication

Files:

- `src/screens/Login/LoginScreen.tsx`
- `src/screens/Register/RegisterScreen.tsx`
- `src/screens/ForgotPassword/ForgotPasswordScreen.tsx`

These screens call customer context or the reset-password service and live under `AuthNavigator`.

### Account and orders

Files:

- `src/screens/Account/AccountScreen.tsx`
- `src/screens/Orders/OrdersScreen.tsx`
- `src/screens/Orders/OrderDetailsScreen.tsx`

Account changes menu content for guest/customer state. Orders and order details currently contain sample/placeholder presentation; authenticated `customer.orders` data is remaining work.

### Supporting screens

- `OrderSuccessScreen`: renders Magento order result parameters.
- `WishlistScreen`: filters loaded products against locally saved SKUs.
- `InfoScreen`: loads Magento CMS identifiers independently.
- `SeoRouteScreen`: resolves Magento `*.html` routes into category or product views.

## 13. Shared components and styling

All active UI uses React Native `StyleSheet.create`; browser CSS is no longer part of the mobile runtime.

Important components:

- `Header`: centered title, back navigation, and search action.
- `SearchBar`: controlled input or pressable search entry.
- `DeliverySelector`: reports express/scheduled/collection choice.
- `HeroBanner`: remote banner image or native fallback presentation.
- `ProductCard` and `ProductGrid`: product navigation, wishlist, availability, price, and add-to-cart behavior.
- `QuantitySelector`: stateless quantity controls.
- `FilterModal` and `SortModal`: PLP refinement UI.
- `OrderSummary`: local display calculation; Magento remains final authority.
- `RequestState`: spinner, error, and retry handling.
- `FormField`: shared native form field styling.
- `SectionTitle`: section heading and optional subtitle.

The shared palette is `src/constants/colors.ts`.

## 14. Native service boundaries

### OneSignal

File: `src/services/notifications/OneSignalService.ts`

The service centralizes SDK initialization, native permission requests, customer identity, and logout. UI screens should never initialize OneSignal directly.

Production push still requires OneSignal dashboard configuration, Firebase credentials for Android, APNs credentials/capabilities for iOS, and an iOS notification service extension for rich notifications.

### Klaviyo

File: `src/services/klaviyo/KlaviyoService.ts`

The typed event boundary supports:

- Viewed Product
- Added to Cart
- Started Checkout
- Placed Order
- Active on Site

The service is initialized at app startup. Product/customer integration points should call this boundary rather than importing the SDK into UI.

### Location

File: `src/services/location/LocationService.ts`

Android requests `ACCESS_FINE_LOCATION` at runtime. iOS requests `whenInUse` authorization. `getCurrentPosition` rejects when permission is not granted and uses high-accuracy location with bounded timeout/cache behavior.

The native permission declarations are in AndroidManifest and Info.plist.

### Payments

Files:

- `src/services/payments/PaymentProvider.ts`
- `src/services/payments/PaymentService.ts`

`PaymentProvider` defines initialization and authorization inputs/results. `PaymentService` delegates to the selected provider and fails clearly when none is configured. A gateway should be implemented as a provider adapter without coupling checkout UI to its SDK.

## 15. Android project and builds

The native Android project includes:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/build.gradle`
- `android/build.gradle`
- `android/gradle.properties`
- `android/settings.gradle`
- Gradle wrapper files

The manifest currently declares internet, notification, coarse location, fine location, launcher, custom deep link, and placeholder HTTPS App Link configuration.

Start Metro:

```bash
npm start
```

Run on a connected device/emulator:

```bash
npm run android
```

Build the debug APK:

```bash
npm run android:debug-apk
```

Equivalent direct command:

```bash
cd android
./gradlew clean assembleDebug
```

Output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Release commands:

```bash
npm run android:release-apk
npm run android:bundle
```

Before Play Store submission, configure a private release keystore through local/CI secrets. Never use the generated debug keystore for release signing.

## 16. iOS project and builds

The native iOS project contains the Xcode project, Swift AppDelegate, Info.plist, privacy manifest, launch storyboard, and Podfile.

On macOS:

```bash
cd ios
bundle install
bundle exec pod install
open RNLearningNative.xcworkspace
```

Configure the Apple team, bundle identifier, release signing, Push Notifications, Background Modes/remote notifications, Associated Domains, APNs/OneSignal integration, and any selected payment SDK capabilities.

The iOS project was prepared on Ubuntu and has not been compiled with Xcode.

## 17. Verification status

The migration was verified with:

```bash
npm install
npm run typecheck
npm run lint
npx react-native doctor
npm start -- --port 8088
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output /tmp/rn-learning-index.android.bundle --assets-dest /tmp/rn-learning-assets
cd android && ./gradlew clean assembleDebug
```

Results:

- Dependency installation passed.
- Strict TypeScript passed.
- ESLint passed without warnings.
- Metro started successfully.
- Android production-mode JavaScript bundle and assets completed.
- Gradle completed `clean assembleDebug` successfully.
- Doctor found the JDK, Android SDK, `ANDROID_HOME`, and Gradle. Device/Android Studio checks could not pass in the headless restricted environment.
- `run-android` was not exercised because no device/emulator was accessible.
- iOS was not built because Xcode is unavailable on Ubuntu.

## 18. End-to-end flows

### Browse to cart

```text
Home/Categories
  -> Magento categories/mobileProducts
  -> Category ProductCard
  -> Product fetchProduct
  -> CartContext.addItem
  -> Cart tab
```

### Authentication

```text
AuthNavigator Login
  -> CustomerContext.signIn
  -> generateCustomerToken
  -> GraphQL bearer token
  -> authenticated customer
  -> customer context state
```

### Checkout

```text
Local CartContext
  -> authenticated customerCart
  -> delivery location/source assignment
  -> item reconciliation
  -> address and delivery slot
  -> shipping/payment/coupon
  -> placeOrder
  -> clear local cart
  -> OrderSuccess
```

### Native engagement

```text
App startup
  -> OneSignalService.initialize
  -> KlaviyoService.initialize

Feature action
  -> service abstraction
  -> native vendor SDK
```

## 19. Known remaining production work

- Persist and restore Magento customer tokens using secure native storage.
- Clear the GraphQL bearer token and vendor identities during logout.
- Synchronize Magento cart state on browsing cart mutations instead of only at checkout.
- Load real customer orders and complete order details.
- Persist wishlist through Magento for signed-in customers.
- Replace demonstration address, phone, and slot values with API/customer state.
- Connect Klaviyo events at the relevant product/cart/checkout lifecycle points.
- Decide when to present OneSignal notification permission rather than prompting automatically.
- Add OneSignal/Firebase/APNs production credentials and iOS extension/capabilities.
- Select and implement the native payment gateway adapter.
- Replace placeholder verified-link domains and host association files.
- Configure release signing, application IDs/bundle IDs, icons, splash assets, versioning, and CI/CD.
- Review npm's reported transitive dependency audit findings without using a breaking forced upgrade.

These items fit the established service, context, navigation, and native project boundaries and do not require another architectural rewrite.
