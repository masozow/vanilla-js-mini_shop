# AGENTS.md — vanilla-js-mini_shop

> Entry point for any agent or contributor. Read this file, `docs/constitution.md`, and the active spec before touching code.
>
> Status: Active
> Last updated: 2026-11-20
> Baseline: branch `dev`, commit `2f216a9` plus the documentation changes in this working tree.

## 1. What this project is

A small shopping cart exercise built with vanilla JavaScript, HTML, and CSS. It has three independent features:

- **Product**: debounced search against DummyJSON, loading/empty/error states, out-of-stock handling, and an add-to-cart action.
- **Cart**: local-only state persisted in `localStorage`, merging repeated lines, exact integer money, and a retained history of additions and removals for audit.
- **Checkout**: purchase and clear actions derived from the cart state.

The architecture is layered per feature (`domain`, `application`, `infrastructure`, `ui`). Features must not import each other. Shared code lives in `src/shared`. Composition belongs outside the features.

The project is intentionally beyond the original README in two places:

- Product cards keep a quantity input and behave like a supermarket cart.
- The cart keeps an audit history of additions and removals.

## 2. Commands

| Purpose | How |
|---|---|
| Serve the app | Open the repository in VS Code and run Live Server (port `5500`, per `.vscode/settings.json`), or use any static file host. No Python, Node.js, or build step. |
| Run tests | Uncomment the last line of `src/main.js` (`await import('./shared/test/index.js')`) and reload the served page. The suite prints `[PASS]`/`[FAIL]` and `report()` throws on failure. |
| Run tests from DevTools | On the served page: `await import('/src/shared/test/index.js')`. |
| Run harness meta-test | In `src/shared/test/index.js`, uncomment `await import('./harness.test.js');` and reload. It proves the harness catches a deliberate failure without turning the suite red. |
| Architecture check: `shared` must not import features | Editor search, or `grep -rn "features/" src/shared --include=*.js` excluding `src/shared/test/`. |
| Architecture check: feature-to-feature imports | Editor search, or `grep -rn "from .*features/" src/features --include=*.js`. |
| Lint / format | Not configured. Do not add a linter or formatter without approval. |

Requirements: a current browser and a static file host only. The app is native ES modules; there is no package manager, no Node.js runtime, no Python, and no build step.

> The harness records every failure, prints a summary, and `report()` throws an `AggregateError` when anything failed. There is no `test.html`; the suite is one commented import at the bottom of `src/main.js`. The meta-test import stays commented in `src/shared/test/index.js`.

## 3. Repository map

```
.
├── AGENTS.md                  # This entry point
├── docs/
│   └── constitution.md        # Non-negotiable project principles
├── specs/
│   ├── spec_test_harness.md
│   ├── spec_unit_tests.md
│   ├── spec_integration_tests.md
│   ├── spec_composition.md
│   ├── spec_architecture.md
│   ├── spec_product_quantity.md
│   ├── spec_cart_audit_history.md
│   └── spec_bug_fixes.md
├── _refs/                     # Read-only SDD reference material
├── index.html
├── css/styles.css
└── src/
    ├── main.js                # Composition root (target: DOM + module creation + connectors only)
    ├── composition/           # Composition root, connectors, and cross-feature adapters
    ├── features/
    │   ├── product/{application,domain,infrastructure,ui}
    │   ├── cart/{application,domain,infrastructure,ui}
    │   └── checkout/{application,domain,ui}
    └── shared/{dictionaries,infrastructure,store,ui,utils,test}
```

## 4. Constitution

The constitution lives in `docs/constitution.md`. It is short and non-negotiable. Summary:

**Architecture and design**

1. Vanilla platform only: ES modules, HTML, CSS, browser-run app and tests. No frameworks, libraries, bundlers, build step, package manager, Node.js, or Python.
2. DDD: domain first, ubiquitous language, business rules in `domain`, no UI/storage/HTTP knowledge there.
3. Hexagonal: application defines ports, infrastructure and UI are adapters, dependencies point inward.
4. TDD: red, green, refactor; every behavior change starts with a failing test.
5. DRY: one source of truth, no duplicated rules or scales, no premature deduplication.
6. KISS: the simplest design that satisfies the active spec, no speculative abstraction.
7. SOLID and Clean Code: one reason to change per function, small ports, dependency inversion, no dead code or debug leftovers.

