# Infographic Studio — TODO

---

## 🚀 High Impact

### 1. Section-Level Regeneration
- [ ] **Add per-section "Regenerate" buttons** in the Result preview
- [ ] **Scope the LLM prompt** to only the selected section (headline, value prop, highlights, capabilities, how-it-works, tech stack, audience, CTA)
- [ ] **Preserve other sections** from the existing JSON spec during regeneration
- [ ] **Track token/cost savings** vs. full regeneration (nice-to-have UX touch)

**Rationale:** Power users often want to tweak one section without burning a full context window. This is the biggest UX gap in the current one-shot flow.

---

### 2. Offline Resilience (Service Worker)
- [ ] **Register a lightweight Service Worker** that caches the app shell (`index.html`, inline CSS/JS)
- [ ] **Cache previous generations** in IndexedDB so they survive browser restarts
- [ ] **Add an offline indicator** in the UI when the network is unavailable
- [ ] **Gracefully degrade** source fetching (disable URL fetch, keep pasted text & local projects working)

**Rationale:** Zero-dependency, client-side architecture is perfect for offline use. A SW would make this feel like a native app after first load.

---

## 🎨 UX & Polish

### 3. Accessibility (A11y) in SVG Output
- [ ] **Inject ARIA roles** (`role="img"`, `aria-label`, `aria-describedby`) into generated SVGs
- [ ] **Add semantic grouping** (`<g role="list">`, `<g role="listitem">`) for structured sections
- [ ] **Generate an HTML fallback** (hidden `<div>` with plain text) alongside each SVG for screen readers
- [ ] **Ensure color contrast ratios** meet WCAG AA across all four themes (midnight, daylight, ember, forest)

**Rationale:** Deterministic SVG rendering gives you full control over markup. A11y is often an afterthought in infographic tools — getting it right early is a differentiator.

---

### 4. Keyboard Shortcuts
- [ ] `Ctrl/Cmd + Enter` — Trigger generation
- [ ] `Ctrl/Cmd + Shift + S` — Export as PNG
- [ ] `Ctrl/Cmd + Shift + E` — Export as SVG
- [ ] `Ctrl/Cmd + D` — Duplicate current project
- [ ] `Escape` — Close modals / cancel generation
- [ ] Show shortcuts in a `?` help modal

---

## 🔧 Architecture & Performance

### 5. Smarter Source Chunking (for >38k char inputs)
- [ ] **Detect oversized sources** before truncation
- [ ] **Implement tiered summarization:**
  - Tier 1: Truncate README/docs to ~20k chars
  - Tier 2: Summarize truncated remainder with a cheap model call (e.g., `llama-3.3-70b` on Groq)
  - Tier 3: Feed condensed summary + full Tier 1 text to the main infographic generator
- [ ] **Expose a "Source density" indicator** so users know how much material was used

**Rationale:** 38k chars is generous, but dense documentation or large monorepos will hit it. Smart chunking extends reach without breaking the one-shot UX.

---

### 6. Project Import / Export
- [ ] **Export full project** as a `.json` file (sources + style + all 20 generations)
- [ ] **Import project** from `.json` file (restore state exactly)
- [ ] **Drag-and-drop import** support
- [ ] Consider a compressed/base64 "share link" format for portability

---

## 🎨 Design & Theming

### 7. Theme Extensibility
- [ ] **Extract theme definitions** into a declarative JSON/YAML config
- [ ] **Allow custom themes** via a "Custom" option in the theme picker
- [ ] **Live theme preview** while editing color values
- [ ] **Persist custom themes** in `localStorage`

---

### 8. Canvas Size Presets
- [ ] Add **LinkedIn carousel** (1080x1080, multi-slide hint)
- [ ] Add **Twitter/X header** (1500x500)
- [ ] Add **GitHub social preview** (1280x640)
- [ ] Add **Custom dimensions** input (width x height)

---

## 🧪 Quality & Trust

### 9. "Grounded" Verification UI
- [ ] **Highlight which source material** contributed to each generated section
- [ ] **Show confidence indicators** (e.g., "3 of 4 highlights directly sourced" vs "1 inferred")
- [ ] **Add a "Source check" mode** that renders the infographic with footnote-style citations

**Rationale:** You already forbid invented metrics in the prompt. Surfacing that grounding to the user builds even more trust.

---

### 10. Undo / Redo Stack
- [ ] **Global undo/redo** for project state changes (sources, style, generation)
- [ ] **Per-generation history** within a project (beyond the current "last 20 generations")
- [ ] **Keyboard shortcuts:** `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z`

---

## 📦 Distribution

### 11. PWA Packaging
- [ ] Add a `manifest.json` for installability
- [ ] Add app icons (at least 192x192 and 512x512)
- [ ] Ensure standalone display mode works correctly
- [ ] Test on mobile Safari and Chrome

