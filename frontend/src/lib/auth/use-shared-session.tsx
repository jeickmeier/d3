// This is a new file providing a centralised session provider and hook.
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth/auth-client";

// -------- Types ---------

// The type returned by `authClient.getSession()` (data portion)
export type SessionData = Awaited<
  ReturnType<typeof authClient.getSession>
>["data"];

// Shape of the context state
interface LoadingState {
  status: "loading";
}

interface ErrorState {
  status: "error";
  error: unknown;
}

interface ReadyState {
  status: "ready";
  data: SessionData;
}

type SessionState = LoadingState | ErrorState | ReadyState;

// -------- Context ---------

const SessionContext = createContext<SessionState>({ status: "loading" });

// -------- Provider --------

export function SharedSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      try {
        const { data } = await authClient.getSession();
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: "error", error: err });
        }
      }
    }

    void fetchOnce();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
  );
}

// -------- Hook --------

export function useSharedSession() {
  return useContext(SessionContext);
}
