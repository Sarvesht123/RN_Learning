# RN Learning Storefront: Complete Code Guide

This document explains the current Expo/React Native storefront and its Adobe Commerce integration. It is written for learning: start with the architecture and request flow, then read the page or file you are studying beside this guide.

## 1. What the application contains

The application is an Expo SDK 57 React Native project using:

- Expo Router for file-based routing.
- React Context for customer, wishlist, and local UI cart state.
- Adobe Commerce GraphQL for categories, products, CMS, banners, customers, carts, checkout, and orders.
- A custom read-only Magento query named `mobileProducts` for product catalog reads without Catalog Service.
- A Metro development proxy for browser access to the local Magento virtual host.
- Local fixture data only when mock mode is explicitly enabled.

The application never connects directly to the database. React Native sends GraphQL operations to Magento; Magento resolvers use Magento collections, repositories, validation, inventory, quote, and order services.

## 2. Project map

```text
src/
  app/                    Expo Router pages
  components/             Reusable presentation and interaction components
  constants/              Shared colors and theme values
  context/                Customer, wishlist, and cart state
  data/                   Optional offline learning fixtures
  hooks/                  Reusable asynchronous request and theme hooks
  services/commerce.ts    All storefront GraphQL and response mapping

backend-module/ANE/App/
  etc/schema.graphqls     Custom mobile product GraphQL contract
  Model/Resolver/
    MobileProducts.php    Read-only Magento product resolver

metro.config.js           Web development GraphQL proxy
.env.example              Runtime configuration example
```

## 3. Runtime configuration

The values are defined in `.env.example`.

### `EXPO_PUBLIC_GRAPHQL_URL`

The core Magento GraphQL endpoint. The local environment uses:

```text
http://aed.staging.com/graphql
```

Core GraphQL handles customer authentication, CMS, catalog categories, carts, shipping, payment, and orders.

### `EXPO_PUBLIC_STORE_CODE`

The Magento store-view code. It defaults to `default`. When it is not `default`, `commerce.ts` sends it in the `Store` request header.

### `EXPO_PUBLIC_SOURCE_CODE`

The inventory source used to decide which products are displayed as available. It defaults to `dip_ds`, matching the learning checkout location/source. The same source must be assigned to the Magento cart before adding products.

### `EXPO_PUBLIC_USE_MOCKS`

When `true`, selected catalog/customer/order functions use local fixtures. It should be `false` for Magento testing.

### `EXPO_PUBLIC_ALLOW_FIXTURE_FALLBACK`

When `true`, failed product/category reads may fall back to local fixture data. It defaults to disabled because fixture SKUs do not exist in Magento and therefore must never enter a live Magento checkout.

## 4. Metro web proxy

File: `metro.config.js`

Browsers enforce CORS. Apache only permits selected origins, and the Magento host uses port 80 without HTTPS. During Expo web development, `commerce.ts` uses `/graphql-proxy` instead of calling Magento directly.

`config.server.enhanceMiddleware` wraps Metro's normal request handler. For normal URLs, it calls `enhanced(request, response, next)`. For `/graphql-proxy`, it:

1. Copies the browser request headers.
2. changes the `Host` header to `aed.staging.com`;
3. removes browser `Origin` and `Referer` headers;
4. creates a Node HTTP request to `aed.staging.com:80/graphql`;
5. pipes the GraphQL request body to Magento;
6. pipes Magento's status, headers, and body back to the browser;
7. returns a JSON GraphQL-style error if the proxy connection fails.

This proxy is for local web development. Native iOS/Android requests use `EXPO_PUBLIC_GRAPHQL_URL` directly.

## 5. Root layout and global providers

File: `src/app/_layout.tsx`

`RootLayout()` is the root component for every route.

Provider nesting:

```text
CustomerProvider
  WishlistProvider
    CartProvider
      StatusBar
      Stack
```

- `CustomerProvider` makes authentication state available everywhere.
- `WishlistProvider` stores locally selected wishlist SKUs.
- `CartProvider` stores the products and quantities currently shown in the app cart.
- `StatusBar style="dark"` sets the system status-bar appearance.
- `Stack` creates Expo Router stack navigation.
- `headerShown: false` disables Expo's default header because the project uses its own `Header` component.
- `contentStyle.backgroundColor` provides a global page background.

