import React, { useState } from 'react';
import {
  Sparkles,
  Github,
  Palette,
  Download,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Layers
} from 'lucide-react';
import { triggerHaptic } from '../../ui/haptics';

interface MobileCoachMarksProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor?: () => void;
  onOpenStyle?: () => void;
  onOpenExport?: () => void;
}

interface CoachStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  actionText: string;
}

const COACH_STEPS: CoachStep[] = [
  {
    title: '👋 Welcome to GitInfoGraphics!',
    subtitle: 'README vector infographics for developers',
    description:
      'Turn messy GitHub markdown into publication-ready SVG cards designed for repository headers, documentation, and social sharing.',
    icon: Layers,
    iconBg: 'bg-stone-900 text-white',
    actionText: 'Next: Adding Repositories',
  },
  {
    title: '1. Paste GitHub URL or Choose a Sample',
    subtitle: 'Instant parsing & metric extraction',
    description:
      'Tap "Edit" at the bottom to paste your GitHub repository URL or choose a preset sample. Problems, solutions, stats, and tech stacks are extracted automatically.',
    icon: Github,
    iconBg: 'bg-stone-800 text-white',
    actionText: 'Next: Live Vector Preview',
  },
  {
    title: '2. Live Vector Preview Area',
    subtitle: '100% deterministic SVG rendering',
    description:
      'Your infographic renders instantly on the main screen. Double-tap the graphic at any time to quickly copy its SVG XML code!',
    icon: Sparkles,
    iconBg: 'bg-emerald-600 text-white',
    actionText: 'Next: Themes & Sections',
  },
  {
    title: '3. Swipe Themes & Customize Sections',
    subtitle: 'Nordic minimalist aesthetics',
    description:
      'Head over to "Style" or swipe across the canvas to switch between Scandinavian Light, Midnight Cyber, and more. Accordion controls let you reorder or toggle sections with 1 tap.',
    icon: Palette,
    iconBg: 'bg-amber-500 text-white',
    actionText: 'Next: High-Res Export',
  },
  {
    title: '4. Download High-Res PNG or Vector SVG',
    subtitle: 'Tailored for GitHub and social feeds',
    description:
      'Use the "Export" tab or the floating action button (FAB) to download razor-sharp @2x Retina PNGs, SVGs, or copy markdown embed codes for your README.',
    icon: Download,
    iconBg: 'bg-sky-600 text-white',
    actionText: "✅ Got It, Let's Build!",
  },
];

export const MobileCoachMarks: React.FC<MobileCoachMarksProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = COACH_STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === COACH_STEPS.length - 1;

  const handleNext = () => {
    triggerHaptic(12);
    if (isLast) {
      try {
        localStorage.setItem('gitinfographics_mobile_coachmarks', 'true');
      } catch {}
      onClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    triggerHaptic(10);
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic(10);
    try {
      localStorage.setItem('gitinfographics_mobile_coachmarks', 'true');
    } catch {}
    onClose();
  };

  return (
    <div
      id="mobile-onboarding-overlay"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200/80 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200">
        {/* Top bar: Step tracker & close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {COACH_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-stone-900'
                    : i < currentStep
                    ? 'w-2 bg-stone-400'
                    : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Skip tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Graphic & Content */}
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs shrink-0 ${step.iconBg}`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 leading-snug">
                {step.title}
              </h3>
              <p className="text-[11px] font-medium text-stone-500">
                {step.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60">
            {step.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="min-h-[44px] px-3 text-stone-600 hover:text-stone-900 text-xs font-medium rounded-xl flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="min-h-[44px] px-3 text-stone-400 hover:text-stone-600 text-xs font-medium rounded-xl"
            >
              Skip tour
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
          >
            <span>{isLast ? "✅ Got It, Let's Build!" : 'Next'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
