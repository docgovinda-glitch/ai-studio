"use client";

import { useState, useEffect } from "react";

export function ChatHeader() {

  const [model, setModel] = useState("Loading...");

  useEffect(() => {

    async function loadModel() {

      try {

        const response = await fetch("http://localhost:11434/api/tags");

        const data = await response.json();

        if (data.models?.length) {
          setModel(data.models[0].name);
        }

      } catch {

        setModel("Offline");

      }

    }

    loadModel();

  }, []);

  return (

    <header className="flex h-16 items-center justify-between border-b px-6">

      <div>

        <h1 className="text-lg font-semibold">
          AI Chat
        </h1>

        <p className="text-sm text-muted-foreground">
          Connected to AI Runtime
        </p>

      </div>

      <div className="rounded-lg border px-3 py-2 text-sm">

        Ollama · {model}

      </div>

    </header>

  );

}
