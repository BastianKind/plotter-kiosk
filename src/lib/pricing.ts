import { EXTRAS, PRODUCTS } from '../data/catalog';
import type { CardDesign } from '../types';

/** Swiss prices end in 5 Rappen steps. */
export const r05 = (x: number) => Math.round(x * 20) / 20;

export const chf = (x: number) => `CHF ${r05(x).toFixed(2)}`;

export interface QuoteLine {
  label: string;
  amount: number;
}

export function quote(d: Pick<CardDesign, 'product' | 'qty' | 'hand' | 'address' | 'stamp'>) {
  const p = PRODUCTS[d.product];
  const lines: QuoteLine[] = [{ label: `${d.qty} × ${p.label}`, amount: d.qty * p.price }];
  if (d.hand === 'own') lines.push({ label: 'Your own handwriting', amount: d.qty * EXTRAS.own });
  if (d.address) lines.push({ label: p.envelope ? 'Address on the envelope' : 'Address on the card', amount: d.qty * EXTRAS.address });
  if (d.address && d.stamp) lines.push({ label: 'A-Post stamp', amount: d.qty * EXTRAS.stamp });
  return { lines, total: r05(lines.reduce((sum, l) => sum + l.amount, 0)) };
}
