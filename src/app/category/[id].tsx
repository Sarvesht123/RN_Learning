import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { BottomTabs } from '@/components/BottomTabs';
import { FilterModal, Filters } from '@/components/FilterModal';
import { Header } from '@/components/Header';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchBar } from '@/components/SearchBar';
import { SortModal, SortOption } from '@/components/SortModal';
import { colors } from '@/constants/colors';
import { fetchProducts } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
import { RequestState } from '@/components/RequestState';
export default function ProductList() {
  const { id, title = 'Products' } = useLocalSearchParams<{ id: string; title?: string }>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortOption>('Product Name A-Z');
  const sortInput: Record<string, 'ASC' | 'DESC'> = sort === 'Product Name A-Z' ? { name: 'ASC' } : sort === 'Product Name Z-A' ? { name: 'DESC' } : sort === 'Price High to Low' ? { price: 'DESC' } : { price: 'ASC' };
  const result = useCommerce(() => fetchProducts({ categoryUid: id, brand: filters.brand, country: filters.country, maxPrice: filters.maxPrice }, sortInput), [id, filters.brand, filters.country, filters.maxPrice, sort]);
  const displayed = useMemo(() => {
    return (result.data ?? []).filter((product) => !filters.size || product.size === filters.size);
  }, [filters.size, result.data]);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title="Products" back />
        <Text style={styles.location}>📍 Delivering to Dubai Marina</Text>
        <SearchBar editable={false} />
        <View style={styles.heading}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.count}>{displayed.length} products</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={() => setFilterOpen(true)}>
            <Text style={styles.buttonText}>☷ Filter</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => setSortOpen(true)}>
            <Text style={styles.buttonText}>⇅ Sort</Text>
          </Pressable>
        </View>
        <RequestState loading={result.loading} error={result.error} retry={result.retry} />
        <ProductGrid products={displayed.slice(0, 6)} />
      </ScrollView>
      <BottomTabs />
      <FilterModal
        visible={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
      />
      <SortModal
        visible={sortOpen}
        selected={sort}
        onSelect={setSort}
        onClose={() => setSortOpen(false)}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 14, paddingBottom: 24 },
  location: { fontSize: 12, marginBottom: 10 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  title: { fontSize: 25, fontWeight: '900' },
  count: { color: colors.muted, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  button: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { fontWeight: '700' },
});
