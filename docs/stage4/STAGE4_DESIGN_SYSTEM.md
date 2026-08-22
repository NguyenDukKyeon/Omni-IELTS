# Stage 4 W4 Design System & Token Specification

## 1. Exact Provenance & Authority

| Field | Value |
|---|---|
| Transaction | `STAGE4-W4-DESIGN-SYSTEM-REM-001` |
| Human gate | G4 ACTIVATED FOR W4 REMEDIATION CANDIDATE EXECUTION |
| Canonical base | `e06773da6e0ab2b1c62600aeefe0ee9accc1ab23` (Merge PR #185 / `STAGE4-W3-WIREFRAME-LAYOUTS-001`) |
| Historical input | `82b688e5cde4028c722e864500bf27f09b85af1e` (PR #186, rejected historical candidate) |
| Controlling authorization | `docs/authorizations/STAGE4-UXIA-AUTH-001.md` |
| Governing strategy | `docs/stage4/STAGE4_UXIA_STRATEGY.md` |
| Accepted predecessors | W0 Capability Matrix (`STAGE4_CAPABILITY_PRESERVATION_MATRIX.md`); W1 IA & Journeys (`STAGE4_INFORMATION_ARCHITECTURE.md`, `STAGE4_USER_JOURNEYS.md`); W2 Interaction & State Model (`STAGE4_INTERACTION_AND_STATE_MODEL.md`); REM-003 Whole-App Synthesis (`STAGE4_WHOLE_APP_REFERENCE_SYNTHESIS_CANDIDATE_REM-003.md`); W3 Structural Wireframes (`STAGE4_WIREFRAMES.md`) |
| Artifact class | Design System & Token Specification; non-runtime design specification |
| Closed write allowlist | `docs/stage4/STAGE4_DESIGN_SYSTEM.md` only |
| Epistemic status | W4 remediation candidate pending independent audit; CI is not acceptance |

Canonical documents remain authority. This artifact materializes the visual design system, semantic token taxonomy, component vocabulary, dual-grammar visual rules, responsive transformations, and accessibility constraints required to implement the accepted W3 structural wireframes. It establishes reusable tokens and component specifications without replacing W3 journeys, deleting capabilities, inventing runtime UI code, selecting AI/ASR technology providers, or altering durable persistence schemas.

---

## 2. Core Design Principles & Dual Visual Grammar

### 2.1 Dual Visual Grammar (Learning UI vs IELTS Exam UI)

OmniIELTS operates across two distinct, purpose-driven visual modes that share a unified design DNA while fulfilling fundamentally different learner cognitive needs:

```
+---------------------------------------------------------------------------------------------------+
|                                  OMNIIELTS DESIGN SYSTEM (SHARED DNA)                             |
|  * Unified 4px/8px Spacing Scale  * Coherent Type Hierarchy  * Shared Accessible Contrast Ratios   |
|  * Semantic Form Controls        * Consistent Icon Geometry * Unified Evidence & Source Models    |
+-------------------------------------------------+-------------------------------------------------+
|               SURFACE A: LEARNING UI            |             SURFACE B: IELTS EXAM UI            |
+-------------------------------------------------+-------------------------------------------------+
| - Tone: Modern, warm, supportive, motivating    | - Tone: Restrained, authentic, distraction-free |
| - Density: Balanced, spacious, breathable       | - Density: High-density, test-authentic         |
| - Chrome: Persistent 5-pillar navigation, dock  | - Chrome: Unmounted; test header & palette only |
| - Color: Rich slate base with indigo & teal     | - Color: Cool neutral slate, charcoal, steel    |
| - Elevation: Soft ambient layers, rounded cards | - Elevation: Flat, crisp 1px borders, subtle    |
| - Assistance: Visible badges (UA/LA/SC/AR)      | - Assistance: Zero aids, zero coaching, zero AR |
| - Agency: Flexible choice, skip, rationale      | - Agency: Strict official test rules & timers   |
+-------------------------------------------------+-------------------------------------------------+
```

#### Invariant Rules:
1. `OMNIIELTS_LEARNING_UI != IELTS_EXAM_SIMULATION_UI`: Strict Exam mode must never look like a gamified dashboard, nor may Learning UI feel like a cold, punitive test sheet.
2. `CHROME_UNMOUNTING_INVARIANT`: In strict Exam mode, application navigation rails, capture triggers, global search, and learning aids must be completely unmounted from the DOM/ARIA tree—not merely hidden with CSS or obscured behind overlays.
3. `SHARED_DNA_INVARIANT`: Both surfaces use the same primitive color tokens, typography scales, spacing units, and form input accessibility standards so they feel like two specialized modes of one cohesive ecosystem.

### 2.2 Global Design Invariants

```
CAPABILITY_PRESERVED != USER_EXPERIENCE_PRESERVED
CAPABILITY_COUNT != VISIBLE_TOP_LEVEL_CONTROL_COUNT
RECOMMENDED_PATH != REQUIRED_PATH
CURRICULUM_PATH != NAVIGATION_LOCK
GUIDED_SEQUENCE != MANDATORY_SEQUENCE
6 MODES != 6 SCREENS
7 STEPS != 7 SCREENS
MODE_SWITCH != WORKSPACE_RESET
MEDIA_MODE != GUIDED_LOOP_STEP
CAPTURE != EVIDENCE
CAPTURE != AUTOMATIC_FSRS_SCHEDULING
MEMORY_RETENTION != SKILL_MASTERY
UNASSISTED -> POTENTIALLY_EVIDENCE_ELIGIBLE
UNASSISTED != AUTOMATIC_FSRS_UPDATE
DESIGN_TOKEN_CONTRAST_PASS != WHOLE_APPLICATION_WCAG_CONFORMANCE
```

---

## 3. Semantic Color System

The color system uses a strict **Three-Layer Token Architecture**: `Primitive Palette` $\to$ `Semantic Role Tokens` $\to$ `Component-Specific Tokens`.

```
[ LAYER 1: PRIMITIVE TOKENS ]   (e.g., slate-900, indigo-600, amber-500, emerald-600)
             │
             ▼
[ LAYER 2: SEMANTIC TOKENS ]    (e.g., color-learn-bg-surface, color-learn-text-primary, color-assist-ua-text)
             │
             ▼
[ LAYER 3: COMPONENT TOKENS ]   (e.g., card-vocab-bg, exam-timer-warning-text, receipt-border)
```

### 3.1 Primitive Color Palette (CSS Custom Properties)

```css
:root {
  /* Slate Neutrals */
  --primitive-slate-50:  #f8fafc;
  --primitive-slate-100: #f1f5f9;
  --primitive-slate-200: #e2e8f0;
  --primitive-slate-300: #cbd5e1;
  --primitive-slate-400: #94a3b8;
  --primitive-slate-500: #64748b;
  --primitive-slate-600: #475569;
  --primitive-slate-700: #334155;
  --primitive-slate-800: #1e293b;
  --primitive-slate-900: #0f172a;
  --primitive-slate-950: #020617;

  /* Brand & Learning Accents (Indigo / Blue / Teal) */
  --primitive-indigo-50:  #eef2ff;
  --primitive-indigo-100: #e0e7ff;
  --primitive-indigo-200: #c7d2fe;
  --primitive-indigo-300: #a5b4fc;
  --primitive-indigo-400: #818cf8;
  --primitive-indigo-500: #6366f1;
  --primitive-indigo-600: #4f46e5;
  --primitive-indigo-700: #4338ca;
  --primitive-indigo-800: #3730a3;
  --primitive-indigo-900: #312e81;

  --primitive-teal-50:    #f0fdfa;
  --primitive-teal-100:   #ccfbf1;
  --primitive-teal-200:   #99f6e4;
  --primitive-teal-500:   #14b8a6;
  --primitive-teal-600:   #0d9488;
  --primitive-teal-700:   #0f766e;
  --primitive-teal-800:   #115e59;

  /* State & Evidence Hues */
  --primitive-emerald-50:  #ecfdf5;
  --primitive-emerald-100: #d1fae5;
  --primitive-emerald-200: #a7f3d0;
  --primitive-emerald-500: #10b981;
  --primitive-emerald-600: #059669;
  --primitive-emerald-700: #047857;
  --primitive-emerald-800: #065f46;

  --primitive-amber-50:  #fffbeb;
  --primitive-amber-100: #fef3c7;
  --primitive-amber-200: #fde68a;
  --primitive-amber-400: #fbbf24;
  --primitive-amber-500: #f59e0b;
  --primitive-amber-600: #d97706;
  --primitive-amber-700: #b45309;
  --primitive-amber-800: #92400e;
  --primitive-amber-900: #78350f;

  --primitive-rose-50:  #fff1f2;
  --primitive-rose-100: #ffe4e6;
  --primitive-rose-200: #fecdd3;
  --primitive-rose-500: #f43f5e;
  --primitive-rose-600: #e11d48;
  --primitive-rose-700: #be123c;
  --primitive-rose-800: #9f1239;

  --primitive-purple-50:  #faf5ff;
  --primitive-purple-100: #f3e8ff;
  --primitive-purple-200: #e9d5ff;
  --primitive-purple-500: #a855f7;
  --primitive-purple-600: #9333ea;
  --primitive-purple-700: #7e22ce;
  --primitive-purple-800: #6b21a8;

  --primitive-sky-50:  #f0f9ff;
  --primitive-sky-100: #e0f2fe;
  --primitive-sky-200: #bae6fd;
  --primitive-sky-500: #0ea5e9;
  --primitive-sky-600: #0284c7;
  --primitive-sky-700: #0369a1;
  --primitive-sky-800: #075985;
}
```

### 3.2 Learning UI Semantic Tokens

```css
:root {
  --color-learn-bg-canvas:      var(--primitive-slate-50);
  --color-learn-bg-surface:     #ffffff;
  --color-learn-bg-subtle:      var(--primitive-slate-100);
  --color-learn-bg-raised:      #ffffff;
  --color-learn-border-subtle:  var(--primitive-slate-200);
  --color-learn-border-strong:  var(--primitive-slate-300);
  --color-learn-border-focus:   var(--primitive-indigo-600);
  --color-learn-text-primary:   var(--primitive-slate-900);
  --color-learn-text-secondary: var(--primitive-slate-600);
  --color-learn-text-muted:     var(--primitive-slate-400);
  --color-learn-brand-primary:  var(--primitive-indigo-600);
  --color-learn-brand-subtle:   var(--primitive-indigo-50);
}
```

| Semantic Token | Light Mode Value | Dark Mode Value | Role / Usage |
|---|---|---|---|
| `--color-learn-bg-canvas` | `--primitive-slate-50` | `--primitive-slate-950` | Primary app canvas background |
| `--color-learn-bg-surface` | `#ffffff` | `--primitive-slate-900` | Primary cards, panels, workspaces |
| `--color-learn-bg-subtle` | `--primitive-slate-100` | `--primitive-slate-800` | Secondary wells, unselected tabs |
| `--color-learn-bg-raised` | `#ffffff` | `--primitive-slate-800` | Popovers, dropdown menus, modals |
| `--color-learn-border-subtle` | `--primitive-slate-200` | `--primitive-slate-800` | Card borders, dividers, list separators |
| `--color-learn-border-strong` | `--primitive-slate-300` | `--primitive-slate-700` | Active borders, input boundaries |
| `--color-learn-border-focus` | `--primitive-indigo-600` | `--primitive-indigo-400` | Keyboard focus ring (2px offset) |
| `--color-learn-text-primary` | `--primitive-slate-900` | `--primitive-slate-50` | Primary headings, body copy, prompt text |
| `--color-learn-text-secondary` | `--primitive-slate-600` | `--primitive-slate-400` | Supporting descriptions, metadata |
| `--color-learn-text-muted` | `--primitive-slate-400` | `--primitive-slate-500` | Placeholders, inactive counts, timecodes |
| `--color-learn-brand-primary` | `--primitive-indigo-600` | `--primitive-indigo-500` | Dominant CTAs, active pillar, key actions |
| `--color-learn-brand-subtle` | `--primitive-indigo-50` | `--primitive-slate-800` | Highlighted cards, active item wells |

### 3.3 IELTS Exam Simulation Semantic Tokens

```css
:root {
  --color-exam-bg-canvas:           var(--primitive-slate-100);
  --color-exam-bg-surface:          #ffffff;
  --color-exam-header-bg:           var(--primitive-slate-800);
  --color-exam-header-text:         var(--primitive-slate-50);
  --color-exam-border-divider:      var(--primitive-slate-300);
  --color-exam-timer-normal:        var(--primitive-slate-50);
  --color-exam-timer-warning:       var(--primitive-amber-500);
  --color-exam-timer-critical:      var(--primitive-rose-500);
  --color-exam-palette-unanswered:  #ffffff;
  --color-exam-palette-answered:    var(--primitive-slate-700);
  --color-exam-palette-flagged:     var(--primitive-amber-100);
  --color-exam-palette-current:     var(--primitive-indigo-600);
}
```

| Semantic Token | Light Mode Value | Dark Mode Value | Role / Usage |
|---|---|---|---|
| `--color-exam-bg-canvas` | `--primitive-slate-100` | `--primitive-slate-900` | Strict test canvas background |
| `--color-exam-bg-surface` | `#ffffff` | `--primitive-slate-800` | Test content panels, split passage/question |
| `--color-exam-header-bg` | `--primitive-slate-800` | `--primitive-slate-950` | Official exam top bar (high contrast dark) |
| `--color-exam-header-text` | `--primitive-slate-50` | `--primitive-slate-50` | Exam title, candidate ID, clock |
| `--color-exam-border-divider` | `--primitive-slate-300` | `--primitive-slate-700` | Split pane vertical divider, section edges |
| `--color-exam-timer-normal` | `--primitive-slate-50` | `--primitive-slate-50` | Standard countdown display |
| `--color-exam-timer-warning` | `--primitive-amber-500` | `--primitive-amber-400` | 10-minute warning state |
| `--color-exam-timer-critical`| `--primitive-rose-500` | `--primitive-rose-500` | 5-minute final urgency state |
| `--color-exam-palette-unanswered` | `#ffffff` (`--primitive-slate-300` border) | `--primitive-slate-800` (`--primitive-slate-600` border) | Unanswered question item |
| `--color-exam-palette-answered`   | `--primitive-slate-700` (text white) | `--primitive-slate-500` (text white) | Answered question item |
| `--color-exam-palette-flagged`    | `--primitive-amber-100` (`--primitive-amber-700` border) | `--primitive-amber-900` (`--primitive-amber-400` border) | Flagged for review item |
| `--color-exam-palette-current`    | `--primitive-indigo-600` (ring-2) | `--primitive-indigo-400` (ring-2) | Active question item |

### 3.4 Assistance & Evidence Semantic Tokens

```css
:root {
  /* Assistance Category Tokens */
  --color-assist-ua-text:     var(--primitive-slate-700);
  --color-assist-ua-bg:       var(--primitive-slate-100);
  --color-assist-la-text:     var(--primitive-sky-700);
  --color-assist-la-bg:       var(--primitive-sky-50);
  --color-assist-sc-text:     var(--primitive-amber-700);
  --color-assist-sc-bg:       var(--primitive-amber-50);
  --color-assist-ar-text:     var(--primitive-purple-700);
  --color-assist-ar-bg:       var(--primitive-purple-50);

  /* Evidence Confidence Tokens */
  --color-evidence-high-text: var(--primitive-emerald-700);
  --color-evidence-high-bg:   var(--primitive-emerald-50);
  --color-evidence-med-text:  var(--primitive-amber-700);
  --color-evidence-med-bg:    var(--primitive-amber-50);
  --color-evidence-low-text:  var(--primitive-slate-600);
  --color-evidence-low-bg:    var(--primitive-slate-100);

  /* Canonical Aliases */
  --color-assist-ua:          var(--color-assist-ua-text);
  --color-assist-la:          var(--color-assist-la-text);
  --color-assist-sc:          var(--color-assist-sc-text);
  --color-assist-ar:          var(--color-assist-ar-text);
  --color-evidence-high:      var(--color-evidence-high-text);
  --color-evidence-med:       var(--color-evidence-med-text);
  --color-evidence-low:       var(--color-evidence-low-text);
}
```

| Foreground Token | Background Token | Meaning / Classification | Foreground Color | Background Color | EvidencePolicy Consequence |
|---|---|---|---|---|---|
| `--color-assist-ua-text` | `--color-assist-ua-bg` | **UNASSISTED** (Independent Attempt) | `--primitive-slate-700` (`#334155`) | `--primitive-slate-100` (`#f1f5f9`) | **Potentially evidence-eligible**. Does NOT automatically update FSRS or grant skill credit. Positive FSRS memory update and skill evidence occur IF AND ONLY IF `EvidencePolicy` independently validates the attempt against all required criteria under default-deny rules. |
| `--color-assist-la-text` | `--color-assist-la-bg` | **LIGHT_ASSISTANCE** (Hint/Glossary) | `--primitive-sky-700` (`#0369a1`) | `--primitive-sky-50` (`#f0f9ff`) | Formative practice record logged; **disqualified from independent unassisted credit / positive FSRS evidence by default**. |
| `--color-assist-sc-text` | `--color-assist-sc-bg` | **SCAFFOLDED** (Frame/IPA/Model) | `--primitive-amber-700` (`#b45309`) | `--primitive-amber-50` (`#fffbeb`) | Scaffolding record logged; **disqualified from independent unassisted credit / positive FSRS evidence by default**. |
| `--color-assist-ar-text` | `--color-assist-ar-bg` | **ANSWER_REVEALED / REVIEW** | `--primitive-purple-700` (`#7e22ce`) | `--primitive-purple-50` (`#faf5ff`) | Pure post-attempt review / coaching; **0% independent recall credit / strictly excluded from positive FSRS evidence**. |
| `--color-evidence-high-text` | `--color-evidence-high-bg` | High Confidence / Validated | `--primitive-emerald-700` (`#047857`) | `--primitive-emerald-50` (`#ecfdf5`) | Robust grounded evidence receipt; passes confidence threshold. |
| `--color-evidence-med-text` | `--color-evidence-med-bg` | Moderate / Single Occurrence | `--primitive-amber-700` (`#b45309`) | `--primitive-amber-50` (`#fffbeb`) | Qualified provisional estimate; requires corroborating attempts. |
| `--color-evidence-low-text` | `--color-evidence-low-bg` | Sparse / Self-Reported / Stale | `--primitive-slate-600` (`#475569`) | `--primitive-slate-100` (`#f1f5f9`) | Low-certainty indicator; excluded from high-stakes aggregates. |

---

## 4. Typography Hierarchy & Font System

### 4.1 Font Family Stacks

```css
:root {
  /* UI & Structural Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  
  /* Reading Passages & Long-Form Articles (High editorial legibility) */
  --font-serif: 'Merriweather', Georgia, 'Times New Roman', Cambria, serif;
  
  /* Monospace & Tabular Data (Timers, Word Counters, Code, Phonetics) */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', monospace;
}
```

### 4.2 Type Scale Tokens

```css
:root {
  --type-display:     700 32px/40px var(--font-sans);
  --type-h1:          700 24px/32px var(--font-sans);
  --type-h2:          600 20px/28px var(--font-sans);
  --type-h3:          600 16px/24px var(--font-sans);
  --type-body-lg:     400 18px/28px var(--font-serif);
  --type-body:        400 15px/22px var(--font-sans);
  --type-body-sm:     400 13px/18px var(--font-sans);
  --type-caption:     500 12px/16px var(--font-sans);
  --type-mono-timer:  700 20px/24px var(--font-mono);
  --type-mono-ipa:    400 15px/22px var(--font-mono);
}
```

| Token | Font Size (px / rem) | Line Height | Font Weight | Letter Spacing | Target Usage |
|---|---|---|---|---|---|
| `--type-display` | `32px / 2.0rem` | `40px / 1.25` | `700 (Bold)` | `-0.02em` | Scorecards, Milestone summaries |
| `--type-h1` | `24px / 1.5rem` | `32px / 1.33` | `700 (Bold)` | `-0.015em` | Screen titles (Today, IELTS Hub, Reader) |
| `--type-h2` | `20px / 1.25rem` | `28px / 1.4` | `600 (Semibold)` | `-0.01em` | Section headers, modal titles, part headers |
| `--type-h3` | `16px / 1.0rem` | `24px / 1.5` | `600 (Semibold)` | `0.0em` | Card titles, group labels, workbench headers |
| `--type-body-lg` | `18px / 1.125rem` | `28px / 1.55` | `400 / 500` | `0.0em` | Reading passages, long-form articles (serif) |
| `--type-body` | `15px / 0.9375rem` | `22px / 1.47` | `400 (Regular)` | `0.0em` | Standard body text, prompts, explanations |
| `--type-body-sm` | `13px / 0.8125rem` | `18px / 1.38` | `400 / 500` | `0.005em` | Form labels, card descriptions, hints |
| `--type-caption` | `12px / 0.75rem` | `16px / 1.33` | `500 (Medium)` | `0.01em` | Assistance badges, metadata chips, status tags |
| `--type-mono-timer` | `20px / 1.25rem` | `24px / 1.2` | `700 (Bold)` | `0.05em (tabular)` | Official Exam countdown timer, player clock |
| `--type-mono-ipa` | `15px / 0.9375rem` | `22px / 1.47` | `400 (Regular)` | `0.02em` | IPA phonetic notations (`/əˈkaʊnt fɔːr/`) |

#### Editorial Constraints:
- Passage line length must not exceed `72ch` on desktop to maintain optimal saccadic reading speed.
- Line heights in reading passages must remain at least `1.55` to support learners with reading difficulties or visual fatigue.
- Font scaling up to 200% must reflow without clipping action buttons or obscuring countdown timers.

---

## 5. Spacing, Sizing, Radius, Border & Elevation Scale

### 5.1 4px/8px Baseline Spacing Scale

```css
:root {
  --space-0:   0px;
  --space-0-5: 2px;
  --space-1:   4px;
  --space-1-5: 6px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
}
```

### 5.2 Interactive Sizing Tokens & Touch Targets

```css
:root {
  --target-touch-min:     48px;
  --target-desktop-min:   40px;
  --target-compact-min:   32px;
  --input-height-default: 44px;
}
```

| Token | Sizing Value | Role / Usage |
|---|---|---|
| `--target-touch-min` | `48px` $\times$ `48px` | Mandatory mobile touch target envelope |
| `--target-desktop-min` | `40px` $\times$ `40px` | Desktop interactive button / action target height |
| `--target-compact-min` | `32px` $\times$ `32px` | Dense table action, audio chip, palette item target |
| `--input-height-default` | `44px` | Standard text fields, dropdowns, search bars |

### 5.3 Radius & Border Scale

```css
:root {
  --radius-none: 0px;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;
}
```

| Token | Value | Learning UI Usage | IELTS Exam UI Usage |
|---|---|---|---|
| `--radius-none` | `0px` | Fullscreen overlays, divider edges | Exam split panes, top bar |
| `--radius-sm` | `4px` | Chips, badges, progress bars | Exam palette items, response inputs |
| `--radius-md` | `8px` | Standard cards, buttons, dialogs | Exam container bounds, prompt sheets |
| `--radius-lg` | `12px` | Large feature cards, media players | N/A (avoid rounded look in exam) |
| `--radius-xl` | `16px` | Bottom sheets, recommendation hubs | N/A |
| `--radius-full`| `9999px` | Circular avatar, audio record FAB | Palette indicators, status pills |

### 5.4 Elevation & Shadow Grammar

```css
:root {
  /* Learning UI Shadows (Warm, diffuse ambient depth) */
  --elevation-0:     none;
  --elevation-1:     0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08);
  --elevation-2:     0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06);
  --elevation-3:     0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08);
  --elevation-sheet: 0 -4px 20px -2px rgba(15, 23, 42, 0.15);

  /* Exam UI Elevation (Flat with crisp 1px borders) */
  --elevation-exam:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

---

## 6. Grid, Container & Responsive Layout Primitives

### 6.1 Breakpoint System

| Breakpoint Name | Media Query | Layout Architecture | Navigation Pattern |
|---|---|---|---|
| `compact` (Mobile) | `< 640px` | Single logical scroll column; auxiliary panes in bottom sheets | 5-item Bottom Navigation + More Sheet |
| `medium` (Tablet / Small Screen) | `640px – 1023px` | Adaptive 2-column or collapsable sidebars | Compact icon rail or top app bar |
| `expanded` (Desktop Standard) | `1024px – 1439px` | Persistent left rail + multi-pane split workspaces | Full 5-pillar vertical rail (240px width) |
| `wide` (Studio / Ultra-wide) | `≥ 1440px` | Max-width bounded canvas (`1440px`) with centered layout | Full 5-pillar vertical rail + docked tools |

### 6.2 Structural Shell Containers

```
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| 1. LEARNING SHELL (Desktop):                                                                      |
| +──────────────+────────────────────────────────────────────────────────────────────────────────+ |
| | RAIL (240px) | TOP STRIP: Breadcrumb / Search / Capture / Sync / Settings                      | |
| | Today        +────────────────────────────────────────────────────────────────────────────────+ |
| | Learn        |                                                                                | |
| | IELTS        | PRIMARY WORKSPACE (Flex-grow, min-width 640px)                                 | |
| | Library      |                                                                                | |
| | Analytics    |                                                                                | |
| | Settings     +────────────────────────────────────────────────────────────────────────────────+ |
| |              | BOTTOM AUDIO DOCK (Persistent safe-area player when active)                    | |
| +──────────────+────────────────────────────────────────────────────────────────────────────────+ |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
| 2. STRICT EXAM SHELL (Desktop & Mobile):                                                          |
| +───────────────────────────────────────────────────────────────────────────────────────────────+ |
| | EXAM TOP BAR: IELTS Section · Timer [18:32] · Candidate Status · [End Test Safeguard]         | |
| +───────────────────────────────────────────────────────────────────────────────────────────────+ |
| | SPLIT PASSAGE / PROMPT PANE (50%)          | QUESTION / RESPONSE WORKSPACE (50%)              | |
| | (Draggable & Keyboard-Resizable Divider)   |                                                  | |
| +───────────────────────────────────────────────────────────────────────────────────────────────+ |
| | EXAM FOOTER: Q Palette 1..40 · Flag Item · [Previous] · [Next] · Save Indicator               | |
| +───────────────────────────────────────────────────────────────────────────────────────────────+ |
+───────────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 7. Iconography Rules & Visual Metaphors

1. **Geometry**: Standard `24px` viewport box with `2px` stroke weight, rounded caps and joins. Secondary inline icons use `16px` or `20px` with `1.5px` stroke.
2. **Canonical Mapping**:
   - **Today**: Sun / Calendar Sparkle (`icon-today`)
   - **Learn**: Book / Workbench Sparkle (`icon-learn`)
   - **IELTS**: Academic Cap / Target Shield (`icon-ielts`)
   - **Library**: Shelf / Archive Box (`icon-library`)
   - **Analytics**: Chart Line / Multi-Bar (`icon-analytics`)
   - **Capture**: Plus Circle / Inbox Inward (`icon-capture`)
   - **Search**: Magnifying Glass (`icon-search`)
   - **Settings**: Cog / Sliders (`icon-settings`)
   - **Source Return**: Arrow Up-Left Curve with Document Pin (`icon-return-source`)
   - **Exam Flag**: Solid / Outline Triangular Pennant (`icon-flag`)
   - **Evidence Receipt**: Shield Checkmark with Document Badge (`icon-receipt`)
3. **Accessibility Rule**: Every icon must be accompanied by explicit visible text or an `aria-label` / `aria-hidden="true"` pairing. Icons must never convey state through color alone.

---

## 8. Interaction & State Tokens

### 8.1 State Transitions

```css
:root {
  --state-hover-overlay:    rgba(15, 23, 42, 0.04);
  --state-active-overlay:   rgba(15, 23, 42, 0.08);
  --state-focus-ring:       0 0 0 2px var(--color-learn-bg-canvas), 0 0 0 4px var(--color-learn-brand-primary);
  --state-focus-ring-exam:  0 0 0 2px #ffffff, 0 0 0 4px var(--primitive-slate-900);
  --state-disabled-opacity: 0.45;
}
```

### 8.2 Keyboard Interaction Contracts
- **Focus Order**: Strictly follows visual reading order (top-to-bottom, left-to-right).
- **Roving Tabindex**: Used in dense components (IELTS Question Palette 1..40, 52-Week Habit Grid, Segmented Dictation Blanks) to allow arrow-key navigation without 40 individual tab stops.
- **Escape Key**: Closes open bottom sheets, drawers, help popovers, or assistance menus and returns focus to the trigger control.
- **Enter / Space**: Activates buttons, toggles checkboxes, and selects question options.

---

## 9. Feedback, Assistance & Evidence Visual Language

### 9.1 Assistance Badge Grammar

```
[ UA: Unassisted ]  -> Neutral Slate badge (Indicates independent performance attempt; eligibility prerequisite)
[ LA: Light Assist ]-> Sky Blue outlined badge (Hint, Glossary, or Pronunciation preview used; formative only)
[ SC: Scaffolded ]  -> Amber badge (Sentence frame, IPA thought-group guide, or outline active; formative only)
[ AR: Revealed ]    -> Purple badge (Answer revealed, transcript checked, or post-attempt review; zero recall credit)
```

### 9.2 EvidenceReceipt Component Spec

The `EvidenceReceipt` is a standardized inspection card or drawer:

```
+───────────────────────────────────────────────────────────────────────+
| EVIDENCE RECEIPT #REC-20260822-0941                                  |
| Source: "Economic Trends" (Rev r7, p4 s2) · [View Source]             |
| Mode: VOCABULARY_SENTENCE_PRODUCTION                                  |
+───────────────────────────────────────────────────────────────────────+
| Attempt Exposure: UNASSISTED (UA)                                     |
| Gateway Evaluation: EvidencePolicy.evaluate(...) -> VERIFIED_PASS     |
| Evaluator Engine: Local Rule Engine v1.4                              |
| Grounded Confidence: HIGH (±0.04)                                     |
| Memory Consequence: FSRS Verified Update (Next: 4.2d)                 |
|                     [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY]        |
| Skill Construct: LEXICAL_ACTIVE_PRODUCTION (Formative diagnostic)     |
+───────────────────────────────────────────────────────────────────────+
| [Default-Deny Invariant: Unassisted attempt is an eligibility         |
| prerequisite, NOT an automatic FSRS update. Positive mutations require|
| EvidencePolicy independent verification across all required criteria.]|
+───────────────────────────────────────────────────────────────────────+
```

### 9.3 Four-Tier Formative Feedback Cards
1. **Verify (What happened)**: Clear confirmation of whether the input met lexical/grammatical targets.
2. **Elaborate (Why)**: Grounded explanation referencing exact source sentence or rubric criterion.
3. **Refute (Misconception check)**: Diagnostic identification of common transfer errors or false friends.
4. **Scaffold (Actionable next step)**: Direct button for `[Clean Retry with New Item]`, `[Revise Draft]`, or `[Schedule Delayed Retest]`.

---

## 10. Learning UI Component Language

### 10.1 Global Learning Shell Navigation
- **Desktop Rail (`LearningRail`)**: Fixed 240px width, brand header, 5 primary destination items (`Today`, `Learn`, `IELTS`, `Library`, `Analytics`), bottom utility cluster (`Capture`, `Search`, `Settings`, `Sync Indicator`).
- **Mobile Bottom Bar (`LearningBottomNav`)**: Fixed height 56px + safe area inset, 5 equally spaced destination icons with 11px labels (`Today`, `Learn`, `IELTS`, `Library`, `Progress`).

### 10.2 Persistent Safe-Area Audio Dock (`PersistentAudioDock`)
- Docked above bottom navigation on mobile with zero touch-target collision.
- Controls: Source Title, Cue Timecode (`01:24 / 04:12`), Play/Pause FAB, Jump Back 5s, Jump Forward 5s, Speed Selector (`0.75x`, `0.9x`, `1.0x`, `1.1x`, `1.25x`), Cue Return Button.
- Suppressed completely when entering strict IELTS Exam Mode.

### 10.3 Today Recommendation Card (`TodayRecommendationCard`)
- Distinct visual priority: Indigo-50 gradient well with 1px border.
- Elements: Recommended Block Title (e.g. "IELTS Listening Section 2 · 15 min"), `Why this?` plain-language rationale tooltip, Primary CTA `[ Resume Block ]`, Secondary Actions `( Change Plan )` and `( Dismiss )`.

### 10.4 SourceContext Chip (`SourceContextChip`)
- Visual: Slate-100 pill with document pin icon.
- Content: `Source: "Article Name" · p4 s2` with integrated `[Return]` action link.

---

## 11. IELTS Exam UI Component Language

### 11.1 Strict Exam Top Bar (`ExamHeader`)
- Layout: Dark slate-900 background, 56px height.
- Content: Skill Title (`IELTS Academic Reading`), Section Indicator (`Passage 2 of 3`), Official Digital Clock (`42:18 remaining`), Question Counter (`Q 17/40`), `[ Finish Section ]` safeguard button with double-confirmation dialog.

### 11.2 Question Palette Component (`QuestionPaletteGrid`)
- Grid layout: 5 columns $\times$ 8 rows (or 10 $\times$ 4 on wide desktop).
- Accessible Item Tokens:
  - `Unanswered`: White box, 1px slate-300 border, dark text.
  - `Answered`: Solid slate-700 box, white text.
  - `Flagged`: Light amber background with top-right flag glyph and 2px amber border.
  - `Current`: Highlighted with 2px indigo-600 outer ring.

### 11.3 Split-Pane Resizable Container (`ExamSplitPane`)
- Left Pane: Passage or Task prompt with sticky section tabs and highlight tool.
- Right Pane: Active Question item, response controls, navigation buttons.
- Divider: 8px grab area with central grab handle icon, supporting left/right keyboard nudge (5% per arrow key press).
- Mobile Transformation: Tabbed switcher (`Passage` vs `Questions`) with badge count and floating quick-switch button.

### 11.4 Masked ARIA Shield (`AntiCheatingMask`)
- In strict exam sessions, answer keys, explanations, and model essays are not exposed in the learner-accessible DOM or ARIA accessibility tree before submission, preventing unintended disclosure or assistive device leaks.

---

## 12. Media & Transcript Controls

### 12.1 Six-Mode Workbench Switcher (`MediaModeBar`)
- Single stable video/audio player container at top.
- Segmented mode bar directly underneath:
  1. `Normal` (Standard media playback with synchronized captions)
  2. `Noticing` (IPA, weak forms, stress indicators, thought group brackets)
  3. `Shadowing` (Record user speech, compare waveform, pitch/speed alignment)
  4. `Strict Dictation` (Blanked sentence, DOM/ARIA masked, single/controlled replay)
  5. `Practice Dictation` (Assisted dictation with first-letter hints and reveals)
  6. `Retell` (Spoken/written summary with formative coaching)
- Switching modes preserves playback timecode, active cue, video buffer, and text drafts without page reload or workspace wipe.

### 12.2 Transcript & Cue Synchronizer (`TranscriptCueRail`)
- Active cue automatically scrolls into center view with smooth, non-disruptive animation.
- Visual token: Active cue highlighted with `--primitive-indigo-50` background and 3px `--primitive-indigo-600` left indicator bar.
- Mobile: Transcript renders inside an expandable bottom sheet with search and jump-to-cue controls.

---

## 13. Vocabulary & Spaced Review Components

### 13.1 Staged Candidate Confirmation Card (`CaptureCandidateCard`)
- Staging container in `Unified Capture Inbox (WF-05)`:
  - Lexical item title (`account for`)
  - Grounded source excerpt with highlight (`"These factors account for over 60% of..."`)
  - Source locator (`Journal of Climate, r3, p2 s1`)
  - Target sense selector / editor dropdown
  - Collocation tags (`account for the difference`, `account for variability`)
  - Duplicate status indicator (`No duplicate` / `Duplicate detected with Card #104 [Merge]`)
  - Primary Action: `[ Confirm & Import ]` (Enrolls in FSRS memory queue as cold-start card; zero recall credit emitted).

### 13.2 FSRS Spaced Review Rating Bar (`FSRSRatingBar`)
- Four rating buttons with clear, honest cognitive descriptors:
  - `Again`: Complete recall failure / incorrect response. (UI displays dynamic label: `Next: <scheduler-computed interval>` [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY, e.g. < 10m])
  - `Hard`: Recalled with significant effort / partial delay. (UI displays dynamic label: `Next: <scheduler-computed interval>` [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY, e.g. 1.2d])
  - `Good`: Successful recall with normal hesitation. (UI displays dynamic label: `Next: <scheduler-computed interval>` [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY, e.g. 3.5d])
  - `Easy`: Instant, effortless recall. (UI displays dynamic label: `Next: <scheduler-computed interval>` [ILLUSTRATIVE_ONLY / NOT_SCHEDULER_POLICY, e.g. 7.0d])
- **Dynamic Scheduling Invariant**: The FSRS engine computes dynamic interval schedules based on card stability, difficulty, retrievability, and review history. The UI rating component displays the rating buttons alongside the dynamic interval preview computed by the scheduler. Numerical interval values shown in documentation or mockups are strictly illustrative and do not constitute hard-coded scheduler policy.

---

## 14. Reading, Writing, Speaking & Mock Primitives

### 14.1 15 Objective Question Family Components
Standardized UI primitives for all IELTS question types:
1. `MultipleChoiceSingle`: Vertical radio group with distinct letter circles (A, B, C, D).
2. `MultipleChoicePlural`: Square checkbox group with explicit selection limits (`Select TWO options`).
3. `TrueFalseNotGiven`: 3-button segmented selector (`TRUE`, `FALSE`, `NOT GIVEN`).
4. `YesNoNotGiven`: 3-button segmented selector (`YES`, `NO`, `NOT GIVEN`).
5. `MatchingHeadings`: Draggable/selectable heading list with paragraph target dropzones and non-drag keyboard selector.
6. `MatchingInformation`: Letter select box next to numbered items.
7. `MatchingFeatures`: Categorized option matrix.
8. `MatchingSentenceEndings`: Two-column connector with keyboard-accessible pairing dropdowns.
9. `SentenceCompletion`: Inline input box with character/word counter.
10. `SummaryCompletion`: Paragraph text with embedded dropdowns or numbered text input blanks.
11. `NoteCompletion`: Bulleted list with dotted input fields.
12. `TableCompletion`: Data table with highlighted missing cells.
13. `FlowChartCompletion`: Step-by-step sequential diagram with blank step cards.
14. `DiagramLabelCompletion`: Graphic container with coordinate pins and label input sheet.
15. `ShortAnswerQuestions`: Text input with strict word limit indicator (`NO MORE THAN THREE WORDS`).

### 14.2 Writing Workspace Primitives
- **Task 1 Visual Container (`Task1VisualContainer`)**: Zoomable SVG/Canvas container for 7 visual families (Bar, Line, Pie, Table, Map, Process, Multi-chart) paired with mandatory `[View Semantic Data Table]` accessible alternative.
- **Task 2 Essay Editor (`EssayEditor`)**: Distraction-free textarea with live word count, 250-word threshold marker, optional `Outline Drawer`, and shared 60-minute session timer with ~40-minute recommendation guidance (not a hard countdown lock).

### 14.3 Speaking Workspace Primitives
- **Part 2 Pinned Notes Workbench (`Part2NotesWorkbench`)**: Pinned scratchpad visible throughout 1-minute prep and 2-minute speaking phase; notes persist across phase transitions.
- **Audible & Visual 1:45 Alert (`SpeakingWarningBanner`)**: Subtle non-blocking chime + yellow header banner at 1 minute 45 seconds to prepare candidate for completion.
- **Session-Scoped Audio Safety Bar (`AudioSafetyBar`)**: Status of local microphone, explicit `[Download Raw Audio]` button, and warning that unexported audio is purged upon session exit.

### 14.4 Full Mock Orchestration Primitives
- **Mock Precheck Screen (`MockPrecheckCard`)**: Audio output test, mic input test, storage checkpoint verification, and explicit Speaking choice (`Complete Speaking Now` vs `Schedule Speaking Separately`).
- **Mock Scorecard (`MockScorecard`)**: Tabulated Listening, Reading, Writing scores with `Speaking: Pending / Scheduled` badge and honest Practice Estimate disclaimer.

---

## 15. Forms, Inputs & Navigation Components

### 15.1 Input Fields & Validation
- Standard Input: 44px height, 1px border, 8px padding, 15px font size.
- Focus Ring: 2px solid `--primitive-indigo-600` with 2px offset.
- Error State: 1.5px solid `--primitive-rose-500` border, `--primitive-rose-50` background tint, inline error message linked via `aria-describedby`.
- Success State: 1px solid `--primitive-emerald-500` border, inline checkmark icon.

### 15.2 Buttons & Action Triggers
- `ButtonPrimary`: Solid `--primitive-indigo-600` background, white text, 8px radius, semibold font.
- `ButtonSecondary`: White background, 1px `--primitive-slate-300` border, `--primitive-slate-800` text.
- `ButtonDestructive`: `--primitive-rose-600` background, white text, requires 2-step confirmation or 5-second undo toast.
- `ButtonGhost`: Transparent background, `--primitive-slate-700` text, hover `--primitive-slate-100` tint.

---

## 16. Empty, Loading, Error, Degraded & Recovery States

### 16.1 State Matrix

| State Class | Visual Presentation | Primary Action | Data Guarantee |
|---|---|---|---|
| **Empty State** (No due reviews / empty inbox) | Calm slate illustration, reassuring copy ("All caught up for today") | `[ Explore Library ]` or `[ Practice IELTS ]` | Zero fake backlog; streak protected |
| **Loading State** | Skeleton shimmer matching exact layout card dimensions | Non-interactive | No layout shift upon data arrival |
| **Non-Blocking Error** | Floating toast in bottom-right corner (amber/rose) | `[ Retry ]` or `[ Copy Diagnostics ]` | User work in progress is preserved |
| **Core-Only Degraded Mode** | Persistent top notification banner (`--primitive-amber-50`) | `[ View Service Status ]` | Local drills functional; cloud AI queued |
| **Crash & Interruption Recovery** | Modal / header banner (`"Exam session restored from 09:41 checkpoint"`) | `[ Resume Test (18:32 remaining) ]` | 100% item, timer, and draft recovery |
| **Boot Diagnostic Drawer** | Plain-language fail-safe error overlay | `[ Copy Diagnostic Details ]` `[ Restart Safe Mode ]` | Prevents white-screen application death |

---

## 17. Accessibility Tokens & Constraints (WCAG 2.1 AA+ Alignment)

### 17.1 Contrast Ratio Verification Matrix

The contrast ratios below have been independently recomputed using the standard WCAG relative luminance formula ($L = 0.2126 \cdot R + 0.7152 \cdot G + 0.0722 \cdot B$ where $C_{srgb} \le 0.04045 \implies C = C_{srgb}/12.92$ else $((C_{srgb}+0.055)/1.055)^{2.4}$) and contrast ratio $(L_1 + 0.05) / (L_2 + 0.05)$:

| Foreground Token / Hex | Background Token / Hex | Recomputed Contrast Ratio | WCAG Design Token Level |
|---|---|---|---|
| `--color-learn-text-primary` (`#0f172a`) | `--color-learn-bg-surface` (`#ffffff`) | **17.85 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| `--color-learn-text-secondary` (`#475569`) | `--color-learn-bg-surface` (`#ffffff`) | **7.58 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| `--color-learn-brand-primary` (`#4f46e5`) | `--color-learn-bg-surface` (`#ffffff`) | **6.29 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$) |
| `--color-exam-header-text` (`#f8fafc`) | `--color-exam-header-bg` (`#1e293b`) | **13.98 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| `--color-assist-ua-text` (`#334155`) | `--color-assist-ua-bg` (`#f1f5f9`) | **9.45 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| `--color-assist-la-text` (`#0369a1`) | `--color-assist-la-bg` (`#f0f9ff`) | **5.57 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$) |
| `--color-assist-sc-text` (`#b45309`) | `--color-assist-sc-bg` (`#fffbeb`) | **4.84 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$) |
| `--color-assist-ar-text` (`#7e22ce`) | `--color-assist-ar-bg` (`#faf5ff`) | **6.51 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$) |
| `--color-evidence-high-text` (`#047857`) | `--color-evidence-high-bg` (`#ecfdf5`) | **5.21 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$) |
| Dark Mode: `--color-learn-text-primary` (`#f8fafc`) | `--color-learn-bg-canvas` (`#020617`) | **19.28 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| Dark Mode: `--color-learn-text-primary` (`#f8fafc`) | `--color-learn-bg-surface` (`#0f172a`) | **17.06 : 1** | **Passes AAA** (Normal Text $\ge 7.0:1$) |
| Dark Mode: `--color-learn-text-secondary` (`#94a3b8`) | `--color-learn-bg-surface` (`#0f172a`) | **6.96 : 1** | **Passes AA** (Normal Text $\ge 4.5:1$, Large $\ge 3.0:1$) |
| Dark Mode: `--color-learn-border-focus` (`#818cf8`) | `--color-learn-bg-surface` (`#0f172a`) | **5.98 : 1** | **Passes AA** (UI Focus Ring $\ge 3.0:1$) |

