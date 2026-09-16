import { describe, it, expect } from 'vitest';
import { parseMD } from '@gitinfographics/parser';
import { buildRuleSpec } from '@gitinfographics/analyzer';
import {
  renderSVG,
  renderDesktopSVG,
  renderMobileSVG,
  getTheme,
  THEMES,
  auditThemeContrast,
  generateQRCodeSVG
} from '../index';

describe('@gitinfographics/renderer', () => {
  const sampleMD = `
# Core Engine
Scandinavian minimalist visual pipeline.

## Problem
Complex docs are hard to digest quickly.

## Solution
Generate clean vector SVG infographics automatically.

## Features
- Zero DOM dependencies
- Instant rendering
`;

  it('renders valid desktop SVG with 880px coordinate system', () => {
    const spec = buildRuleSpec(parseMD(sampleMD));
    const svg = renderDesktopSVG(spec, 'scandi-minimal');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 880');
    expect(svg).toContain('Core Engine');
    expect(svg).toContain('Generated with GitInfoGraphics');
    expect(svg).toContain('https://github.com/benneberg/gitinfographics');
  });

  it('renders mobile SVG with 400px reflow coordinate system', () => {
    const spec = buildRuleSpec(parseMD(sampleMD));
    const svg = renderMobileSVG(spec, 'scandi-minimal');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 400');
    expect(svg).toContain('Generated with GitInfoGraphics');
    expect(svg).toContain('https://github.com/benneberg/gitinfographics');
  });

  it('includes QR code when enabled in render options', () => {
    const spec = buildRuleSpec(parseMD(sampleMD));
    const svg = renderSVG(spec, 'scandi-minimal', {
      showQR: true,
      qrUrl: 'https://github.com/benneberg/gitinfographics'
    });
    expect(svg).toContain('qr-code');
  });

  it('audits theme contrast against WCAG AA standards', () => {
    const theme = getTheme('scandi-minimal');
    const audit = auditThemeContrast(theme);
    expect(audit.passedAllNormal).toBe(true);
  });

  it('generates deterministic vector QR paths without DOM', () => {
    const qrSvg = generateQRCodeSVG('https://github.com/benneberg/gitinfographics', 0, 0, { size: 60 });
    expect(qrSvg).toContain('<g class="qr-code"');
    expect(qrSvg).toContain('<path d="M');
  });
});