## 6. Shared data types

### `Product`

File: `src/data/products.ts`

Important properties:

- `uid`: Magento GraphQL encoded product ID.
- `sku`: stable Magento product identifier used by PDP, cart, and checkout.
- `name`: customer-facing name.
- `category`: fixture category identifier; live mapped products currently use an empty string.
- `brand`, `country`, `size`: displayed product metadata.
- `price`: final/special Magento price.
- `oldPrice`: regular Magento price.
- `discount`: calculated percentage reduction.
- `image`: primary React Native image source.
- `images`: optional gallery image sources.
- `description`: plain text converted from Magento HTML.
- `available`: whether the product can be sold.
- `label`: Magento/Amasty label value.
- `appearance`, `nose`, `taste`, `finish`: learning PDP fields present in fixtures.

### `CartItem`

File: `src/context/CartContext.tsx`

```ts
type CartItem = Product & { quantity: number };
```

It contains every `Product` property plus the quantity selected in the app.

### Commerce service objects

File: `src/services/commerce.ts`

- `ProductFilter`: optional category UID, search phrase, brand, country, maximum price, stock flag, and source code.
- `Category`: route ID, encoded Magento UID, name, product count, and child categories.
- `CmsPage`: identifier, title, heading, and cleaned text content.
- `Banner`: ID, title, destination URL, and mobile image URL.
- `Customer`: normalized ID, first name, last name, and email.
- `OrderInput`: cart SKU/quantity pairs, address, phone, delivery selection, payment selection, and coupon.
- `Order`: order number, total, and effective delivery method returned to the success screen.
- `MobileApiProduct`: exact raw shape returned by the custom Magento `mobileProducts` query.

## 7. Context state

### Customer context

File: `src/context/CustomerContext.tsx`

State:

- `customer`: `Customer | null`. `null` means signed out.

Functions:

- `signIn(email, password)`: calls `loginCustomer`, then stores the returned customer.
- `register(input)`: calls `registerCustomer`, then stores the returned customer.
- `signOut()`: clears the React customer object.
- `useCustomer()`: convenience hook that reads the context and throws when used outside `CustomerProvider`.

The Magento token is held by `commerce.ts` in the module-level `customerToken` variable. It is intentionally memory-only in this learning version. A production app should use Expo SecureStore and revoke/clear the token on logout.

### Cart context

File: `src/context/CartContext.tsx`

State:

- `items`: local `CartItem[]`, initially empty.

Functions:

- `addItem(product)`: increments an existing SKU or appends a new item with quantity `1`.
- `changeQuantity(sku, amount)`: adds `amount` and clamps the result to at least `1`.
- `removeItem(sku)`: removes the matching SKU.
- `clearCart()`: replaces the local array with an empty array after successful checkout.
- `useCart()`: retrieves the cart context.

The cart is local while browsing. `placeOrder()` reconciles it with `customerCart` immediately before checkout.

### Wishlist context

File: `src/context/WishlistContext.tsx`

State:

- `skus`: array of saved product SKUs.

Functions:

- `toggle(sku)`: removes an existing SKU or appends a missing SKU.
- `has(sku)`: returns whether a product is saved.
- `useWishlist()`: retrieves the context.

The current wishlist is local learning state. It does not yet call Magento's authenticated wishlist mutations.

## 8. Asynchronous request hook

File: `src/hooks/use-commerce.ts`

`useCommerce<T>(loader, dependencies)` standardizes screen requests.

State:

- `data`: successful value of generic type `T`.
- `loading`: `true` while the loader is executing.
- `error`: normalized error message.

`load`:

1. sets loading;
2. clears the previous error;
3. awaits `loader()`;
4. stores returned data;
5. stores a readable message on failure;
6. always clears loading.

The `dependencies` argument controls when `load` is recreated. `useEffect` runs the request on first render and whenever `load` changes. The returned `retry` is the same `load` callback used by `RequestState`.

## 9. Commerce GraphQL service

File: `src/services/commerce.ts`