#### Conformance Scope Distinction:
```
DESIGN_TOKEN_CONTRAST_PASS != WHOLE_APPLICATION_WCAG_CONFORMANCE
```
W4 defines design tokens and component-level accessibility design obligations. Full application WCAG 2.1 AA conformance depends on runtime DOM structure, semantic HTML markup, dynamic state management, and assistive technology testing during implementation waves, and is not claimed purely by design token specification.

### 17.2 Accessibility Proof Obligations
1. **Focus Management**: Focus trapped within open modal dialogs; focus restored to invoking button upon modal close.
2. **Screen Reader Announcements**: Countdown timers announce only at key milestones (10m, 5m, 1m) via `aria-live="polite"` to avoid audio chatter during reading.
3. **Touch Targets**: All mobile buttons, navigation icons, and question palette boxes have a minimum bounding box of `48px` $\times$ `48px`.
4. **Text Resizing**: UI supports up to `200%` browser zoom without text overlapping, truncating timers, or breaking split panes.

---

## 18. Motion & Micro-Interaction Principles

### 18.1 Motion Duration & Easing Tokens

```css
:root {
  --motion-duration-instant: 0ms;
  --motion-duration-fast:    120ms;
  --motion-duration-normal:  240ms;
  --motion-duration-slow:    400ms;

  --motion-ease-standard: cubic-bezier(0.2, 0.0, 0, 1.0);
  --motion-ease-enter:    cubic-bezier(0.0, 0.0, 0.2, 1);
  --motion-ease-exit:     cubic-bezier(0.4, 0.0, 1, 1);
}
```

