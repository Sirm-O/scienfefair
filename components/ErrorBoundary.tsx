import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-200">Something went wrong</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              The KSEF application encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-gray-700 rounded-md text-sm text-red-800 dark:text-red-200 text-left font-mono">
                <div className="font-bold">Error:</div>
                <div>{this.state.error.message}</div>
                {this.state.errorInfo && (
                  <>
                    <div className="font-bold mt-2">Stack:</div>
                    <div className="text-xs">{this.state.errorInfo.componentStack}</div>
                  </>
                )}
              </div>
            )}
            <div className="mt-6 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;