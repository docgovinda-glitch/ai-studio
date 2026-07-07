"use client";

import { useState, useCallback } from "react";
import { PenLine, Bot, Sparkles, Wand2, Copy, Check, FileDown, ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function WritingStudioPage() {
  const [title, setTitle] = useState("Creator Launch Campaign - Blog Post");
  const [content, setContent] = useState(
    `# Launch Campaign: The Future of AI Studios\n\nWriting content should not involve switching back and forth between context-less chatbot tabs and separate writing processors. AI Studio unifies the full lifecycle of content creation inside a single professional dashboard.\n\n## Core Objective\nDescribe how creators, researchers, and developers benefit from an integrated workflow kernel.`
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const quickPrompts = [
    { label: "Outline blog", prompt: "Create a 4-step blog post outline based on this content" },
    { label: "Suggest catchy hooks", prompt: "Draft 3 engaging hooks/introductions for this article" },
    { label: "Improve structure", prompt: "Review my draft text and suggest structural improvements" },
    { label: "Draft call-to-action", prompt: "Create an inspiring conclusion and call-to-action (CTA) for the end" },
  ];

  const handleAiAssist = useCallback(async (customPrompt?: string) => {
    const promptToSend = customPrompt ?? aiPrompt;
    if (!promptToSend.trim() || isGenerating) return;

    setIsGenerating(true);
    setAiResponse("");
    setInserted(false);

    try {
      // Build context: send current document state + instructions
      const messages = [
        {
          role: "system",
          content: "You are the Writing Assistant in AI Studio. Analyze the provided document context and follow the user instructions exactly.",
        },
        {
          role: "user",
          content: `Document Title: ${title}\n\nDocument Content:\n${content}\n\nInstruction: ${promptToSend}`,
        },
      ];

      const activeProvider = typeof window !== "undefined" ? localStorage.getItem("ai_provider") ?? "ollama" : "ollama";
      const apiKeys = typeof window !== "undefined" ? {
        openrouter: localStorage.getItem("openrouter_key") || "",
        gemini: localStorage.getItem("gemini_key") || "",
        groq: localStorage.getItem("groq_key") || "",
        openai: localStorage.getItem("openai_key") || "",
        anthropic: localStorage.getItem("anthropic_key") || "",
        ollama: localStorage.getItem("local_engine") || "ollama",
      } : {};

      let targetModel = "";
      if (typeof window !== "undefined") {
        if (activeProvider === "openrouter") {
          targetModel = localStorage.getItem("openrouter_model") || "auto";
        } else if (activeProvider === "gemini") {
          targetModel = localStorage.getItem("gemini_model") || "gemini-2.5-flash";
        } else if (activeProvider === "groq") {
          targetModel = localStorage.getItem("groq_model") || "llama-3.3-70b-versatile";
        } else if (activeProvider === "openai") {
          targetModel = localStorage.getItem("openai_model") || "gpt-4o-mini";
        } else if (activeProvider === "anthropic") {
          targetModel = localStorage.getItem("anthropic_model") || "claude-3-5-sonnet-latest";
        } else if (activeProvider === "ollama") {
          targetModel = localStorage.getItem("ollama_model") || "llama3.1";
        }
      }

      let mlRoutedOption = "";
      const mlRoutingEnabled = typeof window !== "undefined" && localStorage.getItem("ml_routing_enabled") === "true";
      
      if (mlRoutingEnabled && typeof window !== "undefined") {
        const logsRaw = localStorage.getItem("ai_telemetry_logs");
        type LogEntry = { option: string; latencyMs: number; success: boolean };
        let logs: LogEntry[] = [];
        if (logsRaw) {
          try { logs = JSON.parse(logsRaw); } catch {}
        }
        
        const options = ["Option 1 (Free)", "Option 2 (Paid)", "Option 3 (Local)"];
        const scores = options.map((opt) => {
          const optLogs = logs.filter((l) => l.option === opt);
          const successCount = optLogs.filter((l) => l.success).length;
          const failureCount = optLogs.length - successCount;
          
          const alpha = successCount + 1;
          const beta = failureCount + 1;
          const sample = Math.random() * (alpha / (alpha + beta));
          
          const latencies = optLogs.map((l) => l.latencyMs);
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
      let res: Response;
      let success = false;

      try {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            providerId: activeProvider,
            model: targetModel || undefined,
            apiKeys,
          }),
        });
        success = res.ok;
      } catch (err) {
        success = false;
        throw err;
      } finally {
        const endTime = Date.now();
        const latencyMs = endTime - startTime;
        
        if (typeof window !== "undefined") {
          const currentOption = mlRoutedOption || (
            activeProvider === "ollama" ? "Option 3 (Local)" :
            (activeProvider === "openrouter" && targetModel === "auto") ? "Option 1 (Free)" : "Option 2 (Paid)"
          );
          
          const logsRaw = localStorage.getItem("ai_telemetry_logs");
          type LogEntry = { option: string; latencyMs: number; success: boolean; timestamp?: number };
          let logs: LogEntry[] = [];
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

      if (!res.ok) {
        throw new Error("AI Assistant failed to generate content.");
      }

      const data = await res.json();
      setAiResponse(data.message?.content ?? "");
    } catch (err) {
      setAiResponse(err instanceof Error ? err.message : "Failed to generate assistance.");
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, isGenerating, title, content]);

  function handleInsertContent() {
    setContent((prev) => `${prev}\n\n${aiResponse}`);
    setInserted(true);
    setTimeout(() => setInserted(false), 2000);
  }

  function handleCopyResponse() {
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <PenLine className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Creative Studio</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Writing Studio</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Draft long-form content, campaign scripts, and articles with in-context AI assistance.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button variant="outline" size="sm" onClick={() => {
                const blob = new Blob([`# ${title}\n\n${content}`], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.md`;
                a.click();
              }}>
                <FileDown className="size-4" /> Export MD
              </Button>
            </div>
          </div>
        </section>

        {/* Studio Workspace */}
        <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          {/* Left Editor */}
          <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex flex-col gap-2">
              <label htmlFor="editor-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Document Title
              </label>
              <input
                id="editor-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none py-1 transition-colors"
                placeholder="Untitled Document"
              />
            </div>

            <div className="flex flex-1 flex-col gap-2 min-h-[30rem]">
              <label htmlFor="editor-content" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Body Content (Markdown Supported)
              </label>
              <textarea
                id="editor-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full min-h-[25rem] resize-none rounded-lg border border-input bg-background/50 px-4 py-3 text-sm leading-6 outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 font-mono"
                placeholder="Start drafting your masterpiece..."
              />
            </div>
          </section>

          {/* Right AI Copilot */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Writing Copilot</h2>
                  <p className="text-xs text-muted-foreground">Powered by Developer Mock</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => {
                      setAiPrompt(qp.prompt);
                      handleAiAssist(qp.prompt);
                    }}
                    className="flex flex-col items-start gap-1 rounded-lg border border-border bg-background p-2.5 text-left text-xs transition-colors hover:bg-accent/40"
                  >
                    <Sparkles className="size-3 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{qp.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Prompt Box */}
              <div className="flex flex-col gap-2">
                <label htmlFor="copilot-prompt" className="text-xs font-medium text-muted-foreground">
                  Ask Copilot
                </label>
                <div className="relative">
                  <textarea
                    id="copilot-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Expand this paragraph, rewrite in a professional tone..."
                    className="h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  />
                  <Button
                    onClick={() => handleAiAssist()}
                    disabled={isGenerating || !aiPrompt.trim()}
                    size="xs"
                    className="absolute bottom-2 right-2"
                  >
                    {isGenerating ? "Thinking..." : "Generate"}
                    <Wand2 className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Copilot Response */}
              {aiResponse && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="size-3 text-primary" /> Assistant Suggestion
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-xs" onClick={handleCopyResponse} title="Copy to clipboard">
                        {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={handleInsertContent} title="Append to editor">
                        {inserted ? <Check className="size-3 text-green-500" /> : <ArrowRight className="size-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs leading-5 text-foreground max-h-60 overflow-y-auto whitespace-pre-wrap font-mono border-t border-border pt-2">
                    {aiResponse}
                  </div>
                  <Button size="xs" variant="outline" className="w-full text-xs" onClick={handleInsertContent}>
                    {inserted ? "Appended!" : "Insert into Editor"}
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
