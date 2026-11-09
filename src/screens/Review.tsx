import { useEffect, useRef, useState } from 'react';
import { BottomBar, TopBar, useSheets } from '../components/Chrome';
import { Keyboard } from '../components/Keyboard';
import { Modal } from '../components/Modal';
import { QrCode } from '../components/QrCode';
import { Sheet } from '../components/Sheet';
import { UiIcon } from '../components/UiIcon';
import { EXTRAS, HANDS, ICON_LABELS, INKS, MACHINE, MAX_QTY, PRODUCTS } from '../data/catalog';
import { OCCASIONS } from '../data/occasions';
import { newPickupCode, savePickup } from '../lib/handoff';
import { useDevice, useMachine } from '../lib/hooks';
import { aboutMinutes, writingSeconds } from '../lib/layout';
import { chf, quote } from '../lib/pricing';
import { useOnScreenTyping } from '../lib/typing';
import { designOf, useStore } from '../state/store';
import type { Address, PayMethod, Screen } from '../types';

export function Review() {
  const { state, dispatch } = useStore();
  const kiosk = useDevice() === 'kiosk';
  const { card, envelope } = useSheets(state);
  const [tab, setTab] = useState<'card' | 'envelope'>('card');
  const [addressOpen, setAddressOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const p = PRODUCTS[state.product];
  const q = quote(state);
  const seconds = writingSeconds([card, envelope], state.qty);
  const ink = INKS[state.ink].color;
  const showEnvelope = tab === 'envelope' && envelope;

  const rows: [string, string, Screen][] = [
    ['Card', `${p.label} · ${p.sizeLabel}`, 'card'],
    ['Occasion', state.occasion ? OCCASIONS[state.occasion].label : '–', 'occasion'],
    ['Handwriting', state.hand === 'own' ? 'Your own' : HANDS[state.hand].label, 'style'],
    ['Ink · drawing', `${INKS[state.ink].label} · ${state.drawing.kind === 'none' ? 'no drawing' : state.drawing.kind === 'icon' ? ICON_LABELS[state.drawing.icon] : 'your drawing'}`, 'style'],
  ];

  const send = () => {
    const code = state.pickupCode ?? newPickupCode();
    savePickup(code, designOf(state));
    dispatch({ type: 'SENT', code });
  };

  return (
    <>
      <TopBar />
      <main className="screen-body review">
        <div className="review-stage">
          {envelope && (
            <div className="seg seg-sm" role="tablist" aria-label="Show">
              <button type="button" role="tab" aria-selected={tab === 'card'} className={tab === 'card' ? 'is-on' : ''} onClick={() => setTab('card')}>
                Card
              </button>
              <button type="button" role="tab" aria-selected={tab === 'envelope'} className={tab === 'envelope' ? 'is-on' : ''} onClick={() => setTab('envelope')}>
                Envelope
              </button>
            </div>
          )}
          <div className={`review-sheet${showEnvelope ? ' is-envelope' : ` is-${state.product}`}`}>
            {showEnvelope ? (
              <Sheet sheet={envelope} ink={ink} label="Preview of the envelope" />
            ) : (
              <Sheet sheet={card} ink={ink} label={`Preview of your ${p.label.toLowerCase()}`} />
            )}
          </div>
          <p className="review-caption">
            {showEnvelope ? p.envelope?.label : `${p.label} · ${p.sizeLabel}`}
            {state.qty > 1 && ` · ${state.qty} copies`}
          </p>
        </div>

        <div className="review-panel">
          {kiosk && state.pickupCode && (
            <p className="notice notice-info">
              <UiIcon name="phone" />
              <span>Your card from your phone (code {state.pickupCode}). Check it and pay below.</span>
            </p>
          )}
          <h1 className="screen-title">Check your card</h1>
          <dl className="summary">
            {rows.map(([label, value, screen]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
                <button type="button" className="btn-link" onClick={() => dispatch({ type: 'GO', screen })}>
                  Change
                </button>
              </div>
            ))}
          </dl>

          <div className="opt">
            <div className="opt-text">
              <strong>How many?</strong>
              <span className="muted small">{state.address ? 'One address, one card.' : `The same card, up to ${MAX_QTY} times.`}</span>
            </div>
            <div className="stepper" aria-label="Number of cards">
              <button type="button" aria-label="One less" disabled={state.qty <= 1} onClick={() => dispatch({ type: 'SET_QTY', qty: state.qty - 1 })}>
                <UiIcon name="minus" />
              </button>
              <output aria-live="polite">{state.qty}</output>
              <button type="button" aria-label="One more" disabled={state.qty >= MAX_QTY || !!state.address} onClick={() => dispatch({ type: 'SET_QTY', qty: state.qty + 1 })}>
                <UiIcon name="plus" />
              </button>
            </div>
          </div>

          <div className="opt">
            <div className="opt-text">
              <strong>{p.envelope ? 'Address on the envelope' : 'Address on the card'}</strong>
              {state.address ? (
                <span className="addr-line">
                  {state.address.name}, {state.address.street}, {state.address.city}
                </span>
              ) : (
                <span className="muted small">Written by the same pen · + {chf(EXTRAS.address)}</span>
              )}
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setAddressOpen(true)}>
              <UiIcon name={state.address ? 'pen' : 'plus'} />
              {state.address ? 'Edit' : 'Add'}
            </button>
          </div>

          <label className={`opt opt-check${state.address ? '' : ' is-disabled'}`}>
            <input type="checkbox" checked={state.stamp} disabled={!state.address} onChange={(e) => dispatch({ type: 'SET_STAMP', stamp: e.target.checked })} />
            <span className="check-box" aria-hidden="true">
              <UiIcon name="check" size={18} />
            </span>
            <span className="opt-text">
              <strong>A-Post stamp · + {chf(EXTRAS.stamp)}</strong>
              <span className="muted small">{state.address ? 'Ready to drop in any letterbox.' : 'Add an address first.'}</span>
            </span>
          </label>

          <div className="price">
            {q.lines.map((l) => (
              <div key={l.label} className="price-line">
                <span>{l.label}</span>
                <span>{chf(l.amount)}</span>
              </div>
            ))}
            <div className="price-total">
              <span>Total</span>
              <span>{chf(q.total)}</span>
            </div>
            <p className="price-time">
              <UiIcon name="clock" size={18} />
              Ready {aboutMinutes(seconds)} after paying
            </p>
          </div>
        </div>
      </main>
      <BottomBar
        back={{ label: 'Back', onClick: () => dispatch({ type: 'GO', screen: 'style' }) }}
        next={kiosk ? { label: `Pay ${chf(q.total)}`, onClick: () => setPayOpen(true) } : { label: 'Send to the machine', onClick: send }}
      >
        {!kiosk && <span className="bb-note">You pay at the machine</span>}
      </BottomBar>

      <AddressModal open={addressOpen} onClose={() => setAddressOpen(false)} />
      {kiosk && <PaymentModal open={payOpen} total={q.total} onClose={() => setPayOpen(false)} />}
    </>
  );
}

