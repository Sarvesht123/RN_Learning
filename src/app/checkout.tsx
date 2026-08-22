import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DeliverySelector } from '@/components/DeliverySelector';
import { Header } from '@/components/Header';
import { OrderSummary } from '@/components/OrderSummary';
import { useCart } from '@/context/CartContext';
import { colors } from '@/constants/colors';
import { placeOrder } from '@/services/commerce';
export default function Checkout() {
  const [delivery, setDelivery] = useState('2-Hour Express');
  const [slot, setSlot] = useState('Tomorrow · 10 AM');
  const [payment, setPayment] = useState('Card on delivery');
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { items, clearCart } = useCart();
  const router = useRouter();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const submit = async () => {
    try {
      setBusy(true); setError('');
      const order = await placeOrder({ items: items.map(({ sku, quantity }) => ({ sku, quantity })), address: 'Dubai Marina, Dubai', phone: '+971 50 123 4567', deliveryMethod: delivery, paymentMethod: payment, coupon });
      clearCart();
      router.replace({ pathname: '/order-success', params: { number: order.number, total: order.total.toFixed(2), delivery: order.deliveryMethod } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not place order'); } finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Header title="Checkout" back />
        <View style={styles.card}>
          <DeliverySelector selected={delivery} onSelect={setDelivery} />
        </View>
        {delivery === 'Scheduled Delivery' && (
          <View style={styles.card}>
            <Text style={styles.heading}>Choose a simple delivery slot</Text>
            <View style={styles.options}>
              {['Tomorrow · 10 AM', 'Tomorrow · 2 PM', 'Saturday · 6 PM'].map((option) => (
                <Pressable
                  key={option}
                  style={[styles.option, slot === option && styles.optionSelected]}
                  onPress={() => setSlot(option)}
                >
                  <Text style={slot === option && styles.selected}>
                    {slot === option ? '● ' : '○ '}
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <Field label="Delivery Location" value="Dubai Marina, Dubai" />
        <Field label="Mobile Number" value="+971 50 123 4567" keyboardType="phone-pad" />
        <View style={styles.card}>
          <Text style={styles.heading}>Payment Method</Text>
          {['Card on delivery', 'Cash on delivery'].map((method) => (
            <Pressable key={method} style={styles.radio} onPress={() => setPayment(method)}>
              <Text style={payment === method && styles.selected}>
                {payment === method ? '●' : '○'} {method}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.card}><Text style={styles.label}>Coupon</Text><TextInput style={styles.input} value={coupon} onChangeText={setCoupon} placeholder="Try SAVE10" /></View>
        <OrderSummary subtotal={subtotal} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.place, (!items.length || busy) && styles.disabled]}
          disabled={!items.length || busy}
          onPress={submit}
        >
          {busy ? <ActivityIndicator color="white" /> : <Text style={styles.placeText}>Place Order</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
function Field({
  label,
  value,
  placeholder,
  keyboardType,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  keyboardType?: 'phone-pad';
}) {
  const [text, setText] = useState(value ?? '');
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 15, marginBottom: 11 },
  heading: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  label: { color: colors.muted, fontSize: 12, marginBottom: 5 },
  input: { height: 42, borderBottomWidth: 1, borderBottomColor: colors.border, fontSize: 15 },
  options: { gap: 8 },
  option: { borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 11 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.paleRed },
  radio: { paddingVertical: 10 },
  selected: { color: colors.primary, fontWeight: '800' },
  place: {
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  placeText: { color: colors.white, fontWeight: '900', fontSize: 17 },
  disabled: { opacity: 0.45 },
  error: { color: colors.primary, marginTop: 10 },
});
