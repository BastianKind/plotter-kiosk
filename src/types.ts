export type Device = 'kiosk' | 'phone';

export type Screen =
  | 'welcome'
  | 'card'
  | 'occasion'
  | 'message'
  | 'style'
  | 'handwriting'
  | 'review'
  | 'writing'
  | 'done'
  | 'sent';

export type ProductKey = 'greeting' | 'postcard' | 'letter';
export type OccasionKey = 'birthday' | 'thanks' | 'congrats' | 'love' | 'getwell' | 'sympathy' | 'hello' | 'blank';
export type HandKey = 'jamie' | 'noah' | 'lea' | 'own';
export type InkKey = 'charcoal' | 'blue' | 'sepia';
export type Field = 'opening' | 'message' | 'closing';
export type PayMethod = 'card' | 'twint' | 'counter';

export type IconKey =
  | 'sun'
  | 'flower'
  | 'leaf'
  | 'star'
  | 'mountain'
  | 'sparkle'
  | 'heart'
  | 'smile'
  | 'gift'
  | 'cake'
  | 'cup'
  | 'music';

/** A point on a writing pad or on paper. */
export type Pt = [number, number];
/** One pen-down movement. */
export type Stroke = Pt[];
/** The customer's own letters, drawn on the writing pad: character → strokes in pad units. */
export type Glyphs = Record<string, Stroke[]>;

export type Drawing = { kind: 'none' } | { kind: 'icon'; icon: IconKey } | { kind: 'doodle'; strokes: Stroke[] };

export interface Address {
  name: string;
  street: string;
  city: string;
}

/** Everything that describes the card itself. A phone hands exactly this over to the machine. */
export interface CardDesign {
  product: ProductKey;
  occasion: OccasionKey | null;
  opening: string;
  message: string;
  closing: string;
  hand: HandKey;
  ink: InkKey;
  glyphs: Glyphs;
  drawing: Drawing;
  qty: number;
  address: Address | null;
  stamp: boolean;
}
