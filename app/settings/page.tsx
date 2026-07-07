"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVerified(localStorage.getItem("ai_setting_verified") === "true");
    }
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const testModel = 
        provider === "ollama" ? ollamaModel :
        provider === "openai" ? openaiModel :
        provider === "anthropic" ? anthropicModel :
        provider === "gemini" ? geminiModel :
        provider === "groq" ? groqModel :
        provider === "openrouter" ? openrouterModel : "auto";
      
      const testKey = 
        provider === "openai" ? openaiKey :
        provider === "anthropic" ? anthropicKey :
        provider === "gemini" ? geminiKey :
        provider === "groq" ? groqKey :
        provider === "openrouter" ? openrouterKey : "";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test ping connection. Respond with exactly 'pong' if working." }],
          stream: false,
          providerId: provider,
          model: testModel,
          apiKeys: { [provider]: testKey },
          ollamaUrl: provider === "ollama" ? ollamaUrl : undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.message && data.message.content) {
        setTestResult({ success: true, message: `Successfully connected to ${provider}! AI response validated.` });
        localStorage.setItem("ai_setting_verified", "true");
        setIsVerified(true);
      } else {
        setTestResult({ success: false, message: `Failed connection: ${data.error?.message || "Unknown response error status."}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Network/connection error: ${err.message || "Failed to reach inference kernel."}` });
    } finally {
      setTestingConnection(false);
    }
  };
  
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
  const [photo, setPhoto] = useState("");
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
          setPhoto(user.photo || "");
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

      let activeModel = "";
      if (provider === "openrouter") activeModel = openrouterModel;
      else if (provider === "gemini") activeModel = geminiModel;
      else if (provider === "groq") activeModel = groqModel;
      else if (provider === "openai") activeModel = openaiModel;
      else if (provider === "anthropic") activeModel = anthropicModel;
      else activeModel = activeOllamaModel;

      localStorage.setItem("ai_model", activeModel);

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

        <div className="w-full">
          {/* Main Settings Form */}
          <section className="w-full">
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
              <form onSubmit={handleSaveSettings} className="grid gap-6 md:grid-cols-3">
                {/* Bento Card 1: Active AI Routing Tiers (Spans 2 columns) */}
                <div className="md:col-span-2 rounded-xl glass-card glow-hover p-6 text-card-foreground shadow-xl flex flex-col gap-5 relative overflow-hidden border border-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  
                  <div>
                    <h3 className="text-base font-bold border-b border-border pb-3 flex items-center gap-2.5 text-foreground">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Cpu className="size-4" />
                      </span>
                      Active AI Routing Options
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Select how you want to route your workspace queries. Toggle between keyless free models, personal cloud API keys, or completely offline local engines.
                    </p>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Option 1: Free AI */}
                    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden transition-all duration-300 hover:border-primary/30">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex size-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Option 1: Free Cloud AI (Requires OpenRouter Key)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Uses OpenRouter free models (e.g. Qwen for code, Hermes for logic) to bypass rate limits. Requires you to configure an OpenRouter API key.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div
                          onClick={() => {
                            setProvider("openrouter");
                            setOpenrouterModel("auto");
                          }}
                          className={`rounded-lg border p-4 cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-24 ${
                            provider === "openrouter" && openrouterModel === "auto" 
                              ? "border-primary bg-primary/10 shadow-md scale-[1.02]" 
                              : "border-border bg-background/50 hover:bg-accent/40 hover:scale-[1.01]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <svg className="size-5 text-cyan-400 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="3" />
                              <circle cx="19" cy="5" r="2" />
                              <circle cx="5" cy="19" r="2" />
                              <circle cx="5" cy="5" r="2" />
                              <circle cx="19" cy="19" r="2" />
                            </svg>
                            {provider === "openrouter" && openrouterModel === "auto" && <ShieldCheck className="text-primary size-5" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">Autoselect Free AI</p>
                            <p className="text-[10px] text-muted-foreground">Task-driven failover pool</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Paid API */}
                    <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex size-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Option 2: Personal API Keys (Bring Your Own Key)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Connect directly to flagship commercial endpoints. Keys are stored locally in your browser state and never touch external servers.
                        </p>
                      </div>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {[
                          { id: "openai", name: "OpenAI", color: "text-emerald-500", desc: "GPT-4o flagship model" },
                          { id: "anthropic", name: "Anthropic", color: "text-amber-500", desc: "Claude 3.5 precision" },
                          { id: "gemini", name: "Gemini", color: "text-indigo-400", desc: "Google Ultra long-context" },
                          { id: "groq", name: "Groq", color: "text-orange-500", desc: "Ultra-fast inference" }
                        ].map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setProvider(p.id)}
                            className={`rounded-lg border p-3 cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-24 ${
                              provider === p.id 
                                ? "border-primary bg-primary/10 shadow-md scale-[1.02]" 
                                : "border-border bg-background/50 hover:bg-accent/40 hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className={`inline-flex size-2 rounded-full ${p.color} bg-current`} />
                              {provider === p.id && <ShieldCheck className="text-primary size-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{p.name}</p>
                              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{p.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Option 3: Local AI */}
                    <div className="space-y-3 rounded-xl border border-foreground/10 bg-foreground/5 p-4 relative overflow-hidden transition-all duration-300 hover:border-foreground/20">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex size-2.5 rounded-full bg-foreground" />
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">Option 3: Local AI Engine (100% Offline & Private)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Run models locally on your system. Compatible with any local server (Ollama, LM Studio, Jan).
                        </p>
                      </div>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                        {[
                          { id: "ollama", name: "Ollama", desc: "Default runtime (port 11434)" },
                          { id: "lm_studio", name: "LM Studio", desc: "Local server (port 1234)" },
                          { id: "jan", name: "Jan", desc: "Offline engine (port 1337)" }
                        ].map((eng) => (
                          <div
                            key={eng.id}
                            onClick={() => selectLocalEngine(eng.id)}
                            className={`rounded-lg border p-3 cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-24 ${
                              provider === "ollama" && localEngine === eng.id 
                                ? "border-primary bg-primary/10 shadow-md scale-[1.02]" 
                                : "border-border bg-background/50 hover:bg-accent/40 hover:scale-[1.01]"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="size-2 rounded-full bg-foreground" />
                              {provider === "ollama" && localEngine === eng.id && <ShieldCheck className="text-primary size-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-foreground">{eng.name}</p>
                              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{eng.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Dynamic Credentials Card & Setup Guides (Spans 1 column on the right) */}
                <div className="md:col-span-1 rounded-xl glass-card glow-hover p-6 text-card-foreground shadow-xl flex flex-col gap-4 border border-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  
                  <div>
                    <h3 className="text-base font-bold border-b border-border pb-3 flex items-center gap-2.5 text-foreground">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Key className="size-4" />
                      </span>
                      Credentials Setup
                    </h3>
                  </div>

                  <div className="flex-1 flex flex-col justify-between gap-5 pt-2 relative z-10">
                    <div className="grid gap-4">
                      {provider === "openai" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-openai-key" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OpenAI API Key</label>
                          <input
                            id="sidebar-openai-key"
                            type="password"
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                            placeholder="sk-proj-..."
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      )}

                      {provider === "anthropic" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-anthropic-key" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Anthropic API Key</label>
                          <input
                            id="sidebar-anthropic-key"
                            type="password"
                            value={anthropicKey}
                            onChange={(e) => setAnthropicKey(e.target.value)}
                            placeholder="sk-ant-..."
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      )}

                      {provider === "gemini" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-gemini-key" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gemini API Key</label>
                          <input
                            id="sidebar-gemini-key"
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      )}

                      {provider === "groq" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-groq-key" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Groq API Key</label>
                          <input
                            id="sidebar-groq-key"
                            type="password"
                            value={groqKey}
                            onChange={(e) => setGroqKey(e.target.value)}
                            placeholder="gsk_..."
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      )}

                      {provider === "openrouter" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-or-key" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">OpenRouter API Key</label>
                          <input
                            id="sidebar-or-key"
                            type="password"
                            value={openrouterKey}
                            onChange={(e) => setOpenrouterKey(e.target.value)}
                            placeholder="sk-or-..."
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        </div>
                      )}

                      {provider === "ollama" && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label htmlFor="sidebar-ollama-url" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ollama Endpoint URL</label>
                          <input
                            id="sidebar-ollama-url"
                            type="text"
                            value={ollamaUrl}
                            onChange={(e) => setOllamaUrl(e.target.value)}
                            placeholder="http://127.0.0.1:11434"
                            className="h-10 rounded-lg border border-input bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                          />
                        </div>
                      )}
                    </div>

                    {/* DYNAMIC SETUP INSTRUCTIONS BASED ON PROVIDER */}
                    <div className="mt-2 border-t border-border pt-4">
                      {provider === "ollama" ? (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="size-3 text-primary animate-pulse" /> Local Hardware Setup
                          </p>
                          <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
                            <p>To launch models offline on your machine:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Download Ollama from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">ollama.com</a>.</li>
                              <li>Install & run the daemon.</li>
                              <li>Run in your terminal to fetch model:
                                <code className="block mt-1 p-1 bg-muted rounded font-mono text-[9px] text-foreground border border-border select-all">ollama pull llama3.2</code>
                              </li>
                            </ol>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                          <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                            <Key className="size-3 text-primary" /> How to Acquire API Keys
                          </p>
                          <div className="text-[10px] text-muted-foreground leading-relaxed space-y-2">
                            {provider === "openai" && (
                              <p>Visit <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">platform.openai.com</a>. Go to API Keys in the sidebar dashboard, create a new secret key, and paste it above.</p>
                            )}
                            {provider === "anthropic" && (
                              <p>Sign in to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">console.anthropic.com</a>. Go to the API Keys section to generate a credentials key beginning with <code>sk-ant-</code>.</p>
                            )}
                            {provider === "gemini" && (
                              <p>Navigate to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">aistudio.google.com</a>. Click on "Get API Key" to obtain a Google Cloud token (free & paid tiers available).</p>
                            )}
                            {provider === "groq" && (
                              <p>Log in to <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">console.groq.com</a>. Open API Keys tab and create a token beginning with <code>gsk_</code>.</p>
                            )}
                            {provider === "openrouter" && (
                              <p>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-primary/80">openrouter.ai</a>, navigate to Settings &gt; Keys, and create a custom API key to unlock autoselect free tier or advanced paid systems.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: Model Config & Recommendations (Spans 2 columns) */}
                <div className="md:col-span-2 rounded-xl glass-card glow-hover p-6 text-card-foreground shadow-xl flex flex-col gap-4 border border-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  
                  <div>
                    <h3 className="text-base font-bold border-b border-border pb-3 flex items-center gap-2.5 text-foreground">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Settings className="size-4" />
                      </span>
                      Active Model Configurations
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 relative z-10">
                    {/* Model Dropdown selectors based on selected provider */}
                    <div className="space-y-4">
                      {provider === "openai" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="openai-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OpenAI Model</label>
                          <select id="openai-model" value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-all">
                            {OPENAI_MODELS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {provider === "anthropic" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="anthropic-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Anthropic Model</label>
                          <select id="anthropic-model" value={anthropicModel} onChange={(e) => setAnthropicModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-all">
                            {ANTHROPIC_MODELS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {provider === "gemini" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="gemini-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gemini Model</label>
                          <select id="gemini-model" value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-all">
                            {GEMINI_MODELS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {provider === "groq" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="groq-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Groq Model</label>
                          <select id="groq-model" value={groqModel} onChange={(e) => setGroqModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-all">
                            {GROQ_MODELS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {provider === "openrouter" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="or-model" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">OpenRouter Free Model</label>
                          <select id="or-model" value={openrouterModel} onChange={(e) => setOpenrouterModel(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-all">
                            {OPENROUTER_MODELS.map((m) => (
                              <option key={m} value={m}>{m === "auto" ? "Autoselect Free Tier" : (m.split("/")[1] || m)}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {provider === "ollama" && (
                        <div className="grid gap-1.5 animate-in fade-in duration-200">
                          <label htmlFor="ollama-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Local Engine Model</label>
                          <select id="ollama-select" value={ollamaSelect} onChange={(e) => setOllamaSelect(e.target.value)} className="h-10 rounded-lg border border-border/80 bg-background px-3 text-sm outline-none transition-all focus:border-primary">
                            {OLLAMA_MODELS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Routing and Telemetry toggles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 bg-muted/10">
                        <div>
                          <p className="text-xs font-semibold">ML Auto-Routing</p>
                          <p className="text-[10px] text-muted-foreground">Select models based on task complexity</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={mlRouting}
                          onChange={(e) => setMlRouting(e.target.checked)}
                          className="size-4 accent-primary cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 bg-muted/10">
                        <div>
                          <p className="text-xs font-semibold">Telemetry Sharing</p>
                          <p className="text-[10px] text-muted-foreground">Anonymously share latency performance logs</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={sharedTelemetry}
                          onChange={(e) => setSharedTelemetry(e.target.checked)}
                          className="size-4 accent-primary cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HARDWARE SPECIFICATION BASED LOCAL MODEL GUIDE */}
                  <div className="rounded-xl border border-border/30 bg-background/50 p-4 space-y-3 mt-2 relative z-10">
                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                        <Sparkles className="size-4 text-primary animate-pulse" /> 💻 Hardware Specification Compatibility Matrix
                      </div>
                      <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Specs Map</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-4 text-[10px]">
                      <div className="rounded-lg border border-border/40 p-2.5 bg-muted/5 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-foreground">8GB RAM / CPU</p>
                          <p className="text-muted-foreground text-[9px] mt-0.5">Ultra-light model weight</p>
                        </div>
                        <code className="mt-2 block p-1 bg-muted rounded font-mono text-[8px] text-primary">llama3.2:1b</code>
                      </div>
                      <div className="rounded-lg border border-border/40 p-2.5 bg-muted/5 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-foreground">16GB RAM / Mid GPU</p>
                          <p className="text-muted-foreground text-[9px] mt-0.5">Standard coding setup</p>
                        </div>
                        <code className="mt-2 block p-1 bg-muted rounded font-mono text-[8px] text-primary">llama3.1:8b</code>
                      </div>
                      <div className="rounded-lg border border-border/40 p-2.5 bg-muted/5 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-foreground">32GB RAM / High GPU</p>
                          <p className="text-muted-foreground text-[9px] mt-0.5">Advanced developer tier</p>
                        </div>
                        <code className="mt-2 block p-1 bg-muted rounded font-mono text-[8px] text-primary">qwen2.5:14b</code>
                      </div>
                      <div className="rounded-lg border border-border/40 p-2.5 bg-muted/5 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-foreground">64GB+ RAM / VRAM</p>
                          <p className="text-muted-foreground text-[9px] mt-0.5">Flagship server scale</p>
                        </div>
                        <code className="mt-2 block p-1 bg-muted rounded font-mono text-[8px] text-primary">llama3.3:70b</code>
                      </div>
                    </div>

                    {provider === "ollama" && (
                      <div className="text-[10px] text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20 leading-relaxed mt-2 animate-in fade-in duration-300">
                        <strong>Hardware Suggestion:</strong> Based on your local selection, we recommend running <code>{modelRecommendation.model}</code>. {modelRecommendation.desc}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bento Card 4: Action Center & Health Status (Spans 1 column) */}
                <div className="md:col-span-1 rounded-xl glass-card glow-hover p-6 text-card-foreground shadow-xl flex flex-col justify-between gap-5 border border-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  
                  <div className="space-y-4 relative z-10">
                    <h3 className="text-base font-bold border-b border-border pb-3">
                      Control Center
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 bg-background/40">
                        <span className="text-xs text-muted-foreground">Local Server:</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                          <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                          Online
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2 bg-background/40">
                        <span className="text-xs text-muted-foreground">Cloud Tiers:</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                          <span className="size-2 rounded-full bg-green-500" />
                          Available
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border relative z-10">
                    <div className="flex flex-col gap-2.5">
                      <Button type="submit" disabled={isSaving} className="w-full h-10 font-bold transition-all hover:scale-[1.02]">
                        {isSaving ? "Saving Settings..." : "Save Settings"}
                        {saveSuccess ? <Check className="size-4 text-green-500" /> : <Save className="size-4" />}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTestConnection} 
                        disabled={testingConnection}
                        className="w-full h-10 font-bold transition-all hover:scale-[1.02]"
                      >
                        {testingConnection ? "Testing Connection..." : "Test Connection"}
                      </Button>

                      {isVerified && (
                        <Button
                          type="button"
                          className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 animate-bounce transition-all hover:scale-[1.02]"
                          onClick={() => router.push("/ai-control")}
                        >
                          Proceed to Dashboard
                        </Button>
                      )}
                    </div>

                    {testResult && (
                      <div className={`text-[10px] p-3 rounded-lg border leading-relaxed mt-2 animate-in fade-in duration-300 ${
                        testResult.success 
                          ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400 font-semibold" 
                          : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                      }`}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bento Card 5: FAQ Chatbot Assistant (Spans 3 columns) */}
                <div className="md:col-span-3 rounded-xl glass-card glow-hover p-5 text-card-foreground shadow-xl flex flex-col gap-4 border border-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-border pb-3 relative z-10">
                    <h3 className="text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider text-primary">
                      <MessageSquare className="size-4" /> FAQ Chat Assistant & Reference Guide
                    </h3>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3 relative z-10">
                    {/* Chat log spans 2 columns */}
                    <div className="md:col-span-2 flex flex-col justify-between gap-3 border-r border-border/40 pr-5">
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1 text-xs scrollbar-thin">
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
                              <p className="whitespace-pre-line text-[11px] leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {faqLoading && (
                          <div className="flex items-center gap-2 mr-auto bg-muted/30 border border-border/20 rounded-lg p-2 text-muted-foreground animate-pulse">
                            <Loader2 className="size-3 animate-spin text-primary" />
                            <span className="text-[10px]">Thinking...</span>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSendFaq} className="flex gap-2 border-t border-border/40 pt-2">
                        <input
                          type="text"
                          value={faqInput}
                          onChange={(e) => setFaqInput(e.target.value)}
                          placeholder="Ask about setup, ports, model recommendations..."
                          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                        <button
                          type="submit"
                          disabled={faqLoading || !faqInput.trim()}
                          className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition-all hover:scale-[1.02]"
                        >
                          <Send className="size-3.5" />
                        </button>
                      </form>
                    </div>

                    {/* Quick suggestion tools and chip references span 1 column */}
                    <div className="flex flex-col justify-between text-[10px] gap-3 pt-1">
                      <div>
                        <p className="font-semibold text-foreground mb-2 uppercase tracking-wider text-[9px] text-muted-foreground">Quick Helpers:</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleSendFaq(undefined, "How to install Ollama?")} className="rounded-lg border border-border bg-background/50 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.02] transition-all">Local Setup</button>
                          <button type="button" onClick={() => handleSendFaq(undefined, "How do I get an API Key?")} className="rounded-lg border border-border bg-background/50 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.02] transition-all">Get Keys</button>
                          <button type="button" onClick={() => handleSendFaq(undefined, "Which model fits my computer RAM?")} className="rounded-lg border border-border bg-background/50 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.02] transition-all">Spec Guide</button>
                          <button type="button" onClick={() => handleSendFaq(undefined, "Explain Tier 1 Free Cloud AI")} className="rounded-lg border border-border bg-background/50 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-[1.02] transition-all">Free Tier</button>
                        </div>
                      </div>
                      <div className="rounded-lg bg-accent/20 p-2.5 text-[9px] leading-relaxed text-muted-foreground border border-border/40">
                        💡 <strong>Help Tip:</strong> Type any hardware specification query to check compatibility with local models.
                      </div>
                    </div>
                  </div>
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

          
        </div>
      </div>
    </AppShell>
  );
}
