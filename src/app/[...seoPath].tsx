import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryProductList } from '@/app/category/[id]';
import { ProductDetailsView } from '@/app/product/[sku]';
import { Header } from '@/components/Header';
import { RequestState } from '@/components/RequestState';
import { colors } from '@/constants/colors';
import { useCommerce } from '@/hooks/use-commerce';
import { fetchSeoRoute } from '@/services/commerce';

function getUrlKey(seoPath: string | string[] | undefined) {
  const path = Array.isArray(seoPath) ? seoPath.join('/') : seoPath;
  if (!path?.endsWith('.html')) return '';
  return path.slice(0, -'.html'.length);
}

export default function SeoCategoryOrProduct() {
  const { seoPath } = useLocalSearchParams<{ seoPath: string | string[] }>();
  const key = getUrlKey(seoPath);
  const result = useCommerce(() => fetchSeoRoute(key), [key]);

  if (result.data?.type === 'CATEGORY') {
    return <CategoryProductList id={result.data.uid} title={result.data.title} />;
  }
  if (result.data?.type === 'PRODUCT') {
    return <ProductDetailsView sku={result.data.sku} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Header title="Loading" back />
        <RequestState
          loading={result.loading}
          error={key ? result.error : 'Page not found.'}
          retry={result.retry}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16 },
});
