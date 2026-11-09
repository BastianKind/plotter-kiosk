import { useState } from 'react';
import { BottomBar, TopBar } from '../components/Chrome';
import { Modal } from '../components/Modal';
import { PaperIcon } from '../components/PaperIcon';
import { UiIcon } from '../components/UiIcon';
import { OCCASIONS, OCCASION_ORDER } from '../data/occasions';
import { useStore } from '../state/store';
import type { OccasionKey } from '../types';

export function Occasion() {
  const { state, dispatch } = useStore();
  const [replace, setReplace] = useState<OccasionKey | null>(null);

  const pick = (key: OccasionKey) => {
    if (key === state.occasion) {
      dispatch({ type: 'GO', screen: 'message' });
      return;
    }
    // Picking another occasion fills in new text, so ask before throwing away what they wrote.
    if (state.edited && (state.message || state.opening)) {
      setReplace(key);
      return;
    }
    dispatch({ type: 'SET_OCCASION', occasion: key });
    dispatch({ type: 'GO', screen: 'message' });
  };

  return (
    <>
      <TopBar />
      <main className="screen-body occasion">
        <h1 className="screen-title">What’s the occasion?</h1>
        <p className="screen-sub">We’ll suggest a few words and a little drawing. You can change everything.</p>
        <div className="occasions">
          {OCCASION_ORDER.map((key) => {
            const o = OCCASIONS[key];
            const on = state.occasion === key;
            return (
              <button key={key} type="button" className={`occ${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => pick(key)}>
                <span className="occ-art">
                  <PaperIcon icon={o.icon} />
                </span>
                <span className="occ-label">{o.label}</span>
                {key === 'blank' && <span className="occ-note">Start with a blank card</span>}
              </button>
            );
          })}
        </div>
      </main>
      <BottomBar
        back={{ label: 'Back', onClick: () => dispatch({ type: 'GO', screen: 'card' }) }}
        next={{ label: 'Next', onClick: () => dispatch({ type: 'GO', screen: 'message' }), disabled: !state.occasion }}
      >
        {!state.occasion && <span className="bb-note">Tap an occasion to continue</span>}
      </BottomBar>

      <Modal
        open={replace !== null}
        onClose={() => setReplace(null)}
        title="Replace your text?"
        size="sm"
        footer={
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setReplace(null);
                dispatch({ type: 'GO', screen: 'message' });
              }}
            >
              Keep my text
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (replace) dispatch({ type: 'SET_OCCASION', occasion: replace });
                setReplace(null);
                dispatch({ type: 'GO', screen: 'message' });
              }}
            >
              <UiIcon name="refresh" />
              Use new text
            </button>
          </div>
        }
      >
        <p>
          You already wrote something. Should we replace it with words for “{replace ? OCCASIONS[replace].label : ''}”?
        </p>
      </Modal>
    </>
  );
}
