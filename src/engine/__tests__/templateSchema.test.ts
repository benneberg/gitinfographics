import { describe, it, expect } from 'vitest';
import { validateTemplate, TEMPLATE_JSON_SCHEMA } from '../templateSchema';
import { TemplateManager, COMMUNITY_TEMPLATES } from '../templates';

describe('Custom Template JSON Schema & Management', () => {
  it('validates a valid custom template', () => {
    const validData = {
      id: 'custom-modern',
      name: 'Custom Modern Template',
      description: 'A great layout for web apps',
      author: 'Tester',
      theme: 'scandi-minimal',
      density: 'medium',
      layout: 'desktop',
      sectionVariants: {
        features: 'grid',
        metrics: 'cards'
      }
    };

    const result = validateTemplate(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.template?.id).toBe('custom-modern');
    expect(result.template?.name).toBe('Custom Modern Template');
  });

  it('rejects an invalid template missing required properties', () => {
    const invalidData = {
      description: 'Missing id, name, theme, density'
    };

    const result = validateTemplate(invalidData);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('verifies all curated community templates pass validation', () => {
    expect(COMMUNITY_TEMPLATES.length).toBeGreaterThanOrEqual(5);
    for (const t of COMMUNITY_TEMPLATES) {
      const res = validateTemplate(t);
      expect(res.valid).toBe(true);
      expect(res.template).toBeDefined();
    }
  });

  it('serializes and imports template correctly from JSON', () => {
    const sample = COMMUNITY_TEMPLATES[0];
    const json = TemplateManager.exportTemplateToJson(sample);
    expect(typeof json).toBe('string');

    const imported = TemplateManager.importTemplateFromJson(json);
    expect(imported.success).toBe(true);
    expect(imported.template?.name).toBe(sample.name);
  });
});
