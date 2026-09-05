import { GitHubMeta } from './types';

export interface SampleReadme {
  id: string;
  name: string;
  repo: string;
  description: string;
  markdown: string;
  mockMeta?: GitHubMeta;
}

export const SAMPLE_READMES: SampleReadme[] = [
  {
    id: 'infographic-studio',
    name: 'Infographic Studio (Current Repo)',
    repo: 'benneberg/infographic-studio',
    description: 'Rule-based client-side engine and studio for turning Markdown into vector infographics.',
    markdown: `# Infographic Studio
Transform messy GitHub READMEs into crisp, beautiful, informative SVG infographics.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-98.4%25-green.svg)]()
[![Version](https://img.shields.io/badge/version-3.2.0-blue.svg)]()

## The Problem
Developers invest weeks into building great open-source tools, but their README files are often wall-to-wall text. Casual visitors drop off in seconds without grasping the core architecture or value proposition.

## The Solution
Infographic Studio scans Markdown documentation deterministically, classifies structural patterns, mines performance metrics, and renders dynamic vector infographics ready for GitHub READMEs and CI/CD pipelines.

## Key Features
- **100% Client-Side & Deterministic**: Zero server lag, instant SVG rendering with zero telemetry.
- **Rule-Based Classifier**: Context-aware heuristics score sections by title, relative position, and syntax density.
- **Deep Metric Mining**: Extracts uptime, benchmarks, test coverage, user counts, and badge data automatically.
- **GitHub Action Ready**: Drop into any repo workflow to automatically re-generate infographics on every commit.
- **Dynamic Height Layout**: Avoids fixed clipping through adaptive vertical rhythm and auto-wrapping.
- **Multi-Theme Engine**: Slate, Cyber Neon, Deep Ocean, Sunset Crimson, and GitHub Dark themes.

## Tech Stack
Built with modern web standards and lightweight primitives:
- TypeScript
- Vanilla JavaScript
- SVG Vector Standard
- Vite
- TailwindCSS
- GitHub Actions CI/CD
- Node.js

## Quick Start
1. Clone the repository and install dependencies: \`npm install\`
2. Run local studio preview: \`npm run dev\`
3. Generate standalone SVG: \`node scripts/generate-infographic.mjs README.md\`
4. Add generated \`infographic.svg\` to your README header!

## Benchmarks & Performance
- 99.9% parser stability across 500+ top open-source repositories
- < 18ms generation latency for 10,000-line Markdown documents
- 0 dependencies in core rendering module
- 40% improvement in repository bounce rate
`
  },
  {
    id: 'agentic-flow',
    name: 'AgenticFlow - LLM Orchestrator',
    repo: 'deepflow-ai/agentic-flow',
    description: 'Ultra-fast asynchronous multi-agent coordination framework with streaming evaluations.',
    markdown: `# AgenticFlow
Production-grade multi-agent runtime for real-time streaming AI systems.

[![Version](https://img.shields.io/badge/version-2.4.1-blue)]()
[![Stars](https://img.shields.io/badge/stars-4.8k-yellow)]()
[![Uptime](https://img.shields.io/badge/uptime-99.95%25-green)]()

## The Problem
Modern agent frameworks introduce heavyweight abstractions, high memory footprints, and opaque execution loops that make debugging streaming multi-agent systems frustrating.

## The Solution
AgenticFlow provides a typed, event-driven state machine with sub-millisecond dispatch, distributed checkpointing, and plug-and-play tools.

## Key Capabilities
- **Streaming Dispatcher**: Real-time token streaming with parallel subagent fork-join.
- **Vector Memory Store**: In-memory HNSW index with zero external dependencies.
- **Zero-Copy Serialization**: Binary protocol cutting inter-process serialization overhead by 70%.
- **Deterministic Replay**: Record and reproduce agent reasoning trajectories for regression testing.
- **Self-Healing Retries**: Exponential backoff with rate-limit circuit breakers.
- **Pluggable Providers**: First-class support for Gemini, Claude, and local models.

## Metrics
- 99.95% availability under high concurrency
- 12ms latency p95 dispatcher response time
- 150k+ requests processed per second
- 65% reduction in token consumption with context pruning

## Tech Stack
- Python
- Rust
- FastAPI
- Redis
- WebAssembly
- Docker
- PyTorch

## Getting Started
1. Install package: \`pip install agentic-flow\`
2. Configure environment credentials: \`export AI_API_KEY=xxx\`
3. Launch cluster worker: \`agentic-flow start --workers=4\`
4. Connect client and stream agent events!
`
  },
  {
    id: 'turbocache',
    name: 'TurboCache - In-Memory KV Store',
    repo: 'turbodata/turbocache',
    description: 'High-throughput, persistent in-memory cache with Raft replication.',
    markdown: `# TurboCache
Lightning-fast in-memory key-value database built for latency-critical microservices.

## Challenge
Traditional distributed caches suffer from tail latency spikes during garbage collection pauses and failover election windows.

## Solution
TurboCache uses lock-free ring buffers, memory-mapped append logs, and lightweight Raft consensus to guarantee single-digit microsecond reads.

## Highlights
- **Sub-Microsecond Reads**: Direct memory mapping with zero syscall overhead on hot keys.
- **Active-Active Raft Replication**: Automatic leader election and failover in < 250ms.
- **Snapshot Persistence**: Asynchronous background copy-on-write disk snapshots.
- **Adaptive TTL Eviction**: Probabilistic early expiration preventing thundering herds.

## Performance
- 4.2M requests per second per node
- 450 microseconds p99 write latency
- 99.99% reliability across multi-zone deployments
- 50% memory footprint savings with compressed arenas

## Technology
- Go
- C++
- WebSockets
- gRPC
- Linux epoll
- Prometheus
`
  }
];
