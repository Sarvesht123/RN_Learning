# Adobe Commerce GraphQL learning map

The local mobile app talks to `http://aed.staging.com/graphql`. This development virtual host currently listens on HTTP port 80 only. It must never connect to the Adobe Commerce database directly. GraphQL resolvers validate the request, apply store/customer scope, and then read or write the database through Magento service contracts.

During Expo web development, Metro exposes `/graphql-proxy` on the app's own port and forwards requests to the local Adobe Commerce host. This avoids browser CORS restrictions and does not require Expo to occupy the Adminer port.

## Current dynamic flows

| App feature | GraphQL operation | Source |
| --- | --- | --- |
| Header/category/subcategory | `categories` | Magento CatalogGraphQl |
| Homepage banner | `storeConfig.home_slider`, then `getSliderBanners` | `ANE/Homepage`, `ANE/BannerSliderGraphQl` |
| Homepage product blocks | `products` | Magento CatalogGraphQl |
| Custom product filters | `products(filter: ProductAttributeFilterInput)` | Magento plus `ANE/Catalog` |
| Search | `products(search: ...)` | Magento CatalogGraphQl |
| PDP | `products(filter: { sku: ... })` | Magento CatalogGraphQl |
| CMS pages | `cmsPage(identifier: ...)` | Magento CmsGraphQl |
| Register | `createCustomerV2` | Magento CustomerGraphQl plus ANE fields |
| Login | `generateCustomerToken`, then `customer` | Magento CustomerGraphQl |

The custom backend already exposes `in_stock` as a product filter and `brand`, `product_country`, `size`, and `am_product_label` on `ProductInterface`. No duplicate database columns or custom product table are needed.

## Write flow to complete against staging

Adobe Commerce checkout is a sequence, not one direct database submission:

1. `createGuestCart` or authenticated `customerCart`
2. `addProductsToCart`, `updateCartItems`, and `removeItemFromCart`
3. `applyCouponToCart`
4. `setGuestEmailOnCart` for a guest
5. `setShippingAddressesOnCart` and `setBillingAddressOnCart`
6. Read `available_shipping_methods`, then `setShippingMethodsOnCart`
7. Read `available_payment_methods`, then `setPaymentMethodOnCart`
8. `placeOrder`

The ANE schema requires the custom address fields `area` and `zone`; delivery also includes source/location and slot metadata. These values must be selected from the location and slot GraphQL queries rather than hardcoded. Payment codes must likewise come from `available_payment_methods`.

## Running

Copy `.env.example` to `.env`, confirm the correct Adobe Commerce store-view code, then run `npm start`. Use `EXPO_PUBLIC_USE_MOCKS=true` only for offline UI learning. Never put admin tokens, customer passwords, database credentials, or payment secrets in an `EXPO_PUBLIC_*` variable.

Customer tokens are currently memory-only on purpose. Before a production build, store them with Expo SecureStore and clear them on logout/token expiry.
