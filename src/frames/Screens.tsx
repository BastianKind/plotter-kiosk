import { useEffect, useRef, useState } from 'react';
import { Modal } from '../components/Modal';
import { ToastProvider } from '../components/Toast';
import { UiIcon } from '../components/UiIcon';
import { DeviceContext, PortalContext, useInterval } from '../lib/hooks';
import { ChooseCard } from '../screens/ChooseCard';
import { Done } from '../screens/Done';
import { Handwriting } from '../screens/Handwriting';
import { Message } from '../screens/Message';
import { Occasion } from '../screens/Occasion';
import { Review } from '../screens/Review';
import { Sent } from '../screens/Sent';
import { Style } from '../screens/Style';
import { Welcome } from '../screens/Welcome';
import { Writing } from '../screens/Writing';
import { StoreProvider, useStore } from '../state/store';
import type { Device } from '../types';

function CurrentScreen() {
  const { state } = useStore();
  switch (state.screen) {
    case 'welcome':
      return <Welcome />;
    case 'card':
      return <ChooseCard />;
    case 'occasion':
      return <Occasion />;
    case 'message':
      return <Message />;
    case 'style':
      return <Style />;
    case 'handwriting':
      return <Handwriting />;
    case 'review':
      return <Review />;
    case 'writing':
      return <Writing />;
    case 'done':
      return <Done />;
    case 'sent':
      return <Sent />;
  }
}

function ScreenRoot({ device }: { device: Device }) {
  const { state } = useStore();
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // A new screen starts at the top (matters on the phone, where screens scroll).
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [state.screen]);

  return (
    <div className={`screen-root dev-${device} on-${state.screen}`} ref={setPortal}>
      <PortalContext.Provider value={portal}>
        <ToastProvider>
          <div className="screen-scroll" ref={scrollRef}>
            <CurrentScreen />
          </div>
          {device === 'kiosk' && <IdleWatcher />}
        </ToastProvider>
      </PortalContext.Provider>
    </div>
  );
}

/** One complete app (machine screen or phone), with its own order state. */
export function DeviceApp({ device }: { device: Device }) {
  return (
    <DeviceContext.Provider value={device}>
      <StoreProvider>
        <ScreenRoot device={device} />
      </StoreProvider>
    </DeviceContext.Provider>
  );
}

const IDLE_SECONDS = 90;
const COUNTDOWN = 20;

/** A machine in a shop must not keep someone's half-written card forever. */
function IdleWatcher() {
  const { state, dispatch } = useStore();
  const watching = !['welcome', 'writing', 'done'].includes(state.screen);
  const lastInput = useRef(Date.now());
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    lastInput.current = Date.now();
    if (!watching) return;
    const seen = () => {
      lastInput.current = Date.now();
    };
    window.addEventListener('pointerdown', seen, true);
    window.addEventListener('keydown', seen, true);
    return () => {
      window.removeEventListener('pointerdown', seen, true);
      window.removeEventListener('keydown', seen, true);
    };
  }, [watching, state.screen]);

  useInterval(
    () => {
      if (left !== null) {
        if (left <= 1) {
          setLeft(null);
          dispatch({ type: 'RESET' });
        } else setLeft(left - 1);
      } else if (Date.now() - lastInput.current > IDLE_SECONDS * 1000) setLeft(COUNTDOWN);
    },
    watching ? 1000 : null,
  );

  const keepGoing = () => {
    lastInput.current = Date.now();
    setLeft(null);
  };

  return (
    <Modal
      open={left !== null && watching}
      onClose={keepGoing}
      title="Are you still there?"
      size="sm"
      footer={
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => {
              setLeft(null);
              dispatch({ type: 'RESET' });
            }}
          >
            Start over
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={keepGoing}>
            I’m still here
          </button>
        </div>
      }
    >
      <div className="idle">
        <span className="idle-count">{left}</span>
        <p>
          <UiIcon name="clock" /> Your card will be cleared in {left} seconds, so the next person can start fresh.
        </p>
      </div>
    </Modal>
  );
}
