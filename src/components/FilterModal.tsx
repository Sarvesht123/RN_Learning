import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export type Filters = {
  category?: string;
  brand?: string;
  country?: string;
  size?: string;
  maxPrice?: number;
};
const groups = [
  { title: 'Categories', key: 'category', options: ['Wine', 'Spirits', 'Beer & Cider'] },
  {
    title: 'Price Range',
    key: 'maxPrice',
    options: ['Under AED 75', 'Under AED 125', 'Under AED 200'],
  },
  { title: 'Brand', key: 'brand', options: ['Château Rouge', 'Cloud Valley', 'Highland Oak'] },
  { title: 'Country', key: 'country', options: ['France', 'Scotland', 'Germany'] },
  { title: 'Size', key: 'size', options: ['750ml', '700ml', '6 x 330ml'] },
];
export function FilterModal({
  visible,
  filters,
  onChange,
  onClose,
}: {
  visible: boolean;
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
}) {
  const choose = (key: string, option: string) => {
    const value = key === 'category' ? option.toLowerCase().replace(' & ', '-') : option;
    if (key === 'maxPrice') {
      const maxPrice = Number(option.match(/\d+/)?.[0]);
      onChange({ ...filters, maxPrice: filters.maxPrice === maxPrice ? undefined : maxPrice });
    } else
      onChange({ ...filters, [key]: filters[key as keyof Filters] === value ? undefined : value });
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.top}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <ScrollView>
            {groups.map((group) => (
              <View key={group.title} style={styles.group}>
                <Text style={styles.heading}>{group.title}</Text>
                <View style={styles.options}>
                  {group.options.map((option) => {
                    const value =
                      group.key === 'category' ? option.toLowerCase().replace(' & ', '-') : option;
                    const selected =
                      group.key === 'maxPrice'
                        ? filters.maxPrice === Number(option.match(/\d+/)?.[0])
                        : filters[group.key as keyof Filters] === value;
                    return (
                      <Pressable
                        key={option}
                        style={[styles.option, selected && styles.optionSelected]}
                        onPress={() => choose(group.key, option)}
                      >
                        <Text style={selected && styles.optionTextSelected}>{option}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable style={styles.clear} onPress={() => onChange({})}>
              <Text>Clear</Text>
            </Pressable>
            <Pressable style={styles.apply} onPress={onClose}>
              <Text style={styles.applyText}>Show Results</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900' },
  close: { fontSize: 30 },
  group: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  heading: { fontWeight: '800', marginBottom: 9 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { padding: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.paleRed },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  clear: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  apply: {
    flex: 2,
    padding: 14,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  applyText: { color: colors.white, fontWeight: '800' },
});
