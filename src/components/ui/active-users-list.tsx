import {
  DEFAULT_HEARTBEAT_CONFIG,
  Presence,
  PresenceState,
} from '../../lib/collaboration';

import { cn } from '../../lib/utils';

interface ActiveUsersListProps {
  className?: string;
  presence: PresenceState;
}

export function ActiveUsersList({ className, presence }: ActiveUsersListProps) {
  // Filter and sort users
  const usersIter = Object.entries(presence as Record<string, Presence>)
    .filter(([_, user]) => {
      // Filter out stale users and those whose last activity is too old
      const timeSinceLastActive = Date.now() - user.lastActive;
      return (
        timeSinceLastActive <=
        DEFAULT_HEARTBEAT_CONFIG.interval + DEFAULT_HEARTBEAT_CONFIG.retryDelay
      );
    })
    .map(([id, user]) => ({
      id,
      user,
      isNew: false,
    }))
    .sort((a, b) => b.user.lastActive - a.user.lastActive); // Most recently active first

  // Always render the container, even with no users
  // This prevents layout shifts and maintains component presence
  return (
    <div
      className={cn(
        'flex min-h-[48px] min-w-[48px] items-center gap-2 rounded-lg bg-white/50 p-2 shadow-sm backdrop-blur-sm',
        'transform transition-all duration-300 ease-in-out',
        usersIter.length === 0
          ? 'scale-95 opacity-50'
          : 'scale-100 opacity-100',
        className
      )}
      data-testid="active-users-list"
    >
      <div className="flex min-w-[32px] -space-x-2 transition-all duration-300 ease-in-out">
        {usersIter.map(({ id, user, isNew }) => (
          <div
            key={id}
            className={cn(
              'relative inline-block transform transition-all duration-300 ease-in-out',
              isNew && 'translate-y-4 opacity-0',
              'hover:z-10 hover:-translate-y-1 hover:scale-110',
              user.activeCell && 'ring-offset-2'
            )}
            title={`${user.name}${
              user.activeCell ? ` (${user.activeCell})` : ''
            }`}
          >
            <img
              src={user.photoUrl}
              alt={user.name}
              className={cn(
                'h-10 w-10 rounded-full ring-2 ring-white transition-all duration-300 ease-in-out',
                user.activeCell && 'ring-blue-500 ring-offset-2'
              )}
            />
            {user.activeCell && (
              <span
                className={cn(
                  'absolute right-0 bottom-0 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white',
                  'transform transition-all duration-300 ease-in-out',
                  'animate-pulse'
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="transition-all duration-300 ease-in-out">
        {usersIter.length > 0 && (
          <span className="text-sm text-gray-600 transition-all duration-300">
            {usersIter.length}
          </span>
        )}
      </div>
    </div>
  );
}
