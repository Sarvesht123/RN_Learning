import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header } from '@/components/Header';
import { colors } from '@/constants/colors';
import type { MainStackParamList } from '@/navigation/types';

export function OrderDetailsScreen({ route }: NativeStackScreenProps<MainStackParamList, 'OrderDetails'>) {
  return <SafeAreaView style={styles.safe}><View style={styles.content}><Header title={`Order #${route.params.orderNumber}`} back /><Text style={styles.copy}>Order detail data will be rendered here from the Magento customer orders query.</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: 16 }, copy: { color: colors.muted, lineHeight: 21, marginTop: 24 } });
