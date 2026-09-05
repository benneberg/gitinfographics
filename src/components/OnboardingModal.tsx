import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Layers,
  FileText,
  Sliders,
  Terminal,
  Sparkles,
  GitBranch,
  Eye,
  CheckCircle2,
  Monitor
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface StepData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
  actionLabel: string;
  previewNode: React.ReactNode;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const steps: StepData[] = [
    {
      id: 0,
      tag: 'Step 1 of 4 • Overview',
      title: 'Meet GitInfoGraphics',
      subtitle: 'Transform repository READMEs into clean, publication-ready vector infographics',
      description:
        'Developers digest complex repositories faster through clean visual architecture. GitInfoGraphics turns raw GitHub markdown into deterministic, publication-ready SVG cards designed for repository headers, documentation, and release notes.',
      icon: <Layers className="w-5 h-5 text-stone-900" />,
      highlights: [
        '100% Vector SVG output - razor sharp across retina displays and mobile phones',
        'Headless architecture - operates in-browser or inside automated CI/CD pipelines',
        'Automatic metric detection, tech-stack extraction & section categorization'
      ],
      actionLabel: 'Explore Input Methods',
      previewNode: (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-3 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="font-semibold text-stone-900">Repository Overview</span>
            <span className="text-stone-400 text-[11px] font-mono">Vector SVG</span>
          </div>
          <div className="p-3 bg-white border border-stone-200 rounded-lg text-stone-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              SVG
            </div>
            <div>
              <div className="font-semibold text-stone-900">GitInfoGraphics Engine</div>
              <div className="text-[11px] text-stone-500">Autonomous README Tokenizer & Vector Renderer</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 border border-stone-200 rounded-lg bg-white">
              <div className="font-semibold text-stone-900">100%</div>
              <div className="text-stone-500 text-[10px]">Vector</div>
            </div>
            <div className="p-2 border border-stone-200 rounded-lg bg-white">
              <div className="font-semibold text-stone-900">0 Deps</div>
              <div className="text-stone-500 text-[10px]">CI Runner</div>
            </div>
            <div className="p-2 border border-stone-200 rounded-lg bg-white">
              <div className="font-semibold text-stone-900">&lt;50ms</div>
              <div className="text-stone-500 text-[10px]">Render</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 1,
      tag: 'Step 2 of 4 • Inputs',
      title: '3 Ways to Load Data',
      subtitle: 'Type markdown, load curated presets, or fetch any GitHub repository',
      description:
        'You have complete flexibility: write or paste raw README text in the Markdown tab, select from ready-made presets (CLI tools, ML frameworks, REST APIs), or enter an owner/repo to stream live repository stars, forks, and tags.',
      icon: <FileText className="w-5 h-5 text-stone-900" />,
      highlights: [
        'Live Markdown Editor with real-time vector re-compilation',
        '1-Click GitHub API Fetching (with automatic fallback to raw README)',
        'Smart Truncation to optimize long READMEs for visual harmony'
      ],
      actionLabel: 'Customize Sections',
      previewNode: (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs font-sans">
          <div className="text-stone-500 text-[11px] font-medium">Input Telemetry</div>
          <div className="flex items-center gap-2 p-2.5 bg-white border border-stone-200 rounded-lg">
            <span className="text-stone-400 font-mono">&gt;</span>
            <span className="text-stone-600">fetch</span>
            <span className="text-stone-900 font-semibold font-mono">facebook/react</span>
            <span className="ml-auto text-[11px] text-stone-800 font-medium bg-stone-100 px-2 py-0.5 rounded">230k stars</span>
          </div>
          <div className="p-2.5 bg-white border border-stone-200 rounded-lg text-[11px] text-stone-600">
            <span className="font-medium text-stone-900">Detected:</span> 8 Headings, 4 Badges, 12 Tech Tokens, 3 Tables
          </div>
        </div>
      )
    },
    {
      id: 2,
      tag: 'Step 3 of 4 • Controls',
      title: 'Sections, Variants & Themes',
      subtitle: 'Tailor layout variants and toggle content with precision',
      description:
        'Fine-tune the presentation using the Sections panel. Swap between Bento Grids and List layouts, toggle individual sections on or off, edit titles, and select color schemes ranging from calm Scandinavian minimalism to Nordic Birch.',
      icon: <Sliders className="w-5 h-5 text-stone-900" />,
      highlights: [
        'Switch between multiple layout variants (Bento Grid, Compact, Split)',
        'Toggle visibility of metrics, feature highlights, and tech stacks',
        'Instant theme switching with light Scandinavian super-minimalism'
      ],
      actionLabel: 'CI/CD & Mobile Preview',
      previewNode: (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs font-sans">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-stone-600 font-medium">Section: Problem & Solution</span>
            <span className="text-stone-900 font-semibold">Variant [1/2]</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-stone-900 text-white font-medium rounded-lg text-center text-xs">
              Bento Grid
            </div>
            <div className="flex-1 p-2 bg-white border border-stone-200 text-stone-600 font-medium rounded-lg text-center text-xs">
              Split Column
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between p-2 bg-white border border-stone-200 rounded-lg text-[11px]">
            <span className="text-stone-700">Tech Stack Badges</span>
            <span className="text-emerald-700 font-semibold">Enabled</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      tag: 'Step 4 of 4 • Automation',
      title: 'Export & Automate in CI/CD',
      subtitle: 'Embed in README or automate generation via GitHub Actions',
      description:
        'Export SVG or Retina PNG with one click, test how your card scales on mobile devices via our Mobile/Desktop viewport toggle, or add our 0-dependency GitHub Action to automatically regenerate infographic.svg on every push to main!',
      icon: <Terminal className="w-5 h-5 text-stone-900" />,
      highlights: [
        'Desktop & Mobile viewport preview tabs to inspect responsiveness',
        'Copy one-line Markdown embed snippet: `![Infographic](./infographic.svg)`',
        'Includes pre-configured GitHub Actions YAML workflow and Node runner'
      ],
      actionLabel: 'Launch Studio',
      previewNode: (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-2.5 text-xs font-sans">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>GitHub Actions Automation Ready</span>
          </div>
          <code className="p-2 bg-white border border-stone-200 rounded-lg text-[11px] text-stone-700 block font-mono truncate">
            .github/workflows/generate-infographic.yml
          </code>
          <div className="text-[11px] text-stone-500 mt-0.5">
            Embed snippet: <span className="font-mono text-stone-800 bg-white px-1.5 py-0.5 border border-stone-200 rounded">![Infographic](./infographic.svg)</span>
          </div>
        </div>
      )
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('gitinfographics_onboarding_completed', 'true');
      } catch {
        // LocalStorage fallback
      }
    }
    onComplete();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Guide and Onboarding"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* Top Progress & Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-900">
              {current.tag}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Skip and close guide"
            aria-label="Close onboarding guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-stone-100 h-1 flex">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-full transition-colors ${
                idx <= currentStep ? 'bg-stone-900' : 'bg-stone-200 hover:bg-stone-300'
              }`}
              title={`Jump to step ${idx + 1}`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* Header Title Area */}
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-stone-900">
                {current.title}
              </h2>
              <p className="text-xs text-stone-500 font-normal mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {current.description}
          </p>

          {/* Visual Preview Node */}
          <div className="w-full">{current.previewNode}</div>

          {/* Key Feature Highlights */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2">
            <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">
              Key Capabilities
            </span>
            {current.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 select-none min-h-[36px]">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-stone-900 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-xs text-stone-600">
              Don't show again on startup
            </span>
          </label>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="min-h-[38px] px-3.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleFinish}
              className="min-h-[38px] px-3 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-medium transition-colors"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="min-h-[38px] px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
