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
  VariantMap,
  LogoConfig,
  InfographicSpec,
  VisualDensity,
  SmartRecommendation
} from './engine';
import { getTheme, THEMES } from './engine/themes';
import { ColorBlindnessType } from './engine/contrast';
import { ProjectStorage, Project } from './storage/ProjectStorage';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { triggerHaptic } from './ui/haptics';

// Core Components
import { Header } from './components/Header';
import { MarkdownEditor } from './components/MarkdownEditor';
import { SectionControls } from './components/SectionControls';
import { InfographicCanvas } from './components/InfographicCanvas';
import { ToastContainer, ToastMessage } from './components/Toast';

// Mobile Components
import { BottomNavigation, MobileTab } from './components/mobile/BottomNavigation';
import { FullScreenModalEditor } from './components/mobile/FullScreenModalEditor';
import { MobileInlineEditor } from './components/mobile/MobileInlineEditor';
import { MobileTopRepoBar } from './components/mobile/MobileTopRepoBar';
import { ThemeCarousel } from './components/mobile/ThemeCarousel';
import { VisualFormatPicker } from './components/mobile/VisualFormatPicker';
import { MobileExportSheet } from './components/mobile/MobileExportSheet';
import { MobileActionSheet } from './components/mobile/MobileActionSheet';
import { MobileFab } from './components/mobile/MobileFab';
import { MobileCoachMarks } from './components/mobile/MobileCoachMarks';

// Modals
import { ProjectsModal } from './components/ProjectsModal';
import { ShareModal } from './components/ShareModal';
import { WorkflowModal } from './components/WorkflowModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { InfoModal } from './components/InfoModal';
import { ContrastModal } from './components/ContrastModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { GroundingModal } from './components/GroundingModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { SyncModal } from './components/SyncModal';
import { CustomTemplate } from './engine/templateSchema';
import { RealTimeSyncEngine } from './engine/sync';

import {
  Sparkles,
  Palette,
  MoreVertical,
  Layers,
  FileText,
  Sliders,
  Share2,
  History as HistoryIcon,
  Download,
  Copy,
  Check,
  Zap,
  Github,
  Maximize2,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Code2
} from 'lucide-react';

// Format configurations for export and previews
const EXPORT_FORMATS: Record<string, { name: string; width: number; height: number | 'auto' }> = {
  desktop: { name: 'Desktop README', width: 880, height: 'auto' },
  mobile: { name: 'Mobile README', width: 400, height: 'auto' },
  twitter: { name: 'Twitter/X Post', width: 1200, height: 675 },
  linkedin: { name: 'LinkedIn Post', width: 1080, height: 1080 },
  instagram: { name: 'Instagram Story', width: 1080, height: 1920 },
  'github-preview': { name: 'GitHub Social Preview', width: 1280, height: 640 },
};

