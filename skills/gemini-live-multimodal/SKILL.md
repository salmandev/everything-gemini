---
name: gemini-live-multimodal
description: Implements real-time bidirectional streaming audio and video pair-programming with the Gemini Live API, WebSocket protocols, ephemeral tokens, and voice activity detection.
---

# Gemini Live Multimodal (Bidirectional Audio/Visual Streaming)

Implements real-time, low-latency, bidirectional audio/video interaction with Google Gemini models (Gemini 2.0 Flash and Gemini Live) using WebSockets, Ephemeral Client Tokens, Voice Activity Detection (VAD), and live screen/DOM streaming.

---

## 1. Architecture: Bidirectional Gemini Live API

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             GEMINI LIVE RUNTIME                             │
│                                                                             │
│   ┌─────────────────────┐   Audio (PCM 16kHz)   ┌─────────────────────────┐ │
│   │ Developer Audio     │──────────────────────►│ Google GenAI Live API   │ │
│   │ (Microphone Input)  │                       │ (wss://generativelanguage│ │
│   └─────────────────────┘                       │  .googleapis.com/ws)    │ │
│                                                 │                         │ │
│   ┌─────────────────────┐   Frames (JPEG/WebP)  │ • Voice Activity Detect │ │
│   │ Active Screen / IDE │──────────────────────►│ • Extended Reasoning    │ │
│   │ (Visual Context)    │                       │ • Sub-second TTFT Voice │ │
│   └─────────────────────┘                       └───────────┬─────────────┘ │
│                                                             │               │
│   ┌─────────────────────┐   Synthesized Audio (24kHz)       │               │
│   │ Agent Voice Stream  │◄──────────────────────────────────┘               │
│   │ (Speaker Output)    │                                                   │
│   └─────────────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Ephemeral Session Token Minting

For enterprise browser/IDE security, never expose primary API keys on clients. Mint short-lived ephemeral tokens from your secure backend:

```python
import os
from google import genai
from google.genai import types

client = genai.Client()

def create_ephemeral_live_session(user_id: str, ttl_seconds: int = 1800) -> str:
    """Mints an ephemeral session token with pre-configured system instructions."""
    session = client.aio.live.create_session_token(
        model="gemini-2.0-flash-exp",
        config=types.LiveConnectConfig(
            response_modalities=[types.LiveModality.AUDIO],
            system_instruction=types.Content(
                parts=[types.Part.from_text(
                    "You are an expert pair-programming agent inside Antigravity. "
                    "Analyze screen frames and audio simultaneously. Be concise and actionable."
                )]
            ),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                )
            )
        )
    )
    return session.token
```

---

## 3. Bidirectional WebSocket Audio Streaming (Python Client)

Connects to the Gemini Live WebSocket endpoint and streams audio bi-directionally:

```python
import asyncio
import websockets
import json

LIVE_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"

async def stream_live_pair_programming(api_key: str):
    url = f"{LIVE_WS_URL}?key={api_key}"
    
    async with websockets.connect(url) as ws:
        # 1. Send initial session handshake
        setup_message = {
            "setup": {
                "model": "models/gemini-2.0-flash-exp",
                "generation_config": {
                    "response_modalities": ["AUDIO"],
                    "speech_config": {
                        "voice_config": {
                            "prebuilt_voice_config": {"voice_name": "Puck"}
                        }
                    }
                }
            }
        }
        await ws.send(json.dumps(setup_message))
        
        # 2. Receive live audio chunks & emit to speaker
        async for raw_msg in ws:
            response = json.loads(raw_msg)
            server_content = response.get("serverContent", {})
            model_turn = server_content.get("modelTurn", {})
            
            for part in model_turn.get("parts", []):
                inline_data = part.get("inlineData", {})
                if inline_data.get("mimeType", "").startswith("audio/"):
                    pcm_chunk = inline_data.get("data")
                    # Send to audio output buffer
```

---

## 4. Visual Screen Frame Injection

Inject captured screen frames at 1 frame per second to ground audio conversation in visual code context:

```python
import base64

async def send_screen_frame(ws, jpeg_bytes: bytes):
    """Encodes a screen capture and sends it as a visual context turn."""
    frame_payload = {
        "realtime_input": {
            "media_chunks": [
                {
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(jpeg_bytes).decode("utf-8")
                }
            ]
        }
    }
    await ws.send(json.dumps(frame_payload))
```

---

## 5. Enterprise Best Practices & Anti-Patterns

| Category | Recommended Pattern | Anti-Pattern |
| :--- | :--- | :--- |
| **Authentication** | Ephemeral tokens with 30m TTL minted by backend | Hardcoding permanent API keys in frontend bundles |
| **Audio Format** | PCM 16-bit little-endian at 16,000Hz mono | Compressed MP3 with variable bitrates causing VAD jitter |
| **Video Cadence** | Throttled keyframes at 1 FPS or on viewport change | 60 FPS full video ingestion saturating network bandwidth |
| **Voice Activity** | Enable built-in server-side Voice Activity Detection | Client-side manual push-to-talk creating unnatural latency |
