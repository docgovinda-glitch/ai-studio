// @ts-ignore
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to initialize Gemini API Client safely (Lazy Initialization pattern)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined pin the Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Automatic backoff and retry helper for Gemini API calls to safeguard against transient 503/429 errors
async function generateContentWithRetry(
  aiClient: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 4,
  initialDelayMs = 1500
): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      const errorMessage = error.message || "";
      const errorStatus = error.status || error.code || 0;
      
      const isTransient = 
        errorStatus === 503 || 
        errorStatus === 429 || 
        errorStatus === 504 || 
        errorMessage.includes("503") || 
        errorMessage.includes("429") || 
        errorMessage.includes("high demand") || 
        errorMessage.includes("UNAVAILABLE") || 
        errorMessage.includes("RESOURCE_EXHAUSTED") || 
        errorMessage.includes("overloaded") ||
        errorMessage.includes("transient");

      if (isTransient && attempt < maxRetries) {
        // Exponential backoff with jitter (e.g. attempt 1: ~1.5s, 2: ~3s, 3: ~6s)
        const delay = initialDelayMs * Math.pow(2, attempt - 1) * (0.85 + Math.random() * 0.3);
        console.warn(`[Gemini API] Transient error encountered (status: ${errorStatus}, msg: ${errorMessage}). Retrying attempt ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      // If we ran out of retries or it's not a transient error, propagate it
      console.error(`[Gemini API] API call failed definitely on attempt ${attempt}. Error:`, error);
      throw error;
    }
  }
}

// Helper to clean JSON strings returned by local models which might be wrapped in markdown code blocks
function cleanJsonString(text: string): string {
  let cleaned = text.trim();
  // Strip Markdown code block syntax if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Unified function to handle content generation based on the selected AI provider
async function generateWithSettings(params: {
  systemInstruction: string;
  prompt: string;
  temperature: number;
  responseMimeType?: string;
  aiSettings?: any;
}): Promise<string> {
  const provider = params.aiSettings?.provider || "gemini";

  if (provider === "gemini") {
    const ai = getGeminiClient();
    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: params.prompt,
      config: {
        systemInstruction: params.systemInstruction,
        responseMimeType: params.responseMimeType,
        temperature: params.temperature,
      }
    });
    return response.text?.trim() || "";
  }

  if (provider === "ollama") {
    const endpoint = params.aiSettings?.ollamaEndpoint || "http://localhost:11434";
    const model = params.aiSettings?.ollamaModel || "llama3";
    
    let fullPrompt = params.prompt;
    if (params.responseMimeType === "application/json") {
      fullPrompt += "\n\nIMPORTANT: Return strictly valid JSON only. Do not wrap it in markdown code blocks like ```json or anything else. Just the raw JSON string.";
    }

    console.log(`[Ollama Generation] URL: ${endpoint}/api/chat, Model: ${model}`);
    const response = await fetch(`${endpoint}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: params.systemInstruction },
          { role: "user", content: fullPrompt }
        ],
        stream: false,
        options: {
          temperature: params.temperature
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Ollama connection failed (status ${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    let text = data.message?.content || "";
    if (params.responseMimeType === "application/json") {
      text = cleanJsonString(text);
    }
    return text.trim();
  }

  if (provider === "custom") {
    const endpoint = params.aiSettings?.customEndpoint || "http://localhost:1234/v1";
    const model = params.aiSettings?.customModel || "llama3";
    
    let fullPrompt = params.prompt;
    if (params.responseMimeType === "application/json") {
      fullPrompt += "\n\nIMPORTANT: Return strictly valid JSON only. Do not wrap it in markdown code blocks like ```json or anything else. Just the raw JSON string.";
    }

    const cleanEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
    const url = `${cleanEndpoint}/chat/completions`;
    console.log(`[Custom local AI Generation] URL: ${url}, Model: ${model}`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: params.systemInstruction },
          { role: "user", content: fullPrompt }
        ],
        temperature: params.temperature
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Custom local server connection failed (status ${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    let text = data.choices?.[0]?.message?.content || "";
    if (params.responseMimeType === "application/json") {
      text = cleanJsonString(text);
    }
    return text.trim();
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// ==========================================
// CACHING, STREAMING & PARSING HELPERS
// ==========================================

// Local request memory cache
const requestCache = new Map<string, { timestamp: number; response: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache expiration

function getCacheKey(body: any): string {
  const str = JSON.stringify({
    provider: body.provider,
    model: body.model,
    systemInstruction: body.systemInstruction,
    prompt: body.prompt,
    temperature: body.temperature,
    responseMimeType: body.responseMimeType
  });
  return crypto.createHash("sha256").update(str).digest("hex");
}

const sendCachedJson = (res: any, cacheKey: string, payload: any) => {
  requestCache.set(cacheKey, { timestamp: Date.now(), response: payload });
  return res.json(payload);
};

// Zero-dependency printable text extractor for binary files (PDF/DOCX/XLSX)
function extractPrintableStrings(buffer: Buffer): string {
  let result = "";
  let currentString = "";
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if (char >= 32 && char <= 126) {
      currentString += String.fromCharCode(char);
    } else if (char === 10 || char === 13) {
      if (currentString.length >= 4) {
        result += currentString + "\n";
      }
      currentString = "";
    } else {
      if (currentString.length >= 4) {
        result += currentString + " ";
      }
      currentString = "";
    }
  }
  if (currentString.length >= 4) {
    result += currentString;
  }
  // Strip common binary layout tags
  return result
    .replace(/[a-zA-Z0-9_\-\/]+\s*<<[^>]*>>/g, "")
    .replace(/\/Type\s*\/[a-zA-Z]+/g, "")
    .replace(/endstream|endobj|startxref/g, "")
    .slice(0, 100000);
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// File Parser Endpoint (Accepts Base64 JSON Payload)
app.post("/api/parse-file", async (req, res) => {
  try {
    const { fileName, fileType, fileContent } = req.body;
    if (!fileName || !fileContent) {
      return res.status(400).json({ error: "Missing required parameters: fileName, fileContent" });
    }

    const buffer = Buffer.from(fileContent, "base64");
    let text = "";
    const ext = path.extname(fileName).toLowerCase();

    if ([".txt", ".ris", ".bib", ".csv", ".tsv", ".json", ".xml"].includes(ext)) {
      text = buffer.toString("utf8");
    } else if (ext === ".pdf") {
      try {
        const pdfParse = (await import("pdf-parse") as any).default;
        const data = await pdfParse(buffer);
        text = data.text || "";
      } catch (err: any) {
        console.warn("[Parser] pdf-parse failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else if (ext === ".docx") {
      try {
        const mammoth = await import("mammoth");
        const data = await mammoth.extractRawText({ buffer });
        text = data.value || "";
      } catch (err: any) {
        console.warn("[Parser] mammoth failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else if ([".xlsx", ".xls"].includes(ext)) {
      try {
        const xlsx = await import("xlsx");
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const csvs: string[] = [];
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          csvs.push(xlsx.utils.sheet_to_csv(sheet));
        });
        text = csvs.join("\n\n");
      } catch (err: any) {
        console.warn("[Parser] xlsx failed, using strings fallback:", err.message);
        text = extractPrintableStrings(buffer);
      }
    } else {
      text = extractPrintableStrings(buffer);
    }

    return res.json({
      text: text.slice(0, 80000), // Protect local storage by truncating to 80k characters
      metadata: {
        fileName,
        fileSize: buffer.length,
        extension: ext,
        charCount: text.length
      }
    });
  } catch (err: any) {
    console.error("File parser error:", err);
    res.status(500).json({ error: err.message || "Failed to parse document" });
  }
});

// SSE Streaming Generation Proxy
app.post("/api/stream-generate", async (req, res) => {
  try {
    const { provider, apiKey, model, systemInstruction, prompt, temperature, responseMimeType } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const aiProvider = provider || "gemini";

    if (aiProvider === "gemini" || aiProvider === "server") {
      const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        res.write(`data: ${JSON.stringify({ error: "Gemini API Key is not set." })}\n\n`);
        return res.end();
      }

      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const responseStream = await aiClient.models.generateContentStream({
        model: model || "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType,
          temperature
        }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      return res.end();
    }

    if (["openai", "deepseek", "qwen"].includes(aiProvider)) {
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: `${aiProvider.toUpperCase()} API Key is required.` })}\n\n`);
        return res.end();
      }

      let url = "https://api.openai.com/v1/chat/completions";
      let targetModel = model || "gpt-4o-mini";

      if (aiProvider === "deepseek") {
        url = "https://api.deepseek.com/chat/completions";
        targetModel = model || "deepseek-chat";
      } else if (aiProvider === "qwen") {
        url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
        targetModel = model || "qwen-plus";
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: "system", content: systemInstruction || "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          temperature: temperature ?? 0.5,
          stream: true
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ error: `API stream failed: ${errText}` })}\n\n`);
        return res.end();
      }

      let buffer = "";
      for await (const chunk of response.body as any) {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned || cleaned === "data: [DONE]") continue;
          if (cleaned.startsWith("data: ")) {
            try {
              const json = JSON.parse(cleaned.slice(6));
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {}
          }
        }
      }
      return res.end();
    }

    if (aiProvider === "claude") {
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: "Claude API Key is required." })}\n\n`);
        return res.end();
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          system: systemInstruction || "You are a helpful assistant.",
          messages: [{ role: "user", content: prompt }],
          temperature: temperature ?? 0.5,
          stream: true
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ error: `Claude stream failed: ${errText}` })}\n\n`);
        return res.end();
      }

      let buffer = "";
      for await (const chunk of response.body as any) {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;
          if (cleaned.startsWith("data: ")) {
            try {
              const json = JSON.parse(cleaned.slice(6));
              if (json.type === "content_block_delta") {
                const text = json.delta?.text || "";
                if (text) {
                  res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
              }
            } catch (e) {}
          }
        }
      }
      return res.end();
    }

    if (aiProvider === "cohere") {
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: "Cohere API Key is required." })}\n\n`);
        return res.end();
      }

      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "command-r-plus",
          preamble: systemInstruction || "You are a helpful assistant.",
          message: prompt,
          temperature: temperature ?? 0.5,
          stream: true
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ error: `Cohere stream failed: ${errText}` })}\n\n`);
        return res.end();
      }

      let buffer = "";
      for await (const chunk of response.body as any) {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;
          try {
            const json = JSON.parse(cleaned);
            if (json.event_type === "text-generation") {
              const text = json.text || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
          } catch (e) {}
        }
      }
      return res.end();
    }

    res.write(`data: ${JSON.stringify({ error: `Streaming not supported for provider: ${aiProvider}` })}\n\n`);
    return res.end();
  } catch (err: any) {
    console.error("Streaming endpoint error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message || "Streaming execution failed" })}\n\n`);
    return res.end();
  }
});

