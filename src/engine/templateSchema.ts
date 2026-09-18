/**
 * Custom Template JSON Schema & Validation
 * GitInfoGraphics Layout & Styling Template Specification
 */

import { VisualDensity } from './types';

export interface CustomTemplateExtractor {
  name: string;
  pattern: string; // RegExp string
  label: string;
  icon?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  theme: string;
  density: VisualDensity;
  layout: 'desktop' | 'mobile' | 'auto';
  sectionVariants: Record<string, 'grid' | 'timeline' | 'comparison' | 'callout' | 'pills' | 'cards' | 'table'>;
  disabledSections?: string[];
  showQR?: boolean;
  qrUrl?: string;
  logo?: {
    url: string;
    size: number;
    placement: 'left' | 'right' | 'center';
  };
  customTitle?: string;
  customSubtitle?: string;
  sampleMarkdown?: string;
  customExtractors?: CustomTemplateExtractor[];
  createdAt?: string;
  updatedAt?: string;
}

export const TEMPLATE_JSON_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'GitInfoGraphicsTemplate',
  description: 'Shareable configuration and layout template for GitInfoGraphics infographics',
  type: 'object',
  required: ['id', 'name', 'theme', 'density', 'sectionVariants'],
  properties: {
    id: { type: 'string', minLength: 2, maxLength: 64 },
    name: { type: 'string', minLength: 2, maxLength: 80 },
    description: { type: 'string', maxLength: 300 },
    author: { type: 'string', maxLength: 60 },
    version: { type: 'string', default: '1.0.0' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    theme: { type: 'string' },
    density: {
      type: 'string',
      enum: ['minimal', 'balanced', 'rich']
    },
    layout: {
      type: 'string',
      enum: ['desktop', 'mobile', 'auto']
    },
    sectionVariants: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        enum: ['grid', 'timeline', 'comparison', 'callout', 'pills', 'cards', 'table']
      }
    },
    disabledSections: {
      type: 'array',
      items: { type: 'string' }
    },
    showQR: { type: 'boolean' },
    qrUrl: { type: 'string' },
    logo: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        size: { type: 'number', minimum: 20, maximum: 120 },
        placement: { type: 'string', enum: ['left', 'right', 'center'] }
      }
    },
    customTitle: { type: 'string' },
    customSubtitle: { type: 'string' },
    sampleMarkdown: { type: 'string' },
    customExtractors: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'pattern', 'label'],
        properties: {
          name: { type: 'string' },
          pattern: { type: 'string' },
          label: { type: 'string' },
          icon: { type: 'string' }
        }
      }
    }
  }
};

/**
 * Validates any JSON object against the CustomTemplate specification.
 */
export function validateTemplate(data: unknown): {
  valid: boolean;
  errors: string[];
  template?: CustomTemplate;
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Template must be an object'] };
  }

  const obj = data as Record<string, any>;

  if (!obj.id || typeof obj.id !== 'string' || obj.id.trim().length === 0) {
    errors.push('Missing or invalid "id" (string required)');
  }
  if (!obj.name || typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    errors.push('Missing or invalid "name" (string required)');
  }
  if (!obj.theme || typeof obj.theme !== 'string') {
    errors.push('Missing or invalid "theme" (string required)');
  }

  const validDensities = ['minimal', 'balanced', 'rich'];
  if (!obj.density || !validDensities.includes(obj.density)) {
    errors.push(`Invalid density: "${obj.density}". Must be one of: minimal, balanced, rich`);
  }

  if (obj.sectionVariants && typeof obj.sectionVariants !== 'object') {
    errors.push('"sectionVariants" must be a key-value dictionary');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const template: CustomTemplate = {
    id: String(obj.id).toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    name: String(obj.name).trim(),
    description: typeof obj.description === 'string' ? obj.description.trim() : '',
    author: typeof obj.author === 'string' ? obj.author.trim() : 'Community Contributor',
    version: typeof obj.version === 'string' ? obj.version : '1.0.0',
    tags: Array.isArray(obj.tags) ? obj.tags.map(String) : ['custom'],
    theme: String(obj.theme),
    density: obj.density as VisualDensity,
    layout: ['desktop', 'mobile', 'auto'].includes(obj.layout) ? obj.layout : 'desktop',
    sectionVariants: typeof obj.sectionVariants === 'object' && obj.sectionVariants ? obj.sectionVariants : {},
    disabledSections: Array.isArray(obj.disabledSections) ? obj.disabledSections.map(String) : [],
    showQR: Boolean(obj.showQR),
    qrUrl: typeof obj.qrUrl === 'string' ? obj.qrUrl : undefined,
    logo: obj.logo && typeof obj.logo === 'object' ? {
      url: String(obj.logo.url || ''),
      size: Number(obj.logo.size) || 48,
      placement: ['left', 'right', 'center'].includes(obj.logo.placement) ? obj.logo.placement : 'left'
    } : undefined,
    customTitle: typeof obj.customTitle === 'string' ? obj.customTitle : undefined,
    customSubtitle: typeof obj.customSubtitle === 'string' ? obj.customSubtitle : undefined,
    sampleMarkdown: typeof obj.sampleMarkdown === 'string' ? obj.sampleMarkdown : undefined,
    customExtractors: Array.isArray(obj.customExtractors) ? obj.customExtractors : undefined,
    createdAt: obj.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { valid: true, errors: [], template };
}