This is the application's backend boundary. Pages should call service functions rather than embedding GraphQL strings.

### Endpoint variables

- `commerceEndpoint`: configured Magento URL.
- `endpoint`: `/graphql-proxy` on development web; otherwise `commerceEndpoint`.
- `storeCode`: current Magento store view.
- `useFixtures`: explicit mock-mode flag.
- `allowFallback`: explicit fixture-fallback flag.
- `checkoutSourceCode`: inventory source used by product reads.
- `customerToken`: in-memory bearer token.

### `setCustomerToken(token)`

Updates the token used by authenticated GraphQL requests.

### `graphql<T>(query, variables)`

The private request function used by every service operation.

- Creates `AbortController`.
- Starts an eight-second timeout.
- sends `POST` with JSON `{ query, variables }`.
- Adds `Content-Type`.
- Adds `Store` for non-default store views.
- Adds `Authorization: Bearer ...` after login.
- distinguishes timeout, connection, HTTP, and GraphQL errors.
- returns `payload.data` typed as `T`.

### Product mapping

`stripHtml(value)` removes markup and collapses whitespace.

`mapMobileProduct(item)` translates Magento's snake-case response into the UI `Product` object. It also:

- removes the leading `" - "` present in some Magento names;
- maps `small_image` to `{ uri: ... }`;
- substitutes the splash asset when no image exists;
- rounds discount percentage;
- converts `IN_STOCK` to a boolean;
- supplies safe empty values for optional PDP fields.

### `fetchProducts(filter, sort, pageSize)`

Builds `MobileProductFilterInput`:

- `category_uid` from the category route;
- `brand`, `product_country`, and `max_price` from filter UI;
- `in_stock` unless explicitly disabled;
- `source_code` so displayed products have positive inventory at the checkout source.

It converts the UI sort object, such as `{ price: 'DESC' }`, into Magento's `{ field: 'price', direction: 'DESC' }`, executes `mobileProducts`, and maps each result.

### `fetchProduct(sku)`

Loads one Magento product using `mobileProducts(filter: { sku })`. It sets `in_stock: false` so a PDP can still resolve an unavailable SKU and show its state.

### `fetchCategories()`

Calls Magento's standard `categories` query with root `parent_id = 2`. It returns top categories plus children. Product counts were removed from this query because custom recursive count resolvers made the response too slow.

### `fetchCmsPage(identifier)`

Uses Magento `cmsPage`, then returns plain text through `stripHtml`.

### `fetchHomeBanners()`

1. Reads `storeConfig.home_slider`.
2. Calls ANE `getSliderBanners(slider_id)`.
3. maps banner IDs, titles, URLs, and mobile images.

### `loginCustomer(email, password)`

1. Calls `generateCustomerToken`.
2. stores the token.
3. calls authenticated `customer`.
4. maps `firstname` and `lastname` to the app's camel-case object.

### `registerCustomer(input)`

Calls `createCustomerV2` with Magento and ANE customer fields, then calls `loginCustomer` so successful registration also signs the user in.

### `placeOrder(input)`

This is the full Magento checkout orchestration.

1. Rejects signed-out or empty checkout.
2. Reads `customer` addresses and `customerCart` items.
3. selects default shipping address, falling back to the first address.
4. loads active ANE delivery locations.
5. matches the address, falls back to JVC for the learning location, then the first location.
6. loads location/source details using configured latitude and longitude.
7. converts UI delivery text into `express`, `scheduled`, or `click_n_collect`.
8. chooses the requested source or an available scheduled/express fallback.
9. calls `assignCustomerSource` before changing items. This ordering is essential because inventory must be validated against the assigned source.
10. creates `desired`, a `Map<sku, quantity>` from the local cart.
11. removes server-cart items not present locally.
12. updates server quantities that differ.
13. adds SKUs missing from the server cart.
14. surfaces `addProductsToCart.user_errors` instead of silently proceeding.
15. sets shipping and billing addresses.
16. calls `searchSlots` and assigns the first available slot.
17. reads available shipping and payment methods plus grand total.
18. chooses the first available shipping method.
19. tries to match cash/card from the UI label, then falls back to the first payment method.
20. applies a non-empty coupon.
21. sets shipping and payment methods.
22. calls `placeOrder`.
23. checks `orderV2.number` and returns the real order details.

