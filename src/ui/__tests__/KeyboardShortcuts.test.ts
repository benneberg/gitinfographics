import { describe, it, expect } from 'vitest';
import { KeyboardShortcuts } from '../KeyboardShortcuts';

describe('KeyboardShortcuts', () => {
  it('registers default shortcuts across all categories', () => {
    const manager = new KeyboardShortcuts();
    const shortcuts = manager.getAllShortcuts();

    expect(shortcuts.length).toBeGreaterThan(0);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+Enter')).toBe(true);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+S')).toBe(true);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+Shift+P')).toBe(true);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+M')).toBe(true);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+T')).toBe(true);
    expect(shortcuts.some((s) => s.keys === 'Ctrl+D')).toBe(true);
  });

  it('filters shortcuts by category', () => {
    const manager = new KeyboardShortcuts();
    const exportShortcuts = manager.getShortcutsByCategory('export');
    expect(exportShortcuts.length).toBe(2);
    expect(exportShortcuts.every((s) => s.category === 'export')).toBe(true);
  });

  it('formats shortcut keys cleanly for display', () => {
    expect(KeyboardShortcuts.formatKeys('Ctrl+S')).toContain('⌃ S');
    expect(KeyboardShortcuts.formatKeys('Ctrl+Shift+P')).toContain('⌃ ⇧ P');
    expect(KeyboardShortcuts.formatKeys('Ctrl+Enter')).toContain('⌃ ↵');
  });

  it('allows adding and removing custom shortcuts', () => {
    const manager = new KeyboardShortcuts();
    manager.addShortcut({
      keys: 'ctrl+k',
      description: 'Quick search',
      handler: () => {},
      category: 'general',
    });

    expect(manager.getAllShortcuts().some((s) => s.keys === 'Ctrl+K')).toBe(true);

    manager.removeShortcut('ctrl+k');
    expect(manager.getAllShortcuts().some((s) => s.keys === 'Ctrl+K')).toBe(false);
  });
});