### 18.2 Reduced Motion Mode (`prefers-reduced-motion: reduce`)
When active:
- All transitions and layout animations drop to `--motion-duration-instant` (`0ms`).
- Sheet popups appear instantly without slide translation.
- Synchronized transcript highlights snap directly without smooth scroll.
- Zero state, focus, or functional information is lost.

---

## 19. Desktop-to-Mobile Component Transformations

| Desktop Structural Component | Mobile Structural Transformation | State / Context Preservation Rule |
|---|---|---|
| **5-Pillar Vertical Rail (240px)** | 5-item Bottom Navigation Bar + "More" Sheet | All 5 pillars remain 1-tap reachable; no fake locks |
| **Split Reading Passage / Questions (2 columns)** | Reversible Tabbed Views (`Passage` vs `Questions`) | Current passage scroll position, highlights, active item, and timer persist across tab toggles |
| **Media Player + Transcript Rail (Side-by-side)** | Stacked Video Player + Expandable Bottom Sheet Transcript | Video continues playing smoothly; active cue follows |
| **Dense 40-Question Palette Bar** | Sticky Bottom Bar + Full-Screen Palette Sheet | Flagged/answered status, current question item, and jump targets persist |
| **Writing Prompt / Visual + Essay Editor** | Sticky Prompt Summary Chip + Expandable Prompt Sheet + Fullscreen Editor | Editor remains primary above software keyboard; prompt always inspectable |
| **Multi-Column Analytics Dashboard** | Stacked Metric Cards + Carousel Habit Grid + Full-Screen Evidence Drill-down | All uncertainty metrics, export tools, and evidence links remain accessible |

