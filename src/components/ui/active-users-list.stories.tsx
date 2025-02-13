import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveUsersList, DisplayPresenceHook } from "./active-users-list";
import type {
  Presence,
  PresenceEvent,
  PresenceEventType,
  PresenceState,
  PresenceSubscriber,
} from "../../lib/collaboration";

type StoryProps = {
  className?: string;
  sheetId: string;
  usePresenceHook: DisplayPresenceHook;
  initialUsers?: Array<{
    id: string;
    data: Partial<Omit<Presence, "updateType" | "lastActive">>;
  }>;
};

// Create a mock hook factory for stories
const usePresenceMock = () => {
  const [presence, setPresence] = useState<PresenceState>({});
  const subscribers = useRef<Set<PresenceSubscriber>>(new Set());

  const subscribeToPresence = useCallback(
    (s: PresenceSubscriber, eventTypes?: PresenceEventType[]) => {
      const wrappedSubscriber: PresenceSubscriber = (event) => {
        if (!eventTypes || eventTypes.includes(event.type)) {
          s(event);
        }
      };

      subscribers.current.add(wrappedSubscriber);
      return () => {
        subscribers.current.delete(wrappedSubscriber);
      };
    },
    []
  );
  const emitPresenceEvent = useCallback((event: PresenceEvent) => {
    subscribers.current.forEach((s) => {
      try {
        s(event);
      } catch (error) {
        console.error("Error in presence subscriber:", error);
      }
    });
  }, []);
  const usePresence = useCallback(
    (_: string) => ({
      presence,
      subscribeToPresence,
    }),
    [presence, subscribeToPresence]
  );
  return { usePresence, setPresence, emitPresenceEvent };
};

const meta = {
  title: "UI/ActiveUsersList",
  component: ActiveUsersList,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story, context) => {
      const { usePresence, setPresence, emitPresenceEvent } = usePresenceMock();
      const { presence } = usePresence("");
      const [userCounter, setUserCounter] = useState(0);

      const addUser = useCallback(() => {
        const userId = `user${userCounter+1}`;
        const newUser = {
          name: `User ${userCounter+1}`,
          photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          activeCell: null,
          lastActive: Date.now(),
          updateType: "state_change" as const,
        };
        setPresence((prev) => ({
          ...prev,
          [userId]: newUser,
        }));
        setUserCounter((v) => v + 1);
        emitPresenceEvent({
          type: "joined",
          userId,
          presence: newUser,
          timestamp: Date.now(),
        });
      }, [userCounter, setPresence, emitPresenceEvent]);

      const removeUser = useCallback(() => {
        const users = Object.entries(presence);
        if (users.length === 0) return;

        const [userId, userData] = users[users.length - 1];
        setPresence((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        setUserCounter((v) => v - 1);
        emitPresenceEvent({
          type: "left",
          userId,
          presence: userData,
          timestamp: Date.now(),
        });
      }, [presence, setPresence, emitPresenceEvent]);

      const updateUser = useCallback(() => {
        const users = Object.entries(presence);
        if (users.length === 0) return;

        const [userId, userData] = users[users.length - 1];
        const updatedUser = {
          ...userData,
          lastActive: Date.now(),
          updateType: "heartbeat" as const,
        };
        setPresence((prev) => ({
          ...prev,
          [userId]: updatedUser,
        }));
        emitPresenceEvent({
          type: "updated",
          userId,
          presence: updatedUser,
          timestamp: Date.now(),
        });
      }, [presence, setPresence, emitPresenceEvent]);

      const toggleCell = useCallback(() => {
        const users = Object.entries(presence);
        if (users.length === 0) return;

        const [userId, userData] = users[users.length - 1];
        const cells = ["A1", "B2", "C3", null];
        const currentIndex = cells.indexOf(userData.activeCell);
        const nextCell = cells[(currentIndex + 1) % cells.length];

        const updatedUser = {
          ...userData,
          activeCell: nextCell,
          lastActive: Date.now(),
          updateType: "state_change" as const,
        };
        setPresence((prev) => ({
          ...prev,
          [userId]: updatedUser,
        }));
        emitPresenceEvent({
          type: "updated",
          userId,
          presence: updatedUser,
          timestamp: Date.now(),
        });
      }, [presence, setPresence, emitPresenceEvent]);

      
      // Initialize presence state
      useEffect(() => {
        const args = context.args as StoryProps;
        if (args.initialUsers) {
          const newPresence: PresenceState = {};
          args.initialUsers.forEach((user) => {
            newPresence[user.id] = {
              name: user.data.name || "Test User",
              photoUrl: user.data.photoUrl || "https://via.placeholder.com/40",
              activeCell: user.data.activeCell || null,
              lastActive: Date.now(),
              updateType: "state_change",
            };
          });
          setUserCounter(args.initialUsers.length);
          setPresence(newPresence);
        }
      }, [context.args]);

      return (
        <div data-testid="active-users-list-story" className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={addUser}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add User
            </button>
            <button
              onClick={removeUser}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove User
            </button>
            <button
              onClick={updateUser}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Update User
            </button>
            <button
              onClick={toggleCell}
              className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Cell
            </button>
          </div>
          <Story args={{ ...context.args, usePresenceHook: usePresence }} />
        </div>
      );
    },
  ],
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

// Interactive story with control buttons
export const SingleUser: Story = {
  args: {
    initialUsers: [
      {
        id: "user1",
        data: {
          name: "Alice",
          photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          activeCell: null,
        },
      },
    ],
  },
};

// Story demonstrating multiple users with active cells
export const MultipleUsersWithActiveCells: Story = {
  args: {
    initialUsers: [
      {
        id: "user1",
        data: {
          name: "Alice",
          photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          activeCell: "A1",
        },
      },
      {
        id: "user2",
        data: {
          name: "Bob",
          photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
          activeCell: "B2",
        },
      },
      {
        id: "user3",
        data: {
          name: "Charlie",
          photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
          activeCell: "C3",
        },
      },
    ],
  },
};

// Story demonstrating empty state
export const EmptyState: Story = {
  args: {
    initialUsers: [],
  },
};