---

### 12. One-Click Deploy Templates
- [ ] **GitHub Pages** — add a GitHub Action workflow
- [ ] **Vercel / Netlify** — add `vercel.json` / `netlify.toml` for SPA routing
- [ ] **Docker** — minimal nginx image for self-hosting

---

## 🏷️ Suggested Labels

| Label | Tasks |
|-------|-------|
| `good-first-issue` | #4 Keyboard Shortcuts, #8 Canvas Presets |
| `performance` | #5 Smarter Chunking, #2 Service Worker |
| `a11y` | #3 Accessibility |
| `ux` | #1 Section Regen, #10 Undo/Redo |
| `distribution` | #11 PWA, #12 Deploy Templates |




Infographic Studio — TODO

Priority: High

Section-Level Regeneration

 Implement per-section variant cycling with more distinct strategies (not just truncation length)
 Add "regenerate with different emphasis" — e.g., emphasize metrics vs. narrative vs. technical depth
 Allow manual editing of individual section source text before re-rendering
 Add undo/redo stack for regeneration history
 Show a diff or transition animation when a section changes
Offline Resilience via Service Worker

 Register a Service Worker that caches the app shell (HTML, CSS, JS, fonts)
 Implement cache-first strategy for static assets, network-first for dynamic content
 Cache previously generated infographics in IndexedDB for offline viewing
 Add an offline indicator in the header
 Store the current input text in IndexedDB so it survives browser restarts
Smarter Chunking for Large Inputs

 Replace flat 38k truncation with section-priority-aware truncation (partially done — improve)
 Implement two-pass analysis: first pass summarizes low-priority sections, second pass generates from summaries + full high-priority sections
 Add a "section priority" UI where users can drag-reorder which sections matter most
 Show a visual indicator of which sections were truncated and which were kept in full
 For monorepo READMEs, detect and handle nested README references
Priority: Medium

Accessibility (ARIA & Semantic Structure)

 Add role="heading" with proper aria-level to all SVG title elements
 Generate a hidden text-only summary as a <desc> element for screen readers
 Ensure all decorative SVG elements have aria-hidden="true"
 Add keyboard navigation between sections in the infographic (Tab/Arrow keys)
 Provide a "text-only view" toggle that shows the extracted structured data as accessible HTML
 Test with VoiceOver, NVDA, and JAWS
 Ensure color contrast meets WCAG AA in all four themes (especially Emerald and Crimson accent on dark)
Infographic Layout Improvements

 Add a "timeline" layout option for roadmap/changelog sections
 Add a "comparison table" renderer for sections with aligned bullet points
 Support > blockquote rendering as a callout/highlight card
 Add QR code generation linking to the original repo URL (if detected)
 Implement a "compact" mode that reduces spacing for print-friendly output
 Add optional logo/image insertion (paste or upload, embed as base64 in SVG)
Input Experience

 Add a real-time "section detection" sidebar that shows what the parser finds as you type
 Support paste-from-URL — fetch a raw GitHub README via the CORS proxy
 Add syntax highlighting for the Markdown input (use a lightweight highlighter like Prism)
 Support multiple documents — paste a README + an API spec, merge into one infographic
 Add word/reading time estimate alongside character count
Priority: Low

Export & Sharing

 Add PDF export (via SVG → Canvas → jsPDF)
 Generate a shareable URL by base64-encoding the spec (not the full text) in the hash
 Add "Copy as HTML" that converts the SVG to an inline SVG code block for pasting into Notion/Confluence
 Add print stylesheet that scales the infographic to fill a letter/A4 page
 Batch export — generate infographics for multiple READMEs in a monorepo
Visual Polish

 Add subtle entrance animations to SVG sections (staggered fade-in via CSS or SMIL)
 Implement a "dark mode / light mode" toggle for the app UI (separate from infographic theme)
 Add a mini-map / section navigator for long infographics
 Gradient text option for the hero title
 Custom accent color picker for infographic themes
Architecture & DX

 Migrate to a proper build system (Vite) for development ergonomics
 Extract the parser, analyzer, and renderer into separate ES modules
 Add unit tests for the parser (various Markdown formats) and classifier
 Add visual regression tests for SVG output (pixel-diff snapshots)
 Set up a simple Storybook or demo page showing all section types
 Add TypeScript types for the infographic spec JSON schema
Advanced Features

 Local LLM integration — use WebLLM or ONNX Runtime to run a small summarization model client-side for genuinely smarter analysis
 Template system — let users save/load custom layout templates as JSON
 Collaborative editing — use CRDTs (Yjs) for real-time multi-user input
 Plugin system — allow custom section renderers to be registered at runtime
