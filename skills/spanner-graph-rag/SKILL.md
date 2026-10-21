---
name: spanner-graph-rag
description: Implements Google Cloud Spanner Graph schemas, ISO GQL queries, knowledge graph traversal, and hybrid graph-vector RAG pipelines for Gemini agents.
---

# Spanner Graph & Knowledge Graph RAG

Designs, provisions, and queries distributed enterprise knowledge graphs using Google Cloud Spanner Graph. Implements ISO GQL (Graph Query Language) multi-hop traversals, cyclic graph pattern matching, and hybrid Graph-Vector RAG to eliminate hallucinations across complex organizational entity networks.

---

## 1. Architecture: Graph-Grounded Agentic Reasoning

```
                                Google Cloud Spanner
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPANNER DISTRIBUTED GRAPH ENGINE                      │
│                                                                             │
│   ┌─────────────────────┐                   ┌───────────────────────────┐   │
│   │ Node Table: Account │                   │ Node Table: Microservice  │   │
│   │ (Enterprise Org)    │                   │ (Infrastructure Artifact) │   │
│   └──────────┬──────────┘                   └─────────────┬─────────────┘   │
│              │                                            │                 │
│              │       Edge: OWNS             Edge: CALLS   │                 │
│              └────────────────► [TEAM] ───────────────────┘                 │
│                                   │                                         │
│                                   ▼                                         │
│                    ┌─────────────────────────────┐                          │
│                    │ Edge: MUTATES_RESOURCE      │                          │
│                    │ Destination: Cloud Database │                          │
│                    └──────────────┬──────────────┘                          │
│                                   │                                         │
│                                   ▼                                         │
│            ┌───────────────────────────────────────────────┐                │
│            │ ISO GQL Multi-Hop Graph Traversal             │                │
│            │ MATCH (t:Team)-[:CALLS*1..3]->(m:Service)     │                │
│            └──────────────────────┬────────────────────────┘                │
│                                   │ Grounded Entity Context                 │
│                                   ▼                                         │
│            ┌───────────────────────────────────────────────┐                │
│            │ Gemini 2.0 / 3.8 Reasoning & Action Engine    │                │
│            │ Zero hallucination on architectural blast radius│               │
│            └───────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Spanner Graph DDL (`CREATE PROPERTY GRAPH`)

Define nodes, edges, and relationship labels on top of strongly consistent Spanner tables:

```sql
-- 1. Base Relational Tables
CREATE TABLE Services (
  service_id STRING(64) NOT NULL,
  name STRING(128) NOT NULL,
  tier STRING(32) NOT NULL,
  owner_team STRING(64) NOT NULL,
  created_at TIMESTAMP OPTIONS (allow_commit_timestamp = true)
) PRIMARY KEY (service_id);

CREATE TABLE Dependencies (
  caller_id STRING(64) NOT NULL,
  target_id STRING(64) NOT NULL,
  protocol STRING(32) NOT NULL,
  criticality STRING(16) NOT NULL,
  CONSTRAINT FK_Caller FOREIGN KEY (caller_id) REFERENCES Services (service_id),
  CONSTRAINT FK_Target FOREIGN KEY (target_id) REFERENCES Services (service_id)
) PRIMARY KEY (caller_id, target_id);

-- 2. Property Graph Definition (ISO GQL Standard)
CREATE PROPERTY GRAPH ServiceArchitectureGraph
  VERTEX TABLES (
    Services
      LABEL Service
      PROPERTIES (service_id, name, tier, owner_team)
  )
  EDGE TABLES (
    Dependencies
      SOURCE KEY (caller_id) REFERENCES Services (service_id)
      DESTINATION KEY (target_id) REFERENCES Services (service_id)
      LABEL CALLS
      PROPERTIES (protocol, criticality)
  );
```

---

## 3. ISO GQL Graph Traversal Queries

Execute declarative graph pattern matching directly in Spanner SQL:

```sql
-- Multi-hop blast-radius query: Find all downstream services impacted by an outage
GRAPH ServiceArchitectureGraph
MATCH (root:Service {service_id: 'payment-gateway'})
      -[:CALLS*1..3]-> (downstream:Service)
WHERE downstream.tier = 'TIER_1'
RETURN DISTINCT
  root.name AS failing_service,
  downstream.name AS impacted_dependency,
  downstream.owner_team AS oncall_team;
```

---

## 4. Python SDK Graph-Vector RAG Pipeline

Combines topological graph queries with Gemini reasoning to assess infrastructure change risk:

```python
from google.cloud import spanner
from google import genai

spanner_client = spanner.Client()
instance = spanner_client.instance("production-instance")
database = instance.database("architecture-db")
gemini_client = genai.Client()

def analyze_architectural_blast_radius(failing_service_id: str) -> str:
    """Executes ISO GQL query in Spanner Graph and reasons over downstream risks with Gemini."""
    gql_query = """
    GRAPH ServiceArchitectureGraph
    MATCH (s:Service {service_id: @serviceId})-[e:CALLS*1..4]->(dep:Service)
    RETURN DISTINCT s.name AS root_service, dep.name AS dependency, dep.tier AS tier, dep.owner_team AS team
    """
    
    with database.snapshot() as snapshot:
        results = list(snapshot.execute_sql(
            gql_query,
            params={"serviceId": failing_service_id},
            param_types={"serviceId": spanner.param_types.STRING}
        ))
    
    # Format graph path topology into structured context
    graph_context = "\n".join([
        f"- Dependency: {row[1]} (Tier: {row[2]}, Team: {row[3]})"
        for row in results
    ])
    
    # Reason with Gemini using strictly grounded graph topology
    prompt = f"""
    The following microservice is experiencing an outage: {failing_service_id}
    Here is the verified dependency graph topology from Spanner Graph:
    {graph_context}
    
    Provide an actionable incident response triage plan, identifying on-call escalations.
    """
    
    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text
```

---

## 5. Enterprise Best Practices & Anti-Patterns

| Category | Recommended Pattern | Anti-Pattern |
| :--- | :--- | :--- |
| **Topology Modeling** | Use Directed Property Graphs with foreign keys enforcing referential integrity | Storing graph edges in unindexed JSON arrays |
| **Path Search Depth** | Bound variable-length path traversals (e.g. `[:CALLS*1..4]`) | Unbounded path queries (`[:CALLS*]`) causing exponential scans |
| **Hybrid RAG** | Retrieve exact entity graph topology from Spanner before prompt construction | Letting LLMs guess multi-hop dependencies from vector embeddings alone |
| **Transactions** | Execute read-only graph traversals inside Spanner read-only snapshots | Mixing long-running graph analyses into interactive read-write transactions |
