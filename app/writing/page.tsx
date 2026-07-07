"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  PenLine,
  Send,
  Bot,
  User,
  Copy,
  Check,
  FileDown,
  RefreshCw,
  Settings,
  Mic,
  Paperclip,
  Sparkles,
  GraduationCap,
  Mail,
  BookOpen,
  Globe,
  FileText,
  Languages,
  ArrowRight,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickActionCards = [
  {
    icon: PenLine,
    title: "Draft Article",
    description: "Create a well-structured article on any topic",
    prompt: "Help me draft a well-structured article about",
  },
  {
    icon: GraduationCap,
    title: "Academic Paper",
    description: "Write research papers with proper citations",
    prompt: "Help me write an academic paper on",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Compose professional emails",
    prompt: "Help me write a professional email about",
  },
  {
    icon: BookOpen,
    title: "Blog Post",
    description: "Create engaging blog content",
    prompt: "Help me write a blog post about",
  },
  {
    icon: FileText,
    title: "Research Proposal",
    description: "Structure research proposals",
    prompt: "Help me draft a research proposal for",
  },
  {
    icon: BookOpen,
    title: "Literature Review",
    description: "Summarize academic literature",
    prompt: "Help me write a literature review on",
  },
  {
    icon: RefreshCw,
    title: "Rewrite Text",
    description: "Rephrase existing content",
    prompt: "Help me rewrite the following text to be",
  },
  {
    icon: Sparkles,
    title: "Improve Grammar",
    description: "Fix grammar and style issues",
    prompt: "Help me improve the grammar and style of",
  },
  {
    icon: Globe,
    title: "Translate",
    description: "Translate to other languages",
    prompt: "Translate the following text to",
  },
  {
    icon: FileText,
    title: "Executive Summary",
    description: "Summarize long documents",
    prompt: "Help me create an executive summary of",
  },
];

const writingTools = [
  { label: "Academic", prompt: "in an academic tone with formal language" },
  { label: "Formal", prompt: "in a formal, professional tone" },
  { label: "Casual", prompt: "in a casual, conversational tone" },
  { label: "Creative", prompt: "in a creative, engaging style" },
  { label: "Concise", prompt: "to be more concise and to the point" },
  { label: "Expand", prompt: "to expand and add more detail" },
  { label: "Summarize", prompt: "to summarize the key points" },
  { label: "Grammar", prompt: "to fix grammar and improve clarity" },
  { label: "Translate", prompt: "to translate into another language" },
];

export default function WritingStudioPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsGenerating(true);

    try {
      const apiKeys: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const openaiKey = localStorage.getItem("openai_key") || "";
        const openrouterKey = localStorage.getItem("openrouter_key") || "";
        const geminiKey = localStorage.getItem("gemini_key") || "";
        const groqKey = localStorage.getItem("groq_key") || "";
        const anthropicKey = localStorage.getItem("anthropic_key") || "";
        const deepseekKey = localStorage.getItem("deepseek_key") || "";
        const togetherKey = localStorage.getItem("together_key") || "";

        if (openaiKey) apiKeys.openai = openaiKey;
        if (openrouterKey) apiKeys.openrouter = openrouterKey;
        if (geminiKey) apiKeys.gemini = geminiKey;
        if (groqKey) apiKeys.groq = groqKey;
        if (anthropicKey) apiKeys.anthropic = anthropicKey;
        if (deepseekKey) apiKeys.deepseek = deepseekKey;
        if (togetherKey) apiKeys.together = togetherKey;
      }

      const activeProvider =
        typeof window !== "undefined"
          ? localStorage.getItem("ai_provider") || "openai"
          : "openai";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a helpful writing assistant. Help users draft, edit, and improve their text content. Be concise and helpful.",
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          providerId: activeProvider,
          apiKeys,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.message?.content ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check your API key configuration in Settings.",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, messages]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleToolClick = (tool: string, modifier: string) => {
    setActiveTool(tool);
    if (input.trim()) {
      setInput((prev) => `${prev} ${modifier}`);
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
                <PenLine className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Writing Studio</h1>
                <p className="text-xs text-muted-foreground">
                  Draft, edit, rewrite, summarize, translate and improve any
                  document using AI
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
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
            {messages.length === 0 ? (
              // Hero Welcome Section
              <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
                <div className="text-center mb-12">
                  <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                    <PenLine className="size-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
                    Writing Studio
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Draft, edit, rewrite, summarize, translate and improve any
                    document using AI
                  </p>
                </div>

                <h3 className="text-xl font-semibold mb-6">
                  What would you like to write today?
                </h3>

                {/* Quick Action Cards */}
                <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {quickActionCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        onClick={() => handleQuickAction(card.prompt)}
                        className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {card.title}
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {card.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="mt-3"
                          onClick={() => handleCopy(message.content)}
                          aria-label="Copy message"
                        >
                          {copied ? (
                            <Check className="size-3 text-green-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <footer className="border-t border-border bg-background/50 p-4 backdrop-blur sm:p-6">
          <div className="mx-auto w-full max-w-3xl">
            {/* Writing Tools Toolbar */}
            <div className="mb-3 flex flex-wrap gap-2">
              {writingTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => handleToolClick(tool.label, tool.prompt)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTool === tool.label
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card hover:bg-accent"
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card shadow-lg transition-all focus-within:shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Writing Studio to draft, rewrite, summarize or improve your text..."
                  className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 pr-24 text-base outline-none placeholder:text-muted-foreground min-h-20 max-h-48"
                  disabled={isGenerating}
                  rows={1}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Attach file"
                    disabled={isGenerating}
                  >
                    <Paperclip className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Voice input"
                    disabled={isGenerating}
                  >
                    <Mic className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={isGenerating || !input.trim()}
                    className="rounded-xl"
                  >
                    {isGenerating ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}