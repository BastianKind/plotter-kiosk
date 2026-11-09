import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import logo from '../assets/logo.svg';
import { MACHINE } from '../data/catalog';
import { MachineContext } from '../lib/hooks';
import { DeviceApp } from './Screens';

/** The touch screen is designed at 1280 × 800 and scaled to fit the window. */
const W = 1280;
const H = 800;
const BEZEL = 34;
const BASE = 176;

export function KioskFrame({ frame }: { frame: boolean }) {
  const [tray, setTray] = useState(false);
  const signals = useMemo(() => ({ tray, setTray }), [tray]);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  const machineW = frame ? W + BEZEL * 2 : W;
  const machineH = frame ? H + BEZEL * 2 + BASE : H;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      setScale(Math.max(0.1, Math.min(w / machineW, h / machineH)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [machineW, machineH]);

  return (
    <MachineContext.Provider value={signals}>
      <div className={`kiosk-stage${frame ? '' : ' is-bare'}`} ref={stageRef}>
        <div className="machine-box" style={{ width: machineW * scale, height: machineH * scale }}>
          <div className={`machine${frame ? '' : ' is-bare'}`} style={{ width: machineW, height: machineH, transform: `scale(${scale})` }}>
            <div className="machine-bezel">
              <div className="machine-screen" style={{ width: W, height: H }}>
                <DeviceApp device="kiosk" />
              </div>
            </div>
            {frame && (
              <div className="machine-base">
                <div className="base-brand">
                  <img src={logo} alt="" />
                  <span>
                    Machine {MACHINE.id} · {MACHINE.place}
                  </span>
                </div>
                <div className={`tray${tray ? ' has-card' : ''}`}>
                  <span className="tray-slot">
                    <span className="tray-card" />
                  </span>
                  <span className="base-label">Your card comes out here</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MachineContext.Provider>
  );
}
