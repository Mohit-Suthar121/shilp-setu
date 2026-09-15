import { useState, useRef, useEffect, useCallback } from "react";
import { LANGUAGES, CRAFTS } from "@/lib/mock";

// Types for Web Speech API recognition
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: {
    readonly isFinal: boolean;
    readonly length: number;
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

/** Map ShilpSetu 2-letter language codes to full BCP-47 language tags */
export const LANG_BCP47_MAP: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
  as: "as-IN",
  ur: "ur-IN",
  mai: "hi-IN",
};

export function getBCP47Tag(code?: string): string {
  if (!code) return "hi-IN";
  return LANG_BCP47_MAP[code] || `${code}-IN`;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean("speechSynthesis" in window);
}

/**
 * Hook for speech recognition using Web Speech API with fallback support.
 */
export function useSpeechRecognition({
  langCode = "hi",
  continuous = false,
  onResult,
  onFinal,
  onError,
  sampleFallback,
}: {
  langCode?: string;
  continuous?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onFinal?: (transcript: string) => void;
  onError?: (error: string) => void;
  sampleFallback?: string;
}) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (listening) {
      stop();
      return;
    }

    setInterimText("");

    if (supported) {
      try {
        const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecClass) throw new Error("Speech recognition unavailable");

        const rec = new SpeechRecClass();
        rec.continuous = continuous;
        rec.interimResults = true;
        rec.lang = getBCP47Tag(langCode);
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setListening(true);
        };

        rec.onresult = (event: SpeechRecognitionEventLike) => {
          let currentInterim = "";
          let currentFinal = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (!result) continue;
            const text = result[0]?.transcript || "";
            if (result.isFinal) {
              currentFinal += text;
            } else {
              currentInterim += text;
            }
          }

          if (currentInterim) {
            setInterimText(currentInterim);
            onResult?.(currentInterim, false);
          }

          if (currentFinal) {
            setFinalText((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
            setInterimText("");
            onResult?.(currentFinal, true);
            onFinal?.(currentFinal);
          }
        };

        rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
          const err = event.error || "Unknown error";
          setListening(false);
          if (onError) {
            onError(err);
          } else if (sampleFallback) {
            // If mic errored (e.g. not-allowed or audio-capture), fallback to sample
            onFinal?.(sampleFallback);
          }
        };

        rec.onend = () => {
          setListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
        return;
      } catch (err) {
        console.warn("Failed to start browser SpeechRecognition, using sample fallback:", err);
      }
    }

    // Fallback simulation if SpeechRecognition is not supported or errors out
    setListening(true);
    fallbackTimerRef.current = setTimeout(() => {
      setListening(false);
      const text = sampleFallback || "Blue Pottery";
      setFinalText(text);
      onResult?.(text, true);
      onFinal?.(text);
    }, 1500);
  }, [
    listening,
    supported,
    continuous,
    langCode,
    onResult,
    onFinal,
    onError,
    sampleFallback,
    stop,
  ]);

  const toggle = useCallback(() => {
    if (listening) {
      stop();
    } else {
      start();
    }
  }, [listening, start, stop]);

  return {
    listening,
    interimText,
    finalText,
    supported,
    start,
    stop,
    toggle,
    setFinalText,
  };
}

/**
 * Matches spoken speech against available languages
 */
export function matchLanguageFromSpeech(spoken: string) {
  const clean = spoken.toLowerCase().trim();
  for (const lang of LANGUAGES) {
    if (clean.includes(lang.label.toLowerCase()) || clean.includes(lang.en.toLowerCase())) {
      return lang;
    }
    for (const alias of lang.aliases) {
      if (clean.includes(alias.toLowerCase())) {
        return lang;
      }
    }
  }
  return null;
}

/**
 * Matches spoken speech against available crafts
 */
export function matchCraftFromSpeech(spoken: string) {
  const clean = spoken.toLowerCase().trim();
  for (const craft of CRAFTS) {
    if (clean.includes(craft.name.toLowerCase())) {
      return craft;
    }
    for (const alias of craft.aliases) {
      if (clean.includes(alias.toLowerCase())) {
        return craft;
      }
    }
  }
  return null;
}

/**
 * Parses numbers from speech (supports digit sequences and spoken Indian numerals)
 */
