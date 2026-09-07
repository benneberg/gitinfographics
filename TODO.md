# GitInfoGraphics — TODO

> Deterministic rule-based engine for generating Scandinavian minimalist SVG infographics

* * *

## 🚀 MIGRATION FROM INFOGRAPHIC STUDIO

Permalink:  MIGRATION FROM INFOGRAPHIC STUDIO

### Phase 1: Core Extraction (Week 1)

Permalink: Phase 1: Core Extraction (Week 1)

- [ ] **Extract Canvas Export System**
  - [ ] Copy `src/canvas/` from Infographic Studio
  - [ ] Remove AI/LLM dependencies from export logic
  - [ ] Integrate PNG export (via canvas rendering)
  - [ ] Add SVG scaling algorithms for different viewports
  - [ ] **Target location:** `src/export/`
  
- [ ] **Migrate Theme Engine**
  - [ ] Extract theme definitions (midnight, daylight, ember, forest)
  - [ ] Convert to declarative JSON/YAML config format
  - [ ] Add theme validation schema
  - [ ] Port color palette system
  - [ ] **Target location:** `src/renderer/themes/`
  
- [ ] **Port Storage Layer**
  - [ ] Copy localStorage CRUD operations
  - [ ] Adapt data model for GitInfoGraphics (remove AI-specific fields)
  - [ ] Implement project serialization/deserialization
  - [ ] Add history tracking (last 20 generations per repo)
  - [ ] **Target location:** `src/storage/`

**Success Criteria:** Can export infographics in multiple formats with theme switching

* * *

### Phase 2: Integration (Week 2)

Permalink: Phase 2: Integration (Week 2)

- [ ] **Multi-Format Canvas Support**
  - [ ] Add canvas preset system:
    - GitHub README Desktop (880px)
    - GitHub README Mobile (400px)
    - Twitter/X Post (1200x675)
    - LinkedIn Post (1080x1080)
    - Instagram Story (1080x1920)
    - GitHub Social Preview (1280x640)
    - Custom dimensions (user input)
  - [ ] Implement auto-scaling logic for each format
  - [ ] Add format preview toggle in UI
  
- [ ] **Theme Switching System**
  - [ ] Integrate theme engine with SVG renderer
  - [ ] Add theme picker UI component
  - [ ] Implement instant theme switching (no re-generation)
  - [ ] Add theme preview in real-time
  - [ ] Persist user's theme preference
  
- [ ] **Project Management**
  - [ ] Add project creation/editing UI
  - [ ] Implement duplicate project functionality
  - [ ] Add project deletion with confirmation
  - [ ] Show generation history per project
  - [ ] Add project search/filter

**Success Criteria:** Full project lifecycle management with multi-format/themed exports

* * *

### Phase 3: Enhancement (Week 3-4)

Permalink: Phase 3: Enhancement (Week 3-4)

- [ ] **Keyboard Shortcuts System**
  - [ ] Implement global shortcut handler
  - [ ] Add shortcuts:
    - `Ctrl/Cmd + Enter` — Generate infographic
    - `Ctrl/Cmd + S` — Export as SVG
    - `Ctrl/Cmd + Shift + P` — Export as PNG
    - `Ctrl/Cmd + M` — Toggle mobile/desktop preview
    - `Ctrl/Cmd + T` — Switch theme
    - `Ctrl/Cmd + D` — Duplicate project
    - `Ctrl/Cmd + Shift + ?` — Show shortcuts modal
  - [ ] Add help modal displaying all shortcuts
  - [ ] Make shortcuts configurable
  
- [ ] **Source Fetching Utilities**
  - [ ] Port URL fetching with CORS fallback
  - [ ] Enhance GitHub API integration:
    - Repo metadata (stars, forks, language)
    - README fetching (auto-detect branch)
    - File tree extraction
    - package.json parsing
  - [ ] Add source validation & error handling
  - [ ] Implement source caching (reduce API calls)
  
- [ ] **Export & Import System**
  - [ ] Export project as JSON (sources + config + generations)
  - [ ] Import project from JSON file
  - [ ] Add drag-and-drop import support
  - [ ] Generate shareable links (base64-encoded spec in URL hash)
  - [ ] Export as HTML (for Notion/Confluence)

**Success Criteria:** Power user workflow with keyboard efficiency and data portability

* * *

## 🎨 NEW FEATURES (Deterministic)