// Storage Utilities with robust error insulation
const Storage = {
  saveSession: (data: any) => {
    try {
      localStorage.setItem('gig-session', JSON.stringify(data));
    } catch {}
  },
  loadSession: () => {
    try {
      const data = localStorage.getItem('gig-session');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  saveHistory: (item: any) => {
    try {
      const parsed = JSON.parse(localStorage.getItem('gig-history') || '[]');
      const history = Array.isArray(parsed) ? parsed : [];
      history.unshift(item);
      localStorage.setItem('gig-history', JSON.stringify(history.slice(0, 15)));
    } catch {}
  },
  loadHistory: () => {
    try {
      const p = JSON.parse(localStorage.getItem('gig-history') || '[]');
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  },
  clearHistory: () => {
    try {
      localStorage.removeItem('gig-history');
    } catch {}
  }
};

export default function App() {
  // Mobile Navigation State ('preview' | 'editor' | 'style' | 'export')
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview');
  const [desktopTab, setDesktopTab] = useState<'editor' | 'sections' | 'export' | 'history'>('editor');

  // Core Data State
  const [markdown, setMarkdown] = useState<string>(SAMPLE_READMES[0].markdown);
  const [theme, setTheme] = useState<string>('scandi-minimal');
  const [variants, setVariants] = useState<VariantMap>({ 'problem-solution': 0, features: 0, stats: 0 });
  const [disabledSections, setDisabledSections] = useState<Record<string, boolean>>({});
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [ghMeta, setGhMeta] = useState<GitHubMeta | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [currentFormat, setCurrentFormat] = useState<string>('desktop');

  // Customization State
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [logo, setLogo] = useState<LogoConfig | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [animated, setAnimated] = useState<boolean>(false);
  const [compact, setCompact] = useState<boolean>(false);
  const [density, setDensity] = useState<VisualDensity>('dense');
  const [colorBlindness, setColorBlindness] = useState<ColorBlindnessType>('normal');

  // UI Modals and Sheets
  const [showMobileActionSheet, setShowMobileActionSheet] = useState(false);
  const [showMobileExportSheet, setShowMobileExportSheet] = useState(false);
  const [showMobileEditorModal, setShowMobileEditorModal] = useState(false);
  const [showCoachMarks, setShowCoachMarks] = useState(false);

  // Desktop/Universal Modals
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [contrastModalOpen, setContrastModalOpen] = useState(false);
  const [groundingModalOpen, setGroundingModalOpen] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [activePeersCount, setActivePeersCount] = useState(1);

  // Real-Time Collaborative Broadcast Sync Engine
  const syncEngine = useMemo(() => {
    let room = 'default';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('room')) room = urlParams.get('room')!;
    }
    const engine = new RealTimeSyncEngine(room);
    engine.connect();
    return engine;
  }, []);

  // Notifications & History
  const [history, setHistory] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Storage Manager Instance
  const projectStorage = useMemo(() => new ProjectStorage(), []);

  // Toast Helper
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // Apply Smart Recommendation handler
  const handleApplyRecommendation = useCallback((rec: SmartRecommendation) => {
    if (rec.suggestedDensity) {
      setDensity(rec.suggestedDensity);
    }
    if (rec.suggestedVariants) {
      setVariants((prev) => ({ ...prev, ...rec.suggestedVariants }));
    }
    addToast(`Applied ${rec.label} (${rec.suggestedDensity} density)`, 'success');
  }, [addToast]);

  // Apply Custom or Community Template handler
  const handleApplyTemplate = useCallback((template: CustomTemplate) => {
    if (template.theme) setTheme(template.theme);
    if (template.density) setDensity(template.density);
    if (template.sectionVariants) {
      const variantIdxMap: Record<string, number> = {
        grid: 1,
        timeline: 1,
        comparison: 2,
        callout: 1,
        pills: 1,
        cards: 0,
        table: 2
      };
      const newV: Record<string, number> = {};
      Object.entries(template.sectionVariants).forEach(([k, val]) => {
        newV[k] = typeof val === 'number' ? val : (variantIdxMap[String(val)] ?? 0);
      });
      setVariants((prev) => ({ ...prev, ...newV }));
    }
    if (template.disabledSections) {
      const disabledMap: Record<string, boolean> = {};
      template.disabledSections.forEach((s) => {
        disabledMap[s] = true;
      });
      setDisabledSections(disabledMap);
    }
    if (template.showQR !== undefined) {
      setShowQR(template.showQR);
    }
    if (template.qrUrl) {
      setQrUrl(template.qrUrl);
    }
    if (template.customTitle) {
      setCustomTitle(template.customTitle);
    }
    if (template.customSubtitle) {
      setCustomSubtitle(template.customSubtitle);
    }
    if (template.sampleMarkdown) {
      setMarkdown(template.sampleMarkdown);
    }
    addToast(`Applied template "${template.name}"`, 'success');
  }, [addToast]);

  // Real-Time Collaborative State Listeners
  useEffect(() => {
    const unsubPeers = syncEngine.onPeersChange((peers) => {
      setActivePeersCount(peers.length);
    });
    const unsubState = syncEngine.onStateChange((shared) => {
      if (shared.markdown !== undefined) setMarkdown(shared.markdown);
      if (shared.theme !== undefined) setTheme(shared.theme);
      if (shared.density !== undefined) setDensity(shared.density);
      if (shared.variants !== undefined) setVariants(shared.variants);
      if (shared.customTitle !== undefined) setCustomTitle(shared.customTitle);
      if (shared.customSubtitle !== undefined) setCustomSubtitle(shared.customSubtitle);
      addToast('Received real-time update from peer', 'info');
    });
    return () => {
      unsubPeers();
      unsubState();
    };
  }, [syncEngine, addToast]);

  // Broadcast state changes outward
  useEffect(() => {
    syncEngine.broadcastState({
      markdown,
      theme,
      density,
      variants,
      customTitle,
      customSubtitle
    });
  }, [markdown, theme, density, variants, customTitle, customSubtitle, syncEngine]);

  // Initial Load from LocalStorage
  useEffect(() => {
    try {
      const savedHistory = Storage.loadHistory();
      setHistory(savedHistory);

      const lastSession = Storage.loadSession();
      if (lastSession?.markdown) {
        setMarkdown(lastSession.markdown);
        if (lastSession.theme) setTheme(lastSession.theme);
        if (lastSession.customTitle) setCustomTitle(lastSession.customTitle);
        if (lastSession.customSubtitle) setCustomSubtitle(lastSession.customSubtitle);
        if (lastSession.variants) setVariants(lastSession.variants);
        if (lastSession.disabledSections) setDisabledSections(lastSession.disabledSections);
        if (lastSession.showQR !== undefined) setShowQR(lastSession.showQR);
        if (lastSession.qrUrl) setQrUrl(lastSession.qrUrl);
        if (lastSession.logo) setLogo(lastSession.logo);
      }

      // Check CoachMarks for first time mobile visitors
      const hasSeenCoach = localStorage.getItem('gitinfographics_mobile_coachmarks');
      if (!hasSeenCoach && window.innerWidth < 1024) {
        setShowCoachMarks(true);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
  }, []);

  // Sync session state to LocalStorage
  useEffect(() => {
    Storage.saveSession({
      markdown,
      theme,
      customTitle,
      customSubtitle,
      variants,
      disabledSections,
      showQR,
      qrUrl,
      logo
    });
  }, [markdown, theme, customTitle, customSubtitle, variants, disabledSections, showQR, qrUrl, logo]);

  // Derived Markdown AST
  const parsedDoc = useMemo(() => {
    try {
      return parseMD(markdown);
    } catch {
      return { title: '', subtitle: '', sections: [], badges: [], images: [] };
    }
  }, [markdown]);

  // Intermediate Rule-Based Spec
  const baseSpec = useMemo(() => {
    try {
      return buildRuleSpec(parsedDoc, variants, ghMeta);
    } catch {
      return { title: 'Untitled', subtitle: '', sections: [] };
    }
  }, [parsedDoc, variants, ghMeta]);

  // Filtered & Sorted Final Spec
  const finalSpec: InfographicSpec = useMemo(() => {
    let filteredSections = (baseSpec.sections || []).filter((s) => !disabledSections[s.id]);
    if (sectionOrder.length > 0) {
      filteredSections = [...filteredSections].sort((a, b) => {
        const aIdx = sectionOrder.indexOf(a.id);
        const bIdx = sectionOrder.indexOf(b.id);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }
    return {
      ...baseSpec,
      title: customTitle.trim() || baseSpec.title,
      subtitle: customSubtitle.trim() || baseSpec.subtitle,
      sections: filteredSections,
      meta: ghMeta || undefined
    };
  }, [baseSpec, disabledSections, customTitle, customSubtitle, sectionOrder, ghMeta]);

  // SVG Render Outputs
  const desktopSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, {
        layout: 'desktop',
        showQR,
        qrUrl,
        logo: logo || undefined,
        animated,
        compact,
        density
      });
    } catch {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="300"><text x="50" y="100">Render Error</text></svg>`;
    }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact, density]);

  const mobileSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, {
        layout: 'mobile',
        showQR,
        qrUrl,
        logo: logo || undefined,
        animated,
        compact,
        density
      });
    } catch {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="30" y="80">Render Error</text></svg>`;
    }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact, density]);

  // Active SVG String based on context
  const activeSvgString = useMemo(() => {
    return currentFormat === 'mobile' ? mobileSvgString : desktopSvgString;
  }, [currentFormat, mobileSvgString, desktopSvgString]);

  // GitHub Repo Fetcher
  const handleFetchRepo = async (repoUrl: string) => {
    setIsFetching(true);
    try {
      triggerHaptic(15);
      const { markdown: md, meta } = await fetchGitHubRepo(repoUrl);
      setMarkdown(md);
      setGhMeta(meta);
      setCustomTitle('');
      setCustomSubtitle('');
      setDisabledSections({});
      addToast(`Fetched ${meta.owner}/${meta.repo}`, 'success');
      setMobileTab('preview');
      setShowMobileEditorModal(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch repository', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  // Smart Truncate Helper
  const handleSmartTruncate = () => {
    triggerHaptic(10);
    setMarkdown(smartTrunc(markdown, 3000));
    addToast('Optimized README for visual infographics', 'success');
  };

  // Sample Selection
  const handleSelectSample = (sample: SampleReadme) => {
    triggerHaptic(12);
    setMarkdown(sample.markdown);
    setGhMeta(null);
    setCustomTitle('');
    setCustomSubtitle('');
    setDisabledSections({});
    addToast(`Loaded preset: ${sample.name}`, 'info');
    setMobileTab('preview');
    setShowMobileEditorModal(false);
  };

  // Theme Cycler
  const cycleTheme = () => {
    triggerHaptic(10);
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    setTheme(nextTheme);
    addToast(`Theme: ${THEMES[nextTheme].name}`, 'info');
  };

  // Clipboard SVG Copy
  const handleCopySvg = (layoutOverride?: 'desktop' | 'mobile') => {
    triggerHaptic(15);
    const targetSvg = layoutOverride === 'mobile' || (layoutOverride === undefined && currentFormat === 'mobile')
      ? mobileSvgString
      : desktopSvgString;
    navigator.clipboard.writeText(targetSvg);
    setCopied(true);
    addToast('SVG copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG File Downloader
  const handleDownloadSvg = (formatKey: string = currentFormat) => {
    triggerHaptic(15);
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(finalSpec.title || 'infographic').toLowerCase().replace(/\s+/g, '-')}-${formatKey}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded vector SVG', 'success');

    // Record History
    const histItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      title: finalSpec.title || 'Untitled',
      markdown: markdown.substring(0, 60),
      theme,
      format: formatKey
    };
    Storage.saveHistory(histItem);
    setHistory((prev) => [histItem, ...prev].slice(0, 15));
  };

  // High-Resolution Retina PNG Downloader
  const handleDownloadPng = (formatKey: string = currentFormat) => {
    triggerHaptic(15);
    const fmt = EXPORT_FORMATS[formatKey] || EXPORT_FORMATS.desktop;
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High-DPI @2x Retina scale
      canvas.width = fmt.width * scale;
      canvas.height = ((fmt.height === 'auto' ? (img.naturalHeight || 1200) : fmt.height) as number) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = getTheme(theme).bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / scale, canvas.height / scale);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${(finalSpec.title || 'infographic').toLowerCase().replace(/\s+/g, '-')}-${formatKey}@2x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast('Exported Retina PNG (@2x)', 'success');

        const histItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: finalSpec.title || 'Untitled',
          markdown: markdown.substring(0, 60),
          theme,
          format: formatKey
        };
        Storage.saveHistory(histItem);
        setHistory((prev) => [histItem, ...prev].slice(0, 15));
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Load Record from History
  const loadHistoryItem = (item: any) => {
    triggerHaptic(10);
    if (item.theme) setTheme(item.theme);
    if (item.format) setCurrentFormat(item.format);
    setMobileTab('preview');
    addToast('Restored settings from history', 'info');
  };

  // Register Global Keyboard Shortcuts
  useEffect(() => {
    const shortcuts = new KeyboardShortcuts();
    shortcuts.addShortcut({
      keys: 'Ctrl+Enter',
      description: 'Preview infographic',
      handler: () => setMobileTab('preview'),
      category: 'general'
    });
    shortcuts.addShortcut({
      keys: 'Ctrl+S',
      description: 'Download SVG',
      handler: () => handleDownloadSvg(currentFormat),
      category: 'export'
    });
    shortcuts.addShortcut({
      keys: 'Ctrl+Shift+P',
      description: 'Export Retina PNG',
      handler: () => handleDownloadPng(currentFormat),
      category: 'export'
    });
    shortcuts.addShortcut({
      keys: 'Ctrl+T',
      description: 'Cycle Theme',
      handler: () => cycleTheme(),
      category: 'general'
    });
    shortcuts.register();
    return () => shortcuts.unregister();
  }, [currentFormat, desktopSvgString, mobileSvgString, theme]);

  // Mobile Bottom Navigation Tab Handler
  const handleSelectMobileTab = (tab: MobileTab) => {
    triggerHaptic(8);
    setMobileTab(tab);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-[#FAFAF9] text-stone-900 flex flex-col font-sans selection:bg-stone-200 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE HEADER (< lg)                                                  */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/90 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-stone-900 leading-none">GitInfoGraphics</h1>
            <p className="text-[10px] text-stone-500 font-medium truncate max-w-[140px] mt-0.5">
              {finalSpec.title || 'Repository Banner'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Theme Cycle Button */}
          <button
            type="button"
            id="mobile-theme-quick-btn"
            onClick={cycleTheme}
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
            title="Cycle theme"
          >
            <Palette className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden xs:inline truncate max-w-[70px]">{THEMES[theme]?.name || 'Theme'}</span>
          </button>

          {/* Action Sheet Menu Button */}
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => {
              triggerHaptic(10);
              setShowMobileActionSheet(true);
            }}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors active:scale-95"
            aria-label="Open menu and tools"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Persistent GitHub Repository URL & Presets Bar (< lg) */}
      <MobileTopRepoBar
        onFetchRepo={handleFetchRepo}
        isFetching={isFetching}
        onSelectSample={handleSelectSample}
        currentTitle={finalSpec.title}
      />

      {/* ========================================================================= */}
      {/* 2. DESKTOP HEADER (>= lg)                                                */}
      {/* ========================================================================= */}
      <div className="hidden lg:block">
        <Header
          currentTheme={theme}
          onThemeChange={setTheme}
          currentFormat={currentFormat}
          onFormatChange={setCurrentFormat}
          onSelectSample={handleSelectSample}
          onFetchRepo={handleFetchRepo}
          isFetching={isFetching}
          onCopySvg={() => handleCopySvg()}
          onDownloadSvg={() => handleDownloadSvg()}
          onDownloadPng={() => handleDownloadPng()}
          onOpenActionModal={() => setWorkflowModalOpen(true)}
          onOpenArchModal={() => setArchitectureModalOpen(true)}
          onOpenInfoModal={() => setInfoModalOpen(true)}
          onOpenOnboarding={() => setShowCoachMarks(true)}
          onOpenProjectsModal={() => setProjectsModalOpen(true)}
          onOpenShareModal={() => setShareModalOpen(true)}
          onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
          onOpenGroundingModal={() => setGroundingModalOpen(true)}
          onOpenTemplateGallery={() => setTemplateGalleryOpen(true)}
          onOpenSyncModal={() => setSyncModalOpen(true)}
          activePeersCount={activePeersCount}
          groundingCoverage={finalSpec.grounding?.coveragePercent}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER                                                */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-0 lg:p-6 gap-6 overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 3A. MOBILE VIEW (Full-Screen Focus Area)                                */}
        {/* ======================================================================= */}
        <div className="lg:hidden flex-1 flex flex-col min-h-0 relative pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] overflow-hidden">
          
          {/* Active Mobile View: Preview (Default) */}
          {mobileTab === 'preview' && (
            <div className="flex-1 flex flex-col min-h-0 bg-stone-100/70 p-2 sm:p-4 overflow-y-auto">
              
              {/* Quick status bar */}
              <div className="flex items-center justify-between mb-2 px-1 text-xs text-stone-500">
                <span className="font-medium text-stone-700 truncate max-w-[200px]">
                  {finalSpec.title || 'Infographic Preview'}
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-stone-200">
                  {EXPORT_FORMATS[currentFormat]?.name || 'Desktop'}
                </span>
              </div>

              {/* Live Canvas Component */}
              <div className="flex-1 flex flex-col justify-center">
                <InfographicCanvas
                  desktopSvgString={desktopSvgString}
                  mobileSvgString={mobileSvgString}
                  themeName={theme}
                  onCopySvg={handleCopySvg}
                  onDownloadSvg={handleDownloadSvg}
                  onDownloadPng={handleDownloadPng}
                  copied={copied}
                  spec={finalSpec}
                  colorBlindness={colorBlindness}
                  onOpenContrastModal={() => setContrastModalOpen(true)}
                  onResetColorBlindness={() => setColorBlindness('normal')}
                />
              </div>

              {/* Mobile Quick Format Switcher Pill */}
              <div className="mt-3 flex items-center justify-center gap-1.5 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/80 shadow-xs max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => { triggerHaptic(8); setCurrentFormat('desktop'); }}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFormat === 'desktop' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Desktop (880px)
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic(8); setCurrentFormat('mobile'); }}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    currentFormat === 'mobile' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Mobile (400px)
                </button>
              </div>
            </div>
          )}

          {/* Active Mobile View: Edit (Inline Editor - Same UX as Style Page) */}
          {mobileTab === 'editor' && (
            <MobileInlineEditor
              markdown={markdown}
              onChange={setMarkdown}
              onSelectSample={handleSelectSample}
              onSmartTruncate={handleSmartTruncate}
              onOpenFullScreen={() => setShowMobileEditorModal(true)}
            />
          )}

          {/* Active Mobile View: Style (Themes & Sections) */}
          {mobileTab === 'style' && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
              {/* Theme Carousel */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                <ThemeCarousel
                  currentTheme={theme}
                  onThemeChange={(newTheme) => setTheme(newTheme)}
                />
              </div>

              {/* Section Controls Accordion */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-stone-700" />
                    <h2 className="text-sm font-bold text-stone-900">Module Structure &amp; Variants</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>

                <SectionControls
                  spec={finalSpec}
                  variants={variants}
                  onVariantChange={(key, val) => setVariants((p) => ({ ...p, [key]: val }))}
                  disabledSections={disabledSections}
                  onToggleSection={(id) => setDisabledSections((p) => ({ ...p, [id]: !p[id] }))}
                  onTitleChange={setCustomTitle}
                  onSubtitleChange={setCustomSubtitle}
                  onMoveSection={(id, dir) => {
                    const arr = [...(sectionOrder.length ? sectionOrder : finalSpec.sections.map((s) => s.id))];
                    const i = arr.indexOf(id);
                    if (dir === 'up' && i > 0) {
                      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
                      setSectionOrder(arr);
                    }
                    if (dir === 'down' && i < arr.length - 1) {
                      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                      setSectionOrder(arr);
                    }
                  }}
                  showQR={showQR}
                  onToggleQR={setShowQR}
                  qrUrl={qrUrl}
                  onQrUrlChange={setQrUrl}
                  logo={logo}
                  onLogoChange={setLogo}
                  onAutoDetectLogo={() => {}}
                  animated={animated}
                  onToggleAnimated={setAnimated}
                  compact={compact}
                  onToggleCompact={setCompact}
                  density={density}
                  onDensityChange={setDensity}
                />
              </div>
            </div>
          )}

          {/* Active Mobile View: Export & Downloads */}
          {mobileTab === 'export' && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-stone-50">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-stone-700" />
                    <h2 className="text-sm font-bold text-stone-900">Export &amp; Downloads</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileTab('preview')}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>

                <VisualFormatPicker
                  currentFormat={currentFormat}
                  onSelectFormat={setCurrentFormat}
                />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSvg(currentFormat)}
                    className="p-3 bg-stone-900 text-white rounded-xl text-xs font-semibold flex flex-col gap-1 shadow-2xs hover:bg-stone-800 transition-colors"
                  >
                    <span>Download SVG</span>
                    <span className="text-[10px] text-stone-400 font-mono">Vector Graphic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPng(currentFormat)}
                    className="p-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 flex flex-col gap-1 shadow-2xs hover:bg-stone-50 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <span>Retina PNG</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">@2x High-Res</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">README Markdown Embed</span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(15);
                        navigator.clipboard.writeText(`<picture>\n  <source media="(max-width: 600px)" srcset="./infographic-mobile.svg">\n  <img alt="Infographic" src="./infographic.svg">\n</picture>`);
                        addToast('Copied README embed snippet', 'info');
                      }}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Copy Snippet
                    </button>
                  </div>
                  <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl text-[11px] font-mono select-all overflow-x-auto">
{`<picture>
  <source media="(max-width: 600px)" srcset="./infographic-mobile.svg">
  <img alt="Infographic" src="./infographic.svg">
</picture>`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Button for Instant Exports on Mobile */}
          <MobileFab
            onDownloadPng={() => handleDownloadPng(currentFormat)}
            onDownloadSvg={() => handleDownloadSvg(currentFormat)}
            onCycleTheme={cycleTheme}
            onCopySvg={() => handleCopySvg()}
            onRefresh={() => setMobileTab('preview')}
            copied={copied}
          />

          {/* Bottom Navigation Bar */}
          <BottomNavigation
            activeTab={mobileTab}
            onSelectTab={handleSelectMobileTab}
            editorBadge={markdown.length > 0}
          />
        </div>

        {/* ======================================================================= */}
        {/* 3B. DESKTOP VIEW (Two-Column Split Layout >= lg)                         */}
        {/* ======================================================================= */}
        <div className="hidden lg:flex w-full gap-6 items-start">
          
          {/* Left Column: Tabbed Controls & Editor (w-1/2 or 540px) */}
          <div className="w-[520px] shrink-0 flex flex-col bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden max-h-[calc(100dvh-140px)]">
            
            {/* Desktop Navigation Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50/70 p-1.5 gap-1">
              <button
                type="button"
                id="desktop-tab-editor"
                onClick={() => setDesktopTab('editor')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'editor'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Markdown Editor
              </button>

              <button
                type="button"
                id="desktop-tab-sections"
                onClick={() => setDesktopTab('sections')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'sections'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Modules &amp; Layout
              </button>

              <button
                type="button"
                id="desktop-tab-export"
                onClick={() => setDesktopTab('export')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  desktopTab === 'export'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Export Specs
              </button>

              <button
                type="button"
                id="desktop-tab-history"
                onClick={() => setDesktopTab('history')}
                className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center ${
                  desktopTab === 'history'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Recent exports"
              >
                <HistoryIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-4">
              
              {/* Tab 1: Editor */}
              {desktopTab === 'editor' && (
                <div className="space-y-4">
                  {/* Quick Preset Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleFetchRepo('https://github.com/benneberg/gitinfographics')}
                      className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
                        <Github className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">Import This Repo</div>
                        <div className="text-[10px] text-stone-500 truncate">benneberg/gitinfographics</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectSample(SAMPLE_READMES[0])}
                      className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-900 truncate">Standard Sample</div>
                        <div className="text-[10px] text-stone-500 truncate">Fast CLI Engine</div>
                      </div>
                    </button>
                  </div>

                  {/* Markdown Editor component */}
                  <div className="min-h-[420px]">
                    <MarkdownEditor
                      markdown={markdown}
                      onChange={setMarkdown}
                      parsedDoc={parsedDoc}
                      ghMeta={ghMeta}
                      onSmartTruncate={handleSmartTruncate}
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Modules & Controls */}
              {desktopTab === 'sections' && (
                <div className="space-y-4">
                  {/* Theme Selector Strip */}
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    <ThemeCarousel
                      currentTheme={theme}
                      onThemeChange={(newTheme) => setTheme(newTheme)}
                    />
                  </div>

                  <SectionControls
                    spec={finalSpec}
                    variants={variants}
                    onVariantChange={(key, val) => setVariants((p) => ({ ...p, [key]: val }))}
                    disabledSections={disabledSections}
                    onToggleSection={(id) => setDisabledSections((p) => ({ ...p, [id]: !p[id] }))}
                    onTitleChange={setCustomTitle}
                    onSubtitleChange={setCustomSubtitle}
                    onMoveSection={(id, dir) => {
                      const arr = [...(sectionOrder.length ? sectionOrder : finalSpec.sections.map((s) => s.id))];
                      const i = arr.indexOf(id);
                      if (dir === 'up' && i > 0) {
                        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
                        setSectionOrder(arr);
                      }
                      if (dir === 'down' && i < arr.length - 1) {
                        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                        setSectionOrder(arr);
                      }
                    }}
                    showQR={showQR}
                    onToggleQR={setShowQR}
                    qrUrl={qrUrl}
                    onQrUrlChange={setQrUrl}
                    logo={logo}
                    onLogoChange={setLogo}
                    onAutoDetectLogo={() => {}}
                    animated={animated}
                    onToggleAnimated={setAnimated}
                    compact={compact}
                    onToggleCompact={setCompact}
                    density={density}
                    onDensityChange={setDensity}
                  />
                </div>
              )}

              {/* Tab 3: Export Configuration */}
              {desktopTab === 'export' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                      1. Select Target Aspect Ratio
                    </h3>
                    <VisualFormatPicker
                      currentFormat={currentFormat}
                      onFormatChange={(fmt) => setCurrentFormat(fmt)}
                    />
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      2. Download Production Assets
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadPng(currentFormat)}
                        className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Download className="w-4 h-4" /> Download PNG (@2x)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSvg(currentFormat)}
                        className="py-3 px-4 bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Code2 className="w-4 h-4" /> Download SVG
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopySvg()}
                      className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied SVG to Clipboard!' : 'Copy Vector Code to Clipboard'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: History */}
              {desktopTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Recent Export Snapshots ({history.length})
                    </h3>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          Storage.clearHistory();
                          setHistory([]);
                        }}
                        className="text-[11px] font-medium text-rose-600 hover:text-rose-700"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-400">
                      No exports logged yet. Generate an SVG or PNG to view it here.
                    </div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-900 truncate">{item.title}</div>
                          <div className="text-[10px] text-stone-500 flex gap-2 mt-0.5">
                            <span className="capitalize">{item.theme}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                          {item.format}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Sticky Live Vector Preview */}
          <div className="flex-1 bg-stone-100/70 border border-stone-200/90 rounded-2xl p-6 shadow-xs flex flex-col min-h-[600px] sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-900">Deterministic SVG Canvas</span>
                <span className="text-[11px] text-stone-400 font-mono">
                  ({EXPORT_FORMATS[currentFormat]?.width}px wide)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(true)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col justify-center">
              <InfographicCanvas
                desktopSvgString={desktopSvgString}
                mobileSvgString={mobileSvgString}
                themeName={theme}
                onCopySvg={handleCopySvg}
                onDownloadSvg={handleDownloadSvg}
                onDownloadPng={handleDownloadPng}
                copied={copied}
                spec={finalSpec}
                colorBlindness={colorBlindness}
                onOpenContrastModal={() => setContrastModalOpen(true)}
                onResetColorBlindness={() => setColorBlindness('normal')}
              />
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE-FIRST MODALS & ACTION SHEETS                                   */}
      {/* ========================================================================= */}

      {/* 4A. Full-Screen Modal Editor for Mobile */}
      <FullScreenModalEditor
        isOpen={showMobileEditorModal}
        onClose={() => setShowMobileEditorModal(false)}
        markdown={markdown}
        onChange={setMarkdown}
        parsedDoc={parsedDoc}
        ghMeta={ghMeta}
        onSmartTruncate={handleSmartTruncate}
        onFetchRepo={handleFetchRepo}
        isFetching={isFetching}
        onSelectSample={handleSelectSample}
      />

      {/* 4B. Mobile Export Bottom Sheet */}
      <MobileExportSheet
        isOpen={showMobileExportSheet}
        onClose={() => setShowMobileExportSheet(false)}
        currentFormat={currentFormat}
        onFormatChange={(fmt) => setCurrentFormat(fmt)}
        onDownloadSvg={() => handleDownloadSvg(currentFormat)}
        onDownloadPng={() => handleDownloadPng(currentFormat)}
        onCopySvg={() => handleCopySvg()}
        copied={copied}
        history={history}
        onLoadHistory={loadHistoryItem}
        onClearHistory={() => {
          Storage.clearHistory();
          setHistory([]);
        }}
        spec={finalSpec}
        svgContent={activeSvgString}
        onOpenShareModal={() => setShareModalOpen(true)}
      />

      {/* 4C. Mobile Action Sheet (Slide up menu) */}
      <MobileActionSheet
        isOpen={showMobileActionSheet}
        onClose={() => setShowMobileActionSheet(false)}
        onOpenWorkflow={() => setWorkflowModalOpen(true)}
        onOpenProjects={() => setProjectsModalOpen(true)}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenTemplates={() => setTemplateGalleryOpen(true)}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        onOpenContrast={() => setContrastModalOpen(true)}
        onOpenTour={() => setShowCoachMarks(true)}
        onOpenDocs={() => setInfoModalOpen(true)}
        onReset={() => {
          setMarkdown(SAMPLE_READMES[0].markdown);
          setTheme('scandi-minimal');
          setCustomTitle('');
          setCustomSubtitle('');
          setDisabledSections({});
          setGhMeta(null);
          addToast('Reset to default preset', 'info');
        }}
      />

      {/* 4D. Mobile First-Time Coach Marks Tour */}
      <MobileCoachMarks
        isOpen={showCoachMarks}
        onClose={() => setShowCoachMarks(false)}
      />

      {/* ========================================================================= */}
      {/* 5. DESKTOP & GLOBAL SYSTEM MODALS                                        */}
      {/* ========================================================================= */}

      {/* Projects Modal */}
      <ProjectsModal
        isOpen={projectsModalOpen}
        onClose={() => setProjectsModalOpen(false)}
        storage={projectStorage}
        onSelectProject={(proj) => {
          setMarkdown(proj.source.content);
          if (proj.settings?.themeId) setTheme(proj.settings.themeId);
          if (proj.settings?.format) setCurrentFormat(String(proj.settings.format));
          setProjectsModalOpen(false);
          addToast(`Loaded project: ${proj.name}`, 'success');
        }}
        onCreateProject={(name) => {
          addToast(`Created project: ${name}`, 'success');
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        svgContent={activeSvgString}
        projectData={{
          markdown,
          theme,
          customTitle,
          customSubtitle,
          format: currentFormat
        }}
      />

      {/* CI/CD GitHub Actions Workflow Modal */}
      <WorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
      />

      {/* Architecture & Headless Module Documentation Modal */}
      <ArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
      />

      {/* Info, User Manual & FAQ Modal */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onOpenWorkflowModal={() => setWorkflowModalOpen(true)}
        onOpenOnboarding={() => setShowCoachMarks(true)}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* WCAG AA Accessibility & Color Blindness Contrast Modal */}
      <ContrastModal
        isOpen={contrastModalOpen}
        onClose={() => setContrastModalOpen(false)}
        currentTheme={getTheme(theme)}
        colorBlindness={colorBlindness}
        onColorBlindnessChange={setColorBlindness}
      />

      {/* Grounding & Content Traceability Modal */}
      <GroundingModal
        isOpen={groundingModalOpen}
        onClose={() => setGroundingModalOpen(false)}
        spec={finalSpec}
        onApplyRecommendation={handleApplyRecommendation}
      />

      {/* Community & Custom Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        currentTheme={theme}
        currentDensity={density}
        currentVariants={variants}
        customTitle={customTitle}
        customSubtitle={customSubtitle}
        showQR={showQR}
        onShowToast={addToast}
      />

      {/* Real-Time Collaborative Synchronization Modal */}
      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        syncEngine={syncEngine}
        onShowToast={addToast}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

    </div>
  );
}