Important checkout variables:

- `cartId`: masked Magento customer-cart ID.
- `address`: selected saved customer address.
- `desired`: local cart quantities keyed by SKU.
- `location`: selected ANE place of delivery.
- `deliveryCode`: delivery type requested by the UI.
- `effectiveDelivery`: delivery type actually supported at the location.
- `effectiveSource`: inventory source assigned to the quote.
- `slot`: first currently available delivery slot.
- `shipping`: selected carrier/method pair.
- `payment`: selected Magento payment code.
- `options.cart.prices.grand_total`: final total returned to the success screen.

## 10. Magento `mobileProducts` backend

Files:

- `backend-module/ANE/App/etc/schema.graphqls`
- `backend-module/ANE/App/Model/Resolver/MobileProducts.php`

The same files are installed under `/var/www/html/AdobeCommerce/app/code/ANE/App`.

### GraphQL schema

`mobileProducts` accepts:

- `filter`: `MobileProductFilterInput`.
- `search`: product name/SKU phrase.
- `pageSize`: default 20, resolver clamps it to 1–50.
- `currentPage`: one-based page.
- `sort`: field and `SortEnum` direction.

`MobileProductFilterInput` supports category UID, SKU, brand, country, size, max price, stock requirement, and inventory source code.

`MobileProductSearchResult` contains `total_count` and `items`.

`MobileProduct` is deliberately a simple mobile DTO rather than Magento `ProductInterface`. This prevents the installed Live Search adapter from intercepting the query.

### PHP dependencies

- `CollectionFactory`: creates the Magento EAV product collection.
- `StoreManagerInterface`: scopes products and builds media URLs.
- `ResourceConnection`: resolves inventory table names safely.
- `Uid`: encodes/decodes GraphQL category and product IDs.

### `resolve(...)`

The resolver:

1. normalizes arguments and pagination;
2. creates a store-scoped product collection;
3. selects only required product attributes;
4. filters enabled/catalog-visible products;
5. decodes `category_uid` and applies category filtering;
6. applies SKU, search, attribute, and price filters;
7. allows only `name` or `price` sorting;
8. applies source-aware stock filtering through `inventory_source_item` when `source_code` exists;
9. otherwise uses aggregate `cataloginventory_stock_status`;
10. loads total count;
11. builds each response object with labels, image URL, final price, regular price, and discount.

### `label(product, attributeCode)`

Magento select attributes store option IDs. `label()` retrieves the attribute frontend model and converts stored option IDs into readable labels. Multiselect values are joined with commas.

This resolver is read-only. It does not write products, inventory, indexes, sync feeds, or Catalog Service data.

## 11. Pages

### Home — `src/app/index.tsx`

Route: `/`

State:

- `delivery`: selected delivery label.

Requests:

- `categoryResult = useCommerce(fetchCategories, [])`.
- `productResult = useCommerce(() => fetchProducts(...), [])`.
- `bannerResult = useCommerce(fetchHomeBanners, [])`.

Sections:

- global `Header`;
- `DeliverySelector`;
- pressable `SearchBar`;
- dynamic primary `HeroBanner`;
- combined loading/error `RequestState`;
- horizontal category cards;
- top product carousel;
- promotional banner;
- second product carousel;
- persistent `BottomTabs`.

Category presses navigate to `/category/[id]` with encoded category UID and readable title.

### Categories — `src/app/categories.tsx`

Route: `/categories`

- Loads `fetchCategories`.
- `result.data ?? []` prevents undefined mapping.
- `RequestState` exposes loading, API error, and retry.
- Each category opens the PLP with `id=category.uid`.
- `productCount` is currently zero because expensive counts were intentionally excluded.

### Product listing — `src/app/category/[id].tsx`

Route: `/category/:id`

URL parameters:

- `id`: encoded Magento category UID.
- `title`: readable category title.

State:

- `filterOpen`: controls `FilterModal`.
- `sortOpen`: controls `SortModal`.
- `filters`: currently selected brand/country/size/max price.
- `sort`: selected display label.

