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
};

export function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [activeProvider, setActiveProvider] = useState("ollama");
  const [activeModel, setActiveModel] = useState("");
  const [providerModel, setProviderModel] = useState("Ollama default");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = localStorage.getItem("ai_provider") ?? "ollama";
      setActiveProvider(p);

      let m = localStorage.getItem("ai_model") ?? "";
      if (!m) {
        if (p === "openrouter") m = localStorage.getItem("openrouter_model") || "auto";
        else if (p === "gemini") m = localStorage.getItem("gemini_model") || "gemini-1.5-flash";
        else if (p === "groq") m = localStorage.getItem("groq_model") || "llama-3.3-70b-versatile";
        else if (p === "openai") m = localStorage.getItem("openai_model") || "gpt-4o-mini";
        else if (p === "anthropic") m = localStorage.getItem("anthropic_model") || "claude-3-5-sonnet-latest";
        else m = localStorage.getItem("ollama_model") || "llama3.1";
      }
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
      setActiveModel(m);
      setProviderModel(m || `${PROVIDER_NAMES[p] || p} default`);
    }
  }, []);

  const requestMessages = useMemo(
    () => [SYSTEM_MESSAGE, ...messages.filter((message) => message.role !== "system")],
    [messages]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextContent = input.trim();

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

    try {
      let providerId = activeProvider;
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
            messages: [SYSTEM_MESSAGE, ...messages],
            providerId,
            model: targetModel || undefined,
            apiKeys,
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

      const payload = (await response.json()) as ChatResponse;

      if (!response.ok || payload.error) {
        throw new Error(
          payload.error?.message ?? "AI Studio could not complete the request."
        );
      }

      const assistantContent = payload.message?.content;

      if (!assistantContent) {
        throw new Error("AI Studio received an empty response.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: assistantContent,
        },
      ]);

      if (payload.provider?.model) {
        setProviderModel(payload.provider.model);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Chat request failed.");
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  const activeProviderName = PROVIDER_NAMES[activeProvider] || activeProvider;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">AI Chat</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Chat with local &amp; cloud models through the AI Studio Kernel.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Messages route through the AI Studio Kernel so future providers can
            plug into the same feature boundary.
          </p>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
          <h2 className="text-sm font-semibold">Engine Status</h2>
          <div className="mt-4 grid gap-2">
            <label htmlFor="model-override" className="text-xs font-medium text-muted-foreground">
              Model override
            </label>
            <input
              id="model-override"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder="e.g. auto (or leave blank for active)"
            />
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Provider</dt>
              <dd className="font-medium capitalize">{activeProviderName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Active model</dt>
              <dd className="max-w-36 truncate font-medium">{providerModel}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid min-h-[34rem] grid-rows-[1fr_auto] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Bot className="size-4" aria-hidden="true" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-3xl rounded-lg border px-4 py-3 text-sm leading-6",
                  message.role === "user"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <UserRound className="size-4" aria-hidden="true" />
                </div>
              )}
            </article>
          ))}

          {isSending && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              {activeProviderName} is generating a response
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-background/70 p-4"
        >
          {error && (
            <p
              className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-h-24 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder={`Ask ${activeProviderName} to draft, research, outline, or reason through a task.`}
              aria-label="Chat message"
            />
            <Button type="submit" disabled={isSending || !input.trim()} className="sm:self-end">
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
