import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  parseMD,
  buildRuleSpec,
  renderSVG,
  smartTrunc,
  SAMPLE_READMES,
  SampleReadme,
  GitHubMeta,
  fetchGitHubRepo,
  VariantMap
} from './engine';
import { Header } from './components/Header';
import { MarkdownEditor } from './components/MarkdownEditor';
import { SectionControls } from './components/SectionControls';
import { InfographicCanvas } from './components/InfographicCanvas';
import { WorkflowModal } from './components/WorkflowModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { OnboardingModal } from './components/OnboardingModal';
import { InfoModal } from './components/InfoModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Code, Sliders, FileText, Eye, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // State - Default to Scandinavian Minimalist theme
  const [markdown, setMarkdown] = useState<string>(SAMPLE_READMES[0].markdown);
  const [theme, setTheme] = useState<string>('scandi-minimal');
  const [variants, setVariants] = useState<VariantMap>({
    'problem-solution': 0,
    features: 0,
    stats: 0
  });
  const [disabledSections, setDisabledSections] = useState<Record<string, boolean>>({});
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [ghMeta, setGhMeta] = useState<GitHubMeta | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'sections' | 'spec'>('editor');
  const [mobileActiveView, setMobileActiveView] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState<boolean>(false);
  const [archModalOpen, setArchModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [infoModalTab, setInfoModalTab] = useState<'overview' | 'manual' | 'faq'>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check onboarding completion on initial mount
  useEffect(() => {
    try {
      const completed = localStorage.getItem('gitinfographics_onboarding_completed');
      if (!completed) {
        setOnboardingOpen(true);
      }
    } catch {
      // In private browsing or sandboxed environments
    }
  }, []);

  // Toast Helper
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Parse document from raw markdown
  const parsedDoc = useMemo(() => {
    try {
      return parseMD(markdown);
    } catch {
      return { sections: [], badges: [] };
    }
  }, [markdown]);

  // 2. Build infographic specification
  const baseSpec = useMemo(() => {
    return buildRuleSpec(parsedDoc, variants, ghMeta);
  }, [parsedDoc, variants, ghMeta]);

  // 3. Apply user customizations & section toggles
  const finalSpec = useMemo(() => {
    const filteredSections = baseSpec.sections.filter((s) => !disabledSections[s.id]);
    return {
      ...baseSpec,
      title: customTitle.trim() || baseSpec.title,
      subtitle: customSubtitle.trim() || baseSpec.subtitle,
      sections: filteredSections
    };
  }, [baseSpec, disabledSections, customTitle, customSubtitle]);

  // 4. Render SVG deterministically (Both Desktop and Mobile responsive layouts)
  const desktopSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, { layout: 'desktop' });
    } catch (e) {
      console.error('Render desktop error:', e);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="300"><text x="50" y="100" fill="#1C1917" font-size="20">Render Error</text></svg>`;
    }
  }, [finalSpec, theme]);

  const mobileSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, { layout: 'mobile' });
    } catch (e) {
      console.error('Render mobile error:', e);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="30" y="80" fill="#1C1917" font-size="16">Render Error</text></svg>`;
    }
  }, [finalSpec, theme]);

  // Handlers
  const handleSelectSample = (sample: SampleReadme) => {
    setMarkdown(sample.markdown);
    setGhMeta(sample.mockMeta || null);
    setCustomTitle('');
    setCustomSubtitle('');
    setDisabledSections({});
    addToast(`Loaded preset "${sample.name}"`, 'info');
  };

  const handleFetchRepo = async (repoUrl: string) => {
    setIsFetching(true);
    try {
      const { markdown: md, meta } = await fetchGitHubRepo(repoUrl);
      setMarkdown(md);
      setGhMeta(meta);
      setCustomTitle('');
      setCustomSubtitle('');
      setDisabledSections({});
      addToast(`Fetched ${meta.owner}/${meta.repo} (${meta.stars.toLocaleString()} stars)`, 'success');
      // On mobile, auto-switch to preview so user sees the fetched result immediately
      setMobileActiveView('preview');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch repository';
      addToast(errorMsg, 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSmartTruncate = () => {
    const truncated = smartTrunc(markdown, 3000);
    setMarkdown(truncated);
    addToast('Optimized README sections for infographic generation', 'success');
  };

  const handleVariantChange = (secKey: string, val: number) => {
    setVariants((prev) => ({ ...prev, [secKey]: val }));
  };

  const handleToggleSection = (sectionId: string) => {
    setDisabledSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleCopySvg = (layout: 'desktop' | 'mobile' = 'desktop') => {
    const isMobile = layout === 'mobile';
    const targetSvg = isMobile ? mobileSvgString : desktopSvgString;
    navigator.clipboard.writeText(targetSvg);
    setCopied(true);
    addToast(`${isMobile ? 'Mobile (400px)' : 'Desktop (880px)'} SVG copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = (layout: 'desktop' | 'mobile' = 'desktop') => {
    const isMobile = layout === 'mobile';
    const targetSvg = isMobile ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = finalSpec.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'infographic';
    a.download = isMobile ? `${safeTitle}-mobile.svg` : `${safeTitle}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${isMobile ? `${safeTitle}-mobile.svg` : `${safeTitle}.svg`}`, 'success');
  };

  const handleDownloadPng = (layout: 'desktop' | 'mobile' = 'desktop') => {
    const isMobile = layout === 'mobile';
    const targetSvg = isMobile ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // 2x Retina resolution
      canvas.width = (img.naturalWidth || (isMobile ? 400 : 880)) * scale;
      canvas.height = (img.naturalHeight || 1000) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        const safeTitle = finalSpec.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'infographic';
        a.download = isMobile ? `${safeTitle}-mobile@2x.png` : `${safeTitle}@2x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast(`Exported ${isMobile ? 'Mobile' : 'Desktop'} Retina PNG (@2x)`, 'success');
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      addToast('Error rendering PNG from SVG', 'error');
    };

    img.src = url;
  };

  const openInfoModalWithTab = (tab: 'overview' | 'manual' | 'faq' = 'overview') => {
    setInfoModalTab(tab);
    setInfoModalOpen(true);
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem('gitinfographics_onboarding_completed');
    } catch {
      // Ignored
    }
    setOnboardingOpen(true);
    addToast('Onboarding guide reset', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-stone-900 selection:bg-stone-200 selection:text-stone-900 font-sans">
      {/* App Header */}
      <Header
        currentTheme={theme}
        onThemeChange={setTheme}
        onSelectSample={handleSelectSample}
        onFetchRepo={handleFetchRepo}
        isFetching={isFetching}
        onCopySvg={handleCopySvg}
        onDownloadSvg={handleDownloadSvg}
        onDownloadPng={handleDownloadPng}
        onOpenActionModal={() => setWorkflowModalOpen(true)}
        onOpenArchModal={() => setArchModalOpen(true)}
        onOpenInfoModal={openInfoModalWithTab}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Subtle Scandinavian Status Bar */}
      <div className="border-b border-stone-200/80 bg-stone-50/70 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-stone-700 text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            System Ready
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-500 text-[11px] hidden sm:inline">
            100% Client-side Deterministic SVG
          </span>
          <span className="text-stone-300 hidden md:inline">•</span>
          <span className="text-stone-500 text-[11px] hidden md:inline">
            Zero-dependency CI/CD Compatible
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-stone-500">
          <button
            onClick={() => openInfoModalWithTab('overview')}
            className="hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
            title="Open Documentation & Manual"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            <span>Manual & FAQ</span>
          </button>
          <span className="hidden sm:inline text-stone-400">
            {finalSpec.sections.length} Active Modules
          </span>
        </div>
      </div>

      {/* Mobile Navigation Toggle Bar (visible on viewports < lg) */}
      <div className="lg:hidden border-b border-stone-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1 w-full bg-stone-100 rounded-xl p-1 border border-stone-200/70">
          <button
            onClick={() => setMobileActiveView('editor')}
            className={`flex-1 min-h-[42px] flex items-center justify-center gap-2 text-xs font-semibold rounded-lg transition-all ${
              mobileActiveView === 'editor'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Edit & Configure</span>
          </button>

          <button
            onClick={() => setMobileActiveView('preview')}
            className={`flex-1 min-h-[42px] flex items-center justify-center gap-2 text-xs font-semibold rounded-lg transition-all ${
              mobileActiveView === 'preview'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Live Preview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        {/* Left Side: Editor & Configuration (Hidden on mobile if user selected 'preview') */}
        <div
          className={`w-full lg:w-[460px] xl:w-[490px] flex flex-col gap-3 shrink-0 ${
            mobileActiveView === 'preview' ? 'hidden lg:flex' : 'flex'
          } lg:h-[calc(100vh-130px)]`}
        >
          {/* Internal Tabs: Markdown, Sections, Spec */}
          <div className="flex items-center gap-1 p-1 bg-stone-100/90 border border-stone-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'sections'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>

            <button
              onClick={() => setActiveTab('spec')}
              className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'spec'
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Spec JSON</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 overflow-hidden min-h-[480px] lg:min-h-0">
            {activeTab === 'editor' && (
              <MarkdownEditor
                markdown={markdown}
                onChange={setMarkdown}
                parsedDoc={parsedDoc}
                ghMeta={ghMeta}
                onSmartTruncate={handleSmartTruncate}
              />
            )}

            {activeTab === 'sections' && (
              <div className="h-full overflow-y-auto pr-0.5">
                <SectionControls
                  spec={finalSpec}
                  variants={variants}
                  onVariantChange={handleVariantChange}
                  disabledSections={disabledSections}
                  onToggleSection={handleToggleSection}
                  onTitleChange={setCustomTitle}
                  onSubtitleChange={setCustomSubtitle}
                />
              </div>
            )}

            {activeTab === 'spec' && (
              <div className="h-full bg-white border border-stone-200 rounded-xl p-4 overflow-auto font-mono text-xs text-stone-700 shadow-xs">
                <div className="text-xs font-semibold text-stone-900 mb-2">// Generated Infographic Spec</div>
                <pre className="leading-relaxed">{JSON.stringify(finalSpec, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live SVG Infographic Canvas (Hidden on mobile if user selected 'editor') */}
        <div
          className={`flex-1 min-w-0 ${
            mobileActiveView === 'editor' ? 'hidden lg:block' : 'block'
          } lg:h-[calc(100vh-130px)]`}
        >
          <InfographicCanvas
            desktopSvgString={desktopSvgString}
            mobileSvgString={mobileSvgString}
            themeName={theme}
            onCopySvg={handleCopySvg}
            onDownloadSvg={handleDownloadSvg}
            onDownloadPng={handleDownloadPng}
            copied={copied}
          />
        </div>
      </main>

      {/* Scandinavian Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white/80 px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center text-xs text-stone-500 gap-2">
        <div className="flex items-center gap-3">
          <p>GitInfoGraphics • Deterministic SVG Engine</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={resetOnboarding}
            className="hover:text-stone-900 transition-colors underline decoration-stone-300"
          >
            Reset tour
          </button>
          <p>&copy; {new Date().getFullYear()} GitInfoGraphics Studio</p>
        </div>
      </footer>

      {/* Modals */}
      <WorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />

      <ArchitectureModal
        isOpen={archModalOpen}
        onClose={() => setArchModalOpen(false)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={() => {
          addToast('Ready! Craft your repository infographic below.', 'success');
        }}
      />

      <InfoModal
        isOpen={infoModalOpen}
        initialTab={infoModalTab}
        onClose={() => setInfoModalOpen(false)}
        onOpenWorkflowModal={() => setWorkflowModalOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
