---
name: horas-claras-frontend-design
description: Use this skill when designing, reviewing, or modifying frontend UI for the Horas Claras project. It enforces CSS Modules, simple professional UX, accessibility basics, no Tailwind, no new UI dependencies, and consistency with the existing Next.js/React codebase.
---

# Horas Claras Frontend Design Skill

This skill guides UI work for **Horas Claras**, a small internal app for tracking work hours and Jira loading status.

Use it when the task involves:

- designing a new screen;
- modifying an existing UI;
- improving responsive behavior;
- creating or reviewing forms;
- improving dashboard/list/card layouts;
- adjusting CSS Modules;
- reviewing visual consistency;
- improving accessibility;
- writing frontend prompts for a local coding agent.

---

## Core rule

Horas Claras must be clear, fast, professional, and usable.

It should not look like a generic AI-generated dashboard or an overdesigned landing page.

Favor:

- clarity over decoration;
- readable layout over visual novelty;
- practical interactions over animations;
- existing patterns over new systems;
- accessibility over visual tricks.

---

## Hard constraints

- Use CSS Modules.
- Do not use Tailwind.
- Do not add UI libraries unless explicitly approved by the developer.
- Do not add icon libraries unless explicitly approved by the developer.
- Do not use inline styles except for a minimal justified case.
- Do not invent Figma.
- Do not redesign the full app unless explicitly requested.
- Do not introduce real names, real emails, real credentials, or sensitive data.
- Do not hardcode business values unless they are explicitly defined in the repo or by the developer.
- Do not create mock production flows.

---

## Required reading before UI changes

Before changing UI, inspect:

1. `AGENTS.md`
2. `docs/agent/frontend-design.md`
3. `package.json`
4. `src/app/globals.css`
5. CSS Module files related to the target screen
6. Components related to the target screen
7. Shared frontend utilities or types if the UI depends on data

If the required file does not exist, report it. Do not invent it.

---

## Visual direction

Design should feel:

- simple;
- modern;
- calm;
- focused;
- responsive;
- portfolio-ready;
- suitable for daily internal use.

Avoid:

- excessive gradients;
- heavy shadows;
- unnecessary motion;
- too many cards;
- decorative icons without function;
- unreadable small text;
- hidden primary actions;
- horizontal scroll on mobile.

---

## Layout guidance

Use:

- mobile-first layouts;
- clear page titles;
- short explanatory subtitles only when useful;
- consistent spacing;
- grouped actions;
- obvious primary action;
- restrained secondary actions;
- max-width containers for desktop;
- single-column forms on mobile;
- adaptive lists/cards when tables are not mobile-friendly.

---

## Forms

Every form should include:

- visible labels;
- understandable placeholders only when useful;
- field-level errors;
- general error area if submit fails;
- loading state on submit;
- disabled submit when appropriate;
- accessible focus state;
- keyboard-friendly controls.

Avoid:

- ambiguous field names;
- hidden validation;
- dynamic options without a source;
- fields that imply unavailable backend support.

---

## States

Cover states when relevant:

- loading;
- empty;
- error;
- success;
- disabled;
- unauthorized;
- pending action.

Do not leave blank screens without explanation.

---

## Accessibility checklist

Minimum expectations:

- semantic HTML;
- one main page heading;
- labels for inputs;
- buttons with text or aria-label;
- visible focus;
- sufficient contrast;
- do not communicate status by color alone;
- meaningful error text;
- no keyboard traps.

---

## CSS Modules guidance

- Prefer semantic class names.
- Keep module files local to the component/page when possible.
- Do not move styles global unless truly shared.
- Reuse existing CSS variables if available.
- Avoid duplicated spacing/color values when a variable or existing pattern exists.
- Keep selectors simple.
- Avoid deeply nested selectors.

---

## Output expectation for local agents

When finishing a UI task, report:

- files modified;
- visual changes;
- behavioral changes;
- responsive considerations;
- accessibility considerations;
- validations executed;
- validations pending;
- risks or doubts.

Never claim the UI is final if it was not actually run or visually checked.
