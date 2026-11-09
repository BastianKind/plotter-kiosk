import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { MAX_QTY } from '../data/catalog';
import { OCCASIONS } from '../data/occasions';
import type { Address, CardDesign, Drawing, Field, HandKey, InkKey, OccasionKey, PayMethod, ProductKey, Screen, Stroke } from '../types';

export interface State extends CardDesign {
  screen: Screen;
  /** The customer changed the text after picking an occasion. */
  edited: boolean;
  /** Phone: the code it sent the card under. Machine: the code it loaded the card from. */
  pickupCode: string | null;
  payMethod: PayMethod | null;
  orderNo: string | null;
}

export const NEW_DESIGN: CardDesign = {
  product: 'greeting',
  occasion: null,
  opening: '',
  message: '',
  closing: '',
  hand: 'jamie',
  ink: 'charcoal',
  glyphs: {},
  drawing: { kind: 'none' },
  qty: 1,
  address: null,
  stamp: false,
};

const INITIAL: State = { ...NEW_DESIGN, screen: 'welcome', edited: false, pickupCode: null, payMethod: null, orderNo: null };

export type Action =
  | { type: 'GO'; screen: Screen }
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'SET_PRODUCT'; product: ProductKey }
  | { type: 'SET_OCCASION'; occasion: OccasionKey }
  | { type: 'SET_FIELD'; field: Field; value: string }
  | { type: 'SET_HAND'; hand: HandKey }
  | { type: 'SET_INK'; ink: InkKey }
  | { type: 'SET_DRAWING'; drawing: Drawing }
  | { type: 'SET_GLYPH'; ch: string; strokes: Stroke[] }
  | { type: 'CLEAR_GLYPHS' }
  | { type: 'SET_QTY'; qty: number }
  | { type: 'SET_ADDRESS'; address: Address | null }
  | { type: 'SET_STAMP'; stamp: boolean }
  | { type: 'LOAD'; design: CardDesign; code: string }
  | { type: 'SENT'; code: string }
  | { type: 'PAID'; method: PayMethod };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'GO':
      return { ...s, screen: a.screen };
    case 'START':
      return { ...INITIAL, screen: 'card' };
    case 'RESET':
      return INITIAL;
    case 'SET_PRODUCT':
      return { ...s, product: a.product };
    case 'SET_OCCASION': {
      const o = OCCASIONS[a.occasion];
      const drawing: Drawing = s.drawing.kind === 'doodle' ? s.drawing : a.occasion === 'blank' ? { kind: 'none' } : { kind: 'icon', icon: o.icon };
      return { ...s, occasion: a.occasion, opening: o.opening, message: o.ideas[0] ?? '', closing: o.closing, drawing, edited: false };
    }
    case 'SET_FIELD':
      return { ...s, [a.field]: a.value, edited: true };
    case 'SET_HAND':
      return { ...s, hand: a.hand };
    case 'SET_INK':
      return { ...s, ink: a.ink };
    case 'SET_DRAWING':
      return { ...s, drawing: a.drawing };
    case 'SET_GLYPH': {
      const glyphs = { ...s.glyphs };
      if (a.strokes.length) glyphs[a.ch] = a.strokes;
      else delete glyphs[a.ch];
      return { ...s, glyphs };
    }
    case 'CLEAR_GLYPHS':
      return { ...s, glyphs: {}, hand: s.hand === 'own' ? 'jamie' : s.hand };
    case 'SET_QTY':
      return { ...s, qty: s.address ? 1 : Math.min(MAX_QTY, Math.max(1, a.qty)) };
    case 'SET_ADDRESS':
      return { ...s, address: a.address, qty: a.address ? 1 : s.qty, stamp: a.address ? s.stamp : false };
    case 'SET_STAMP':
      return { ...s, stamp: a.stamp };
    case 'LOAD':
      return { ...INITIAL, ...a.design, edited: true, pickupCode: a.code, screen: 'review' };
    case 'SENT':
      return { ...s, pickupCode: a.code, screen: 'sent' };
    case 'PAID':
      return { ...s, payMethod: a.method, orderNo: `K-${String(1000 + Math.floor(Math.random() * 9000))}`, screen: 'writing' };
  }
}

const StoreContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

/** Just the card part of the state (what a phone hands over to the machine). */
export function designOf(s: State): CardDesign {
  const { product, occasion, opening, message, closing, hand, ink, glyphs, drawing, qty, address, stamp } = s;
  return { product, occasion, opening, message, closing, hand, ink, glyphs, drawing, qty, address, stamp };
}
