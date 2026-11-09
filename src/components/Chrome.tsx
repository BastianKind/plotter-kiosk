import { useMemo, useState, type ReactNode } from 'react';
import logo from '../assets/logo.webp';
import { INKS, MACHINE, PRODUCTS } from '../data/catalog';
import { useDevice, useFonts } from '../lib/hooks';
import { layoutCard, layoutEnvelope } from '../lib/layout';
import { useStore } from '../state/store';
import type { CardDesign, Screen } from '../types';
import { Modal } from './Modal';
import { Sheet } from './Sheet';
import { UiIcon } from './UiIcon';

const STEPS: [Screen, string][] = [
  ['card', 'Card'],
  ['occasion', 'Occasion'],
  ['message', 'Message'],
  ['style', 'Style'],
  ['review', 'Check'],
];

function stepIndex(screen: Screen) {
  if (screen === 'handwriting') return 3;
  return STEPS.findIndex(([s]) => s === screen);
}

/** Logo, steps, help and "start over". Used on every screen except the welcome screen. */
export function TopBar({ title }: { title?: string }) {
  const { state, dispatch } = useStore();
  const device = useDevice();
  const [help, setHelp] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const current = stepIndex(state.screen);
  const inFlow = current >= 0;

  return (
    <header className="topbar">
      <img src={logo} alt="plotter" className="topbar-logo" />
      {device === 'phone' && (
        <span className="topbar-machine">
          <UiIcon name="pin" size={16} />
          {MACHINE.id}
        </span>
      )}
      {inFlow && device === 'kiosk' && (
        <ol className="steps" aria-label="Steps">
          {STEPS.map(([key, label], i) => (
            <li key={key} className={i < current ? 'is-done' : i === current ? 'is-current' : ''} aria-current={i === current ? 'step' : undefined}>
              <button type="button" disabled={i >= current} onClick={() => dispatch({ type: 'GO', screen: key })}>
                <span className="step-dot">{i < current ? <UiIcon name="check" size={16} /> : i + 1}</span>
                <span className="step-label">{i === 4 ? (device === 'kiosk' ? 'Check & pay' : 'Check & send') : label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {inFlow && device === 'phone' && (
        <span className="topbar-step">
          Step {current + 1} of {STEPS.length}
        </span>
      )}
      {title && <span className="topbar-title">{title}</span>}
      <div className="topbar-right">
        <button type="button" className="chip-btn" onClick={() => setHelp(true)}>
          <UiIcon name="help" />
          <span>Help</span>
        </button>
        {inFlow && (
          <button type="button" className="chip-btn" onClick={() => setConfirm(true)}>
            <UiIcon name="refresh" />
            <span>Start over</span>
          </button>
        )}
      </div>

      <HelpModal open={help} onClose={() => setHelp(false)} />
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Start over?"
        size="sm"
        footer={
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>
              Keep my card
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setConfirm(false);
                dispatch({ type: 'RESET' });
              }}
            >
              Start over
            </button>
          </div>
        }
      >
        <p>Your card and everything you’ve written will be cleared.</p>
      </Modal>
    </header>
  );
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const device = useDevice();
  return (
    <Modal open={open} onClose={onClose} title="Need a hand?" size="md">
      <dl className="faq">
        <dt>Is it really written with a pen?</dt>
        <dd>Yes. The machine holds a real pen and writes every letter, so no two cards are exactly the same.</dd>
        <dt>How long does it take?</dt>
        <dd>Most cards are ready in 1 to 3 minutes. You can watch the pen while it writes.</dd>
        <dt>Can it write in my own handwriting?</dt>
        <dd>Yes. Under “Style”, write each letter once on the screen with the pen or your finger. We use your letters for the card.</dd>
        <dt>How can I pay?</dt>
        <dd>With TWINT: scan the code on the screen with the app. Or pay at the shop’s till, in cash or by card.</dd>
        <dt>Can I send the card straight away?</dt>
        <dd>Add the address and an A-Post stamp before you pay. Then just drop it in any letterbox.</dd>
        {device === 'phone' ? (
          <>
            <dt>How do I get my card?</dt>
            <dd>
              When you’re done, you get a 4-digit code. Type it in at machine {MACHINE.id}, pay there, and watch it being written.
            </dd>
          </>
        ) : (
          <>
            <dt>Can I write it on my phone?</dt>
            <dd>Yes. Scan the code on the start screen, write your card in peace, and pick it up here with a 4-digit code.</dd>
          </>
        )}
      </dl>
      {device === 'kiosk' && (
        <p className="help-staff">
          <UiIcon name="user" />
          <span>Still stuck? The staff at the counter are happy to help.</span>
        </p>
      )}
    </Modal>
  );
}

interface BarAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: boolean;
}

export function BottomBar({ back, next, children }: { back?: BarAction; next?: BarAction; children?: ReactNode }) {
  return (
    <footer className="bottombar">
      <div className="bb-side">
        {back && (
          <button type="button" className="btn btn-secondary btn-lg" onClick={back.onClick}>
            <UiIcon name="arrowLeft" />
            <span>{back.label}</span>
          </button>
        )}
      </div>
      <div className="bb-middle">{children}</div>
      <div className="bb-side bb-right">
        {next && (
          <button type="button" className="btn btn-primary btn-lg" onClick={next.onClick} disabled={next.disabled}>
            <span>{next.label}</span>
            {next.icon !== false && <UiIcon name="arrowRight" />}
          </button>
        )}
      </div>
    </footer>
  );
}

/** Layouts of the card and (if addressed) its envelope, measured again once fonts load. */
export function useSheets(d: CardDesign) {
  const fonts = useFonts();
  const card = useMemo(
    () => layoutCard(d),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fonts, d.product, d.opening, d.message, d.closing, d.hand, d.glyphs, d.drawing, d.address, d.stamp],
  );
  const envelope = useMemo(
    () => layoutEnvelope(d),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fonts, d.product, d.hand, d.glyphs, d.address, d.stamp],
  );
  return { card, envelope };
}

/** The finished card as it will look, on a little desk. */
export function CardPreview({ design, className, caption = true }: { design: CardDesign; className?: string; caption?: boolean }) {
  const { card } = useSheets(design);
  const p = PRODUCTS[design.product];
  return (
    <figure className={`preview preview-${design.product} ${className ?? ''}`}>
      <div className="preview-stage">
        <Sheet sheet={card} ink={INKS[design.ink].color} label={`Preview of your ${p.label.toLowerCase()}`} />
      </div>
      {caption && (
        <figcaption>
          {p.label} · {p.sizeLabel}
          {design.product === 'greeting' ? ' · inside' : design.product === 'postcard' ? ' · back' : ''}
        </figcaption>
      )}
    </figure>
  );
}
