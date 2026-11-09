import { useState } from 'react';
import { CardPreview, TopBar } from '../components/Chrome';
import { UiIcon } from '../components/UiIcon';
import { MACHINE } from '../data/catalog';
import { validUntil } from '../lib/handoff';
import { chf, quote } from '../lib/pricing';
import { designOf, useStore } from '../state/store';

/** Phone only: the card is waiting at the machine under a pickup code. */
export function Sent() {
  const { state, dispatch } = useStore();
  const [until] = useState(() => validUntil());
  const code = state.pickupCode ?? '';

  return (
    <>
      <TopBar />
      <main className="screen-body sent">
        <div className="sent-ok">
          <UiIcon name="check" size={36} />
        </div>
        <h1>Your card is waiting at the machine</h1>
        <p className="muted">Go to the machine, tap “I have a pickup code” and type in:</p>
        <p className="sent-code" aria-label={`Pickup code ${code.split('').join(' ')}`}>
          {code.split('').map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </p>
        <ul className="sent-facts">
          <li>
            <UiIcon name="pin" />
            Machine {MACHINE.id} · {MACHINE.place}
          </li>
          <li>
            <UiIcon name="clock" />
            Code valid until {until} today
          </li>
          <li>
            <UiIcon name="card" />
            You pay {chf(quote(state).total)} at the machine
          </li>
        </ul>
        <CardPreview design={designOf(state)} className="sent-preview" />
        <div className="sent-actions">
          <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={() => dispatch({ type: 'GO', screen: 'review' })}>
            <UiIcon name="pen" />
            Change something
          </button>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => dispatch({ type: 'START' })}>
            Write another card
          </button>
        </div>
        <p className="tiny center">
          Prototype: there’s no server, so the machine view finds this code only in this browser. On another device, use “load an example phone order”.
        </p>
      </main>
    </>
  );
}
