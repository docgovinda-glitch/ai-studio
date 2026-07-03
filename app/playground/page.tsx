"use client";

import { useState } from "react";

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendPrompt() {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await res.json();

      setResponse(data.content);
    } catch (error) {
      console.error(error);
      setResponse("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">AI Playground</h1>

      <p className="mt-2 text-gray-600">
        Test the AI Engine using the Mock Provider.
      </p>

      <textarea
        className="mt-8 w-full rounded-lg border p-4"
        rows={6}
        placeholder="Type a prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={sendPrompt}
        disabled={loading}
        className="mt-4 rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {response && (
        <div className="mt-8 rounded-lg border p-6">
          <h2 className="font-semibold">Response</h2>

          <p className="mt-4 whitespace-pre-wrap">
            {response}
          </p>
        </div>
      )}
    </main>
  );
}