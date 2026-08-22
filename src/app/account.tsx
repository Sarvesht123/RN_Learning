import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '@/components/BottomTabs';
import { Header } from '@/components/Header';
import { colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useCustomer } from '@/context/CustomerContext';
export default function Account() {
  const router = useRouter();
  const { customer, signOut } = useCustomer();
  const items = customer
    ? [{ label: 'My Orders', path: '/orders' }, { label: 'Wishlist', path: '/wishlist' }, { label: 'Addresses', path: '/info' }]
    : [{ label: 'Sign In', path: '/login' }, { label: 'Create Account', path: '/register' }, { label: 'Wishlist', path: '/wishlist' }];
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Header title="My Account" />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer?.firstName[0] ?? 'A'}</Text>
        </View>
        <Text style={styles.title}>{customer ? `${customer.firstName} ${customer.lastName}` : 'My Account'}</Text>
        {customer ? <Text style={styles.email}>{customer.email}</Text> : null}
        {items.map((item) => (
          <Pressable key={item.label} style={styles.item} onPress={() => router.push(item.path as never)}>
            <Text style={styles.itemText}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
        {customer ? <Pressable style={styles.signOut} onPress={signOut}><Text style={styles.signOutText}>Sign Out</Text></Pressable> : null}
      </View>
      <BottomTabs />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 22,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '900' },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '900', marginVertical: 18 },
  email: { textAlign: 'center', color: colors.muted, marginTop: -12, marginBottom: 18 },
  item: {
    height: 60,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemText: { flex: 1, fontWeight: '700' },
  arrow: { fontSize: 28, color: colors.muted },
  signOut: { alignItems: 'center', padding: 14 },
  signOutText: { color: colors.primary, fontWeight: '800' },
});
