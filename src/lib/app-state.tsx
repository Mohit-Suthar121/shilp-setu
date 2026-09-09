import * as React from "react";

export type Profile = { name: string; phone: string; lang: string; craft: string; village: string };

type QueueItem = { id: string; label: string; at: string };

type Ctx = {
  ready: boolean;
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  online: boolean;
  toggleOnline: () => void;
  queue: QueueItem[];
  enqueue: (label: string) => void;
  syncNow: () => void;
  syncing: boolean;
  lastSync: string;
  speaking: string | null;
  speak: (t: string) => void;
};

const AppCtx = React.createContext<Ctx | null>(null);

const KEY = "shilpsetu.profile.v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [profile, setProfileState] = React.useState<Profile | null>(null);
  const [online, setOnline] = React.useState(false);
  const [queue, setQueue] = React.useState<QueueItem[]>([
    { id: "q1", label: "Terracotta Diya Set — new listing", at: "09:12" },
    { id: "q2", label: "Order SS-2041 marked packed", at: "10:40" },
  ]);
  const [syncing, setSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState("yesterday, 7:20 PM");
  const [speaking, setSpeaking] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfileState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setProfile = (p: Profile) => {
    setProfileState(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };

  const enqueue = (label: string) =>
    setQueue((q) => [
      ...q,
      {
        id: Math.random().toString(36).slice(2),
        label,
        at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

  const syncNow = () => {
    if (!online || queue.length === 0) return;
    setSyncing(true);
    setTimeout(() => {
      setQueue([]);
      setSyncing(false);
      setLastSync("just now");
    }, 1600);
  };

  const toggleOnline = () => setOnline((o) => !o);

  const speak = (t: string) => {
    setSpeaking(t);
    try {
      const s = window.speechSynthesis;
      if (s) {
        s.cancel();
        s.speak(new SpeechSynthesisUtterance(t));
      }
    } catch {
      /* ignore */
    }
    setTimeout(() => setSpeaking(null), 2600);
  };

  return (
    <AppCtx.Provider
      value={{ ready, profile, setProfile, online, toggleOnline, queue, enqueue, syncNow, syncing, lastSync, speaking, speak }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
