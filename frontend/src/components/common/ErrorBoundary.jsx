import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
          <div className="max-w-md w-full text-center card p-8 space-y-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                We've encountered an unexpected error. Don't worry, your data is safe.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary justify-center"
              >
                Refresh Page
              </button>
              <Link to="/" className="btn-secondary justify-center">
                Back to Home
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left">
                <p className="text-xs font-mono text-gray-400 uppercase mb-2">Technical Details</p>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-32">
                   <code className="text-[10px] text-red-500">Check console for details</code>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