---

## 20. W5 Hi-Fi Visual Mockup & Handoff Contract

This design system provides the complete visual grammar for Stage 4 Wave 5 (High-Fidelity Mockups & Interactive Screen Specifications).

### 20.1 Bounded Truth Labeling Register
Every token, component, and visual state in W5 must use the canonical truth vocabulary:
- `[CURRENT]`: Active in existing implementation baseline.
- `[CURRENT_REHOMED]`: Active capability repositioned into new 5-pillar IA.
- `[STAGE4_TARGET / NOT_CURRENT_IMPLEMENTATION]`: Target Stage 4 capability defined in strategy.
- `[FUTURE_UX_RESERVED]`: Reserved interface space for future stages (e.g. Stage 7 transfer).
- `[FUTURE_UX_RESERVED / PARTIALLY_SUPPORTED]`: Reserved space with partial baseline mock.
- `[OWNER_RECONFIRMED_FUTURE]`: Interactive Examiner Simulation reserved for post-Stage 4.
- `[BACKGROUND_SYSTEM]`: System engine (e.g. EvidencePolicy, IndexedDB backup registry).

### 20.2 Handoff Checklist for W5 Designers & Implementers
- [x] Strict separation maintained between Learning UI (warm/supportive) and Exam UI (restrained/neutral).
- [x] All 15 screen classes mapped with corresponding component tokens.
- [x] Zero gamification or distracting chrome inside strict IELTS Exam modes.
- [x] **EvidencePolicy Gateway Invariant**: UI state transitions must NEVER directly mutate FSRS parameters or progress metrics. The UI records learner interaction telemetry and submits attempt data to the `EvidencePolicy` gateway. Positive FSRS mutations occur only when `EvidencePolicy` emits an authenticated positive verdict under default-deny rules.
- [x] Mobile touch targets verified at $\ge 48\times 48\text{px}$.
- [x] Design token contrast ratios verified against WCAG AA/AAA thresholds.
- [x] Dynamic FSRS intervals: UI displays `Next: <scheduler-computed interval>`; no hard-coded fixed interval policies.

