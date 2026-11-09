import type { HandKey, IconKey, InkKey, ProductKey } from '../types';

export interface Product {
  label: string;
  blurb: string;
  /** Paper size in mm. */
  w: number;
  h: number;
  sizeLabel: string;
  price: number;
  /** Comes with an envelope (the address goes there instead of on the card). */
  envelope: { w: number; h: number; label: string } | null;
  /** Where the text may go, in mm. */
  area: { x: number; y: number; w: number; h: number };
  /** Starting type size in mm (shrinks to fit long messages). */
  size: number;
  /** Characters allowed in the main message. */
  maxMessage: number;
  paper: string;
}

export const PRODUCTS: Record<ProductKey, Product> = {
  greeting: {
    label: 'Greeting card',
    blurb: 'Folded card, we write on the inside. Comes with an envelope.',
    w: 105,
    h: 148,
    sizeLabel: 'A6, folded',
    price: 4.9,
    envelope: { w: 162, h: 114, label: 'C6 envelope' },
    area: { x: 11, y: 11, w: 83, h: 126 },
    size: 7,
    maxMessage: 280,
    paper: '#fdfbf4',
  },
  postcard: {
    label: 'Postcard',
    blurb: 'Your words on the left, the address on the right. Ready to post.',
    w: 148,
    h: 105,
    sizeLabel: 'A6',
    price: 2.9,
    envelope: null,
    area: { x: 8, y: 9, w: 59, h: 87 },
    size: 5.8,
    maxMessage: 220,
    paper: '#fffdf7',
  },
  letter: {
    label: 'Letter',
    blurb: 'A5 sheet for longer words. Comes with an envelope.',
    w: 148,
    h: 210,
    sizeLabel: 'A5',
    price: 3.9,
    envelope: { w: 229, h: 162, label: 'C5 envelope' },
    area: { x: 15, y: 16, w: 118, h: 178 },
    size: 7.4,
    maxMessage: 700,
    paper: '#fdfbf4',
  },
};

export const EXTRAS = {
  /** Per card, for writing with the customer's own letters. */
  own: 0.5,
  /** Per card, for writing the address on the envelope or postcard. */
  address: 0.5,
  /** Swiss Post A-Mail stamp, passed on at cost. */
  stamp: 1.2,
};

export const MAX_QTY = 5;

export interface Hand {
  label: string;
  note: string;
  family: string;
  /** Some fonts run larger than others; this evens them out. */
  factor: number;
}

export const HANDS: Record<Exclude<HandKey, 'own'>, Hand> = {
  jamie: { label: 'Jamie', note: 'Easy & natural', family: '"Caveat", "Segoe Print", cursive', factor: 1 },
  noah: { label: 'Noah', note: 'Neat & upright', family: '"Kalam", "Segoe Print", cursive', factor: 0.8 },
  lea: { label: 'Lea', note: 'Light & airy', family: '"Shadows Into Light Two", "Segoe Print", cursive', factor: 0.85 },
};

/** Letters the customer skipped are written in this style instead. */
export const FALLBACK_HAND = HANDS.jamie;

export const INKS: Record<InkKey, { label: string; color: string }> = {
  charcoal: { label: 'Charcoal', color: '#2b2d33' },
  blue: { label: 'Royal blue', color: '#1d3a9a' },
  sepia: { label: 'Sepia', color: '#5b3a22' },
};

export const ICON_LABELS: Record<IconKey, string> = {
  cake: 'Cake',
  gift: 'Gift',
  heart: 'Heart',
  flower: 'Flower',
  star: 'Star',
  sun: 'Sun',
  leaf: 'Leaf',
  smile: 'Smile',
  sparkle: 'Sparkle',
  mountain: 'Mountains',
  cup: 'Coffee',
  music: 'Music',
};

/** The machine this prototype pretends to be. */
export const MACHINE = { id: 'SG-01', place: 'St. Gallen, Marktgasse' };

export const WEB_SHOP_URL = 'https://bastiankind.github.io/plotter-web-shop/';
