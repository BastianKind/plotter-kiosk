import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Device } from '../types';
import { resetMeasurements } from './layout';

const HAND_FONTS = ['Caveat', 'Kalam', 'Shadows Into Light Two'];

/** Bumps a number once the handwriting fonts are loaded, so text gets measured again. */
export function useFontsLoaded() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    const bump = () => {
      if (!alive) return;
      resetMeasurements();
      setVersion((v) => v + 1);
    };
    Promise.allSettled(HAND_FONTS.map((f) => document.fonts.load(`40px "${f}"`))).then(bump);
    document.fonts.addEventListener('loadingdone', bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener('loadingdone', bump);
    };
  }, []);
  return version;
}

export const FontsContext = createContext(0);
export const useFonts = () => useContext(FontsContext);

export const DeviceContext = createContext<Device>('kiosk');
export const useDevice = () => useContext(DeviceContext);

/** Element that pop-ups render into (the machine screen or the phone screen). */
export const PortalContext = createContext<HTMLElement | null>(null);
export const usePortal = () => useContext(PortalContext);

/** Parts of the machine around the screen: the card reader lights up, the tray shows the finished card. */
export interface MachineSignals {
  reader: boolean;
  tray: boolean;
  setReader: (on: boolean) => void;
  setTray: (on: boolean) => void;
}
export const MachineContext = createContext<MachineSignals>({ reader: false, tray: false, setReader: () => {}, setTray: () => {} });
export const useMachine = () => useContext(MachineContext);

/** Address of the phone version, for the QR code on the machine. */
export function phoneUrl() {
  const url = new URL(window.location.href);
  url.search = '?view=phone';
  url.hash = '';
  return url.toString();
}

/** A value from 0 to 1 that runs over `ms`, then holds and starts again. */
export function useLoop(ms: number, holdMs: number, running = true) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) % (ms + holdMs);
      setP(Math.min(1, t / ms));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ms, holdMs, running]);
  return p;
}

/** Calls `fn` every `ms` while active; the latest `fn` is always used. */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
