import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '@/components/BottomTabs';
import { Header } from '@/components/Header';
import { OrderSummary } from '@/components/OrderSummary';
import { ProductCard } from '@/components/ProductCard';
import { QuantitySelector } from '@/components/QuantitySelector';
import { SectionTitle } from '@/components/SectionTitle';
import { useCart } from '@/context/CartContext';
import { colors } from '@/constants/colors';
import { fetchProducts } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
export default function Cart() {
  const { items, changeQuantity, removeItem } = useCart();
  const [coupon, setCoupon] = useState('');
  const router = useRouter();
  const recommendations = useCommerce(() => fetchProducts({}, {}, 2), []);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon.trim().toUpperCase() === 'SAVE10' ? 10 : 0;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title="My Cart" />
        {items.length === 0 && <Text style={styles.empty}>Your cart is empty.</Text>}
        {items.map((item) => (
          <View key={item.sku} style={styles.item}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <View style={styles.detail}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.prices}>
                <Text style={styles.price}>AED {item.price.toFixed(2)}</Text>
                <Text style={styles.old}>AED {item.oldPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.itemBottom}>
                <QuantitySelector
                  quantity={item.quantity}
                  onDecrease={() => changeQuantity(item.sku, -1)}
                  onIncrease={() => changeQuantity(item.sku, 1)}
                />
                <Pressable onPress={() => removeItem(item.sku)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.coupon}>
          <TextInput
            style={styles.couponInput}
            value={coupon}
            onChangeText={setCoupon}
            placeholder="Coupon code (try SAVE10)"
            autoCapitalize="characters"
          />
          <Text style={styles.apply}>Apply</Text>
        </View>
        <OrderSummary subtotal={subtotal} discount={discount} />
        <Pressable
          disabled={!items.length}
          style={[styles.checkout, !items.length && styles.disabled]}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </Pressable>
        <SectionTitle title="You may also like" />
        <View style={styles.recommend}>
          {(recommendations.data ?? []).slice(0, 2).map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </View>
      </ScrollView>
      <BottomTabs />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
  empty: { textAlign: 'center', marginVertical: 40, color: colors.muted },
  item: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 11,
    marginBottom: 10,
  },
  image: { width: 92, height: 110, backgroundColor: '#faf6f2', borderRadius: 9 },
  detail: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '800', fontSize: 15 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginVertical: 8 },
  price: { fontWeight: '900' },
  old: { color: colors.muted, textDecorationLine: 'line-through', fontSize: 11 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remove: { color: colors.primary, textDecorationLine: 'underline', fontSize: 12 },
  coupon: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  couponInput: { height: 48, flex: 1 },
  apply: { color: colors.primary, fontWeight: '800' },
  checkout: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  disabled: { opacity: 0.4 },
  checkoutText: { color: colors.white, fontWeight: '900', fontSize: 16 },
  recommend: { flexDirection: 'row', justifyContent: 'space-between' },
});