---

## 21. Reconciliation Matrices

### 21.1 15/15 Screen Classes Mapped

| Screen Class ID | Screen Class Name | Design System Primary Component(s) | Surface Grammar |
|---|---|---|---|
| **WF-01** | Today / Home Dashboard | `TodayRecommendationCard`, `ContinueCarousel`, `ChoiceGrid` | Learning UI |
| **WF-02** | Vocabulary & Collocation Canvas | `VocabLifecycleStepper`, `ContextPracticeCard`, `FSRSRatingBar` | Learning UI |
| **WF-03** | Video / Media Study Workspace | `MediaModeBar`, `TranscriptCueRail`, `NoticingWorkbench`, `ShadowingWaveform` | Learning UI |
| **WF-04** | Article / Source Reader Workspace | `ArticleReaderContainer`, `SelectionToolbar`, `SourceContextChip` | Learning UI |
| **WF-05** | Unified Capture Inbox | `CaptureCandidateCard`, `DuplicateMergeComparator`, `ConfirmImportAction` | Learning UI |
| **WF-06** | Error Notebook & Remediation | `WeaknessHeatmapList`, `EvidenceReceiptDrawer`, `RemediationActionCard` | Learning UI |
| **WF-07** | Multi-Dimensional Analytics | `ConstructCardGrid`, `HabitGrid52W`, `PacingCalculatorWidget` | Learning UI |
| **WF-08** | IELTS Listening | `ExamHeader`, `SinglePlayAudioStatus`, `QuestionPaletteGrid` | IELTS Exam UI / Practice |
| **WF-09** | IELTS Academic Reading | `ExamSplitPane`, `AcademicPassageView`, `ObjectiveQuestionFamily` | IELTS Exam UI / Practice |
| **WF-10** | IELTS General Training Reading | `ExamSplitPane`, `GTSectionMultiTextView`, `ObjectiveQuestionFamily` | IELTS Exam UI / Practice |
| **WF-11** | IELTS Writing Task 1 | `Task1VisualContainer`, `SemanticDataTable`, `GTLetterChecklist` | IELTS Exam UI / Practice |
| **WF-12** | IELTS Writing Task 2 | `EssayEditor`, `OutlineDrawer`, `FourCriterionFeedbackCard` | IELTS Exam UI / Practice |
| **WF-13** | IELTS Speaking | `Part1InterviewCard`, `Part2NotesWorkbench`, `AudioSafetyBar` | IELTS Exam UI / Guided Practice |
| **WF-14** | IELTS Full Mock | `MockPrecheckCard`, `ExamShellOrchestrator`, `MockScorecard` | IELTS Exam UI |
| **WF-15** | Settings / AI / Data Safety | `PreferencesSection`, `ConsentReceiptView`, `BackupRegistryStatus` | Shared Utility UI |

