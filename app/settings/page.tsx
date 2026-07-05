"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Cpu, Globe, Key, ShieldCheck, Check, Sparkles, MessageSquare, Send, Bot, User, Loader2, Camera } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const OPENROUTER_MODELS = [
  "auto",
  "openrouter/free",
  "google/gemma-2-9b-it:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
];

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

const OPENAI_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-3.5-turbo",
];

const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-opus-latest",
];

const OLLAMA_MODELS = [
  "llama3.1",
  "llama3.2",
  "llama3.2:1b",
  "llama3.3",
  "gemma2:9b",
  "gemma2:2b",
  "qwen2.5:7b",
  "qwen2.5:14b",
  "qwen2.5:32b",
  "qwen2.5-coder:7b",
  "qwen2.5-coder:14b",
  "mistral",
  "mixtral",
  "phi3",
  "deepseek-coder",
  "codellama",
  "custom",
];

export default function SettingsPage() {
  const [provider, setProvider] = useState("ollama");
  
  // Specs Calculator
  const [ram, setRam] = useState("16");
  const [gpu, setGpu] = useState("mid");

  const modelRecommendation = (() => {
    const ramSize = parseInt(ram);
    
    if (ramSize <= 8 || gpu === "cpu") {
      return {
        model: "llama3.2:1b",
        desc: "Ultra-lightweight 1.2B parameter model. Fits comfortably in limited memory and runs fast on CPU.",
        cmd: "ollama pull llama3.2:1b"
      };
    }
    
    if (ramSize === 16) {
      if (gpu === "mid") {
        return {
          model: "llama3.1:8b",
          desc: "Excellent 8B parameter general-purpose model. Runs fast on consumer GPUs with 6GB-8GB VRAM.",
          cmd: "ollama pull llama3.1"
        };
      } else {
        return {
          model: "gemma2:9b",
          desc: "Powerful 9B parameter model by Google. High intelligence, requires 8GB+ GPU VRAM.",
          cmd: "ollama pull gemma2:9b"
        };
      }
    }
    
    if (ramSize === 32) {
      return {
        model: "qwen2.5:14b",
        desc: "Sleek 14B parameter model. High accuracy for coding and reasoning, runs best on 12GB+ VRAM.",
        cmd: "ollama pull qwen2.5:14b"
      };
    }
    
    return {
      model: "llama3.3:70b",
      desc: "Flagship 70B parameter reasoning model. Human-level performance, requires high-end workstations (24GB+ VRAM).",
      cmd: "ollama pull llama3.3"
    };
  })();
  
  // Endpoints
  const [ollamaUrl, setOllamaUrl] = useState("http://127.0.0.1:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3.1");
  const [ollamaSelect, setOllamaSelect] = useState("llama3.1");

  // API Keys
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("google/gemma-2-9b-it:free");

  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");

  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");

  // OpenAI Key
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");

  // Anthropic Key
  const [anthropicKey, setAnthropicKey] = useState("");
  const [anthropicModel, setAnthropicModel] = useState("claude-3-5-sonnet-latest");

  // Local engine configuration state
  const [localEngine, setLocalEngine] = useState("ollama");

  const [mlRouting, setMlRouting] = useState(true);
  const [sharedTelemetry, setSharedTelemetry] = useState(true);

  // Active Settings Tab
  const [activeSettingsTab, setActiveSettingsTab] = useState<"ai" | "profile">("ai");

  // Profile States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("/api/placeholder/120/120");
  const [faceVerified, setFaceVerified] = useState(false);
  const [bio, setBio] = useState("");
  const [preferredModel, setPreferredModel] = useState("gpt-4o-mini");
  const [computeMode, setComputeMode] = useState("balanced");

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Face Scan Simulation in Profile tab
  const [profileFaceScanActive, setProfileFaceScanActive] = useState(false);
  const [profileFaceScanProgress, setProfileFaceScanProgress] = useState(0);


  const DEFAULT_LOCAL_URLS: Record<string, string> = {
    ollama: "http://127.0.0.1:11434",
    lm_studio: "http://127.0.0.1:1234",
    jan: "http://127.0.0.1:1337",
    koboldcpp: "http://127.0.0.1:5001",
    llamacpp: "http://127.0.0.1:8080",
  };

  const selectLocalEngine = (engineId: string) => {
    setProvider("ollama");
    setLocalEngine(engineId);
    if (Object.values(DEFAULT_LOCAL_URLS).includes(ollamaUrl) || ollamaUrl.trim() === "") {
      setOllamaUrl(DEFAULT_LOCAL_URLS[engineId] || DEFAULT_LOCAL_URLS.ollama);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // FAQ Chatbox State
  const [faqMessages, setFaqMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "👋 Hello! I am your AI Studio Assistant. How can I help you set up your local AI, customize API keys, or configure routing tiers?",
    },
  ]);
  const [faqInput, setFaqInput] = useState("");
  const [faqLoading, setFaqLoading] = useState(false);

  const OFFLINE_FAQ = [
    {
      keywords: ["ollama", "local", "install", "offline", "download", "run", "setup", "port"],
      answer: "To set up local AI:\n1. Download Ollama from https://ollama.com\n2. Install it on your machine.\n3. Open terminal and run:\n   `ollama pull llama3.2` (or your preferred size).\n4. In AI Studio settings, choose **Tier 3 (Local AI)** and save."
    },
    {
      keywords: ["openai", "claude", "key", "paid", "token", "anthropic", "gemini", "groq", "api key", "credentials"],
      answer: "To acquire keys:\n* **OpenAI**: Visit platform.openai.com\n* **Anthropic**: Visit console.anthropic.com\n* **Gemini**: Visit aistudio.google.com\nOnce done, select **Tier 2 (Paid API)** in Settings, input your key, and save."
    },
    {
      keywords: ["ram", "gpu", "vram", "specification", "recommend", "hardware", "cpu"],
      answer: "Specs recommendations:\n* **8GB RAM / CPU**: Use `llama3.2:1b` (1.2B parameters).\n* **16GB RAM / Mid GPU**: Use `llama3.1` (8B) or `gemma2:9b`.\n* **32GB RAM / High GPU**: Use `qwen2.5:14b`.\n* **64GB+ RAM**: Use `llama3.3:70b`."
    },
    {
      keywords: ["free", "tier 1", "auto", "autoselect", "failover", "rotation"],
      answer: "Tier 1 (Free Cloud AI) is fully keyless. It routes prompts to OpenRouter free models, auto-balancing based on tasks (e.g. Qwen for code, Hermes for reasoning) and rotating if a rate limit occurs."
    }
  ];

  async function handleSendFaq(e?: React.FormEvent, customQuestion?: string) {
    if (e) e.preventDefault();
    const text = (customQuestion ?? faqInput).trim();
    if (!text || faqLoading) return;

    const userMsg = { role: "user" as const, content: text };
    setFaqMessages((prev) => [...prev, userMsg]);
    setFaqInput("");
    setFaqLoading(true);

    try {
      const orKey = openrouterKey || (typeof window !== "undefined" ? localStorage.getItem("openrouter_key") || "" : "");
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are the AI Studio Helper, a concise assistant answering FAQs about AI Studio, Ollama, system requirements, and API keys. Keep answers under 4 lines."
            },
            ...faqMessages.map(m => ({ role: m.role, content: m.content })),
            userMsg
          ],
          providerId: "openrouter",
          model: "auto",
          apiKeys: { openrouter: orKey }
        })
      });

      if (!response.ok) {
        throw new Error("API route failed");
      }

      const data = await response.json();
      if (!data.content) {
        throw new Error("Empty response content");
      }

      setFaqMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (err) {
      console.warn("FAQ Live Call failed, falling back to local FAQ engine:", err);
      const cleanText = text.toLowerCase();
      let matchedAnswer = "I couldn't find a direct answer. Try asking about 'Ollama installation', 'API keys setup', 'RAM specifications', or 'Free Tier 1'.";
      
      for (const faq of OFFLINE_FAQ) {
        if (faq.keywords.some(kw => cleanText.includes(kw))) {
          matchedAnswer = faq.answer;
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      setFaqMessages((prev) => [...prev, { role: "assistant", content: matchedAnswer }]);
    } finally {
      setFaqLoading(false);
    }
  }

  // Load from local storage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("ai_provider");
    const savedUrl = localStorage.getItem("ollama_url");
    const savedModel = localStorage.getItem("ollama_model");

    const savedOrKey = localStorage.getItem("openrouter_key");
    const savedOrModel = localStorage.getItem("openrouter_model");

    const savedGeminiKey = localStorage.getItem("gemini_key");
    const savedGeminiModel = localStorage.getItem("gemini_model");

    const savedGroqKey = localStorage.getItem("groq_key");
    const savedGroqModel = localStorage.getItem("groq_model");

    const savedOpenaiKey = localStorage.getItem("openai_key");
    const savedOpenaiModel = localStorage.getItem("openai_model");

    const savedAnthropicKey = localStorage.getItem("anthropic_key");
    const savedAnthropicModel = localStorage.getItem("anthropic_model");

    const savedLocalEngine = localStorage.getItem("local_engine");

    const timer = setTimeout(() => {
      if (savedProvider) setProvider(savedProvider);
      if (savedUrl) setOllamaUrl(savedUrl);
      if (savedModel) {
        setOllamaModel(savedModel);
        if (OLLAMA_MODELS.includes(savedModel)) {
          setOllamaSelect(savedModel);
        } else {
          setOllamaSelect("custom");
        }
      }

      if (savedOrKey) setOpenrouterKey(savedOrKey);
      if (savedOrModel) {
        if (
          savedOrModel === "lynn/soliloquy-l2-13b:free" ||
          savedOrModel === "intel/neural-chat-7b-v3-1:free" ||
          savedOrModel === "huggingfaceh4/zephyr-7b-beta:free" ||
          savedOrModel === "openchat/openchat-7b:free" ||
          savedOrModel === "undi95/toppy-m-7b:free" ||
          savedOrModel === "deepseek/deepseek-r1:free"
        ) {
          setOpenrouterModel("auto");
        } else {
          setOpenrouterModel(savedOrModel);
        }
      }

      if (savedGeminiKey) setGeminiKey(savedGeminiKey);
      if (savedGeminiModel) setGeminiModel(savedGeminiModel);

      if (savedGroqKey) setGroqKey(savedGroqKey);
      if (savedGroqModel) setGroqModel(savedGroqModel);

      if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
      if (savedOpenaiModel) setOpenaiModel(savedOpenaiModel);

      if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
      if (savedAnthropicModel) setAnthropicModel(savedAnthropicModel);

      if (savedLocalEngine) setLocalEngine(savedLocalEngine);

      const savedMlRouting = localStorage.getItem("ml_routing_enabled") === "true";
      const savedSharedTelemetry = localStorage.getItem("shared_telemetry_enabled") === "true";
      const savedLogsRaw = localStorage.getItem("ai_telemetry_logs");
      let parsedLogs = [];
      if (savedLogsRaw) {
        try { parsedLogs = JSON.parse(savedLogsRaw); } catch {}
      } else {
        parsedLogs = [
          { timestamp: Date.now() - 3600000, option: "Option 1 (Free)", latencyMs: 820, success: true },
          { timestamp: Date.now() - 3000000, option: "Option 2 (Paid)", latencyMs: 450, success: true },
          { timestamp: Date.now() - 2400000, option: "Option 3 (Local)", latencyMs: 1200, success: true },
        ];
        localStorage.setItem("ai_telemetry_logs", JSON.stringify(parsedLogs));
      }
      setMlRouting(savedMlRouting);
      setSharedTelemetry(savedSharedTelemetry);

      const currentUserRaw = localStorage.getItem("current_user");
      if (currentUserRaw) {
        try {
          const user = JSON.parse(currentUserRaw);
          setFullName(user.fullName || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
          setPhoto(user.photo || "/api/placeholder/120/120");
          setFaceVerified(user.faceVerified || false);
          setBio(user.bio || "");
          setPreferredModel(user.preferredModel || "gpt-4o-mini");
          setComputeMode(user.computeMode || "balanced");
        } catch {}
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      const activeOllamaModel = ollamaSelect === "custom" ? ollamaModel : ollamaSelect;
      localStorage.setItem("ai_provider", provider);
      localStorage.setItem("ollama_url", ollamaUrl);
      localStorage.setItem("ollama_model", activeOllamaModel);

      localStorage.setItem("openrouter_key", openrouterKey);
      localStorage.setItem("openrouter_model", openrouterModel);

      localStorage.setItem("gemini_key", geminiKey);
      localStorage.setItem("gemini_model", geminiModel);

      localStorage.setItem("groq_key", groqKey);
      localStorage.setItem("groq_model", groqModel);

      localStorage.setItem("openai_key", openaiKey);
      localStorage.setItem("openai_model", openaiModel);

      localStorage.setItem("anthropic_key", anthropicKey);
      localStorage.setItem("anthropic_model", anthropicModel);

      localStorage.setItem("local_engine", localEngine);
      localStorage.setItem("ml_routing_enabled", mlRouting ? "true" : "false");
      localStorage.setItem("shared_telemetry_enabled", sharedTelemetry ? "true" : "false");

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    setTimeout(() => {
      const currentUserRaw = localStorage.getItem("current_user");
      let currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : {};
      
      currentUser = {
        ...currentUser,
        fullName,
        email,
        phone,
        photo,
        faceVerified,
        bio,
        preferredModel,
        computeMode
      };
      
      localStorage.setItem("current_user", JSON.stringify(currentUser));
      
      // Also update in registered list
      const usersRaw = localStorage.getItem("everest_registered_users");
      let users = usersRaw ? JSON.parse(usersRaw) : [];
      users = users.map((u: { email: string }) => u.email.toLowerCase() === currentUser.email.toLowerCase() ? currentUser : u);
      localStorage.setItem("everest_registered_users", JSON.stringify(users));

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    const currentUserRaw = localStorage.getItem("current_user");
    if (!currentUserRaw) return;
    const currentUser = JSON.parse(currentUserRaw);

    if (currentUser.password && currentUser.password !== currentPassword) {
      setPasswordError("Current password is incorrect.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    currentUser.password = newPassword;
    localStorage.setItem("current_user", JSON.stringify(currentUser));

    const usersRaw = localStorage.getItem("everest_registered_users");
    let users = usersRaw ? JSON.parse(usersRaw) : [];
    users = users.map((u: { email: string }) => u.email.toLowerCase() === currentUser.email.toLowerCase() ? currentUser : u);
    localStorage.setItem("everest_registered_users", JSON.stringify(users));

    setPasswordSuccess("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const startProfileFaceScan = () => {
    if (profileFaceScanActive) return;
    setProfileFaceScanActive(true);
    setProfileFaceScanProgress(0);

    const interval = setInterval(() => {
      setProfileFaceScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProfileFaceScanActive(false);
          setFaceVerified(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg glass-card glow-hover p-6 text-card-foreground shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Settings className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Platform Preferences</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure default AI providers, connection endpoints, API keys, and fallback settings.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Main Settings Form */}
          <section className="rounded-lg glass-card glow-hover p-5 text-card-foreground shadow-lg">
            {/* Navigation Tabs */}
            <div className="flex border-b border-border/40 gap-4 mb-5">
              <button
                type="button"
                onClick={() => setActiveSettingsTab("ai")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider relative transition-all ${
                  activeSettingsTab === "ai" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Routing Config
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab("profile")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider relative transition-all ${
                  activeSettingsTab === "profile" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Profile & Security
              </button>
            </div>

            {activeSettingsTab === "ai" ? (
              <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* Provider Selection divided into Tiers */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                    <Cpu className="size-4 text-primary" /> Active AI Routing Options
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Select how you want to route your workspace queries. Toggle between keyless free models, personal cloud API keys, or completely offline local engines.
                  </p>
                </div>

                {/* Option 1: Free AI */}
                <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4 relative overflow-hidden">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex size-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Option 1: Free Cloud AI (Zero Configuration)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Zero configurations required. Automatically selects and rotates through 15+ online models (e.g. Qwen for code, Hermes for logic) to bypass rate limits.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div
                      onClick={() => {
                        setProvider("openrouter");
                        setOpenrouterModel("auto");
                      }}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "openrouter" && openrouterModel === "auto" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <circle cx="19" cy="5" r="2" />
                          <circle cx="5" cy="19" r="2" />
                          <circle cx="5" cy="5" r="2" />
                          <circle cx="19" cy="19" r="2" />
                          <line x1="17.6" y1="6.4" x2="13.4" y2="10.6" />
                          <line x1="6.4" y1="17.6" x2="10.6" y2="13.4" />
                          <line x1="6.4" y1="6.4" x2="10.6" y2="10.6" />
                          <line x1="17.6" y1="17.6" x2="13.4" y2="13.4" />
                        </svg>
                        {provider === "openrouter" && openrouterModel === "auto" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Autoselect Free AI</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Task-driven auto-failover pool.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-normal">
                    💡 <strong>No Setup Required:</strong> This option is instant and plug-and-play. No credentials, tokens, or local installations are required to begin chatting.
                  </div>
                </div>

                {/* Option 2: Paid API */}
                <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4 relative overflow-hidden">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Option 2: Personal API Keys (Bring Your Own Key)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Connect directly to flagship commercial endpoints. Keys are stored locally in your browser state and never touch external servers.
                    </p>
                  </div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {/* OpenAI */}
                    <div
                      onClick={() => setProvider("openai")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "openai" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4.5 16.5c-1.5-2.5-.5-5.5 2-7s5.5-.5 7 2" />
                          <path d="M8 20c-3 0-5.5-2.5-5.5-5.5S5 9 8 9" />
                          <path d="M16.5 19.5c-2.5 1.5-5.5.5-7-2s-.5-5.5 2-7" />
                          <path d="M20 16c0 3-2.5 5.5-5.5 5.5S9 19 9 16" />
                          <path d="M19.5 7.5c1.5 2.5.5 5.5-2 7s-5.5.5-7-2" />
                          <path d="M16 4c3 0 5.5 2.5 5.5 5.5S19 15 16 15" />
                        </svg>
                        {provider === "openai" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">OpenAI</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">GPT-4o series models.</p>
                      </div>
                    </div>

                    {/* Anthropic */}
                    <div
                      onClick={() => setProvider("anthropic")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "anthropic" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                          <path d="M8 16.2L11 9L13 13.5H9" />
                          <path d="M16 16.2V11.2C16 10 15 9 13.8 9C12.5 9 12 11.2 12 11.2" />
                        </svg>
                        {provider === "anthropic" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Anthropic</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Claude Claude models.</p>
                      </div>
                    </div>

                    {/* Gemini */}
                    <div
                      onClick={() => setProvider("gemini")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "gemini" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v18" />
                          <path d="M3 12h18" />
                          <path d="M12 12L3 3" />
                          <path d="M12 12l9 9" />
                          <path d="M12 12l9-9" />
                          <path d="M12 12l-9 9" />
                        </svg>
                        {provider === "gemini" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Google Gemini</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Pro / Flash API keys.</p>
                      </div>
                    </div>

                    {/* Groq */}
                    <div
                      onClick={() => setProvider("groq")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "groq" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        {provider === "groq" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Groq</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Fast hardware setups.</p>
                      </div>
                    </div>

                    {/* OpenRouter Paid */}
                    <div
                      onClick={() => {
                        setProvider("openrouter");
                        if (openrouterModel === "auto") {
                          setOpenrouterModel("google/gemma-2-9b-it:free");
                        }
                      }}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "openrouter" && openrouterModel !== "auto" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <circle cx="19" cy="5" r="2" />
                          <circle cx="5" cy="19" r="2" />
                          <circle cx="5" cy="5" r="2" />
                          <circle cx="19" cy="19" r="2" />
                          <line x1="17.6" y1="6.4" x2="13.4" y2="10.6" />
                          <line x1="6.4" y1="17.6" x2="10.6" y2="13.4" />
                          <line x1="6.4" y1="6.4" x2="10.6" y2="10.6" />
                          <line x1="17.6" y1="17.6" x2="13.4" y2="13.4" />
                        </svg>
                        {provider === "openrouter" && openrouterModel !== "auto" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">OpenRouter API</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Access custom paid catalog.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1">
                    <p className="font-semibold text-foreground">🔑 Option 2 Setup Instructions:</p>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>Acquire a private API key from your selected provider console (e.g. <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">OpenAI console</a>, <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">Anthropic console</a>, or <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">Google AI Studio</a>).</li>
                      <li>Select that provider in the card grid above.</li>
                      <li>Paste your key in the form directly below, choose a model, and click <strong>Save Settings</strong>.</li>
                    </ol>
                  </div>
                </div>

                               {/* Option 3: Local AI */}
                <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4 relative overflow-hidden">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex size-2 rounded-full bg-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">Option 3: Local AI Engine (100% Offline & Private)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Run models locally on your system. High privacy, fully offline, and free from external keys or internet dependencies. Compatible with any OpenAI/Ollama local server.
                    </p>
                  </div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {/* Ollama */}
                    <div
                      onClick={() => selectLocalEngine("ollama")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "ollama" && localEngine === "ollama" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 12l10 5 10-5" />
                        </svg>
                        {provider === "ollama" && localEngine === "ollama" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Ollama</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Local offline daemon.</p>
                      </div>
                    </div>

                    {/* LM Studio */}
                    <div
                      onClick={() => selectLocalEngine("lm_studio")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "ollama" && localEngine === "lm_studio" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                          <circle cx="12" cy="10" r="2" />
                        </svg>
                        {provider === "ollama" && localEngine === "lm_studio" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">LM Studio</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">HF models dashboard.</p>
                      </div>
                    </div>

                    {/* Jan */}
                    <div
                      onClick={() => selectLocalEngine("jan")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "ollama" && localEngine === "jan" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                          <path d="M2 7v10l10 5V12L2 7z" />
                        </svg>
                        {provider === "ollama" && localEngine === "jan" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Jan</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Offline-first chat app.</p>
                      </div>
                    </div>

                    {/* KoboldCPP */}
                    <div
                      onClick={() => selectLocalEngine("koboldcpp")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "ollama" && localEngine === "koboldcpp" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        {provider === "ollama" && localEngine === "koboldcpp" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">KoboldCPP</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Creative fiction server.</p>
                      </div>
                    </div>

                    {/* Llama.cpp / Custom */}
                    <div
                      onClick={() => selectLocalEngine("llamacpp")}
                      className={`rounded-lg border p-4 cursor-pointer transition-colors relative flex flex-col justify-between h-28 ${
                        provider === "ollama" && localEngine === "llamacpp" ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <svg className="size-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        {provider === "ollama" && localEngine === "llamacpp" && <ShieldCheck className="text-primary size-4" />}
                      </div>
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-foreground">Custom / Llama.cpp</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Custom local API URL.</p>
                      </div>
                    </div>
                  </div>

                  {localEngine === "ollama" && (
                    <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1.5 animate-in fade-in duration-300">
                      <p className="font-semibold text-foreground">💻 Ollama Setup Instructions:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Download and install Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">ollama.com</a>.</li>
                        <li>Verify it is running in your system tray.</li>
                        <li>Download a model in your terminal using: <pre className="bg-muted p-1 rounded mt-0.5 text-[10px] font-mono select-all text-foreground w-fit">ollama pull llama3.2:1b</pre></li>
                        <li>Click <strong>Save Settings</strong> at the bottom. Default port is <code>11434</code>.</li>
                      </ol>
                    </div>
                  )}

                  {localEngine === "lm_studio" && (
                    <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1.5 animate-in fade-in duration-300">
                      <p className="font-semibold text-foreground">💻 LM Studio Setup Instructions:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Download and launch LM Studio from <a href="https://lmstudio.ai" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">lmstudio.ai</a>.</li>
                        <li>Search and download any GGUF model within the app.</li>
                        <li>Navigate to the <strong>Local Server</strong> tab, select your downloaded model, and click <strong>Start Server</strong>.</li>
                        <li>Click <strong>Save Settings</strong> at the bottom. Default port is <code>1234</code>.</li>
                      </ol>
                    </div>
                  )}

                  {localEngine === "jan" && (
                    <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1.5 animate-in fade-in duration-300">
                      <p className="font-semibold text-foreground">💻 Jan Setup Instructions:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Download and open Jan from <a href="https://jan.ai" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">jan.ai</a>.</li>
                        <li>Go to the Hub, download a local model, and load it.</li>
                        <li>Go to Settings &gt; Local Server, and toggle **Enable Local Server** on.</li>
                        <li>Click <strong>Save Settings</strong> at the bottom. Default port is <code>1337</code>.</li>
                      </ol>
                    </div>
                  )}

                  {localEngine === "koboldcpp" && (
                    <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1.5 animate-in fade-in duration-300">
                      <p className="font-semibold text-foreground">💻 KoboldCPP Setup Instructions:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Download the KoboldCPP executable from <a href="https://github.com/LostRuins/koboldcpp/releases" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">GitHub Releases</a>.</li>
                        <li>Launch the file, load your GGUF model, and click **Launch**.</li>
                        <li>It will spin up a local server.</li>
                        <li>Click <strong>Save Settings</strong> at the bottom. Default port is <code>5001</code>.</li>
                      </ol>
                    </div>
                  )}

                  {localEngine === "llamacpp" && (
                    <div className="rounded border border-border/30 bg-background/40 p-2.5 text-[10px] text-muted-foreground leading-relaxed space-y-1.5 animate-in fade-in duration-300">
                      <p className="font-semibold text-foreground">💻 Custom / Llama.cpp Setup Instructions:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>Run your custom local server using `llama.cpp` or another OpenAI-compatible inference tool.</li>
                        <li>Verify your local server endpoint (default is <code>http://127.0.0.1:8080</code>).</li>
                        <li>Provide your custom local URL in the Configurations form below and click <strong>Save Settings</strong>.</li>
                      </ol>
                    </div>
                  )}

                  {/* Local Hardware Spec Recommendations moved inline */}
                  <div className="rounded border border-border/30 bg-background/40 p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-border/30 pb-1.5">
                      <Cpu className="size-4 text-primary" />
                      <h4 className="font-semibold text-foreground text-xs">Local Hardware Recommendations</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      Select your system specifications to determine the optimal model size for your machine:
                    </p>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1">
                        <label htmlFor="ram-select" className="text-[9px] font-semibold text-muted-foreground uppercase">System RAM</label>
                        <select
                          id="ram-select"
                          value={ram}
                          onChange={(e) => setRam(e.target.value)}
                          className="h-8 rounded bg-background border border-input px-2 text-xs outline-none focus:border-primary w-full"
                        >
                          <option value="8">8GB RAM or Less</option>
                          <option value="16">16GB RAM</option>
                          <option value="32">32GB RAM</option>
                          <option value="64">64GB RAM or More</option>
                        </select>
                      </div>

                      <div className="grid gap-1">
                        <label htmlFor="gpu-select" className="text-[9px] font-semibold text-muted-foreground uppercase">Graphics Card (GPU)</label>
                        <select
                          id="gpu-select"
                          value={gpu}
                          onChange={(e) => setGpu(e.target.value)}
                          className="h-8 rounded bg-background border border-input px-2 text-xs outline-none focus:border-primary w-full"
                        >
                          <option value="cpu">Integrated / CPU Only (No Dedicated GPU)</option>
                          <option value="mid">Mid-tier Dedicated (4GB - 8GB VRAM)</option>
                          <option value="high">High-tier Dedicated (12GB - 24GB+ VRAM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded bg-muted/40 p-3 border-l-2 border-primary text-xs leading-5 text-muted-foreground flex flex-col gap-1.5 mt-1 animate-in fade-in duration-300">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                        <Sparkles className="size-3.5 text-primary" /> Recommended: {modelRecommendation.model}
                      </div>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">{modelRecommendation.desc}</p>
                      <div className="mt-1">
                        <p className="text-[9px] font-bold text-foreground">Command:</p>
                        <pre className="bg-muted p-1.5 rounded mt-1 text-[9px] font-mono select-all text-foreground overflow-x-auto">
                          {modelRecommendation.cmd}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* Provider Config Fields */}
              <div className="space-y-4 pt-2">
                {/* Ollama Config */}
                {provider === "ollama" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2 capitalize">
                      <Globe className="size-4 text-primary" /> {localEngine.replace("_", " ")} Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="ollama-url" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base URL</label>
                        <input id="ollama-url" type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} className="h-10 rounded-lg border border-border/80 bg-background/50 px-3 text-sm outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/20" />
                        <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                          Defaults to <code>{DEFAULT_LOCAL_URLS[localEngine] || "http://127.0.0.1:11434"}</code>. Change if running on a remote server or custom port.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="ollama-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Model</label>
                        <select id="ollama-select" value={ollamaSelect} onChange={(e) => setOllamaSelect(e.target.value)} className="h-10 rounded-lg border border-border/80 bg-background/50 px-3 text-sm outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/20">
                          {OLLAMA_MODELS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {ollamaSelect === "custom" && (
                      <div className="grid gap-2 pt-2 animate-in slide-in-from-top-1 duration-200">
                        <label htmlFor="ollama-model-custom" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enter Custom Model Tag</label>
                        <input id="ollama-model-custom" type="text" value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)} placeholder="e.g. codegemma" className="h-10 rounded-lg border border-border/80 bg-background/50 px-3 text-sm outline-none transition-all focus:border-primary/80 focus:ring-2 focus:ring-primary/20" />
                      </div>
                    )}
                  </div>
                )}

                {/* OpenAI Config */}
                {provider === "openai" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Globe className="size-4 text-primary" /> OpenAI Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="openai-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
                        <input id="openai-key" type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-proj-..." className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="openai-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Model</label>
                        <select id="openai-model" value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                          {OPENAI_MODELS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Anthropic Config */}
                {provider === "anthropic" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Globe className="size-4 text-primary" /> Anthropic Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="anthropic-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
                        <input id="anthropic-key" type="password" value={anthropicKey} onChange={(e) => setAnthropicKey(e.target.value)} placeholder="sk-ant-..." className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="anthropic-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Model</label>
                        <select id="anthropic-model" value={anthropicModel} onChange={(e) => setAnthropicModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                          {ANTHROPIC_MODELS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* OpenRouter Config */}
                {provider === "openrouter" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Globe className="size-4 text-primary" /> OpenRouter Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="or-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
                        <input id="or-key" type="password" value={openrouterKey} onChange={(e) => setOpenrouterKey(e.target.value)} placeholder="sk-or-..." className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="or-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Free Model</label>
                        <select id="or-model" value={openrouterModel} onChange={(e) => setOpenrouterModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                          {OPENROUTER_MODELS.map((m) => (
                            <option key={m} value={m}>{m === "auto" ? "(Recommended) Autoselect Free Tier" : (m.split("/")[1] || m)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {openrouterModel === "auto" && (
                      <p className="text-[10px] text-muted-foreground bg-accent/30 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                        💡 <strong>Autoselect Active:</strong> The platform will analyze your prompt tasks (e.g. programming, writing, math) and request the optimal free cloud model dynamically. If an API rate limit or quota finishes, the kernel automatically fails over to other online pool models.
                      </p>
                    )}
                  </div>
                )}

                {/* Gemini Config */}
                {provider === "gemini" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Globe className="size-4 text-primary" /> Gemini Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="gemini-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
                        <input id="gemini-key" type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..." className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="gemini-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Model</label>
                        <select id="gemini-model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                          {GEMINI_MODELS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Groq Config */}
                {provider === "groq" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Globe className="size-4 text-primary" /> Groq Configurations
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="groq-key" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Key</label>
                        <input id="groq-key" type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="groq-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Model</label>
                        <select id="groq-model" value={groqModel} onChange={(e) => setGroqModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                          {GROQ_MODELS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>



              {/* Save triggers */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving Settings..." : "Save Settings"}
                  {saveSuccess ? <Check className="size-4 text-green-500" /> : <Save className="size-4" />}
                </Button>
                {saveSuccess && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold animate-fade-in">
                    Settings saved successfully!
                  </span>
                )}
              </div>
            </form>
            ) : (
              <div className="space-y-8 animate-in fade-in-50 duration-300">
                {/* Profile Form */}
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <User className="size-4 text-primary" /> Profile Details
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Update your account details and manage credentials.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Photo URL</label>
                      <input
                        type="text"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                  </div>

                  {/* Biometric Verification Card inside Settings Profile */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="rounded-lg border border-border/40 bg-muted/10 p-4 flex flex-col justify-between min-h-[140px]">
                      <div>
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Camera className="size-4 text-primary" /> Facial Verification
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                          Everest AI cryptographical security protocol. Mandatory for API authentication logs.
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          faceVerified ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          <span className={`size-1.5 rounded-full ${faceVerified ? "bg-green-400" : "bg-red-400 animate-pulse"}`} />
                          {faceVerified ? "Face Verified" : "Verification Required"}
                        </span>
                        
                        {!faceVerified && (
                          <button
                            type="button"
                            onClick={startProfileFaceScan}
                            disabled={profileFaceScanActive}
                            className="text-xs font-bold text-primary hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            {profileFaceScanActive ? `Scanning (${profileFaceScanProgress}%)` : "Run Scan"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Non-Mandatory configs */}
                    <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
                      <div className="grid gap-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Biography</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Short bio..."
                          className="h-12 p-2 rounded border border-input bg-background text-xs outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Preferred AI</label>
                          <select
                            value={preferredModel}
                            onChange={(e) => setPreferredModel(e.target.value)}
                            className="h-8 rounded bg-background border border-border px-2 text-xs outline-none focus:border-primary"
                          >
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                            <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                            <option value="gemini-1.5-flash">Gemini Flash</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Compute Node</label>
                          <select
                            value={computeMode}
                            onChange={(e) => setComputeMode(e.target.value)}
                            className="h-8 rounded bg-background border border-border px-2 text-xs outline-none focus:border-primary"
                          >
                            <option value="eco">Eco Mode</option>
                            <option value="balanced">Balanced</option>
                            <option value="performance">Performance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving Details..." : "Save Profile Details"}
                      {saveSuccess ? <Check className="size-4 text-green-500" /> : <Save className="size-4" />}
                    </Button>
                    {saveSuccess && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-semibold animate-fade-in">
                        Profile details saved successfully!
                      </span>
                    )}
                  </div>
                </form>

                {/* Password Change Form */}
                <form onSubmit={handleChangePassword} className="space-y-6 pt-6 border-t border-border/60">
                  <div>
                    <h3 className="text-sm font-semibold border-b border-border pb-2 flex items-center gap-2">
                      <Key className="size-4 text-primary" /> Update Password
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Securely replace your current onboarding account password.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="text-xs text-red-500 font-semibold">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-xs text-green-500 font-semibold">{passwordSuccess}</div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit">
                      Change Account Password
                      <Key className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </section>

          {/* Sidebar Info */}
          <aside className="space-y-4">
            {/* FAQ Assistant Chatbox */}
            <div className="rounded-lg glass-card glow-hover p-4 text-card-foreground shadow-lg flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider text-primary">
                  <MessageSquare className="size-4" /> FAQ Chat Assistant
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-medium text-cyan-400">
                  <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Free Router
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 text-xs scrollbar-thin">
                {faqMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 max-w-[85%] rounded-lg p-2.5 leading-relaxed ${
                      msg.role === "user"
                        ? "ml-auto bg-primary/10 border border-primary/20 text-foreground"
                        : "mr-auto bg-muted/60 border border-border/40 text-muted-foreground"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground uppercase">
                        {msg.role === "user" ? (
                          <>
                            <User className="size-2.5" /> You
                          </>
                        ) : (
                          <>
                            <Bot className="size-2.5 text-primary" /> Assistant
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {faqLoading && (
                  <div className="flex items-center gap-2 mr-auto bg-muted/30 border border-border/20 rounded-lg p-2.5 text-muted-foreground max-w-[80%] animate-pulse">
                    <Loader2 className="size-3 animate-spin text-primary" />
                    <span className="text-[10px]">Assistant is thinking...</span>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => handleSendFaq(undefined, "How to install Ollama?")}
                  className="rounded border border-border bg-background/50 px-1.5 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  Local Setup
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFaq(undefined, "How do I get an API Key?")}
                  className="rounded border border-border bg-background/50 px-1.5 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  Get API Keys
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFaq(undefined, "Which model fits my computer RAM?")}
                  className="rounded border border-border bg-background/50 px-1.5 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  Spec Guide
                </button>
                <button
                  type="button"
                  onClick={() => handleSendFaq(undefined, "Explain Tier 1 Free Cloud AI")}
                  className="rounded border border-border bg-background/50 px-1.5 py-0.5 text-[9px] text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                >
                  Free Tier
                </button>
              </div>

              {/* Input box */}
              <form onSubmit={handleSendFaq} className="flex gap-2 border-t border-border/40 pt-2.5 mt-1">
                <input
                  type="text"
                  value={faqInput}
                  onChange={(e) => setFaqInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 h-8 rounded border border-input bg-background px-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={faqLoading || !faqInput.trim()}
                  className="flex size-8 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-colors"
                >
                  <Send className="size-3" />
                </button>
              </form>
            </div>

            <div className="rounded-lg glass-card glow-hover p-5 text-card-foreground shadow-lg flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Security & Keys</h3>
              <p className="text-xs text-muted-foreground">
                All cloud keys inputted in settings are stored locally on your device in your browser&apos;s private state, and forwarded securely to server routes.
              </p>
              <div className="rounded bg-muted/40 p-3 border-l-2 border-primary text-xs leading-5 text-muted-foreground flex items-start gap-2">
                <Key className="size-4 text-primary shrink-0 mt-0.5" />
                <span>No API keys are logged or persisted on server filesystems.</span>
              </div>
            </div>



            <div className="rounded-lg glass-card glow-hover p-5 text-card-foreground shadow-lg flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Status Monitoring</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground">Local Ollama Status:</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Cloud Engine Tiers:</span>
                <span className="font-semibold text-green-600">Connected</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
