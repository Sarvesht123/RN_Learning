import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';

import AccountScreen from '@/screens/Account/AccountScreen';
import CartScreen from '@/screens/Cart/CartScreen';
import CategoriesScreen from '@/screens/Category/CategoriesScreen';
import HomeScreen from '@/screens/Home/HomeScreen';
import InfoScreen from '@/screens/Info/InfoScreen';
import { colors } from '@/constants/colors';
import type { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const icons: Record<keyof BottomTabParamList, string> = { Home: '⌂', Categories: '▦', Cart: '🛒', Account: '♙', Info: 'ⓘ' };
function TabIcon({ name, color }: { name: keyof BottomTabParamList; color: string }) {
  return <Text style={[styles.icon, color === colors.white ? styles.active : styles.inactive]}>{icons[name]}</Text>;
}
const tabScreenOptions = ({ route }: { route: { name: keyof BottomTabParamList } }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.white,
  tabBarInactiveTintColor: '#aaa',
  tabBarStyle: { backgroundColor: colors.black, height: 68, paddingBottom: 4 },
  tabBarIcon: ({ color }: { color: string }) => <TabIcon name={route.name} color={color} />,
});

export function BottomTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Info" component={InfoScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({ icon: { fontSize: 20 }, active: { color: colors.white }, inactive: { color: '#aaa' } });