### 21.2 48/48 Capabilities (CAP-001..CAP-048) Mapped

| Capability ID | Capability Name | Design System Token / Component Representation | Preservation Status |
|---|---|---|---|
| **CAP-001** | Today Daily Study Runner | `TodayRecommendationCard`, `PacingCalculatorWidget` | **MAPPED** |
| **CAP-002** | FSRS 5-Skill Memory Scheduling | `FSRSRatingBar`, `EvidenceReceiptCard` | **MAPPED** |
| **CAP-003** | Vocabulary & Collocation Drills | `ContextPracticeCard`, `MultimodalExerciseRunners` | **MAPPED** |
| **CAP-004** | Sentence Learning Loop | `MediaModeBar`, `GuidedLoopStepper` | **MAPPED** |
| **CAP-005** | Strict vs Practice Dictation | `DictationWorkbench`, `AntiCheatingMask` | **MAPPED** |
| **CAP-006** | Noticing & Thought Groups | `NoticingWorkbench`, `IPAPhoneticTokens` | **MAPPED** |
| **CAP-007** | Shadowing & Self-Recording | `ShadowingWaveform`, `AudioSafetyBar` | **MAPPED** |
| **CAP-008** | Retell Coaching & Drafting | `RetellWorkbench`, `DraftJournalRecovery` | **MAPPED** |
| **CAP-009** | YouTube Video Workspace, six modes | `MediaModeBar` (6 modes in 1 stable workspace) | **MAPPED** |
| **CAP-010** | Caption Normalization/Deduplication | `TranscriptCueRail`, `IngestionStatusBadge` | **MAPPED** |
| **CAP-011** | Private Source Library | `SourceLibraryPicker`, `SourceContextChip` | **MAPPED** |
| **CAP-012** | Unified Capture Inbox | `CaptureCandidateCard`, `CaptureInboxShell` | **MAPPED** |
| **CAP-013** | Multi-Dimensional Analytics | `ConstructCardGrid`, `UncertaintyBandToken` | **MAPPED** |
| **CAP-014** | Error Notebook & Diagnostic Fingerprint | `WeaknessHeatmapList`, `DiagnosticFingerprint` | **MAPPED** |
| **CAP-015** | Audio Manager & TTS Voice Selection | `PersistentAudioDock`, `AudioSettingsDrawer` | **MAPPED** |
| **CAP-016** | EvidencePolicy Decision Gateway | `AssistanceBadge` (UA/LA/SC/AR), `EvidenceReceipt` | **MAPPED** |
| **CAP-017** | Academic vs GT Track Switcher | `TrackSwitcherPill`, `TrackBadge` | **MAPPED** |
| **CAP-018** | Listening Four-Part Exam Runner | `ExamHeader`, `SinglePlayAudioStatus`, `PartTabs` | **MAPPED** |
| **CAP-019** | Listening Practice Mode | `PracticeListeningWorkbench`, `PostAttemptTranscript` | **MAPPED** |
| **CAP-020** | Academic Reading Split Runner | `ExamSplitPane`, `AcademicPassageView` | **MAPPED** |
| **CAP-021** | GT Reading Split Runner | `ExamSplitPane`, `GTSectionMultiTextView` | **MAPPED** |
| **CAP-022** | Academic Writing Task 1 Visual Container | `Task1VisualContainer`, `SemanticDataTable` | **MAPPED** |
| **CAP-023** | GT Writing Task 1 Letter | `GTLetterWorkspace`, `RegisterChecklist` | **MAPPED** |
| **CAP-024** | Writing Task 2 Essay | `EssayEditor`, `OutlineDrawer`, `WordCounter` | **MAPPED** |
| **CAP-025** | Four-Criterion Writing Evaluation | `FourCriterionFeedbackCard` (TA/TR, CC, LR, GRA) | **MAPPED** |
| **CAP-026** | Speaking Part 1 | `Part1InterviewCard`, `TurnPacingIndicator` | **MAPPED** |
| **CAP-027** | Speaking Part 2 | `Part2NotesWorkbench`, `SpeakingWarningBanner` | **MAPPED** |
| **CAP-028** | Speaking Part 3 | `Part3DiscussionCard`, `TurnPacingIndicator` | **MAPPED** |
| **CAP-029** | Full Mock Orchestrator | `MockPrecheckCard`, `ExamShellOrchestrator`, `MockScorecard` | **MAPPED** |
| **CAP-030** | IELTS Section Practice | `SectionPracticeSelector`, `DirectSectionLauncher` | **MAPPED** |
| **CAP-031** | Fifteen Objective Task Families | `ObjectiveQuestionFamily` (All 15 standardized primitives) | **MAPPED** |
| **CAP-032** | Live Exam Timers & Pacing | `ExamHeaderTimer`, `10m5mWarningAlerts` | **MAPPED** |
| **CAP-033** | Exam Reload & Crash Recovery | `CrashRecoveryBanner`, `CheckpointRestoreIndicator` | **MAPPED** |
| **CAP-034** | Primary IA V10 Host Integration | `LearningRail` (5 pillars), `LearningBottomNav` | **MAPPED** |
| **CAP-035** | IELTS Hub V2 | `IELTSHubHome`, `TrackSelectorCard` | **MAPPED** |
| **CAP-036** | Signed Content Platform & Catalog Trust | `SignedPackProvenanceCard`, `TrustBadge` | **MAPPED** |
| **CAP-037** | Offline Pack Lifecycle | `PackLifecycleProgress`, `SafeDeleteRetainRecords` | **MAPPED** |
| **CAP-038** | Roadmap Runtime Inspector | `GovernanceAuditSubView`, `MilestoneInspector` | **MAPPED** |
| **CAP-039** | Consent Receipt Gateway | `ConsentReceiptView`, `ProcessingTruthDisclosure` | **MAPPED** |
| **CAP-040** | Desktop ASR Companion Bridge | `ASRReadinessIndicator`, `GracefulFallbackBanner` | **MAPPED** |
| **CAP-041** | Core-Only Degraded Mode | `CoreOnlyDegradedBanner`, `OfflineCapabilityTag` | **MAPPED** |
| **CAP-042** | Backup Registry | `BackupRegistryStatus`, `StoreCoverageIndicator` | **MAPPED** |
| **CAP-043** | Interrupted Restore Auto-Recovery | `RestoreRecoveryProgress`, `JournalStatusPill` | **MAPPED** |
| **CAP-044** | Session Secret Containment | `SessionSecretStatusPill`, `EphemeralKeyTag` | **MAPPED** |
| **CAP-045** | Non-Blocking Boot Error Reporter | `BootDiagnosticDrawer`, `DiagnosticExportAction` | **MAPPED** |
| **CAP-046** | Safe Destructive Operations | `SafeDestructiveDialog`, `FiveSecondUndoToast` | **MAPPED** |
| **CAP-047** | Progressive Long-Media Processing | `ProgressiveCueLoader`, `PartialReadyStatus` | **MAPPED** |
| **CAP-048** | PWA Offline Support & Cache Cleanup | `PWAOfflineIndicator`, `StaleCacheCleanupAlert` | **MAPPED** |

