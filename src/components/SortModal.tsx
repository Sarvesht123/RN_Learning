import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export type SortOption =
  'Product Name A-Z' | 'Product Name Z-A' | 'Price High to Low' | 'Price Low to High';
const options: SortOption[] = [
  'Product Name A-Z',
  'Product Name Z-A',
  'Price High to Low',
  'Price Low to High',
];
export function SortModal({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sort by</Text>
          {options.map((option) => (
            <Pressable
              key={option}
              style={styles.option}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={selected === option && styles.selected}>
                {selected === option ? '● ' : '○ '}
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
  },
  title: { fontSize: 21, fontWeight: '900', marginBottom: 10 },
  option: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  selected: { color: colors.primary, fontWeight: '800' },
});
