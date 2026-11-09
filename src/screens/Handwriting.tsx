import { useMemo, useState } from 'react';
import { BottomBar, CardPreview, TopBar } from '../components/Chrome';
import { useToast } from '../components/Toast';
import { UiIcon } from '../components/UiIcon';
import { GlyphThumb, WritingPad } from '../components/WritingPad';
import { INKS } from '../data/catalog';
import { ALPHABET, neededChars } from '../lib/layout';
import { designOf, useStore } from '../state/store';
import type { Stroke } from '../types';

const NAMES: Record<string, string> = {
  '.': 'full stop',
  ',': 'comma',
  '!': 'exclamation mark',
  '?': 'question mark',
  '’': 'apostrophe',
  "'": 'apostrophe',
  '-': 'dash',
  ':': 'colon',
  ';': 'semicolon',
  '…': 'dots',
};

function describe(ch: string) {
  if (NAMES[ch]) return NAMES[ch];
  if (/\d/.test(ch)) return `number ${ch}`;
  if (ch.toLowerCase() !== ch.toUpperCase()) return ch === ch.toUpperCase() ? `capital ${ch}` : `small ${ch}`;
  return 'symbol';
}

type Mode = 'needed' | 'all';

export function Handwriting() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const needed = useMemo(() => neededChars(state), [state.opening, state.message, state.closing, state.address]); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState<Mode>(needed.length ? 'needed' : 'all');
  const list = mode === 'needed' ? needed : ALPHABET;
  const [index, setIndex] = useState(() => Math.max(0, list.findIndex((c) => !state.glyphs[c])));
  const ch = list[Math.min(index, list.length - 1)];
  const [draft, setDraft] = useState<Stroke[]>(() => state.glyphs[ch] ?? []);
  const ink = INKS[state.ink].color;

  // Saved letters plus the one on the pad right now.
  const glyphs = { ...state.glyphs, [ch]: draft };
  if (!draft.length) delete glyphs[ch];
  const done = list.filter((c) => glyphs[c]?.length).length;
  const last = index >= list.length - 1;

  const save = () => dispatch({ type: 'SET_GLYPH', ch, strokes: draft });
  const open = (i: number, l: string[]) => {
    setIndex(i);
    setDraft(glyphs[l[i]] ?? []);
  };
  const go = (i: number) => {
    if (i === index) return;
    save();
    open(i, list);
  };
  const switchMode = (m: Mode) => {
    if (m === mode) return;
    save();
    const l = m === 'needed' ? needed : ALPHABET;
    setMode(m);
    open(Math.max(0, l.findIndex((c) => !glyphs[c])), l);
  };
  const finish = () => {
    save();
    dispatch({ type: 'SET_HAND', hand: 'own' });
    dispatch({ type: 'GO', screen: 'style' });
    const missing = list.length - done;
    toast(missing > 0 ? `Your handwriting is ready. ${missing} skipped ${missing === 1 ? 'letter is' : 'letters are'} written in Jamie’s style.` : 'Your handwriting is ready.', 'success');
  };

  return (
    <>
      <TopBar />
      <main className="screen-body hw">
        <div className="hw-left">
          <h1 className="screen-title">Teach the machine your handwriting</h1>
          <div className="seg" role="radiogroup" aria-label="Which letters">
            <button type="button" role="radio" aria-checked={mode === 'needed'} className={mode === 'needed' ? 'is-on' : ''} onClick={() => switchMode('needed')} disabled={!needed.length}>
              Letters in my card ({needed.length})
            </button>
            <button type="button" role="radio" aria-checked={mode === 'all'} className={mode === 'all' ? 'is-on' : ''} onClick={() => switchMode('all')}>
              Whole alphabet ({ALPHABET.length})
            </button>
          </div>
          <div className="hw-target">
            <span className="hw-label">Write</span>
            <span className="hw-char">{ch}</span>
            <span className="hw-desc">{describe(ch)}</span>
          </div>
          <p className="hw-tip">Write it the way you always do and let it sit on the blue line. Capitals and tall letters go up to the top line.</p>
          <div className="hw-tools">
            <button type="button" className="btn btn-secondary" onClick={() => setDraft((d) => d.slice(0, -1))} disabled={!draft.length}>
              <UiIcon name="undo" />
              Undo
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setDraft([])} disabled={!draft.length}>
              <UiIcon name="trash" />
              Clear
            </button>
          </div>
        </div>

        <div className="hw-pad">
          <WritingPad key={`${mode}-${ch}`} strokes={draft} onChange={setDraft} ink={ink} guides="letter" label={`Writing pad for the letter ${ch}`} />
        </div>

        <div className="hw-right">
          <p className="hw-progress">
            <strong>{done}</strong> of {list.length} done
            <span className="hw-bar">
              <span style={{ width: `${(done / Math.max(1, list.length)) * 100}%` }} />
            </span>
          </p>
          <div className="hw-grid" role="list" aria-label="Letters">
            {list.map((c, i) => (
              <button key={c} type="button" role="listitem" className={`hw-cell${i === index ? ' is-current' : ''}${glyphs[c]?.length ? ' is-done' : ''}`} onClick={() => go(i)} aria-label={`${describe(c)}${glyphs[c]?.length ? ', done' : ''}`}>
                {glyphs[c]?.length ? <GlyphThumb strokes={glyphs[c]} ink={ink} /> : <span>{c}</span>}
              </button>
            ))}
          </div>
          <div className="hw-preview">
            <span className="hw-preview-label">Your card so far</span>
            <CardPreview design={{ ...designOf(state), hand: 'own', glyphs }} caption={false} />
          </div>
        </div>
      </main>
      <BottomBar
        back={{
          label: 'Back',
          onClick: () => {
            save();
            dispatch({ type: 'GO', screen: 'style' });
          },
        }}
        next={last ? { label: 'Finish', onClick: finish, icon: false } : { label: draft.length ? 'Next letter' : 'Skip letter', onClick: () => go(index + 1) }}
      >
        {!last && done > 0 && (
          <button type="button" className="btn btn-ghost" onClick={finish}>
            <UiIcon name="check" />
            I’m done, use these
          </button>
        )}
      </BottomBar>
    </>
  );
}
