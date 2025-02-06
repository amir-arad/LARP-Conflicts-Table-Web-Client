import {
  CollaborationProvider,
  useCollaboration,
} from "./CollaborationContext";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectionManager, realtimeDB } from "../lib/firebase";

import { AuthProvider } from "./GoogleAuthContext";
import { ReactNode } from "react";

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
}));

// Mock Google Auth
vi.mock("./GoogleAuthContext", () => ({
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

    expect(connectionManager.setupPresenceHeartbeat).toHaveBeenCalledWith(
      "test-sheet",
      expect.any(String),
      presenceData
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
    const cleanup = vi.fn(() => {
      throw new Error("Cleanup failed");
    });
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

    await expect(
      act(async () => {
        await result.current.unregisterPresence();
      })
    ).rejects.toThrow("Failed to cleanup presence");
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
});