### 21.3 12/12 Omission Invariants (S4-OMIT-001..S4-OMIT-012) Preserved

| Omission ID | Required Invariant | Design System Component / Token Representation | Preservation Status |
|---|---|---|---|
| **S4-OMIT-001** | Custom lexical target capture | `CustomLexicalCaptureInput` with exact SourceContext preservation | **PRESERVED** |
| **S4-OMIT-002** | Retell draft recovery | `DraftJournalRecoveryBanner` with Restore/Discard actions | **PRESERVED** |
| **S4-OMIT-003** | Strict dictation ARIA masking | `AntiCheatingMask` preventing answer exposure in DOM/ARIA before submit | **PRESERVED** |
| **S4-OMIT-004** | Transcript slicing/edit drawer | `TranscriptSlicerDrawer` with non-destructive split/merge actions | **PRESERVED** |
| **S4-OMIT-005** | Core-only degraded notice | `CoreOnlyDegradedBanner` informing learner of local drill readiness | **PRESERVED** |
| **S4-OMIT-006** | Mobile audio/nav collision | Safe-area `PersistentAudioDock` positioned strictly above bottom nav | **PRESERVED** |
| **S4-OMIT-007** | Card suspension visible/manageable | `SuspendedCardsDrawer` with explicit Active/Suspended/Mastered filters | **PRESERVED** |
| **S4-OMIT-008** | Exam pacing/target date Analytics | `PacingCalculatorWidget` with adjustable target date & workload | **PRESERVED** |
| **S4-OMIT-009** | Exact audio rates selector | Audio player rate tokens (`0.75x`, `0.9x`, `1.0x`, `1.1x`, `1.25x`) | **PRESERVED** |
| **S4-OMIT-010** | Speaking Part 2 pinned notes | `Part2NotesWorkbench` persistent scratchpad surviving into 2m response | **PRESERVED** |
| **S4-OMIT-011** | Pack provenance/review inspection | `SignedPackProvenanceCard` with signature & rights inspectability | **PRESERVED** |
| **S4-OMIT-012** | Roadmap runtime status audit | `GovernanceAuditSubView` located in Settings $\to$ About | **PRESERVED** |

