import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export function OrderSummary({ subtotal, discount = 0 }: { subtotal: number; discount?: number }) {
  const vat = subtotal * 0.05;
  const total = subtotal + vat - discount;
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Order Summary</Text>
      <Row label="Subtotal" value={subtotal} />
      <Row label="VAT (5%)" value={vat} />
      <Row label="Discount" value={-discount} />
      <View style={styles.line} />
      <Row label="Total" value={total} bold />
    </View>
  );
}
function Row({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={bold && styles.bold}>{label}</Text>
      <Text style={bold && styles.bold}>AED {value.toFixed(2)}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 16 },
  heading: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  line: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  bold: { fontWeight: '900', fontSize: 17 },
});
