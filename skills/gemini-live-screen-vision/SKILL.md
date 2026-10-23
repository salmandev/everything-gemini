---
name: gemini-live-screen-vision
description: Streams high-framerate desktop/browser screen frames, analyzes visual DOM repaints, and extracts terminal OCR errors for live multimodal voice/visual pair programming with Gemini Live.
---

# Gemini Live Screen Vision & Repaint Analyzer (`gemini-live-screen-vision`)

Integrates real-time desktop screen capture, browser DOM repaint diffing, terminal OCR error extraction, and synchronized audio-visual feedback loops directly with the Gemini 3.8 Live API for sub-second multimodal pair programming.

---

## 1. Architectural Model: Multimodal Video & Voice Duplex

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 GEMINI LIVE SCREEN VISION STREAMING RUNTIME                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Client Screen & IDE Capture Engine                               │   │
│   │    • 1080p @ 30–60fps WebRTC screen track or periodic JPEG stream   │   │
│   │    • Active viewport region extraction (Browser canvas, Terminal)   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 2. Visual Repaint Diff & Change Detector                            │   │
│   │    • Pixel-level perceptual hash (pHash) & structural similarity    │   │
│   │    • Filters static frames; transmits only on repaint transitions   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 3. Gemini Live Bidirectional WebSocket Gateway                      │   │
│   │    ┌───────────────────────────┐     ┌──────────────────────────┐   │   │
│   │    │ Video Inbound: VP9/H.264  │     │ Audio Duplex: Opus 24kHz │   │   │
│   │    │ (DOM renders, stack traces│     │ (Real-time voice pairs)  │   │   │
│   │    └─────────────┬─────────────┘     └────────────┬─────────────┘   │   │
│   └──────────────────┼────────────────────────────────┼─────────────────┘   │
│                      └────────────────┬───────────────┘                     │
│                                       ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 4. Multimodal Cognitive Fusion Engine                               │   │
│   │    • Correlates developer speech ("why is the button misaligned?")   │   │
│   │      with exact visual bounding box coordinates on active screen    │   │
│   │    • Emits proactive vocal guidance before test failures compound   │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Surgical IDE Code Patching                                       │   │
│   │    • Proposes atomic diffs directly to IDE active editor buffer     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Streaming Primitives & Frame Optimization

### A. Perceptual Diff Filter (pHash)
Streaming raw 60fps 1080p video incurs excessive bandwidth and token consumption. The vision engine computes frame-to-frame hamming distance:
- $\Delta(\text{Frame}_t, \text{Frame}_{t-1}) < 5$: Static screen; transmission bypassed.
- $\Delta \ge 5$: Visual transition (e.g. page repaint, terminal scroll); frame emitted to Gemini Live.

### B. High-Precision Bounding Box Grounding
When Gemini Live detects UI layout anomalies, it outputs normalized coordinate bounding boxes $[y_{\min}, x_{\min}, y_{\max}, x_{\max}]$:
```json
{
  "anomaly": "CSS Flexbox Overflow in Hero Title",
  "bounding_box": [120, 450, 240, 890],
  "recommendation": "Set flex-wrap: wrap on #hero-container"
}
```

---

## 3. Operational Recipes

### Launching Live Screen Vision Session via CLI
```bash
# Start live screen streaming bridge to Gemini Live API
everything-gemini live-vision stream --fps 15 --resolution 1080p

# Capture single-frame visual diagnostic of active IDE
everything-gemini live-vision capture --workspace . --json
```

### Python SDK Multimodal Screen Session
```python
from google_antigravity.live import GeminiLiveVisionSession

session = GeminiLiveVisionSession(
    model="gemini-3.8-live",
    audio_format="opus",
    video_fps=15,
    enable_vad=True
)

# Attach desktop window display capture
session.attach_display_stream(display_id=1)
session.start_bidirectional_loop()
```

---

## 4. Cross-Reference Links
- See [skills/gemini-live-multimodal/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/gemini-live-multimodal/SKILL.md) for core WebSocket protocols.
- See [skills/webrtc-agent-gateway/SKILL.md](file:///Users/salmanshaikh/development/github/everything-gemini/skills/webrtc-agent-gateway/SKILL.md) for WebRTC ICE negotiation.
- See [agents/browser-qa.md](file:///Users/salmanshaikh/development/github/everything-gemini/agents/browser-qa.md) for automated visual QA assertions.
