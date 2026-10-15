---
name: architecture-designer
description: >-
  Creates comprehensive system design architectures, Mermaid diagrams, API contracts, and Architecture Decision Records (ADRs). Use when planning complex software systems or designing net-new components.
---

# Architecture Designer

This skill structures software design workflows, creating standardized Architecture Decision Records (ADRs) and Mermaid diagrams.

## Design Workflow

### 1. Requirements & Constraint Gathering
- Clarify functional and non-functional requirements (latency, throughput, availability, consistency).
- Identify existing tech stack dependencies and constraints.

### 2. High-Level Diagramming with Mermaid
Always visualize architectures using GitHub-flavored Mermaid blocks:
- **System Context (C4 Level 1)**
- **Container / Service Diagram (C4 Level 2)**
- **Sequence Diagram (Data Flow)**

*Rule*: Quote node labels containing special characters: `id["Service Name (Tech Stack)"]`.

### 3. Architecture Decision Record (ADR)
Structure decisions in this format:
- **Title**: `ADR-00X: Short descriptive title`
- **Status**: Proposed / Accepted / Superseded
- **Context**: Problem statement and forces at play.
- **Decision**: The architectural choice and implementation strategy.
- **Consequences**: Positive outcomes and trade-offs.

For full examples, see [examples/c4-architecture.md](./examples/c4-architecture.md).
