import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export const deliveryMethods = ['2-Hour Express', 'Scheduled Delivery', 'Click & Collect'];
export function DeliverySelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>Delivery method</Text>
      <View style={styles.row}>
        {deliveryMethods.map((method) => (
          <Pressable
            key={method}
            style={[styles.pill, selected === method && styles.selected]}
            onPress={() => onSelect(method)}
          >
            <Text style={[styles.text, selected === method && styles.selectedText]}>{method}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.location}>📍 Dubai Marina, Dubai</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  label: { fontSize: 12, color: colors.muted, marginBottom: 7 },
  row: { flexDirection: 'row', gap: 6 },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.paleRed },
  text: { fontSize: 10, textAlign: 'center', color: colors.muted },
  selectedText: { color: colors.primary, fontWeight: '700' },
  location: { fontSize: 13, fontWeight: '600', marginTop: 11 },
});
