import { useEffect, useMemo, useState } from 'react';
import { TopBar, useSheets } from '../components/Chrome';
import { Sheet } from '../components/Sheet';
import { UiIcon } from '../components/UiIcon';
import { INKS } from '../data/catalog';
import { useInterval } from '../lib/hooks';
import { aboutMinutes, writingSeconds, type SheetLayout } from '../lib/layout';
import { useStore } from '../state/store';

const FACTS = [
  'Every card is written with a real pen. Look closely: the ink sits in the paper.',
  'No two cards are exactly the same, just like real handwriting.',
  'The pen writes about as fast as you would, so it takes a little moment.',
  'Need a stack of cards for your business or a whole guest list? Our web shop does that.',
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

interface Phase {
  sheet: SheetLayout;
  kind: 'card' | 'envelope';
  copy: number;
  ms: number;
}

/** The machine writes the card (and envelope). The prototype plays it faster than real time. */
export function Writing() {
  const { state, dispatch } = useStore();
  const { card, envelope } = useSheets(state);
  const ink = INKS[state.ink].color;
  const [t, setT] = useState(0);
  const [fact, setFact] = useState(0);

  const phases = useMemo(() => {
    const list: Phase[] = [];
    const cardMs = clamp(writingSeconds([card], 1) * 150, 7000, 15000);
    const envMs = envelope ? clamp(writingSeconds([envelope], 1) * 150, 3500, 6000) : 0;
    for (let copy = 1; copy <= state.qty; copy++) {
      list.push({ sheet: card, kind: 'card', copy, ms: copy === 1 ? cardMs : 2600 });
      if (envelope) list.push({ sheet: envelope, kind: 'envelope', copy, ms: copy === 1 ? envMs : 1400 });
    }
    return list;
  }, [card, envelope, state.qty]);
  const total = phases.reduce((sum, p) => sum + p.ms, 0);
  const finished = t >= total;

  useEffect(() => {
    if (finished) {
      const id = window.setTimeout(() => dispatch({ type: 'GO', screen: 'done' }), 900);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setT((prev) => Math.min(total, prev + (now - last)));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finished, total, dispatch]);

  useInterval(() => setFact((f) => (f + 1) % FACTS.length), 6000);

  let acc = 0;
  let phase = phases[phases.length - 1];
  let local = 1;
  for (const p of phases) {
    if (t < acc + p.ms) {
      phase = p;
      local = (t - acc) / p.ms;
      break;
    }
    acc += p.ms;
  }

  const real = writingSeconds([card, envelope], state.qty);
  const left = real * (1 - t / Math.max(1, total));
  const many = state.qty > 1;
  const status = finished
    ? 'All done!'
    : phase.kind === 'card'
      ? many
        ? `Writing card ${phase.copy} of ${state.qty}`
        : 'Writing your card'
      : many
        ? `Addressing envelope ${phase.copy} of ${state.qty}`
        : 'Writing the envelope';

  return (
    <>
      <TopBar title="The pen is writing" />
      <main className="screen-body writing">
        <div className="bed">
          <div key={`${phase.kind}-${phase.copy}`} className={`bed-sheet bed-${phase.kind === 'envelope' ? 'envelope' : state.product}`}>
            <Sheet sheet={phase.sheet} ink={ink} progress={local} pen={!finished} label={status} />
          </div>
        </div>
        <aside className="writing-side">
          <p className="writing-status" aria-live="polite">
            {status}
          </p>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((t / total) * 100)}>
            <span style={{ width: `${(t / total) * 100}%` }} />
          </div>
          <p className="writing-left">
            <UiIcon name="clock" size={18} />
            {finished ? 'Finishing up' : left < 20 ? 'Almost done' : `${aboutMinutes(left)} left`}
          </p>
          <div className="fact" key={fact}>
            <UiIcon name="sparkle" />
            <p>{FACTS[fact]}</p>
          </div>
          <p className="writing-care">Please don’t reach into the tray while the pen is moving.</p>
          {!finished && (
            <button type="button" className="btn-link skip" onClick={() => setT(total)}>
              Prototype: skip ahead
            </button>
          )}
        </aside>
      </main>
    </>
  );
}
