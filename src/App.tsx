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
  LogoConfig
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
import { ProjectsModal } from './components/ProjectsModal';
import { ShareModal } from './components/ShareModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ContrastModal } from './components/ContrastModal';
import { ColorBlindnessType } from './engine/contrast';
import { getTheme, THEMES } from './engine/themes';
import { ProjectStorage, Project } from './storage/ProjectStorage';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { triggerHaptic } from './ui/haptics';

// Mobile Redesign Components
import { BottomNavigation } from './components/mobile/BottomNavigation';
import { ThemeCarousel } from './components/mobile/ThemeCarousel';
import { VisualFormatPicker } from './components/mobile/VisualFormatPicker';
import { FullScreenModalEditor } from './components/mobile/FullScreenModalEditor';
import { MobileFab } from './components/mobile/MobileFab';
import { MobileExportSheet } from './components/mobile/MobileExportSheet';
import { MobileCoachMarks } from './components/mobile/MobileCoachMarks';
import { Code, Sliders, FileText, Eye, BookOpen, History as HistoryIcon, Trash2 } from 'lucide-react';

const EXPORT_FORMATS = {
  desktop: { name: 'Desktop README', width: 880, height: 'auto' as const },
  mobile: { name: 'Mobile README', width: 400, height: 'auto' as const },
  twitter: { name: 'Twitter/X Post', width: 1200, height: 675 as const },
  linkedin: { name: 'LinkedIn Post', width: 1080, height: 1080 as const },
  instagram: { name: 'Instagram Story', width: 1080, height: 1920 as const },
  'github-preview': { name: 'GitHub Social Preview', width: 1280, height: 640 as const },
} as const;

type FormatKey = keyof typeof EXPORT_FORMATS;

