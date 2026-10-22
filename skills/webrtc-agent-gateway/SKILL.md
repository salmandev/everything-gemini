---
name: webrtc-agent-gateway
description: Architect and deploy ultra-low latency WebRTC audio duplex gateways, Opus audio transcoding, STUN/TURN ICE candidate negotiation, and real-time voice streaming for Gemini Live pair programming.
---

# WebRTC Agent Gateway (Ultra-Low Latency Duplex Voice Streaming)

Architects, secures, and deploys production-grade WebRTC media gateways that bridge browser/IDE client media streams directly into the Google Gemini Live API. Implements bidirectional Opus/PCM audio transcoding, interactive data channels, STUN/TURN NAT traversal, and jitter-buffer optimization for sub-200ms voice pair-programming.

---

## 1. WebRTC Duplex Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       WEBRTC MEDIA GATEWAY TOPOLOGY                         │
│                                                                             │
│   ┌─────────────────────┐      WebRTC PeerConnection     ┌────────────────┐ │
│   │ Developer Browser   │◄──────────────────────────────►│ WebRTC Gateway │ │
│   │ / Antigravity IDE   │   SRTP / Opus Audio Tracks     │ (aiortc / Go)  │ │
│   └─────────────────────┘   SCTP DataChannel (Events)    └───────┬────────┘ │
│              │                                                   │          │
│              │ SDP Offer / Answer (HTTPS / WSS)                  │          │
│              ▼                                                   ▼          │
│   ┌─────────────────────┐                            ┌────────────────────┐ │
│   │ Coturn STUN / TURN  │                            │ Google Gemini Live │ │
│   │ NAT Traversal Relay │                            │ WebSocket Endpoint │ │
│   └─────────────────────┘                            └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Python aiortc WebRTC Gateway Implementation

Below is a production-grade WebRTC audio bridge receiving developer microphone tracks, transcoding Opus to PCM 16kHz for Gemini Live, and streaming back synthesized agent speech:

```python
import asyncio
import json
import fractions
import time
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaBlackhole
from av import AudioResampler, AudioFrame
from google import genai
from google.genai import types

class GeminiLiveAudioTrack(MediaStreamTrack):
    """Generates outgoing WebRTC audio frames from Gemini Live synthesized speech."""
    kind = "audio"

    def __init__(self):
        super().__init__()
        self.queue = asyncio.Queue()
        self._sample_rate = 48000
        self._samples_per_frame = 960  # 20ms at 48kHz
        self._pts = 0

    def push_pcm_bytes(self, pcm_data: bytes):
        """Pushes raw 24kHz/16kHz PCM audio bytes from Gemini into the WebRTC audio queue."""
        self.queue.put_nowait(pcm_data)

    async def recv(self):
        pcm_chunk = await self.queue.get()
        frame = AudioFrame(format="s16", layout="mono", samples=self._samples_per_frame)
        frame.planes[0].update(pcm_chunk[:frame.linesizes[0]])
        frame.sample_rate = self._sample_rate
        frame.time_base = fractions.Fraction(1, self._sample_rate)
        frame.pts = self._pts
        self._pts += self._samples_per_frame
        return frame

class WebRTCAgentGateway:
    def __init__(self, gemini_api_key: str):
        self.client = genai.Client(api_key=gemini_api_key)
        self.pcs = set()

    async def handle_offer(self, sdp_offer: str, sdp_type: str = "offer") -> dict:
        pc = RTCPeerConnection()
        self.pcs.add(pc)

        outgoing_audio = GeminiLiveAudioTrack()
        pc.addTrack(outgoing_audio)

        @pc.on("track")
        def on_track(track):
            if track.kind == "audio":
                asyncio.create_task(self._relay_to_gemini(track, outgoing_audio))

        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            if pc.connectionState in ["failed", "closed"]:
                await pc.close()
                self.pcs.discard(pc)

        offer = RTCSessionDescription(sdp=sdp_offer, type=sdp_type)
        await pc.setRemoteDescription(offer)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}

    async def _relay_to_gemini(self, track: MediaStreamTrack, outgoing_audio: GeminiLiveAudioTrack):
        resampler = AudioResampler(format="s16", layout="mono", rate=16000)
        async with self.client.aio.live.connect(
            model="gemini-2.0-flash-exp",
            config=types.LiveConnectConfig(
                response_modalities=[types.LiveModality.AUDIO],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Aoede")
                    )
                )
            )
        ) as session:
            # Task to read synthesized audio from Gemini and queue to WebRTC
            async def receive_from_gemini():
                async for response in session.receive():
                    server_content = response.server_content
                    if server_content and server_content.model_turn:
                        for part in server_content.model_turn.parts:
                            if part.inline_data:
                                outgoing_audio.push_pcm_bytes(part.inline_data.data)

            receiver_task = asyncio.create_task(receive_from_gemini())

            try:
                while True:
                    frame = await track.recv()
                    resampled = resampler.resample(frame)
                    for r_frame in resampled:
                        pcm_bytes = r_frame.planes[0].to_bytes()
                        await session.send(input={"data": pcm_bytes, "mime_type": "audio/pcm;rate=16000"})
            except asyncio.CancelledError:
                receiver_task.cancel()
```

---

## 3. Client WebRTC SDP Exchange & ICE Configuration

```typescript
export async function initializeVoiceSession(gatewayUrl: string): Promise<RTCPeerConnection> {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:turn.enterprise-antigravity.internal:3478',
        username: 'agent-dev',
        credential: 'ephemeral-turn-token'
      }
    ]
  });

  // Capture developer microphone stream
  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 48000,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  micStream.getAudioTracks().forEach(track => pc.addTrack(track, micStream));

  // Audio track speaker output
  pc.ontrack = (event) => {
    if (event.track.kind === 'audio') {
      const audioEl = new Audio();
      audioEl.srcObject = event.streams[0];
      audioEl.play().catch(console.error);
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const response = await fetch(`${gatewayUrl}/api/webrtc/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp: offer.sdp, type: offer.type })
  });

  const answer = await response.json();
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  return pc;
}
```

---

## 4. Operational Best Practices & SLA Targets

1. **Jitter-Buffer Tuning**: Target 40ms to 80ms playout delay. Avoid buffer bloating which degrades conversational turn-taking.
2. **STUN/TURN High Availability**: Deploy Coturn behind Network Load Balancers (NLB) across at least 2 GCP availability zones.
3. **Graceful Teardown**: Intercept `connectionstatechange` to immediately close Gemini WebSocket sessions on client hangup.
