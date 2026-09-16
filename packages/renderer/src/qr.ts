import QRCode from 'qrcode';

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

/**
 * Deterministically generates an SVG path element representing a QR code
 * positioned at (x, y) with the specified dimensions and color.
 * Zero-DOM dependencies, fully compatible with client and Node.js.
 */
export function generateQRCodeSVG(
  text: string,
  x: number,
  y: number,
  options?: QROptions
): string {
  if (!text) return '';
  const size = options?.size || 60;
  const color = options?.color || '#1C1917';
  const margin = options?.margin ?? 1;

  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const totalCount = moduleCount + margin * 2;
    const cellSize = size / totalCount;

    const paths: string[] = [];
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          const px = x + (c + margin) * cellSize;
          const py = y + (r + margin) * cellSize;
          paths.push(
            `M${px.toFixed(2)},${py.toFixed(2)}h${cellSize.toFixed(2)}v${cellSize.toFixed(2)}h-${cellSize.toFixed(2)}z`
          );
        }
      }
    }

    return `<g class="qr-code" role="img" aria-label="QR Code linking to repository"><path d="${paths.join(
      ' '
    )}" fill="${color}" shape-rendering="crispEdges" /></g>`;
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}
