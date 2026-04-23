import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    resetKey?: string;
    children: ReactNode;
}

interface State {
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidUpdate(prevProps: Props) {
        if (
            this.state.error &&
            prevProps.resetKey !== this.props.resetKey
        ) {
            this.setState({ error: null });
        }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    render() {
        const { error } = this.state;

        if (!error) {
            return this.props.children;
        }

        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-600/5 p-6 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/25 bg-red-600/10">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <h2 className="mb-1 text-base font-semibold text-slate-100">
                        页面渲染出错
                    </h2>
                    <p className="mb-4 text-xs text-slate-500">
                        请刷新页面重试，若问题持续请联系管理员。
                    </p>
                    <pre className="mb-4 max-h-32 overflow-auto rounded-lg border border-red-500/10 bg-black/30 p-3 text-left text-[10px] text-red-300/80">
                        {error.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-600/15 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-600/25"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        刷新页面
                    </button>
                </div>
            </div>
        );
    }
}
