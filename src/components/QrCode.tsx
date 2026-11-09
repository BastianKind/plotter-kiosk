import qrcode from 'qrcode-generator';
import { useMemo } from 'react';

/** A real, scannable QR code drawn as SVG. */
export function QrCode({ value, size = 160, label }: { value: string; size?: number; label: string }) {
  const { n, d } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < count; r++) for (let c = 0; c < count; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { n: count, d: path };
  }, [value]);

  return (
    <svg className="qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#0b1b45" />
    </svg>
  );
}
