/**
 * Curated Community Templates & Custom Template Storage Manager
 */

import { CustomTemplate, validateTemplate } from './templateSchema';

export const COMMUNITY_TEMPLATES: CustomTemplate[] = [
  {
    id: 'saas-modern',
    name: 'Modern SaaS & Framework',
    description: 'Balanced visual density with expandable grid matrix features, comparison tables, and dynamic accent badges.',
    author: 'GitInfoGraphics Core',
    version: '1.2.0',
    tags: ['SaaS', 'Full-Stack', 'Grid', 'Featured'],
    theme: 'scandi-minimal',
    density: 'medium',
    layout: 'desktop',
    sectionVariants: {
      features: 'grid',
      comparison: 'comparison',
      architecture: 'callout',
      'tech-stack': 'pills',
      metrics: 'cards'
    },
    disabledSections: [],
    showQR: true,
    qrUrl: 'https://github.com'
  },
  {
    id: 'devops-infra',
    name: 'DevOps & Cloud Infrastructure',
    description: 'High-density technical layout featuring sequential deployment timeline, benchmark latency metrics, and SLA callouts.',
    author: 'CloudNative Guild',
    version: '1.1.0',
    tags: ['DevOps', 'Cloud', 'Timeline', 'Metrics'],
    theme: 'midnight',
    density: 'dense',
    layout: 'desktop',
    sectionVariants: {
      'getting-started': 'timeline',
      metrics: 'cards',
      features: 'grid',
      security: 'callout',
      architecture: 'callout'
    },
    disabledSections: []
  },
  {
    id: 'minimalist-lib',
    name: 'Zero-Fluff Minimalist Library',
    description: 'Ultra-clean text hierarchy, high-contrast monospace code blocks, and distraction-free typography for utility packages.',
    author: 'Nordic OpenSource',
    version: '1.0.0',
    tags: ['Minimalist', 'Utility', 'Library', 'Clean'],
    theme: 'nordic-frost',
    density: 'minimal',
    layout: 'desktop',
    sectionVariants: {
      features: 'pills',
      'tech-stack': 'pills',
      metrics: 'cards'
    },
    disabledSections: []
  },
  {
    id: 'ai-ml-agent',
    name: 'AI Agent & LLM Research',
    description: 'Rich telemetry layout with circular benchmark rings, latency counters, architecture diagrams, and model evaluation callouts.',
    author: 'DeepResearch Labs',
    version: '1.3.0',
    tags: ['AI/ML', 'Agents', 'Benchmarks', 'Rich'],
    theme: 'aurora-borealis',
    density: 'dense',
    layout: 'desktop',
    sectionVariants: {
      metrics: 'cards',
      features: 'grid',
      architecture: 'callout',
      'getting-started': 'timeline'
    },
    disabledSections: [],
    showQR: true
  },
  {
    id: 'mobile-app-showcase',
    name: 'Mobile App & App Store Readme',
    description: 'Reflowed mobile portrait viewport with QR code deep-linking, feature highlights, and responsive touch layout.',
    author: 'MobileApp Guild',
    version: '1.0.0',
    tags: ['Mobile', 'iOS', 'Android', 'QR'],
    theme: 'fjord-deep',
    density: 'medium',
    layout: 'mobile',
    sectionVariants: {
      features: 'cards',
      'getting-started': 'timeline',
      'tech-stack': 'pills'
    },
    disabledSections: [],
    showQR: true
  },
  {
    id: 'enterprise-security',
    name: 'Enterprise Governance & Security',
    description: 'Rigorous compliance matrix, SOC2/GDPR callouts, security audit disclosure, and enterprise support directory.',
    author: 'Enterprise Infosec',
    version: '1.1.0',
    tags: ['Security', 'Enterprise', 'Compliance', 'Audit'],
    theme: 'obsidian-slate',
    density: 'medium',
    layout: 'desktop',
    sectionVariants: {
      security: 'callout',
      features: 'grid',
      api: 'table',
      comparison: 'comparison'
    },
    disabledSections: []
  }
];

const CUSTOM_TEMPLATES_STORAGE_KEY = 'gig-custom-templates';

export class TemplateManager {
  static getCommunityTemplates(): CustomTemplate[] {
    return COMMUNITY_TEMPLATES;
  }

  static getCustomTemplates(): CustomTemplate[] {
    try {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => validateTemplate(item).valid);
    } catch {
      return [];
    }
  }

  static getAllTemplates(): CustomTemplate[] {
    const community = this.getCommunityTemplates();
    const custom = this.getCustomTemplates();
    return [...community, ...custom];
  }

  static saveCustomTemplate(template: CustomTemplate): { success: boolean; error?: string } {
    const validation = validateTemplate(template);
    if (!validation.valid || !validation.template) {
      return { success: false, error: validation.errors.join(', ') };
    }

    try {
      const existing = this.getCustomTemplates();
      const filtered = existing.filter((t) => t.id !== validation.template!.id);
      const updated = [validation.template, ...filtered];
      localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Storage quota exceeded' };
    }
  }

  static deleteCustomTemplate(templateId: string): boolean {
    try {
      const existing = this.getCustomTemplates();
      const updated = existing.filter((t) => t.id !== templateId);
      localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  }

  static exportTemplateToJson(template: CustomTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  static importTemplateFromJson(jsonString: string): {
    success: boolean;
    template?: CustomTemplate;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      const result = validateTemplate(parsed);
      if (!result.valid || !result.template) {
        return { success: false, error: result.errors.join(', ') };
      }
      this.saveCustomTemplate(result.template);
      return { success: true, template: result.template };
    } catch (e: any) {
      return { success: false, error: 'Invalid JSON format: ' + e?.message };
    }
  }
}
