"use client";

import { useState, useRef, useEffect } from "react";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  Zap,
  Send,
  ArrowRight,
  User,
  Bot,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const IMAGE_SIZES = [
  { value: "256x256", label: "Small (256x256)" },
  { value: "512x512", label: "Medium (512x512)" },
  { value: "1024x1024", label: "Large (1024x1024)" },
];

const IMAGE_STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "illustration", label: "Illustration" },
  { value: "3d-render", label: "3D Render" },
  { value: "vector", label: "Vector Art" },
  { value: "cinematic", label: "Cinematic" },
  { value: "anime", label: "Anime" },
  { value: "sketch", label: "Sketch" },
  { value: "abstract", label: "Abstract" },
];

const PROMPT_SUGGESTIONS = [
  "A serene mountain landscape at sunset, cinematic lighting",
  "Futuristic cityscape with neon lights, cyberpunk style",
  "Cute robot reading a book in a library, illustration",
  "Minimalist workspace with clean lines, modern design",
  "Ocean waves crashing against rocks, photorealistic",
  "Magical forest with glowing mushrooms, fantasy art",
  "Portrait of a wise owl wearing glasses, sketch",
  "Abstract geometric patterns in vibrant colors",
];

const ML_ENHANCEMENTS = [
  { label: "Upscale 2x", prompt: "upscale this image 2x" },
  { label: "Upscale 4x", prompt: "upscale this image 4x" },
  { label: "Remove Background", prompt: "remove background from this image" },
  { label: "Enhance Quality", prompt: "enhance image quality and details" },
  { label: "Colorize", prompt: "colorize this black and white image" },
  { label: "Style Transfer", prompt: "apply van Gogh style to this image" },
  { label: "Generate Variations", prompt: "generate 4 variations of this image" },
  { label: "Extract Colors", prompt: "extract color palette from this image" },
];

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("photorealistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const handleMLEnhance = async (enhancement: string) => {
    if (!generatedImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      // For ML enhancements, we use the existing image as context
      // Pollinations.ai supports some transformations via URL parameters
      const enhancedPrompt = `${enhancement} of: ${generatedImage}`;
      const width = size.split("x")[0];
      const height = size.split("x")[1];

      // Pollinations.ai free API with enhancement
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&private=true&enhance=true`;

      const img = new Image();
      img.onload = () => {
        setGeneratedImage(imageUrl);
      };
      img.onerror = () => {
        throw new Error("Failed to enhance image");
      };
      img.src = imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShowSuggestions(false);

    try {
      // Use Pollinations.ai - free image generation without API key
      const enhancedPrompt = `${prompt} in ${style} style, high quality, detailed`;
      const width = size.split("x")[0];
      const height = size.split("x")[1];

      // Pollinations.ai free API
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&private=true`;

      // Test if image loads
      const img = new Image();
      img.onload = () => {
        setGeneratedImage(imageUrl);
      };
      img.onerror = () => {
        throw new Error("Failed to generate image");
      };
      img.src = imageUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const a = document.createElement("a");
      a.href = generatedImage;
      a.download = `ai-studio-${Date.now()}.png`;
      a.click();
    }
  };

  const handleCopy = () => {
    if (generatedImage) {
      navigator.clipboard.writeText(generatedImage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    handleGenerate();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setShowSuggestions(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
                <ImageIcon className="size-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Image Studio</h1>
                <p className="text-xs text-muted-foreground">
                  Generate images using AI (powered by Pollinations.ai)
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/settings")}
              aria-label="Settings"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
            {showSuggestions && !generatedImage && (
              // Hero Welcome Section
              <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                    <ImageIcon className="size-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">
                    Image Studio
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Generate images using AI. No API key required - powered by free AI models.
                  </p>
                </div>

                <h3 className="text-lg font-semibold mb-4">
                  Try these prompt suggestions
                </h3>

                {/* Prompt Suggestions Grid */}
                <div className="grid w-full max-w-xl gap-2.5 sm:grid-cols-2">
                  {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                        <Sparkles className="size-4" />
                      </div>
                      <p className="text-xs leading-relaxed text-foreground">
                        {suggestion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showSuggestions && (
              // Chat-style Messages
              <div className="space-y-8">
                {prompt && (
                  <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed text-foreground">
                        {prompt}
                      </p>
                    </div>
                  </div>
                )}

                {uploadedImage && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg border border-border overflow-hidden bg-card max-w-md">
                        <img
                          src={uploadedImage}
                          alt="Uploaded image"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {generatedImage && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="rounded-lg border border-border overflow-hidden bg-card">
                        <img
                          src={generatedImage}
                          alt="Generated image"
                          className="w-full h-auto"
                        />
                      </div>
                      <div className="mt-3 flex flex-col gap-3">
                        {/* ML Enhancements */}
                        <div className="flex flex-wrap gap-1.5">
                          {ML_ENHANCEMENTS.map((enhancement) => (
                            <button
                              key={enhancement.label}
                              onClick={() => handleMLEnhance(enhancement.prompt)}
                              disabled={isGenerating}
                              className="rounded-full px-2.5 py-1 text-xs font-medium border border-border bg-card hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              {enhancement.label}
                            </button>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleCopy}
                            aria-label="Copy image URL"
                          >
                            {copied ? (
                              <Check className="size-3 text-green-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleDownload}
                            aria-label="Download image"
                          >
                            <Download className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            aria-label="Regenerate image"
                          >
                            <RefreshCw className="size-3" />
                          </Button>
                        </div>
                      </div>
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
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what you want to generate... e.g. A serene mountain landscape at sunset"
                  className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 pr-24 text-base outline-none placeholder:text-muted-foreground min-h-20 max-h-48"
                  disabled={isGenerating}
                  rows={1}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    aria-label="Upload image"
                  >
                    <ImageIcon className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="rounded-xl"
                  >
                    {isGenerating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to generate, Shift+Enter for new line. Click image icon to upload.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}