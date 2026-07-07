# AI Studio - System Analysis and Design

**Version:** 1.0  
**Date:** July 7, 2026  
**Author:** System Analysis  

---

## 1. Executive Summary

AI Studio is a Next.js-based AI Operating System that unifies AI-powered creation, research, automation, and publishing into one extensible platform. The system follows a modular architecture with a central AI Kernel that abstracts multiple AI providers.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Chat UI   │  │  Image UI   │  │ Voice/Video UI│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                   API Layer (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ /api/chat   │  │ /api/images │  │ /api/voice  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                   AI Kernel Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   AiKernel                          │   │
│  │  - Provider Management                              │   │
│  │  - Request Routing                                  │   │
│  │  - Error Handling                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────┬─────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                   Provider Layer                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ OpenAI  │ │Ollama   │ │Gemini   │ │Mock     │         │
│  │ (DALL-E)│ │(Local)  │ │(Cloud)  │ │(Dev)    │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 AI Kernel (`lib/ai/kernel.ts`)
- **Purpose:** Central abstraction layer for all AI providers
- **Responsibilities:**
  - Provider registration and management
  - Request routing based on provider ID
  - API key validation and injection
  - Error handling and fallback logic
- **Key Methods:**
  - `listProviders()` - Returns available providers
  - `generateText()` - Text generation
  - `generateTextStream()` - Streaming text generation
  - `generateImage()` - Image generation (newly added)

#### 2.2.2 AI Providers (`lib/ai/providers/`)
- **OpenAI Provider:** Supports GPT models and DALL-E for image generation
- **Ollama Provider:** Local model support via Ollama API
- **Gemini Provider:** Google's Gemini models
- **Groq Provider:** Fast inference via Groq API
- **OpenRouter Provider:** Unified access to multiple models
- **Mock Provider:** Development/testing mode

#### 2.2.3 Application Shell (`components/layout/app-shell.tsx`)
- **Purpose:** Main layout wrapper for authenticated pages
- **Features:**
  - Authentication check via localStorage
  - Sidebar and top navigation integration
  - Loading state during auth verification

#### 2.2.4 Feature Modules
- **Chat:** Real-time AI conversation with streaming support
- **Images:** Image generation with prompt, size, and style controls
- **Voice:** Text-to-speech (stub)
- **Video:** Video generation (stub)
- **Projects:** Project management and organization
- **Settings:** AI provider configuration

---

## 3. Data Flow

### 3.1 Text Generation Flow
```
User Input → Chat UI → /api/chat → AiKernel → Provider → Response
```

### 3.2 Image Generation Flow
```
User Prompt → Image UI → /api/images → AiKernel → Provider → Image URL
```

---

## 4. System Design Patterns

### 4.1 Provider Pattern
Each AI provider implements a common interface (`AiProvider`) with:
- `id`: Unique provider identifier
- `name`: Human-readable name
- `capabilities`: Array of supported features (chat, image, voice, video)
- `defaultModel`: Default model for the provider
- `generateText()`: Text generation method
- `generateTextStream()`: Optional streaming method
- `generateImage()`: Optional image generation method

### 4.2 Error Handling
Custom error classes:
- `AiKernelError`: Base error class
- `AiProviderRequestError`: Provider-specific errors
- `AiProviderUnavailableError`: Connection/availability errors
- `AiValidationError`: Input validation errors

### 4.3 Type System
Strong TypeScript types for:
- `AiRole`: "system" | "user" | "assistant"
- `AiCapability`: "chat" | "image" | "voice" | "video"
- `AiGenerateTextRequest/Response`: Text generation types
- `AiGenerateImageRequest/Response`: Image generation types
- `AiGenerateVoiceRequest/Response`: Voice generation types (future)
- `AiGenerateVideoRequest/Response`: Video generation types (future)

---

## 5. Current Implementation Status

### 5.1 Completed Features
- ✅ AI Kernel with provider abstraction
- ✅ Multiple AI providers (OpenAI, Ollama, Gemini, Groq, OpenRouter, Mock)
- ✅ Chat API with streaming support
- ✅ Image API with mock provider
- ✅ Settings page with provider configuration
- ✅ Authentication flow
- ✅ Navigation system

### 5.2 In Progress
- ⏳ Image Studio UI (completed)
- ⏳ OpenAI DALL-E integration (completed)
- ⏳ OpenRouter image support (pending)

### 5.3 Pending Features
- ⬜ Voice Studio (TTS)
- ⬜ Video Studio
- ⬜ Project management
- ⬜ AI Agents
- ⬜ Workflow automation

---

## 6. Technical Specifications

### 6.1 Stack
- **Framework:** Next.js 16.2.10 (Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS variables
- **Icons:** Lucide React
- **Authentication:** NextAuth (configured)

### 6.2 API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Text generation (stream or non-stream) |
| `/api/images` | POST | Image generation |
| `/api/auth/[...nextauth]` | GET/POST | Authentication |
| `/api/admin/save-env` | POST | Environment variable management |

### 6.3 Environment Variables
- `OPENAI_API_KEY` - OpenAI API key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `GEMINI_API_KEY` - Google Gemini API key
- `GROQ_API_KEY` - Groq API key
- `ANTHROPIC_API_KEY` - Anthropic API key

---

## 7. Security Considerations

### 7.1 API Key Management
- API keys are stored in localStorage (client-side)
- Keys are passed to API routes via request body
- Server-side environment variables for default keys
- No keys stored in server-side code

### 7.2 Authentication
- Client-side authentication check
- localStorage-based session management
- NextAuth integration for future server-side auth

---

## 8. Recommendations

### 8.1 Immediate
1. Add OpenRouter image generation support
2. Implement proper error boundaries in UI
3. Add loading states for all async operations
4. Create API key management UI

### 8.2 Short-term
1. Add voice generation with Web Speech API or cloud providers
2. Implement project persistence (localStorage or database)
3. Add image history/gallery
4. Create provider status monitoring

### 8.3 Long-term
1. Add database for project persistence
2. Implement workflow automation
3. Add plugin system for custom providers
4. Create mobile-responsive design
5. Add offline support with service workers

---

## 9. File Structure

```
ai-studio/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   ├── images/           # Image generation API
│   │   └── auth/
│   ├── chat/
│   ├── images/               # Image Studio page
│   ├── settings/
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   └── navigation-list.tsx
│   └── ui/
├── lib/
│   └── ai/
│       ├── kernel.ts         # AI Kernel
│       ├── types.ts          # Type definitions
│       ├── errors.ts         # Error classes
│       └── providers/
│           ├── openai.ts     # OpenAI + DALL-E
│           ├── ollama.ts
│           ├── gemini.ts
│           ├── groq.ts
│           ├── openrouter.ts
│           └── mock.ts       # Mock provider
└── docs/
    ├── 01-Vision.md
    ├── 02-PRD.md
    ├── 03-AI-Kernel-Architecture.md
    └── 04-System-Analysis-and-Design.md
```

---

## 10. Testing

### 10.1 API Testing
```bash
# Test chat API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"stream":true}'

# Test image API
curl -X POST http://localhost:3000/api/images \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A serene mountain landscape"}'
```

### 10.2 Build Verification
```bash
npm run build
# All routes should compile successfully
```

---

## 11. Conclusion

AI Studio follows a well-structured modular architecture with a central AI Kernel that abstracts multiple AI providers. The system is designed to be extensible, supporting both local and cloud AI providers. The current implementation provides a solid foundation for building out the remaining features (Voice, Video, Projects, Agents).