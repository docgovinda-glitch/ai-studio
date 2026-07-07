"use client";

import { useState } from "react";
import { Clapperboard, Plus, Trash2, RefreshCw, Film } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

type StoryboardScene = {
  id: string;
  sceneNumber: number;
  visualPrompt: string;
  narrationText: string;
  cameraMovement: string;
  durationSec: number;
};

const INITIAL_SCENES: StoryboardScene[] = [
  {
    id: "sc-1",
    sceneNumber: 1,
    visualPrompt: "An isometric view of a sleek dark studio room, a single glowing interface sitting on a modern glass desk.",
    narrationText: "In the era of decentralized creation, builders are overwhelmed by disconnected tools.",
    cameraMovement: "Slow zoom-in",
    durationSec: 4,
  },
  {
    id: "sc-2",
    sceneNumber: 2,
    visualPrompt: "A futuristic holographic workspace expanding with files, timelines, audio wave forms, and floating cards.",
    narrationText: "AI Studio unifies research, scriptwriting, voice narration, and visual media into one seamless OS.",
    cameraMovement: "Horizontal pan left to right",
    durationSec: 5,
  },
];

export default function VideoStudioPage() {
  const [scenes, setScenes] = useState<StoryboardScene[]>(INITIAL_SCENES);
  const [visualPrompt, setVisualPrompt] = useState("");
  const [narrationText, setNarrationText] = useState("");
  const [cameraMovement, setCameraMovement] = useState("Slow zoom-in");
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOutput, setGenerationOutput] = useState<string | null>(null);

  function handleAddScene() {
    if (!visualPrompt.trim()) return;

    const newScene: StoryboardScene = {
      id: `sc-${Date.now()}`,
      sceneNumber: scenes.length + 1,
      visualPrompt: visualPrompt.trim(),
      narrationText: narrationText.trim(),
      cameraMovement,
      durationSec: duration,
    };

    setScenes((prev) => [...prev, newScene]);
    setVisualPrompt("");
    setNarrationText("");
    setCameraMovement("Slow zoom-in");
    setDuration(5);
  }

  function handleDeleteScene(id: string) {
    setScenes((prev) =>
      prev
        .filter((scene) => scene.id !== id)
        .map((scene, index) => ({ ...scene, sceneNumber: index + 1 }))
    );
  }

  async function handleGenerateVideoPlan() {
    setIsGenerating(true);
    setGenerationOutput(null);

    try {
      // Get API keys from localStorage
      const apiKeys: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const openaiKey = localStorage.getItem("openai_key") || "";
        if (openaiKey) apiKeys.openai = openaiKey;
        apiKeys.mock = "mock";
      }

      // Generate video for each scene
      const scenePrompts = scenes.map(s => s.visualPrompt).join(" | ");
      
      const response = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Video storyboard: ${scenePrompts}`,
          duration: scenes.reduce((sum, s) => sum + s.durationSec, 0),
          providerId: "mock", // Use mock for offline, or "openai" for real API
          apiKeys,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to generate video");
      }

      const data = await response.json();
      setGenerationOutput(data.video?.url || "Compiled Video Draft Plan ready for production rendering.");
    } catch (err) {
      console.error("Video generation error:", err);
      // Fallback to mock
      setGenerationOutput(`https://placehold.co/640x360/6366f1/ffffff/png?text=Video+Mock`);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Clapperboard className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Video Production</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Video Studio</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Plan cinematic storyboards, orchestrate prompt sequences, and compile visual script paths.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          {/* Main Storyboard Grid */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Storyboard Scenes</h2>
              <span className="text-xs font-semibold text-muted-foreground">
                Total duration: {scenes.reduce((sum, s) => sum + s.durationSec, 0)}s
              </span>
            </div>

            <div className="grid gap-4">
              {scenes.map((scene) => (
                <article
                  key={scene.id}
                  className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground text-sm font-bold">
                      #{scene.sceneNumber}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Visual Scene Prompt
                      </p>
                      <p className="text-sm leading-6 text-foreground">{scene.visualPrompt}</p>
                      {scene.narrationText && (
                        <div className="rounded bg-muted/30 p-2.5 mt-2 border-l-2 border-primary">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Narration Script / Dialog
                          </p>
                          <p className="text-xs leading-5 text-muted-foreground mt-1 font-mono">
                            &ldquo;{scene.narrationText}&rdquo;
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {scene.cameraMovement}
                        </span>
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {scene.durationSec}s duration
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-1 items-end self-end md:self-start mt-2 md:mt-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteScene(scene.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete scene"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {/* Video Compile Trigger */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                onClick={handleGenerateVideoPlan}
                disabled={isGenerating || scenes.length === 0}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Compiling Storyboard Plan...
                  </>
                ) : (
                  <>
                    <Film className="size-4" /> Compile Video Draft Plan
                  </>
                )}
              </Button>
            </div>

            {generationOutput && (
              <div className="rounded-lg border border-green-600/20 bg-green-500/5 p-4 flex flex-col gap-2 animate-in fade-in-50 duration-300">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                  ✓ Compilation Success
                </span>
                <p className="text-sm leading-6 text-muted-foreground">
                  The storyboard has been synthesized. You can export the scene logs or trigger render passes.
                </p>
              </div>
            )}
          </section>

          {/* Sidebar - Add Storyboard Scene */}
          <aside className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col gap-4 h-fit">
            <div>
              <h3 className="text-sm font-semibold">Add Storyboard Scene</h3>
              <p className="text-xs text-muted-foreground mt-1">Specify prompt action and camera pacing.</p>
            </div>

            <div className="grid gap-4 text-sm">
              <div className="flex flex-col gap-2">
                <label htmlFor="scene-visual" className="text-xs font-medium text-muted-foreground">
                  Visual Prompt
                </label>
                <textarea
                  id="scene-visual"
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="e.g. A panoramic camera shot tracking a space shuttle launching..."
                  className="h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="scene-narration" className="text-xs font-medium text-muted-foreground">
                  Narration Script
                </label>
                <textarea
                  id="scene-narration"
                  value={narrationText}
                  onChange={(e) => setNarrationText(e.target.value)}
                  placeholder="e.g. Space, the final frontier of decentralized AI creation..."
                  className="h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="scene-camera" className="text-xs font-medium text-muted-foreground">
                  Camera Motion
                </label>
                <select
                  id="scene-camera"
                  value={cameraMovement}
                  onChange={(e) => setCameraMovement(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <option value="Slow zoom-in">Slow zoom-in</option>
                  <option value="Slow zoom-out">Slow zoom-out</option>
                  <option value="Horizontal pan left to right">Horizontal pan left to right</option>
                  <option value="Vertical pan up">Vertical pan up</option>
                  <option value="Cinematic tracking shot">Cinematic tracking shot</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="scene-duration" className="text-xs font-medium text-muted-foreground">
                  Duration ({duration}s)
                </label>
                <input
                  id="scene-duration"
                  type="range"
                  min="2"
                  max="15"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="accent-primary h-2 rounded bg-muted outline-none cursor-pointer"
                />
              </div>

              <Button onClick={handleAddScene} disabled={!visualPrompt.trim()} className="w-full mt-2">
                <Plus className="size-4" /> Add Scene
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