const EMPTY: Address = { name: '', street: '', city: '' };
const ADDRESS_FIELDS: { key: keyof Address; label: string; placeholder: string }[] = [
  { key: 'name', label: 'Name', placeholder: 'Anna Muster' },
  { key: 'street', label: 'Street and number', placeholder: 'Bahnhofstrasse 1' },
  { key: 'city', label: 'Postcode and town', placeholder: '9000 St. Gallen' },
];

function AddressModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const kiosk = useDevice() === 'kiosk';
  const [a, setA] = useState<Address>(state.address ?? EMPTY);
  const [field, setField] = useState<keyof Address>('name');
  const [wasOpen, setWasOpen] = useState(open);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setA(state.address ?? EMPTY);
      setField('name');
    }
  }
  const typing = useOnScreenTyping((el, value) => setA((prev) => ({ ...prev, [el.dataset.field as keyof Address]: value })));

  useEffect(() => {
    if (!open || !kiosk) return;
    const t = window.setTimeout(() => refs.current.name?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open, kiosk]);

  const valid = a.name.trim() && a.street.trim() && a.city.trim();
  const postcodeHint = a.city.trim() && !/^\d{4}\s+\S/.test(a.city.trim());
  const save = () => {
    dispatch({ type: 'SET_ADDRESS', address: { name: a.name.trim(), street: a.street.trim(), city: a.city.trim() } });
    onClose();
  };
  const next = () => {
    const i = ADDRESS_FIELDS.findIndex((f) => f.key === field);
    if (i < ADDRESS_FIELDS.length - 1) refs.current[ADDRESS_FIELDS[i + 1].key]?.focus();
    else if (valid) save();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Who is it for?"
      size={kiosk ? 'lg' : 'md'}
      footer={
        <div className="modal-actions">
          {state.address && (
            <button
              type="button"
              className="btn btn-ghost btn-danger-text"
              onClick={() => {
                dispatch({ type: 'SET_ADDRESS', address: null });
                onClose();
              }}
            >
              <UiIcon name="trash" />
              Remove address
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-lg" disabled={!valid} onClick={save}>
            Save address
          </button>
        </div>
      }
    >
      <div className="addr-form">
        {ADDRESS_FIELDS.map((f) => (
          <label key={f.key} className={`field${field === f.key ? ' is-active' : ''}`}>
            <span className="field-label">{f.label}</span>
            <input
              ref={(el) => {
                refs.current[f.key] = el;
              }}
              data-field={f.key}
              value={a[f.key]}
              maxLength={40}
              placeholder={f.placeholder}
              inputMode={kiosk ? 'none' : f.key === 'city' ? 'text' : undefined}
              autoComplete="off"
              onChange={(e) => setA((prev) => ({ ...prev, [f.key]: e.target.value }))}
              onFocus={(e) => {
                setField(f.key);
                typing.bind.onFocus(e);
              }}
              onSelect={typing.bind.onSelect}
              onKeyDown={(e) => e.key === 'Enter' && next()}
            />
          </label>
        ))}
        {postcodeHint && <p className="tiny">Start with the 4-digit postcode, e.g. “9000 St. Gallen”.</p>}
      </div>
      {kiosk && <Keyboard onText={typing.type} onBackspace={typing.backspace} autoCapital={typing.autoCapital} enterLabel={field === 'city' ? 'Done' : 'Next'} onEnter={next} />}
    </Modal>
  );
}

type Stage = 'choose' | PayMethod | 'approved';

function PaymentModal({ open, total, onClose }: { open: boolean; total: number; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const machine = useMachine();
  const [stage, setStage] = useState<Stage>('choose');
  const [counterCode] = useState(() => newPickupCode());
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStage('choose');
  }

  const approve = (method: PayMethod) => {
    setStage('approved');
    window.setTimeout(() => {
      dispatch({ type: 'PAID', method });
      onClose();
    }, 1400);
  };

  // The card reader under the screen lights up while waiting for a card. In the prototype the payment goes through by itself.
  useEffect(() => {
    if (!open || (stage !== 'card' && stage !== 'twint')) return;
    if (stage === 'card') machine.setReader(true);
    const t = window.setTimeout(() => approve(stage), stage === 'card' ? 5000 : 7000);
    return () => {
      window.clearTimeout(t);
      machine.setReader(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stage]);

  const busy = stage === 'approved';
  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title={stage === 'approved' ? 'Paid, thank you!' : `Pay ${chf(total)}`} size="md">
      {stage === 'choose' && (
        <div className="pay-options">
          <button type="button" className="pay-option" onClick={() => setStage('card')}>
            <UiIcon name="contactless" size={40} />
            <strong>Card or phone</strong>
            <span>Debit, credit, Apple Pay, Google Pay</span>
          </button>
          <button type="button" className="pay-option" onClick={() => setStage('twint')}>
            <UiIcon name="qr" size={40} />
            <strong>TWINT</strong>
            <span>Scan a code with the app</span>
          </button>
          <button type="button" className="pay-option" onClick={() => setStage('counter')}>
            <UiIcon name="shop" size={40} />
            <strong>At the counter</strong>
            <span>Cash or card at the till</span>
          </button>
        </div>
      )}

      {stage === 'card' && (
        <div className="pay-wait">
          <div className="pay-tap">
            <UiIcon name="contactless" size={64} />
          </div>
          <p className="pay-big">Hold your card or phone to the reader below the screen.</p>
          <p className="pay-arrow">
            <UiIcon name="arrowDown" size={36} />
          </p>
          <PayFoot onBack={() => setStage('choose')} onSimulate={() => approve('card')} />
        </div>
      )}

      {stage === 'twint' && (
        <div className="pay-wait">
          <QrCode value={`plotter prototype · machine ${MACHINE.id} · CHF ${total.toFixed(2)} · no real payment`} size={190} label="Payment QR code (prototype, no real payment)" />
          <p className="pay-big">Open the TWINT app and scan this code.</p>
          <PayFoot onBack={() => setStage('choose')} onSimulate={() => approve('twint')} />
        </div>
      )}

      {stage === 'counter' && (
        <div className="pay-wait">
          <p className="pay-big">Pay at the counter and show this code:</p>
          <p className="pay-code">{state.pickupCode ?? counterCode}</p>
          <p className="muted">The machine starts writing as soon as the staff confirm your payment.</p>
          <PayFoot onBack={() => setStage('choose')} onSimulate={() => approve('counter')} simulateLabel="Prototype: staff confirmed" />
        </div>
      )}

      {stage === 'approved' && (
        <div className="pay-wait">
          <div className="pay-ok">
            <UiIcon name="check" size={56} />
          </div>
          <p className="pay-big">The pen is getting ready…</p>
        </div>
      )}
    </Modal>
  );
}

function PayFoot({ onBack, onSimulate, simulateLabel = 'Prototype: simulate payment' }: { onBack: () => void; onSimulate: () => void; simulateLabel?: string }) {
  return (
    <div className="pay-foot">
      <button type="button" className="btn btn-secondary" onClick={onBack}>
        <UiIcon name="arrowLeft" />
        Other way to pay
      </button>
      <button type="button" className="btn-link" onClick={onSimulate}>
        {simulateLabel}
      </button>
    </div>
  );
}
