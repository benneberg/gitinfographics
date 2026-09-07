import { describe, it, expect } from 'vitest';
import { generateQRCodeSVG } from '../qr';

describe('QR Code SVG Generator', () => {
  it('returns empty string for empty input', () => {
    expect(generateQRCodeSVG('', 0, 0)).toBe('');
  });

  it('generates crisp SVG path with proper coordinates and color', () => {
    const svg = generateQRCodeSVG('https://github.com/benneberg/gitinfographics', 50, 100, {
      size: 80,
      color: '#059669',
    });

    expect(svg).toContain('<g class="qr-code"');
    expect(svg).toContain('fill="#059669"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('d="M');
  });
});
