# GitInfoGraphics — TODO

> Deterministic rule-based engine for generating Scandinavian minimalist SVG infographics

* * *


  
- [ ] **Advanced Layout Options**
  - [ ] Timeline layout for changelogs/roadmaps
  - [ ] Comparison table renderer (side-by-side features)
  - [ ] Callout/highlight card for blockquotes
  - [ ] Grid layout for feature lists
  - [ ] Auto-detect best layout based on content type

* * *

### Visual Enhancements

Permalink: Visual Enhancements

- [x] **QR Code Generation**
  - [x] Auto-generate QR code linking to repo URL
  - [x] Position QR code in footer or sidebar
  - [x] Make QR code optional (toggle in settings)
  - [x] Customize QR code size and style
  
- [x] **Logo & Image Support**
  - [x] Allow logo upload (PNG/SVG)
  - [x] Embed as base64 in SVG output
  - [x] Auto-detect logo from repo (if exists)
  - [x] Position controls (top-left, top-right, center)
  - [x] Size adjustment slider
  
- [x] **Animation & Interactivity**
  - [x] Add subtle entrance animations (CSS-based)
    - Staggered fade-in for sections
    - Slide-in for metric cards
    - Scale-in for badges
  - [x] Implement hover states for interactive elements
  - [x] Add "compact mode" toggle (reduced spacing for print)

* * *

## 🔧 ACCESSIBILITY (A11y)

Permalink: 🔧 ACCESSIBILITY (A11y)

### SVG Accessibility

Permalink: SVG Accessibility

- [x] **ARIA Labels & Roles**
  - [x] Add `role="img"` to root SVG
  - [x] Add `aria-labelledby` pointing to title element
  - [x] Add `aria-describedby` for detailed description
  - [x] Mark decorative elements with `aria-hidden="true"`
  - [x] Add `role="heading"` with proper `aria-level` to section titles
  
- [x] **Semantic Structure**
  - [x] Wrap sections in `<g role="list">` / `<g role="region">` containers
  - [x] Mark list items with `role="listitem"`
  - [x] Add `role="list"` to tech stack badges
  - [x] Implement proper heading hierarchy (h1-h6)
  
- [x] **Text Alternatives**
  - [x] Generate hidden text-only summary (`<desc>` element)
  - [x] Create parallel HTML fallback (visually hidden, screen-reader accessible)
  - [x] Add "text-only view" toggle in UI
  - [x] Ensure all icons have `aria-label` or `aria-hidden`

### Color & Contrast

Permalink: Color & Contrast

- [x] **WCAG AA Compliance**
  - [x] Audit all four themes for color contrast
  - [x] Ensure minimum 4.5:1 ratio for normal text
  - [x] Ensure minimum 3:1 ratio for large text
  - [x] Add contrast checker tool in theme editor
  - [x] Auto-warn if custom theme fails contrast checks
  
- [x] **Color Blindness Support**
  - [x] Test themes with color blindness simulators
  - [x] Add patterns/textures as secondary visual cues
  - [x] Ensure info isn't conveyed by color alone

### Keyboard Navigation

Permalink: Keyboard Navigation

- [x] **SVG Keyboard Access**
  - [x] Make infographic sections focusable (`tabindex="0"`)
  - [x] Implement arrow key navigation between sections
  - [x] Add `Enter` key to expand/collapse sections
  - [x] Show visible focus indicators
  - [x] Test with VoiceOver, NVDA, JAWS

* * *

## 📦 DISTRIBUTION & DEPLOYMENT

Permalink: 📦 DISTRIBUTION & DEPLOYMENT

### PWA Support

Permalink: PWA Support

- [x] **Progressive Web App**
  - [x] Create `manifest.json` with app metadata
  - [x] Generate app icons (192x192, 512x512, maskable)
  - [x] Register Service Worker for offline support
    - [x] Cache app shell (HTML, CSS, JS)
    - [x] Cache generated infographics in IndexedDB
    - [x] Implement cache-first strategy for static assets
  - [x] Add offline indicator in UI
  - [x] Test installation on Chrome, Safari, Firefox
  - [x] Ensure standalone display mode works

### One-Click Deploy

Permalink: One-Click Deploy

- [x] **GitHub Pages**
  - [x] Add GitHub Action workflow for auto-deploy
  - [x] Configure custom domain support
  - [x] Add deployment badge to README
  
