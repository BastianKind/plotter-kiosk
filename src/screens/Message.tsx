import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { BottomBar, CardPreview, TopBar, useSheets } from '../components/Chrome';
import { Keyboard } from '../components/Keyboard';
import { UiIcon } from '../components/UiIcon';
import { PRODUCTS } from '../data/catalog';
import { OCCASIONS } from '../data/occasions';
import { useDevice } from '../lib/hooks';
import { useOnScreenTyping } from '../lib/typing';
import { designOf, useStore } from '../state/store';
import type { Field } from '../types';

const LIMITS: Record<Exclude<Field, 'message'>, number> = { opening: 40, closing: 60 };

export function Message() {
  const { state, dispatch } = useStore();
  const device = useDevice();
  const kiosk = device === 'kiosk';
  const product = PRODUCTS[state.product];
  const { card } = useSheets(state);
  const [field, setField] = useState<Field>('opening');
  const refs = {
    opening: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
    closing: useRef<HTMLTextAreaElement>(null),
  };

  const typing = useOnScreenTyping((el, value) => dispatch({ type: 'SET_FIELD', field: el.dataset.field as Field, value }));

  // On the machine the cursor starts at the end of the greeting, ready to change the name.
  useEffect(() => {
    if (!kiosk) return;
    const el = refs.opening.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kiosk]);

  const focusField = (f: Field) => {
    const el = refs[f].current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  };

  const common = (f: Field) => ({
    'data-field': f,
    value: state[f],
    inputMode: kiosk ? ('none' as const) : undefined,
    autoComplete: 'off',
    spellCheck: false,
    onChange: (e: { target: { value: string } }) => dispatch({ type: 'SET_FIELD', field: f, value: e.target.value }),
    onFocus: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setField(f);
      typing.bind.onFocus(e);
    },
    onSelect: typing.bind.onSelect,
  });

  const ideas = state.occasion ? OCCASIONS[state.occasion].ideas : [];
  const empty = !state.opening.trim() && !state.message.trim() && !state.closing.trim();

  return (
    <>
      <TopBar />
      <main className={`screen-body message${kiosk ? '' : ' is-phone'}`}>
        <div className="msg-top">
          <div className="msg-fields">
            <h1 className="screen-title">Write your message</h1>
            <label className={`field${field === 'opening' ? ' is-active' : ''}`}>
              <span className="field-label">Greeting</span>
              <input ref={refs.opening} {...common('opening')} maxLength={LIMITS.opening} placeholder="Dear …," />
            </label>
            <label className={`field${field === 'message' ? ' is-active' : ''}`}>
              <span className="field-label">
                Message
                <span className="field-count">
                  {state.message.length}/{product.maxMessage}
                </span>
              </span>
              <textarea ref={refs.message} {...common('message')} maxLength={product.maxMessage} rows={kiosk ? 3 : 5} placeholder="What would you like to say?" />
            </label>
            <label className={`field${field === 'closing' ? ' is-active' : ''}`}>
              <span className="field-label">Sign-off</span>
              <textarea ref={refs.closing} {...common('closing')} maxLength={LIMITS.closing} rows={2} placeholder={'Love,\nyour name'} />
            </label>
            {ideas.length > 0 && (
              <div className="ideas">
                <span className="ideas-label">
                  <UiIcon name="sparkle" size={18} />
                  Ideas
                </span>
                {ideas.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`idea${state.message === idea ? ' is-on' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'message', value: idea });
                      if (kiosk) window.setTimeout(() => focusField('message'), 0);
                    }}
                    title={idea}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="msg-preview">
            <CardPreview design={designOf(state)} />
            {card.overflow && (
              <p className="notice notice-warn" role="alert">
                <UiIcon name="alert" />
                <span>
                  That’s a lot for a {product.label.toLowerCase()}. Shorten it a little{state.product !== 'letter' ? ', or go back and pick the letter' : ''}.
                </span>
              </p>
            )}
          </div>
        </div>

        {kiosk && (
          <Keyboard
            onText={typing.type}
            onBackspace={typing.backspace}
            autoCapital={typing.autoCapital}
            enterLabel={field === 'opening' ? 'Next' : 'New line'}
            onEnter={() => (field === 'opening' ? focusField('message') : typing.type('\n'))}
          />
        )}
      </main>
      <BottomBar
        back={{ label: 'Back', onClick: () => dispatch({ type: 'GO', screen: 'occasion' }) }}
        next={{ label: 'Next', onClick: () => dispatch({ type: 'GO', screen: 'style' }), disabled: empty || card.overflow }}
      >
        {empty && <span className="bb-note">Write something to continue</span>}
      </BottomBar>
    </>
  );
}
