// src/ui/KeyboardShortcuts.ts

export interface Shortcut {
  keys: string;
  description: string;
  handler: () => void;
  category: 'general' | 'export' | 'navigation' | 'editing';
}

export class KeyboardShortcuts {
  private shortcuts: Map<string, Shortcut> = new Map();
  private isRegistered = false;

  constructor() {
    this.registerDefaultShortcuts();
  }

  /**
   * Register default shortcuts
   */
  private registerDefaultShortcuts(): void {
    this.addShortcut({
      keys: 'Ctrl+Enter',
      description: 'Generate infographic',
      handler: () => {},
      category: 'general',
    });

    this.addShortcut({
      keys: 'Ctrl+S',
      description: 'Export as SVG',
      handler: () => {},
      category: 'export',
    });

    this.addShortcut({
      keys: 'Ctrl+Shift+P',
      description: 'Export as PNG',
      handler: () => {},
      category: 'export',
    });

    this.addShortcut({
      keys: 'Ctrl+M',
      description: 'Toggle mobile/desktop preview',
      handler: () => {},
      category: 'navigation',
    });

    this.addShortcut({
      keys: 'Ctrl+T',
      description: 'Switch theme',
      handler: () => {},
      category: 'navigation',
    });

    this.addShortcut({
      keys: 'Ctrl+D',
      description: 'Duplicate project',
      handler: () => {},
      category: 'editing',
    });

    this.addShortcut({
      keys: 'Ctrl+Shift+?',
      description: 'Show shortcuts help',
      handler: () => {},
      category: 'general',
    });
  }

  /**
   * Add a keyboard shortcut
   */
  addShortcut(shortcut: Shortcut): void {
    const normalizedKeys = this.normalizeKeys(shortcut.keys);
    this.shortcuts.set(normalizedKeys, shortcut);
  }

  /**
   * Remove a keyboard shortcut
   */
  removeShortcut(keys: string): void {
    const normalizedKeys = this.normalizeKeys(keys);
    this.shortcuts.delete(normalizedKeys);
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: Shortcut['category']): Shortcut[] {
    return Array.from(this.shortcuts.values()).filter((s) => s.category === category);
  }

  /**
   * Register keyboard event listeners
   */
  register(): void {
    if (this.isRegistered) return;

    document.addEventListener('keydown', this.handleKeyDown);
    this.isRegistered = true;
  }

  /**
   * Unregister keyboard event listeners
   */
  unregister(): void {
    if (!this.isRegistered) return;

    document.removeEventListener('keydown', this.handleKeyDown);
    this.isRegistered = false;
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const pressedKeys = this.normalizeKeys(this.getEventKeys(event));
    const shortcut = this.shortcuts.get(pressedKeys);

    if (shortcut) {
      event.preventDefault();
      shortcut.handler();
    }
  };

  /**
   * Get keys from keyboard event
   */
  private getEventKeys(event: KeyboardEvent): string {
    const keys: string[] = [];

    if (event.ctrlKey) keys.push('Ctrl');
    if (event.shiftKey) keys.push('Shift');
    if (event.altKey) keys.push('Alt');
    if (event.metaKey) keys.push('Meta');

    // Get the main key
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    keys.push(key);

    return keys.join('+');
  }

  /**
   * Normalize keys string
   */
  private normalizeKeys(keys: string): string {
    return keys
      .split('+')
      .map((k) => k.trim())
      .map((k) => {
        if (k.length === 1) return k.toUpperCase();
        return k;
      })
      .join('+');
  }

  /**
   * Format keys for display
   */
  static formatKeys(keys: string): string {
    return keys
      .split('+')
      .map((k) => {
        const keyMap: Record<string, string> = {
          Ctrl: '⌃',
          Shift: '',
          Alt: '',
          Meta: '',
          Enter: '↵',
        };
        return keyMap[k] || k;
      })
      .join(' ');
  }
}

export default KeyboardShortcuts;
