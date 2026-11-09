import { useEffect, useState } from 'react';
import { TopBar } from '../components/Chrome';
import { QrCode } from '../components/QrCode';
import { UiIcon } from '../components/UiIcon';
import { PRODUCTS } from '../data/catalog';
import { useInterval, useMachine } from '../lib/hooks';
import { quote } from '../lib/pricing';
import { useStore } from '../state/store';

const RESET_AFTER = 45;
const PAID_BY = { twint: 'with TWINT', counter: 'at the counter' } as const;

export function Done() {
  const { state, dispatch } = useStore();
  const machine = useMachine();
  const [left, setLeft] = useState(RESET_AFTER);
  const p = PRODUCTS[state.product];
  const q = quote(state);
  const many = state.qty > 1;

  // The finished card sticks out of the tray under the screen.
  useEffect(() => {
    machine.setTray(true);
    return () => machine.setTray(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(() => {
    if (left <= 1) dispatch({ type: 'RESET' });
    else setLeft((s) => s - 1);
  }, 1000);

  const receipt = [
    `plotter receipt ${state.orderNo ?? ''}`,
    ...q.lines.map((l) => `${l.label}: CHF ${l.amount.toFixed(2)}`),
    `Total: CHF ${q.total.toFixed(2)}, paid ${state.payMethod ? PAID_BY[state.payMethod] : ''}`,
    '(prototype, nothing was charged)',
  ].join('\n');

  return (
    <>
      <TopBar />
      <main className="screen-body done" onPointerDown={() => setLeft(RESET_AFTER)}>
        <div className="done-main">
          <div className="done-check">
            <UiIcon name="check" size={56} />
          </div>
          <h1>{many ? `Your ${state.qty} cards are ready!` : `Your ${p.label.toLowerCase()} is ready!`}</h1>
          <p className="done-lead">Take {many ? 'them' : 'it'} from the tray below the screen.</p>
          <p className="done-arrow" aria-hidden="true">
            <UiIcon name="arrowDown" size={44} />
          </p>
          <ul className="done-notes">
            {p.envelope && (
              <li>
                <UiIcon name="envelope" />
                The {many ? 'envelopes are' : 'envelope is'} in the tray too{state.address ? ', already addressed' : ''}.
              </li>
            )}
            {state.stamp && (
              <li>
                <UiIcon name="stamp" />
                It’s stamped, so you can drop it in any letterbox.
              </li>
            )}
            {!state.address && (
              <li>
                <UiIcon name="pen" />
                Want to add a few words by hand? There’s a pen next to the machine.
              </li>
            )}
          </ul>
          <div className="done-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'START' })}>
              <UiIcon name="pen" />
              Write another card
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => dispatch({ type: 'RESET' })}>
              I’m done
            </button>
          </div>
          <p className="tiny">This screen goes back to the start in {left} s.</p>
        </div>
        <aside className="done-side">
          <QrCode value={receipt} size={150} label="QR code with your receipt" />
          <p>
            <strong>Receipt on your phone</strong>
            <br />
            <span className="muted">Scan to keep it. No paper needed.</span>
          </p>
          <p className="tiny">Order {state.orderNo}</p>
        </aside>
      </main>
    </>
  );
}
