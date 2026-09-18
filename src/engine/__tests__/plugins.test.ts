import { describe, it, expect } from 'vitest';
import {
  PluginRegistry,
  DockerMetricsPlugin,
  NpmTelemetryPlugin,
  BenchmarkLatencyPlugin,
  SecurityCompliancePlugin,
  GitInfoGraphicsPlugin
} from '../plugins';

describe('Extensible Plugin System', () => {
  it('has built-in plugins registered by default', () => {
    const plugins = PluginRegistry.getPlugins();
    expect(plugins.length).toBeGreaterThanOrEqual(4);
    expect(plugins.some((p) => p.id === 'gig-docker-metrics')).toBe(true);
    expect(plugins.some((p) => p.id === 'gig-npm-telemetry')).toBe(true);
  });

  it('extracts docker metrics from markdown text', () => {
    const text = 'Docker image footprint: 14.2MB compressed with over 5M+ docker pulls worldwide.';
    const metrics = DockerMetricsPlugin.extractMetrics!(text);
    expect(metrics.length).toBeGreaterThanOrEqual(1);
    expect(metrics.some((m) => m.label === 'Docker Size' && m.value === '14.2MB')).toBe(true);
    expect(metrics.some((m) => m.label === 'Docker Pulls' && m.value === '5M+')).toBe(true);
  });

  it('extracts npm telemetry from markdown text', () => {
    const text = 'Achieved 450k weekly downloads with bundle size: 2.4kB gzip and zero dependencies.';
    const metrics = NpmTelemetryPlugin.extractMetrics!(text);
    expect(metrics.some((m) => m.label === 'NPM / Week' && m.value === '450k')).toBe(true);
    expect(metrics.some((m) => m.label === 'Gzip Size' && m.value === '2.4kB')).toBe(true);
    expect(metrics.some((m) => m.label === 'Dependencies' && m.value === '0 Deps')).toBe(true);
  });

  it('extracts latency benchmarks from markdown text', () => {
    const text = 'Sustains 1.2M ops/sec with p99 latency < 2.5ms across all cloud regions.';
    const metrics = BenchmarkLatencyPlugin.extractMetrics!(text);
    expect(metrics.some((m) => m.label === 'Throughput' && m.value === '1.2M')).toBe(true);
    expect(metrics.some((m) => m.label === 'P99 Latency' && m.value === '2.5ms')).toBe(true);
  });

  it('allows registering and executing custom plugins', () => {
    const customPlugin: GitInfoGraphicsPlugin = {
      id: 'custom-ml-plugin',
      name: 'ML Model Plugin',
      version: '1.0.0',
      description: 'Extracts parameter counts',
      author: 'Tester',
      enabled: true,
      extractMetrics: (txt: string) => {
        const m = txt.match(/(\d+B)\s*parameters/i);
        return m ? [{ value: m[1], label: 'Model Params' }] : [];
      }
    };

    PluginRegistry.register(customPlugin);
    expect(PluginRegistry.getPlugin('custom-ml-plugin')).toBeDefined();

    const mined = PluginRegistry.runMetricExtractors('State-of-the-art 70B parameters open foundation model.');
    expect(mined.some((m) => m.label === 'Model Params' && m.value === '70B')).toBe(true);

    // Clean up
    PluginRegistry.unregister('custom-ml-plugin');
    expect(PluginRegistry.getPlugin('custom-ml-plugin')).toBeUndefined();
  });
});
