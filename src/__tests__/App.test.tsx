import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';

describe('App component', () => {
  it('renders without crashing on SSR / client initial mount', () => {
    const html = renderToString(<App />);
    expect(html).toContain('GitInfoGraphics');
    expect(html).toContain('Deterministic SVG Engine');
  });
});
