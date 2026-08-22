import { Product, products as fixtures } from '@/data/products';
import { categories as categoryFixtures } from '@/data/categories';
import { Platform } from 'react-native';
export type ProductFilter = { categoryUid?: string; search?: string; brand?: string; country?: string; maxPrice?: number; inStock?: boolean; sourceCode?: string };
export type Category = { id: string; uid: string; name: string; productCount: number; children: Category[] };
export type CmsPage = { identifier: string; title: string; heading: string; content: string };
export type Banner = { id: string; title: string; url: string; image: string };
export type Customer = { id: string; firstName: string; lastName: string; email: string };
export type OrderInput = { items: { sku: string; quantity: number }[]; address: string; phone: string; deliveryMethod: string; paymentMethod: string; coupon?: string };
export type Order = { number: string; total: number; deliveryMethod: string };
export type SeoRoute = { type: 'CATEGORY'; uid: string; title: string } | { type: 'PRODUCT'; sku: string; title: string };
const commerceEndpoint = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? 'http://aed.staging.com/graphql';
const endpoint = Platform.OS === 'web' && __DEV__ ? '/graphql-proxy' : commerceEndpoint;
const storeCode = process.env.EXPO_PUBLIC_STORE_CODE ?? 'default';
const useFixtures = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
const allowFallback = process.env.EXPO_PUBLIC_ALLOW_FIXTURE_FALLBACK === 'true';
const checkoutSourceCode = process.env.EXPO_PUBLIC_SOURCE_CODE ?? 'dip_ds';
let customerToken = '';
export const isMockCommerce = useFixtures;
export const setCustomerToken = (token: string) => { customerToken = token; };
async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(endpoint, { method: 'POST', signal: controller.signal, headers: { 'content-type': 'application/json', ...(storeCode !== 'default' ? { store: storeCode } : {}), ...(customerToken ? { authorization: `Bearer ${customerToken}` } : {}) }, body: JSON.stringify({ query, variables }) });
  } catch (error) {
    throw new Error(error instanceof Error && error.name === 'AbortError' ? 'Adobe Commerce took too long to respond.' : 'Could not reach Adobe Commerce. Check the API hostname and device network.');
  } finally {
    clearTimeout(timeout);
  }
  const payload = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (!response.ok || payload.errors?.length || !payload.data) throw new Error(payload.errors?.map((item) => item.message).join('\n') ?? `GraphQL request failed (${response.status})`);
  return payload.data;
}
type MobileApiProduct = { uid: string; sku: string; name: string; url_key: string; brand?: string; product_country?: string; size?: string; stock_status: string; am_product_label?: string; description?: string; small_image?: string; price: number; regular_price: number; discount_percent: number };
const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const mapMobileProduct = (item: MobileApiProduct): Product => ({ uid: item.uid, sku: item.sku, name: item.name.replace(/^\s*-\s*/, ''), urlKey: item.url_key, category: '', brand: item.brand ?? 'A+E', country: item.product_country ?? '', size: item.size ?? '', price: item.price, oldPrice: item.regular_price, discount: Math.round(item.discount_percent), image: item.small_image ? { uri: item.small_image } : require('../../assets/images/splash-icon.png'), images: item.small_image ? [{ uri: item.small_image }] : [], description: stripHtml(item.description), appearance: '', nose: '', taste: '', finish: '', available: item.stock_status === 'IN_STOCK', label: item.am_product_label ?? '' });
const PRODUCT_FIELDS = `uid sku name url_key brand product_country size stock_status am_product_label description small_image price regular_price discount_percent`;
export const PRODUCT_FILTER_QUERY = `query MobileProducts($filter: MobileProductFilterInput, $search: String, $pageSize: Int!, $currentPage: Int!, $sort: MobileProductSortInput) { mobileProducts(filter: $filter, search: $search, pageSize: $pageSize, currentPage: $currentPage, sort: $sort) { total_count items { ${PRODUCT_FIELDS} } } }`;
export async function fetchProducts(filter: ProductFilter = {}, sort: Record<string, 'ASC' | 'DESC'> = {}, pageSize = 20): Promise<Product[]> {
  if (useFixtures) return fixtures.filter((p) => (!filter.search || `${p.name} ${p.brand}`.toLowerCase().includes(filter.search.toLowerCase())));
  const apiFilter: Record<string, unknown> = {};
  if (filter.categoryUid) apiFilter.category_uid = filter.categoryUid;
  if (filter.brand) apiFilter.brand = filter.brand;
  if (filter.country) apiFilter.product_country = filter.country;
  if (filter.maxPrice) apiFilter.max_price = filter.maxPrice;
  apiFilter.in_stock = filter.inStock !== false;
  if (filter.inStock !== false) apiFilter.source_code = filter.sourceCode ?? checkoutSourceCode;
  try {
    const sortField = Object.keys(sort)[0] ?? 'name';
    const data = await graphql<{ mobileProducts: { items: MobileApiProduct[] } }>(PRODUCT_FILTER_QUERY, { filter: apiFilter, search: filter.search || undefined, pageSize, currentPage: 1, sort: { field: sortField, direction: sort[sortField] ?? 'ASC' } });
    return data.mobileProducts.items.map(mapMobileProduct);
  } catch (error) {
    if (!allowFallback) throw error;
    return fixtures.filter((p) => (!filter.categoryUid || filter.categoryUid === 'best-offers' || p.category === filter.categoryUid) && (!filter.search || `${p.name} ${p.brand} ${p.country}`.toLowerCase().includes(filter.search.toLowerCase()))).slice(0, pageSize);
  }
}
export async function fetchProduct(sku: string) { if (useFixtures) return fixtures.find((item) => item.sku === sku); try { const data = await graphql<{ mobileProducts: { items: MobileApiProduct[] } }>(`query Product($sku: String!) { mobileProducts(filter: { sku: $sku, in_stock: false }, pageSize: 1) { items { ${PRODUCT_FIELDS} } } }`, { sku }); return data.mobileProducts.items[0] ? mapMobileProduct(data.mobileProducts.items[0]) : undefined; } catch (error) { if (!allowFallback) throw error; return fixtures.find((item) => item.sku === sku) ?? fixtures[0]; } }
const fixtureCategories = (): Category[] => categoryFixtures.map((item) => ({ id: item.id, uid: item.id, name: item.name, productCount: fixtures.filter((product) => item.id === 'best-offers' || product.category === item.id).length, children: [] }));
export async function fetchCategories(): Promise<Category[]> { if (useFixtures) return fixtureCategories(); try { const data = await graphql<{ categories: { items: { uid: string; name: string; url_key: string; children: { uid: string; name: string; url_key: string }[] }[] } }>(`query MobileCategories { categories(filters: { parent_id: { eq: "2" } }, pageSize: 50) { items { uid name url_key children { uid name url_key } } } }`); return data.categories.items.map((item) => ({ id: item.url_key, uid: item.uid, name: item.name, productCount: 0, children: item.children.map((child) => ({ id: child.url_key, uid: child.uid, name: child.name, productCount: 0, children: [] })) })); } catch (error) { if (!allowFallback) throw error; return fixtureCategories(); } }
export async function fetchSeoRoute(key: string): Promise<SeoRoute> { const url = `${key.replace(/\.html$/, '')}.html`; const data = await graphql<{ route: null | { type: string; uid?: string; sku?: string; name?: string } }>(`query SeoRoute($url: String!) { route(url: $url) { type ... on CategoryTree { uid name } ... on ProductInterface { sku name } } }`, { url }); if (!data.route) throw new Error('This category or product URL does not exist.'); if (data.route.type === 'CATEGORY' && data.route.uid) return { type: 'CATEGORY', uid: data.route.uid, title: data.route.name ?? key }; if (data.route.type === 'PRODUCT' && data.route.sku) return { type: 'PRODUCT', sku: data.route.sku, title: data.route.name ?? key }; throw new Error(`Unsupported Magento route type: ${data.route.type}`); }
export async function fetchCmsPage(identifier: string): Promise<CmsPage> { const data = await graphql<{ cmsPage: { identifier: string; title: string; content_heading: string; content: string } }>(`query CmsPage($identifier: String!) { cmsPage(identifier: $identifier) { identifier title content_heading content } }`, { identifier }); return { identifier: data.cmsPage.identifier, title: data.cmsPage.title, heading: data.cmsPage.content_heading, content: stripHtml(data.cmsPage.content) }; }
export async function fetchHomeBanners(): Promise<Banner[]> { if (useFixtures) return []; try { const config = await graphql<{ storeConfig: { home_slider?: number } }>(`query HomeConfig { storeConfig { home_slider } }`); if (!config.storeConfig.home_slider) return []; const data = await graphql<{ getSliderBanners: { banner_id: string; banner_title: string; banner_url: string; image_mobile: string }[] }>(`query Banners($id: Int) { getSliderBanners(slider_id: $id) { banner_id banner_title banner_url image_mobile } }`, { id: config.storeConfig.home_slider }); return data.getSliderBanners.map((item) => ({ id: item.banner_id, title: item.banner_title, url: item.banner_url, image: item.image_mobile })); } catch (error) { if (!allowFallback) throw error; return []; } }
export async function loginCustomer(email: string, password: string) { const tokenData = await graphql<{ generateCustomerToken: { token: string } }>(`mutation Login($email: String!, $password: String!) { generateCustomerToken(email: $email, password: $password) { token } }`, { email, password }); setCustomerToken(tokenData.generateCustomerToken.token); const data = await graphql<{ customer: { id: string; firstname: string; lastname: string; email: string } }>(`query Customer { customer { id firstname lastname email } }`); return { token: tokenData.generateCustomerToken.token, customer: { id: data.customer.id, firstName: data.customer.firstname, lastName: data.customer.lastname, email: data.customer.email } }; }
export async function registerCustomer(input: Omit<Customer, 'id'> & { password: string }) { await graphql(`mutation Register($input: CustomerCreateInput!) { createCustomerV2(input: $input) { customer { id email } } }`, { input: { firstname: input.firstName, lastname: input.lastName, email: input.email, password: input.password, phone_no: '', zone: '' } }); return loginCustomer(input.email, input.password); }
export async function placeOrder(input: OrderInput): Promise<Order> {
  if (useFixtures) { const total = input.items.reduce((sum, item) => sum + (fixtures.find((p) => p.sku === item.sku)?.price ?? 0) * item.quantity, 0) * 1.05; return { number: `AE-${Date.now().toString().slice(-5)}`, total, deliveryMethod: input.deliveryMethod }; }
  if (!customerToken) throw new Error('Please sign in before placing an order.');
  if (!input.items.length) throw new Error('Your cart is empty.');

  const customerData = await graphql<{ customer: { default_shipping?: string; addresses: { id: number; default_shipping?: boolean; city?: string; area?: string; zone?: string }[] }; customerCart: { id: string; itemsV2: { items: { uid: string; quantity: number; product: { sku: string } }[] } } }>(`query CheckoutCustomer { customer { default_shipping addresses { id default_shipping city area zone } } customerCart { id itemsV2(pageSize: 100) { items { uid quantity product { sku } } } } }`);
  const address = customerData.customer.addresses.find((item) => item.default_shipping || String(item.id) === customerData.customer.default_shipping) ?? customerData.customer.addresses[0];
  if (!address) throw new Error('Add a delivery address to your account before placing an order.');
  const cartId = customerData.customerCart.id;
  const locations = await graphql<{ getPlaceOfDelivery: { items: { location_id: number; location_name: string; location_latitude: string; location_longitude: string }[] } }>(`query DeliveryLocations { getPlaceOfDelivery { items { location_id location_name location_latitude location_longitude } } }`);
  const addressText = `${input.address} ${address.city ?? ''} ${address.area ?? ''} ${address.zone ?? ''}`.toLowerCase();
  const location = locations.getPlaceOfDelivery.items.find((item) => addressText.includes(item.location_name.toLowerCase())) ?? locations.getPlaceOfDelivery.items.find((item) => item.location_name.includes('JVC')) ?? locations.getPlaceOfDelivery.items[0];
  if (!location) throw new Error('No active delivery location is configured.');
  const details = await graphql<{ getPlaceOfDeliveryDetails: { items?: { express?: string; scheduled?: string; click_n_collect?: { source_code: string }[] } } }>(`query DeliverySource($id: Int, $lat: String, $lng: String) { getPlaceOfDeliveryDetails(locationId: $id, lat: $lat, lng: $lng) { items { express scheduled click_n_collect { source_code } } } }`, { id: location.location_id, lat: location.location_latitude, lng: location.location_longitude });
  const deliveryCode = input.deliveryMethod.includes('Scheduled') ? 'scheduled' : input.deliveryMethod.includes('Collect') ? 'click_n_collect' : 'express';
  const sourceCode = deliveryCode === 'scheduled' ? details.getPlaceOfDeliveryDetails.items?.scheduled : deliveryCode === 'express' ? details.getPlaceOfDeliveryDetails.items?.express : details.getPlaceOfDeliveryDetails.items?.click_n_collect?.[0]?.source_code;
  const effectiveDelivery = sourceCode ? deliveryCode : details.getPlaceOfDeliveryDetails.items?.scheduled ? 'scheduled' : details.getPlaceOfDeliveryDetails.items?.express ? 'express' : '';
  const effectiveSource = sourceCode ?? details.getPlaceOfDeliveryDetails.items?.scheduled ?? details.getPlaceOfDeliveryDetails.items?.express;
  if (!effectiveSource || !effectiveDelivery) throw new Error(`No delivery source is configured for ${location.location_name}.`);

  await graphql(`mutation AssignCheckoutSource($cartId: String!, $locationId: Int!, $deliveryType: String!, $sourceCode: String!) { assignCustomerSource(cartId: $cartId, locationId: $locationId, deliveryType: $deliveryType, sourceCode: $sourceCode) }`, { cartId, locationId: location.location_id, deliveryType: effectiveDelivery, sourceCode: effectiveSource });

  const desired = new Map(input.items.map((item) => [item.sku, item.quantity]));
  for (const item of customerData.customerCart.itemsV2.items) {
    const quantity = desired.get(item.product.sku);
    if (!quantity) {
      await graphql(`mutation RemoveOldCartItem($cartId: String!, $uid: ID!) { removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $uid }) { cart { id } } }`, { cartId, uid: item.uid });
    } else if (quantity !== item.quantity) {
      await graphql(`mutation UpdateCartQuantity($cartId: String!, $uid: ID!, $quantity: Float!) { updateCartItems(input: { cart_id: $cartId, cart_items: [{ cart_item_uid: $uid, quantity: $quantity }] }) { cart { id } } }`, { cartId, uid: item.uid, quantity });
    }
  }
  const existing = new Set(customerData.customerCart.itemsV2.items.filter((item) => desired.has(item.product.sku)).map((item) => item.product.sku));
  const missingItems = input.items.filter((item) => !existing.has(item.sku));
  if (missingItems.length) {
    const added = await graphql<{ addProductsToCart: { user_errors: { message: string }[] } }>(`mutation AddCheckoutItems($cartId: String!, $items: [CartItemInput!]!) { addProductsToCart(cartId: $cartId, cartItems: $items) { user_errors { message } cart { id } } }`, { cartId, items: missingItems });
    if (added.addProductsToCart.user_errors.length) throw new Error(added.addProductsToCart.user_errors.map((item) => item.message).join('\n'));
  }

  await graphql(`mutation PrepareAddress($cartId: String!, $addressId: Int!) { setShippingAddressesOnCart(input: { cart_id: $cartId, shipping_addresses: [{ customer_address_id: $addressId }] }) { cart { id } } setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: { same_as_shipping: true } }) { cart { id } } }`, { cartId, addressId: address.id });

  const slots = await graphql<{ searchSlots: { items?: { id: number; is_available: boolean }[] } }>(`query CheckoutSlots($source: String!, $delivery: String!, $location: Int) { searchSlots(filter: { source_code: $source, delivery_type: $delivery, location_id: $location }, slotDays: 7) { items { id is_available } } }`, { source: effectiveSource, delivery: effectiveDelivery, location: location.location_id });
  const slot = slots.searchSlots.items?.find((item) => item.is_available);
  if (slot) await graphql(`mutation SelectSlot($cartId: String!, $slotId: Int!) { setDeliverySlotsOnCart(input: { cart_id: $cartId, slot_id: $slotId }) { success message } }`, { cartId, slotId: slot.id });

  const options = await graphql<{ cart: { shipping_addresses: { available_shipping_methods: { carrier_code: string; method_code: string; available: boolean }[] }[]; available_payment_methods: { code: string; title: string }[]; prices: { grand_total?: { value: number } } } }>(`query CheckoutOptions($cartId: String!) { cart(cart_id: $cartId) { shipping_addresses { available_shipping_methods { carrier_code method_code available } } available_payment_methods { code title } prices { grand_total { value } } } }`, { cartId });
  const shipping = options.cart.shipping_addresses[0]?.available_shipping_methods.find((item) => item.available);
  if (!shipping) throw new Error('Magento returned no available shipping method for this address.');
  const paymentNeedle = input.paymentMethod.toLowerCase().includes('cash') ? 'cash' : 'card';
  const payment = options.cart.available_payment_methods.find((item) => `${item.code} ${item.title}`.toLowerCase().includes(paymentNeedle)) ?? options.cart.available_payment_methods[0];
  if (!payment) throw new Error('Magento returned no available payment method.');
  if (input.coupon?.trim()) await graphql(`mutation Coupon($cartId: String!, $code: String!) { applyCouponToCart(input: { cart_id: $cartId, coupon_code: $code }) { cart { id } } }`, { cartId, code: input.coupon.trim() });
  await graphql(`mutation SelectCheckout($cartId: String!, $carrier: String!, $method: String!, $payment: String!) { setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: [{ carrier_code: $carrier, method_code: $method }] }) { cart { id } } setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $payment } }) { cart { id } } }`, { cartId, carrier: shipping.carrier_code, method: shipping.method_code, payment: payment.code });
  const placed = await graphql<{ placeOrder: { orderV2?: { number: string }; errors: { message: string }[] } }>(`mutation SubmitOrder($cartId: String!) { placeOrder(input: { cart_id: $cartId }) { orderV2 { number } errors { message } } }`, { cartId });
  if (!placed.placeOrder.orderV2?.number) throw new Error(placed.placeOrder.errors[0]?.message ?? 'Magento did not create the order.');
  return { number: placed.placeOrder.orderV2.number, total: options.cart.prices.grand_total?.value ?? 0, deliveryMethod: effectiveDelivery };
}
