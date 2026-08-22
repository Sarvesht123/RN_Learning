import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '@/components/BottomTabs';
import { DeliverySelector } from '@/components/DeliverySelector';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { SectionTitle } from '@/components/SectionTitle';
import { colors } from '@/constants/colors';
import { fetchCategories, fetchHomeBanners, fetchProducts } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
import { RequestState } from '@/components/RequestState';
export default function Home() {
  const router = useRouter();
  const [delivery, setDelivery] = useState('2-Hour Express');
  const categoryResult = useCommerce(fetchCategories, []);
  const productResult = useCommerce(() => fetchProducts({}, {}, 8), []);
  const bannerResult = useCommerce(fetchHomeBanners, []);
  const categories = categoryResult.data ?? [];
  const products = productResult.data ?? [];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <DeliverySelector selected={delivery} onSelect={setDelivery} />
        <View style={styles.space}>
          <SearchBar editable={false} />
        </View>
        <HeroBanner title={bannerResult.data?.[0]?.title} image={bannerResult.data?.[0]?.image} />
        <RequestState loading={categoryResult.loading || productResult.loading} error={categoryResult.error || productResult.error} retry={() => { void categoryResult.retry(); void productResult.retry(); }} />
        <SectionTitle title="Shop by category" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.slice(0, 4).map((category) => (
            <Pressable
              key={category.id}
              style={styles.category}
              onPress={() =>
                router.push({ pathname: '/category/[id]', params: { id: category.uid, title: category.name } })
              }
            >
              <Text style={styles.emoji}>◇</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <SectionTitle title="Our Top Picks" subtitle="3 products" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.sku} product={product} compact />
          ))}
        </ScrollView>
        <View style={styles.banner}>
          <HeroBanner promo />
        </View>
        <SectionTitle title="Something different" subtitle="3 products" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {products.slice(4, 7).map((product) => (
            <ProductCard key={product.sku} product={product} compact />
          ))}
        </ScrollView>
      </ScrollView>
      <BottomTabs />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 25 },
  space: { marginVertical: 16 },
  categories: { gap: 10 },
  category: {
    width: 92,
    height: 98,
    backgroundColor: colors.white,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 31 },
  categoryName: { fontSize: 12, fontWeight: '700', marginTop: 7, textAlign: 'center' },
  row: { gap: 10 },
  banner: { marginTop: 24 },
});
