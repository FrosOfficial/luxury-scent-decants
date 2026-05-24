export type ScentProfile = 
  | 'Aldehydic' | 'Amber' | 'Animalic' | 'Aquatic' | 'Aromatic' | 'Balsamic' 
  | 'Cinnamon' | 'Citrus' | 'Coconut' | 'Coffee' | 'Earthy' | 'Floral' 
  | 'Fresh' | 'Fresh Spicy' | 'Fruity' | 'Gourmand' | 'Green' | 'Iris' | 'Lactonic' 
  | 'Lavender' | 'Leather' | 'Marine' | 'Metallic' | 'Mossy' | 'Musky' 
  | 'Oud' | 'Ozonic' | 'Patchouli' | 'Powdery' | 'Rose' | 'Savory' 
  | 'Smoky' | 'Soft Spicy' | 'Spicy' | 'Sweet' | 'Tobacco' | 'Tropical' | 'Vanilla' 
  | 'Violet' | 'Warm Spicy' | 'White Floral' | 'Woody' | 'Yellow Floral';
export type Demographic = 'Masculine' | 'Feminine' | 'Unisex';
  
export interface VolumePricing {
  id?: string;
  size: '2ml' | '3ml' | '5ml' | '10ml' | '15ml' | '30ml';
  price: number;
}
  
export interface MainAccord {
  name: string;
  percentage: number;
}
  
