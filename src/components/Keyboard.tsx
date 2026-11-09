import { useState } from 'react';
import { UiIcon } from './UiIcon';

type Special = 'shift' | 'back' | 'space' | 'enter' | '123' | 'abc';

const ABC: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
  ['shift', 'y', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'back'],
  ['123', '?', '!', 'space', '’', '-', 'enter'],
];

const NUM: string[][] = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '&', '(', ')', '/', ':', ';', '"', '+'],
  ['%', '*', '=', '€', '…', '.', ',', '?', '!', 'back'],
  ['abc', '’', 'space', '-', 'enter'],
];

const SPECIAL = new Set(['shift', 'back', 'space', 'enter', '123', 'abc']);

interface Props {
  onText: (text: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  enterLabel?: string;
  /** Start of a field or sentence: the next letter is a capital. */
  autoCapital?: boolean;
}

/** Swiss (QWERTZ) on-screen keyboard for the touch screen. Keys never take the focus away from the field. */
export function Keyboard({ onText, onBackspace, onEnter, enterLabel = 'New line', autoCapital }: Props) {
  const [layer, setLayer] = useState<'abc' | '123'>('abc');
  const [shift, setShift] = useState<'auto' | 'on' | 'off'>('auto');
  const caps = shift === 'on' || (shift === 'auto' && !!autoCapital);

  const press = (key: string) => {
    if (!SPECIAL.has(key)) {
      onText(caps && layer === 'abc' ? key.toUpperCase() : key);
      setShift('auto');
      return;
    }
    switch (key as Special) {
      case 'shift':
        setShift(caps ? 'off' : 'on');
        break;
      case 'back':
        onBackspace();
        break;
      case 'space':
        onText(' ');
        break;
      case 'enter':
        onEnter();
        setShift('auto');
        break;
      case '123':
        setLayer('123');
        break;
      case 'abc':
        setLayer('abc');
        break;
    }
  };

  const rows = layer === 'abc' ? ABC : NUM;
  return (
    <div className="keyboard" role="group" aria-label="On-screen keyboard">
      {rows.map((row, r) => (
        <div className="kb-row" key={r}>
          {row.map((key) => (
            <button
              key={key}
              type="button"
              tabIndex={-1}
              className={`kb-key kb-${SPECIAL.has(key) ? key : 'char'}${key === 'shift' && caps ? ' is-on' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => press(key)}
              aria-label={LABELS[key] ?? key}
            >
              {renderKey(key, caps && layer === 'abc', enterLabel)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

const LABELS: Record<string, string> = {
  shift: 'Shift',
  back: 'Delete',
  space: 'Space',
  enter: 'Enter',
  '123': 'Numbers and symbols',
  abc: 'Letters',
  '’': 'Apostrophe',
};

function renderKey(key: string, caps: boolean, enterLabel: string) {
  switch (key) {
    case 'shift':
      return <UiIcon name="shift" />;
    case 'back':
      return <UiIcon name="backspace" />;
    case 'space':
      return <span className="kb-space-label">space</span>;
    case 'enter':
      return (
        <>
          <UiIcon name="enter" size={20} />
          <span>{enterLabel}</span>
        </>
      );
    case '123':
      return '123';
    case 'abc':
      return 'ABC';
    default:
      return caps ? key.toUpperCase() : key;
  }
}

/** Where the caret is, a capital letter would be expected. */
export function wantsCapital(value: string, caret: number) {
  const before = value.slice(0, caret).replace(/ +$/, '');
  return before === '' || /[.!?\n]$/.test(before);
}
