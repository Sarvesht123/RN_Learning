import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
const tabs = [
  { label: 'Home', icon: '⌂', path: '/' },
  { label: 'Categories', icon: '▦', path: '/categories' },
  { label: 'Cart', icon: '🛒', path: '/cart' },
  { label: 'Account', icon: '♙', path: '/account' },
  { label: 'Info', icon: 'ⓘ', path: '/info' },
] as const;
export function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const active =
          pathname === tab.path ||
          (tab.path === '/categories' && pathname.startsWith('/category/'));
        return (
          <Pressable key={tab.label} style={styles.tab} onPress={() => router.navigate(tab.path)}>
            <Text style={[styles.icon, active && styles.active]}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.active]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  bar: { height: 68, backgroundColor: colors.black, flexDirection: 'row', paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { color: colors.white, fontSize: 20 },
  label: { color: '#aaa', fontSize: 11, marginTop: 3 },
  active: { color: colors.white, fontWeight: '800' },
});