export function extractNumberFromSpeech(spoken: string): number | null {
  // Check for direct digits
  const digitMatch = spoken.match(/\d+/g);
  if (digitMatch) {
    return parseInt(digitMatch.join(""), 10);
  }

  // Hindi / English spoken numeral mappings
  const wordMap: Record<string, number> = {
    ek: 1,
    one: 1,
    do: 2,
    two: 2,
    teen: 3,
    three: 3,
    char: 4,
    four: 4,
    paanch: 5,
    five: 5,
    chhah: 6,
    six: 6,
    saat: 7,
    seven: 7,
    aath: 8,
    eight: 8,
    nau: 9,
    nine: 9,
    dus: 10,
    ten: 10,
    sau: 100,
    hundred: 100,
    hazaar: 1000,
    thousand: 1000,
    lakh: 100000,
  };

  const words = spoken.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (wordMap[w] !== undefined) {
      return wordMap[w]!;
    }
  }

  return null;
}

/**
 * Intelligent parser that extracts product fields from freeform spoken description
 */
export function parseProductFromSpeech(transcript: string): Partial<{
  name: string;
  category: string;
  material: string;
  size: string;
  time: string;
  stock: string;
  care: string;
}> {
  const clean = transcript.toLowerCase();
  const result: ReturnType<typeof parseProductFromSpeech> = {};

  // Check craft / category
  if (
    clean.includes("pottery") ||
    clean.includes("पॉटरी") ||
    clean.includes("मिट्टी") ||
    clean.includes("jug")
  ) {
    result.name = "Jaipur Blue Pottery Water Jug";
    result.category = "Home & Kitchen › Pottery";
    result.material = "Quartz clay with cobalt oxide glaze";
    result.size = "8 inch height, 1.2 litre";
    result.care = "Hand wash, avoid direct flame";
  } else if (
    clean.includes("madhubani") ||
    clean.includes("मधुबनी") ||
    clean.includes("art") ||
    clean.includes("painting")
  ) {
    result.name = "Madhubani Handmade Wall Art";
    result.category = "Decor & Art › Folk Painting";
    result.material = "Handmade paper, natural mineral pigments";
    result.size = "14 x 10 inch";
    result.care = "Keep in dry frame away from direct water";
  } else if (
    clean.includes("diya") ||
    clean.includes("दीया") ||
    clean.includes("terracotta") ||
    clean.includes("टेराकोटा")
  ) {
    result.name = "Terracotta Diya Festive Set";
    result.category = "Festival & Home › Terracotta";
    result.material = "River silt clay, wood-fired";
    result.size = "Standard 3 inch each";
    result.care = "Wash gently with plain water";
  } else if (
    clean.includes("stole") ||
    clean.includes("kantha") ||
    clean.includes("कांथा") ||
    clean.includes("silk")
  ) {
    result.name = "Handcrafted Kantha Silk Stole";
    result.category = "Apparel & Textiles › Stoles";
    result.material = "Pure Tussar silk & cotton embroidery";
    result.size = "2.2 metre length";
    result.care = "Dry clean or gentle hand wash with mild soap";
  } else {
    // Generic fallback with spoken transcript as name
    result.name = transcript.slice(0, 45).trim() || "Handcrafted Artisan Item";
    result.category = "Traditional Handicraft";
    result.material = "Natural raw materials";
    result.size = "Handmade standard";
    result.care = "Handle with artisan care";
  }

  // Check timeline
  if (clean.includes("दो हफ्ते") || clean.includes("two weeks") || clean.includes("14")) {
    result.time = "14 days";
  } else if (clean.includes("हफ्ता") || clean.includes("week") || clean.includes("7")) {
    result.time = "7 days";
  } else if (clean.includes("महीना") || clean.includes("month") || clean.includes("30")) {
    result.time = "30 days";
  } else {
    result.time = "10 days";
  }

  // Check stock
  const extractedNum = extractNumberFromSpeech(transcript);
  if (extractedNum && extractedNum > 0 && extractedNum <= 1000) {
    result.stock = String(extractedNum);
  } else {
    result.stock = "6";
  }

  return result;
}

/**
 * Text-to-Speech utility with Indian language voice preference
 */
export function speakText(text: string, langCode: string = "hi", onEnd?: () => void) {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getBCP47Tag(langCode);
    utterance.rate = 0.95; // Slightly slower for clear rural/artisan comprehension

    // Pick a matching voice if available
    const voices = synth.getVoices();
    const tag = getBCP47Tag(langCode).toLowerCase();
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase() === tag || v.lang.toLowerCase().startsWith(langCode),
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    synth.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
    onEnd?.();
  }
}