**Naming and human-readable decisions**

8. Names are for humans: full descriptive names (`escapeHTML`, `removeFromCart`), no vague verbs or cryptic abbreviations.
9. Comments explain the why, the trade-off, and how to fix the code. `CartService` is the reference.
10. Every change has a traceable path: input → controller → application → domain → adapter, no hidden jumps or double writes.

**Invariants**

11. Feature isolation and one owner per fact: `product`, `cart`, and `checkout` never import each other; composition lives outside features; other features receive explicit input ports, not duplicated truth.
12. Inject dependencies: `fetch`, storage, repositories, clocks, callbacks. Domain and application never touch the DOM or browser globals.
13. Exact money: integer scaling, one set of scale constants, no floating-point totals.
14. Untrusted input is escaped everywhere: API, storage, and user text.
15. English only: code, identifiers, comments, docs, tests, and commit messages.

## 5. SDD workflow

This repository follows the Spec-Driven Development flow described in `_refs/README(1).md` and `_refs/prompts.md`:

```
Constitution → Spec → Clarification → Plan → Tasks → Implementation → Validation → Change
```

Rules:

1. **No code before an active spec.** Read `docs/constitution.md` and the relevant `specs/spec_*.md` first.
2. **Clarify before planning.** If a spec has open questions that affect behavior, ask one question at a time. Do not invent behavior.
3. **Plan before tasks.** A plan is not stored in this repository yet; produce one in the conversation for the active spec before editing code.
4. **Tasks are small and verifiable.** Each task must have a "Done when:" line and must be test-first.
5. **Implement one task at a time.** Run the suite, report the result, mark the task, and stop.
6. **Validate against requirements.** Walk the spec's `RF-*` IDs and state which test covers each one.
7. **Changes start in the spec.** If a requirement changes, update the spec first and show the diff.

## 6. Spec index

Read the specs in this order unless a dependency says otherwise.

| Order | Spec | Purpose | Depends on | Gate | Status |
|---|---|---|---|---|---|
| 1 | `specs/spec_test_harness.md` | Trustworthy runner, matchers, isolated tests | — | — | Implemented |
| 2 | `specs/spec_architecture.md` | Layering rules, dependency checks, domain hygiene | Harness | — | In progress |
| 3 | `specs/spec_bug_fixes.md` | Verified bugs and regression tests | Harness | — | In progress |
| 4 | `specs/spec_unit_tests.md` | Domain, application, infrastructure, shared, UI string tests | Harness | — | Ready |
| 5 | `specs/spec_composition.md` | Composition root, connectors, one-way projections, surgical updates | Architecture | — | Ready |
| 6 | `specs/spec_integration_tests.md` | Controller/wiring integration, bounce, persistence, browser harness | Composition | — | Ready |
| 7 | `specs/spec_product_quantity.md` | Quantity input contract and validation | Composition, Unit tests | — | Ready |
| 8 | `specs/spec_cart_audit_history.md` | Add/remove history and persistence | Architecture, Unit tests | — | Ready |

`Implemented` means the spec is covered and verified. `In progress` means part of it is implemented. `Ready` means the decisions are resolved and implementation can start. `Blocked` means an open decision in section 14 must be resolved first.

## 7. Finding registry

Use these IDs in specs, tests, commits, and validation reports.

