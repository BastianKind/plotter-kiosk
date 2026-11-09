import { useCallback, useRef, useState, type SyntheticEvent } from 'react';
import { wantsCapital } from '../components/Keyboard';

type El = HTMLInputElement | HTMLTextAreaElement;

function insertAt(el: El, text: string): string | null {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const max = el.maxLength > 0 ? el.maxLength : Infinity;
  if (el.value.length - (end - start) + text.length > max) return null;
  el.setRangeText(text, start, end, 'end');
  return el.value;
}

function deleteBack(el: El): string | null {
  let start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  if (start === end) {
    if (start === 0) return null;
    // Don't split an emoji or other two-part character.
    const code = el.value.charCodeAt(start - 1);
    start -= code >= 0xdc00 && code <= 0xdfff ? 2 : 1;
  }
  el.setRangeText('', start, end, 'end');
  return el.value;
}

/**
 * Connects the on-screen keyboard to whichever text field was used last.
 * `apply` receives the field element and its new value.
 */
export function useOnScreenTyping(apply: (el: El, value: string) => void) {
  const active = useRef<El | null>(null);
  const [caret, setCaret] = useState({ value: '', pos: 0 });

  const track = useCallback((el: El) => {
    active.current = el;
    setCaret({ value: el.value, pos: el.selectionStart ?? el.value.length });
  }, []);

  const bind = {
    onFocus: (e: SyntheticEvent<El>) => track(e.currentTarget),
    onSelect: (e: SyntheticEvent<El>) => track(e.currentTarget),
  };

  const edit = (fn: (el: El) => string | null) => {
    const el = active.current;
    if (!el) return;
    el.focus();
    const value = fn(el);
    if (value !== null) apply(el, value);
    track(el);
  };

  return {
    bind,
    active,
    autoCapital: wantsCapital(caret.value, caret.pos),
    type: (text: string) => edit((el) => insertAt(el, text)),
    backspace: () => edit(deleteBack),
  };
}
