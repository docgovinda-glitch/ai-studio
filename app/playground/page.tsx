export default function PlaygroundPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">AI Playground</h1>

      <p className="mt-4 text-gray-600">
        This page will be used to test AI providers such as Mock,
        Ollama, OpenAI, Gemini, and Anthropic.
      </p>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Status</h2>

        <p className="mt-2 text-green-600">
          ✅ AI Engine successfully initialized.
        </p>

        <p className="mt-4">
          Next milestone: Connect the Mock Provider.
        </p>
      </div>
    </main>
  );
}
