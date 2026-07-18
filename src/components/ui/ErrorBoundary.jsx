import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-white p-6">
                    <div className="text-center max-w-md">
                        <h2 className="text-3xl font-serif text-slate-900 mb-4">Възникна грешка</h2>
                        <p className="text-slate-600 mb-8">
                            Съжаляваме, нещо се обърка. Моля, опитайте да презаредите страницата или се върнете към началото.
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-4 bg-brand-primary text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all shadow-lg"
                        >
                            Към началната страница
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
