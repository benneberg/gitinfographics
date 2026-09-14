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



---

### ** A 4-Step Action Plan**
1. **Fix Parser Bugs**: Prevent duplicate section headers and fix mid-word text truncation (use word-boundary wrapping).
2. **Add Visual Density Selector**: Let users choose their preferred level of visual enrichment.
3. **Implement Semantic Icons**: Map section types to meaningful Lucide icons.
4. **Add Layout Variety**: Use different card styles (e.g., timeline for steps, pills for tech stack) instead of uniform boxes.

---

### **✨ The "Visual Density" Feature**

Add a state and configuration object to control how much visual flair is applied.

```typescript
// types.ts
export type VisualDensity = 'minimal' | 'medium' | 'dense';

export const DENSITY_CONFIG = {
  minimal: {
    showIcons: false,
    showBackgrounds: false,
    showDataViz: false,
    accentColor: '#059669', // Single consistent accent
    description: 'Clean, text-focused, maximum readability.'
  },
  medium: {
    showIcons: true,
    showBackgrounds: false,
    showDataViz: false,
    accentColor: 'dynamic', // Smart color matching per section
    description: 'Balanced. Adds semantic icons and color-coded sections.'
  },
  dense: {
    showIcons: true,
    showBackgrounds: true, // Gradient blobs, subtle patterns
    showDataViz: true,     // Circular progress rings, mini charts
    accentColor: 'dynamic',
    description: 'Rich. Includes micro-illustrations and data visualization.'
  }
} as const;
```

---

### **⚙️ Implementation Code**

#### **1. Add Density State to App.tsx**
```tsx
import { useState } from 'react';
import { VisualDensity, DENSITY_CONFIG } from './types';

export default function App() {
  // ... existing state
  const [density, setDensity] = useState<VisualDensity>('medium');

  // Pass density down to your renderer
  const svgString = useMemo(() => {
    return renderSVG(finalSpec, theme, { 
      layout: 'mobile',
      density: density // <-- Pass it here
    });
  }, [finalSpec, theme, density]);
  
  // ... rest of component
}
```

#### **2. Semantic Icon Mapper**
Map the existing section IDs to Lucide icons. *(Note: In the SVG renderer, we'll convert these to SVG paths).*

```typescript
// engine/icons.ts
export const SECTION_ICONS = {
  'problem': 'alert-circle',
  'solution': 'sparkles',
  'metrics': 'bar-chart-3',
  'features': 'zap',
  'tech-stack': 'code-2',
  'quick-start': 'play',
  'architecture': 'git-branch',
  'security': 'shield',
} as const;

// Helper to get icon SVG path (simplified example)
export const getIconPath = (iconName: string) => {
  const paths: Record<string, string> = {
    'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    'code-2': 'M18 16l4-4-4-4 M6 8l-4 4 4 4 M14.5 4l-5 16',
    // ... add paths for other Lucide icons
  };
  return paths[iconName] || paths['sparkles'];
};
```

#### **3. Conditional Rendering in the SVG Generator**
Update the `renderSVG` (or section renderer) to conditionally add elements based on the `density` config.

```typescript
// engine/renderer.ts
export function renderSection(section: Section, densityConfig: typeof DENSITY_CONFIG['medium']) {
  let svgContent = '';

  // 1. BACKGROUND ELEMENTS (Dense only)
  if (densityConfig.showBackgrounds) {
    svgContent += `
      <defs>
        <radialGradient id="blob-${section.id}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${section.accentColor}" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="${section.accentColor}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="50" r="120" fill="url(#blob-${section.id})" />
    `;
  }

  // 2. HEADER WITH ICON (Medium & Dense)
  const iconKey = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS];
  const iconSvg = densityConfig.showIcons && iconKey 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="${getIconPath(iconKey)}" />
       </svg>`
    : '';

  svgContent += `
    <g class="section-header">
      ${iconSvg}
      <text x="30" y="15" font-weight="bold" font-size="14">${section.title}</text>
    </g>
  `;

  // 3. DATA VISUALIZATION (Dense only)
  if (densityConfig.showDataViz && section.type === 'metrics') {
    svgContent += renderCircularProgress(section.value); // Your custom chart function
  } else {
    // Fallback to standard text wrapping (fixes the mid-word truncation bug)
    svgContent += renderWrappedText(section.content, { maxWidth: 360, wrapWords: true });
  }

  return svgContent;
}
```

#### **4. UI Selector for the User**
Add this to the mobile settings/bottom sheet so users can toggle it.

```tsx
// components/DensitySelector.tsx
import { DENSITY_CONFIG, VisualDensity } from '../types';

export function DensitySelector({ 
  value, 
  onChange 
}: { 
  value: VisualDensity; 
  onChange: (v: VisualDensity) => void 
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-stone-900">Visual Density</label>
      <div className="grid grid-cols-1 gap-2">
        {(Object.keys(DENSITY_CONFIG) as VisualDensity[]).map((level) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              value === level 
                ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              value === level ? 'border-emerald-500' : 'border-stone-300'
            }`}>
              {value === level && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>
            <div>
              <div className="text-sm font-semibold capitalize text-stone-900">{level}</div>
              <div className="text-xs text-stone-500">{DENSITY_CONFIG[level].description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### **This Approach:**
1. **Solves the "One Size Fits All" Problem**: Power users who want clean, embeddable READMEs can choose **Minimal**. Marketers who want flashy social media posts can choose **Dense**.
2. **Performance Safe**: The `minimal` setting skips complex SVG calculations (blobs, charts), keeping render times lightning fast.
3. **Incremental Build**: You can build the `minimal` version perfectly first, then layer on `medium` (icons), and finally `dense` (charts/blobs) without breaking existing logic.

