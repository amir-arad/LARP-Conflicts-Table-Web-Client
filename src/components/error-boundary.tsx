import { Component, ErrorInfo, ReactNode } from 'react';

import { logger } from '../lib/logger';
import { useTranslations } from '../hooks/useTranslations';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  component?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Wrapper to use hooks in class component
const ErrorBoundaryFallback = ({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) => {
  const { t } = useTranslations();

  return (
    <div className="m-4 rounded border border-red-500 bg-red-50 p-4">
      <h2 className="mb-2 text-lg font-semibold text-red-700">
        {t('error.somethingWentWrong')}
      </h2>
      <p className="mb-4 text-red-600">
        {import.meta.env.DEV ? error?.message : t('error.tryAgainLater')}
      </p>
      <button
        onClick={resetError}
        className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
      >
        {t('error.tryAgain')}
      </button>
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error:', error, {
      component: this.props.component,
      additionalInfo: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
