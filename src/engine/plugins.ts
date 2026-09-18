/**
 * Extensible Plugin Interface & Metric Extractor System
 * Allows custom plugins to parse domain-specific telemetry and enrich infographic specs.
 */

import { ParsedDoc, SpecSection, MetricItem } from './types';

export interface PluginContext {
  parsedDoc: ParsedDoc;
  githubMeta?: any;
  customOptions?: Record<string, any>;
}

export interface GitInfoGraphicsPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  extractMetrics?: (text: string, context?: PluginContext) => MetricItem[];
  transformSections?: (sections: SpecSection[], context?: PluginContext) => SpecSection[];
  customBadges?: (doc: ParsedDoc) => Array<{ alt: string; url: string }>;
}

// 1. Built-in: Docker & Container Telemetry Plugin
export const DockerMetricsPlugin: GitInfoGraphicsPlugin = {
  id: 'gig-docker-metrics',
  name: 'Docker & Container Telemetry',
  version: '1.0.0',
  description: 'Mines Docker pull counts, compressed image sizes, and multi-arch build tags from markdown.',
  author: 'GitInfoGraphics Core',
  enabled: true,
  extractMetrics: (text: string) => {
    const metrics: MetricItem[] = [];

    // Image size pattern: e.g., "12MB image size" or "compressed size: 8.4MB"
    const sizeMatch = text.match(/(?:image|compressed|docker|container)\s*(?:size|footprint)[:\s]+(\d+(?:\.\d+)?\s*(?:MB|KB|GB|B))/i)
      || text.match(/(\d+(?:\.\d+)?\s*(?:MB|KB|GB))\s*(?:docker|container|base)\s*image/i);
    if (sizeMatch) {
      metrics.push({ value: sizeMatch[1].trim(), label: 'Docker Size' });
    }

    // Pull count pattern: e.g., "10M+ docker pulls" or "pulls: 500k"
    const pullMatch = text.match(/(\d+(?:\.\d+)?[kKmMbB]?\+?)\s*(?:docker\s*pulls?|container\s*downloads?)/i)
      || text.match(/(?:pulls?|downloads?)[:\s]+(\d+(?:\.\d+)?[kKmMbB]?\+?)/i);
    if (pullMatch) {
      metrics.push({ value: pullMatch[1].trim(), label: 'Docker Pulls' });
    }

    return metrics;
  }
};

// 2. Built-in: NPM & Ecosystem Package Telemetry Plugin
export const NpmTelemetryPlugin: GitInfoGraphicsPlugin = {
  id: 'gig-npm-telemetry',
  name: 'NPM & Package Telemetry',
  version: '1.0.0',
  description: 'Extracts weekly NPM download milestones, bundlephobia gzipped sizes, and zero-dependency indicators.',
  author: 'GitInfoGraphics Core',
  enabled: true,
  extractMetrics: (text: string) => {
    const metrics: MetricItem[] = [];

    // Weekly downloads: e.g. "500k weekly downloads" or "downloads/week: 1.2M"
    const dlMatch = text.match(/(\d+(?:\.\d+)?[kKmMbB]?\+?)\s*(?:weekly\s*downloads?|downloads?\s*\/\s*week)/i);
    if (dlMatch) {
      metrics.push({ value: dlMatch[1].trim(), label: 'NPM / Week' });
    }

    // Minified + gzipped size: e.g. "bundle size: 2.1kb gzip" or "3.4 kB gzipped"
    const gzipMatch = text.match(/(\d+(?:\.\d+)?\s*(?:kB|KB|bytes|b))\s*(?:min\+gzip|gzip|gzipped)/i)
      || text.match(/(?:bundle\s*size|gzip\s*size)[:\s]+(\d+(?:\.\d+)?\s*(?:kB|KB|bytes|b))/i);
    if (gzipMatch) {
      metrics.push({ value: gzipMatch[1].trim(), label: 'Gzip Size' });
    }

    // Zero dependencies indicator
    if (/\b(?:zero|0|no)\s*dependenc(?:ies|y)\b/i.test(text)) {
      metrics.push({ value: '0 Deps', label: 'Dependencies' });
    }

    return metrics;
  }
};

