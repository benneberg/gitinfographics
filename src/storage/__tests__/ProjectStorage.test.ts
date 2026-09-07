import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectStorage } from '../ProjectStorage';

describe('ProjectStorage', () => {
  let storage: ProjectStorage;

  beforeEach(() => {
    storage = new ProjectStorage();
    storage.clearAll();
  });

  it('creates, retrieves, and updates projects', () => {
    const project = storage.createProject('My Test Repo', {
      type: 'text',
      content: '# Hello World\nTesting project storage',
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('My Test Repo');

    const fetched = storage.getProject(project.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe('My Test Repo');

    const updated = storage.updateProject(project.id, { name: 'Renamed Project' });
    expect(updated?.name).toBe('Renamed Project');
  });

  it('duplicates and deletes projects', () => {
    const p1 = storage.createProject('Original', {
      type: 'text',
      content: '# Original',
    });

    const dup = storage.duplicateProject(p1.id);
    expect(dup).not.toBeNull();
    expect(dup?.name).toBe('Original (Copy)');
    expect(dup?.id).not.toBe(p1.id);

    const deleted = storage.deleteProject(p1.id);
    expect(deleted).toBe(true);
    expect(storage.getProject(p1.id)).toBeNull();
  });

  it('tracks generation history records', () => {
    const p = storage.createProject('History Test', {
      type: 'text',
      content: '# Content',
    });

    const gen = storage.addGeneration(p.id, {
      svgContent: '<svg></svg>',
      format: { name: 'Desktop', width: 880, height: 'auto', description: '' },
      themeId: 'scandinavian-light',
      sourceHash: 'abc1234',
      metadata: {
        duration: 120,
        sectionsCount: 3,
        metricsCount: 4,
      },
    });

    expect(gen).not.toBeNull();
    const history = storage.getGenerations(p.id);
    expect(history.length).toBe(1);
    expect(history[0].themeId).toBe('scandinavian-light');
  });

  it('exports and imports project JSON', () => {
    const p = storage.createProject('Export Me', {
      type: 'text',
      content: '# Export Content',
    });

    const json = storage.exportProject(p.id);
    expect(json).toContain('Export Me');

    const imported = storage.importProject(json!);
    expect(imported).not.toBeNull();
    expect(imported?.name).toBe('Export Me');
    expect(imported?.id).not.toBe(p.id); // Should assign a new unique ID
  });
});
