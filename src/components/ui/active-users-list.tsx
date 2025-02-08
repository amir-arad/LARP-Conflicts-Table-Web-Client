import { useEffect, useState } from "react";
import { useCollaboration } from "../../contexts/CollaborationContext";
import { Presence, PresenceEvent } from "../../lib/collaboration";
import { cn } from "../../lib/utils";

interface ActiveUsersListProps {
  className?: string;
  sheetId: string;
}

interface ActiveUser {
  id: string;
  presence: Presence;
  isNew?: boolean;
}

export function ActiveUsersList({ className, sheetId }: ActiveUsersListProps) {
  const { presence, subscribeToPresence } = useCollaboration(sheetId);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  // Convert presence state to sorted array of users
  useEffect(() => {
    const users = Object.entries(presence).map(([id, data]) => ({
      id,
      presence: data,
    }));
    setActiveUsers(users);
  }, [presence]);

  // Handle presence events for animations
  useEffect(() => {
    const handlePresenceEvent = (event: PresenceEvent) => {
      if (event.type === "joined") {
        setActiveUsers((prev) => [
          ...prev,
          { id: event.userId, presence: event.presence, isNew: true },
        ]);
        // Remove isNew flag after animation
        setTimeout(() => {
          setActiveUsers((prev) =>
            prev.map((user) =>
              user.id === event.userId ? { ...user, isNew: false } : user
            )
          );
        }, 300);
      }
    };

    return subscribeToPresence(handlePresenceEvent, ["joined"]);
  }, [subscribeToPresence]);

  if (activeUsers.length === 0) {
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
        {activeUsers.map(({ id, presence: user, isNew }) => (
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
      {activeUsers.length > 0 && (
        <span className="text-sm text-gray-600">
          {activeUsers.length} active {activeUsers.length === 1 ? "user" : "users"}
        </span>
      )}
    </div>
  );
}