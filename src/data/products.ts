import { ImageSourcePropType } from 'react-native';
export type Product = {
  uid?: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  country: string;
  size: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: ImageSourcePropType;
  description: string;
  appearance: string;
  nose: string;
  taste: string;
  finish: string;
  images?: ImageSourcePropType[];
  available?: boolean;
  label?: string;
};
const bottle = require('../../assets/images/splash-icon.png');
export const products: Product[] = [
  {
    sku: 'WINE-001',
    name: 'Château Rouge Reserve',
    category: 'wine',
    brand: 'Château Rouge',
    country: 'France',
    size: '750ml',
    price: 89,
    oldPrice: 110,
    discount: 19,
    image: bottle,
    description: 'A smooth, approachable red made for relaxed dinners and sharing.',
    appearance: 'Deep ruby red.',
    nose: 'Ripe berries and soft spice.',
    taste: 'Plum, cherry and gentle oak.',
    finish: 'Long and balanced.',
  },
  {
    sku: 'WINE-002',
    name: 'Cloud Valley Sauvignon Blanc',
    category: 'wine',
    brand: 'Cloud Valley',
    country: 'New Zealand',
    size: '750ml',
    price: 72,
    oldPrice: 85,
    discount: 15,
    image: bottle,
    description: 'A bright and refreshing white with lively fruit character.',
    appearance: 'Pale straw.',
    nose: 'Citrus and fresh herbs.',
    taste: 'Lime, apple and passion fruit.',
    finish: 'Clean and crisp.',
  },
  {
    sku: 'SPIRIT-001',
    name: 'Highland Oak Whisky',
    category: 'spirits',
    brand: 'Highland Oak',
    country: 'Scotland',
    size: '700ml',
    price: 145,
    oldPrice: 175,
    discount: 17,
    image: bottle,
    description: 'An easy-drinking whisky with mellow oak and honey notes.',
    appearance: 'Warm amber.',
    nose: 'Honey, vanilla and oak.',
    taste: 'Caramel and toasted spice.',
    finish: 'Warm and lingering.',
  },
  {
    sku: 'SPIRIT-002',
    name: 'Silver Coast Dry Gin',
    category: 'spirits',
    brand: 'Silver Coast',
    country: 'England',
    size: '700ml',
    price: 99,
    oldPrice: 118,
    discount: 16,
    image: bottle,
    description: 'Classic dry gin with fresh botanicals and a citrus lift.',
    appearance: 'Crystal clear.',
    nose: 'Juniper and lemon peel.',
    taste: 'Citrus, herbs and pepper.',
    finish: 'Dry and refreshing.',
  },
  {
    sku: 'BEER-001',
    name: 'Harbour Craft Lager 6 Pack',
    category: 'beer-cider',
    brand: 'Harbour Craft',
    country: 'Germany',
    size: '6 x 330ml',
    price: 48,
    oldPrice: 58,
    discount: 17,
    image: bottle,
    description: 'A clean golden lager with a light malt body.',
    appearance: 'Bright gold.',
    nose: 'Fresh grain and hops.',
    taste: 'Crisp malt and mild bitterness.',
    finish: 'Light and clean.',
  },
  {
    sku: 'BEER-002',
    name: 'Orchard Apple Cider 4 Pack',
    category: 'beer-cider',
    brand: 'Orchard House',
    country: 'Ireland',
    size: '4 x 330ml',
    price: 44,
    oldPrice: 52,
    discount: 15,
    image: bottle,
    description: 'A juicy apple cider with balanced sweetness.',
    appearance: 'Golden amber.',
    nose: 'Fresh green apple.',
    taste: 'Crisp apple and subtle pear.',
    finish: 'Gently sweet.',
  },
  {
    sku: 'CHAMP-001',
    name: 'Maison Étoile Brut',
    category: 'champagne',
    brand: 'Maison Étoile',
    country: 'France',
    size: '750ml',
    price: 210,
    oldPrice: 250,
    discount: 16,
    image: bottle,
    description: 'Elegant sparkling wine for celebrations and special moments.',
    appearance: 'Fine golden bubbles.',
    nose: 'Brioche and citrus.',
    taste: 'Apple, lemon and almond.',
    finish: 'Fresh and elegant.',
  },
  {
    sku: 'WINE-003',
    name: 'Sunset Rosé',
    category: 'wine',
    brand: 'Sunset Estate',
    country: 'Spain',
    size: '750ml',
    price: 65,
    oldPrice: 79,
    discount: 18,
    image: bottle,
    description: 'A light rosé with delicate red fruit flavours.',
    appearance: 'Soft salmon pink.',
    nose: 'Strawberry and flowers.',
    taste: 'Red berries and citrus.',
    finish: 'Dry and delicate.',
  },
];
export const getProduct = (sku?: string) => products.find((product) => product.sku === sku);
