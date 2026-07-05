"use client";

import { useState } from "react";
import { AudioLines, Play, Pause, Download, Volume2, Sparkles, RefreshCw, Upload, Mic } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function VoiceStudioPage() {
  const [activeTab, setActiveTab] = useState<"tts" | "clone">("tts");
  const [text, setText] = useState(
    "Welcome to the AI Studio Voice workspace. You can draft narrative voiceovers here, configure high-fidelity speakers, and generate production-ready audio."
  );
  const [selectedVoice, setSelectedVoice] = useState("sarah-pro");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const voices = [
    { id: "sarah-pro", name: "Sarah (Professional)", gender: "Female", style: "Corporate / Narration" },
    { id: "david-news", name: "David (Energetic)", gender: "Male", style: "Broadcast / Promo" },
    { id: "michael-calm", name: "Michael (Calm)", gender: "Male", style: "Instructional / E-Learning" },
    { id: "emily-story", name: "Emily (Warm)", gender: "Female", style: "Audiobook / Storytelling" },
  ];

  function handleGenerateAudio() {
    setIsGenerating(true);
    setAudioUrl(null);
    setIsPlaying(false);

    // Simulate audio generation latency
    setTimeout(() => {
      setIsGenerating(false);
      // We set a mock audio URL (just a silence block or a standard sample URL if needed, but we can just use a dummy browser state)
      setAudioUrl("generated-voice-sample");
    }, 2000);
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        {/* Header */}
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <AudioLines className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">Audio Studio</p>
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Voice Studio</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Synthesize professional narration, perform voice cloning, and orchestrate audio assets.
              </p>
            </div>
            {/* Tabs */}
            <div className="flex rounded-lg border border-border bg-muted p-1">
              <button
                onClick={() => setActiveTab("tts")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "tts"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Text-to-Speech
              </button>
              <button
                onClick={() => setActiveTab("clone")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === "clone"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Voice Cloning
              </button>
            </div>
          </div>
        </section>

        {activeTab === "tts" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Main Narration Inputs */}
            <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
              <div className="flex flex-col gap-2">
                <label htmlFor="narration-text" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Script to Synthesize
                </label>
                <textarea
                  id="narration-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-56 resize-none rounded-lg border border-input bg-background/50 px-4 py-3 text-sm leading-6 outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  placeholder="Enter narration script text here..."
                />
              </div>

              {/* Speech Controls */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Speed ({speed.toFixed(1)}x)
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="accent-primary h-2 rounded bg-muted outline-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pitch ({pitch.toFixed(1)}x)
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="accent-primary h-2 rounded bg-muted outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Generate Trigger */}
              <div className="flex items-center gap-4 border-t border-border pt-4">
                <Button
                  onClick={handleGenerateAudio}
                  disabled={isGenerating || !text.trim()}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" /> Synthesizing Voice...
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-4" /> Generate Audio
                    </>
                  )}
                </Button>
                {isGenerating && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Allocating server engine...
                  </span>
                )}
              </div>

              {/* Audio player card */}
              {audioUrl && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3 mt-2 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="size-3" /> Output Generated
                    </span>
                    <span className="text-xs text-muted-foreground">0:12</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      variant="default"
                      size="icon"
                      className="size-10"
                    >
                      {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 pl-0.5" />}
                    </Button>
                    <div className="flex-1 flex items-end gap-1.5 h-6">
                      {/* CSS Mock Waveform */}
                      {[12, 18, 8, 24, 16, 28, 6, 20, 10, 24, 16, 22, 12, 8, 14, 20, 26, 12, 6, 18, 12, 10].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-primary/45 transition-all duration-300"
                          style={{
                            height: isPlaying ? `${h * 0.8}px` : "4px",
                            animation: isPlaying ? `wave-animation 1s ease-in-out infinite alternate` : undefined,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                    <Button variant="ghost" size="icon" title="Download Audio">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* Sidebar Voice Selector */}
            <aside className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold">Select Narration Voice</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a model target optimized for speech style.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`flex items-start justify-between rounded-lg border p-3 text-left transition-colors ${
                      selectedVoice === voice.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-accent/40"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{voice.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{voice.style}</p>
                    </div>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase">
                      {voice.gender}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          /* Voice Cloning Tab */
          <section className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm max-w-3xl mx-auto w-full">
            <h2 className="text-lg font-semibold tracking-tight">Clone Voice Profile</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a clean, noise-free audio sample (10-30 seconds) to train a custom voice generator model.
            </p>

            <div className="mt-6 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/20">
              <Upload className="size-8 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Drag & drop your voice recording sample here</p>
              <p className="text-xs text-muted-foreground mt-1">Supports WAV, MP3, or M4A up to 10MB</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Choose File</Button>
                <Button size="sm" variant="outline">
                  <Mic className="size-4" /> Record Live
                </Button>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Guidelines for high-fidelity voice cloning:
              </h3>
              <ul className="mt-3 list-disc pl-4 text-xs text-muted-foreground space-y-2">
                <li>Read the provided script in a clear, consistent conversational tone.</li>
                <li>Eliminate background noise (fans, hums, echoes) before recording.</li>
                <li>Provide a voice profile that reflects the pacing and vocabulary of the intended output.</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
