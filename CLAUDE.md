<!-- @format -->

# CLAUDE.md — Session rules for Claude Code

This file is auto-loaded by Claude Code at the start of every session in this repository. Read `AGENTS.md` for full project context (stack, structure, conventions) — this file only holds the rules that are easy to forget mid-session.

## Language

- **Reply to Simon in French, in chat, always** — including summaries, wrap-ups, and status updates at the end of a turn.
- **Everything written to a file is English**: code comments, docstrings, **commit messages** (subject and body), all `.md` documentation (README, CHANGELOG, plans, this file, AGENTS.md). No exceptions. See `AGENTS.md` §6.
- Simon's own commit history is entirely in English. If you find French commit messages, they are a regression to fix (translate + rewrite history), not a style already in use — do not assume mixed-language history is the established convention.

## Accessibility is the subject, not a checkbox

This portfolio belongs to a web accessibility specialist. Simon's own SCSS is the reference — not generic web-dev conventions, which are usually mediocre on accessibility. Before writing or changing any UI/SCSS:

1. Find the equivalent existing component in his code.
2. Copy its **architecture** (units, hover/focus/active states, zoom handling, i18n) — not literal old lines, which may carry legacy debt.
3. Concretely: **rem/em everywhere, never px**, except the rare existing cases already in his code (do not imitate those; flag any px found instead of propagating it).
4. Never a floating `position: fixed` trigger/button — it overlaps content at large zoom levels. His accessibility button lives in the normal document flow (in the header).

When in doubt between "standard dev practice" and "what Simon's code already does," go with what his code does.

## Full context

See `AGENTS.md` for the tech stack, directory structure, commands, and the rest of the interaction preferences.
