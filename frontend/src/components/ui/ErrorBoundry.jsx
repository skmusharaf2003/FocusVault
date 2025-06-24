// src/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null, errorInfo: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                    <h1 className="text-lg font-bold text-red-800 dark:text-red-200">Something went wrong.</h1>
                    <p className="text-red-600 dark:text-red-300">{this.state.error?.message}</p>
                    <pre className="text-sm text-red-600 dark:text-red-300">{this.state.errorInfo?.componentStack}</pre>
                    <button
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;