# Global Writing Guide

## Goal

- Build frontend concept articles as topic-based learning modules, each suitable for `30-60min` reading.
- Prioritize causal understanding over rote memorization.
- Keep every topic practically usable in real projects and postmortems.

## Default Topic Rewrite Workflow

- Do not build study plans from titles only when source articles are available.
- For each topic, first select a bounded source set (`3-8` core files), then read the full content.
- Before writing the final article, run a knowledge Q&A round to identify the user's actual bottlenecks.
- Adapt depth and emphasis based on Q&A outcomes, not on a fixed generic outline.
- Convert project experiences into reusable technical narratives with: context, decision, trade-offs, result, and evidence.
- When the user says "do not miss anything", create a source-to-article coverage map before drafting.
- Mark each source point as one of: kept in current article / moved to another article / intentionally out of scope.
- After completing each article, immediately update `/Users/jinghaihan/code/repos/jinghaihan/checklist.md` progress for that topic in the same work cycle.
- Validation loop and project case sections are opt-in: only include them when the user explicitly asks for them in the current task.
- Do not fabricate project evidence, metrics, or experiment outcomes. If missing, mark as pending instead of inventing.

## Audience

- Frontend engineers improving system-level understanding and engineering depth.
- Readers who already know basic APIs but need a stronger mental model.

## Core Style

- Explain by causal chain, not glossary.
- Start from one minimal runnable example, then expand to system behavior.
- Use "why -> how -> trade-off -> verification" as the default flow.
- Avoid empty definitions and long API enumeration.
- Avoid rhetorical, emotional, or preachy expressions.
- In article body, avoid conversational wording. Do not use second-person or dialogue-style phrasing such as "你提到", "我们来", "你可以".
- Avoid manifesto-style openings (for example: "这篇文章只做一件事"). Open with scope and engineering problem directly.
- Prefer neutral technical wording over slogan-style headings.
- Do not write section content as "concept list + conclusion list" only. For each non-trivial section, include mechanism chain (cause -> runtime behavior -> result).
- Do not prefix top-level article headings (`##`) with numeric indices by default; use semantic heading titles unless the user explicitly asks for numbering.
- Subsection headings (`###`) should use ordered numeric prefixes (`1.`, `2.`, `3.`) by default to match existing article style, unless the user asks otherwise.
- Do not add response templates unless explicitly requested.
- For abbreviations and acronyms, always provide the full name on first mention.
- `<ruby>` notation is allowed only when the user explicitly approves it for the current task.
- Without explicit approval, explain terms using plain text format: Chinese term + English full name (acronym).

## Article Structure Template

1. Problem framing: what practical confusion this topic solves.
2. Global timeline: one end-to-end execution path.
3. Core mechanism: break down each stage with dependency relationships.
4. Engineering boundaries: common pitfalls, edge cases, and constraints.
5. Decision rules: when to choose A vs B.
6. Validation loop (optional, user requested): how to confirm with DevTools, metrics, or experiments.
7. Knowledge recap: concise summary plus deeper follow-up paths.

## Coverage & Balance Rules

- Keep section density balanced for comparable layers in the same pipeline (avoid one layer over-expanded while others are under-specified).
- Use consistent subsection schema for comparable parts (for example: input -> output -> cost drivers).
- Include boundary cases and counterexamples for each core concept.
- Include practical coding techniques where relevant, not only conceptual explanation.
- If the user asks for "思路/原则" only, do not include code snippets; explain decisions and trade-offs at architecture level.
- For optimization topics, pair each technique with both benefit and trade-off.
- For metrics topics, provide full names, thresholds, and troubleshooting mapping.

## Delivery Gate

- Verify every major point from selected source files is either covered or explicitly mapped to another article.
- If the user explicitly requests project cases, verify the article contains at least one concrete project case with measurable before/after evidence.
- Verify no rhetorical, preachy, or slogan-like wording appears in headings or summaries.
- Verify no dialogue-style wording appears in article body (including second-person references and conversational transitions).
- Verify each core section explains mechanism and failure modes, not only terminology and final recommendations.
- Verify abbreviations are expanded on first mention (and `<ruby>` is used only with explicit user approval).
- Verify examples are runnable or directly translatable into code without hidden assumptions.

## Content Requirements

- Every section must connect to previous context; no isolated "knowledge cards".
- Include at least one counterexample or misconception correction.
- Include concrete engineering scenarios (SPA, SSR, large dependency, high-frequency interaction, etc.).
- Distinguish browser behavior, framework behavior, and business-layer decisions.
- Prefer real examples from the user's own projects when available.
- If the user explicitly requests project cases, include at least one "project case" with context, decision, trade-offs, outcome, and evidence.
- If project cases are requested, turn them into reusable technical narratives, not just fragmented notes.

## Mermaid & Visual Rules

- Prefer Mermaid to show process, dependency, and decision flow.
- Use diagrams to support reasoning, not decoration.
- Write all Mermaid labels, node text, and chart titles in English.
- Keep node text short, action-oriented, and readable in presentations.
- For large topics, provide one top-level map plus local sub-flow diagrams.

## Tone & Language

- Language: `zh-CN`.
- Tone: direct, precise, technical, and pragmatic.
- Use document narration style, not chat style.
- Do not overuse buzzwords; define terms once and reuse consistently.
- Keep paragraphs concise; prioritize clear transitions between sections.

## Quality Checklist

- Is the core question answered with a causal chain?
- Can the reader predict behavior in a new case using this model?
- Are trade-offs and boundaries explicit?
- Is there a measurable verification method?
- Is the final summary reusable as a technical explanation?