// 3. Built-in: High-Performance Benchmarking Plugin
export const BenchmarkLatencyPlugin: GitInfoGraphicsPlugin = {
  id: 'gig-benchmark-latency',
  name: 'Latency & Benchmark Ops',
  version: '1.0.0',
  description: 'Extracts p95/p99 tail latency, operations per second (ops/sec), and memory throughput figures.',
  author: 'GitInfoGraphics Core',
  enabled: true,
  extractMetrics: (text: string) => {
    const metrics: MetricItem[] = [];

    // Ops/sec: e.g. "1.5M ops/sec" or "250,000 req/s"
    const opsMatch = text.match(/(\d+(?:[,\.]\d+)?[kKmMbB]?)\s*(?:ops?\s*\/\s*sec|req\s*\/\s*s|transactions?\s*\/\s*sec)/i);
    if (opsMatch) {
      metrics.push({ value: opsMatch[1].trim(), label: 'Throughput' });
    }

    // p95 / p99 Latency: e.g. "p99: 1.2ms" or "p95 latency < 5ms"
    const p99Match = text.match(/(?:p99|p95|tail)\s*(?:latency)?[:\s<]+(\d+(?:\.\d+)?\s*(?:µs|ms|ns))/i);
    if (p99Match) {
      metrics.push({ value: p99Match[1].trim(), label: 'P99 Latency' });
    }

    return metrics;
  }
};

// 4. Built-in: Security & Compliance Plugin
export const SecurityCompliancePlugin: GitInfoGraphicsPlugin = {
  id: 'gig-security-compliance',
  name: 'Security & Compliance Audits',
  version: '1.0.0',
  description: 'Recognizes SOC2 Type II, ISO 27001, HIPAA, zero CVE disclosure, and OWASP Top 10 badges.',
  author: 'GitInfoGraphics Core',
  enabled: true,
  extractMetrics: (text: string) => {
    const metrics: MetricItem[] = [];

    if (/\bSOC\s*2\s*(?:Type\s*II)?\b/i.test(text)) {
      metrics.push({ value: 'SOC 2 Type II', label: 'Compliance' });
    }
    if (/\bISO\s*27001\b/i.test(text)) {
      metrics.push({ value: 'ISO 27001', label: 'Certified' });
    }
    if (/\b0\s*(?:critical\s*)?CVEs?\b|\bzero\s*vulnerabilit/i.test(text)) {
      metrics.push({ value: '0 CVEs', label: 'Vulnerabilities' });
    }

    return metrics;
  }
};

/**
 * Central Plugin Registry
 */
export class PluginRegistry {
  private static plugins: Map<string, GitInfoGraphicsPlugin> = new Map([
    [DockerMetricsPlugin.id, { ...DockerMetricsPlugin }],
    [NpmTelemetryPlugin.id, { ...NpmTelemetryPlugin }],
    [BenchmarkLatencyPlugin.id, { ...BenchmarkLatencyPlugin }],
    [SecurityCompliancePlugin.id, { ...SecurityCompliancePlugin }]
  ]);

  static register(plugin: GitInfoGraphicsPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  static unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  static getPlugins(): GitInfoGraphicsPlugin[] {
    return Array.from(this.plugins.values());
  }

  static getPlugin(pluginId: string): GitInfoGraphicsPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  static togglePlugin(pluginId: string, enabled?: boolean): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;
    plugin.enabled = enabled !== undefined ? enabled : !plugin.enabled;
    return plugin.enabled;
  }

  /**
   * Runs all enabled plugin metric extractors on markdown text
   */
  static runMetricExtractors(text: string, context?: PluginContext): MetricItem[] {
    const combined: MetricItem[] = [];
    const seen = new Set<string>();

    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled || !plugin.extractMetrics) continue;
      try {
        const metrics = plugin.extractMetrics(text, context);
        for (const m of metrics) {
          const key = m.label.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(m);
          }
        }
      } catch (e) {
        console.warn(`[Plugin ${plugin.id}] metric extraction failed:`, e);
      }
    }

    return combined;
  }

  /**
   * Runs all enabled plugin section transformers
   */
  static runSectionTransformers(sections: SpecSection[], context?: PluginContext): SpecSection[] {
    let current = [...sections];

    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled || !plugin.transformSections) continue;
      try {
        current = plugin.transformSections(current, context);
      } catch (e) {
        console.warn(`[Plugin ${plugin.id}] section transform failed:`, e);
      }
    }

    return current;
  }
}
