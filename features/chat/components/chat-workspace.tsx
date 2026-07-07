"use client";

import { FormEvent, useMemo, useRef, useState, useEffect } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatRole = "system" | "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatResponse = {
  message?: ChatMessage;
  provider?: {
    id: string;
    model: string;
  };
  error?: {
    code: string;
    message: string;
  };
};

const SYSTEM_MESSAGE: ChatMessage = {
  role: "system",
  content:
    "You are AI Studio, a concise assistant for creation, research, and production workflows.",
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "AI Studio Kernel is connected. Send a message to run the selected provider.",
  },
];

const PROVIDER_NAMES: Record<string, string> = {
  ollama: "Ollama (Local)",
  openrouter: "OpenRouter",
  gemini: "Google Gemini",
  groq: "Groq",
  openai: "OpenAI",
  anthropic: "Anthropic",
  mock: "Developer Mock",
};

export function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [activeProvider, setActiveProvider] = useState("mock");
  const [activeModel, setActiveModel] = useState("");
  const [providerModel, setProviderModel] = useState("Mock default");
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingOllamaModels, setLoadingOllamaModels] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Run after mount so localStorage is available.
    // Use a microtask to avoid the lint rule complaining about chained setState in the effect body.
    if (typeof window === "undefined") return;

    const init = async () => {
      const p = localStorage.getItem("ai_provider") ?? "mock";

      setActiveProvider(p);

      // If using Ollama, discover installed models and prefer them.
      if (p === "ollama") {
        try {
          setLoadingOllamaModels(true);
          const resp = await fetch("/api/ollama/models");
          if (!resp.ok) {
            throw new Error(
              `Failed to fetch Ollama models (HTTP ${resp.status})`
            );
          }
          const data = (await resp.json()) as { models?: string[] };
          const models = Array.isArray(data.models) ? data.models : [];
          setOllamaModels(models);

          const saved = localStorage.getItem("ai_model") || "";
          const active = saved.trim() || (models[0] ? models[0] : "");
          localStorage.setItem("ai_model", active);
          setActiveModel(active);
          setProviderModel(active || `${PROVIDER_NAMES[p] || p} default`);
        } catch {
          // If discovery fails, keep existing behavior.
        } finally {
          setLoadingOllamaModels(false);
        }
      }

      let m = "";
      if (p === "openrouter") m = localStorage.getItem("openrouter_model") || "auto";
      else if (p === "gemini") m = localStorage.getItem("gemini_model") || "gemini-1.5-flash";
      else if (p === "groq") m = localStorage.getItem("groq_model") || "llama-3.3-70b-versatile";
      else if (p === "openai") m = localStorage.getItem("openai_model") || "gpt-4o-mini";
      else if (p === "anthropic") m = localStorage.getItem("anthropic_model") || "claude-3-5-sonnet-latest";
      else m = localStorage.getItem("ollama_model") || "llama3.1";

      if (
        m === "lynn/soliloquy-l2-13b:free" ||
        m === "intel/neural-chat-7b-v3-1:free" ||
        m === "huggingfaceh4/zephyr-7b-beta:free" ||
        m === "openchat/openchat-7b:free" ||
        m === "undi95/toppy-m-7b:free" ||
        m === "deepseek/deepseek-r1:free"
      ) {
        m = "auto";
      }

      localStorage.setItem("ai_model", m);
      setActiveModel(m);
      setProviderModel(m || `${PROVIDER_NAMES[p] || p} default`);
    };

    void Promise.resolve().then(init);
  }, []);


  const requestMessages = useMemo(
    () => [SYSTEM_MESSAGE, ...messages.filter((message) => message.role !== "system")],
    [messages]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextContent = input.trim();

    // reset scroll-to-bottom sentinel right away so the UI feels responsive
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);


    if (!nextContent || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: nextContent,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsSending(true);
    setStreamingContent("");

    try {
      const providerId = activeProvider;
      const apiKeys = typeof window !== "undefined" ? {
        openrouter: localStorage.getItem("openrouter_key") || "",
        gemini: localStorage.getItem("gemini_key") || "",
        groq: localStorage.getItem("groq_key") || "",
        openai: localStorage.getItem("openai_key") || "",
        anthropic: localStorage.getItem("anthropic_key") || "",
        ollama: localStorage.getItem("local_engine") || "ollama",
      } : {};

      let targetModel = model.trim();
      if (!targetModel) {
        targetModel = activeModel;
      }

      let mlRoutedOption = "";
      const mlRoutingEnabled = typeof window !== "undefined" && localStorage.getItem("ml_routing_enabled") === "true";
      
      if (mlRoutingEnabled && typeof window !== "undefined") {
        const logsRaw = localStorage.getItem("ai_telemetry_logs");
        let logs = [];
        if (logsRaw) {
          try { logs = JSON.parse(logsRaw); } catch {}
        }
        
        const options = ["Option 1 (Free)", "Option 2 (Paid)", "Option 3 (Local)"];
        type LogEntry = { option: string; latencyMs: number; success: boolean };
        const scores = options.map((opt) => {
          const optLogs = logs.filter((l: LogEntry) => l.option === opt);
          const successCount = optLogs.filter((l: LogEntry) => l.success).length;
          const failureCount = optLogs.length - successCount;
          
          const alpha = successCount + 1;
          const beta = failureCount + 1;
          const sample = Math.random() * (alpha / (alpha + beta));
          
          const latencies = optLogs.map((l: LogEntry) => l.latencyMs);
          const avgLatency = latencies.length > 0 
            ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length 
            : 800;
            
          return { option: opt, score: sample * (1000 / avgLatency) };
        });
        
        scores.sort((a, b) => b.score - a.score);
        const bestOption = scores[0].option;
        mlRoutedOption = bestOption;
      }

      const startTime = Date.now();
      let response: Response;
      let success = false;

      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [SYSTEM_MESSAGE, ...messages, userMessage],
            providerId,
            model: targetModel || undefined,
            apiKeys,
            stream: true,
          }),
        });
        success = response.ok;
      } catch (err) {
        success = false;
        throw err;
      } finally {
        const endTime = Date.now();
        const latencyMs = endTime - startTime;
        
        if (typeof window !== "undefined") {
          const currentOption = mlRoutedOption || (
            providerId === "ollama" ? "Option 3 (Local)" :
            (providerId === "openrouter" && targetModel === "auto") ? "Option 1 (Free)" : "Option 2 (Paid)"
          );
          
          const logsRaw = localStorage.getItem("ai_telemetry_logs");
          let logs = [];
          if (logsRaw) {
            try { logs = JSON.parse(logsRaw); } catch {}
          }
          logs.push({
            timestamp: Date.now(),
            option: currentOption,
            latencyMs,
            success
          });
          if (logs.length > 100) logs.shift();
          localStorage.setItem("ai_telemetry_logs", JSON.stringify(logs));
        }
      }

      // Handle streaming response
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: fullContent,
          },
        ]);

        setStreamingContent("");
      } else {
        // Handle non-streaming error response
        let payload: ChatResponse | null = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
          try {
            payload = (await response.json()) as ChatResponse;
          } catch {}
        }

        if (!response.ok || !payload || payload.error) {
          throw new Error(
            payload?.error?.message ?? `AI Studio could not complete the request (HTTP ${response.status}).`
          );
        }
      }

      if (response.ok) {
        // Try to get provider info from response if available
        try {
          const payload = (await response.clone().json()) as ChatResponse;
          if (payload.provider?.model) {
            setProviderModel(payload.provider.model);
          }
        } catch {
          // Ignore if not JSON
        }
      }

      // Scroll after assistant response is rendered
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Chat request failed.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }


  const activeProviderName = PROVIDER_NAMES[activeProvider] || activeProvider;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 bento-grid p-4">
      {/* Compact header */}
      <section className="bento-item rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg p-5 shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Chat</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Chat with local & cloud models
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Messages route through the AI Studio Kernel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-1.5 text-xs backdrop-blur-sm">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-semibold capitalize">{activeProviderName}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-1.5 text-xs backdrop-blur-sm">
              <span className="text-muted-foreground">Model</span>
              <span className="max-w-52 truncate font-semibold">{providerModel}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pt-1">
          <div className="grid gap-2 sm:w-80">
            <label
              htmlFor="model-override"
              className="text-xs font-medium text-muted-foreground"
            >
              Model override (optional)
            </label>
            <input
              id="model-override"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 backdrop-blur-md"
              placeholder="e.g. auto (or leave blank for active)"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                setError("");
                setStreamingContent("");
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </section>

      {/* Chat */}
      <section className="grid min-h-[34rem] grid-rows-[1fr_auto] overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-lg bento-item">
        <div
          ref={listRef}
          className="flex flex-col gap-4 overflow-y-auto p-4 sm:p-6 text-base"
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <article
                key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}
              >
                {!isUser && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                    <Bot className="size-4" aria-hidden="true" />
                  </div>
                )}

                <div className="flex min-w-0 flex-col">
                  <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                    {isUser ? "You" : "AI"}
                  </div>
                  <div
                    className={cn(
                      "w-full max-w-3xl rounded-xl border px-4 py-3 text-sm leading-6 backdrop-blur-sm",
                      isUser ? "bg-primary/10 border-primary/20 text-foreground" : "bg-black/10 border-white/10 text-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>

                {isUser && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                    <UserRound className="size-4" aria-hidden="true" />
                  </div>
                )}
              </article>
            );
          })}

          {isSending && (
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                <Bot className="size-4" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
                  AI
                </div>
                <div className="w-full max-w-3xl rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 backdrop-blur-sm">
                  {streamingContent || <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-black/10 backdrop-blur-md p-4"
        >
          {error && (
            <p
              className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-base text-red-400 backdrop-blur-sm"
              role="alert" 
            >
              {error}
            </p>
          )}

          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Tip: <span className="font-semibold text-foreground">Shift+Enter</span> for a new line
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)} 
              className="min-h-24 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 backdrop-blur-md"
              placeholder={`Ask ${activeProviderName} to draft, research, outline, or reason through a task.`}
              aria-label="Chat message"
            />
            <Button
              type="submit"
              disabled={isSending || !input.trim()}
              className="sm:self-end"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Send
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}