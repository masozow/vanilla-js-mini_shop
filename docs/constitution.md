# Constitution — vanilla-js-mini_shop

Status: Draft v2 — pending maintainer approval
Scope: all application code, tests, specs, and documentation.

## Architecture and design

1. **Vanilla platform only.** ES modules, HTML, and CSS. The app and its tests run in the browser. No frameworks, libraries, bundlers, build step, package manager, Node.js runtime, or Python.
2. **DDD.** Model the domain first. Business rules live in `domain`, use the project's ubiquitous language (`Product`, `CartItem`, `CartTotals`, `Order`), and know nothing about the UI, storage, or HTTP.
3. **Hexagonal architecture.** The application defines ports; infrastructure and UI are adapters. Dependencies point inward: `ui → application → domain`, and `infrastructure` implements application ports. Never the reverse.
4. **TDD.** Red, green, refactor. A behavior change starts with a failing test that expresses the desired behavior; the smallest implementation makes it pass; refactor only with the suite green.
5. **DRY.** One source of truth for every fact, rule, and constant. Do not duplicate business rules or money scales. Do not merge code that only looks similar; premature deduplication creates coupling.
6. **KISS.** Choose the simplest design that satisfies the active spec. No speculative abstraction, no pattern for its own sake, no indirection without a named reason.
7. **SOLID and Clean Code.** Small functions with one reason to change, small explicit ports, dependency inversion at the boundaries, no dead code, no debug leftovers, and a consistent style across the repository.

## Naming and human-readable decisions

8. **Names are for humans.** Use full descriptive names that state the intent: `escapeHTML`, `removeFromCart`, `calculateCartTotals`, `fetchProducts`. Do not use vague verbs (`handle`, `process`, `manage`, `do`) or cryptic abbreviations (`esc`, `calc`, `btn`). A reader must understand a call without opening its body.
9. **Comments explain the why, not the what.** Every non-obvious decision records the problem, the chosen path, the trade-off, and how to debug or fix it. `CartService` is the reference: it explains what each signal, wrapper, and closure is for and how the pieces assemble. Update the comment when the behavior changes.
10. **Every change has a traceable path.** One user action follows one visible route: input → controller → application → domain → adapter. No hidden jumps, no double writes, no two owners for the same fact. A human must be able to follow the route, locate the failing step, and fix it without guessing.

## Invariants

11. **Feature isolation and one owner per fact.** `product`, `cart`, and `checkout` never import each other; composition lives outside features. Other features receive projections through explicit input ports, and truth is never duplicated or synchronized by hand in two directions.
12. **Injected dependencies.** `fetch`, storage, repositories, clocks, and callbacks are injected. `domain` and `application` never touch the DOM or browser globals.
13. **Exact money.** Integer scaling, one set of scale constants, no floating-point totals.
14. **Untrusted input is escaped.** API, storage, and user text are escaped before rendering.
15. **English only.** Code, identifiers, comments, docs, tests, and commit messages.
