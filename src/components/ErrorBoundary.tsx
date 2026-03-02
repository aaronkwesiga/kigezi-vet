import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t, Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundaryClass extends Component<Props & { lang: Language }, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-destructive/5 via-background to-background p-4">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-border/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-destructive/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative z-10">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10">
                                <AlertCircle className="h-10 w-10 text-destructive" />
                            </div>

                            <h1 className="text-3xl font-black text-foreground mb-4">
                                {t('error.title', this.props.lang)}
                            </h1>
                            <p className="text-muted-foreground font-medium mb-10 leading-relaxed">
                                {t('error.subtitle', this.props.lang)}
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest shadow-xl shadow-destructive/20 gap-2"
                                >
                                    <RefreshCcw className="h-5 w-5" />
                                    {t('error.refresh', this.props.lang)}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = '/'}
                                    className="h-14 rounded-2xl border-border/50 text-foreground font-black uppercase tracking-widest gap-2"
                                >
                                    <Home className="h-5 w-5" />
                                    {t('error.backHome', this.props.lang)}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper to use context in class component (simple approach)
const ErrorBoundary = ({ children }: Props) => {
    const { lang } = useLanguage();
    return (
        <ErrorBoundaryClass lang={lang}>
            {children}
        </ErrorBoundaryClass>
    );
};

export default ErrorBoundary;
