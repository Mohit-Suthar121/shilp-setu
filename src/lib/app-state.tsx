import * as React from "react";
import {
  Product,
  PRODUCTS as INITIAL_PRODUCTS,
  ORDERS as INITIAL_ORDERS,
  BULK as INITIAL_BULK,
  MESSAGES as INITIAL_MESSAGES,
  LESSONS as INITIAL_LESSONS,
  BADGES as INITIAL_BADGES,
} from "@/lib/mock";
import { speakText } from "@/lib/voice";

export type Profile = {
  name: string;
  phone: string;
  lang: string;
  craft: string;
  village: string;
  lat?: number;
  lng?: number;
};

export type QueueItem = { id: string; label: string; at: string };

export type Order = (typeof INITIAL_ORDERS)[0] & {
  trackingId?: string;
  packedAt?: string;
};

export type BulkDeal = (typeof INITIAL_BULK)[0] & {
  status?: "pending" | "countered" | "declined" | "accepted";
  counterRate?: number;
};

export type MessageItem = (typeof INITIAL_MESSAGES)[0] & {
  status?: "draft" | "sent";
};

export type LessonItem = (typeof INITIAL_LESSONS)[0];
export type BadgeItem = (typeof INITIAL_BADGES)[0];

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
  stopSpeaking: () => void;
  // Products management
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Orders management
  orders: Order[];
  markOrderPacked: (id: string) => void;
  // Bulk deals management
  bulkDeals: BulkDeal[];
  counterBulkDeal: (id: string, rate: number) => void;
  declineBulkDeal: (id: string) => void;
  // Messages management
  messages: MessageItem[];
  updateMessageDraft: (id: string, draft: string) => void;
  sendMessageReply: (id: string) => void;
  // Lessons & Digital literacy
  lessons: LessonItem[];
  badges: BadgeItem[];
  completeLesson: (id: string) => void;
  // Accessibility & Offline
  bigText: boolean;
  setBigText: (v: boolean) => void;
  voiceFirst: boolean;
  setVoiceFirst: (v: boolean) => void;
  lessonsDownloaded: boolean;
  downloadLessonsOffline: () => Promise<void>;
};

const AppCtx = React.createContext<Ctx | null>(null);