### 21.4 28/28 REM-003 Recommendations Reconciled

| REC ID | Recommendation Title | Decision | Anti-RPS Class | Design System Representation |
|---|---|---|---|---|
| **REC-REM002-001** | Explainable Today Recommendation | ADAPT | `[B]` | `TodayRecommendationCard` with `Why this?` tooltip & alternative choices |
| **REC-REM002-002** | Semantic SourceContext Continuity | ADAPT | `[B]` | `SourceContextChip` with exact revision, paragraph, sentence locator & Return |
| **REC-REM002-003** | Plural Skill Teaching with Fading | ADAPT | `[C]` | Model $\to$ Scaffold $\to$ Faded practice states with assistance level tracking |
| **REC-REM002-004** | Feedback Leads to Grounded Action | ADAPT | `[B]` | 4-tier formative feedback cards leading to clean retry or delayed retest |
| **REC-REM002-005** | Context-Rich Lexical Object | KEEP | `[C]` | Preserves source locator, sense, collocation chips, and multimodal drills |
| **REC-REM002-006** | Staged Capture Lifecycle | KEEP | `[C]` | Capture candidate triage in WF-05 before explicit FSRS enrollment |
| **REC-REM002-007** | Memory vs Skill vs IELTS Separation | KEEP | `[C]` | Distinct construct cards in Analytics; FSRS never equates to band score |
| **REC-REM002-008** | Search Returns to Context | ADAPT | `[B]` | Search overlay reveals existing owner cards; never duplicates content |
| **REC-REM002-009** | Signed Catalog Trust Lifecycle | ADAPT | `[B]` | Pack signature, provenance, and update/revoke trust badges |
| **REC-REM002-010** | Listening Cue Identity | ADAPT | `[B]` | Stable audio cue identity across practice, dictation, and review |
| **REC-REM002-011** | Reading Passage Evidence / Rationale | ADAPT | `[B]` | Exact passage span highlight linked to question explanation post-attempt |
| **REC-REM002-012** | Writing Criterion / Span / Action | ADAPT | `[B]` | 4-criterion feedback cards with underlined spans and revision actions |
| **REC-REM002-013** | Speaking Criterion / Segment Flow | ADAPT | `[B]` | Part-specific prompt cards, waveform feedback, and segment review |
| **REC-REM002-014** | IELTS Grounded Review & Remediation | ADAPT | `[C]` | Diagnostic review in error notebook; voluntary targeted drill launch |
| **REC-REM002-015** | Uncertain Misconception Lifecycle | ADAPT | `[C]` | Weakness cards with confidence indicator and distinct outcome states |
| **REC-REM002-016** | Official Strict Exam Semantics | KEEP | `[C]` | Unmounted chrome, 40-item palette, official timers, zero learning aids |
| **REC-REM002-017** | Full-Test Limitations to Action | ADAPT | `[B]` | Scorecard with explicit Speaking pending status and practice disclaimer |
| **REC-REM002-018** | Alternatives / Nonpunitive Re-entry | ADAPT | `[B]` | Recommended block has Change Plan / Dismiss; all 5 pillars always open |
| **REC-REM002-019** | Inspectable Multidimensional Analytics| KEEP | `[B]` | 4 distinct construct gauges with uncertainty bands and data tables |
| **REC-REM002-020** | Evidence / Consent Disclosure | KEEP | `[B]` | Assistance badges, EvidenceReceipts, and explicit consent modals |
| **REC-REM002-021** | Data Safety / Degraded Lifecycle | KEEP | `[C]` | Backup registry status, recovery journals, and degraded core banners |
| **REC-REM002-022** | Service & ASR Readiness | ADAPT | `[B]` | Connected / Disconnected / Unavailable badges with non-ASR fallback |
| **REC-REM002-023** | One EvidenceReceipt Grammar | KEEP | `[B]` | Unified schema for attempt inspection across Vocab, IELTS, and Media |
| **REC-REM002-024** | Reject Duplicate Owners / Walls | REJECT | `[D]` | Block duplicate runners; consolidate into 15 canonical screen classes |
| **REC-REM002-025** | Responsive Task Priority Recomposition| ADAPT | `[C]` | Recompose layouts (panes to sheets) without shrinking or deleting tools |
| **REC-REM002-026** | Accessibility Proof Obligations | KEEP | `[B]` | WCAG 2.1 AA+ contrast, 48px targets, keyboard focus, screen reader live rules |
| **REC-REM002-027** | Distinct Full / Section / Targeted Scopes| KEEP | `[C]` | Direct scope selector without forced prerequisite unlock chains |
| **REC-REM002-028** | Ephemeral Recording Safety | KEEP | `[B]` | Session-scoped raw audio with manual export action and exit guard dialog |

---

## 22. Final Structural Audit Assertions

- 15/15 representative screen classes have complete design-system tokens and component language.
- 48/48 capabilities (CAP-001..CAP-048) are mapped without silent deletion or semantic dilution.
- 12/12 omission invariants (S4-OMIT-001..S4-OMIT-012) are explicitly preserved.
- 28/28 REM-003 recommendations are reconciled (11 KEEP, 16 ADAPT, 1 REJECT).
- Learning UI and strict IELTS Exam UI maintain distinct, coherent dual-grammar visual rules.
- Mobile transformations and WCAG 2.1 AA+ accessibility obligations are fully specified with recomputed contrast ratios.
- EvidencePolicy default-deny invariant preserved: Unassisted attempt is an eligibility prerequisite, not an automatic FSRS update.
- Token graph integrity verified: Zero undefined primitive references.
- Dynamic FSRS intervals verified: No hard-coded scheduling policies.
- Non-runtime design specification only; zero production code, tests, workflows, or dependency mutations.
- The W4 executor does not self-audit, does not merge, and does not claim Stage 4 completion.

Candidate terminal state: `W4_REM001_COMPLETE_PENDING_INDEPENDENT_AUDIT`.
