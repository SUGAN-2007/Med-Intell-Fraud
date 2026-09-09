# MED-INTELL Fraud Graph
### International Medical Fraud Intelligence Graph — Hazzino Mega Hackathon 2026, Track 08/10

---

## Overview

MED-INTELL is a graph-based intelligence platform for medical tourism. It connects patients with treatment facilitators (agents), while continuously running fraud detection across the underlying network of agents, clinics, doctors, and patients — flagging shared bank accounts, duplicate medical licenses, circular referral (kickback) rings, and abnormal connectivity patterns before a patient ever books treatment.

The platform has two views:
- **Admin Intelligence Graph** — internal dashboard showing the live fraud network graph, risk scores, and AI-generated plain-English explanations for flagged entities.
- **Patient Match Portal** — patient-facing screen that recommends only verified, low-risk facilitators for a chosen treatment, automatically excluding flagged entities.

---

## Problem Statement

Medical tourism runs almost entirely through agents/facilitators connecting patients across borders to clinics. Patients have no reliable way to verify legitimacy from a distance, which scammers exploit through fake clinic fronts, forged/duplicated doctor credentials, and shared shell business structures. These fraud rings are difficult to catch by looking at any single entity in isolation — the fraud only becomes visible when you examine the *relationships* between entities (shared bank accounts, duplicated identifiers, referral loops), which is exactly what a graph database is built to represent.

---

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌────────────────┐
│   React Frontend │  <-->  │  Express Backend  │  <-->  │  Neo4j AuraDB   │
│  (Admin + Patient │  REST  │  (Node.js API)    │ Cypher │  (Graph DB,     │
│   Portal views)   │  JSON  │                    │ Query  │   Cloud-hosted) │
└─────────────────┘        └────────┬─────────┘        └────────────────┘
                                      │
                                      │ Fraud pattern results
                                      ▼
                            ┌──────────────────┐
                            │  OpenRouter LLM    │
                            │  (AI Explanation    │
                            │   Layer)            │
                            └──────────────────┘
```

**Flow:**
1. Neo4j AuraDB stores all entities (Agents, Clinics, Doctors, Patients) and their relationships as a graph.
2. Express backend runs Cypher pattern-matching queries against the graph to detect fraud signals — this is deterministic, not AI-based.
3. A weighted scoring service converts triggered fraud patterns into a 0-100 risk score per entity.
4. For flagged entities, the backend calls an LLM (via OpenRouter) purely to translate the raw pattern data into a one-sentence, human-readable explanation — the AI never decides what counts as fraud, it only explains findings that the graph already detected.
5. The React frontend fetches this data automatically (no manual queries) and renders it as an interactive force-directed graph (Admin view) and a filtered facilitator list (Patient view).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Graph Database | Neo4j AuraDB (Free Tier, cloud-hosted) |
| Backend | Node.js, Express.js |
| DB Driver | `neo4j-driver` (official JS driver) |
| AI Explanation | OpenRouter LLM (chat completions API) |
| Frontend | React (Vite), Tailwind CSS |
| Graph Visualization | `react-force-graph` |
| Dev Tooling | Antigravity IDE with Neo4j MCP server for direct Cypher debugging |

---

## Data Model

### Node Types
- **Agent** — id, name, business_reg_number, bank_account, phone, email, address
- **Clinic** — id, name, business_reg_number, bank_account, phone, address, accreditation_number
- **Doctor** — id, name, license_number, clinic_id
- **Patient** — id, name, treatment_needed, country

### Relationship Types
- `(:Agent)-[:REFERS_TO]->(:Clinic)`
- `(:Agent)-[:REFERS_TO]->(:Agent)` — used to detect circular referral loops
- `(:Clinic)-[:EMPLOYS]->(:Doctor)`
- `(:Patient)-[:BOOKED_THROUGH]->(:Agent)`
- `(:Patient)-[:TREATED_AT]->(:Clinic)`
- `(:Agent)-[:PARTNERS_WITH]->(:Clinic)`

---

## Fraud Detection Patterns

| Pattern | Detection Logic | Risk Weight |
|---|---|---|
| Shared Bank Account | Two or more clinics/agents share the same payout account | +40 |
| Duplicate License Number | Same medical license number claimed by two different doctors | +35 |
| Circular Referral Loop | Agents refer to each other in a closed cycle (kickback pattern) | +25 |
| High Connectivity Anomaly | An entity has an abnormally high number of partner/referral connections compared to the network average | +20 |

Risk score is the sum of triggered weights, capped at 100. Score bands: **0-29 = Verified/Low Risk**, **30-59 = Caution**, **60-100 = High Risk**.

---

## Seed Dataset (Prototype Demo Data)

Synthetic dataset with deliberately baked-in fraud clusters for demo purposes:
- 32 nodes total: 9 Agents, 10 Clinics, 8 Doctors, 5 Patients
- 46 relationships across all 6 relationship types
- 4 confirmed fraud clusters: shared bank account ring (3 clinics), duplicate license pair (2 doctors), circular referral ring (3 agents), high-connectivity anomaly (1 clinic)

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/graph` | Full node + edge data for graph visualization |
| GET | `/api/fraud/shared-accounts` | Entities sharing bank accounts |
| GET | `/api/fraud/duplicate-licenses` | Doctors with duplicated license numbers |
| GET | `/api/fraud/circular-referrals` | Detected referral loops |
| GET | `/api/fraud/high-connectivity` | Entities with abnormal connection counts |
| GET | `/api/risk-score/:id` | Risk score, triggered patterns, and AI explanation for one entity |
| GET/POST | `/api/match` | Patient-facing facilitator matching, filtered to exclude flagged entities |

---

## Key Design Decisions

- **Graph database over relational DB:** fraud only becomes visible through relationships between entities, not individual records — a graph is the natural data structure for this problem, not a retrofit.
- **AI is explanatory, not decisional:** all fraud detection is deterministic Cypher pattern-matching; the LLM's only role is generating a readable explanation from already-confirmed findings. This keeps the system auditable and avoids AI hallucination risk in the actual fraud determination.
- **Real-world data pipeline (beyond prototype):** in production, this graph would build itself organically from platform activity — clinic/agent onboarding (cross-checked against government medical registries and business registration databases), payment gateway KYC (captures bank account data naturally), and referral/booking transactions logged by the platform itself. The seed dataset here simulates that end state for demo purposes.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- Neo4j AuraDB account (free tier)
- OpenRouter API key

### Backend
```bash
cd backend
npm install
# create .env with NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE, OPENROUTER_API_KEY
node src/server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` — the dashboard loads graph and fraud data automatically on page load.

---

## Team

Built by Sugan for Hazzino Technologies Mega Hackathon 2026, Track 08 — International Medical Fraud Intelligence Graph.