const Storage = {
  saveSession: (data: any) => {
    try { localStorage.setItem('gig-session', JSON.stringify(data)); } catch {}
  },
  loadSession: () => {
    try { return JSON.parse(localStorage.getItem('gig-session') || 'null'); } catch { return null; }
  },
  saveHistory: (item: any) => {
    try {
      const parsed = JSON.parse(localStorage.getItem('gig-history') || '[]');
      const history = Array.isArray(parsed) ? parsed : [];
      history.unshift(item);
      localStorage.setItem('gig-history', JSON.stringify(history.slice(0, 10))); 
    } catch {}
  },
  loadHistory: () => {
    try {
      const parsed = JSON.parse(localStorage.getItem('gig-history') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  },
  clearHistory: () => {
    try { localStorage.removeItem('gig-history'); } catch {}
  }
};

export default function App() {
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
  const [activeTab, setActiveTab] = useState<'editor' | 'sections' | 'spec' | 'history'>('editor');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'export'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState<boolean>(false);
  const [archModalOpen, setArchModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [infoModalTab, setInfoModalTab] = useState<'overview' | 'manual' | 'faq'>('overview');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [currentFormat, setCurrentFormat] = useState<FormatKey>('desktop');
  const [history, setHistory] = useState<any[]>([]);

  // Mobile Redesign Modals & Overlays
  const [fullEditorOpen, setFullEditorOpen] = useState<boolean>(false);
  const [exportSheetOpen, setExportSheetOpen] = useState<boolean>(false);

  const storage = useMemo(() => new ProjectStorage(), []);
  const [currentProjectId, setCurrentProjectId] = useState<string>('default-project');
  const [projectsModalOpen, setProjectsModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);

  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [logo, setLogo] = useState<LogoConfig | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [animated, setAnimated] = useState<boolean>(false);
  const [compact, setCompact] = useState<boolean>(false);

  const [contrastModalOpen, setContrastModalOpen] = useState<boolean>(false);
  const [colorBlindness, setColorBlindness] = useState<ColorBlindnessType>('normal');

  useEffect(() => {
    try {
      const completed = localStorage.getItem('gitinfographics_onboarding_completed');
      if (!completed) {
        setOnboardingOpen(true);
      }

      if (typeof window !== 'undefined' && window.location.hash.startsWith('#project=')) {
        const jsonStr = decodeURIComponent(window.location.hash.slice(9));
        const shared = JSON.parse(jsonStr);
        if (shared && shared.source) {
          if (shared.source.content) setMarkdown(shared.source.content);
          if (shared.settings?.theme) setTheme(shared.settings.theme);
          if (shared.settings?.customTitle) setCustomTitle(shared.settings.customTitle);
          if (shared.settings?.customSubtitle) setCustomSubtitle(shared.settings.customSubtitle);
          if (shared.settings?.variants) setVariants(shared.settings.variants);
          if (shared.name) addToast(`Opened shared project: ${shared.name}`, 'success');
        }
      }
      
      const savedHistory = Storage.loadHistory();
      setHistory(savedHistory);

      const lastSession = Storage.loadSession();
      if (lastSession && lastSession.markdown) {
        setMarkdown(lastSession.markdown);
        setTheme(lastSession.theme || 'scandi-minimal');
        setCustomTitle(lastSession.customTitle || '');
        setCustomSubtitle(lastSession.customSubtitle || '');
        if (lastSession.showQR !== undefined) setShowQR(lastSession.showQR);
        if (lastSession.qrUrl) setQrUrl(lastSession.qrUrl);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    Storage.saveSession({
      markdown,
      theme,
      customTitle,
      customSubtitle,
      variants,
      disabledSections,
      showQR,
      qrUrl
    });
  }, [markdown, theme, customTitle, customSubtitle, variants, disabledSections, showQR, qrUrl]);

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

  const cycleTheme = () => {
    triggerHaptic(10);
    const keys = Object.keys(THEMES);
    const currentIdx = keys.indexOf(theme);
    const nextTheme = keys[(currentIdx + 1) % keys.length];
    setTheme(nextTheme);
    const themeName = getTheme(nextTheme).name;
    addToast(`Theme switched to ${themeName}`, 'info');
  };

  const parsedDoc = useMemo(() => {
    try {
      return parseMD(markdown);
    } catch {
      return { title: '', subtitle: '', sections: [], badges: [], images: [] };
    }
  }, [markdown]);

  const baseSpec = useMemo(() => {
    return buildRuleSpec(parsedDoc, variants, ghMeta);
  }, [parsedDoc, variants, ghMeta]);

  const finalSpec = useMemo(() => {
    let filteredSections = baseSpec.sections.filter((s) => !disabledSections[s.id]);
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
      sections: filteredSections
    };
  }, [baseSpec, disabledSections, customTitle, customSubtitle, sectionOrder]);

  const desktopSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, { layout: 'desktop', showQR, qrUrl, logo: logo || undefined, animated, compact });
    } catch (e) {
      console.error('Render desktop error:', e);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="300"><text x="50" y="100" fill="#1C1917" font-size="20">Render Error</text></svg>`;
    }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact]);

  const mobileSvgString = useMemo(() => {
    try {
      return renderSVG(finalSpec, theme, { layout: 'mobile', showQR, qrUrl, logo: logo || undefined, animated, compact });
    } catch (e) {
      console.error('Render mobile error:', e);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="30" y="80" fill="#1C1917" font-size="16">Render Error</text></svg>`;
    }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact]);

  const handleAutoDetectLogo = useCallback(() => {
    if (ghMeta?.owner) {
      setLogo({
        dataUrl: `https://github.com/${ghMeta.owner}.png`,
        position: 'top-right',
        size: 42
      });
      addToast(`Detected logo from GitHub user (${ghMeta.owner})`, 'success');
      return;
    }
    const imgMatch = markdown.match(/!\[.*?\]\((https?:\/\/[^\s)]+\.(?:png|svg|jpg|jpeg|webp))\)/i) ||
                     markdown.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:png|svg|jpg|jpeg|webp))["']/i);
    if (imgMatch && imgMatch[1]) {
      setLogo({
        dataUrl: imgMatch[1],
        position: 'top-right',
        size: 42
      });
      addToast('Detected logo image from README markdown', 'success');
      return;
    }
    addToast('No logo found in repository metadata or README images', 'info');
  }, [ghMeta, markdown]);

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
      setMobileTab('preview');
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
    triggerHaptic(15);
    const isMobile = layout === 'mobile';
    const targetSvg = isMobile ? mobileSvgString : desktopSvgString;
    navigator.clipboard.writeText(targetSvg);
    setCopied(true);
    addToast(`${isMobile ? 'Mobile (400px)' : 'Desktop (880px)'} SVG copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = (formatKey: FormatKey = currentFormat) => {
    triggerHaptic(20);
    const format = EXPORT_FORMATS[formatKey] || EXPORT_FORMATS.desktop;
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = finalSpec.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'infographic';
    a.download = `${safeTitle}-${formatKey}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${format.name} SVG`, 'success');
  };

  const handleDownloadPng = (formatKey: FormatKey = currentFormat) => {
    triggerHaptic(20);
    const format = EXPORT_FORMATS[formatKey] || EXPORT_FORMATS.desktop;
    const isAutoHeight = format.height === 'auto';
    const fallbackHeight = formatKey === 'mobile' ? 1500 : 1200;
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      const width = format.width;
      const height = isAutoHeight ? (img.naturalHeight || fallbackHeight) : (format.height as number);
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = getTheme(theme).bg;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        const safeTitle = finalSpec.title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'infographic';
        a.download = `${safeTitle}-${formatKey}@2x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast(`Exported ${format.name} Retina PNG (@2x)`, 'success');

        const historyItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: safeTitle,
          markdown: markdown.substring(0, 100) + '...',
          theme,
          format: formatKey,
          svg: targetSvg
        };
        Storage.saveHistory(historyItem);
        setHistory(prev => [historyItem, ...prev].slice(0, 10));
      }
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      addToast('Error rendering PNG from SVG', 'error');
    };

    img.src = url;
  };

  const loadHistoryItem = (item: any) => {
    setTheme(item.theme);
    if (item.format && item.format in EXPORT_FORMATS) {
      setCurrentFormat(item.format as FormatKey);
    }
    setActiveTab('editor');
    addToast('Loaded theme/format from history', 'info');
  };

  const clearHistory = () => {
    Storage.clearHistory();
    setHistory([]);
    addToast('History cleared', 'info');
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProjectId(project.id);
    if (project.source.content) setMarkdown(project.source.content);
    if (project.settings?.themeId) setTheme(project.settings.themeId);
    if (project.settings?.customSettings?.customTitle) setCustomTitle(project.settings.customSettings.customTitle);
    if (project.settings?.customSettings?.customSubtitle) setCustomSubtitle(project.settings.customSettings.customSubtitle);
    if (project.settings?.customSettings?.variants) setVariants(project.settings.customSettings.variants);
    addToast(`Switched to project "${project.name}"`, 'success');
  };

  const handleCreateProject = (name: string) => {
    const newProj = storage.createProject(name, {
      type: 'text',
      content: markdown
    });
    storage.updateProject(newProj.id, {
      settings: {
        themeId: theme,
        format: {
          name: EXPORT_FORMATS[currentFormat].name,
          width: EXPORT_FORMATS[currentFormat].width,
          height: EXPORT_FORMATS[currentFormat].height,
          description: ''
        },
        customSettings: {
          customTitle,
          customSubtitle,
          variants
        }
      }
    });
    setCurrentProjectId(newProj.id);
    addToast(`Project "${name}" created`, 'success');
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentSectionIds = finalSpec.sections.map((s) => s.id);
    const idx = currentSectionIds.indexOf(sectionId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentSectionIds.length) return;
    const newOrder = [...currentSectionIds];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
    addToast(`Section moved ${direction}`, 'info');
  };

  const openInfoModalWithTab = (tab: 'overview' | 'manual' | 'faq' = 'overview') => {
    setInfoModalTab(tab);
    setInfoModalOpen(true);
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem('gitinfographics_onboarding_completed');
    } catch {}
    setOnboardingOpen(true);
    addToast('Onboarding guide reset', 'info');
  };

  useEffect(() => {
    const shortcuts = new KeyboardShortcuts();

    shortcuts.addShortcut({
      keys: 'Ctrl+Enter',
      description: 'Infographic update / refresh',
      handler: () => { addToast('Infographic updated', 'info'); },
      category: 'general'
    });

    shortcuts.addShortcut({
      keys: 'Ctrl+S',
      description: 'Export as SVG',
      handler: () => { handleDownloadSvg(currentFormat); },
      category: 'export'
    });

    shortcuts.addShortcut({
      keys: 'Ctrl+Shift+P',
      description: 'Export as PNG (@2x Retina)',
      handler: () => { handleDownloadPng(currentFormat); },
      category: 'export'
    });

    shortcuts.addShortcut({
      keys: 'Ctrl+M',
      description: 'Toggle mobile/desktop preview',
      handler: () => {
        setCurrentFormat((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'));
        addToast('Switched preview layout', 'info');
      },
      category: 'navigation'
    });

    shortcuts.addShortcut({
      keys: 'Ctrl+T',
      description: 'Switch color theme',
      handler: () => { cycleTheme(); },
      category: 'navigation'
    });

    shortcuts.addShortcut({
      keys: 'Ctrl+Shift+?',
      description: 'Show keyboard shortcuts',
      handler: () => { setShortcutsModalOpen(true); },
      category: 'general'
    });

    shortcuts.register();
    return () => shortcuts.unregister();
  }, [currentFormat, desktopSvgString, mobileSvgString, theme]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-stone-900 selection:bg-stone-200 selection:text-stone-900 font-sans pb-16 lg:pb-0">
      
      {/* Header */}
      <Header
        currentTheme={theme}
        onThemeChange={setTheme}
        currentFormat={currentFormat}
        onFormatChange={(f) => setCurrentFormat(f as FormatKey)}
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
        onOpenProjectsModal={() => setProjectsModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenShortcutsModal={() => setShortcutsModalOpen(true)}
      />

      {/* Status Bar */}
      <div className="border-b border-stone-200/80 bg-stone-50/70 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-stone-700 text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            System Ready
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-500 text-[11px] hidden sm:inline">100% Client-side Deterministic SVG</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-stone-500">
          <button
            onClick={() => openInfoModalWithTab('overview')}
            className="hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            <span>Manual & FAQ</span>
          </button>
          <span className="hidden sm:inline text-stone-400">
            {finalSpec.sections.length} Active Modules
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
        
        {/* Left Side (Editor & Config) */}
        <div
          className={`w-full lg:w-[460px] xl:w-[490px] flex flex-col gap-3 shrink-0 ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          } lg:h-[calc(100vh-130px)]`}
        >
          {/* Theme Swipe Carousel for Mobile */}
          <div className="lg:hidden mb-1">
            <ThemeCarousel currentTheme={theme} onSelectTheme={setTheme} />
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100/90 border border-stone-200/80 rounded-xl">
            {(['editor', 'sections', 'spec', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { triggerHaptic(5); setActiveTab(tab); }}
                className={`flex-1 min-h-[38px] flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'editor' && <FileText className="w-3.5 h-3.5" />}
                {tab === 'sections' && <Sliders className="w-3.5 h-3.5" />}
                {tab === 'spec' && <Code className="w-3.5 h-3.5" />}
                {tab === 'history' && <HistoryIcon className="w-3.5 h-3.5" />}
                <span>{tab}</span>
              </button>
            ))}
          </div>

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
                  onMoveSection={handleMoveSection}
                  showQR={showQR}
                  onToggleQR={setShowQR}
                  qrUrl={qrUrl}
                  onQrUrlChange={setQrUrl}
                  logo={logo}
                  onLogoChange={setLogo}
                  onAutoDetectLogo={handleAutoDetectLogo}
                  animated={animated}
                  onToggleAnimated={setAnimated}
                  compact={compact}
                  onToggleCompact={setCompact}
                />
              </div>
            )}

            {activeTab === 'spec' && (
              <div className="h-full bg-white border border-stone-200 rounded-xl p-4 overflow-auto font-mono text-xs text-stone-700 shadow-xs">
                <div className="text-xs font-semibold text-stone-900 mb-2">// Generated Infographic Spec</div>
                <pre className="leading-relaxed">{JSON.stringify(finalSpec, null, 2)}</pre>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="h-full overflow-y-auto pr-0.5 space-y-3">
                <div className="text-xs font-semibold text-stone-900 mb-2 px-1 flex justify-between items-center">
                  <span>Recent Export History</span>
                </div>
                {history.length === 0 ? (
                  <div className="text-xs text-stone-500 p-4 bg-stone-50 rounded-xl border border-stone-200 text-center">
                    No history yet. Export a PNG/SVG to save it here.
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left p-3 bg-white border border-stone-200 rounded-xl hover:border-stone-400 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-stone-900 group-hover:text-emerald-700 truncate pr-2">
                          {item.title || 'Untitled'}
                        </span>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-2 mb-2">{item.markdown}</div>
                      <div className="flex gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded capitalize">{item.theme}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded capitalize">{item.format}</span>
                      </div>
                    </button>
                  ))
                )}
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear History
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side (Canvas & Preview) */}
        <div
          className={`flex-1 min-w-0 ${
            mobileTab === 'editor' ? 'hidden lg:block' : 'block'
          } lg:h-[calc(100vh-130px)]`}
        >
          {mobileTab === 'export' ? (
            <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-stone-900">Select Export Format</h3>
              <VisualFormatPicker currentFormat={currentFormat} onSelectFormat={(f) => setCurrentFormat(f as FormatKey)} />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleDownloadPng(currentFormat)}
                  className="flex-1 min-h-[44px] bg-stone-900 text-white font-medium text-xs rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Download PNG (@2x)
                </button>
                <button
                  onClick={() => handleDownloadSvg(currentFormat)}
                  className="flex-1 min-h-[44px] bg-stone-100 text-stone-800 font-medium text-xs rounded-xl hover:bg-stone-200 transition-colors border border-stone-200"
                >
                  Download SVG
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <MobileFab
        onCycleTheme={cycleTheme}
        onOpenExport={() => setExportSheetOpen(true)}
        onOpenEditor={() => setFullEditorOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        activeTab={mobileTab}
        onTabChange={(tab) => {
          triggerHaptic(10);
          setMobileTab(tab);
          if (tab === 'editor') setFullEditorOpen(true);
        }}
      />

      {/* Mobile Full Screen Editor Sheet */}
      <FullScreenModalEditor
        isOpen={fullEditorOpen}
        onClose={() => setFullEditorOpen(false)}
        markdown={markdown}
        onChange={setMarkdown}
        parsedDoc={parsedDoc}
        onSmartTruncate={handleSmartTruncate}
      />

      {/* Mobile Export Sheet */}
      <MobileExportSheet
        isOpen={exportSheetOpen}
        onClose={() => setExportSheetOpen(false)}
        currentFormat={currentFormat}
        onSelectFormat={(f) => setCurrentFormat(f as FormatKey)}
        onDownloadPng={handleDownloadPng}
        onDownloadSvg={handleDownloadSvg}
        history={history}
        onLoadHistory={loadHistoryItem}
      />

      {/* Mobile Guided Tour */}
      <MobileCoachMarks />

      {/* Modals */}
      <WorkflowModal isOpen={workflowModalOpen} onClose={() => setWorkflowModalOpen(false)} />
      <ArchitectureModal isOpen={archModalOpen} onClose={() => setArchModalOpen(false)} />
      <OnboardingModal isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} onComplete={() => addToast('Ready!', 'success')} />
      <InfoModal isOpen={infoModalOpen} initialTab={infoModalTab} onClose={() => setInfoModalOpen(false)} onOpenWorkflowModal={() => setWorkflowModalOpen(true)} onOpenOnboarding={() => setOnboardingOpen(true)} />
      <ProjectsModal isOpen={projectsModalOpen} onClose={() => setProjectsModalOpen(false)} storage={storage} currentProjectId={currentProjectId} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} svgContent={desktopSvgString} projectData={{ id: currentProjectId, name: finalSpec.title || 'Infographic', source: { type: 'text', content: markdown }, settings: { themeId: theme, customSettings: { customTitle, customSubtitle, variants } } }} />
      <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
      <ContrastModal isOpen={contrastModalOpen} onClose={() => setContrastModalOpen(false)} currentTheme={getTheme(theme)} colorBlindness={colorBlindness} onColorBlindnessChange={setColorBlindness} />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