const STORAGE_KEYS = {
  profile: "shilpsetu.profile.v1",
  products: "shilpsetu.products.v1",
  orders: "shilpsetu.orders.v1",
  bulk: "shilpsetu.bulk.v1",
  messages: "shilpsetu.messages.v1",
  lessons: "shilpsetu.lessons.v1",
  badges: "shilpsetu.badges.v1",
  bigText: "shilpsetu.accessibility.bigText",
  voiceFirst: "shilpsetu.accessibility.voiceFirst",
  offlineDownloaded: "shilpsetu.offline.downloaded",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [profile, setProfileState] = React.useState<Profile | null>(null);
  const [online, setOnline] = React.useState(true);
  const [queue, setQueue] = React.useState<QueueItem[]>([
    { id: "q1", label: "Terracotta Diya Set — new listing", at: "09:12" },
    { id: "q2", label: "Order SS-2041 marked packed", at: "10:40" },
  ]);
  const [syncing, setSyncing] = React.useState(false);
  const [lastSync, setLastSync] = React.useState("yesterday, 7:20 PM");
  const [speaking, setSpeaking] = React.useState<string | null>(null);

  // Entities state
  const [products, setProducts] = React.useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = React.useState<Order[]>(INITIAL_ORDERS);
  const [bulkDeals, setBulkDeals] = React.useState<BulkDeal[]>(INITIAL_BULK);
  const [messages, setMessages] = React.useState<MessageItem[]>(INITIAL_MESSAGES);
  const [lessons, setLessons] = React.useState<LessonItem[]>(INITIAL_LESSONS);
  const [badges, setBadges] = React.useState<BadgeItem[]>(INITIAL_BADGES);

  // Settings
  const [bigText, setBigTextState] = React.useState(false);
  const [voiceFirst, setVoiceFirstState] = React.useState(true);
  const [lessonsDownloaded, setLessonsDownloaded] = React.useState(false);

  // Initialize and load persisted data
  React.useEffect(() => {
    try {
      const rawProfile = localStorage.getItem(STORAGE_KEYS.profile);
      if (rawProfile) setProfileState(JSON.parse(rawProfile));

      const rawProducts = localStorage.getItem(STORAGE_KEYS.products);
      if (rawProducts) setProducts(JSON.parse(rawProducts));

      const rawOrders = localStorage.getItem(STORAGE_KEYS.orders);
      if (rawOrders) setOrders(JSON.parse(rawOrders));

      const rawBulk = localStorage.getItem(STORAGE_KEYS.bulk);
      if (rawBulk) setBulkDeals(JSON.parse(rawBulk));

      const rawMessages = localStorage.getItem(STORAGE_KEYS.messages);
      if (rawMessages) setMessages(JSON.parse(rawMessages));

      const rawLessons = localStorage.getItem(STORAGE_KEYS.lessons);
      if (rawLessons) setLessons(JSON.parse(rawLessons));

      const rawBadges = localStorage.getItem(STORAGE_KEYS.badges);
      if (rawBadges) setBadges(JSON.parse(rawBadges));

      const rawBig = localStorage.getItem(STORAGE_KEYS.bigText);
      if (rawBig !== null) {
        const isBig = JSON.parse(rawBig);
        setBigTextState(isBig);
        if (isBig) document.documentElement.classList.add("large-ui");
      }

      const rawVoice = localStorage.getItem(STORAGE_KEYS.voiceFirst);
      if (rawVoice !== null) setVoiceFirstState(JSON.parse(rawVoice));

      const rawOffline = localStorage.getItem(STORAGE_KEYS.offlineDownloaded);
      if (rawOffline !== null) setLessonsDownloaded(JSON.parse(rawOffline));

      // Network detection
      if (typeof navigator !== "undefined" && "onLine" in navigator) {
        setOnline(navigator.onLine);
      }
    } catch (e) {
      console.warn("Could not load stored app state:", e);
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setReady(true);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setProfile = (p: Profile) => {
    setProfileState(p);
    try {
      localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };

  const setBigText = (v: boolean) => {
    setBigTextState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.bigText, JSON.stringify(v));
      if (v) {
        document.documentElement.classList.add("large-ui");
      } else {
        document.documentElement.classList.remove("large-ui");
      }
    } catch {
      /* ignore */
    }
  };

  const setVoiceFirst = (v: boolean) => {
    setVoiceFirstState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.voiceFirst, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  };

  const downloadLessonsOffline = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLessonsDownloaded(true);
        try {
          localStorage.setItem(STORAGE_KEYS.offlineDownloaded, "true");
        } catch {
          /* ignore */
        }
        enqueue("6 Lessons & voice assets downloaded offline");
        resolve();
      }, 1500);
    });
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
      // Mark pending sync items in products as Live
      setProducts((current) => {
        const updated = current.map((p) =>
          p.status === "Pending sync" ? { ...p, status: "Live" as const } : p,
        );
        try {
          localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });

      setQueue([]);
      setSyncing(false);
      setLastSync("just now");
    }, 1200);
  };

  const toggleOnline = () => setOnline((o) => !o);

  const stopSpeaking = () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(null);
  };

  const speak = (t: string) => {
    if (speaking === t) {
      stopSpeaking();
      return;
    }
    setSpeaking(t);
    speakText(t, profile?.lang || "hi", () => {
      setSpeaking(null);
    });
  };

  // Products CRUD
  const addProduct = (p: Product) => {
    setProducts((prev) => {
      const next = [p, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    enqueue(`${p.name} — new listing`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    enqueue(`Updated product details`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Orders Actions
  const markOrderPacked = (id: string) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "Packed",
              packedAt: new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : o,
      );
      try {
        localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    enqueue(`Order ${id} marked packed & ready for courier`);
  };

  // Bulk Deals Actions
  const counterBulkDeal = (id: string, rate: number) => {
    setBulkDeals((prev) => {
      const next = prev.map((b) =>
        b.id === id ? { ...b, status: "countered" as const, counterRate: rate } : b,
      );
      try {
        localStorage.setItem(STORAGE_KEYS.bulk, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    const deal = bulkDeals.find((b) => b.id === id);
    enqueue(`Counter-offer ₹${rate} to ${deal?.buyer || "buyer"}`);
  };

  const declineBulkDeal = (id: string) => {
    setBulkDeals((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, status: "declined" as const } : b));
      try {
        localStorage.setItem(STORAGE_KEYS.bulk, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    const deal = bulkDeals.find((b) => b.id === id);
    enqueue(`Declined deal from ${deal?.buyer || "buyer"}`);
  };

  // Messages Actions
  const updateMessageDraft = (id: string, draft: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, draft } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const sendMessageReply = (id: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, status: "sent" as const } : m));
      try {
        localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    const msg = messages.find((m) => m.id === id);
    enqueue(`Reply to ${msg?.buyer || "buyer"} approved & queued`);
  };

  // Lessons Actions
  const completeLesson = (id: string) => {
    setLessons((prev) => {
      const next = prev.map((l) => (l.id === id ? { ...l, done: true } : l));
      try {
        localStorage.setItem(STORAGE_KEYS.lessons, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    // Check if bulk negotiator badge is unlocked (if 4 or more completed)
    setBadges((prev) => {
      const next = prev.map((b) => (b.id === "g5" ? { ...b, earned: true } : b));
      try {
        localStorage.setItem(STORAGE_KEYS.badges, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    enqueue(`Lesson completed +XP earned`);
  };

  return (
    <AppCtx.Provider
      value={{
        ready,
        profile,
        setProfile,
        online,
        toggleOnline,
        queue,
        enqueue,
        syncNow,
        syncing,
        lastSync,
        speaking,
        speak,
        stopSpeaking,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        markOrderPacked,
        bulkDeals,
        counterBulkDeal,
        declineBulkDeal,
        messages,
        updateMessageDraft,
        sendMessageReply,
        lessons,
        badges,
        completeLesson,
        bigText,
        setBigText,
        voiceFirst,
        setVoiceFirst,
        lessonsDownloaded,
        downloadLessonsOffline,
      }}
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
