import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in GitInfoGraphics:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('gig-session');
      localStorage.removeItem('gig-history');
    } catch {}
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-stone-50 text-stone-900 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-stone-200 p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-stone-900">Application Error</h1>
                <p className="text-xs text-stone-500">Something interrupted the rendering engine</p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 font-mono text-xs text-stone-700 overflow-x-auto max-h-40">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg text-white bg-stone-900 hover:bg-stone-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Application
              </button>
              <button
                onClick={this.handleHardReset}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                title="Wipe local cached state and reload"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
