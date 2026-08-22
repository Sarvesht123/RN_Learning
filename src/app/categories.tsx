import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '@/components/BottomTabs';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { colors } from '@/constants/colors';
import { fetchCategories } from '@/services/commerce';
import { useCommerce } from '@/hooks/use-commerce';
import { RequestState } from '@/components/RequestState';
export default function Categories() {
  const router = useRouter();
  const result = useCommerce(fetchCategories, []);
  const categories = result.data ?? [];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Header title="Categories" />
        <SearchBar editable={false} />
        <Text style={styles.title}>Browse all categories</Text>
        <RequestState loading={result.loading} error={result.error} retry={result.retry} />
        <ScrollView>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.item}
              onPress={() =>
                router.push(`/${category.id}.html` as never)
              }
            >
              <View style={styles.icon}>
                <Text style={styles.emoji}>◇</Text>
              </View>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.count}>{category.productCount}</Text>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <BottomTabs />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '900', marginVertical: 20 },
  item: {
    height: 76,
    backgroundColor: colors.white,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.paleRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 25 },
  name: { flex: 1, fontSize: 17, fontWeight: '700', marginLeft: 14 },
  count: { color: colors.muted, marginRight: 8 },
  arrow: { fontSize: 30, color: colors.muted },
});
