"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Cpu,
  Globe,
  ChevronRight,
  Zap,
  PenLine,
  AudioLines,
  Video,
  FolderKanban,
  Settings,
  Activity,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const PROVIDERS = [
  { id: "ollama", label: "Ollama (Local)", icon: Cpu, desc: "Run models locally on your machine" },
  { id: "openrouter", label: "OpenRouter", icon: Globe, desc: "Access 100+ models via OpenRouter" },
  { id: "gemini", label: "Google Gemini", icon: Sparkles, desc: "Google's latest AI models" },
  { id: "groq", label: "Groq", icon: Zap, desc: "Ultra-fast inference engine" },
  { id: "openai", label: "OpenAI", icon: Bot, desc: "GPT-4o and GPT-3.5 models" },
  { id: "anthropic", label: "Anthropic", icon: Bot, desc: "Claude family of models" },
] as const;

const MODEL_MAP: Record<string, string[]> = {
  ollama: ["llama3.1", "llama3.2", "llama3.3", "gemma2:9b", "qwen2.5:7b", "mistral", "mixtral", "phi3", "deepseek-coder"],
  openrouter: ["auto", "openrouter/free", "google/gemma-2-9b-it:free", "meta-llama/llama-3.2-3b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free", "mistralai/mistral-7b-instruct:free", "qwen/qwen-2.5-7b-instruct:free", "microsoft/phi-3-mini-128k-instruct:free"],
  gemini: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
  groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"],
  anthropic: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
};

const STUDIOS = [
  { title: "AI Chat", href: "/chat", icon: Bot, desc: "Conversational AI workspace", primary: true },
  { title: "Writing Studio", href: "/writing", icon: PenLine, desc: "AI-powered writing tools" },
  { title: "Voice Studio", href: "/voice", icon: AudioLines, desc: "Text-to-speech & transcription" },
  { title: "Video Studio", href: "/video", icon: Video, desc: "AI video generation" },
  { title: "Projects", href: "/projects", icon: FolderKanban, desc: "Manage your AI projects" },
  { title: "Settings", href: "/settings", icon: Settings, desc: "API keys & configuration" },
];

interface UserData {
  firstName?: string;
  lastName?: string;
  photo?: string;
}

export default function AIControlPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [provider, setProvider] = useState("ollama");
  const [model, setModel] = useState("llama3.1");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("current_user");
      if (raw) {
        try { setUser(JSON.parse(raw)); } catch {}
      }

      const savedProvider = localStorage.getItem("ai_provider") || "ollama";
      let savedModel = localStorage.getItem("ai_model") || "";
      
      if (!savedModel) {
        if (savedProvider === "openrouter") savedModel = localStorage.getItem("openrouter_model") || "auto";
        else if (savedProvider === "gemini") savedModel = localStorage.getItem("gemini_model") || "gemini-1.5-flash";
        else if (savedProvider === "groq") savedModel = localStorage.getItem("groq_model") || "llama-3.3-70b-versatile";
        else if (savedProvider === "openai") savedModel = localStorage.getItem("openai_model") || "gpt-4o-mini";
        else if (savedProvider === "anthropic") savedModel = localStorage.getItem("anthropic_model") || "claude-3-5-sonnet-latest";
        else savedModel = localStorage.getItem("ollama_model") || "llama3.1";
      }

      if (
        savedModel === "lynn/soliloquy-l2-13b:free" ||
        savedModel === "intel/neural-chat-7b-v3-1:free" ||
        savedModel === "huggingfaceh4/zephyr-7b-beta:free" ||
        savedModel === "openchat/openchat-7b:free" ||
        savedModel === "undi95/toppy-m-7b:free" ||
        savedModel === "deepseek/deepseek-r1:free"
      ) {
        savedModel = "auto";
      }

      setProvider(savedProvider);
      setModel(savedModel || (MODEL_MAP[savedProvider]?.[0] ?? "llama3.1"));
    }
  }, []);

  useEffect(() => {
    const models = MODEL_MAP[provider] || [];
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0]);
    }
  }, [provider]);

  useEffect(() => {
    if (typeof window !== "undefined" && provider && model) {
      localStorage.setItem("ai_provider", provider);
      localStorage.setItem("ai_model", model);
      if (provider === "openrouter") localStorage.setItem("openrouter_model", model);
      else if (provider === "ollama") localStorage.setItem("ollama_model", model);
      else if (provider === "gemini") localStorage.setItem("gemini_model", model);
      else if (provider === "groq") localStorage.setItem("groq_model", model);
      else if (provider === "openai") localStorage.setItem("openai_model", model);
      else if (provider === "anthropic") localStorage.setItem("anthropic_model", model);
    }
  }, [provider, model]);

  const handleSaveAndStart = () => {
    setSaved(true);
    setTimeout(() => {
      router.push("/chat");
    }, 600);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const models = MODEL_MAP[provider] || [];
  const greeting = user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.photo && user.photo !== "/api/placeholder/120/120" ? (
              <img src={user.photo} alt="Profile" className="size-12 rounded-full object-cover border-2 border-border shadow-md" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{greeting}</h1>
              <p className="text-xs text-muted-foreground">Configure your AI engine and start working</p>
            </div>
          </div>
        </div>

        {/* AI Engine Configuration */}
        <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40">
            <Cpu className="size-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">AI Engine</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-500 uppercase">Ready</span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Provider</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  const isActive = provider === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border hover:border-primary/30 bg-background/50"
                      }`}
                    >
                      <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {p.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">{p.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveAndStart} className="flex-1 h-11 font-semibold gap-2 text-sm">
                {saved ? (
                  <>
                    <Check className="size-4" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    Start Working
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleSave} className="h-11 px-5 text-xs font-semibold">
                Save Config
              </Button>
            </div>
          </div>
        </div>

        {/* Studios Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide px-1">Workspaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STUDIOS.map((studio) => {
              const Icon = studio.icon;
              return (
                <button
                  key={studio.href}
                  onClick={() => router.push(studio.href)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group text-left ${
                    studio.primary
                      ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
                      : "border-border bg-background/60 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-9 items-center justify-center rounded-lg ${
                      studio.primary ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground group-hover:text-primary"
                    } transition-colors`}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{studio.title}</p>
                      <p className="text-[10px] text-muted-foreground">{studio.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