- [x] **Vercel / Netlify**
  - [x] Add `vercel.json` for SPA routing
  - [x] Add `netlify.toml` configuration
  - [x] Create "Deploy to Vercel" button
  - [x] Create "Deploy to Netlify" button
  
- [x] **Docker**
  - [x] Create minimal nginx Dockerfile
  - [x] Add docker-compose.yml for local dev
  - [x] Publish to Docker Hub
  - [x] Document self-hosting instructions

### CLI Enhancements

Permalink: CLI Enhancements

- [x] **Command-Line Interface**
  - [x] Add `gitinfographics init` for project setup
  - [x] Add `gitinfographics generate --repo=<url>` command
  - [x] Add `gitinfographics export --format=png|svg|pdf`
  - [x] Add `gitinfographics watch` for auto-regeneration
  - [x] Add configuration file support (`.gitinfographicsrc`)
  - [x] Support batch processing (multiple repos)

* * *

## 🏗️ ARCHITECTURE IMPROVEMENTS

Permalink: 🏗️ ARCHITECTURE IMPROVEMENTS

### Code Quality

Permalink: Code Quality

- [x] **TypeScript Migration**
  - [x] Add TypeScript configuration
  - [x] Create types for infographic spec JSON schema
  - [x] Type all engine functions
  - [x] Add strict mode compiler options
  - [x] Generate type definitions for public API
  
- [x] **Testing Infrastructure**
  - [x] Set up Jest/Vitest for unit tests
  - [x] Add parser tests (various Markdown formats)
  - [x] Add classifier tests (section detection)
  - [x] Add renderer tests (SVG output validation)
  - [ ] Add visual regression tests (pixel-diff snapshots)
  - [x] Set up CI/CD pipeline (GitHub Actions)
  
- [x] **Documentation**
  - [x] Add JSDoc comments to all public functions
  - [ ] Generate API documentation (TypeDoc)
  - [x] Create architecture diagram
  - [x] Write contributing guide
  - [x] Add code examples for each feature

### Performance Optimization

Permalink: Performance Optimization

- [ ] **Rendering Performance**
  - [ ] Implement virtual scrolling for long infographics
  - [x] Add memoization for expensive calculations
  - [x] Optimize SVG path generation
  - [ ] Lazy-load sections on demand
  - [x] Profile and optimize bundle size
  
- [x] **Build System**
  - [x] Migrate to Vite for faster dev server
  - [x] Add code splitting for large modules
  - [x] Implement tree-shaking for unused code
  - [ ] Add bundle analyzer
  - [x] Set up production build optimizations

### Module Extraction

Permalink: Module Extraction

- [ ] **Decouple Core Engine**
  - [ ] Extract parser to standalone module (`@gitinfographics/parser`)
  - [ ] Extract analyzer to standalone module (`@gitinfographics/analyzer`)
  - [ ] Extract renderer to standalone module (`@gitinfographics/renderer`)
  - [ ] Publish modules to npm
  - [ ] Create monorepo structure (pnpm workspaces)

* * *

## 🧪 QUALITY & RELIABILITY

Permalink: 🧪 QUALITY & RELIABILITY

### Content Grounding

Permalink: Content Grounding

- [ ] **Source Traceability**
  - [ ] Track which source text contributed to each section
  - [ ] Add "source density" indicator (how much material used)
  - [ ] Show which sections were truncated/summarized
  - [ ] Generate citation footnotes (optional mode)
  - [ ] Highlight direct quotes vs. paraphrased content
  
- [ ] **Validation & Warnings**
  - [ ] Warn if section has insufficient source material
  - [ ] Detect potential hallucinations (content not in source)
  - [ ] Validate extracted metrics against source
  - [ ] Add confidence score per section

### Error Handling

Permalink: Error Handling

- [x] **Graceful Degradation**
  - [x] Handle missing README gracefully
  - [x] Fallback for unsupported Markdown features
  - [x] Network error recovery (retry logic)
  - [x] Add error boundary in UI
  - [x] Provide helpful error messages with solutions
  
- [x] **Logging & Debugging**
  - [x] Add debug mode with verbose logging
  - [x] Export diagnostic report (for bug reports)
  - [x] Add performance timing markers
  - [x] Track generation success/failure rates

* * *

## 🎯 ADVANCED FEATURES (Future)

Permalink: 🎯 ADVANCED FEATURES (Future)

### Template System

Permalink: Template System

