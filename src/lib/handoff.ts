import type { CardDesign } from '../types';

/**
 * Phone → machine hand-off. A real machine would fetch the design from a server by its pickup code.
 * The prototype has no server, so the design is kept in this browser's storage: it works when the
 * phone view and the machine view run in the same browser (two tabs or windows), not across devices.
 */
const KEY = 'plotter-kiosk:pickup:';

export function newPickupCode() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export function savePickup(code: string, design: CardDesign) {
  try {
    localStorage.setItem(KEY + code, JSON.stringify({ design, savedAt: Date.now() }));
  } catch {
    /* storage can be blocked (private mode); the code then only works with the example order */
  }
}

export function loadPickup(code: string): CardDesign | null {
  try {
    const raw = localStorage.getItem(KEY + code);
    if (!raw) return null;
    return (JSON.parse(raw) as { design: CardDesign }).design;
  } catch {
    return null;
  }
}

/** Until when a pickup code stays valid: end of today's opening hours (18:30), or two hours from now. */
export function validUntil(now = new Date()) {
  const close = new Date(now);
  close.setHours(18, 30, 0, 0);
  const until = close.getTime() - now.getTime() > 60 * 60 * 1000 ? close : new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return until.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
}
