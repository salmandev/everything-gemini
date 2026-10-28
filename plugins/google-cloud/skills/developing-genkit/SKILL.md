---
name: developing-genkit
description: Builds, tests, and deploys production AI agents, flows, tools, and multimodal pipelines using Google Genkit across JavaScript, TypeScript, Python, Go, and Dart.
---

# Developing with Google Genkit

Guides agents in building, evaluating, and deploying production AI workflows, structured tool integrations, and multimodal pipelines using **Google Genkit**. Covers TypeScript/JavaScript, Python, Go, and Dart runtimes, along with local Dev UI inspection and Cloud Run deployment.

---

## 1. Genkit Architecture & Multi-Language Support

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Google Genkit Core                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Flows (defineFlow)            Tools (defineTool)          Plugins & Models    │
│   ┌───────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐ │
│   │ • Type-Safe Execution │ ──> │ • JSON Schema / Zod │ ──> │ • Google AI     │ │
│   │ • OpenTelemetry Trace │     │ • Pydantic Specs    │     │ • Vertex AI     │ │
│   │ • State Checkpointing │     │ • Error Handling    │     │ • Ollama / vLLM │ │
│   └───────────────────────┘     └─────────────────────┘     └─────────────────┘ │
│                                                                                 │
│   Supported Runtimes:                                                           │
│   • TypeScript / Node.js (`@genkit-ai/ai`, `@genkit-ai/googleai`)               │
│   • Python (`genkit`, `genkit.plugins.google_ai`)                               │
│   • Go (`github.com/firebase/genkit/go/genkit`)                                 │
│   • Dart / Flutter (`package:genkit`)                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. TypeScript / JavaScript Implementation

### 1. Initialize and Configure Genkit Flow
```typescript
import { genkit, z } from 'genkit';
import { googleAI, gemini25Pro } from '@genkit-ai/googleai';

const ai = genkit({
  plugins: [googleAI()],
  model: gemini25Pro,
});

// 1. Define Type-Safe Tool
const weatherTool = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Retrieves current weather conditions for a given city',
    inputSchema: z.object({ city: z.string() }),
    outputSchema: z.object({ temp: z.number(), condition: z.string() }),
  },
  async ({ city }) => {
    return { temp: 72, condition: 'Sunny' };
  }
);

// 2. Define Orchestrated Flow
export const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const { text } = await ai.generate({
      prompt,
      tools: [weatherTool],
      config: { temperature: 0.7 },
    });
    return text;
  }
);
```

---

## 3. Python Implementation

```python
"""Genkit Python Agent Flow with Type-Safe Tool Calling."""

from pydantic import BaseModel
from genkit.core import Genkit
from genkit.plugins.google_ai import GoogleAI, gemini25_pro

ai = Genkit(plugins=[GoogleAI()], model=gemini25_pro)

class WeatherInput(BaseModel):
    city: str

class WeatherOutput(BaseModel):
    temp: float
    condition: str

@ai.tool(name="get_weather", description="Fetches current weather for a city")
def get_weather(input_data: WeatherInput) -> WeatherOutput:
    return WeatherOutput(temp=72.0, condition="Sunny")

@ai.flow(name="agent_flow")
def agent_flow(prompt: str) -> str:
    response = ai.generate(
        prompt=prompt,
        tools=[get_weather],
    )
    return response.text

if __name__ == "__main__":
    print(agent_flow("What is the weather in Seattle?"))
```

---

## 4. Local Testing with Genkit Developer UI

Launch the interactive developer UI to inspect prompt traces, latency waterfalls, and tool executions locally:

```bash
# Start Genkit local developer UI
npx genkit start

# Or in Python
genkit start -- python main.py
```
Open `http://localhost:4000` to interact with flows, replay failed turns, and inspect tool arguments.

---

## 5. Deploying Genkit to Google Cloud Run

Package and deploy as a stateless, autoscaling agent endpoint:

```bash
# Build and deploy container to Cloud Run
gcloud run deploy genkit-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="projects/${PROJECT_ID}/secrets/gemini-api-key:latest"
```
