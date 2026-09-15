import { useState } from "react";
import { Mic, Square, Volume2, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-state";
import { useSpeechRecognition } from "@/lib/voice";

/** Real speech recognition dictation hook with graceful fallback to sample */
export function useDictation(onDone: (v: string) => void, sample: string, langCode?: string) {
  const { profile } = useApp();
  const activeLang = langCode || profile?.lang || "hi";
  const [lastSpoken, setLastSpoken] = useState<string>("");

  const { listening, interimText, supported, start, stop, toggle } = useSpeechRecognition({
    langCode: activeLang,
    sampleFallback: sample,
    onResult: (text) => {
      setLastSpoken(text);
    },
    onFinal: (finalText) => {
      setLastSpoken(finalText);
      onDone(finalText);
    },
    onError: () => {
      // Fallback to sample if mic access failed
      if (sample) {
        onDone(sample);
      }
    },
  });

  return { listening, interimText: interimText || lastSpoken, supported, start, stop, toggle };
}

export function MicButton({
  onResult,
  sample,
  label = "Speak",
  langCode,
  className,
}: {
  onResult: (v: string) => void;
  sample: string;
  label?: string;
  langCode?: string;
  className?: string;
}) {
  const { listening, toggle } = useDictation(onResult, sample, langCode);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={listening ? "Stop listening" : label}
      title={listening ? "Stop listening" : label}
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl border border-border transition shadow-sm",
        listening
          ? "animate-pulse bg-destructive text-destructive-foreground ring-4 ring-destructive/20"
          : "bg-card text-primary hover:bg-accent active:scale-95",
        className,
      )}
    >
      {listening ? <Square className="size-4" /> : <Mic className="size-5" />}
    </button>
  );
}

export function MicField({
  label,
  value,
  onChange,
  sample,
  disabled,
  langCode,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  sample?: string;
  disabled?: boolean;
  langCode?: string;
}) {
  const { speak, speaking } = useApp();
  const fallbackSample = sample ?? value;
  const { listening, interimText, toggle } = useDictation(
    (v) => onChange?.(v),
    fallbackSample,
    langCode,
  );

  const textToRead = `${label}: ${value}`;
  const isSpeaking = speaking === textToRead;

  return (
    <div className="block text-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {listening && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive animate-pulse">
            <Mic className="size-3" /> Listening live…
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <input
          value={listening && interimText ? interimText : value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={label}
          className={cn(
            "min-h-12 w-full min-w-0 rounded-2xl border bg-background px-4 text-base transition disabled:opacity-70",
            listening ? "border-destructive ring-2 ring-destructive/20" : "border-border",
          )}
        />
        {onChange && (
          <button
            type="button"
            onClick={toggle}
            aria-label={listening ? `Stop listening for ${label}` : `Speak ${label}`}
            title={listening ? `Stop listening` : `Speak ${label}`}
            className={cn(
              "grid size-12 shrink-0 place-items-center rounded-2xl border border-border transition active:scale-95",
              listening
                ? "animate-pulse bg-destructive text-destructive-foreground ring-2 ring-destructive/30"
                : "bg-card text-primary hover:bg-accent",
            )}
          >
            {listening ? <Square className="size-4" /> : <Mic className="size-5" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => speak(textToRead)}
          aria-label={`Narrate ${label}`}
          title={`Listen to ${label}`}
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl border border-border transition active:scale-95",
            isSpeaking
              ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
              : "bg-card text-primary hover:bg-accent",
          )}
        >
          <Volume2 className={cn("size-5", isSpeaking && "animate-pulse")} />
        </button>
      </div>

      {listening && (
        <p className="mt-1 text-xs text-destructive">
          {interimText
            ? `Heard: "${interimText}"`
            : `Listening… say the ${label.toLowerCase()} in your language`}
        </p>
      )}
    </div>
  );
}
