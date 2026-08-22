import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useCart } from '@/context/CartContext';
import { colors } from '@/constants/colors';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProduct, fetchProducts } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
import { RequestState } from '@/components/RequestState';
export default function ProductDetails() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  return <ProductDetailsView sku={sku} />;
}
export function ProductDetailsView({ sku }: { sku: string }) {
  const result = useCommerce(() => fetchProduct(sku), [sku]);
  const related = useCommerce(() => fetchProducts({}, {}, 3), [sku]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();
  const { has, toggle } = useWishlist();
  const product = result.data;
  if (!product) return <SafeAreaView style={styles.safe}><Header title="Product" back /><RequestState loading={result.loading} error={result.error || 'Product not found'} retry={result.retry} /></SafeAreaView>;
  const add = () => {
    for (let i = 0; i < quantity; i += 1) addItem(product);
    router.push('/cart');
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title="Product" back />
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.imageWrap}>
          <Image source={product.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.badge}>-{product.discount}%</Text>
          <Pressable style={styles.heart} onPress={() => toggle(product.sku)}><Text style={[styles.heartText, has(product.sku) && styles.saved]}>{has(product.sku) ? '♥' : '♡'}</Text></Pressable>
        </View>
        <View style={styles.thumbs}>
          <View style={styles.thumb}>
            <Image source={product.image} style={styles.thumbImage} resizeMode="contain" />
          </View>
          <View style={styles.thumb}>
            <Image source={product.image} style={styles.thumbImage} resizeMode="contain" />
          </View>
        </View>
        <Text style={styles.brand}>
          {product.brand} · {product.country}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>AED {product.price.toFixed(2)}</Text>
          <Text style={styles.old}>AED {product.oldPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.buy}>
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity(Math.max(1, quantity - 1))}
            onIncrease={() => setQuantity(quantity + 1)}
          />
          <Pressable style={styles.add} onPress={add}>
            <Text style={styles.addText}>Add to Cart</Text>
          </Pressable>
        </View>
        <Info title="Description" text={product.description} />
        <Info title="Appearance" text={product.appearance} />
        <Info title="Nose" text={product.nose} />
        <Info title="Taste" text={product.taste} />
        <Info title="Finish" text={product.finish} />
        <Text style={styles.section}>You may also like</Text>
        <View style={styles.recommend}>
          {(related.data ?? [])
            .filter((item) => item.sku !== product.sku)
            .slice(0, 2)
            .map((item) => (
              <ProductCard key={item.sku} product={item} />
            ))}
        </View>
        <Text style={styles.section}>Recently viewed</Text>
        <Text style={styles.recent}>This item is now in the local recently-viewed example. A production app would store SKUs per customer or device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
function Info({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', marginVertical: 10 },
  imageWrap: {
    height: 300,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 220, height: 240 },
  badge: {
    position: 'absolute',
    left: 14,
    top: 14,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 7,
    padding: 7,
    fontWeight: '800',
  },
  heart: { position: 'absolute', right: 12, top: 6, padding: 6 },
  heartText: { fontSize: 34 },
  saved: { color: colors.primary },
  thumbs: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  thumb: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  thumbImage: { width: '100%', height: '100%' },
  brand: { color: colors.muted, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginVertical: 10 },
  price: { fontSize: 25, fontWeight: '900' },
  old: { color: colors.muted, textDecorationLine: 'line-through' },
  buy: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  add: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: colors.white, fontWeight: '900' },
  info: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  infoText: { color: colors.muted, lineHeight: 20 },
  section: { fontSize: 20, fontWeight: '900', marginVertical: 16 },
  recommend: { flexDirection: 'row', justifyContent: 'space-between' },
  recent: { color: colors.muted, lineHeight: 20 },
});
