import { ClientLoadStatus, useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { cn } from '../../lib/utils';

export function ConnectionStatusIndicator() {
  const { t } = useTranslations();
  const { clientStatus } = useAuth();

  const isInitializing = clientStatus <= ClientLoadStatus.Initializing_firebase;
  const isConnecting = clientStatus === ClientLoadStatus.Connecting;
  const isConnected = clientStatus === ClientLoadStatus.Ready;
  const hasError = clientStatus === ClientLoadStatus.Error;

  return (
    <div
      className={cn(
        'fixed right-4 bottom-4 flex items-center gap-2 rounded-md p-2 text-sm shadow-md transition-colors',
        {
          'bg-gray-100 text-gray-600': isInitializing,
          'bg-red-100 text-red-600': hasError,
          'bg-green-100 text-green-600': isConnected,
          'bg-yellow-100 text-yellow-600': isConnecting,
        }
      )}
    >
      <div
        className={cn('h-2 w-2 rounded-full', {
          'bg-gray-500': isInitializing,
          'bg-red-500': hasError,
          'bg-green-500': isConnected,
          'bg-yellow-500': isConnecting,
        })}
      />
      <span>
        {isInitializing
          ? t('action.initializing')
          : hasError
            ? t('error.connection')
            : isConnected
              ? t('status.connected')
              : t('status.connecting')}
      </span>
    </div>
  );
}