Permalink:  NEW FEATURES (Deterministic)

### Section Control & Customization

Permalink: Section Control & Customization

- [ ] **Section-Level Controls** (NO AI)
  - [ ] Add section toggle (enable/disable sections)
  - [ ] Implement drag-and-drop section reordering
  - [ ] Add manual content override per section
  - [ ] Section layout variants:
    - Default (standard spacing)
    - Compact (reduced padding)
    - Detailed (expanded with more info)
  - [ ] Save section preferences per project
  
- [ ] **Advanced Layout Options**
  - [ ] Timeline layout for changelogs/roadmaps
  - [ ] Comparison table renderer (side-by-side features)
  - [ ] Callout/highlight card for blockquotes
  - [ ] Grid layout for feature lists
  - [ ] Auto-detect best layout based on content type

* * *

### Visual Enhancements

Permalink: Visual Enhancements

- [ ] **QR Code Generation**
  - [ ] Auto-generate QR code linking to repo URL
  - [ ] Position QR code in footer or sidebar
  - [ ] Make QR code optional (toggle in settings)
  - [ ] Customize QR code size and style
  
- [ ] **Logo & Image Support**
  - [ ] Allow logo upload (PNG/SVG)
  - [ ] Embed as base64 in SVG output
  - [ ] Auto-detect logo from repo (if exists)
  - [ ] Position controls (top-left, top-right, center)
  - [ ] Size adjustment slider
  
- [ ] **Animation & Interactivity**
  - [ ] Add subtle entrance animations (CSS-based)
    - Staggered fade-in for sections
    - Slide-in for metric cards
    - Scale-in for badges
  - [ ] Implement hover states for interactive elements
  - [ ] Add "compact mode" toggle (reduced spacing for print)

* * *

## 🔧 ACCESSIBILITY (A11y)

Permalink: 🔧 ACCESSIBILITY (A11y)

### SVG Accessibility

Permalink: SVG Accessibility

- [ ] **ARIA Labels & Roles**
  - [ ] Add `role="img"` to root SVG
  - [ ] Add `aria-labelledby` pointing to title element
  - [ ] Add `aria-describedby` for detailed description
  - [ ] Mark decorative elements with `aria-hidden="true"`
  - [ ] Add `role="heading"` with proper `aria-level` to section titles
  
- [ ] **Semantic Structure**
  - [ ] Wrap sections in `<g role="list">` containers
  - [ ] Mark list items with `role="listitem"`
  - [ ] Add `role="list"` to tech stack badges
  - [ ] Implement proper heading hierarchy (h1-h6)
  
- [ ] **Text Alternatives**
  - [ ] Generate hidden text-only summary (`<desc>` element)
  - [ ] Create parallel HTML fallback (visually hidden, screen-reader accessible)
  - [ ] Add "text-only view" toggle in UI
  - [ ] Ensure all icons have `aria-label` or `aria-hidden`

### Color & Contrast

Permalink: Color & Contrast

- [ ] **WCAG AA Compliance**
  - [ ] Audit all four themes for color contrast
  - [ ] Ensure minimum 4.5:1 ratio for normal text
  - [ ] Ensure minimum 3:1 ratio for large text
  - [ ] Add contrast checker tool in theme editor
  - [ ] Auto-warn if custom theme fails contrast checks
  
- [ ] **Color Blindness Support**
  - [ ] Test themes with color blindness simulators
  - [ ] Add patterns/textures as secondary visual cues
  - [ ] Ensure info isn't conveyed by color alone

### Keyboard Navigation

Permalink: Keyboard Navigation

- [ ] **SVG Keyboard Access**
  - [ ] Make infographic sections focusable (`tabindex="0"`)
  - [ ] Implement arrow key navigation between sections
  - [ ] Add `Enter` key to expand/collapse sections
  - [ ] Show visible focus indicators
  - [ ] Test with VoiceOver, NVDA, JAWS

* * *

## 📦 DISTRIBUTION & DEPLOYMENT

Permalink: 📦 DISTRIBUTION & DEPLOYMENT

### PWA Support

Permalink: PWA Support

- [ ] **Progressive Web App**
  - [ ] Create `manifest.json` with app metadata
  - [ ] Generate app icons (192x192, 512x512, maskable)
  - [ ] Register Service Worker for offline support
    - Cache app shell (HTML, CSS, JS)
    - Cache generated infographics in IndexedDB
    - Implement cache-first strategy for static assets
  - [ ] Add offline indicator in UI
  - [ ] Test installation on Chrome, Safari, Firefox
  - [ ] Ensure standalone display mode works

