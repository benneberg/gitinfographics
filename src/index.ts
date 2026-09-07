// src/index.ts

import { CanvasExporter, CANVAS_PRESETS } from './export/CanvasExporter';
import { ThemeManager, BUILTIN_THEMES } from './renderer/themes/ThemeManager';
import { ProjectStorage } from './storage/ProjectStorage';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';

export class GitInfoGraphicsApp {
  private canvasExporter: CanvasExporter;
  private themeManager: ThemeManager;
  private projectStorage: ProjectStorage;
  private keyboardShortcuts: KeyboardShortcuts;

  constructor() {
    this.canvasExporter = new CanvasExporter();
    this.themeManager = new ThemeManager();
    this.projectStorage = new ProjectStorage();
    this.keyboardShortcuts = new KeyboardShortcuts();
    
    this.setupKeyboardShortcuts();
  }

  private setupKeyboardShortcuts(): void {
    // Update handlers with actual methods
    this.keyboardShortcuts.addShortcut({
      keys: 'Ctrl+S',
      description: 'Export as SVG',
      handler: () => this.exportSVG(),
      category: 'export',
    });

    this.keyboardShortcuts.addShortcut({
      keys: 'Ctrl+Shift+P',
      description: 'Export as PNG',
      handler: () => this.exportPNG(),
      category: 'export',
    });

    this.keyboardShortcuts.addShortcut({
      keys: 'Ctrl+T',
      description: 'Switch theme',
      handler: () => this.switchTheme(),
      category: 'navigation',
    });

    this.keyboardShortcuts.register();
  }

  private exportSVG(): void {
    // Implementation
    console.log('Export SVG');
  }

  private exportPNG(): void {
    // Implementation
    console.log('Export PNG');
  }

  private switchTheme(): void {
    const themes = this.themeManager.getAllThemes();
    const current = this.themeManager.getCurrentTheme();
    const currentIndex = themes.findIndex(t => t.id === current.id);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.themeManager.setCurrentTheme(nextTheme.id);
  }

  // Public API
  getCanvasExporter(): CanvasExporter {
    return this.canvasExporter;
  }

  getThemeManager(): ThemeManager {
    return this.themeManager;
  }

  getProjectStorage(): ProjectStorage {
    return this.projectStorage;
  }

  getKeyboardShortcuts(): KeyboardShortcuts {
    return this.keyboardShortcuts;
  }
}

// Export all modules
export { CanvasExporter, CANVAS_PRESETS };
export { ThemeManager, BUILTIN_THEMES };
export { ProjectStorage };
export { KeyboardShortcuts };

// Export types
export type * from './export/CanvasExporter';
export type * from './renderer/themes/ThemeManager';
export type * from './storage/ProjectStorage';
export type * from './ui/KeyboardShortcuts';

// Initialize app
if (typeof window !== 'undefined') {
  (window as any).GitInfoGraphics = GitInfoGraphicsApp;
}
