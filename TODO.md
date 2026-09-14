# GitInfoGraphics — Active Development Roadmap (TODO)

> Deterministic rule-based engine for generating Scandinavian minimalist SVG infographics

---

## 🎯 Active Backlog & Future Capabilities

### 1. Advanced Layout Options
- [ ] **Timeline Layout**: Specialized visual timeline renderer for changelogs, release histories, and roadmaps.
- [ ] **Comparison Table**: Side-by-side comparative feature matrix.
- [ ] **Callout & Highlight Cards**: Stylized blockquote cards for testimonials, quotes, or key takeaways.
- [ ] **Grid Matrix Layout**: Expandable grid layout for dense feature lists.
- [ ] **Smart Layout Auto-Detection**: Heuristic detector choosing the ideal visual layout based on repository characteristics.

### 2. Module Decoupling & Ecosystem
- [ ] **Standalone Engine Modules**:
  - [ ] `@gitinfographics/parser`
  - [ ] `@gitinfographics/analyzer`
  - [ ] `@gitinfographics/renderer`
- [ ] **NPM Publishing**: Publish standalone zero-DOM core packages to npm registry.
- [ ] **Monorepo Setup**: Transition to pnpm workspace architecture.

### 3. Content Grounding & Verification
- [ ] **Source Traceability**: Highlight contributing markdown sections per visual card.
- [ ] **Source Density Indicator**: Visual meter showing markdown coverage.
- [ ] **Confidence Scoring**: Confidence metrics on extracted heuristics and statistics.

### 4. Collaboration & Custom Templates
- [ ] **Custom Template JSON Schema**: User-customizable and shareable layout templates.
- [ ] **Community Template Gallery**: Browse and load templates from the community.
- [ ] **Real-Time Sync**: Multi-user editing with CRDTs / Yjs.
- [ ] **Plugin System**: Extensible plugin interface for custom metric extractors.

### 5. Analytics & Monitoring (Opt-in)
- [ ] **Performance Benchmarking**: Automated Core Web Vitals and Lighthouse CI checks in GitHub Actions.
- [ ] **Bundle Size Budgeting**: Size-limit tracking across pull requests.

---

## 📜 Completed Milestones

All migrated and finalized features have been moved into [README.md](./README.md).
See Git commit history and documentation for implementation specifications:
- ✅ **Clean Slide-in View & Export Drawers**: Replaced cluttered footer with slide-out control drawers and instant actions.
- ✅ **Mobile-Native Inline Editor**: Same smooth inline tab UX as the Style tab, keeping bottom navigation visible and accessible.
- ✅ **Dynamic Viewport Height (`100dvh`) & Safe-Area Inset Support**: Safari/Android address bar and home indicator compatibility.
- ✅ **iOS Auto-Zoom Prevention**: Standardized `16px` base font size on all input fields and textareas.
- ✅ **Liquid Glass Styling**: Modal overlay depth with `backdrop-blur-md` and frosted glass card containers.
- ✅ **Dual-Viewport Vector Engine**: Reflowed desktop (880px) and mobile (400px) responsive SVG rendering.
- ✅ **Deterministic SVG QR Code Engine**: Zero-network vector QR code generation.
- ✅ **Logo Upload & Base64 Embedding**: Logo placement and sizing controls.
- ✅ **Accessibility (WCAG AA) & Contrast Simulator**: Full ARIA roles, contrast checker, and color vision deficiency simulation.
- ✅ **Global Keyboard Shortcuts**: Quick export, layout, and theme toggling.
- ✅ **Full PWA & Offline Support**: Service worker, manifest, and local IndexedDB state caching.