| ID | Finding | Primary spec |
|---|---|---|
| F-01 | `src/shared/mappers/ProductToCart.mapper.js` imports `cart/domain/CartItem.js`. | `spec_architecture` |
| F-02 | Duplicate `picked` truth and the `removeFromCart` bounce through `onRemoveItemIntent`. | `spec_composition`, `spec_integration_tests` |
| F-03 | Flow logic and TDZ-risk closures inside `main.js`. | `spec_composition` |
| F-04 | Quantity travels through the DOM; service signatures must not ignore it. | `spec_product_quantity` |
| F-05 | Domain/UI leaks: `Product.picked` and `dimensions`, `CartItemNumbersToRender`, repeated money scale. | `spec_architecture` |
| F-06 | `createSignal` re-entrancy and stale `cartItems` snapshot. | `spec_unit_tests`, `spec_bug_fixes` |
| B-01 | `alt="${title}"` is not escaped. | `spec_bug_fixes` |
| B-02 | `console.dir` read `clickedProduct.picked` before the guard (fixed in `85b32cb`; keep a regression guard). | `spec_bug_fixes` |
| B-03 | Query is not trimmed/encoded: `iphone 5s & x` becomes two parameters. | `spec_bug_fixes` |
| B-04 | Corrupt or non-array `localStorage` makes the cart unusable. | `spec_bug_fixes` |
| B-05 | `height`/`width` use the misspelled `heigth` and render `undefined`. | `spec_bug_fixes` |
| B-06 | `HttpClient` prints `response.text` instead of `statusText`. | `spec_bug_fixes` |
| B-07 | Product `aria-pressed` stays `false` and the button is not a toggle. | `spec_bug_fixes` |
| B-08 | `HttpClient` error test passes when no error is thrown and does not detect B-06. | `spec_bug_fixes` |
| T-01 | Test runner swallows failures and reports a false green run. | `spec_test_harness` |
| T-02 | `CartService` tests share mutable state and depend on order. | `spec_test_harness` |
| C-01 | Product feature has no tests. | `spec_unit_tests` |
| C-02 | `main.js` wiring has no tests. | `spec_integration_tests` |
| A-01 | Cart history is a partial soft delete: `removeFromCart` zeroes the removed quantity, so the on-screen history loses what was removed. | `spec_cart_audit_history` |
| Q-01 | Quantity validation is absent (0, negative, `NaN`, empty). | `spec_product_quantity` |

## 8. Locked decisions

| ID | Decision |
|---|---|
| L-01 | The quantity input stays on product cards. This is intentionally beyond the original README. |
| L-02 | The cart keeps removed rows visible on screen with `isDisabled: true`. It is an on-screen history, not a backend audit trail. |
| L-03 | No frameworks, libraries, bundlers, or build step. |
| L-04 | All code, comments, docs, tests, and commit messages are in English. |
| L-05 | Features do not import each other; composition is outside features. |
| L-06 | Checkout is part of the app even though the original README excludes it. |
| L-07 | Tests come first. A behavior change without a spec update and a regression test is incomplete. |
| L-08 | Untrusted text is escaped; money is integer-scaled; errors are logged with `console.error`, not `console.log`. |
| L-09 | `isDisabled` is the only active/removed status. No `status` field and no timestamps. |
| L-10 | The test suite runs from the commented dynamic import at the bottom of `src/main.js`; there is no test page. |
| L-11 | Invalid quantity clamps to `1` at the UI; `CartItem` rejects non-positive and non-integer quantities. |
| L-12 | The requested quantity is capped at `product.stock`. |
| L-13 | Purchase and clear delete the whole local cart, including history. |
| L-14 | The `picked` projection is an application read model in `ProductService`. The cart connector is its only writer, and it emits only the ids whose membership changed so the UI patches surgically. |
| L-15 | The product-to-cart translation is a composition adapter (`toCartLine`). `shared` never imports a feature, and `CartService` builds its own `CartItem` from the plain line. |

## 9. Working protocol for any agent

Before work:

1. Read this file and `docs/constitution.md`.
2. Read the active spec and its dependency specs.
3. Confirm the gate decisions for that spec are resolved. If not, ask.
4. Produce a short plan: files, tests, expected failure, fix, verification.
5. Do not edit code until the plan is accepted.

During work:

1. Write the failing test first. Run it and capture the failure.
2. Implement the smallest change that makes it pass.
3. Run the full suite. If the harness is still the old one, state explicitly that it may report a false green result.
4. Run the architecture checks.
5. For UI/integration changes, perform the manual browser check listed in the spec.
6. Do not fix unrelated findings in the same task.

After work:

1. Report: requirement IDs covered, tests added, commands run, results, and files changed.
2. Update the active spec with status and evidence.
3. Mark the task done and stop. Do not start the next spec without instruction.

## 10. Definition of done

A task is done only when all of the following are true:

- The relevant `RF-*` IDs are implemented or tested.
- A test existed and failed before the fix, then passed after it.
- The full suite reports zero failures (green summary) and does not throw.
- Architecture checks pass.
- The manual browser flow passes for UI or wiring changes.
- No debug `console.log` remains.
- The active spec is updated with evidence.
- The change stays inside its feature or composition boundary.