export interface Product {
  id: string;
  name: string;
  brand: string;
  scentProfile: ScentProfile;
  demographic: Demographic;
  volumes: VolumePricing[];
  image: string;
  mainAccords: MainAccord[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  performance: {
    longevity: string;
    sillage: string;
  };
  usage: {
    day: boolean;
    night: boolean;
    seasons: {
      spring: boolean;
      summer: boolean;
      autumn: boolean;
      winter: boolean;
    };
  };
  rating: number;
  ratingCount: number;
}
  
export const products: Product[] = [
  {
    id: '1',
    name: "9 PM Night Out",
    brand: "Afnan",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 96 },
      { size: '3ml', price: 144 },
      { size: '5ml', price: 240 },
      { size: '10ml', price: 432 },
      { size: '15ml', price: 648 },
      { size: '30ml', price: 1248 }
    ],
    image: '/Images/afnan-9-pm-night-out.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Warm Spicy', percentage: 95 },
      { name: 'Fruity', percentage: 93 },
      { name: 'Sweet', percentage: 87 },
      { name: 'Aromatic', percentage: 84 }
    ],
    notes: {
      top: ['Pitahaya', 'Lavender', 'Cognac', 'Suede'],
      middle: ['Tonka Bean'],
      base: ['Tonka Bean', 'Toffee'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.4,
    ratingCount: 1090,
  },
  {
    id: '2',
    name: "9AM DIVE",
    brand: "Afnan",
    scentProfile: 'Aquatic',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 76 },
      { size: '3ml', price: 114 },
      { size: '5ml', price: 190 },
      { size: '10ml', price: 342 },
      { size: '15ml', price: 513 },
      { size: '30ml', price: 988 }
    ],
    image: '/Images/afnan-9am-dive.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Green', percentage: 95 },
      { name: 'Woody', percentage: 92 },
      { name: 'Fresh Spicy', percentage: 86 },
      { name: 'Citrus', percentage: 84 }
    ],
    notes: {
      top: ['Lemon', 'Apple', 'Mint'],
      middle: ['Ginger', 'Black Currant'],
      base: ['Cedar'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.2,
    ratingCount: 3129,
  },
  {
    id: '3',
    name: "Cloud",
    brand: "Ariana Grande",
    scentProfile: 'Gourmand',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/ariana-grande-cloud.webp',
    mainAccords: [
      { name: 'Sweet', percentage: 100 },
      { name: 'Lactonic', percentage: 78 },
      { name: 'Vanilla', percentage: 76 },
      { name: 'Coconut', percentage: 72 },
      { name: 'Musky', percentage: 68 }
    ],
    notes: {
      top: ['Coconut', 'Lavender', 'Pear'],
      middle: ['Coconut'],
      base: ['Cream', 'Praline', 'Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4,
    ratingCount: 16884,
  },
  {
    id: '4',
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    scentProfile: 'Woody',
    demographic: 'Masculine',
    volumes: [
      { size: '2ml', price: 120 },
      { size: '3ml', price: 180 },
      { size: '5ml', price: 300 },
      { size: '10ml', price: 540 },
      { size: '15ml', price: 810 },
      { size: '30ml', price: 1560 }
    ],
    image: '/Images/armaf-club-de-nuit-intense-man.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fruity', percentage: 83 },
      { name: 'Leather', percentage: 78 },
      { name: 'Smoky', percentage: 74 },
      { name: 'Woody', percentage: 73 }
    ],
    notes: {
      top: ['Lemon', 'Birch', 'Pineapple', 'Bergamot', 'Black Currant'],
      middle: ['Birch'],
      base: ['Musk'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.1,
    ratingCount: 26465,
  },
  {
    id: '5',
    name: "Club de Nuit Untold",
    brand: "Armaf",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/armaf-club-de-nuit-untold.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Amber', percentage: 98 },
      { name: 'Warm Spicy', percentage: 85 },
      { name: 'Metallic', percentage: 70 },
      { name: 'White Floral', percentage: 68 }
    ],
    notes: {
      top: ['Saffron'],
      middle: ['Saffron', 'Jasmine'],
      base: ['Amberwood', 'Ambergris', 'Fir', 'Cedar'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: true, summer: true, autumn: true, winter: true } },
    rating: 4.1,
    ratingCount: 3132,
  },
  {
    id: '6',
    name: "Club De Nuit Urban Elixir",
    brand: "Armaf",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 96 },
      { size: '3ml', price: 144 },
      { size: '5ml', price: 240 },
      { size: '10ml', price: 432 },
      { size: '15ml', price: 648 },
      { size: '30ml', price: 1248 }
    ],
    image: '/Images/armaf-club-de-nuit-urban-elixir.webp',
    mainAccords: [
      { name: 'Amber', percentage: 100 },
      { name: 'Aromatic', percentage: 90 },
      { name: 'Citrus', percentage: 85 },
      { name: 'Fresh Spicy', percentage: 83 },
      { name: 'Musky', percentage: 78 }
    ],
    notes: {
      top: ['Ambroxan', 'Bergamot'],
      middle: ['Pink Pepper', 'Lavender'],
      base: ['Amber', 'Cedar'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: false } },
    rating: 4.4,
    ratingCount: 3763,
  },
  {
    id: '7',
    name: "Hectic",
    brand: "Bujairami",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 120 },
      { size: '3ml', price: 180 },
      { size: '5ml', price: 300 },
      { size: '10ml', price: 540 },
      { size: '15ml', price: 810 },
      { size: '30ml', price: 1560 }
    ],
    image: '/Images/bujairami-hectic.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 80 },
      { name: 'Fresh', percentage: 72 },
      { name: 'Cinnamon', percentage: 70 },
      { name: 'Amber', percentage: 68 }
    ],
    notes: {
      top: ['Citron', 'Ginger'],
      middle: ['Cinnamon', 'Ambroxan'],
      base: ['Bergamot', 'Neroli'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.5,
    ratingCount: 566,
  },
  {
    id: '8',
    name: "Omnia Coral",
    brand: "Bvlgari",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 256 },
      { size: '3ml', price: 384 },
      { size: '5ml', price: 640 },
      { size: '10ml', price: 1152 },
      { size: '15ml', price: 1728 },
      { size: '30ml', price: 3328 }
    ],
    image: '/Images/bvlgari-omnia-coral.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Woody', percentage: 96 },
      { name: 'Fresh Spicy', percentage: 84 },
      { name: 'Fruity', percentage: 72 },
      { name: 'Musky', percentage: 71 }
    ],
    notes: {
      top: ['Pomegranate', 'Bergamot'],
      middle: ['Hibiscus', 'Water Lily'],
      base: ['Musk', 'Cedar'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 5392,
  },
  {
    id: '9',
    name: "CK be",
    brand: "Calvin Klein",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 60 },
      { size: '3ml', price: 90 },
      { size: '5ml', price: 150 },
      { size: '10ml', price: 270 },
      { size: '15ml', price: 405 },
      { size: '30ml', price: 780 }
    ],
    image: '/Images/calvin-klein-ck-be.webp',
    mainAccords: [
      { name: 'Green', percentage: 100 },
      { name: 'Aromatic', percentage: 86 },
      { name: 'Woody', percentage: 83 },
      { name: 'Powdery', percentage: 80 },
      { name: 'Fresh Spicy', percentage: 79 }
    ],
    notes: {
      top: ['Lavender', 'Green Notes', 'Grass', 'Bergamot'],
      middle: ['Musk'],
      base: ['Musk', 'Sandalwood'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.8,
    ratingCount: 6809,
  },
  {
    id: '10',
    name: "CK One",
    brand: "Calvin Klein",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 60 },
      { size: '3ml', price: 90 },
      { size: '5ml', price: 150 },
      { size: '10ml', price: 270 },
      { size: '15ml', price: 405 },
      { size: '30ml', price: 780 }
    ],
    image: '/Images/calvin-klein-ck-one.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Green', percentage: 85 },
      { name: 'Woody', percentage: 75 },
      { name: 'Powdery', percentage: 75 },
      { name: 'White Floral', percentage: 74 }
    ],
    notes: {
      top: ['Lemon', 'Green Notes', 'Bergamot'],
      middle: ['Lily-of-the-Valley'],
      base: ['Musk', 'Cedar'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.8,
    ratingCount: 21520,
  },
  {
    id: '11',
    name: "CK One Shock For Him",
    brand: "Calvin Klein",
    scentProfile: 'Spicy',
    demographic: 'Masculine',
    volumes: [
      { size: '2ml', price: 60 },
      { size: '3ml', price: 90 },
      { size: '5ml', price: 150 },
      { size: '10ml', price: 270 },
      { size: '15ml', price: 405 },
      { size: '30ml', price: 780 }
    ],
    image: '/Images/calvin-klein-ck-one-shock-for-him.webp',
    mainAccords: [
      { name: 'Tobacco', percentage: 100 },
      { name: 'Warm Spicy', percentage: 92 },
      { name: 'Amber', percentage: 87 },
      { name: 'Sweet', percentage: 85 },
      { name: 'Fresh Spicy', percentage: 83 }
    ],
    notes: {
      top: ['Lavender', 'Pepper'],
      middle: ['Cardamom'],
      base: ['Tobacco', 'Amber', 'Patchouli'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4,
    ratingCount: 7570,
  },
  {
    id: '12',
    name: "Good Girl Blush",
    brand: "Carolina Herrera",
    scentProfile: 'Floral',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/carolina-herrera-good-girl-blush.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Vanilla', percentage: 92 },
      { name: 'Fresh', percentage: 84 },
      { name: 'Citrus', percentage: 83 },
      { name: 'Sweet', percentage: 80 }
    ],
    notes: {
      top: ['Peony', 'Bergamot', 'Almond', 'Coumarin'],
      middle: ['Ylang-Ylang'],
      base: ['Vanilla'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 6496,
  },
  {
    id: '13',
    name: "Bleu de Chanel",
    brand: "Chanel",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 196 },
      { size: '3ml', price: 294 },
      { size: '5ml', price: 490 },
      { size: '10ml', price: 882 },
      { size: '15ml', price: 1323 },
      { size: '30ml', price: 2548 }
    ],
    image: '/Images/chanel-bleu-de-chanel.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Woody', percentage: 90 },
      { name: 'Fresh Spicy', percentage: 88 },
      { name: 'Aromatic', percentage: 82 },
      { name: 'Amber', percentage: 80 }
    ],
    notes: {
      top: ['Grapefruit', 'Incense', 'Lemon', 'Ginger', 'Mint'],
      middle: ['Incense'],
      base: ['Cedar'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.2,
    ratingCount: 20300,
  },
  {
    id: '14',
    name: "Chance Eau Tendre",
    brand: "Chanel",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 300 },
      { size: '3ml', price: 450 },
      { size: '5ml', price: 750 },
      { size: '10ml', price: 1350 },
      { size: '15ml', price: 2025 },
      { size: '30ml', price: 3900 }
    ],
    image: '/Images/chanel-chance-eau-tendre.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Fruity', percentage: 91 },
      { name: 'Citrus', percentage: 89 },
      { name: 'Sweet', percentage: 85 },
      { name: 'Fresh Spicy', percentage: 83 }
    ],
    notes: {
      top: ['Quince', 'Grapefruit', 'Hyacint'],
      middle: ['Jasmine', 'Iris'],
      base: ['Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 19386,
  },
  {
    id: '15',
    name: "Clinique Happy",
    brand: "Clinique",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 110 },
      { size: '3ml', price: 165 },
      { size: '5ml', price: 275 },
      { size: '10ml', price: 495 },
      { size: '15ml', price: 743 },
      { size: '30ml', price: 1430 }
    ],
    image: '/Images/clinique-clinique-happy.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Green', percentage: 65 },
      { name: 'Aromatic', percentage: 63 },
      { name: 'Marine', percentage: 58 },
      { name: 'Woody', percentage: 57 }
    ],
    notes: {
      top: ['Mandarin Orange', 'Lime', 'Sea Water', 'Lemon', 'Green Notes'],
      middle: ['Freesia'],
      base: ['Sea Water'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 5635,
  },
  {
    id: '16',
    name: "Clinique Happy Heart 2012",
    brand: "Clinique",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 110 },
      { size: '3ml', price: 165 },
      { size: '5ml', price: 275 },
      { size: '10ml', price: 495 },
      { size: '15ml', price: 743 },
      { size: '30ml', price: 1430 }
    ],
    image: '/Images/clinique-clinique-happy-heart-2012.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Citrus', percentage: 85 },
      { name: 'Aquatic', percentage: 78 },
      { name: 'Woody', percentage: 68 },
      { name: 'Ozonic', percentage: 64 }
    ],
    notes: {
      top: ['Water Hyacinth', 'Mandarin Orange'],
      middle: ['Mandarin Orange'],
      base: ['Woody Notes'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 777,
  },
  {
    id: '17',
    name: "Coach Floral",
    brand: "Coach",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/coach-coach-floral.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Sweet', percentage: 94 },
      { name: 'Citrus', percentage: 93 },
      { name: 'Fruity', percentage: 88 },
      { name: 'Rose', percentage: 80 }
    ],
    notes: {
      top: ['Pineapple', 'Orange'],
      middle: ['Gardenia', 'Rose', 'Jasmine'],
      base: ['Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 1744,
  },
  {
    id: '18',
    name: "Aventus",
    brand: "Creed",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 536 },
      { size: '3ml', price: 804 },
      { size: '5ml', price: 1340 },
      { size: '10ml', price: 2412 },
      { size: '15ml', price: 3618 },
      { size: '30ml', price: 6968 }
    ],
    image: '/Images/creed-aventus.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Sweet', percentage: 78 },
      { name: 'Woody', percentage: 77 },
      { name: 'Leather', percentage: 74 },
      { name: 'Citrus', percentage: 70 }
    ],
    notes: {
      top: ['Pineapple', 'Birch', 'Bergamot', 'Black Currant'],
      middle: ['Birch'],
      base: ['Musk', 'Oakmoss'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: false, winter: false } },
    rating: 4.3,
    ratingCount: 26112,
  },
  {
    id: '19',
    name: "Aventus Cologne",
    brand: "Creed",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 536 },
      { size: '3ml', price: 804 },
      { size: '5ml', price: 1340 },
      { size: '10ml', price: 2412 },
      { size: '15ml', price: 3618 },
      { size: '30ml', price: 6968 }
    ],
    image: '/Images/creed-aventus-cologne.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Woody', percentage: 96 },
      { name: 'Musky', percentage: 84 },
      { name: 'Leather', percentage: 76 },
      { name: 'Fresh Spicy', percentage: 74 }
    ],
    notes: {
      top: ['Mandarin Orange', 'Birch', 'Ginger', 'Pink Pepper'],
      middle: ['Musk'],
      base: ['Musk', 'Vetiver'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.3,
    ratingCount: 3266,
  },
  {
    id: '20',
    name: "White Rice",
    brand: "d'Annam",
    scentProfile: 'Gourmand',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 356 },
      { size: '3ml', price: 534 },
      { size: '5ml', price: 890 },
      { size: '10ml', price: 1602 },
      { size: '15ml', price: 2403 },
      { size: '30ml', price: 4628 }
    ],
    image: '/Images/dannam-white-rice.webp',
    mainAccords: [
      { name: 'Powdery', percentage: 100 },
      { name: 'Musky', percentage: 95 },
      { name: 'Iris', percentage: 85 },
      { name: 'Savory', percentage: 80 },
      { name: 'Sweet', percentage: 78 }
    ],
    notes: {
      top: ['Rice', 'Musk'],
      middle: ['Orris Root', 'Tonka Bean'],
      base: ['Jasmine', 'Cedar'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.1,
    ratingCount: 1491,
  },
  {
    id: '21',
    name: "Cool Water",
    brand: "Davidoff",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 80 },
      { size: '3ml', price: 120 },
      { size: '5ml', price: 200 },
      { size: '10ml', price: 360 },
      { size: '15ml', price: 540 },
      { size: '30ml', price: 1040 }
    ],
    image: '/Images/davidoff-cool-water.webp',
    mainAccords: [
      { name: 'Fresh', percentage: 100 },
      { name: 'Floral', percentage: 99 },
      { name: 'Fruity', percentage: 98 },
      { name: 'Aquatic', percentage: 92 },
      { name: 'Ozonic', percentage: 87 }
    ],
    notes: {
      top: ['Melon', 'Lemon', 'Pineapple', 'Calone'],
      middle: ['Lotus', 'Water Lily'],
      base: ['Water Lily'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.6,
    ratingCount: 9744,
  },
  {
    id: '22',
    name: "COOL WATER INTENSE",
    brand: "Davidoff",
    scentProfile: 'Citrus',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 100 },
      { size: '3ml', price: 150 },
      { size: '5ml', price: 250 },
      { size: '10ml', price: 450 },
      { size: '15ml', price: 675 },
      { size: '30ml', price: 1300 }
    ],
    image: '/Images/davidoff-cool-water-intense.webp',
    mainAccords: [
      { name: 'Amber', percentage: 100 },
      { name: 'Citrus', percentage: 95 },
      { name: 'Coconut', percentage: 85 },
      { name: 'Sweet', percentage: 70 },
      { name: 'Lactonic', percentage: 60 }
    ],
    notes: {
      top: ['Mandarin Orange', 'Coconut'],
      middle: ['Mandarin Orange'],
      base: ['Amber'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.1,
    ratingCount: 3756,
  },
  {
    id: '23',
    name: "SAUVAGE MEN",
    brand: "Dior",
    scentProfile: 'Citrus',
    demographic: 'Masculine',
    volumes: [
      { size: '2ml', price: 256 },
      { size: '3ml', price: 384 },
      { size: '5ml', price: 640 },
      { size: '10ml', price: 1152 },
      { size: '15ml', price: 1728 },
      { size: '30ml', price: 3328 }
    ],
    image: '/Images/dior-sauvage-men.webp',
    mainAccords: [
      { name: 'Fresh Spicy', percentage: 100 },
      { name: 'Citrus', percentage: 89 },
      { name: 'Amber', percentage: 83 },
      { name: 'Lavender', percentage: 74 },
      { name: 'Musky', percentage: 73 }
    ],
    notes: {
      top: ['Bergamot', 'Sichuan Pepper', 'Lavender', 'Star Anise'],
      middle: ['Bergamot'],
      base: ['Ambroxan', 'Vanilla'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: true } },
    rating: 4.2,
    ratingCount: 13860,
  },
  {
    id: '24',
    name: "Fleur de Peau Eau de Parfum",
    brand: "Diptyque",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 236 },
      { size: '3ml', price: 354 },
      { size: '5ml', price: 590 },
      { size: '10ml', price: 1062 },
      { size: '15ml', price: 1593 },
      { size: '30ml', price: 3068 }
    ],
    image: '/Images/diptyque-fleur-de-peau-eau-de-parfum.webp',
    mainAccords: [
      { name: 'Musky', percentage: 100 },
      { name: 'Powdery', percentage: 95 },
      { name: 'Iris', percentage: 80 },
      { name: 'Aldehydic', percentage: 76 },
      { name: 'Soft Spicy', percentage: 73 }
    ],
    notes: {
      top: ['Musk', 'Iris'],
      middle: ['Aldehydes', 'Ambrette (Musk Mallow)'],
      base: ['Pink Pepper', 'Carrot'],
    },
    performance: { longevity: '7hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: false } },
    rating: 4.1,
    ratingCount: 5446,
  },
  {
    id: '25',
    name: "Green Tea",
    brand: "Elizabeth Arden",
    scentProfile: 'Citrus',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 44 },
      { size: '3ml', price: 66 },
      { size: '5ml', price: 110 },
      { size: '10ml', price: 198 },
      { size: '15ml', price: 297 },
      { size: '30ml', price: 572 }
    ],
    image: '/Images/elizabeth-arden-green-tea.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Green', percentage: 94 },
      { name: 'Aromatic', percentage: 82 },
      { name: 'Fresh Spicy', percentage: 76 },
      { name: 'Fresh', percentage: 72 }
    ],
    notes: {
      top: ['Tea', 'Lemon', 'Bergamot', 'Mint', 'Orange'],
      middle: ['Jasmine'],
      base: ['Bergamot'],
    },
    performance: { longevity: '4hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 15730,
  },
  {
    id: '26',
    name: "Liquid Brun",
    brand: "French Avenue",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 80 },
      { size: '3ml', price: 120 },
      { size: '5ml', price: 200 },
      { size: '10ml', price: 360 },
      { size: '15ml', price: 540 },
      { size: '30ml', price: 1040 }
    ],
    image: '/Images/french-avenue-liquid-brun.webp',
    mainAccords: [
      { name: 'Sweet', percentage: 100 },
      { name: 'Warm Spicy', percentage: 99 },
      { name: 'Vanilla', percentage: 98 },
      { name: 'Cinnamon', percentage: 85 },
      { name: 'White Floral', percentage: 70 }
    ],
    notes: {
      top: ['Orange Blossom'],
      middle: ['Cinnamon', 'Cardamom'],
      base: ['Vanilla', 'Praline', 'Ambroxan'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 4.5,
    ratingCount: 10939,
  },
  {
    id: '27',
    name: "Vulcan Feu",
    brand: "French Avenue",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 80 },
      { size: '3ml', price: 120 },
      { size: '5ml', price: 200 },
      { size: '10ml', price: 360 },
      { size: '15ml', price: 540 },
      { size: '30ml', price: 1040 }
    ],
    image: '/Images/french-avenue-vulcan-feu.webp',
    mainAccords: [
      { name: 'Tropical', percentage: 100 },
      { name: 'Fruity', percentage: 99 },
      { name: 'Sweet', percentage: 95 },
      { name: 'Citrus', percentage: 82 },
      { name: 'Woody', percentage: 70 }
    ],
    notes: {
      top: ['Mango', 'Lemon', 'Ginger', 'Pink Pepper'],
      middle: ['Lemon'],
      base: ['Tonka Bean', 'Cedar'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.5,
    ratingCount: 4343,
  },
  {
    id: '28',
    name: "Emporio Armani Stronger With You Intensely",
    brand: "Giorgio Armani",
    scentProfile: 'Spicy',
    demographic: 'Masculine',
    volumes: [
      { size: '2ml', price: 200 },
      { size: '3ml', price: 300 },
      { size: '5ml', price: 500 },
      { size: '10ml', price: 900 },
      { size: '15ml', price: 1350 },
      { size: '30ml', price: 2600 }
    ],
    image: '/Images/giorgio-armani-emporio-armani-stronger-with-you-intensely.webp',
    mainAccords: [
      { name: 'Vanilla', percentage: 100 },
      { name: 'Sweet', percentage: 95 },
      { name: 'Amber', percentage: 82 },
      { name: 'Cinnamon', percentage: 81 },
      { name: 'Warm Spicy', percentage: 79 }
    ],
    notes: {
      top: ['Pink Pepper'],
      middle: ['Cinnamon'],
      base: ['Vanilla', 'Toffee', 'Amber', 'Tonka Bean'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 4.6,
    ratingCount: 22157,
  },
  {
    id: '29',
    name: "Flora Gorgeous Orchid",
    brand: "Gucci",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/gucci-flora-gorgeous-orchid.webp',
    mainAccords: [
      { name: 'Vanilla', percentage: 100 },
      { name: 'Ozonic', percentage: 78 },
      { name: 'Floral', percentage: 70 },
      { name: 'Powdery', percentage: 69 },
      { name: 'Sweet', percentage: 68 }
    ],
    notes: {
      top: ['Ozonic Notes'],
      middle: ['Orchid'],
      base: ['Vanilla'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 3506,
  },
  {
    id: '30',
    name: "BLACKBERRY & BAY",
    brand: "Jo Malone",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/jo-malone-blackberry-bay.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 90 },
      { name: 'Aromatic', percentage: 78 },
      { name: 'Citrus', percentage: 77 },
      { name: 'Woody', percentage: 70 }
    ],
    notes: {
      top: ['Blackberry', 'Bay Leaf', 'Grapefruit'],
      middle: ['Floral Notes'],
      base: ['Cedar', 'Vetiver'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 6870,
  },
  {
    id: '31',
    name: "English Pear & Freesia",
    brand: "Jo Malone",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/jo-malone-english-pear-freesia.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Fruity', percentage: 93 },
      { name: 'Rose', percentage: 82 },
      { name: 'Sweet', percentage: 81 },
      { name: 'Aquatic', percentage: 77 }
    ],
    notes: {
      top: ['Pear', 'Melon'],
      middle: ['Freesia', 'Rose'],
      base: ['Musk', 'Patchouli'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 3.8,
    ratingCount: 9143,
  },
  {
    id: '32',
    name: "Mimosa & Cardamom",
    brand: "Jo Malone",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/jo-malone-mimosa-cardamom.webp',
    mainAccords: [
      { name: 'Yellow Floral', percentage: 100 },
      { name: 'Warm Spicy', percentage: 94 },
      { name: 'Powdery', percentage: 87 },
      { name: 'Sweet', percentage: 83 },
      { name: 'Aromatic', percentage: 82 }
    ],
    notes: {
      top: ['Mimosa'],
      middle: ['Cardamom'],
      base: ['Tonka Bean'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.1,
    ratingCount: 3532,
  },
  {
    id: '33',
    name: "Nectarine Blossom & Honey",
    brand: "Jo Malone",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/jo-malone-nectarine-blossom-honey.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Sweet', percentage: 80 },
      { name: 'Green', percentage: 70 },
      { name: 'Powdery', percentage: 60 },
      { name: 'Fresh', percentage: 55 }
    ],
    notes: {
      top: ['Nectarine', 'Peach', 'Green Notes', 'Black Currant', 'Black Locust', 'Petitgrain'],
      middle: ['Peach'],
      base: ['Green Notes'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 4938,
  },
  {
    id: '34',
    name: "SUNLIT CHERIMOYA",
    brand: "Jo Malone",
    scentProfile: 'Aquatic',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 280 },
      { size: '3ml', price: 420 },
      { size: '5ml', price: 700 },
      { size: '10ml', price: 1260 },
      { size: '15ml', price: 1890 },
      { size: '30ml', price: 3640 }
    ],
    image: '/Images/jo-malone-sunlit-cherimoya.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Sweet', percentage: 82 },
      { name: 'Balsamic', percentage: 50 },
      { name: 'Vanilla', percentage: 48 },
      { name: 'Aquatic', percentage: 47 }
    ],
    notes: {
      top: ['Cherimoya', 'Pear', 'Bergamot'],
      middle: ['Pear'],
      base: ['Copaiba Balm', 'Tonka Bean'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 140,
  },
  {
    id: '35',
    name: "Taif Rose",
    brand: "Jo Malone",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 280 },
      { size: '3ml', price: 420 },
      { size: '5ml', price: 700 },
      { size: '10ml', price: 1260 },
      { size: '15ml', price: 1890 },
      { size: '30ml', price: 3640 }
    ],
    image: '/Images/jo-malone-taif-rose.webp',
    mainAccords: [
      { name: 'Rose', percentage: 100 },
      { name: 'Amber', percentage: 88 },
      { name: 'Coffee', percentage: 83 },
      { name: 'Warm Spicy', percentage: 73 },
      { name: 'Floral', percentage: 71 }
    ],
    notes: {
      top: ['Rose'],
      middle: ['Rose'],
      base: ['Amber', 'Coffee'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: false } },
    rating: 4,
    ratingCount: 192,
  },
  {
    id: '36',
    name: "L'Eau Kenzo Pour Femme",
    brand: "Kenzo",
    scentProfile: 'Floral',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 110 },
      { size: '3ml', price: 165 },
      { size: '5ml', price: 275 },
      { size: '10ml', price: 495 },
      { size: '15ml', price: 743 },
      { size: '30ml', price: 1430 }
    ],
    image: '/Images/kenzo-leau-kenzo-pour-femme.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Aquatic', percentage: 85 },
      { name: 'Ozonic', percentage: 80 },
      { name: 'Green', percentage: 78 },
      { name: 'Fruity', percentage: 77 }
    ],
    notes: {
      top: ['Peach', 'Mint'],
      middle: ['Lotus'],
      base: ['Vanilla'],
    },
    performance: { longevity: '4hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.8,
    ratingCount: 142,
  },
  {
    id: '37',
    name: "Idole",
    brand: "Lancome",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 260 },
      { size: '3ml', price: 390 },
      { size: '5ml', price: 650 },
      { size: '10ml', price: 1170 },
      { size: '15ml', price: 1755 },
      { size: '30ml', price: 3380 }
    ],
    image: '/Images/lancome-idole.webp',
    mainAccords: [
      { name: 'Rose', percentage: 100 },
      { name: 'Musky', percentage: 87 },
      { name: 'Fruity', percentage: 81 },
      { name: 'Sweet', percentage: 80 },
      { name: 'White Floral', percentage: 79 }
    ],
    notes: {
      top: ['Pear', 'Bergamot'],
      middle: ['Rose', 'Jasmine'],
      base: ['Musk', 'Vanilla'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 3.9,
    ratingCount: 12896,
  },
  {
    id: '38',
    name: "La Vie Est Belle",
    brand: "Lancôme",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 276 },
      { size: '3ml', price: 414 },
      { size: '5ml', price: 690 },
      { size: '10ml', price: 1242 },
      { size: '15ml', price: 1863 },
      { size: '30ml', price: 3588 }
    ],
    image: '/Images/lancme-la-vie-est-belle.webp',
    mainAccords: [
      { name: 'Sweet', percentage: 100 },
      { name: 'Vanilla', percentage: 90 },
      { name: 'Fruity', percentage: 80 },
      { name: 'Patchouli', percentage: 75 },
      { name: 'Woody', percentage: 74 }
    ],
    notes: {
      top: ['Praline', 'Vanilla'],
      middle: ['Patchouli', 'Black Currant'],
      base: ['Tonka Bean', 'Iris'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 3.6,
    ratingCount: 34694,
  },
  {
    id: '39',
    name: "Eclat d'Arpège",
    brand: "Lanvin",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 96 },
      { size: '3ml', price: 144 },
      { size: '5ml', price: 240 },
      { size: '10ml', price: 432 },
      { size: '15ml', price: 648 },
      { size: '30ml', price: 1248 }
    ],
    image: '/Images/lanvin-eclat-darpge.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Fresh', percentage: 78 },
      { name: 'Green', percentage: 66 },
      { name: 'Musky', percentage: 58 },
      { name: 'Fruity', percentage: 57 }
    ],
    notes: {
      top: ['Lilac', 'Tea', 'Peony', 'Peach Blossom', 'Wisteria'],
      middle: ['Tea'],
      base: ['Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 17399,
  },
  {
    id: '40',
    name: "Khamrah",
    brand: "Lattafa Perfumes",
    scentProfile: 'Spicy',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 76 },
      { size: '3ml', price: 114 },
      { size: '5ml', price: 190 },
      { size: '10ml', price: 342 },
      { size: '15ml', price: 513 },
      { size: '30ml', price: 988 }
    ],
    image: '/Images/lattafa-perfumes-khamrah.webp',
    mainAccords: [
      { name: 'Sweet', percentage: 100 },
      { name: 'Warm Spicy', percentage: 90 },
      { name: 'Vanilla', percentage: 88 },
      { name: 'Amber', percentage: 86 },
      { name: 'Cinnamon', percentage: 81 }
    ],
    notes: {
      top: ['Cinnamon'],
      middle: ['Cinnamon', 'Nutmeg'],
      base: ['Vanilla', 'Dates', 'Praline', 'Tonka Bean'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 4.3,
    ratingCount: 27288,
  },
  {
    id: '41',
    name: "Gaiac 10 Tokyo",
    brand: "Le Labo",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 800 },
      { size: '3ml', price: 1200 },
      { size: '5ml', price: 2000 },
      { size: '10ml', price: 3600 },
      { size: '15ml', price: 5400 },
      { size: '30ml', price: 10400 }
    ],
    image: '/Images/le-labo-gaiac-10-tokyo.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Musky', percentage: 82 },
      { name: 'Powdery', percentage: 76 },
      { name: 'Amber', percentage: 73 },
      { name: 'Fresh Spicy', percentage: 66 }
    ],
    notes: {
      top: ['Guaiac Wood'],
      middle: ['Musk'],
      base: ['Guaiac Wood', 'Musk', 'Cedar', 'Olibanum (Frankincense)'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.4,
    ratingCount: 1557,
  },
  {
    id: '42',
    name: "SANTAL 33",
    brand: "Le Labo",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 436 },
      { size: '3ml', price: 654 },
      { size: '5ml', price: 1090 },
      { size: '10ml', price: 1962 },
      { size: '15ml', price: 2943 },
      { size: '30ml', price: 5668 }
    ],
    image: '/Images/le-labo-santal-33.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Powdery', percentage: 70 },
      { name: 'Leather', percentage: 65 },
      { name: 'Warm Spicy', percentage: 63 },
      { name: 'Violet', percentage: 59 }
    ],
    notes: {
      top: ['Sandalwood'],
      middle: ['Cardamom', 'Violet'],
      base: ['Sandalwood', 'Leather', 'Papyrus', 'Cedar'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: true, summer: true, autumn: true, winter: true } },
    rating: 3.8,
    ratingCount: 12512,
  },
  {
    id: '43',
    name: "Imagination",
    brand: "Louis Vuitton",
    scentProfile: 'Citrus',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 500 },
      { size: '3ml', price: 750 },
      { size: '5ml', price: 1250 },
      { size: '10ml', price: 2250 },
      { size: '15ml', price: 3375 },
      { size: '30ml', price: 6500 }
    ],
    image: '/Images/louis-vuitton-imagination.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 74 },
      { name: 'Fresh', percentage: 70 },
      { name: 'Green', percentage: 69 },
      { name: 'Amber', percentage: 65 }
    ],
    notes: {
      top: ['Tea', 'Citron', 'Bergamot', 'Orange', 'Neroli'],
      middle: ['Citron'],
      base: ['Ambroxan'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.6,
    ratingCount: 10424,
  },
  {
    id: '44',
    name: "Ombre Nomade",
    brand: "Louis Vuitton",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 700 },
      { size: '3ml', price: 1050 },
      { size: '5ml', price: 1750 },
      { size: '10ml', price: 3150 },
      { size: '15ml', price: 4725 },
      { size: '30ml', price: 9100 }
    ],
    image: '/Images/louis-vuitton-ombre-nomade.webp',
    mainAccords: [
      { name: 'Amber', percentage: 100 },
      { name: 'Warm Spicy', percentage: 90 },
      { name: 'Oud', percentage: 88 },
      { name: 'Rose', percentage: 85 },
      { name: 'Smoky', percentage: 84 }
    ],
    notes: {
      top: ['Incense', 'Raspberry'],
      middle: ['Rose', 'Saffron'],
      base: ['Agarwood (Oud)', 'Amberwood'],
    },
    performance: { longevity: '8hrs', sillage: 'Enormous' },
    usage: { day: true, night: false, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 4.3,
    ratingCount: 6364,
  },
  {
    id: '45',
    name: "Symphony",
    brand: "Louis Vuitton",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 900 },
      { size: '3ml', price: 1350 },
      { size: '5ml', price: 2250 },
      { size: '10ml', price: 4050 },
      { size: '15ml', price: 6075 },
      { size: '30ml', price: 11700 }
    ],
    image: '/Images/louis-vuitton-symphony.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 74 },
      { name: 'Aromatic', percentage: 63 },
      { name: 'Floral', percentage: 54 },
      { name: 'Fresh', percentage: 53 }
    ],
    notes: {
      top: ['Grapefruit', 'Bergamot', 'Ginger'],
      middle: ['Bergamot'],
      base: ['Ginger'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.5,
    ratingCount: 2097,
  },
  {
    id: '46',
    name: "Delilah Blanc",
    brand: "Maison Alhambra",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 76 },
      { size: '3ml', price: 114 },
      { size: '5ml', price: 190 },
      { size: '10ml', price: 342 },
      { size: '15ml', price: 513 },
      { size: '30ml', price: 988 }
    ],
    image: '/Images/maison-alhambra-delilah-blanc.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Musky', percentage: 85 },
      { name: 'Powdery', percentage: 80 },
      { name: 'White Floral', percentage: 77 },
      { name: 'Sweet', percentage: 75 }
    ],
    notes: {
      top: ['Musk', 'Bergamot'],
      middle: ['Peach', 'Orange Blossom'],
      base: ['Mandarin Orange', 'Vetiver'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 410,
  },
  {
    id: '47',
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 456 },
      { size: '3ml', price: 684 },
      { size: '5ml', price: 1140 },
      { size: '10ml', price: 2052 },
      { size: '15ml', price: 3078 },
      { size: '30ml', price: 5928 }
    ],
    image: '/Images/maison-francis-kurkdjian-baccarat-rouge-540.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Amber', percentage: 98 },
      { name: 'Warm Spicy', percentage: 82 },
      { name: 'Metallic', percentage: 68 },
      { name: 'Fresh Spicy', percentage: 67 }
    ],
    notes: {
      top: ['Amberwood'],
      middle: ['Saffron', 'Jasmine'],
      base: ['Amberwood', 'Ambergris', 'Fir', 'Cedar'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 3.8,
    ratingCount: 28006,
  },
  {
    id: '48',
    name: "By the Fireplace",
    brand: "Maison Martin Margiela",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 210 },
      { size: '3ml', price: 315 },
      { size: '5ml', price: 525 },
      { size: '10ml', price: 945 },
      { size: '15ml', price: 1417.5 },
      { size: '30ml', price: 2730 }
    ],
    image: '/Images/maison-martin-margiela-by-the-fireplace.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Vanilla', percentage: 86 },
      { name: 'Balsamic', percentage: 85 },
      { name: 'Warm Spicy', percentage: 81 },
      { name: 'Amber', percentage: 76 }
    ],
    notes: {
      top: ['Vanilla'],
      middle: ['Cloves'],
      base: ['Vanilla', 'Chestnut', 'Guaiac Wood', 'Peru Balsam', 'Cashmeran'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 4.2,
    ratingCount: 24810,
  },
  {
    id: '49',
    name: "Instant Crush",
    brand: "Mancera",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/mancera-instant-crush.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Warm Spicy', percentage: 98 },
      { name: 'Vanilla', percentage: 82 },
      { name: 'Amber', percentage: 80 },
      { name: 'Powdery', percentage: 78 }
    ],
    notes: {
      top: ['Ginger'],
      middle: ['Saffron'],
      base: ['Vanilla', 'Amberwood', 'Musk', 'Sandalwood'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.1,
    ratingCount: 8628,
  },
  {
    id: '50',
    name: "Daisy Eau So Fresh",
    brand: "Marc Jacobs",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 170 },
      { size: '3ml', price: 255 },
      { size: '5ml', price: 425 },
      { size: '10ml', price: 765 },
      { size: '15ml', price: 1147.5 },
      { size: '30ml', price: 2210 }
    ],
    image: '/Images/marc-jacobs-daisy-eau-so-fresh.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Sweet', percentage: 78 },
      { name: 'Green', percentage: 77 },
      { name: 'Floral', percentage: 71 },
      { name: 'Powdery', percentage: 70 }
    ],
    notes: {
      top: ['Green Notes', 'Raspberry', 'Pear', 'Litchi', 'Grapefruit'],
      middle: ['Violet'],
      base: ['Violet'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 7279,
  },
  {
    id: '51',
    name: "BLOOMING BOUQUET",
    brand: "Miss Dior",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 256 },
      { size: '3ml', price: 384 },
      { size: '5ml', price: 640 },
      { size: '10ml', price: 1152 },
      { size: '15ml', price: 1728 },
      { size: '30ml', price: 3328 }
    ],
    image: '/Images/miss-dior-blooming-bouquet.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Rose', percentage: 90 },
      { name: 'Fresh', percentage: 80 },
      { name: 'Musky', percentage: 75 },
      { name: 'Citrus', percentage: 74 }
    ],
    notes: {
      top: ['Peony', 'Rose'],
      middle: ['Musk', 'Bergamot'],
      base: ['Sweet Pea'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 1927,
  },
  {
    id: '52',
    name: "Explorer",
    brand: "Montblanc",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 96 },
      { size: '3ml', price: 144 },
      { size: '5ml', price: 240 },
      { size: '10ml', price: 432 },
      { size: '15ml', price: 648 },
      { size: '30ml', price: 1248 }
    ],
    image: '/Images/montblanc-explorer.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Citrus', percentage: 98 },
      { name: 'Aromatic', percentage: 92 },
      { name: 'Amber', percentage: 87 },
      { name: 'Musky', percentage: 80 }
    ],
    notes: {
      top: ['Bergamot', 'Pink Pepper'],
      middle: ['Ambroxan'],
      base: ['Ambroxan', 'Akigalawood', 'Vetiver', 'Leather'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.2,
    ratingCount: 16331,
  },
  {
    id: '53',
    name: "Toy 2 Pearl",
    brand: "Moschino",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 150 },
      { size: '3ml', price: 225 },
      { size: '5ml', price: 375 },
      { size: '10ml', price: 675 },
      { size: '15ml', price: 1012.5 },
      { size: '30ml', price: 1950 }
    ],
    image: '/Images/moschino-toy-2-pearl.webp',
    mainAccords: [
      { name: 'Aromatic', percentage: 100 },
      { name: 'Citrus', percentage: 90 },
      { name: 'Woody', percentage: 75 },
      { name: 'Fresh Spicy', percentage: 70 },
      { name: 'Musky', percentage: 68 }
    ],
    notes: {
      top: ['Lemon', 'Sorbet', 'Cypress', 'Oregano', 'Sand'],
      middle: ['Sorbet'],
      base: ['Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.7,
    ratingCount: 1699,
  },
  {
    id: '54',
    name: "Voyage",
    brand: "Nautica",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 50 },
      { size: '3ml', price: 75 },
      { size: '5ml', price: 125 },
      { size: '10ml', price: 225 },
      { size: '15ml', price: 338 },
      { size: '30ml', price: 650 }
    ],
    image: '/Images/nautica-voyage.webp',
    mainAccords: [
      { name: 'Green', percentage: 100 },
      { name: 'Fruity', percentage: 78 },
      { name: 'Floral', percentage: 73 },
      { name: 'Fresh', percentage: 70 },
      { name: 'Powdery', percentage: 69 }
    ],
    notes: {
      top: ['Green Notes', 'Apple', 'Mimosa'],
      middle: ['Lotus'],
      base: ['Musk', 'Cedar'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 18568,
  },
  {
    id: '55',
    name: "HACIVAT X",
    brand: "Nishane",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 356 },
      { size: '3ml', price: 534 },
      { size: '5ml', price: 890 },
      { size: '10ml', price: 1602 },
      { size: '15ml', price: 2403 },
      { size: '30ml', price: 4628 }
    ],
    image: '/Images/nishane-hacivat-x.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Citrus', percentage: 95 },
      { name: 'White Floral', percentage: 85 },
      { name: 'Sweet', percentage: 83 },
      { name: 'Aromatic', percentage: 80 }
    ],
    notes: {
      top: ['Vetiver', 'Pineapple'],
      middle: ['Lime', 'Patchouli'],
      base: ['Cedar', 'Bergamot'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.0,
    ratingCount: 1291,
  },
  {
    id: '56',
    name: "Valaya",
    brand: "Parfums de Marly",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 496 },
      { size: '3ml', price: 744 },
      { size: '5ml', price: 1240 },
      { size: '10ml', price: 2232 },
      { size: '15ml', price: 3348 },
      { size: '30ml', price: 6448 }
    ],
    image: '/Images/parfums-de-marly-valaya.webp',
    mainAccords: [
      { name: 'Musky', percentage: 100 },
      { name: 'Citrus', percentage: 90 },
      { name: 'White Floral', percentage: 85 },
      { name: 'Fresh', percentage: 83 },
      { name: 'Aldehydic', percentage: 78 }
    ],
    notes: {
      top: ['Musk', 'Aldehydes'],
      middle: ['Ambroxan', 'Peach'],
      base: ['Orange Blossom', 'Bergamot'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 5685,
  },
  {
    id: '57',
    name: "Bluebell",
    brand: "Penhaligon's",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 316 },
      { size: '3ml', price: 474 },
      { size: '5ml', price: 790 },
      { size: '10ml', price: 1422 },
      { size: '15ml', price: 2133 },
      { size: '30ml', price: 4108 }
    ],
    image: '/Images/penhaligons-bluebell.webp',
    mainAccords: [
      { name: 'Green', percentage: 100 },
      { name: 'Floral', percentage: 90 },
      { name: 'White Floral', percentage: 78 },
      { name: 'Warm Spicy', percentage: 76 },
      { name: 'Fresh Spicy', percentage: 75 }
    ],
    notes: {
      top: ['Hyacinth', 'Galbanum'],
      middle: ['Lily-of-the-Valley', 'Cloves'],
      base: ['Rose', 'Cyclamen'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: false, winter: false } },
    rating: 3.6,
    ratingCount: 1192,
  },
  {
    id: '58',
    name: "Paradoxe Intense",
    brand: "Prada",
    scentProfile: 'Spicy',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 300 },
      { size: '3ml', price: 450 },
      { size: '5ml', price: 750 },
      { size: '10ml', price: 1350 },
      { size: '15ml', price: 2025 },
      { size: '30ml', price: 3900 }
    ],
    image: '/Images/prada-paradoxe-intense.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Vanilla', percentage: 90 },
      { name: 'Citrus', percentage: 88 },
      { name: 'Mossy', percentage: 85 },
      { name: 'Amber', percentage: 82 }
    ],
    notes: {
      top: ['Vanilla', 'Jasmine'],
      middle: ['Pear', 'Neroli'],
      base: ['Oakmoss', 'Amber'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.1,
    ratingCount: 3940,
  },
  {
    id: '59',
    name: "1 Million",
    brand: "Rabanne",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 150 },
      { size: '3ml', price: 225 },
      { size: '5ml', price: 375 },
      { size: '10ml', price: 675 },
      { size: '15ml', price: 1012.5 },
      { size: '30ml', price: 1950 }
    ],
    image: '/Images/rabanne-1-million.webp',
    mainAccords: [
      { name: 'Warm Spicy', percentage: 100 },
      { name: 'Cinnamon', percentage: 89 },
      { name: 'Citrus', percentage: 85 },
      { name: 'Amber', percentage: 78 },
      { name: 'Woody', percentage: 77 }
    ],
    notes: {
      top: ['Spicy Notes', 'Mandarin Orange'],
      middle: ['Cinnamon', 'Rose'],
      base: ['Amber', 'Leather'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 3.7,
    ratingCount: 23429,
  },
  {
    id: '60',
    name: "POLO 67",
    brand: "Ralph Lauren",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 196 },
      { size: '3ml', price: 294 },
      { size: '5ml', price: 490 },
      { size: '10ml', price: 882 },
      { size: '15ml', price: 1323 },
      { size: '30ml', price: 2548 }
    ],
    image: '/Images/ralph-lauren-polo-67.webp',
    mainAccords: [
      { name: 'Aromatic', percentage: 100 },
      { name: 'Citrus', percentage: 96 },
      { name: 'Woody', percentage: 94 },
      { name: 'Fruity', percentage: 92 },
      { name: 'Sweet', percentage: 88 }
    ],
    notes: {
      top: ['Pineapple', 'Lavender', 'Mandarin Orange', 'Bergamot'],
      middle: ['Cardamom'],
      base: ['Benzoin'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.4,
    ratingCount: 874,
  },
  {
    id: '61',
    name: "Hawas Ice",
    brand: "Rasasi",
    scentProfile: 'Citrus',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 76 },
      { size: '3ml', price: 114 },
      { size: '5ml', price: 190 },
      { size: '10ml', price: 342 },
      { size: '15ml', price: 513 },
      { size: '30ml', price: 988 }
    ],
    image: '/Images/rasasi-hawas-ice.webp',
    mainAccords: [
      { name: 'Fruity', percentage: 100 },
      { name: 'Citrus', percentage: 95 },
      { name: 'Sweet', percentage: 70 },
      { name: 'Fresh', percentage: 68 },
      { name: 'Aromatic', percentage: 67 }
    ],
    notes: {
      top: ['Plum', 'Apple', 'Lemon', 'Bergamot'],
      middle: ['Apple'],
      base: ['Musk', 'Amber'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.4,
    ratingCount: 5835,
  },
  {
    id: '62',
    name: "Cheirosa '68",
    brand: "Sol de Janeiro",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 70 },
      { size: '3ml', price: 105 },
      { size: '5ml', price: 175 },
      { size: '10ml', price: 315 },
      { size: '15ml', price: 473 },
      { size: '30ml', price: 910 }
    ],
    image: '/Images/sol-de-janeiro-cheirosa-68.webp',
    mainAccords: [
      { name: 'Tropical', percentage: 100 },
      { name: 'Fruity', percentage: 99 },
      { name: 'Floral', percentage: 85 },
      { name: 'Musky', percentage: 76 },
      { name: 'Vanilla', percentage: 73 }
    ],
    notes: {
      top: ['Pitahaya', 'Litchi', 'Sea Water'],
      middle: ['Jasmine', 'Hibiscus'],
      base: ['Vanilla'],
    },
    performance: { longevity: '5hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.9,
    ratingCount: 4790,
  },
  {
    id: '63',
    name: "Vibrato",
    brand: "Sospiro",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 356 },
      { size: '3ml', price: 534 },
      { size: '5ml', price: 890 },
      { size: '10ml', price: 1602 },
      { size: '15ml', price: 2403 },
      { size: '30ml', price: 4628 }
    ],
    image: '/Images/sospiro-vibrato.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 85 },
      { name: 'Powdery', percentage: 78 },
      { name: 'Woody', percentage: 68 },
      { name: 'Green', percentage: 68 }
    ],
    notes: {
      top: ['Grapefruit', 'Ginger', 'Bergamot', 'Green Notes', 'Powdery Notes'],
      middle: ['Ginger'],
      base: ['Musk'],
    },
    performance: { longevity: '8hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.6,
    ratingCount: 4242,
  },
  {
    id: '64',
    name: "Donna Born In Roma",
    brand: "Valentino",
    scentProfile: 'Woody',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 220 },
      { size: '3ml', price: 330 },
      { size: '5ml', price: 550 },
      { size: '10ml', price: 990 },
      { size: '15ml', price: 1485 },
      { size: '30ml', price: 2860 }
    ],
    image: '/Images/valentino-donna-born-in-roma.webp',
    mainAccords: [
      { name: 'Woody', percentage: 100 },
      { name: 'Vanilla', percentage: 97 },
      { name: 'Fruity', percentage: 93 },
      { name: 'White Floral', percentage: 89 },
      { name: 'Soft Spicy', percentage: 88 }
    ],
    notes: {
      top: ['Black Currant', 'Pink Pepper'],
      middle: ['Jasmine', 'Jasmine Tea'],
      base: ['Vanilla', 'Cashmeran'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: true, summer: true, autumn: true, winter: true } },
    rating: 4.2,
    ratingCount: 10339,
  },
  {
    id: '65',
    name: "Uomo Born In Roma Intense",
    brand: "Valentino",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 270 },
      { size: '3ml', price: 405 },
      { size: '5ml', price: 675 },
      { size: '10ml', price: 1215 },
      { size: '15ml', price: 1822 },
      { size: '30ml', price: 3510 }
    ],
    image: '/Images/valentino-uomo-born-in-roma-intense.webp',
    mainAccords: [
      { name: 'Lavender', percentage: 100 },
      { name: 'Vanilla', percentage: 98 },
      { name: 'Aromatic', percentage: 88 },
      { name: 'Woody', percentage: 72 },
      { name: 'Fresh Spicy', percentage: 70 }
    ],
    notes: {
      top: ['Lavender'],
      middle: ['Vanilla'],
      base: ['Vanilla', 'Vetiver'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.5,
    ratingCount: 10359,
  },
  {
    id: '66',
    name: "Bright Crystal",
    brand: "Versace",
    scentProfile: 'Woody',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/versace-bright-crystal.webp',
    mainAccords: [
      { name: 'Floral', percentage: 100 },
      { name: 'Citrus', percentage: 80 },
      { name: 'Fresh', percentage: 79 },
      { name: 'Woody', percentage: 74 },
      { name: 'Rose', percentage: 71 }
    ],
    notes: {
      top: ['Peony', 'Yuzu', 'Pomegranate', 'Magnolia'],
      middle: ['Lotus'],
      base: ['Musk'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 3.7,
    ratingCount: 23575,
  },
  {
    id: '67',
    name: "DYLAN BLUE",
    brand: "Versace",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 116 },
      { size: '3ml', price: 174 },
      { size: '5ml', price: 290 },
      { size: '10ml', price: 522 },
      { size: '15ml', price: 783 },
      { size: '30ml', price: 1508 }
    ],
    image: '/Images/versace-dylan-blue.webp',
    mainAccords: [
      { name: 'Amber', percentage: 100 },
      { name: 'Citrus', percentage: 95 },
      { name: 'Fresh Spicy', percentage: 85 },
      { name: 'Musky', percentage: 83 },
      { name: 'Aquatic', percentage: 82 }
    ],
    notes: {
      top: ['Ambroxan', 'Bergamot'],
      middle: ['Water Notes', 'Grapefruit'],
      base: ['Incense', 'Pepper'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.2,
    ratingCount: 24219,
  },
  {
    id: '68',
    name: "Eros",
    brand: "Versace",
    scentProfile: 'Spicy',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 136 },
      { size: '3ml', price: 204 },
      { size: '5ml', price: 340 },
      { size: '10ml', price: 612 },
      { size: '15ml', price: 918 },
      { size: '30ml', price: 1768 }
    ],
    image: '/Images/versace-eros.webp',
    mainAccords: [
      { name: 'Vanilla', percentage: 100 },
      { name: 'Aromatic', percentage: 92 },
      { name: 'Green', percentage: 88 },
      { name: 'Fresh Spicy', percentage: 65 },
      { name: 'Amber', percentage: 61 }
    ],
    notes: {
      top: ['Mint', 'Apple', 'Lemon'],
      middle: ['Mint'],
      base: ['Vanilla', 'Tonka Bean', 'Ambroxan'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.1,
    ratingCount: 28488,
  },
  {
    id: '69',
    name: "Eros Energy",
    brand: "Versace",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 156 },
      { size: '3ml', price: 234 },
      { size: '5ml', price: 390 },
      { size: '10ml', price: 702 },
      { size: '15ml', price: 1053 },
      { size: '30ml', price: 2028 }
    ],
    image: '/Images/versace-eros-energy.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Aromatic', percentage: 60 },
      { name: 'Fresh Spicy', percentage: 59 },
      { name: 'Musky', percentage: 57 },
      { name: 'Woody', percentage: 57 }
    ],
    notes: {
      top: ['Lemon', 'Lime', 'Grapefruit', 'Blood Orange', 'Bergamot', 'Mandarin Orange'],
      middle: ['Lime'],
      base: ['Grapefruit'],
    },
    performance: { longevity: '6hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4,
    ratingCount: 5339,
  },
  {
    id: '70',
    name: "Eros Flame",
    brand: "Versace",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 160 },
      { size: '3ml', price: 240 },
      { size: '5ml', price: 400 },
      { size: '10ml', price: 720 },
      { size: '15ml', price: 1080 },
      { size: '30ml', price: 2080 }
    ],
    image: '/Images/versace-eros-flame.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 82 },
      { name: 'Vanilla', percentage: 81 },
      { name: 'Aromatic', percentage: 80 },
      { name: 'Woody', percentage: 75 }
    ],
    notes: {
      top: ['Mandarin Orange', 'Pepper', 'Lemon', 'Chinotto'],
      middle: ['Vanilla'],
      base: ['Vanilla', 'Tonka Bean'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: true, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.3,
    ratingCount: 17614,
  },
  {
    id: '71',
    name: "Versace Man Eau Fraiche",
    brand: "Versace",
    scentProfile: 'Woody',
    demographic: 'Masculine',
    volumes: [
      { size: '2ml', price: 100 },
      { size: '3ml', price: 150 },
      { size: '5ml', price: 250 },
      { size: '10ml', price: 450 },
      { size: '15ml', price: 675 },
      { size: '30ml', price: 1300 }
    ],
    image: '/Images/versace-versace-man-eau-fraiche.webp',
    mainAccords: [
      { name: 'Citrus', percentage: 100 },
      { name: 'Aromatic', percentage: 85 },
      { name: 'Woody', percentage: 82 },
      { name: 'Fruity', percentage: 74 },
      { name: 'Fresh Spicy', percentage: 73 }
    ],
    notes: {
      top: ['Lemon', 'Bergamot', 'Carambola (Star Fruit)'],
      middle: ['Bergamot'],
      base: ['Cedar', 'Musk', 'Woody Notes'],
    },
    performance: { longevity: '6hrs', sillage: 'Moderate' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: false, winter: false } },
    rating: 4.1,
    ratingCount: 16056,
  },
  {
    id: '72',
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 270 },
      { size: '3ml', price: 405 },
      { size: '5ml', price: 675 },
      { size: '10ml', price: 1215 },
      { size: '15ml', price: 1822 },
      { size: '30ml', price: 3510 }
    ],
    image: '/Images/yves-saint-laurent-black-opium.webp',
    mainAccords: [
      { name: 'Vanilla', percentage: 100 },
      { name: 'Coffee', percentage: 92 },
      { name: 'Sweet', percentage: 90 },
      { name: 'White Floral', percentage: 86 },
      { name: 'Warm Spicy', percentage: 85 }
    ],
    notes: {
      top: ['Pear', 'Pink Pepper'],
      middle: ['Jasmine'],
      base: ['Vanilla', 'Coffee', 'Patchouli'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: false, summer: false, autumn: true, winter: true } },
    rating: 3.9,
    ratingCount: 33460,
  },
  {
    id: '73',
    name: "LIBRE",
    brand: "Yves Saint Laurent",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 240 },
      { size: '3ml', price: 360 },
      { size: '5ml', price: 600 },
      { size: '10ml', price: 1080 },
      { size: '15ml', price: 1620 },
      { size: '30ml', price: 3120 }
    ],
    image: '/Images/yves-saint-laurent-libre.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Citrus', percentage: 90 },
      { name: 'Lavender', percentage: 87 },
      { name: 'Vanilla', percentage: 80 },
      { name: 'Aromatic', percentage: 75 }
    ],
    notes: {
      top: ['Lavender', 'Orange Blossom', 'Mandarin Orange'],
      middle: ['Jasmine'],
      base: ['Vanilla', 'Musk'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 3.9,
    ratingCount: 21041,
  },
  {
    id: '74',
    name: "MYSLF Le Parfum",
    brand: "Yves Saint Laurent",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 296 },
      
      { size: '3ml', price: 444 },
      { size: '5ml', price: 740 },
      { size: '10ml', price: 1332 },
      { size: '15ml', price: 1998 },
      { size: '30ml', price: 3848 }
    ],
    image: '/Images/yves-saint-laurent-myslf-le-parfum.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Vanilla', percentage: 90 },
      { name: 'Woody', percentage: 85 },
      { name: 'Citrus', percentage: 80 },
      { name: 'Amber', percentage: 78 }
    ],
    notes: {
      top: ['Orange Blossom', 'Vanilla'],
      middle: ['Amber', 'Woody Notes'],
      base: ['Pepper', 'Patchouli'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.3,
    ratingCount: 4318,
  },
  {
    id: '75',
    name: "Y Eau de Parfum",
    brand: "Yves Saint Laurent",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 270 },
      { size: '3ml', price: 405 },
      { size: '5ml', price: 675 },
      { size: '10ml', price: 1215 },
      { size: '15ml', price: 1822 },
      { size: '30ml', price: 3510 }
    ],
    image: '/Images/yves-saint-laurent-y-eau-de-parfum.webp',
    mainAccords: [
      { name: 'Aromatic', percentage: 100 },
      { name: 'Fresh Spicy', percentage: 99 },
      { name: 'Woody', percentage: 90 },
      { name: 'Fruity', percentage: 85 },
      { name: 'Fresh', percentage: 82 }
    ],
    notes: {
      top: ['Apple', 'Sage', 'Ginger', 'Bergamot'],
      middle: ['Sage'],
      base: ['Amberwood', 'Tonka Bean'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: true, autumn: true, winter: false } },
    rating: 4.4,
    ratingCount: 26029,
  },
  {
    id: '76',
    name: "Elegantly Tokyo",
    brand: "Zara",
    scentProfile: 'Woody',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 130 },
      { size: '3ml', price: 195 },
      { size: '5ml', price: 325 },
      { size: '10ml', price: 585 },
      { size: '15ml', price: 877.5 },
      { size: '30ml', price: 1690 }
    ],
    image: '/Images/zara-elegantly-tokyo.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Oud', percentage: 52 },
      { name: 'Woody', percentage: 50 },
      { name: 'Soft Spicy', percentage: 45 },
      { name: 'Animalic', percentage: 43 }
    ],
    notes: {
      top: ['Jasmine'],
      middle: ['Jasmine', 'Lily'],
      base: ['Akigalawood'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: false, winter: false } },
    rating: 4.2,
    ratingCount: 2185,
  },
  {
    id: '77',
    name: "Golden Decade",
    brand: "Zara",
    scentProfile: 'Floral',
    demographic: 'Unisex',
    volumes: [
      { size: '2ml', price: 100 },
      { size: '3ml', price: 150 },
      { size: '5ml', price: 250 },
      { size: '10ml', price: 450 },
      { size: '15ml', price: 675 },
      { size: '30ml', price: 1300 }
    ],
    image: '/Images/zara-golden-decade.webp',
    mainAccords: [
      { name: 'White Floral', percentage: 100 },
      { name: 'Vanilla', percentage: 88 },
      { name: 'Citrus', percentage: 87 },
      { name: 'Lavender', percentage: 78 },
      { name: 'Sweet', percentage: 75 }
    ],
    notes: {
      top: ['Orange Blossom', 'Lavender', 'Mandarin Orange'],
      middle: ['Jasmine'],
      base: ['Vanilla'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 4.3,
    ratingCount: 2449,
  },
  {
    id: '78',
    name: "Red Temptation For Her",
    brand: "Zara",
    scentProfile: 'Woody',
    demographic: 'Feminine',
    volumes: [
      { size: '2ml', price: 90 },
      { size: '3ml', price: 135 },
      { size: '5ml', price: 225 },
      { size: '10ml', price: 405 },
      { size: '15ml', price: 608 },
      { size: '30ml', price: 1170 }
    ],
    image: '/Images/zara-red-temptation-for-her.webp',
    mainAccords: [
      { name: 'Amber', percentage: 100 },
      { name: 'Mossy', percentage: 90 },
      { name: 'Earthy', percentage: 80 },
      { name: 'Warm Spicy', percentage: 78 },
      { name: 'Sweet', percentage: 76 }
    ],
    notes: {
      top: ['Amber', 'Oakmoss'],
      middle: ['Saffron', 'Praline'],
      base: ['Musk', 'Bitter Orange'],
    },
    performance: { longevity: '7hrs', sillage: 'Strong' },
    usage: { day: true, night: false, seasons: { spring: true, summer: false, autumn: true, winter: true } },
    rating: 3.7,
    ratingCount: 3461,
  }
];
