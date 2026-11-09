import { useEffect, useState } from 'react';
import { UiIcon } from './components/UiIcon';
import { KioskFrame } from './frames/KioskFrame';
import { PhoneFrame } from './frames/PhoneFrame';
import { FontsContext, useFontsLoaded } from './lib/hooks';
import type { Device } from './types';

function readParams() {
  const q = new URLSearchParams(window.location.search);
  return { view: (q.get('view') === 'phone' ? 'phone' : 'kiosk') as Device, frame: q.get('frame') !== 'off' };
}

export default function App() {
  const fonts = useFontsLoaded();
  const [{ view, frame }, setParams] = useState(readParams);
  const [fullscreen, setFullscreen] = useState(false);

  // Keep the address in sync, so a link or reload opens the same view.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view === 'phone') url.searchParams.set('view', 'phone');
    else url.searchParams.delete('view');
    if (!frame && view === 'kiosk') url.searchParams.set('frame', 'off');
    else url.searchParams.delete('frame');
    window.history.replaceState(null, '', url);
    document.title = view === 'phone' ? 'plotter · Write on your phone' : 'plotter · In the shop';
  }, [view, frame]);

  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  return (
    <FontsContext.Provider value={fonts}>
      <div className={`page page-${view}${fullscreen ? ' is-fullscreen' : ''}`}>
        {!fullscreen && (
          <div className="proto-bar">
            <span className="proto-title">
              <strong>plotter</strong> in the shop <span className="proto-pill">Clickable prototype</span>
            </span>
            <div className="seg seg-sm proto-switch" role="radiogroup" aria-label="View">
              <button type="button" role="radio" aria-checked={view === 'kiosk'} className={view === 'kiosk' ? 'is-on' : ''} onClick={() => setParams({ view: 'kiosk', frame })}>
                <UiIcon name="monitor" size={18} />
                Machine screen
              </button>
              <button type="button" role="radio" aria-checked={view === 'phone'} className={view === 'phone' ? 'is-on' : ''} onClick={() => setParams({ view: 'phone', frame })}>
                <UiIcon name="phone" size={18} />
                Phone (QR code)
              </button>
            </div>
            <div className="proto-tools">
              {view === 'kiosk' && (
                <button type="button" className="proto-btn" aria-pressed={frame} onClick={() => setParams({ view, frame: !frame })}>
                  <UiIcon name="frame" size={18} />
                  {frame ? 'Hide machine' : 'Show machine'}
                </button>
              )}
              <button type="button" className="proto-btn" onClick={toggleFullscreen}>
                <UiIcon name="expand" size={18} />
                Full screen
              </button>
              <span className="proto-note">Nothing is ordered or charged.</span>
            </div>
          </div>
        )}
        {view === 'kiosk' ? <KioskFrame frame={frame && !fullscreen} /> : <PhoneFrame />}
      </div>
    </FontsContext.Provider>
  );
}
