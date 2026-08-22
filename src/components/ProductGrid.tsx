import { StyleSheet, View } from 'react-native';
import { Product } from '@/data/products';
import { ProductCard } from './ProductCard';
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
});
