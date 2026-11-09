import { useState } from 'react';
import { BottomBar, CardPreview, TopBar } from '../components/Chrome';
import { Modal } from '../components/Modal';
import { PaperIcon } from '../components/PaperIcon';
import { UiIcon } from '../components/UiIcon';
import { WritingPad } from '../components/WritingPad';
import { EXTRAS, HANDS, ICON_LABELS, INKS } from '../data/catalog';
import { neededChars } from '../lib/layout';
import { chf } from '../lib/pricing';
import { toPath } from '../lib/strokes';
import { designOf, useStore } from '../state/store';
import type { HandKey, IconKey, InkKey, Stroke } from '../types';

const ICONS = Object.keys(ICON_LABELS) as IconKey[];

export function Style() {
  const { state, dispatch } = useStore();
  const [doodle, setDoodle] = useState(false);
  const ink = INKS[state.ink].color;
  const glyphCount = Object.keys(state.glyphs).length;
  const missing = state.hand === 'own' ? neededChars(state).filter((ch) => !state.glyphs[ch]) : [];

  const pickHand = (hand: HandKey) => {
    if (hand === 'own' && glyphCount === 0) dispatch({ type: 'GO', screen: 'handwriting' });
    else dispatch({ type: 'SET_HAND', hand });
  };

  return (
    <>
      <TopBar />
      <main className="screen-body style">
        <div className="style-preview">
          <CardPreview design={designOf(state)} />
        </div>

        <div className="style-panel">
          <h1 className="screen-title">Make it look like you</h1>

          <section className="style-section">
            <h2>Handwriting</h2>
            <div className="hands" role="radiogroup" aria-label="Handwriting">
              {(Object.keys(HANDS) as Exclude<HandKey, 'own'>[]).map((key) => {
                const h = HANDS[key];
                return (
                  <button key={key} type="button" role="radio" aria-checked={state.hand === key} className={`hand${state.hand === key ? ' is-on' : ''}`} onClick={() => pickHand(key)}>
                    <span className="hand-sample" style={{ fontFamily: h.family, fontSize: `${1.9 * h.factor}em` }}>
                      Hello!
                    </span>
                    <span className="hand-name">{h.label}</span>
                    <span className="hand-note">{h.note}</span>
                  </button>
                );
              })}
              <button type="button" role="radio" aria-checked={state.hand === 'own'} className={`hand hand-own${state.hand === 'own' ? ' is-on' : ''}`} onClick={() => pickHand('own')}>
                <span className="hand-sample hand-own-icon">
                  <UiIcon name="pen" size={30} />
                </span>
                <span className="hand-name">Your own</span>
                <span className="hand-note">+ {chf(EXTRAS.own)}</span>
              </button>
            </div>
            {glyphCount > 0 && (
              <div className="own-row">
                <span className="muted">
                  {glyphCount} of your letters saved{missing.length > 0 && state.hand === 'own' ? `, ${missing.length} still missing` : ''}.
                </span>
                <button type="button" className="btn-link" onClick={() => dispatch({ type: 'GO', screen: 'handwriting' })}>
                  {missing.length ? 'Add the missing letters' : 'Change my letters'}
                </button>
              </div>
            )}
            {state.hand === 'own' && missing.length > 0 && (
              <p className="tiny">
                Missing: <span className="missing-chars">{missing.slice(0, 12).join(' ')}</span>
                {missing.length > 12 ? ' …' : ''} · these are written in Jamie’s style.
              </p>
            )}
          </section>

          <section className="style-section">
            <h2>Ink</h2>
            <div className="inks" role="radiogroup" aria-label="Ink colour">
              {(Object.keys(INKS) as InkKey[]).map((key) => (
                <button key={key} type="button" role="radio" aria-checked={state.ink === key} className={`ink${state.ink === key ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SET_INK', ink: key })}>
                  <span className="ink-dot" style={{ background: INKS[key].color }} />
                  {INKS[key].label}
                </button>
              ))}
            </div>
          </section>

          <section className="style-section">
            <h2>A little drawing</h2>
            <div className="drawings" role="radiogroup" aria-label="Drawing">
              <button type="button" role="radio" aria-checked={state.drawing.kind === 'none'} className={`drw drw-none${state.drawing.kind === 'none' ? ' is-on' : ''}`} onClick={() => dispatch({ type: 'SET_DRAWING', drawing: { kind: 'none' } })}>
                <span>None</span>
              </button>
              {ICONS.map((icon) => {
                const on = state.drawing.kind === 'icon' && state.drawing.icon === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={ICON_LABELS[icon]}
                    title={ICON_LABELS[icon]}
                    className={`drw${on ? ' is-on' : ''}`}
                    style={{ color: ink }}
                    onClick={() => dispatch({ type: 'SET_DRAWING', drawing: { kind: 'icon', icon } })}
                  >
                    <PaperIcon icon={icon} />
                  </button>
                );
              })}
              <button
                type="button"
                role="radio"
                aria-checked={state.drawing.kind === 'doodle'}
                className={`drw drw-own${state.drawing.kind === 'doodle' ? ' is-on' : ''}`}
                onClick={() => setDoodle(true)}
              >
                {state.drawing.kind === 'doodle' ? <DoodleThumb strokes={state.drawing.strokes} ink={ink} /> : <UiIcon name="pen" />}
                <span>{state.drawing.kind === 'doodle' ? 'Edit' : 'Draw'}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
      <BottomBar
        back={{ label: 'Back', onClick: () => dispatch({ type: 'GO', screen: 'message' }) }}
        next={{ label: 'Next', onClick: () => dispatch({ type: 'GO', screen: 'review' }) }}
      />
      <DoodleModal
        open={doodle}
        initial={state.drawing.kind === 'doodle' ? state.drawing.strokes : []}
        ink={ink}
        onClose={() => setDoodle(false)}
        onSave={(strokes) => {
          dispatch({ type: 'SET_DRAWING', drawing: strokes.length ? { kind: 'doodle', strokes } : { kind: 'none' } });
          setDoodle(false);
        }}
      />
    </>
  );
}

function DoodleThumb({ strokes, ink }: { strokes: Stroke[]; ink: string }) {
  return (
    <svg viewBox="0 0 240 240" className="doodle-thumb" aria-hidden="true">
      <g fill="none" stroke={ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((s, i) => (
          <path key={i} d={toPath(s)} />
        ))}
      </g>
    </svg>
  );
}

function DoodleModal({ open, initial, ink, onClose, onSave }: { open: boolean; initial: Stroke[]; ink: string; onClose: () => void; onSave: (s: Stroke[]) => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>(initial);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStrokes(initial);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Draw something small"
      size="md"
      footer={
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onSave(strokes)}>
            {strokes.length ? 'Use this drawing' : 'No drawing'}
          </button>
        </div>
      }
    >
      <div className="doodle">
        <WritingPad strokes={strokes} onChange={setStrokes} ink={ink} guides="free" label="Drawing pad" className="doodle-pad" />
        <div className="doodle-side">
          <p className="muted">Draw with your finger or the pen. Simple lines work best, the machine draws them with a real pen at the top of your card.</p>
          <button type="button" className="btn btn-secondary" onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={!strokes.length}>
            <UiIcon name="undo" />
            Undo
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setStrokes([])} disabled={!strokes.length}>
            <UiIcon name="trash" />
            Clear
          </button>
        </div>
      </div>
    </Modal>
  );
}
