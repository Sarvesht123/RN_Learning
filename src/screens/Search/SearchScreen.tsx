import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchBar } from '@/components/SearchBar';
import { SectionTitle } from '@/components/SectionTitle';
import { colors } from '@/constants/colors';
import { fetchProducts } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
import { RequestState } from '@/components/RequestState';
export default function Search() {
  const [query, setQuery] = useState('');
  const result = useCommerce(() => fetchProducts(query ? { search: query } : {}, {}, query ? 30 : 3), [query]);
  const results = result.data ?? [];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Header title="Search" back />
        <SearchBar value={query} onChangeText={setQuery} />
        {query ? (
          <>
            <SectionTitle title="Results" subtitle={`${results.length} found`} />
            <RequestState loading={result.loading} error={result.error} retry={result.retry} />
            <ProductGrid products={results} />
          </>
        ) : (
          <>
            <SectionTitle title="Recently searched" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              {results.slice(0, 3).map((product) => (
                <ProductCard key={product.sku} product={product} compact />
              ))}
            </ScrollView>
            <SectionTitle title="Trending searches" />
            <View style={styles.tags}>
              {['Red wine', 'Whisky', 'Champagne', 'Craft beer'].map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  row: { gap: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  tag: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
