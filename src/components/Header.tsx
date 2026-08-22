import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
export function Header({ title = 'A+E', back = false }: { title?: string; back?: boolean }) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable onPress={() => router.back()} style={styles.action}>
          <Text style={styles.icon}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.action} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={() => router.push('/search')} style={styles.action}>
        <Text style={styles.search}>⌕</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  action: { width: 44, alignItems: 'center' },
  icon: { fontSize: 36, color: colors.black },
  search: { fontSize: 28 },
  title: { fontSize: 22, fontWeight: '900', color: colors.primary },
});
