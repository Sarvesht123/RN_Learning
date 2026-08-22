import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Pressable style={styles.button} onPress={onDecrease}>
        <Text style={styles.symbol}>−</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable style={styles.button} onPress={onIncrease}>
        <Text style={styles.symbol}>+</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  button: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 21, fontWeight: '700' },
  quantity: { minWidth: 32, textAlign: 'center', fontWeight: '700' },
});
