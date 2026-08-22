import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
export function SearchBar({
  value,
  onChangeText,
  editable = true,
}: {
  value?: string;
  onChangeText?: (value: string) => void;
  editable?: boolean;
}) {
  const router = useRouter();
  const input = (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        placeholder="Search products"
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
      />
    </View>
  );
  return editable ? input : <Pressable onPress={() => router.push('/search')}>{input}</Pressable>;
}
const styles = StyleSheet.create({
  wrap: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  icon: { fontSize: 24, marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: colors.black },
});
