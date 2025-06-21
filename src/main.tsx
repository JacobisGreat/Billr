import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Performance tracking
performance.mark('react-start');

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-zinc-50 to-neutral-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 mb-4">Something went wrong</h1>
            <p className="text-zinc-600 mb-6">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-gradient-to-r from-zinc-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-zinc-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create the React root
const root = ReactDOM.createRoot(rootElement);

// Render the app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Mark when React is ready
performance.mark('react-loaded');

// Log performance metrics
if (typeof window !== 'undefined' && window.performance) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        console.log('Performance Metrics:', {
          loadComplete: entry.loadEventEnd - entry.fetchStart,
          domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        });
      }
    }, 0);
  });
} 