## 11. Hard rules and limits

- Do not add runtime dependencies, frameworks, or a build step.
- Do not add a test dependency without approval. Use the existing browser harness loaded from the commented import in `src/main.js`; do not add a test page, Node.js, Python, a package manager, or a bundler.
- Keep JSDoc on every exported harness function and on non-obvious production functions. Comments must explain the reasoning and the path to a fix, following the `CartService` style.
- Do not import one feature from another.
- Do not import a feature from `src/shared`.
- Do not put business logic in `main.js`; it is a composition root.
- Do not read `localStorage`, `window`, or `document` from domain or application code.
- Do not add `console.log` to production paths.
- Do not change `_refs/`; it is reference material only.
- Do not change behavior without a spec update.
- Do not mix findings from different specs in one task.

## 12. Reference material (`_refs/`)

`_refs/` is read-only. Use it as the source of the SDD templates and workflow:

- `_refs/AGENTS.md`: template for this file.
- `_refs/spec.md`: template for every spec (context, actors, stories, EARS requirements, edge cases, out of scope, completion, open questions).
- `_refs/prompts.md`: phase prompts and the one-task-at-a-time protocol.
- `_refs/README(1).md`: SDD course overview and artifact flow.
- `_refs/sdd.excalidraw`: board with the SDD flow, EARS patterns, and phase definitions.

The app documentation is English. Do not copy Spanish template text into code, tests, or new docs.

## 13. Current baseline and known state

- The suite reports 18 tests through `src/shared/test/index.js`; the commented meta-test adds 9 harness tests when uncommented. There is no Node.js or Python step.
- `miniTest.js` now records failures, prints a `[PASS]`/`[FAIL]` summary, throws an `AggregateError` from `report()`, provides `toEqual`/`toContain`/`toInclude`/`toThrow`/`toThrowAsync`/`not`, scoped `beforeEach`/`afterEach`, `runIsolated`, `spy`, `deferred`, `fakeStorage`, `fakeFetch`, and JSDoc on every exported function.
- `CartService` tests now create a fresh repository and service before each test, so they no longer depend on order.
- `src/shared/utils/moneyFormatter.js` owns `formatCartItemNumbers` and `formatCartTotals`; `cart/domain` no longer contains display formatting.
- `aria-pressed` was removed from the product add button and the cart row update path.
- The `picked` projection now emits a diff through `onPickedProductsChange`; `ProductController` does not subscribe yet, so the legacy `lastPickedProductSignal` path still repaints cards.
- Removing a cart item can call `removeFromCart` twice when the removed product is still in the current search results and its card is in the DOM. If the product is not in the results, the bounce does not occur. This conditional behavior must be covered by integration tests.
- The cart keeps rows with `isDisabled: true`, but `removeFromCart` still zeroes the removed quantity and `cleanCart` erases the history. The on-screen history behavior in `spec_cart_audit_history` is pending implementation.
- Quantity validation is pending: the input still reaches the cart without clamping, and `pickProductQuantity` still drops `quantity`.
- `src/composition/` does not exist yet; the target shape is defined in `specs/spec_composition.md`.
- `ProductCard` still has the unescaped `alt` and the `width`/`height` bug.
- `LocalCartRepository` uses global `localStorage`; injecting storage is a prerequisite for corrupt-storage tests.
- There is no linter, formatter, or CI configuration.

## 14. Open decisions

No decisions are open. D1 is resolved below; the rest are locked in section 8.

### Resolved decisions

| ID | Resolution |
|---|---|
| D1 | `ProductService` owns the `picked` cache as a read model. The cart connector is its only writer; `setPickedIds` emits only the symmetric difference, and the controller patches only the changed cards. |
| D2 | `isDisabled` boolean is the only active/removed status. No timestamps, no `status` field, no migration. |
| D3 | No test page. The suite runs from the commented dynamic import in `src/main.js`; Playwright only if CI is added later. |
| D4 | Invalid quantity clamps to `1` at the UI; `CartItem` rejects non-positive and non-integer quantities. |
| D5 | The requested quantity is capped at `product.stock`. |
| D6 | Purchase and clear delete the whole local cart, including history; the backend confirmation happens first. |
