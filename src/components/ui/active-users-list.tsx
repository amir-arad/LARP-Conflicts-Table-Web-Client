import { useEffect, useState } from "react";
import { usePresence } from "../../hooks/usePresence";
import { PresenceEvent } from "../../lib/collaboration";
import { cn } from "../../lib/utils";

interface ActiveUsersListProps {
  className?: string;
  sheetId: string;
}

export function ActiveUsersList({ className, sheetId }: ActiveUsersListProps) {
  const { presence, subscribeToPresence } = usePresence(sheetId);
  const [newUsers, setNewUsers] = useState<string[]>([]);

  useEffect(() => {
    const handlePresenceEvent = (event: PresenceEvent) => {
      if (event.type === "joined") {
        setNewUsers((prev) => [...new Set([...prev, event.userId])]);
        setTimeout(
          () => setNewUsers((prev) => prev.filter((id) => id !== event.userId)),
          300
        );
      }
    };

    return subscribeToPresence(handlePresenceEvent, ["joined"]);
  }, [subscribeToPresence]);

  const usersIter = Object.entries(presence).map(([id, user]) => ({
    id,
    user,
    isNew: newUsers.indexOf(id) >= 0,
  }));
  if (usersIter.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm",
        className
      )}
    >
      <div className="flex -space-x-2">
        {usersIter.map(({ id, user, isNew }) => (
          <div
            key={id}
            className={cn(
              "relative inline-block transition-all duration-300 ease-in-out",
              isNew && "translate-y-4 opacity-0",
              "hover:z-10 hover:-translate-y-1"
            )}
            title={user.name}
          >
            <img
              src={user.photoUrl}
              alt={user.name}
              className={cn(
                "h-8 w-8 rounded-full ring-2 ring-white",
                user.activeCell && "ring-blue-500"
              )}
            />
            {user.activeCell && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
            )}
          </div>
        ))}
      </div>
      {usersIter.length > 0 && (
        <span className="text-sm text-gray-600">{usersIter.length}</span>
      )}
    </div>
  );
}
