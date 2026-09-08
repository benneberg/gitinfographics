import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by GitInfoGraphics ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-100 dark:bg-stone-950 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 shadow-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              GitInfoGraphics encountered an unexpected rendering error. Your project data is safely stored in local state.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-left overflow-auto max-h-32 text-xs font-mono text-stone-700 dark:text-stone-300">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <button
                id="btn-error-boundary-reload"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-white transition shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