`sortInput` translates display labels into Magento sort objects. `useCommerce` reloads whenever relevant filter/sort dependencies change. `displayed` performs the remaining size filter locally. The page renders filter/sort controls, request state, product count, `ProductGrid`, modals, and tabs.

### Search — `src/app/search.tsx`

Route: `/search`

- `query` contains input text.
- `fetchProducts({ search: query })` performs Magento name/SKU search.
- Empty search loads three products for recent/trending presentation.
- Non-empty search shows result count and `ProductGrid`.
- Trending tags are presentation-only text in the current version.

### Product detail — `src/app/product/[sku].tsx`

Route: `/product/:sku`

State and data:

- `sku`: route parameter.
- `result`: `fetchProduct(sku)`.
- `related`: first three dynamic products.
- `quantity`: selected add quantity.
- `has/toggle`: wishlist state.

`add()` calls `addItem(product)` `quantity` times, then navigates to cart. The page renders primary image, discount, wishlist, thumbnail examples, brand/country, prices, quantity selector, add button, description/tasting fields, recommendations, and recently-viewed explanation.

### Cart — `src/app/cart.tsx`

Route: `/cart`

Variables:

- `items`: local cart items.
- `coupon`: text input value.
- `recommendations`: two source-available products.
- `subtotal`: sum of `price * quantity`.
- `discount`: learning preview of `SAVE10`; real coupon validation happens during checkout.

Each item renders image, pricing, `QuantitySelector`, and remove action. Checkout is disabled when empty. `router.push('/checkout')` opens checkout.

### Checkout — `src/app/checkout.tsx`

Route: `/checkout`

State:

- `delivery`: express/scheduled/collect UI choice.
- `slot`: selected display slot for scheduled UI.
- `payment`: card/cash label.
- `coupon`: coupon submitted to Magento.
- `busy`: prevents double submission.
- `error`: exact GraphQL/checkout failure message.

`subtotal` is a local display calculation. `submit()` maps local cart items into `{ sku, quantity }`, supplies the current learning address/phone and selections, then awaits `placeOrder`. On success it clears the local cart and replaces the route with `/order-success` parameters.

The nested `Field` component owns its own input text. For a production checkout, lift address/phone state into `Checkout` and use dynamically loaded customer addresses rather than the current display defaults.

### Order success — `src/app/order-success.tsx`

Route: `/order-success`

Parameters:

- `number`: real Magento order number.
- `total`: final cart total.
- `delivery`: effective delivery code.

The page displays the confirmation summary and replaces the route with `/` when continuing shopping.

### Login — `src/app/login.tsx`

Route: `/login`

State:

- `email`, `password`: controlled form values.
- `error`: authentication failure.
- `busy`: button/loading state.

`submit()` clears previous errors, calls context `signIn`, then replaces the route with `/account`. Errors are normalized for display. The register link opens `/register`.

### Register — `src/app/register.tsx`

Route: `/register`

State includes first name, last name, email, password, error, and busy. `submit()` calls context `register` and redirects to account. The service performs `createCustomerV2` followed by login.

### Account — `src/app/account.tsx`

Route: `/account`

- `customer` determines signed-in versus guest presentation.
- `items` is a different menu array for each state.
- Avatar uses the first initial or `A`.
- Signed-in menu exposes orders, wishlist, and addresses.
- Guest menu exposes sign-in, registration, and wishlist.
- `signOut` clears customer context.

### Wishlist — `src/app/wishlist.tsx`

Route: `/wishlist`

- Reads local saved `skus`.
- Loads up to 100 source-available products.
- filters results to saved SKUs.
- shows `ProductGrid` or an empty-state message.

This is a local wishlist demonstration, not Magento wishlist persistence.

### Orders — `src/app/orders.tsx`

Route: `/orders`

The current screen is a visual sample order card and explicitly explains that production should load authenticated customer orders. It is not yet connected to the Magento `customer.orders` query.

### Information/CMS — `src/app/info.tsx`

Route: `/info`

`identifiers` lists CMS page identifiers. Each `CmsCard` independently calls `fetchCmsPage(identifier)` and renders request state plus cleaned CMS content. Missing Magento identifiers produce their own retryable error without stopping other CMS cards.