// AI Generation Proxy (With Caching Layer)
app.post("/api/generate", async (req, res) => {
  try {
    const { provider, apiKey, model, systemInstruction, prompt, temperature, responseMimeType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing required parameter: prompt" });
    }

    // Caching check
    const cacheKey = getCacheKey(req.body);
    const cached = requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log("[Cache Hit] Serving response from memory cache");
      return res.json(cached.response);
    }

    const aiProvider = provider || "gemini";

    // 1. Google Gemini or Server-side Gemini Proxy
    if (aiProvider === "gemini" || aiProvider === "server") {
      const activeApiKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        return res.status(400).json({ error: "Gemini API Key is not set." });
      }
      
      const aiClient = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await generateContentWithRetry(aiClient, {
        model: model || "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType,
          temperature,
        }
      });
      return sendCachedJson(res, cacheKey, { text: response.text?.trim() || "" });
    }

    // 2. OpenAI ChatGPT
    if (aiProvider === "openai") {
      if (!apiKey) {
        return res.status(400).json({ error: "OpenAI API Key is required." });
      }

      const messages = [
        { role: "system", content: systemInstruction || "You are a helpful assistant." },
        { role: "user", content: prompt }
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages,
          temperature: temperature ?? 0.5
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `OpenAI API failed: ${errText}` });
      }

      const data: any = await response.json();
      return sendCachedJson(res, cacheKey, { text: data.choices?.[0]?.message?.content?.trim() || "" });
    }

    // 3. Claude (Anthropic)
    if (aiProvider === "claude") {
      if (!apiKey) {
        return res.status(400).json({ error: "Claude API Key is required." });
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          system: systemInstruction || "You are a helpful assistant.",
          messages: [{ role: "user", content: prompt }],
          temperature: temperature ?? 0.5
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Claude API failed: ${errText}` });
      }

      const data: any = await response.json();
      return sendCachedJson(res, cacheKey, { text: data.content?.[0]?.text?.trim() || "" });
    }

    // 4. DeepSeek
    if (aiProvider === "deepseek") {
      if (!apiKey) {
        return res.status(400).json({ error: "DeepSeek API Key is required." });
      }

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction || "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          temperature: temperature ?? 0.5
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `DeepSeek API failed: ${errText}` });
      }

      const data: any = await response.json();
      return sendCachedJson(res, cacheKey, { text: data.choices?.[0]?.message?.content?.trim() || "" });
    }

    // 5. Cohere
    if (aiProvider === "cohere") {
      if (!apiKey) {
        return res.status(400).json({ error: "Cohere API Key is required." });
      }

      const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "command-r-plus",
          preamble: systemInstruction || "You are a helpful assistant.",
          message: prompt,
          temperature: temperature ?? 0.5
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Cohere API failed: ${errText}` });
      }

      const data: any = await response.json();
      return sendCachedJson(res, cacheKey, { text: data.text?.trim() || "" });
    }

    return res.status(400).json({ error: `Unsupported provider: ${aiProvider}` });
  } catch (error: any) {
    console.error("Server proxy generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

// Twilio WhatsApp Gateway
app.post("/api/whatsapp", async (req, res) => {
  try {
    const { to, body, customSid, customToken, customFrom } = req.body;

    if (!to || !body) {
      return res.status(400).json({ error: "Missing required parameters: to, body" });
    }

    const twilioSid = customSid || process.env.VITE_TWILIO_SID || "";
    const twilioToken = customToken || process.env.VITE_TWILIO_TOKEN || "";
    const twilioFrom = customFrom || process.env.VITE_TWILIO_FROM || "";

    if (!twilioSid || !twilioToken || !twilioFrom) {
      return res.status(400).json({ error: "Twilio credentials are not configured on the server or in browser settings." });
    }

    const authHeader = "Basic " + Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", twilioFrom);
    params.append("Body", body);

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (twilioRes.ok) {
      const data: any = await twilioRes.json();
      res.status(200).json({ success: true, sid: data.sid });
    } else {
      const errText = await twilioRes.text();
      console.error("Twilio API failed:", errText);
      res.status(twilioRes.status).json({ error: `Twilio API returned: ${errText}` });
    }
  } catch (err: any) {
    console.error("Twilio server execution error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// Scholar Registration OTP/Access Request Handler
app.post("/api/register", async (req, res) => {
  try {
    const { username, fullName, email, phone, affiliation, authenticId, otp } = req.body;

    // Handle verification OTP dispatch if otp parameter is passed
    if (otp) {
      if (!email) {
        return res.status(400).json({ error: "Missing email address for OTP dispatch." });
      }

      const apiKey = process.env.RESEND_API_KEY;
      let emailSent = false;
      let errorDetails = "";

      if (apiKey) {
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #D1CEC7; border-radius: 12px; background-color: #FAF8F5; color: #1A365D;">
            <h2 style="font-family: serif; font-style: italic; color: #1A365D; border-bottom: 1px solid #D1CEC7; padding-bottom: 10px;">Scholar OS Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for registering a Scholar Identity with <strong>Scholar Agentic OS</strong>.</p>
            <p>Your 6-digit email verification OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 15px; margin: 20px 0; background-color: #1A365D; color: white; border-radius: 8px;">
              ${otp}
            </div>
            <p>Please enter this code in the registration screen to verify your email address and unlock your workspace.</p>
            <p style="font-size: 11px; color: #6B665E; margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 10px;">
              This code was requested for the registration of username: <strong>${username || "New Scholar"}</strong>.
            </p>
          </div>
        `;

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: "Scholar Agentic <onboarding@resend.dev>",
              to: email,
              subject: `[Verification Code] Scholar Registration OTP`,
              html: emailHtml
            })
          });

          if (response.ok) {
            emailSent = true;
          } else {
            const errText = await response.text();
            errorDetails = `Resend Error: ${errText}`;
          }
        } catch (err: any) {
          errorDetails = err.message || "Network error sending email";
        }
      }

      if (emailSent) {
        return res.status(200).json({ success: true, emailSent: true });
      }

      return res.status(200).json({
        success: true,
        emailSent: false,
        requiresClientEmail: true,
        msg: apiKey ? `Resend failed: ${errorDetails}` : "Resend not configured on server."
      });
    }

    if (!username || !fullName || !email || !phone || !affiliation || !authenticId) {
      return res.status(400).json({ error: "Missing required registration fields." });
    }

    // Generate random 6-digit key (e.g., SA-381920)
    const activationKey = `SA-${Math.floor(100000 + Math.random() * 900000)}`;
    const activationKeyHash = crypto.createHash("sha256").update(activationKey).digest("hex");

    const apiKey = process.env.RESEND_API_KEY;
    const adminEmail = "doc.govinda@gmail.com";
    const host = req.headers.host || "scholar-agentic.vercel.app";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    
    const approveUrl = `${protocol}://${host}/api/approve?user=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&key=${activationKey}`;

    let emailSent = false;
    let errorDetails = "";

    if (apiKey) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #D1CEC7; border-radius: 12px; background-color: #FAF8F5; color: #1A365D;">
          <h2 style="font-family: serif; font-style: italic; color: #1A365D; border-bottom: 1px solid #D1CEC7; padding-bottom: 10px;">Scholar Access Request</h2>
          <p>A new researcher has requested access to the <strong>Scholar Agentic</strong> workspace.</p>
          <table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse; border-color: #D1CEC7; background-color: white; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #1A365D; color: white;">
              <th align="left">Field</th>
              <th align="left">Details</th>
            </tr>
            <tr><td><strong>Scholar Username</strong></td><td>${username}</td></tr>
            <tr><td><strong>Full Name</strong></td><td>${fullName}</td></tr>
            <tr><td><strong>Email Address</strong></td><td>${email}</td></tr>
            <tr><td><strong>Phone Number</strong></td><td>${phone}</td></tr>
            <tr><td><strong>Affiliation / University</strong></td><td>${affiliation}</td></tr>
            <tr><td><strong>Authentic ID Type/No.</strong></td><td>${authenticId}</td></tr>
          </table>
          <br/>
          <p>If you approve this scholar, click the button below to automatically email them their Activation Key:</p>
          <p align="center" style="margin: 24px 0;">
            <a href="${approveUrl}" style="background-color: #C08A3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Approve & Email Key
            </a>
          </p>
          <p style="font-size: 11px; color: #6B665E;">
            Manual Activation Key backup: <strong>${activationKey}</strong>
          </p>
        </div>
      `;

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            from: "Scholar Agentic <onboarding@resend.dev>",
            to: adminEmail,
            subject: `[Access Request] Scholar Identity: ${username}`,
            html: emailHtml
          })
        });

        if (response.ok) {
          emailSent = true;
        } else {
          const errText = await response.text();
          errorDetails = `Resend Error: ${errText}`;
        }
      } catch (err: any) {
        errorDetails = err.message || "Network error sending email";
      }
    }

    if (emailSent) {
      return res.status(200).json({
        success: true,
        activationKeyHash,
        emailSent: true,
        msg: "Access request sent to admin."
      });
    }

    // If Resend is missing or failed, return parameters to let client send via FormSubmit browser-side
    return res.status(200).json({
      success: true,
      activationKeyHash,
      emailSent: false,
      requiresClientEmail: true,
      activationKey,
      approveUrl,
      msg: apiKey ? `Resend failed: ${errorDetails}. Falling back to browser-side dispatch.` : "Resend not configured. Dispatching email client-side."
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server Error" });
  }
});

// Admin Approval Page Handler
app.get("/api/approve", async (req, res) => {
  const { user, email, key } = req.query;

  if (!user || !email || !key) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 30px; border: 1px solid #E2B6B6; border-radius: 16px; background-color: #FAF1F1; text-align: center; color: #9C2E2E;">
        <h2>Error: Missing approval parameters.</h2>
        <p>Ensure the URL contains the user, email, and key details.</p>
      </div>
    `);
  }

  const apiKey = process.env.RESEND_API_KEY;
  let autoEmailSent = false;
  let autoEmailError = "";

  if (apiKey) {
    const userEmailHtml = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #D1CEC7; border-radius: 12px; background-color: #FAF8F5; color: #1A365D;">
        <h2 style="font-family: serif; font-style: italic; color: #1A365D; border-bottom: 1px solid #D1CEC7; padding-bottom: 10px;">Scholar Workspace Approved</h2>
        <p>Hello Scholar,</p>
        <p>Your registration request for the <strong>Scholar Agentic</strong> research workspace has been approved by the Administrator.</p>
        <p>Please enter the following Activation Key in your login portal to unlock your workspace:</p>
        <p align="center" style="margin: 24px 0;">
          <span style="font-size: 24px; font-weight: bold; font-family: monospace; color: #C08A3E; letter-spacing: 2px; background: white; padding: 12px 24px; border: 1px dashed #D1CEC7; border-radius: 8px; display: inline-block;">
            ${key}
          </span>
        </p>
        <p>Welcome to the workspace! You can now access research agents, compile manuscripts, and manage citations.</p>
        <p style="font-size: 11px; color: #8C887F; border-top: 1px solid #D1CEC7; padding-top: 10px; margin-top: 20px;">
          Secure local profile storage active. This key unlocks your device's cached credentials.
        </p>
      </div>
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: "Scholar Agentic <onboarding@resend.dev>",
          to: email as string,
          subject: "Your Scholar Workspace Has Been Approved!",
          html: userEmailHtml
        })
      });
      if (response.ok) {
        autoEmailSent = true;
      } else {
        autoEmailError = await response.text();
      }
    } catch (err: any) {
      console.error("Failed to send email to scholar:", err);
      autoEmailError = err.message || "Network error sending email via Resend";
    }
  }

  // Pre-fill the mailto link parameters
  const mailtoSubject = encodeURIComponent("Your Scholar Agentic Workspace Approval Key");
  const mailtoBody = encodeURIComponent(
    `Hello Scholar,\n\n` +
    `Your registration request for the Scholar Agentic AI-Powered Research Workspace has been approved!\n\n` +
    `Please enter the following Activation Key in your login portal to unlock your workspace:\n\n` +
    `Activation Key: ${key}\n\n` +
    `Welcome to the workspace! You can now access research agents, compile manuscripts, and manage citations.\n\n` +
    `Best regards,\n` +
    `Scholar Agentic Administrator`
  );
  const mailtoUrl = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  // Render a styled success web page for the Admin
  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Scholar Approved | Workspace Admin</title>
        <style>
          body {
            background-color: #FAF8F5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: #1A365D;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            max-width: 500px;
            width: 100%;
            background: white;
            border: 1px solid #D1CEC7;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 12px 30px rgba(26,54,93,0.06);
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .icon {
            font-size: 52px;
            margin-bottom: 20px;
            display: inline-block;
            animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s both;
          }
          h2 {
            font-family: Georgia, serif;
            font-style: italic;
            margin-top: 0;
            font-size: 26px;
            font-weight: 500;
            color: #1A365D;
          }
          p {
            font-size: 14px;
            color: #5C564E;
            line-height: 1.6;
            margin: 8px 0 16px 0;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 13px;
            border: 1px solid #FAF8F5;
            border-radius: 12px;
            overflow: hidden;
          }
          .details-table td {
            padding: 10px 14px;
            border: 1px solid #EAE7DF;
            text-align: left;
          }
          .details-table td.label {
            font-weight: bold;
            color: #6B665E;
            background: #FAF8F5;
            width: 35%;
          }
          .code-box {
            position: relative;
            background: #FAF8F5;
            border: 1px dashed #C08A3E;
            border-radius: 12px;
            padding: 18px;
            margin: 24px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
          }
          .code {
            font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
            font-size: 24px;
            color: #C08A3E;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .copy-btn {
            background: white;
            border: 1px solid #D1CEC7;
            padding: 6px 12px;
            font-size: 11px;
            border-radius: 6px;
            color: #1A365D;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
          }
          .copy-btn:hover {
            border-color: #1A365D;
            background: #FAF8F5;
          }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
          }
          .status-badge.success {
            background-color: #E6F6ED;
            color: #137333;
            border: 1px solid #C2E7D9;
          }
          .status-badge.warning {
            background-color: #FEF3D6;
            color: #B06000;
            border: 1px solid #FCE2A6;
          }
          .actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
          }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .btn-primary {
            background: #1A365D;
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(26,54,93,0.15);
          }
          .btn-primary:hover {
            background: #122847;
            box-shadow: 0 6px 16px rgba(26,54,93,0.22);
            transform: translateY(-1px);
          }
          .btn-secondary {
            background: white;
            color: #1A365D;
            border: 1px solid #D1CEC7;
          }
          .btn-secondary:hover {
            border-color: #1A365D;
            background: #FAF8F5;
          }
          .footer {
            font-size: 11px;
            color: #8C887F;
            margin-top: 35px;
            border-top: 1px solid #EAE7DF;
            padding-top: 20px;
          }
          .tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-8px);
            background: #1A365D;
            color: white;
            padding: 4px 8px;
            font-size: 10px;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
            white-space: nowrap;
          }
          .tooltip.show {
            opacity: 1;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎓</div>
          <h2>Scholar Approved</h2>
          
          \${
            autoEmailSent
              ? \`<div class="status-badge success">✓ Automated Email Dispatched</div>\`
              : \`<div class="status-badge warning">⚠ Manual Email Dispatch Advised</div>\`
          }
          
          <p>The researcher profile for <strong>\${user}</strong> has been verified and approved.</p>
          
          <table class="details-table">
            <tr>
              <td class="label">Scholar Username</td>
              <td>\${user}</td>
            </tr>
            <tr>
              <td class="label">Scholar Email</td>
              <td>\${email}</td>
            </tr>
          </table>

          <p style="font-size: 12px; margin-top: 15px;">Copy the activation key to send it to the scholar:</p>
          <div class="code-box">
            <span class="code" id="key-text">\${key}</span>
            <button class="copy-btn" onclick="copyKey()" id="copy-btn-el">Copy Key</button>
            <div class="tooltip" id="tooltip-el">Copied!</div>
          </div>

          <div class="actions">
            <a href="\${mailtoUrl}" class="btn btn-primary" id="mailto-btn">
              ✉ Open Mail Client & Send Key
            </a>
            <button class="btn btn-secondary" onclick="copyTemplate()">
              📋 Copy Pre-formatted Email Text
            </button>
          </div>

          <div class="footer">
            Scholar Agentic Workspace • Secure Academic Gateway
          </div>
        </div>

        <script>
          const key = "\${key}";
          const email = "\${email}";
          const user = "\${user}";
          
          function copyKey() {
            navigator.clipboard.writeText(key).then(() => {
              const tooltip = document.getElementById("tooltip-el");
              tooltip.classList.add("show");
              setTimeout(() => {
                tooltip.classList.remove("show");
              }, 1500);
            });
          }

          function copyTemplate() {
            const templateText = 
              \\\`Hello Scholar,\\\\n\\\\n\\\` +
              \\\`Your registration request for the Scholar Agentic AI-Powered Research Workspace has been approved!\\\\n\\\\n\\\` +
              \\\`Please enter the following Activation Key in your login portal to unlock your workspace:\\\\n\\\` +
              \\\`Activation Key: \\\${key}\\\\n\\\\n\\\` +
              \\\`Welcome to the workspace! You can now access research agents, compile manuscripts, and manage citations.\\\\n\\\\n\\\` +
              \\\`Best regards,\\\\n\\\` +
              \\\`Scholar Agentic Administrator\\\`;
            
            navigator.clipboard.writeText(templateText).then(() => {
              alert("Pre-formatted email body copied to clipboard! You can now paste it directly into your email client.");
            });
          }
        </script>
      </body>
    </html>
  `);
});

