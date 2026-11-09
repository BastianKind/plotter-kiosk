import { useEffect, useState } from 'react';
import { QrCode } from '../components/QrCode';
import { UiIcon } from '../components/UiIcon';
import { phoneUrl } from '../lib/hooks';
import { DeviceApp } from './Screens';

function useNarrow() {
  const query = '(max-width: 560px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/** On a real phone the app fills the screen; on a computer it sits in a phone outline. */
export function PhoneFrame() {
  const narrow = useNarrow();
  const local = /^(localhost|127\.|\[::1\])/.test(window.location.hostname);

  if (narrow)
    return (
      <div className="phone-bare">
        <DeviceApp device="phone" />
      </div>
    );

  return (
    <div className="phone-stage">
      <div className="phone-device">
        <span className="phone-island" aria-hidden="true" />
        <div className="phone-status" aria-hidden="true">
          <span>{new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>5G ▮</span>
        </div>
        <div className="phone-screen">
          <DeviceApp device="phone" />
        </div>
      </div>
      <aside className="phone-aside">
        <h2>
          <UiIcon name="qr" />
          After scanning the code on the machine
        </h2>
        <p>
          This is what people see on their own phone. They write the card in peace, get a 4-digit pickup code, and type it in at the
          machine to pay and watch it being written.
        </p>
        <p>
          <strong>Try the hand-off:</strong> send a card here, switch to “Machine screen” above, tap “I have a pickup code” and type in the
          code.
        </p>
        <div className="phone-aside-qr">
          <QrCode value={phoneUrl()} size={120} label="QR code to open this phone view on a real phone" />
          <p className="small muted">
            Open it on a real phone.
            {local && ' (This only works once the prototype is online, not on localhost.)'}
          </p>
        </div>
      </aside>
    </div>
  );
}
