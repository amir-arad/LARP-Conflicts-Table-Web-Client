import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  connectionManager,
  realtimeDB,
  setupDisconnectCleanup,
} from "../lib/firebase";
import {
  CollaborationProvider,
  useCollaboration,
} from "./CollaborationContext";

import { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";

// Mock Firebase modules
vi.mock("../lib/firebase", () => ({
  connectionManager: {
    monitorConnection: vi.fn((callback) => {
      callback(true);
      return () => {};
    }),
    setupPresenceHeartbeat: vi.fn(() => vi.fn()),
  },
  realtimeDB: {
    presence: {
      subscribeToPresence: vi.fn(() => vi.fn()),
    },
    locks: {
      subscribeToCellLocks: vi.fn(() => vi.fn()),
    },
  },
  setupDisconnectCleanup: vi.fn(() => Promise.resolve()),
  getDatabaseRef: vi.fn(() => ({
    // Mock DatabaseReference object
    key: "mock-key",
    path: "mock-path",
  })),
}));

// Mock Google Auth
vi.mock("./AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: () => ({
    isReady: true,
    access_token: "mock-token",
  }),
}));

describe("CollaborationContext", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider clientId="mock-client-id">
      <CollaborationProvider>{children}</CollaborationProvider>
    </AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register presence successfully", async () => {
    const { result } = renderHook(() => useCollaboration("test-sheet"), {
      wrapper,
    });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    await act(async () => {
      await result.current.registerPresence(presenceData);
    });

    const expectedUserId = `user-${btoa("mock-token").slice(0, 8)}`;
    expect(connectionManager.setupPresenceHeartbeat).toHaveBeenCalledWith(
      "test-sheet",
      expectedUserId,
      presenceData,
      {
        interval: 30000,
        maxRetries: 3,
        retryDelay: 5000,
      },
      expect.any(Function)
    );
  });

  it("should fail presence registration without namespace", async () => {
    const { result } = renderHook(() => useCollaboration(""), { wrapper });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    await expect(
      act(async () => {
        await result.current.registerPresence(presenceData);
      })
    ).rejects.toThrow("No active namespace");
  });

  it("should handle heartbeat error", async () => {
    const { result } = renderHook(() => useCollaboration("test-sheet"), {
      wrapper,
    });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    const onError = vi.fn();
    let heartbeatErrorCallback: ((error: any) => void) | undefined;

    (
      connectionManager.setupPresenceHeartbeat as ReturnType<typeof vi.fn>
    ).mockImplementationOnce((_, __, ___, ____, onError) => {
      heartbeatErrorCallback = onError;
      return vi.fn();
    });

    await act(async () => {
      await result.current.registerPresence(presenceData, { onError });
    });

    const heartbeatError = {
      code: "HEARTBEAT_FAILED",
      message: "Failed to update presence",
      details: new Error("Network error"),
      timestamp: Date.now(),
      retryCount: 1,
    };

    act(() => {
      heartbeatErrorCallback?.(heartbeatError);
    });

    expect(onError).toHaveBeenCalledWith({
      code: "HEARTBEAT_FAILED",
      message: heartbeatError.message,
      details: heartbeatError.details,
    });
  });

  it("should handle presence registration error", async () => {
    const mockError = new Error("Registration failed");
    (
      connectionManager.setupPresenceHeartbeat as ReturnType<typeof vi.fn>
    ).mockImplementationOnce(() => {
      throw mockError;
    });

    const { result } = renderHook(() => useCollaboration("test-sheet"), {
      wrapper,
    });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    const onError = vi.fn();

    await expect(
      act(async () => {
        await result.current.registerPresence(presenceData, { onError });
      })
    ).rejects.toThrow("Failed to register presence");

    expect(onError).toHaveBeenCalledWith({
      code: "REGISTRATION_FAILED",
      message: "Failed to register presence",
      details: mockError,
    });
  });

  it("should cleanup presence on unmount", async () => {
    const cleanup = vi.fn();
    (
      connectionManager.setupPresenceHeartbeat as ReturnType<typeof vi.fn>
    ).mockReturnValueOnce(cleanup);

    const { result, unmount } = renderHook(
      () => useCollaboration("test-sheet"),
      { wrapper }
    );

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    await act(async () => {
      await result.current.registerPresence(presenceData);
    });

    unmount();

    expect(cleanup).toHaveBeenCalled();
  });

  it("should handle cleanup error", async () => {
    const cleanup = vi.fn();
    (
      connectionManager.setupPresenceHeartbeat as ReturnType<typeof vi.fn>
    ).mockReturnValueOnce(cleanup);

    const { result } = renderHook(() => useCollaboration("test-sheet"), {
      wrapper,
    });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    await act(async () => {
      await result.current.registerPresence(presenceData);
    });
    cleanup.mockImplementationOnce(() => {
      throw new Error("Cleanup failed");
    });
    await expect(async () => {
      await act(async () => {
        await result.current.unregisterPresence();
      });
    }).rejects.toThrow("Failed to cleanup presence");
  });

  describe("Presence Subscription Handlers", () => {
    let presenceCallback: (data: any) => void;

    beforeEach(() => {
      (
        realtimeDB.presence.subscribeToPresence as ReturnType<typeof vi.fn>
      ).mockImplementation((_, callback) => {
        presenceCallback = callback;
        return vi.fn();
      });
    });

    it("should emit 'joined' event when a new user joins", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onPresenceEvent = vi.fn();

      // Subscribe to presence events
      act(() => {
        result.current.subscribeToPresence(onPresenceEvent, ["joined"]);
      });

      // Simulate a new user joining
      const newUser = {
        name: "New User",
        photoUrl: "new-photo.jpg",
        lastActive: Date.now(),
      };

      act(() => {
        presenceCallback({ "user-123": newUser });
      });

      expect(onPresenceEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "joined",
          userId: "user-123",
          presence: newUser,
          timestamp: expect.any(Number),
        })
      );
    });

    it("should emit 'left' event when a user leaves", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onPresenceEvent = vi.fn();

      // Subscribe to presence events
      act(() => {
        result.current.subscribeToPresence(onPresenceEvent, ["left"]);
      });

      // Simulate initial presence
      const user = {
        name: "Test User",
        photoUrl: "test-photo.jpg",
        lastActive: Date.now(),
      };

      act(() => {
        presenceCallback({ "user-123": user });
      });

      // Simulate user leaving
      act(() => {
        presenceCallback({});
      });

      expect(onPresenceEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "left",
          userId: "user-123",
          presence: user,
          timestamp: expect.any(Number),
        })
      );
    });

    it("should emit 'updated' event when user presence changes", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onPresenceEvent = vi.fn();

      // Subscribe to presence events
      act(() => {
        result.current.subscribeToPresence(onPresenceEvent, ["updated"]);
      });

      // Simulate initial presence
      const initialUser = {
        name: "Test User",
        photoUrl: "test-photo.jpg",
        lastActive: Date.now(),
      };

      act(() => {
        presenceCallback({ "user-123": initialUser });
      });

      // Simulate user update
      const updatedUser = {
        ...initialUser,
        activeCell: "A1",
      };

      act(() => {
        presenceCallback({ "user-123": updatedUser });
      });

      expect(onPresenceEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "updated",
          userId: "user-123",
          presence: updatedUser,
          timestamp: expect.any(Number),
        })
      );
    });

    it("should filter events based on subscribed types", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onPresenceEvent = vi.fn();

      // Subscribe only to 'joined' events
      act(() => {
        result.current.subscribeToPresence(onPresenceEvent, ["joined"]);
      });

      const user = {
        name: "Test User",
        photoUrl: "test-photo.jpg",
        lastActive: Date.now(),
      };

      // Simulate join
      act(() => {
        presenceCallback({ "user-123": user });
      });

      // Simulate update
      act(() => {
        presenceCallback({ "user-123": { ...user, activeCell: "A1" } });
      });

      // Simulate leave
      act(() => {
        presenceCallback({});
      });

      // Should only receive the 'joined' event
      expect(onPresenceEvent).toHaveBeenCalledTimes(1);
      expect(onPresenceEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "joined",
        })
      );
    });

    it("should handle multiple subscribers", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onJoinedEvent = vi.fn();
      const onLeftEvent = vi.fn();

      // Subscribe to different event types
      act(() => {
        result.current.subscribeToPresence(onJoinedEvent, ["joined"]);
        result.current.subscribeToPresence(onLeftEvent, ["left"]);
      });

      const user = {
        name: "Test User",
        photoUrl: "test-photo.jpg",
        lastActive: Date.now(),
      };

      // Simulate join
      act(() => {
        presenceCallback({ "user-123": user });
      });

      // Simulate leave
      act(() => {
        presenceCallback({});
      });

      expect(onJoinedEvent).toHaveBeenCalledTimes(1);
      expect(onLeftEvent).toHaveBeenCalledTimes(1);
    });

    it("should cleanup subscribers on unsubscribe", async () => {
      const { result } = renderHook(() => useCollaboration("test-sheet"), {
        wrapper,
      });
      const onPresenceEvent = vi.fn();

      // Subscribe and store unsubscribe function
      let unsubscribe: (() => void) | undefined;
      act(() => {
        unsubscribe = result.current.subscribeToPresence(onPresenceEvent);
      });

      const user = {
        name: "Test User",
        photoUrl: "test-photo.jpg",
        lastActive: Date.now(),
      };

      // Simulate event before unsubscribe
      act(() => {
        presenceCallback({ "user-123": user });
      });

      expect(onPresenceEvent).toHaveBeenCalledTimes(1);

      // Unsubscribe
      act(() => {
        unsubscribe?.();
      });

      // Simulate event after unsubscribe
      act(() => {
        presenceCallback({ "user-123": { ...user, activeCell: "A1" } });
      });

      // Should not receive events after unsubscribe
      expect(onPresenceEvent).toHaveBeenCalledTimes(1);
    });
  });

  it("should subscribe to presence updates", () => {
    renderHook(() => useCollaboration("test-sheet"), { wrapper });

    expect(realtimeDB.presence.subscribeToPresence).toHaveBeenCalledWith(
      "test-sheet",
      expect.any(Function)
    );
  });

  it("should subscribe to lock updates", () => {
    renderHook(() => useCollaboration("test-sheet"), { wrapper });

    expect(realtimeDB.locks.subscribeToCellLocks).toHaveBeenCalledWith(
      "test-sheet",
      expect.any(Function)
    );
  });

  it("should setup auto-disconnect cleanup", async () => {
    const { result } = renderHook(() => useCollaboration("test-sheet"), {
      wrapper,
    });

    const presenceData = {
      name: "Test User",
      photoUrl: "test-photo.jpg",
      lastActive: Date.now(),
    };

    await act(async () => {
      await result.current.registerPresence(presenceData);
    });

    expect(setupDisconnectCleanup).toHaveBeenCalledWith(
      expect.any(Object),
      null
    );
  });
});
