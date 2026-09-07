import { describe, it, expect } from 'vitest';
import { CanvasExporter, CANVAS_PRESETS } from '../CanvasExporter';

describe('CanvasExporter', () => {
  const exporter = new CanvasExporter();

  it('includes all standard social media and README presets', () => {
    expect(CANVAS_PRESETS.length).toBeGreaterThanOrEqual(6);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('Desktop'))).toBe(true);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('Mobile'))).toBe(true);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('Twitter'))).toBe(true);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('LinkedIn'))).toBe(true);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('Instagram'))).toBe(true);
    expect(CANVAS_PRESETS.some((p) => p.name.includes('GitHub Social'))).toBe(true);
  });

  it('calculates dimensions accurately for fixed presets', () => {
    const twitterPreset = CANVAS_PRESETS.find((p) => p.name.includes('Twitter'))!;
    const dims = exporter.calculateDimensions(twitterPreset);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(675);

    const linkedinPreset = CANVAS_PRESETS.find((p) => p.name.includes('LinkedIn'))!;
    const lDims = exporter.calculateDimensions(linkedinPreset);
    expect(lDims.width).toBe(1080);
    expect(lDims.height).toBe(1080);
  });

  it('adapts auto-height presets with dynamic content height', () => {
    const desktopPreset = CANVAS_PRESETS.find((p) => p.name.includes('Desktop'))!;
    const dims = exporter.calculateDimensions(desktopPreset, 1450);
    expect(dims.width).toBe(880);
    expect(dims.height).toBe(1450);
  });
});