### One-Click Deploy

Permalink: One-Click Deploy

- [ ] **GitHub Pages**
  - [ ] Add GitHub Action workflow for auto-deploy
  - [ ] Configure custom domain support
  - [ ] Add deployment badge to README
  
- [ ] **Vercel / Netlify**
  - [ ] Add `vercel.json` for SPA routing
  - [ ] Add `netlify.toml` configuration
  - [ ] Create "Deploy to Vercel" button
  - [ ] Create "Deploy to Netlify" button
  
- [ ] **Docker**
  - [ ] Create minimal nginx Dockerfile
  - [ ] Add docker-compose.yml for local dev
  - [ ] Publish to Docker Hub
  - [ ] Document self-hosting instructions

### CLI Enhancements

Permalink: CLI Enhancements

- [ ] **Command-Line Interface**
  - [ ] Add `gitinfographics init` for project setup
  - [ ] Add `gitinfographics generate --repo=<url>` command
  - [ ] Add `gitinfographics export --format=png|svg|pdf`
  - [ ] Add `gitinfographics watch` for auto-regeneration
  - [ ] Add configuration file support (`.gitinfographicsrc`)
  - [ ] Support batch processing (multiple repos)

* * *

## 🏗️ ARCHITECTURE IMPROVEMENTS

Permalink: 🏗️ ARCHITECTURE IMPROVEMENTS

### Code Quality

Permalink: Code Quality

- [ ] **TypeScript Migration**
  - [ ] Add TypeScript configuration
  - [ ] Create types for infographic spec JSON schema
  - [ ] Type all engine functions
  - [ ] Add strict mode compiler options
  - [ ] Generate type definitions for public API
  
- [ ] **Testing Infrastructure**
  - [ ] Set up Jest/Vitest for unit tests
  - [ ] Add parser tests (various Markdown formats)
  - [ ] Add classifier tests (section detection)
  - [ ] Add renderer tests (SVG output validation)
  - [ ] Add visual regression tests (pixel-diff snapshots)
  - [ ] Set up CI/CD pipeline (GitHub Actions)
  
- [ ] **Documentation**
  - [ ] Add JSDoc comments to all public functions
  - [ ] Generate API documentation (TypeDoc)
  - [ ] Create architecture diagram
  - [ ] Write contributing guide
  - [ ] Add code examples for each feature

### Performance Optimization

Permalink: Performance Optimization

- [ ] **Rendering Performance**
  - [ ] Implement virtual scrolling for long infographics
  - [ ] Add memoization for expensive calculations
  - [ ] Optimize SVG path generation
  - [ ] Lazy-load sections on demand
  - [ ] Profile and optimize bundle size
  
- [ ] **Build System**
  - [ ] Migrate to Vite for faster dev server
  - [ ] Add code splitting for large modules
  - [ ] Implement tree-shaking for unused code
  - [ ] Add bundle analyzer
  - [ ] Set up production build optimizations

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

- [ ] **Graceful Degradation**
  - [ ] Handle missing README gracefully
  - [ ] Fallback for unsupported Markdown features
  - [ ] Network error recovery (retry logic)
  - [ ] Add error boundary in UI
  - [ ] Provide helpful error messages with solutions
  
- [ ] **Logging & Debugging**
  - [ ] Add debug mode with verbose logging
  - [ ] Export diagnostic report (for bug reports)
  - [ ] Add performance timing markers
  - [ ] Track generation success/failure rates

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
- [ ] Copy `src/canvas/` → `src/export/`
- [ ] Copy `src/themes/` → `src/renderer/themes/`
- [ ] Copy `src/storage/` → `src/storage/`
- [ ] Copy `src/sources/` → `src/engine/sources/`
- [ ] Copy `src/components/` → `src/ui/components/`
- [ ] Copy `src/a11y/` → `src/renderer/a11y/`
- [ ] Remove all AI/LLM dependencies
- [ ] Update imports and paths
- [ ] Run tests to verify migration
- [ ] Update documentation

### Repository Cleanup
- [ ] Archive Infographic Studio repo (or mark as deprecated)
- [ ] Update GitInfoGraphics README with new features
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