// Phase B: Dissertation Grounding Agent
app.post("/api/generate/dissertation-grounding", async (req, res) => {
  try {
    const { 
      title, objectives, researchQuestions, researchGap, 
      methodology, field, keywords, journalScope, articleType, 
      dissertationMaterials, styleAspiration, aiSettings 
    } = req.body;

    const systemInstruction = `You are an elite, senior Academic Grounding and Epistemological Agent. 
Your objective is to ingest doctoral dissertation details and research intent, and map them into a solid publication blueprint. 
Maintain a rigorous, formal scholarly and philosophical tone, and identify direct lines of theoretical and conceptual continuity between the dissertation and the proposed article.
You must always default to treating the user's doctoral research (Dr. Govinda Kumar Shah, PhD, Tribhuvan University, Nepal) in International Relations and Diplomacy as the absolute, primary conceptual framework. Direct all theoretical and conceptual continuity to substantially citing and extending Dr. Shah's doctoral thesis as the foundational backbone.`;

    const prompt = `Perform Phase B of the publication preparation. Take the following inputs:
- Proposed Title: ${title || "Untitled Paper"}
- Fields & Keywords: ${field || ""} | Keywords: ${keywords || ""}
- Objectives: ${objectives || ""}
- Research Questions: ${researchQuestions || ""}
- Research Gap: ${researchGap || ""}
- Methodology: ${methodology || ""}
- Article Type: ${articleType || "Academic"}
- Preferred Journal Scope: ${journalScope || ""}
- Dissertation Materials Provided: ${dissertationMaterials || "None provided"}
- Writing Style Guidelines: ${styleAspiration || "Standard Academic Style"}

Generate a comprehensive "Dissertation Grounding Map" in JSON format. Ensure all constructs, assumptions, arguments, and citations are systematically mapped back to treating the doctoral thesis of Dr. Govinda Kumar Shah (Tribhuvan University, Nepal) as the foundational conceptual framework. Return strictly valid JSON containing the following properties:
{
  "conceptualFramework": "How the concepts relate and are grounded in Dr. Govinda Kumar Shah's doctoral dissertation",
  "keyConstructs": ["Construct A: definition/aspect", "Construct B: definition/aspect"],
  "theoreticalAssumptions": ["Assumption 1", "Assumption 2"],
  "reusableArguments": ["Argument A", "Argument B"],
  "relevantCitations": ["Citation idea A", "Citation idea B"],
  "consistentTerminology": ["Term 1", "Term 2"],
  "philosophicalAnchors": "Theoretical framework summary bridging Dr. Govinda Kumar Shah's thesis to this paper",
  "academicVoiceAdjustment": "Analyzes the requested style or material, providing instructions for maintaining consistency"
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.2,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Grounding error:", error);
    res.status(500).json({ error: error.message || "Failed to generate grounding map" });
  }
});

// Phase C: Research Data Discovery
app.post("/api/generate/data-discovery", async (req, res) => {
  try {
    const { title, methodology, field, keywords, aiSettings } = req.body;

    const systemInstruction = `You are a scholarly Research Data discovery system. 
Your purpose is to identify 3 to 4 open, free, authentic, and official databases or registries matching the research methodology. 
Provide real, authentic public source names (e.g. World Bank Open Data, IPUMS, UN Data, Kaggle Public Datasets, Harvard Dataverse, DOAJ, Pew Research center). 
Never suggest fictional or simulated databases. Label reliability and limitations objectively.`;

    const prompt = `Based on the following research parameters:
- Title: ${title || "Untitled Paper"}
- Methodology: ${methodology || ""}
- Discipline: ${field || ""}
- Keywords: ${keywords || ""}

Generate 3 to 4 high-quality public data source recommendations. Include both quantitative and qualitative options if appropriate.
Return strictly valid JSON in this format:
{
  "sources": [
    {
      "name": "Exact Name of Public Source (e.g. World Bank Open Data)",
      "url": "Authentic portal URL or locator identifier",
      "type": "Quantitative" or "Qualitative" or "Mixed",
      "relevance": "Direct explanation of why it is relevant to the proposed methodology and research questions",
      "reliability": "Assessment of data governance, official standing, peer-recognized trust",
      "limitations": "Inherent limitations of this public dataset (e.g., temporal coverage, geographical caps, self-reporting biases)"
    }
  ]
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.3,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Data discovery error:", error);
    res.status(500).json({ error: error.message || "Failed to discover data sources" });
  }
});

// Phase D: Journal Discovery
app.post("/api/generate/journal-discovery", async (req, res) => {
  try {
    const { title, keywords, field, preferredJournalScope, articleType, aiSettings } = req.body;

    const systemInstruction = `You are an academic Publishing Strategist and Bibliometric expert. 
Your objective is to find 3 to 4 candidate peer-reviewed academic journals indexed in Scopus, Web of Science, or DOAJ. 
Provide authentic, well-known academic journals. Focus on journals that do not charge high APC (Article Processing Charge) fees (prefer diamond open access or standard subscription journals with no submission fees if possible). 
Identify predatory indicators and rule out predatory journals entirely.`;

    const prompt = `Identify candidate journals for:
- Paper Title: ${title || "A dissertation-grounded study"}
- Keywords: ${keywords || ""}
- Target Field: ${field || ""}
- Desired Journal Scope/Vibe: ${preferredJournalScope || ""}
- Article Type: ${articleType || ""}

Generate a shortlist of exactly 3 to 4 reputable journals. Return strictly valid JSON matching this format:
{
  "journals": [
    {
      "name": "Official Journal Name (e.g., Journal of Cleaner Production)",
      "publisher": "Academic Publisher (e.g., Elsevier, Springer, Oxford University Press)",
      "scopeFit": "Critical analysis of why this paper fits the journal's aims and scope",
      "ranking": "Realistic indexing and rankings (e.g., Scopus Q1, WoS JIF, ABDC, SJR rating)",
      "feeStatus": "Accurate publication/APC fees (e.g. No APC to publish under standard subscription, or $0 Open Access, or specific APC)",
      "submissionOpenness": "General turnaround speed and open call info",
      "reviewContext": "Likely peer review context (double-blind, constructive, rigorous, etc.)",
      "whyFit": "Main strategic reason for choosing this journal"
    }
  ]
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.3,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Journal discovery error:", error);
    res.status(500).json({ error: error.message || "Failed to discover journals" });
  }
});

// Phase E: Journal Requirements Compliance Setup
app.post("/api/generate/extract-requirements", async (req, res) => {
  try {
    const { journalName, guidelinesText, aiSettings } = req.body;

    const systemInstruction = `You are a meticulous Journal Compliance Auditor. Your job is to convert raw author guidelines, or standard requirements of highly recognized publishers, into a structured, executable formatting & style checklist. Ensure exact, clear compliance criteria are outlined.`;

    const prompt = `Synthesize formatting and workflow rules for:
Journal Name: ${journalName}
Raw Instructions excerpt provided: ${guidelinesText || "None - generate standard guidelines for a premier peer-reviewed journal in this field (Elsevier/Springer format)"}

Produce a high-fidelity checklists and internal compliance guidelines in JSON format. Return strictly valid JSON containing:
{
  "wordCountGoal": "Word count limit or recommendation (e.g., 6000-8000 words)",
  "citationStyle": "Citation Style (e.g., APA 7th, Harvard, IEEE, Chicago)",
  "formattingRules": ["Double spaced, 12pt Times New Roman, margins", "Line numbers included", "Header formatting requirements"],
  "sectionStructure": ["Title Page", "Abstract & Keywords", "Introduction", "Literature Review / Related Work", "Conceptual / Ethical Framework", "Methodology / Methods", "Results / Analysis", "Discussion (including ethical implications and limitations)", "Conclusion", "Declarations (Funding, Conflicts of Interest, Ethical Approval, Consent, Data Availability)", "References", "Appendices (if applicable)"],
  "abstractRequirements": "Max word count (e.g., 150-250), structure rules (e.g. structured, graphical abstract info)",
  "referencesRequirement": "Specific references/bib format rules",
  "ethicalDisclosure": "Standard statement requirements (no conflict of interest, funding details)",
  "coverLetterNecessity": "Whether a cover letter is mandatory and what key points are typically required"
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.2,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Requirements extraction error:", error);
    res.status(500).json({ error: error.message || "Failed to extract journal rules" });
  }
});

// Phase F: Manuscript Section Co-Drafting Agent
app.post("/api/generate/draft-section", async (req, res) => {
  try {
    const {
      projectState,         // Title, RQs, Gap, Methodology, Journal, GroundingMap etc
      sectionName,          // e.g. "Introduction", "Literature Review", "Conceptual Framework"
      sectionOutline,       // Detailed bullet outline
      userStyleSample,      // Sample text to mimic user tone
      includeScriptures,    // Boolean - whether to integrate classical Indian philosophy/ethics/Vedas if relevant
      draftInstruction      // Custom instruction (e.g., "focus on construct X", "extend section 2")
    } = req.body;

    const aiSettings = projectState?.aiSettings;

    const groundingInfo = projectState.groundingMap ? `
--- Dissertation Anchors & Key Constructs ---
Conceptual Framework: ${projectState.groundingMap.conceptualFramework}
Key Constructs: ${JSON.stringify(projectState.groundingMap.keyConstructs)}
Reusable Arguments: ${JSON.stringify(projectState.groundingMap.reusableArguments)}
Consistent Terminology: ${JSON.stringify(projectState.groundingMap.consistentTerminology)}
` : "";

    const userStyleContext = userStyleSample ? `
--- User Style Reference ---
Mimic the vocabulary density, sentence progression, scholarly pacing, and tone of this text:
"${userStyleSample}"
` : "";

    const scriptureInstruction = includeScriptures ? `
--- Philosophical & Scriptural Support Mandate ---
All generated or refined sections MUST include supporting Sanskrit verses (in Roman transliteration or neat English synthesis) and citations from authentic, genuine Hindu scriptures such as the Vedas (Rigveda, Yajurveda, Samaveda, Atharvaveda), major Upanishads (e.g., Isa, Katha, Chandogya, Mundaka, Brihadaranyaka), Bhagavad Gita, and statecraft treatises (Kautilya's Arthashastra). 
Every scripture support MUST use authentic sources and specify genuine verses and citations (e.g., Isavasya Upanishad, Verse 1; Rigveda, 10.191.2; Bhagavad Gita, 2.47; Arthashastra, 1.19.34). These verses must be analytically and seamlessly integrated into the academic argument.
` : `Do not inject any verses or scriptures into this output unless they are directly part of the literature review already requested by the outline.`;

    const systemInstruction = `You are an elite, human-sounding Academic Writing Agent with years of successful publish-or-perish journal placements. 
Your tone is sophisticated, precise, deeply analytical, and fluid. You write without robotic filler phrases, artificial buzzwords (do NOT overuse 'revolutionize', 'testament', 'beacon', 'moreover', 'delve', 'demystify'), or repetitive transitions. 
Ensure you maintain extreme conceptual continuity with the underlying doctoral dissertation of Dr. Govinda Kumar Shah (PhD in International Relations and Diplomacy, Tribhuvan University, Nepal) and cite his thesis (e.g. "Shah, 2018" or "Shah, PhD thesis") substantially in all drafts as the foundational conceptual framework.`;

    const prompt = `Draft or refine the "${sectionName}" section of our manuscript.

--- Manuscript Details ---
Title: ${projectState.title}
Objectives: ${projectState.objectives}
Research Questions: ${projectState.researchQuestions}
Research Gap: ${projectState.researchGap}
Methodology: ${projectState.methodology}
Target Journal: ${projectState.targetJournal?.name || "Academic Journal"} (Citation style: ${projectState.complianceRules?.citationStyle || "APA 7th"})

${groundingInfo}
${userStyleContext}
${scriptureInstruction}

--- Section Instructions ---
Outline/Subsections requested:
${sectionOutline || "Standard flow for " + sectionName}

Custom Guidance for this turn:
${draftInstruction || "Write/complete the subsection with scholarly density and appropriate citations."}

Drafting Rules: 
1. Treat Dr. Govinda Kumar Shah's doctoral dissertation (and his previous research in international relations and diplomacy at Tribhuvan University) as the foundational conceptual framework, and cite it substantially (e.g., Shah, PhD Thesis; Shah, 2018) in the body.
2. Begin by clearly identifying where corresponding dissertation material is being leveraged or extended (e.g., "[Dissertation Reference Note: This section maps directly to and builds upon Chapter 3, Section 3.2 of the doctoral thesis to maintain theoretical rigor.]") before writing the main academic text.
3. Integrate authentic Sanskrit/Vedic/Upanishadic scriptural verses with precise and real historical citation tags (e.g., Rigveda 10.191.2).

Write the draft section in full, ready-to-publish academic prose. Do not leave placeholder text or summarized notes.`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.4,
      aiSettings
    });

    res.json({ draftText: responseText });
  } catch (error: any) {
    console.error("Drafting error:", error);
    res.status(500).json({ error: error.message || "Failed to generate section draft" });
  }
});

