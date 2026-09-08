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

  it('renders timeline, comparison, and callout sections in desktop and mobile', () => {
    const extendedSpec: InfographicSpec = {
      title: 'NextGen Project',
      subtitle: 'Modern SVG toolkit',
      sections: [
        {
          id: 'timeline',
          type: 'timeline',
          title: 'Roadmap',
          items: [
            { versionOrDate: 'v1.0', title: 'Launch', description: 'Initial public beta' },
            { versionOrDate: 'v2.0', title: 'Scale', description: 'Global multi-region replication' }
          ]
        },
        {
          id: 'comparison',
          type: 'comparison',
          title: 'Comparison',
          headers: ['Feature', 'Our Engine', 'Traditional'],
          rows: [
            { feature: 'Latency', us: '< 1ms', others: '50ms' },
            { feature: 'Offline Support', us: true, others: false }
          ]
        },
        {
          id: 'callout',
          type: 'callout',
          title: 'Quote',
          text: 'The fastest SVG engine for GitHub repositories.',
          author: 'Lead Architect',
          calloutType: 'quote'
        }
      ]
    };

    const desktopSvg = renderSVG(extendedSpec, 'scandi-minimal', { layout: 'desktop' });
    expect(desktopSvg).toContain('sec-timeline-timeline');
    expect(desktopSvg).toContain('sec-comparison-comparison');
    expect(desktopSvg).toContain('sec-callout-callout');
    expect(desktopSvg).toContain('Initial public beta');
    expect(desktopSvg).toContain('Our Engine');
    expect(desktopSvg).toContain('Lead Architect');

    const mobileSvg = renderSVG(extendedSpec, 'scandi-minimal', { layout: 'mobile' });
    expect(mobileSvg).toContain('sec-timeline-timeline-mobile');
    expect(mobileSvg).toContain('sec-comparison-comparison-mobile');
    expect(mobileSvg).toContain('sec-callout-callout-mobile');
    expect(mobileSvg).toContain('NextGen Project');
  });

  it('renders custom logo and generates accessible summary in desc element', () => {
    const specWithLogo: InfographicSpec = {
      title: 'Accessible App',
      subtitle: 'Accessible repository infographic',
      logo: {
        dataUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        position: 'top-right',
        size: 40
      },
      sections: [
        {
          id: 'stats',
          type: 'stats',
          items: [{ value: '100%', label: 'Tested' }]
        }
      ]
    };

    const svg = renderSVG(specWithLogo, 'scandi-minimal');
    expect(svg).toContain('<desc id="svg-desktop-desc">');
    expect(svg).toContain('Project: Accessible App');
    expect(svg).toContain('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=');
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-labelledby="svg-desktop-title"');
    expect(svg).toContain('aria-describedby="svg-desktop-desc"');
  });
});

