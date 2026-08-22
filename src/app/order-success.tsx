import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
export default function OrderSuccess() {
  const { number = '#AE-20481', total = '0.00', delivery = '2-Hour Express' } = useLocalSearchParams<{
    number: string;
    total: string;
    delivery: string;
  }>();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.tick}>✓</Text>
        </View>
        <Text style={styles.thanks}>Thank You!</Text>
        <Text style={styles.success}>Your order was placed successfully.</Text>
        <View style={styles.card}>
          <Row label="Order number" value={number.startsWith('#') ? number : `#${number}`} />
          <Row label="Total" value={`AED ${total}`} />
          <Row label="Delivery address" value="Dubai Marina, Dubai" />
          <Row label="Delivery method" value={delivery} />
        </View>
        <Pressable style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paleGreen },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  icon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tick: { color: colors.white, fontSize: 45 },
  thanks: { fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: 20 },
  success: { textAlign: 'center', color: colors.muted, marginTop: 7, marginBottom: 24 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 17 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.muted, fontSize: 12 },
  value: { fontWeight: '800', marginTop: 3 },
  button: {
    backgroundColor: colors.black,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontWeight: '900' },
});
