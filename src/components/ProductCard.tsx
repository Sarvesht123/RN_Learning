import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '@/data/products';
import { colors } from '@/constants/colors';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const category = product.category.replace('-', ' & ');
  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={() => router.push({ pathname: '/product/[sku]', params: { sku: product.sku } })}
    >
      <View style={styles.imageWrap}>
        <Image source={product.image} style={styles.image} resizeMode="contain" />
        <Text style={styles.discount}>-{product.discount}%</Text>
        <Pressable style={styles.heart} onPress={(event) => { event.stopPropagation(); toggle(product.sku); }}>
          <Text style={[styles.heartText, has(product.sku) && styles.saved]}>{has(product.sku) ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.meta}>
        {category} · {product.country} · {product.size}
      </Text>
      <Text style={[styles.stock, product.available === false && styles.out]}>{product.available === false ? '● Unavailable' : '● In stock'}</Text>
      <View style={styles.bottom}>
        <View>
          <Text style={styles.price}>AED {product.price.toFixed(2)}</Text>
          <Text style={styles.old}>AED {product.oldPrice.toFixed(2)}</Text>
        </View>
        <Pressable
          style={styles.add}
          onPress={(event) => {
            event.stopPropagation();
            addItem(product);
          }}
        >
          <Text style={styles.plus}>+</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  compact: { width: 168 },
  imageWrap: {
    height: 128,
    backgroundColor: '#faf6f2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: 90, height: 100 },
  discount: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '800',
  },
  heart: { position: 'absolute', right: 5, top: 2, padding: 4 },
  heartText: { fontSize: 24 },
  saved: { color: colors.primary },
  name: { minHeight: 38, fontSize: 14, lineHeight: 18, fontWeight: '700', marginTop: 9 },
  meta: { fontSize: 10, color: colors.muted, marginVertical: 5 },
  stock: { fontSize: 10, color: colors.success, marginBottom: 6, fontWeight: '700' },
  out: { color: colors.primary },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { fontSize: 13, fontWeight: '800' },
  old: { fontSize: 10, color: colors.muted, textDecorationLine: 'line-through', marginTop: 2 },
  add: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { color: colors.white, fontSize: 22 },
});
