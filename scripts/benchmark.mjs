#!/usr/bin/env node

/**
 * Automated Performance Benchmark Suite
 * Measures parse, analysis, and SVG render latency against strict performance thresholds.
 */

import { performance } from 'node:perf_hooks';
import { parseMD } from '../packages/parser/dist/index.js';
import { buildRuleSpec, classifySec } from '../packages/analyzer/dist/index.js';
import { renderSVG } from '../packages/renderer/dist/index.js';

const SAMPLE_SMALL = `# Minimal Tool
A fast and lightweight utility for developers.

## Features
- Blazing fast execution: < 1ms
- Zero external dependencies
- 100% test coverage with 45 unit tests

## Tech Stack
TypeScript, Node.js, Vitest
`;

const SAMPLE_MEDIUM = `# Enterprise Data Pipeline
High-throughput distributed stream processor and real-time analytical engine.

## Problem Statement
Traditional ETL batch processing introduces unacceptable 45-minute latency delays. Organizations require sub-second streaming pipelines with strict zero data loss guarantees.

## Solution Architecture
Our modern stream engine utilizes asynchronous event sourcing, distributed memory caches, and auto-balancing partitions.

## Key Performance Benchmarks
- Throughput: 1.8M events/sec sustained
- P99 Tail Latency: 2.4ms under 90% load
- High Availability: 99.999% uptime guarantee
- Memory Footprint: 35MB base resident memory

## Feature Matrix
- Automated schema registry with protobuf validation
- Multi-region replication with automatic failover
- End-to-end AES-256 encryption at rest and in transit
- Prometheus and OpenTelemetry instrumentation built-in

## Installation & Quick Start
\`\`\`bash
npm install -g @enterprise/data-pipeline
pipeline start --config ./cluster.yaml
\`\`\`

## Technology Stack
Rust, Tokio, Apache Kafka, WebAssembly, Kubernetes, Docker

## License & Support
Licensed under the Apache 2.0 License. Commercial enterprise 24/7 SLA available.
`;

// Synthesize large document (1500+ lines)
const SAMPLE_LARGE = Array(15).fill(SAMPLE_MEDIUM).join('\n\n---\n\n');

function runBenchmark(name, runner, iterations = 100) {
  // Warmup
  for (let i = 0; i < 10; i++) runner();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    runner();
  }
  const end = performance.now();
  const totalMs = end - start;
  const avgMs = totalMs / iterations;
  const opsPerSec = Math.round((iterations / totalMs) * 1000);

  return { name, avgMs, opsPerSec, totalMs, iterations };
}

console.log('='.repeat(65));
console.log('⚡ GitInfoGraphics Performance Benchmarking Suite');
console.log('='.repeat(65));

const results = [];

// 1. Markdown Parser Benchmarks
results.push(runBenchmark('Parser (Small ~15 lines)', () => parseMD(SAMPLE_SMALL), 500));
results.push(runBenchmark('Parser (Medium ~50 lines)', () => parseMD(SAMPLE_MEDIUM), 300));
results.push(runBenchmark('Parser (Large ~750 lines)', () => parseMD(SAMPLE_LARGE), 100));

// 2. Analyzer Benchmarks
const mediumDoc = parseMD(SAMPLE_MEDIUM);
results.push(runBenchmark('Classifier (Medium)', () => {
  mediumDoc.sections.forEach(s => classifySec(s));
}, 300));
results.push(runBenchmark('Spec Builder (Medium)', () => buildRuleSpec(mediumDoc), 300));

// 3. Renderer Benchmarks
const mediumSpec = buildRuleSpec(mediumDoc);
results.push(runBenchmark('SVG Reflow Renderer (Desktop)', () => renderSVG(mediumSpec, 'scandi-minimal', { layout: 'desktop' }), 150));
results.push(runBenchmark('SVG Reflow Renderer (Mobile)', () => renderSVG(mediumSpec, 'midnight', { layout: 'mobile' }), 150));
results.push(runBenchmark('SVG Reflow Renderer (Dense Studio)', () => renderSVG(mediumSpec, 'aurora-borealis', { layout: 'desktop', density: 'rich' }), 150));

console.log('\n| Task / Benchmark | Avg Latency | Throughput (ops/sec) | Status |');
console.log('|' + '-'.repeat(30) + '|' + '-'.repeat(15) + '|' + '-'.repeat(24) + '|' + '-'.repeat(10) + '|');

let allPassed = true;
const THRESHOLDS = {
  'Parser (Small ~15 lines)': 1.0, // ms
  'Parser (Medium ~50 lines)': 3.0,
  'Parser (Large ~750 lines)': 25.0,
  'Classifier (Medium)': 1.5,
  'Spec Builder (Medium)': 2.0,
  'SVG Reflow Renderer (Desktop)': 15.0,
  'SVG Reflow Renderer (Mobile)': 15.0,
  'SVG Reflow Renderer (Dense Studio)': 20.0
};

for (const r of results) {
  const threshold = THRESHOLDS[r.name] || 25.0;
  const passed = r.avgMs <= threshold;
  if (!passed) allPassed = false;
  const status = passed ? '✅ PASS' : '❌ SLOW';
  console.log(`| ${r.name.padEnd(28)} | ${r.avgMs.toFixed(3).padStart(9)} ms | ${r.opsPerSec.toLocaleString().padStart(18)} ops/s | ${status} |`);
}

console.log('='.repeat(65));
if (allPassed) {
  console.log('🎉 All performance benchmarks passed within SLA thresholds!\n');
  process.exit(0);
} else {
  console.error('⚠️ One or more benchmarks exceeded threshold limits!\n');
  process.exit(1);
}
