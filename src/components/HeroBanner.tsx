import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
export function HeroBanner({ promo = false, title, image }: { promo?: boolean; title?: string; image?: string }) {
  const content = (
    <View style={[styles.banner, promo && styles.promo]}>
      <View>
        <Text style={styles.kicker}>{promo ? 'WEEKEND SPECIAL' : 'EXPRESS DELIVERY'}</Text>
        <Text style={styles.title}>
          {title || (promo ? 'Save on selected favourites' : 'Great bottles, at your door')}
        </Text>
        <Text style={styles.sub}>
          {promo ? 'Offers while stocks last' : 'Delivered in as little as 2 hours'}
        </Text>
      </View>
      <Text style={styles.emoji}>{promo ? '🏷️' : '🍾'}</Text>
    </View>
  );
  return image ? <ImageBackground source={{ uri: image }} imageStyle={styles.backgroundImage} style={styles.background}>{content}</ImageBackground> : content;
}
const styles = StyleSheet.create({
  banner: {
    minHeight: 145,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promo: { backgroundColor: '#303030' },
  kicker: { color: '#ffd8dc', fontSize: 11, fontWeight: '800' },
  title: { color: colors.white, fontSize: 23, fontWeight: '900', maxWidth: 230, marginVertical: 7 },
  sub: { color: '#eee', fontSize: 12 },
  emoji: { fontSize: 58 },
  background: { borderRadius: 18, overflow: 'hidden' },
  backgroundImage: { borderRadius: 18 },
});
