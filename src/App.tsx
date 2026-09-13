import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LazyMotion, m, AnimatePresence } from 'framer-motion';
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
import { MarkdownEditor } from './components/MarkdownEditor';
import { SectionControls } from './components/SectionControls';
import { InfographicCanvas } from './components/InfographicCanvas';
import { VisualFormatPicker } from './components/mobile/VisualFormatPicker';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ContrastModal } from './components/ContrastModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ColorBlindnessType } from './engine/contrast';
import { getTheme, THEMES } from './engine/themes';
import { ProjectStorage, Project } from './storage/ProjectStorage';
import { KeyboardShortcuts } from './ui/KeyboardShortcuts';
import { triggerHaptic } from './ui/haptics';
import { 
  FileText, Eye, Download, Palette, History as HistoryIcon, Github, 
  Sparkles, ChevronRight, X, Check, Zap, Share2, Maximize2, Trash2, Code, Sliders
} from 'lucide-react';

// --- Framer Motion Dynamic Payload ---
const loadFramerFeatures = () => import('framer-motion').then((res) => res.domAnimation);
import type { TargetAndTransition, Transition } from 'framer-motion';
// --- Animation Physics & Variants ---
const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.25, ease: "easeOut" } as Transition
};

const sheetSpring: Transition = {
  type: "spring",
  damping: 24,
  stiffness: 300
};


// --- Format Configuration ---
const EXPORT_FORMATS = {
  desktop: { name: 'Desktop README', width: 880, height: 'auto' as const },
  mobile: { name: 'Mobile README', width: 400, height: 'auto' as const },
  twitter: { name: 'Twitter/X Post', width: 1200, height: 675 as const },
  linkedin: { name: 'LinkedIn Post', width: 1080, height: 1080 as const },
  instagram: { name: 'Instagram Story', width: 1080, height: 1920 as const },
  'github-preview': { name: 'GitHub Social Preview', width: 1280, height: 640 as const },
} as const;

type FormatKey = keyof typeof EXPORT_FORMATS;

// --- Storage Utilities ---
const Storage = {
  saveSession: (data: any) => { try { localStorage.setItem('gig-session', JSON.stringify(data)); } catch {} },
  loadSession: () => { try { return JSON.parse(localStorage.getItem('gig-session') || 'null'); } catch { return null; } },
  saveHistory: (item: any) => {
    try {
      const parsed = JSON.parse(localStorage.getItem('gig-history') || '[]');
      const history = Array.isArray(parsed) ? parsed : [];
      history.unshift(item);
      localStorage.setItem('gig-history', JSON.stringify(history.slice(0, 10))); 
    } catch {}
  },
  loadHistory: () => { try { const p = JSON.parse(localStorage.getItem('gig-history') || '[]'); return Array.isArray(p) ? p : []; } catch { return []; } },
  clearHistory: () => { try { localStorage.removeItem('gig-history'); } catch {} }
};

// --- Reusable UI Primitives ---
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <m.div
    onClick={() => {
      if (onClick) {
        triggerHaptic(10);
        onClick();
      }
    }}
    whileTap={onClick ? { scale: 0.97 } : undefined}
    className={`bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl ${className}`}
  >
    {children}
  </m.div>
);