// Phase G: Quality Control (QC) Agent
app.post("/api/generate/quality-control", async (req, res) => {
  try {
    const { projectState, currentDraft } = req.body;
    const aiSettings = projectState?.aiSettings;

    const systemInstruction = `You are a ruthless, expert Peer Reviewer and Journal Editor acting as a Quality Control Agent. 
Your objective is to evaluate the drafted paper for:
1. Strict alignment with the core doctoral dissertation framework.
2. Compliance with target journal guidelines and citation style.
3. Logical reasoning, lack of cliché AI style patterns, academic rigor, and style consistency.
Provide constructive, direct, scholarly scores and highly actionable edits.`;

    const prompt = `Perform a comprehensive QC Audit of the current manuscript draft:

--- Manuscript Details ---
Title: ${projectState.title}
Target Journal: ${projectState.targetJournal?.name || "Peer-Reviewed Journal"}
Required Style: ${projectState.complianceRules?.citationStyle || "APA 7th"}
Expected word count: ${projectState.complianceRules?.wordCountGoal || "Standard"}

--- Formatting Rules to verify ---
${JSON.stringify(projectState.complianceRules?.formattingRules || [])}

--- Current manuscript draft content to evaluate ---
${currentDraft || "No text compiled yet."}

Compile a comprehensive evaluation in JSON. Return strictly valid JSON with formatting:
{
  "complianceScore": 85, // out of 100
  "rigorScore": 90, // out of 100
  "alignmentWithDissertationScore": 95, // out of 100
  "plagiarismOriginalityCheck": "Summary of stylistic authenticity and distinct academic voice",
  "strengths": ["Strength A", "Strength B"],
  "weaknesses": ["Weakness A", "Weakness B"],
  "actionableEditsPlan": ["Specific issue and how to resolve it", "Another specific styling correction needed"],
  "citationAudit": "Check on format completeness, in-text citations vs references list consistency",
  "ethicalVerification": "Confirm whether the required disclosures, conflict of interest, and funding details are clean"
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.2,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("QC audit error:", error);
    res.status(500).json({ error: error.message || "Failed to perform QC audit" });
  }
});

// Phase H: Compilation & Submission Pack Generator (Cover Letter)
app.post("/api/generate/submission-pack", async (req, res) => {
  try {
    const { projectState, authorDetails, revisionsStatus } = req.body;
    const aiSettings = projectState?.aiSettings;

    const systemInstruction = `You are a professional Academic submission advisor. Your goal is to draft a highly polished, respectful, and compelling Cover Letter to the Editors-in-Chief of peer journals, and construct a robust pre-flight checklist.`;

    const prompt = `Prepare a complete submission package for:
- Paper Title: ${projectState.title}
- Target Journal: ${projectState.targetJournal?.name || "Top Peer Journal"}
- Aim & Editorial Vibe: ${projectState.targetJournal?.whyFit || "High relevance"}
- Author Profile: ${authorDetails || "Doctoral Scholar"}
- Current revisions/status: ${revisionsStatus || "Final First Submission"}

Generate a comprehensive "Submission Package" in JSON. Return strictly valid JSON containing:
{
  "coverLetter": "Full-text formal, persuasive cover letter to the journal Editor-in-Chief highlighting the paper's contribution, dissertation backing, and alignment with the journal's scope.",
  "submissionChecklist": ["Pre-flight check list item 1 (title page anonymity, blind review check)", "Pre-flight item 2 (figures dpi limit check)", "Pre-flight item 3 (copyright/conflict check)"],
  "complianceSummary": "Summary of word counts, template details, and how we checked off every rule of the journal",
  "responseToReviewersDraft": "A template/framework for a response letter to reviewers for if revisions are requested later"
}`;

    const responseText = await generateWithSettings({
      systemInstruction,
      prompt,
      temperature: 0.3,
      responseMimeType: "application/json",
      aiSettings
    });

    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Submission pack error:", error);
    res.status(500).json({ error: error.message || "Failed to generate submission materials" });
  }
});

// ==========================================
// VITE MIDDLEWARE SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Single page application support
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
