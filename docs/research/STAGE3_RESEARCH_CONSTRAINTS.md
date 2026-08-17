# Stage 3 Research Constraints & Owner Preferences

Status: **OWNER_PREFERENCE / RESEARCH_INPUT_ONLY / NON_CANONICAL**  
Authority: **OWNER OPERATIONAL PREFERENCE (RESEARCH GUIDANCE ONLY)**  
Date: **2026-08-17**  
Canonical Predecessor: `664ab14bb1415fec0995e80e99369164df28575c`  

---

## 1. Purpose and Nature of This Document

This document captures the non-canonical operational preferences, resource constraints, and provider eligibility criteria established by the repository owner for **Stage 3 — Learning / Product Deep Research**.

> [!IMPORTANT]
> **Non-Canonical Status Notice**:
> This document is **NOT** a level in the canonical repository authority hierarchy (`docs/MASTER_ROADMAP.md` §1). It serves strictly as an operational research input to guide capability discovery, candidate filtering, and architectural tradeoff evaluations during Stage 3 research. It does **NOT** grant implementation authority, dependency adoption authority, or final provider selection authority.

---

## 2. Preferred Solution Architecture Hierarchy

When investigating technical options across all Stage 3 research lanes (particularly Lane R2 and Lane R3), researchers MUST evaluate candidates against the following prioritized order of architectural preference:

```
1. Lightweight Browser-Side OSS (Highest Preference)
   └── Zero external latency, zero API cost, 100% private, offline-capable, deterministic
       
2. Free Hosted API (Secondary Preference)
   └── High quality, generous free tier, zero billing account requirement, no credit card
       
3. Free Serverless / Hosted OSS (Tertiary Preference)
   └── Community-hosted or self-deployable free-tier serverless workers/instances
       
4. Heavy Local Inference (LAST RESORT ONLY)
   └── Large local model weights, high RAM/CPU/GPU footprint, battery drain, complex setup
```

### 2.1 Clarification on Browser-Side Processing
"Heavy local inference as last resort" must **NOT** be equated with "no browser-side processing".
- **Highly Preferred Browser-Side Substrates**: Lightweight, deterministic JavaScript/TypeScript libraries and standard Web APIs for:
  - Charting, heatmaps, and progress visualization (e.g. lightweight Canvas/SVG);
  - Text parsing, AST inspection, and rule-based NLP;
  - Local lexical indexing, full-text search, and BM25 token ranking;
  - Spaced repetition scheduling (e.g. FSRS JS implementations);
  - Web Audio slicing, recording, playback, and basic VAD;
  - DOM/Subtitle transformation and format converters.
- **Discouraged Local Substrates**: Multi-gigabyte local neural models (e.g. multi-GB Whisper or LLMs running on client hardware) that require heavy ONNX/WebGPU runtimes, exhaust mobile device memory, cause thermal throttling, or introduce non-deterministic execution.

---

## 3. Hosted Provider Eligibility & Hard Constraints

### 3.1 Eligibility Baseline
To ensure long-term accessibility, zero unexpected user cost, and minimal onboarding friction, candidate hosted APIs must satisfy strict eligibility criteria:

| Criterion | Owner Stance | Requirement |
|---|---|---|
| **Free Tier Availability** | **MANDATORY** | Must offer a genuine, usable recurring free tier (not merely a 7-day trial). |
| **Credit / Debit Card** | **STRONGLY PREFERRED NO CARD** | API key and free quota MUST be obtainable without entering a credit/debit card (Visa, Mastercard, etc.). |
| **Billing Account** | **STRONGLY PREFERRED NO BILLING** | Registration MUST NOT require activating a mandatory cloud billing account or deposit. |
| **Paid Subscription** | **FORBIDDEN AS DEFAULT** | Services requiring paid monthly subscriptions (e.g. ChatGPT Plus, Claude Pro, GitHub Copilot paid) must NOT be default recommendations. |

> [!WARNING]
> Providers requiring mandatory credit card entry or mandatory billing account creation to access their free tier (e.g. AWS free tier requiring active card, Google Cloud billing account setup, Azure card verification) must **NOT** be primary or default recommendations. If surveyed for comparative completeness, they must be explicitly flagged with `CARD_REQUIRED: true` and classified as non-preferred.

---

## 4. Mandatory 14-Dimension Reporting Schema for Hosted Candidates

For every serious hosted API candidate surveyed during Stage 3 research, the research report MUST explicitly document the following 14 dimensions:

| # | Dimension Key | Allowed Values / Schema | Description |
|---|---|---|---|
| 1 | `CARD_REQUIRED` | `true` \| `false` \| `conditional` | Is a credit/debit card required to obtain an API key or access free quota? |
| 2 | `BILLING_ACCOUNT_REQUIRED` | `true` \| `false` | Is an active cloud billing account / payment profile setup mandatory? |
| 3 | `PHONE_REQUIRED` | `true` \| `false` | Is mobile SMS phone verification required for account registration? |
| 4 | `FREE_QUOTA` | String (exact volume) | Exact free allowance (e.g. `15 RPM, 1M tokens/day`, `1000 requests/month`). |
| 5 | `RATE_LIMIT` | String (exact rates) | Requests per minute (RPM), tokens per minute (TPM), concurrent request limits. |
| 6 | `FREE_TIER_EXPIRY` | `permanent` \| `rolling_monthly` \| `credit_expiry_<N>_days` | Does the free tier expire (e.g. $5 initial credit valid 90 days) or recur indefinitely? |
| 7 | `DATA_RETENTION_POLICY` | `zero_retention` \| `logged_30_days` \| `model_training` | Does provider log prompt/response data or train future models on user submissions? |
| 8 | `SECRET_HANDLING_REQS` | `server_proxy_required` \| `client_ephemeral_key` | Can API key safely reside on client or is a secure serverless backend proxy required? |
| 9 | `BROWSER_DIRECT_CALL` | `supported` \| `blocked_by_cors` \| `unsafe_key_exposure` | Does provider support direct browser CORS requests with scoped access? |
| 10 | `LATENCY` | String (p50 / p95 TTFT) | Time to first token (TTFT) and total roundtrip response latency. |
| 11 | `QUALITY_EVIDENCE` | Markdown string / citations | Empirical benchmark scores, academic citations, or test-suite verification evidence. |
| 12 | `MAINTENANCE_STATUS` | `active` \| `beta` \| `deprecated` \| `legacy` | Current active support status, API stability, SDK maintenance activity. |
| 13 | `VENDOR_LOCK_IN` | `openai_compatible` \| `standard_rest` \| `proprietary_sdk` | Ease of swapping provider via standard API adapters vs bespoke client SDKs. |
| 14 | `FALLBACK_OPTIONS` | List of interchangeable providers | Documented zero-downtime fallback providers if quota exhausted or service discontinued. |

---

## 5. Time-Sensitive Fact Verification & Freshness

- **Freshness Mandate**: All provider pricing tiers, quota policies, rate limits, terms of service, and card requirements are subject to rapid industry changes.
- **Primary Source Evidence**: Researchers must fresh-verify all facts from official provider documentation, pricing pages, and registration flows during research execution.
- **Date Stamp**: Every factual claim regarding external providers MUST include the exact access date (e.g. `Access Date: 2026-08-17`).
