"use client";

import { useState } from "react";
import { Image as ImageIcon, RefreshCw, Download, Maximize2, Wand2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

type GeneratedImage = {
  id: string;
  prompt: string;
  style: string;
  size: string;
  src: string;
  createdAt: string;
};

const INITIAL_IMAGES: GeneratedImage[] = [
  {
    id: "img-1",
    prompt: "A beautiful minimalist digital art of a glowing neon brain, representing artificial intelligence in a dark sleek creative room, 3D render.",
    style: "3D Render",
    size: "1024 x 1024",
    src: "/mock/ai_glowing_brain.png",
    createdAt: "Just now",
  },
  {
    id: "img-2",
    prompt: "A futuristic AI Operating System dashboard UI with neon lines, oklch colors, sleek dark glassmorphism, extremely modern graphic design.",
    style: "Cinematic",
    size: "1600 x 900",
    src: "/mock/ai_studio_dashboard_mock.png",
    createdAt: "2 hours ago",
  },
];

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Cinematic");
  const [selectedSize, setSelectedSize] = useState("1024 x 1024");
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const styles = [
    { name: "Cinematic", desc: "Dramatic lighting & composition" },
    { name: "3D Render", desc: "Vibrant oklch glassmorphism" },
    { name: "Minimalist Vector", desc: "Clean geometric flat shapes" },
    { name: "Oil Painting", desc: "Classic artistic impasto strokes" },
  ];

  const sizes = ["1024 x 1024", "1600 x 900", "900 x 1600", "1200 x 800"];

  function handleGenerateImage() {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationStep("Analyzing prompt guidelines...");

    setTimeout(() => {
      setGenerationStep("Synthesizing latent variables...");
    }, 1000);

    setTimeout(() => {
      setGenerationStep("Refining resolution details...");
    }, 2000);

    setTimeout(() => {
      // Create a mock new image using one of the existing premium images or a fallback pattern
      // We alternate between the two images we generated
      const mockSrc = images.length % 2 === 0 ? "/mock/ai_glowing_brain.png" : "/mock/ai_studio_dashboard_mock.png";

      const newImage: GeneratedImage = {
        id: `img-${Date.now()}`,
        prompt: prompt.trim(),
        style: selectedStyle,
        size: selectedSize,
        src: mockSrc,
        createdAt: "Just now",
      };

      setImages((prev) => [newImage, ...prev]);
      setIsGenerating(false);
      setGenerationStep("");
      setPrompt("");
    }, 3500);
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Visual Studio</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Image Studio</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Orchestrate prompt-driven image generation workflows and export high-fidelity assets.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          {/* Controls Sidebar */}
          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold">Image Parameters</h3>
                <p className="text-xs text-muted-foreground mt-1">Configure dimensions and aesthetics.</p>
              </div>

              {/* Prompt Text */}
              <div className="flex flex-col gap-2">
                <label htmlFor="image-prompt" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Text Prompt
                </label>
                <textarea
                  id="image-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Glowing neon lines forming an abstract digital landscape, dark glassmorphism, 8k..."
                  className="h-28 w-full resize-none rounded-lg border border-input bg-background/50 px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              {/* Style Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aesthetic Style</span>
                <div className="grid gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => setSelectedStyle(style.name)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border p-2.5 text-left transition-colors ${
                        selectedStyle === style.name
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-accent/40"
                      }`}
                    >
                      <span className="text-xs font-semibold">{style.name}</span>
                      <span className="text-[10px] text-muted-foreground">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex flex-col gap-2">
                <label htmlFor="aspect-ratio" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Aspect Ratio / Size
                </label>
                <select
                  id="aspect-ratio"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full mt-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="size-4" /> Generate Image
                  </>
                )}
              </Button>
            </section>
          </aside>

          {/* Main Gallery Area */}
          <section className="flex flex-col gap-4">
            {/* Generate Loading Card */}
            {isGenerating && (
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 flex flex-col items-center justify-center text-center min-h-[16rem] animate-pulse">
                <RefreshCw className="size-8 text-primary animate-spin mb-4" />
                <h3 className="text-sm font-semibold">Synthesizing Image Assets</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs">{generationStep}</p>
              </div>
            )}

            {/* Gallery Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {images.map((img) => (
                <article
                  key={img.id}
                  className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.prompt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button variant="outline" size="icon" className="size-9 rounded-full bg-background border-transparent text-foreground hover:bg-accent" title="View Fullscreen">
                        <Maximize2 className="size-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="size-9 rounded-full bg-background border-transparent text-foreground hover:bg-accent" title="Download Asset" onClick={() => {
                        const a = document.createElement("a");
                        a.href = img.src;
                        a.download = `ai-studio-image-${img.id}.png`;
                        a.click();
                      }}>
                        <Download className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-xs leading-5 text-muted-foreground line-clamp-3">
                      &ldquo;{img.prompt}&rdquo;
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex gap-1">
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                          {img.style}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {img.size}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{img.createdAt}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
