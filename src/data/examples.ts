import type { CardDesign } from '../types';

/** The card the machine writes over and over on its start screen. */
export const DEMO_CARD: CardDesign = {
  product: 'greeting',
  occasion: 'birthday',
  opening: 'Dear Anna,',
  message: 'Happy birthday! I hope your day is full of cake, sunshine and the people you love.',
  closing: 'Love,\nBen',
  hand: 'jamie',
  ink: 'blue',
  glyphs: {},
  drawing: { kind: 'icon', icon: 'cake' },
  qty: 1,
  address: null,
  stamp: false,
};

/** Loaded at the machine when a pickup code isn't found on this device (the prototype has no server). */
export const EXAMPLE_PHONE_ORDER: CardDesign = {
  product: 'postcard',
  occasion: 'thanks',
  opening: 'Dear Grandma,',
  message: 'Thank you so much for the lovely weekend. The garden was beautiful!',
  closing: 'Big hug,\nMia',
  hand: 'lea',
  ink: 'sepia',
  glyphs: {},
  drawing: { kind: 'icon', icon: 'flower' },
  qty: 1,
  address: { name: 'Rosa Meier', street: 'Lindenweg 4', city: '9400 Rorschach' },
  stamp: true,
};

/** Shows what each kind of card looks like on the "choose your card" screen. */
export const PRODUCT_SAMPLE: Pick<CardDesign, 'opening' | 'message' | 'closing'> = {
  opening: 'Dear Anna,',
  message: 'Thank you so much for your help. It meant more to me than you know.',
  closing: 'With thanks,\nBen',
};