## 12. Shared components

### `Header`

Props: `title` and `back`. Uses `router.back()` for a back header; otherwise reserves the same left width for centered title alignment. The right action navigates to search.

### `BottomTabs`

Uses `usePathname` to calculate active state and `router.navigate` to switch among Home, Categories, Cart, Account, and Info. Category detail routes activate Categories.

### `SearchBar`

Wraps a controlled `TextInput`. An uneditable bar navigates to search; editable usage receives `value` and `onChangeText`.

### `DeliverySelector`

Props: selected label and `onSelect`. Renders three pressable options and reports the selected string to its parent.

### `HeroBanner`

Props: `promo`, optional dynamic `title`, and optional image URL. With an image it uses `ImageBackground`; otherwise it uses styled content and emoji fallback.

### `ProductCard`

Props: `product`, optional `compact`.

- Card press opens PDP.
- Heart press stops propagation and toggles wishlist.
- Plus press stops propagation and adds one item.
- Displays image, discount, name, metadata, availability, prices, and add action.

### `ProductGrid`

Receives a product array and renders `ProductCard` rows/grid with stable SKU keys.

### `QuantitySelector`

Props: quantity, decrease callback, increase callback. It contains no state; the parent owns quantity.

### `FilterModal`

Exports `Filters`, the PLP filter object. It keeps draft UI choices, allows clear/apply, and reports the selected filter object to the PLP.

### `SortModal`

Exports `SortOption`, the accepted sort-label union. Selecting an option updates the parent and closes the modal.

### `OrderSummary`

Props: subtotal and optional discount. Calculates tax and total for display. Magento remains the authority for final checkout totals.

### `RequestState`

Props: `loading`, `error`, `retry`. Shows an activity spinner, a retryable error, or nothing.

### `FormField`

Combines a label with React Native `TextInputProps`, allowing login/register fields to share styling and behavior.

### `SectionTitle`

Displays a section heading and optional subtitle/count.

## 13. Styling objects

Every page/component uses `StyleSheet.create`. These objects are static React Native style definitions, not runtime state.

Common patterns:

- `safe`: full-screen background and safe-area container.
- `content`: page padding and scroll bottom spacing.
- `card`/`item`: white rounded surface.
- `row`: horizontal flex layout.
- `primary`/`success`: actions using shared colors.
- `muted`: secondary labels and metadata.
- `disabled`: reduced opacity for unavailable actions.

Shared palette is in `src/constants/colors.ts`: primary red, success green, neutral background/surface/borders, muted text, pale status backgrounds, and accent colors.

## 14. End-to-end flows

### Browse to cart

```text
Home/Categories
  -> fetchCategories/mobileProducts
  -> PLP ProductCard
  -> PDP fetchProduct
  -> CartContext.addItem
  -> Cart screen
```

### Authentication

```text
Login form
  -> CustomerContext.signIn
  -> loginCustomer
  -> generateCustomerToken
  -> authenticated customer query
  -> customer state
```

### Checkout

```text
Local CartContext items
  -> customerCart
  -> delivery location/source
  -> assign source
  -> reconcile Magento cart
  -> addresses
  -> slot
  -> shipping/payment
  -> coupon
  -> placeOrder
  -> clearCart
  -> order-success
```

## 15. Known learning-version limitations

- Customer tokens are memory-only.
- Wishlist is local rather than Magento persisted.
- Orders screen uses a visual fixture rather than `customer.orders`.
- Cart is local until checkout reconciliation; a production app would keep Magento cart state synchronized after every cart action.
- Checkout address/phone fields are display-oriented and should be lifted into page state.
- Category product counts are omitted for performance.
- CMS identifiers must exist in Magento or each missing card displays an error.
- Recently viewed is explanatory UI; ANE's recently viewed mutation is not yet connected.
- PDP related products currently use a general product request rather than Magento relation data.
- Payment-specific data for hosted/card gateways may require redirect or gateway-specific mutations beyond selecting the payment code.

These limitations are useful next learning exercises because each one extends an already-defined service/context boundary without redesigning the whole app.
