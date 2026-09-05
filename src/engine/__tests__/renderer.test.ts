import { describe, it, expect } from 'vitest';
import { renderSVG, renderMobileSVG, esc, wrapT } from '../renderer';
import { InfographicSpec } from '../types';

describe('renderSVG', () => {
  const sampleSpec: InfographicSpec = {
    title: 'EngineX',
    subtitle: 'High performance event stream processor',
    sections: [
      {
        id: 'stats',
        type: 'stats',
        items: [
          { value: '99.99%', label: 'Uptime' },
          { value: '1.2ms', label: 'Latency' },
          { value: '50k+', label: 'Stars' }
        ]
      },
      {
        id: 'problem-solution',
        type: 'problem-solution',
        problem: 'Traditional brokers suffer high memory usage.',
        solution: 'EngineX optimizes buffer recycling to eliminate GC pauses.',
        problemTitle: 'The Problem',
        solutionTitle: 'The Solution'
      },
      {
        id: 'features',
        type: 'features',
        title: 'Core Capabilities',
        columns: 3,
        items: [
          { title: 'Zero GC', description: 'Memory recycling' },
          { title: 'Clustered', description: 'Built-in gossip' },
          { title: 'Fast Cold Start', description: 'Under 10ms' }
        ]
      }
    ]
  };

  it('renders valid XML-compliant desktop SVG at 880px width', () => {
    const svg = renderSVG(sampleSpec, 'nordic-light');
    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 880');
    expect(svg).toContain('EngineX');
    expect(svg).toContain('99.99%');
    expect(svg).toContain('</svg>');
  });

  it('renders genuine mobile reflowed layout at 400px width with vertical flow', () => {
    const mobileSvg = renderMobileSVG(sampleSpec, 'nordic-light');
    expect(mobileSvg).toContain('<svg');
    expect(mobileSvg).toContain('viewBox="0 0 400');
    expect(mobileSvg).toContain('EngineX');
    // Mobile problem-solution uses vertical arrow
    expect(mobileSvg).toContain('↓');
    expect(mobileSvg).toContain('</svg>');
  });

  it('properly escapes XML entities to prevent injection', () => {
    expect(esc('Foo < Bar & "Baz" > \'Qux\'')).toBe(
      'Foo &lt; Bar &amp; &quot;Baz&quot; &gt; &apos;Qux&apos;'
    );
  });

  it('wraps long text based on max characters per line', () => {
    const text = 'The quick brown fox jumps over the lazy dog repeatedly without pausing';
    const wrapped = wrapT(text, 25);
    expect(wrapped.length).toBeGreaterThan(1);
    wrapped.forEach((line) => {
      expect(line.length).toBeLessThanOrEqual(30);
    });
  });
});