- [ ] **Custom Layout Templates**
  - [ ] Allow users to save custom layouts as JSON
  - [ ] Create template gallery (community contributions)
  - [ ] Add template editor (visual drag-and-drop)
  - [ ] Support template variables (dynamic content)
  - [ ] Import/export templates

### Collaboration

Permalink: Collaboration

- [ ] **Multi-User Editing**
  - [ ] Implement CRDT sync (Yjs library)
  - [ ] Add real-time cursors and selections
  - [ ] Show user presence indicators
  - [ ] Add comment/annotation system
  - [ ] Version history with diffs

### Plugin System

Permalink: Plugin System

- [ ] **Extensibility**
  - [ ] Define plugin API interface
  - [ ] Allow custom section renderers
  - [ ] Support custom metric extractors
  - [ ] Add theme plugin support
  - [ ] Create plugin marketplace

### Local AI (Optional)

Permalink: Local AI (Optional)

- [ ] **Client-Side Summarization** (Optional Feature)
  - [ ] Integrate WebLLM for browser-based models
  - [ ] Support ONNX Runtime for small models
  - [ ] Add model download/management
  - [ ] Use AI only for summarization (not generation)
  - [ ] Keep deterministic core as default

* * *

## 📊 METRICS & ANALYTICS

Permalink: 📊 METRICS & ANALYTICS

- [ ] **Usage Analytics** (Opt-in)
  - [ ] Track generation success rate
  - [ ] Measure average generation time
  - [ ] Count most-used formats/themes
  - [ ] Identify common error patterns
  - [ ] Respect privacy (no personal data)
  
- [ ] **Performance Metrics**
  - [ ] Add Lighthouse CI integration
  - [ ] Track Core Web Vitals
  - [ ] Monitor bundle size over time
  - [ ] Set performance budgets

* * *

## 🏷️ SUGGESTED LABELS

Permalink: 🏷️ SUGGESTED LABELS

| Label | Purpose | Example Tasks |
| --- | --- | --- |
| `migration` | Tasks from Infographic Studio | Canvas export, Theme engine, Storage |
| `good-first-issue` | Beginner-friendly tasks | Keyboard shortcuts, Canvas presets |
| `a11y` | Accessibility improvements | ARIA labels, Contrast checks |
| `performance` | Speed & optimization | Bundle size, Rendering speed |
| `ux` | User experience | Section controls, Theme picker |
| `distribution` | Deployment & packaging | PWA, Docker, GitHub Pages |
| `architecture` | Code structure | TypeScript, Testing, Modules |
| `feature` | New capabilities | QR codes, Timeline layout |

* * *

## 📝 MIGRATION CHECKLIST

Permalink:  MIGRATION CHECKLIST

### From Infographic Studio
- [x] Copy `src/canvas/` → `src/export/`
- [x] Copy `src/themes/` → `src/renderer/themes/`
- [x] Copy `src/storage/` → `src/storage/`
- [x] Copy `src/sources/` → `src/engine/sources/`
- [x] Copy `src/components/` → `src/ui/components/`
- [x] Copy `src/a11y/` → `src/renderer/a11y/`
- [x] Remove all AI/LLM dependencies
- [x] Update imports and paths
- [x] Run tests to verify migration
- [x] Update documentation

### Repository Cleanup
- [ ] Archive Infographic Studio repo (or mark as deprecated)
- [x] Update GitInfoGraphics README with new features
- [ ] Add migration guide for users
- [ ] Create changelog entry
- [ ] Tag new version (v2.0.0)

* * *

## 🎯 SUCCESS METRICS

Permalink: 🎯 SUCCESS METRICS

**After Migration (4 weeks):**
- ✅ Multi-format export working (6+ presets)
- ✅ Theme switching functional (4+ themes)
- ✅ Project persistence implemented
- ✅ Keyboard shortcuts active
- ✅ Accessibility audit passed (WCAG AA)

**After Enhancement (8 weeks):**
- ✅ Section controls implemented
- ✅ PWA installable
- ✅ CLI fully functional
- ✅ Tests coverage >80%
- ✅ TypeScript migration complete

**Long-term (3 months):**
- ✅ Plugin system operational
- ✅ Template gallery launched
- ✅ Community contributions enabled
- ✅ Performance benchmarks met

* * *

Last updated: 2026-09-07  
Priority: Migration tasks first, then new features  
Estimated timeline: 8-12 weeks for full implementation
