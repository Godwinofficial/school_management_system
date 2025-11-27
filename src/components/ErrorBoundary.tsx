import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 border border-red-100">
                        <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <div className="bg-red-50 p-4 rounded text-sm font-mono text-red-800 overflow-auto max-h-64">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
