import { useState } from 'react';
import logo from '../assets/logo.svg';
import { HelpModal, useSheets } from '../components/Chrome';
import { Modal } from '../components/Modal';
import { QrCode } from '../components/QrCode';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { UiIcon } from '../components/UiIcon';
import { INKS, MACHINE } from '../data/catalog';
import { DEMO_CARD, EXAMPLE_PHONE_ORDER } from '../data/examples';
import { loadPickup } from '../lib/handoff';
import { phoneUrl, useDevice, useLoop } from '../lib/hooks';
import { useStore } from '../state/store';

const LANGUAGES = ['Deutsch', 'Français', 'Italiano', 'English'];

function DemoCard({ className }: { className?: string }) {
  const { card } = useSheets(DEMO_CARD);
  const progress = useLoop(11000, 2500);
  return (
    <div className={`demo-card ${className ?? ''}`}>
      <Sheet sheet={card} ink={INKS[DEMO_CARD.ink].color} progress={progress} pen label="A birthday card being written by the machine" />
    </div>
  );
}

export function Welcome() {
  return useDevice() === 'kiosk' ? <KioskWelcome /> : <PhoneWelcome />;
}

function KioskWelcome() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [pickup, setPickup] = useState(false);
  const [help, setHelp] = useState(false);

  return (
    <div className="welcome">
      <section className="welcome-main">
        <img src={logo} alt="plotter" className="welcome-logo" />
        <h1>
          Your words,
          <br />
          written by hand.
        </h1>
        <p className="welcome-sub">Pick a card, write your message and watch a real pen write it for you. Ready in about two minutes.</p>
        <button type="button" className="btn btn-primary btn-xl start-btn" onClick={() => dispatch({ type: 'START' })}>
          <UiIcon name="pen" size={28} />
          <span>Touch to start</span>
        </button>
        <p className="welcome-price">Postcards from CHF 2.90 · greeting cards CHF 4.90</p>

        <div className="welcome-foot">
          <div className="lang" role="group" aria-label="Language">
            <UiIcon name="globe" />
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                className={l === 'English' ? 'is-on' : ''}
                aria-pressed={l === 'English'}
                onClick={() => l !== 'English' && toast('Prototype: only English for now.')}
              >
                {l}
              </button>
            ))}
          </div>
          <button type="button" className="chip-btn" onClick={() => setHelp(true)}>
            <UiIcon name="help" />
            <span>Help</span>
          </button>
        </div>
      </section>

      <aside className="welcome-side">
        <DemoCard />
        <div className="phone-panel">
          <QrCode value={phoneUrl()} size={132} label="QR code: write your card on your phone" />
          <div>
            <h2>Rather use your phone?</h2>
            <p>Scan the code, write your card in peace, then pick it up here.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setPickup(true)}>
              <UiIcon name="keypad" />
              <span>I have a pickup code</span>
            </button>
          </div>
        </div>
      </aside>

      <PickupModal open={pickup} onClose={() => setPickup(false)} />
      <HelpModal open={help} onClose={() => setHelp(false)} />
    </div>
  );
}

function PickupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const toast = useToast();
  const [code, setCode] = useState('');
  const [missing, setMissing] = useState(false);

  const close = () => {
    setCode('');
    setMissing(false);
    onClose();
  };
  const press = (k: string) => {
    setMissing(false);
    if (k === 'back') setCode((c) => c.slice(0, -1));
    else setCode((c) => (c.length < 4 ? c + k : c));
  };
  const find = () => {
    const design = loadPickup(code);
    if (!design) {
      setMissing(true);
      return;
    }
    dispatch({ type: 'LOAD', design, code });
    toast('Found your card from your phone.', 'success');
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Type in your pickup code"
      size="sm"
      footer={
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-lg" disabled={code.length < 4} onClick={find}>
            Find my card
          </button>
        </div>
      }
    >
      <p className="muted">Your phone showed you a 4-digit code after you sent the card.</p>
      <div className={`code-boxes${missing ? ' is-error' : ''}`} aria-live="polite" aria-label={`Code: ${code.split('').join(' ') || 'empty'}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i === code.length ? 'is-next' : ''}>
            {code[i] ?? ''}
          </span>
        ))}
      </div>
      {missing && (
        <div className="notice notice-warn">
          <UiIcon name="alert" />
          <div>
            <p>We can’t find a card with code {code}. Check the code on your phone.</p>
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                dispatch({ type: 'LOAD', design: EXAMPLE_PHONE_ORDER, code });
                toast('Prototype: loaded an example card from a phone.');
                close();
              }}
            >
              Prototype: load an example phone order instead
            </button>
          </div>
        </div>
      )}
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button key={i} type="button" className="keypad-key" onClick={() => press(k)} aria-label={k === 'back' ? 'Delete' : k}>
              {k === 'back' ? <UiIcon name="backspace" /> : k}
            </button>
          ),
        )}
      </div>
    </Modal>
  );
}

function PhoneWelcome() {
  const { dispatch } = useStore();
  return (
    <div className="p-welcome">
      <img src={logo} alt="plotter" className="p-welcome-logo" />
      <p className="machine-chip">
        <UiIcon name="pin" size={16} />
        Machine {MACHINE.id} · {MACHINE.place}
      </p>
      <h1>Write your card here, pick it up at the machine.</h1>
      <DemoCard className="p-demo" />
      <ol className="p-how">
        <li>
          <span>1</span>Write your card on your phone, take your time.
        </li>
        <li>
          <span>2</span>You get a 4-digit pickup code.
        </li>
        <li>
          <span>3</span>Type it in at the machine, pay, and watch the pen write it.
        </li>
      </ol>
      <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => dispatch({ type: 'START' })}>
        <span>Start writing</span>
        <UiIcon name="arrowRight" />
      </button>
      <p className="tiny center">Nothing is charged on your phone. You pay at the machine.</p>
    </div>
  );
}
