"use client";

import { useState, useEffect, useRef } from "react";
import {
  AudioLines,
  Play,
  Pause,
  Download,
  RefreshCw,
  Send,
  Settings,
  User,
  Bot,
  Copy,
  Check,
  Sparkles,
  Mic,
  Volume2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const VOICE_OPTIONS = [
  { id: "male", name: "Male Voice", description: "Deep, authoritative tone" },
  { id: "female", name: "Female Voice", description: "Clear, natural tone" },
  { id: "child", name: "Child Voice", description: "Young, energetic tone" },
];

const QUICK_ACTIONS = [
  { label: "Narration", prompt: "Narrate this text in a professional tone" },
  { label: "Audiobook", prompt: "Read this as an audiobook with expression" },
  { label: "News Report", prompt: "Read this as a news report" },
  { label: "Podcast Intro", prompt: "Create a podcast intro for this" },
  { label: "Presentation", prompt: "Present this text confidently" },
  { label: "Storytelling", prompt: "Tell this story engagingly" },
];

export default function VoiceStudioPage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("female");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window);
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSpeak = () => {
    if (!text.trim() || !speechSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set voice based on selection
    const voices = window.speechSynthesis.getVoices();
    const selectedVoiceObj = voices.find((v) =>
      selectedVoice === "male"
        ? v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david")
        : selectedVoice === "female"
        ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("samantha")
        : v.name.toLowerCase().includes("child") || v.name.toLowerCase().includes("young")
    );

    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!text.trim()) return;

    // Create a simple audio file using Web Audio API
    // For a real implementation, you'd use a service like OpenAI TTS
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-over-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickAction = (prompt: string) => {
    setText(prompt);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSpeak();
    }
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <AudioLines className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Voice Studio</h1>
                <p className="text-xs text-muted-foreground">
                  Text-to-speech using browser's native voice synthesis
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/settings")}
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {showSuggestions && !text && (
              // Hero Welcome Section
              <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                    <AudioLines className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">
                    Voice Studio
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Convert text to natural speech using your browser's built-in voice synthesis. No API key required.
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4">
                  Quick voice-over templates
                </h3>

                {/* Quick Actions Grid */}
                <div className="grid w-full max-w-xl gap-2.5 sm:grid-cols-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Sparkles className="size-4" />
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">
                        {action.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSuggestions && (
              // Chat-style Messages
              <div className="space-y-8">
                {text && (
                  <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <footer className="border-t border-border bg-background/50 p-4 backdrop-blur sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card shadow-lg transition-all focus-within:shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter text to convert to speech... e.g. Welcome to AI Studio, your creative workspace"
                  className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 pr-24 text-base outline-none placeholder:text-muted-foreground min-h-20 max-h-48"
                  disabled={isGenerating}
                  rows={1}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    size="icon"
                    onClick={isPlaying ? handleStop : handleSpeak}
                    disabled={!text.trim() || !speechSupported}
                    className="rounded-xl"
                  >
                    {isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {speechSupported
                  ? "Press Enter to speak, Shift+Enter for new line"
                  : "Web Speech API not supported in this browser"}
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}