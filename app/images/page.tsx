"use client";

import { useState, useRef } from "react";
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
  Cpu,
  Globe,
  Key,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const IMAGE_SIZES = [
  { value: "256x256", label: "Small (256x256)" },
  { value: "512x512", label: "Medium (512x512)" },
  { value: "1024x1024", label: "Large (1024x1024)" },
  { value: "1792x1024", label: "Wide (1792x1024)" },
  { value: "1024x1792", label: "Tall (1024x1792)" },
];

const IMAGE_STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "illustration", label: "Illustration" },
  { value: "3d-render", label: "3D Render" },
  { value: "vector", label: "Vector Art" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "cinematic", label: "Cinematic" },
  { value: "anime", label: "Anime" },
  { value: "sketch", label: "Sketch" },
];

const PROVIDERS = [
  { id: "mock", name: "Mock (Offline)", icon: Cpu, requiresKey: false },
  { id: "openai", name: "OpenAI (DALL-E)", icon: Zap, requiresKey: true },
  { id: "openrouter", name: "OpenRouter (Free)", icon: Globe, requiresKey: false },
];

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("photorealistic");
  const [provider, setProvider] = useState("mock");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    const selectedProvider = PROVIDERS.find((p) => p.id === provider);
    if (selectedProvider?.requiresKey && !apiKey.trim()) {
      setError(`API key required for ${selectedProvider.name}`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${prompt} in ${style} style`,
          size,
          providerId: provider,
          apiKeys: { [provider]: apiKey },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.image?.url);
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

  return (
    <AppShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-purple-500" />
            Image Studio
          </h1>
          <p className="text-muted-foreground">
            Generate images using AI models. Supports DALL-E, OpenRouter, and local models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A serene mountain landscape at sunset, cinematic lighting..."
                className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Size
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  {IMAGE_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  {IMAGE_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Provider
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PROVIDERS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={p.id}
                        checked={provider === p.id}
                        onChange={(e) => setProvider(e.target.value)}
                        disabled={isGenerating}
                        className="radio radio-sm"
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{p.name}</span>
                      {p.requiresKey && <Key className="h-3 w-3 ml-auto text-amber-500" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {PROVIDERS.find((p) => p.id === provider)?.requiresKey && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
            {generatedImage ? (
              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-auto"
                />
                <div className="p-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg h-96 flex items-center justify-center bg-muted/10">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Your generated image will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}