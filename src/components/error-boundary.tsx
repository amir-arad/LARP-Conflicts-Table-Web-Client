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
    <div className="p-4 m-4 border border-red-500 rounded bg-red-50">
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        {t('error.somethingWentWrong')}
      </h2>
      <p className="text-red-600 mb-4">
        {import.meta.env.DEV ? error?.message : t('error.tryAgainLater')}
      </p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