const IconButton: React.FC<{ icon: any; onClick: () => void; label?: string; active?: boolean }> = ({ icon: Icon, onClick, label, active = false }) => (
  <m.button
    onClick={() => { triggerHaptic(10); onClick(); }}
    whileTap={{ scale: 0.9 }}
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-colors ${
      active ? 'text-emerald-600 bg-emerald-50' : 'text-stone-600 hover:bg-stone-100'
    }`}
  >
    <Icon className="w-6 h-6" />
    {label && <span className="text-[10px] font-medium">{label}</span>}
  </m.button>
);

const FloatingActionButton: React.FC<{ icon: any; onClick: () => void }> = ({ icon: Icon, onClick }) => (
  <m.button
    onClick={() => { triggerHaptic(15); onClick(); }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    whileTap={{ scale: 0.9 }}
    className="absolute bottom-24 right-4 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
  >
    <Icon className="w-6 h-6" />
  </m.button>
);

const BottomSheet: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { triggerHaptic(10); onClose(); }}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
        />
        <m.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={sheetSpring}
          className="fixed bottom-0 left-0 right-0 bg-[#FAFAF9] rounded-t-[32px] p-6 z-50 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-white/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-stone-900">{title}</h3>
            <button onClick={() => { triggerHaptic(10); onClose(); }} className="p-2 bg-stone-200/50 hover:bg-stone-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>
          {children}
        </m.div>
      </>
    )}
  </AnimatePresence>
);

const ThemeCard: React.FC<{ name: string; color: string; selected: boolean; onClick: () => void }> = ({ name, color, selected, onClick }) => (
  <m.button
    onClick={() => { triggerHaptic(10); onClick(); }}
    whileTap={{ scale: 0.95 }}
    className={`relative p-4 rounded-2xl border-2 transition-all ${selected ? 'border-emerald-500 shadow-md' : 'border-stone-200/50'}`}
    style={{ backgroundColor: color }}
  >
    <div className="text-xs font-semibold text-white drop-shadow-md">{name}</div>
    {selected && (
      <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
        <Check className="w-4 h-4 text-white" />
      </m.div>
    )}
  </m.button>
);

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'export'>('create');
  const [createSubTab, setCreateSubTab] = useState<'editor' | 'sections'>('editor');
  
  // Data State
  const [markdown, setMarkdown] = useState<string>(SAMPLE_READMES[0].markdown);
  const [theme, setTheme] = useState<string>('scandi-minimal');
  const [variants, setVariants] = useState<VariantMap>({ 'problem-solution': 0, features: 0, stats: 0 });
  const [disabledSections, setDisabledSections] = useState<Record<string, boolean>>({});
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubtitle, setCustomSubtitle] = useState<string>('');
  const [ghMeta, setGhMeta] = useState<GitHubMeta | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [currentFormat, setCurrentFormat] = useState<FormatKey>('mobile');
  
  // Customization State
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [logo, setLogo] = useState<LogoConfig | null>(null);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [animated, setAnimated] = useState<boolean>(false);
  const [compact, setCompact] = useState<boolean>(false);
  const [colorBlindness, setColorBlindness] = useState<ColorBlindnessType>('normal');

  // App Level UI State
  const [history, setHistory] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Modals & Sheets
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showHistorySheet, setShowHistorySheet] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [contrastModalOpen, setContrastModalOpen] = useState(false);

  useEffect(() => {
    const savedHistory = Storage.loadHistory();
    setHistory(savedHistory);
    const lastSession = Storage.loadSession();
    if (lastSession?.markdown) {
      setMarkdown(lastSession.markdown);
      setTheme(lastSession.theme || 'scandi-minimal');
      if (lastSession.showQR !== undefined) setShowQR(lastSession.showQR);
      if (lastSession.qrUrl) setQrUrl(lastSession.qrUrl);
    }
  }, []);

  useEffect(() => {
    Storage.saveSession({ markdown, theme, customTitle, customSubtitle, variants, disabledSections, showQR, qrUrl });
  }, [markdown, theme, customTitle, customSubtitle, variants, disabledSections, showQR, qrUrl]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const parsedDoc = useMemo(() => {
    try { return parseMD(markdown); } catch { return { title: '', subtitle: '', sections: [], badges: [], images: [] }; }
  }, [markdown]);

  const baseSpec = useMemo(() => buildRuleSpec(parsedDoc, variants, ghMeta), [parsedDoc, variants, ghMeta]);

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
    return { ...baseSpec, title: customTitle.trim() || baseSpec.title, subtitle: customSubtitle.trim() || baseSpec.subtitle, sections: filteredSections };
  }, [baseSpec, disabledSections, customTitle, customSubtitle, sectionOrder]);

  const desktopSvgString = useMemo(() => {
    try { return renderSVG(finalSpec, theme, { layout: 'desktop', showQR, qrUrl, logo: logo || undefined, animated, compact }); } 
    catch { return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="300"><text x="50" y="100">Render Error</text></svg>`; }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact]);

  const mobileSvgString = useMemo(() => {
    try { return renderSVG(finalSpec, theme, { layout: 'mobile', showQR, qrUrl, logo: logo || undefined, animated, compact }); } 
    catch { return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><text x="30" y="80">Render Error</text></svg>`; }
  }, [finalSpec, theme, showQR, qrUrl, logo, animated, compact]);

  const handleFetchRepo = async (repoUrl: string) => {
    setIsFetching(true);
    try {
      const { markdown: md, meta } = await fetchGitHubRepo(repoUrl);
      setMarkdown(md);
      setGhMeta(meta);
      setCustomTitle('');
      setCustomSubtitle('');
      setDisabledSections({});
      addToast(`Fetched ${meta.owner}/${meta.repo}`, 'success');
      setActiveTab('preview');
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch repository', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSmartTruncate = () => {
    setMarkdown(smartTrunc(markdown, 3000));
    addToast('Optimized README for infographics', 'success');
  };

  const handleCopySvg = () => {
    const targetSvg = currentFormat === 'mobile' ? mobileSvgString : desktopSvgString;
    navigator.clipboard.writeText(targetSvg);
    setCopied(true);
    addToast('SVG copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = (formatKey: FormatKey = currentFormat) => {
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infographic-${formatKey}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded SVG', 'success');
  };

  const handleDownloadPng = (formatKey: FormatKey = currentFormat) => {
    const format = EXPORT_FORMATS[formatKey] || EXPORT_FORMATS.desktop;
    const targetSvg = formatKey === 'mobile' ? mobileSvgString : desktopSvgString;
    const blob = new Blob([targetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = format.width * scale;
      canvas.height = (format.height === 'auto' ? (img.naturalHeight || 1200) : format.height as number) * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.fillStyle = getTheme(theme).bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / scale, canvas.height / scale);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `infographic-${formatKey}@2x.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast('Exported Retina PNG (@2x)', 'success');
        
        const histItem = { id: Date.now().toString(), timestamp: Date.now(), title: finalSpec.title || 'Untitled', markdown: markdown.substring(0, 50), theme, format: formatKey };
        Storage.saveHistory(histItem);
        setHistory(prev => [histItem, ...prev].slice(0, 10));
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const loadHistoryItem = (item: any) => {
    setTheme(item.theme);
    if (item.format) setCurrentFormat(item.format as FormatKey);
    setShowHistorySheet(false);
    setActiveTab('preview');
    addToast('Loaded from history', 'info');
  };

  useEffect(() => {
    const shortcuts = new KeyboardShortcuts();
    shortcuts.addShortcut({ keys: 'Ctrl+Enter', description: 'Refresh preview', handler: () => setActiveTab('preview'), category: 'general' });
    shortcuts.addShortcut({ keys: 'Ctrl+S', description: 'Export SVG', handler: () => handleDownloadSvg(currentFormat), category: 'export' });
    shortcuts.register();
    return () => shortcuts.unregister();
  }, [currentFormat, desktopSvgString, mobileSvgString, theme]);

  return (
    <LazyMotion features={loadFramerFeatures} strict>
      <div className="min-h-screen bg-[#FAFAF9] text-stone-900 flex flex-col overflow-hidden selection:bg-stone-200 mx-auto max-w-3xl shadow-2xl relative">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-stone-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight">GitInfo</h1>
              <div className="text-[10px] text-stone-500 font-medium">Deterministic Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={HistoryIcon} onClick={() => setShowHistorySheet(true)} />
            <IconButton icon={Palette} onClick={() => setShowThemeSheet(true)} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            
            {/* CREATE TAB */}
            {activeTab === 'create' && (
              <m.div key="create" {...pageTransition} className="h-full overflow-y-auto p-4 space-y-4 pb-24">
                
                {/* Sub-tab Navigation */}
                <div className="flex p-1 bg-stone-100/80 rounded-xl backdrop-blur-md">
                  <button onClick={() => { triggerHaptic(5); setCreateSubTab('editor'); }} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${createSubTab === 'editor' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>
                    <Code className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button onClick={() => { triggerHaptic(5); setCreateSubTab('sections'); }} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${createSubTab === 'sections' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'}`}>
                    <Sliders className="w-3.5 h-3.5" /> Modules
                  </button>
                </div>

                {createSubTab === 'editor' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <GlassCard onClick={() => handleFetchRepo('https://github.com/benneberg/gitinfographics')} className="p-4 flex flex-col items-center text-center hover:bg-white/90">
                        <Github className="w-7 h-7 text-emerald-600 mb-2" />
                        <div className="font-semibold text-sm">Import Repo</div>
                      </GlassCard>
                      <GlassCard onClick={() => { setMarkdown(SAMPLE_READMES[0].markdown); addToast('Loaded template'); }} className="p-4 flex flex-col items-center text-center hover:bg-white/90">
                        <Zap className="w-7 h-7 text-amber-500 mb-2" />
                        <div className="font-semibold text-sm">Quick Start</div>
                      </GlassCard>
                    </div>
                    <GlassCard className="p-4 min-h-[400px]">
                      <MarkdownEditor markdown={markdown} onChange={setMarkdown} parsedDoc={parsedDoc} ghMeta={ghMeta} onSmartTruncate={handleSmartTruncate} />
                    </GlassCard>
                  </div>
                ) : (
                  <GlassCard className="p-4 min-h-[400px]">
                    <SectionControls
                      spec={finalSpec} variants={variants} onVariantChange={(k, v) => setVariants(p => ({...p, [k]: v}))}
                      disabledSections={disabledSections} onToggleSection={(id) => setDisabledSections(p => ({...p, [id]: !p[id]}))}
                      onTitleChange={setCustomTitle} onSubtitleChange={setCustomSubtitle}
                      onMoveSection={(id, dir) => {
                        const arr = [...sectionOrder.length ? sectionOrder : finalSpec.sections.map(s => s.id)];
                        const i = arr.indexOf(id);
                        if (dir === 'up' && i > 0) { [arr[i], arr[i-1]] = [arr[i-1], arr[i]]; setSectionOrder(arr); }
                        if (dir === 'down' && i < arr.length - 1) { [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; setSectionOrder(arr); }
                      }}
                      showQR={showQR} onToggleQR={setShowQR} qrUrl={qrUrl} onQrUrlChange={setQrUrl}
                      logo={logo} onLogoChange={setLogo} onAutoDetectLogo={() => {}}
                      animated={animated} onToggleAnimated={setAnimated} compact={compact} onToggleCompact={setCompact}
                    />
                  </GlassCard>
                )}
              </m.div>
            )}

            {/* PREVIEW TAB */}
            {activeTab === 'preview' && (
              <m.div key="preview" {...pageTransition} className="h-full overflow-y-auto bg-stone-200/50 p-4 pb-24">
                <InfographicCanvas
                  desktopSvgString={desktopSvgString} mobileSvgString={mobileSvgString} themeName={theme}
                  onCopySvg={handleCopySvg} onDownloadSvg={handleDownloadSvg} onDownloadPng={handleDownloadPng}
                  copied={copied} spec={finalSpec} colorBlindness={colorBlindness}
                  onOpenContrastModal={() => setContrastModalOpen(true)} onResetColorBlindness={() => setColorBlindness('normal')}
                />
              </m.div>
            )}

            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <m.div key="export" {...pageTransition} className="h-full overflow-y-auto p-4 space-y-4 pb-24">
                <GlassCard className="p-5">
                  <h3 className="text-sm font-semibold mb-4">Export Configuration</h3>
                  <VisualFormatPicker currentFormat={currentFormat} onFormatChange={(f) => setCurrentFormat(f as FormatKey)} />
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => handleDownloadPng(currentFormat)} className="flex-1 min-h-[48px] bg-stone-900 text-white font-medium text-sm rounded-xl hover:bg-stone-800 transition-colors shadow-md">
                      Download PNG (2x)
                    </button>
                    <button onClick={() => handleDownloadSvg(currentFormat)} className="flex-1 min-h-[48px] bg-white border border-stone-200 text-stone-800 font-medium text-sm rounded-xl hover:bg-stone-50 transition-colors shadow-sm">
                      Download SVG
                    </button>
                  </div>
                </GlassCard>
                
                <GlassCard className="p-4">
                  <button onClick={() => addToast('Link copied to clipboard', 'info')} className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold transition-colors">
                    <Share2 className="w-5 h-5" /> Share Interactive Link
                  </button>
                </GlassCard>
              </m.div>
            )}
            
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white/90 backdrop-blur-xl border-t border-stone-200/50 px-6 py-2 flex items-center justify-around absolute bottom-0 w-full z-30 pb-safe">
          <IconButton icon={FileText} label="Create" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
          <IconButton icon={Eye} label="Preview" active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
          <IconButton icon={Download} label="Export" active={activeTab === 'export'} onClick={() => setActiveTab('export')} />
        </nav>

        {/* Floating Action Button */}
        <AnimatePresence>
          {activeTab === 'preview' && (
            <FloatingActionButton icon={Maximize2} onClick={() => setShowExportSheet(true)} />
          )}
        </AnimatePresence>

        {/* --- Bottom Sheets --- */}
        <BottomSheet isOpen={showThemeSheet} onClose={() => setShowThemeSheet(false)} title="Color Themes">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(THEMES).map(([id, t]) => (
              <ThemeCard key={id} name={t.name} color={t.bg} selected={theme === id} onClick={() => setTheme(id)} />
            ))}
          </div>
        </BottomSheet>

        <BottomSheet isOpen={showExportSheet} onClose={() => setShowExportSheet(false)} title="Quick Export">
          <div className="space-y-3">
            <button onClick={() => { handleDownloadPng(currentFormat); setShowExportSheet(false); }} className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
              Save to Photos (PNG)
            </button>
            <button onClick={() => { handleDownloadSvg(currentFormat); setShowExportSheet(false); }} className="w-full p-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-semibold transition-colors">
              Save Source (SVG)
            </button>
            <button onClick={() => { handleCopySvg(); setShowExportSheet(false); }} className="w-full p-4 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-semibold transition-colors">
              Copy to Clipboard
            </button>
          </div>
        </BottomSheet>

        <BottomSheet isOpen={showHistorySheet} onClose={() => setShowHistorySheet(false)} title="Recent Generations">
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-stone-500 py-8 text-sm bg-stone-50 rounded-xl border border-stone-200 border-dashed">No history yet. Export a file to save it here.</div>
            ) : (
              history.map((item) => (
                <GlassCard key={item.id} onClick={() => loadHistoryItem(item)} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-white/90">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden" style={{ backgroundColor: THEMES[item.theme]?.bg || '#fff' }}>
                    <span className="text-[8px] font-mono text-stone-500 opacity-50 block rotate-45">SVG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-stone-800">{item.title}</div>
                    <div className="text-xs text-stone-500 flex gap-2 mt-1">
                      <span className="capitalize">{item.theme}</span> • <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
            {history.length > 0 && (
              <button onClick={() => Storage.clearHistory()} className="w-full py-3 mt-4 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-semibold">
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            )}
          </div>
        </BottomSheet>

        {/* Existing Legacy Modals triggered conditionally */}
        <ContrastModal isOpen={contrastModalOpen} onClose={() => setContrastModalOpen(false)} currentTheme={getTheme(theme)} colorBlindness={colorBlindness} onColorBlindnessChange={setColorBlindness} />
        <ShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />
        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      </div>
    </LazyMotion>
  );
}
