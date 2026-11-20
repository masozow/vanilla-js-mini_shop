# SPEC — Architecture, Boundaries, and Domain Hygiene

Status: In progress
Depends on: `spec_test_harness`
Gates: none
Findings: F-01, F-05, F-06, A-01
Last updated: 2026-11-20

## Context and goal

The feature boundaries are mostly correct: product, cart, and checkout do not import each other, and each feature can be deleted without breaking the others. Two structural problems remain:

1. `src/shared/mappers/ProductToCart.mapper.js` imports `features/cart/domain/CartItem.js`, so `shared` depends on a feature.
2. UI concerns leak into domain objects: `Product.picked`, `Product.dimensions`, `CartItemNumbersToRender`, and repeated money scale constants.

The audit-history requirement changes one earlier verdict: `CartItem.isDisabled` is no longer a UI leak. It is the beginning of a domain-level ledger. This spec formalizes that status so it is a deliberate domain concept, not an accidental UI flag.

Goal: enforce boundaries mechanically, move presentation out of domain, keep money scaling in one place, and make the cart audit state a first-class domain concern.

## Architectural patterns (normative)

These patterns are adopted in `docs/constitution.md` P2–P7 and apply to every spec. In this repository they mean:

| Pattern | Concrete rule |
|---|---|
| DDD | `domain` owns the business language and rules (`Product`, `CartItem`, `CartTotals`, `Order`). Application orchestrates use cases. Nothing in `domain` knows about the DOM, storage, HTTP, or the cart's neighbors. |
| Hexagonal | `application` defines the ports it needs (product repository, cart repository, callbacks). `infrastructure` and `ui` are adapters. Dependencies point inward: `ui → application → domain`; `infrastructure` implements what application asks for. |
| TDD | Every behavior change starts with a failing test in the browser harness. The fix is the smallest change that passes it. Refactor only with the suite green. |
| DRY | One owner per fact: cart truth, money scale, query normalization, escaping. Similar-looking code is not merged unless it expresses the same rule. |
| KISS | The smallest explicit design that satisfies the active spec. No generic event bus, no DI container, no abstraction with a single speculative consumer. |
| SOLID | One reason to change per module and function. Small ports instead of wide interfaces. Depend on abstractions at the boundary and invert the dependency where the domain would otherwise import infrastructure. |
| Clean Code | Intention-revealing full names, small functions, no dead code, no debug logs, no commented-out blocks, and comments that explain the why and the fix path. |

The concrete naming and comment rules are RF-AR-23 … RF-AR-27.

## Users / actors

- Maintainer reviewing architecture.
- Agent changing a feature without breaking boundaries.
- Future contributor adding a fourth feature.

## User stories

- H1: As a maintainer, I want an automated check that `shared` never imports a feature.
- H2: As a maintainer, I want each feature to be deletable/testable without the others.
- H3: As a developer, I want one money scale so cart totals cannot drift.
- H4: As an auditor, I want cart history to be a domain concept rather than a UI flag.

## Functional requirements (EARS)

### Boundaries

- RF-AR-1: THE SYSTEM SHALL keep zero imports between `product`, `cart`, and `checkout`.
- RF-AR-2: THE SYSTEM SHALL keep zero imports from `src/shared` to `src/features`.
- RF-AR-3: THE SYSTEM SHALL place cross-feature wiring only in `src/composition/` or `src/main.js`.
- RF-AR-4: THE SYSTEM SHALL keep `domain` free of browser, DOM, `fetch`, `localStorage`, and UI imports.
- RF-AR-5: THE SYSTEM SHALL keep `application` free of UI, infrastructure, and DOM imports.
- RF-AR-6: THE SYSTEM SHALL keep `ui` free of `infrastructure` imports.
- RF-AR-7: THE SYSTEM SHALL inject `fetch`, storage, repositories, and callbacks rather than reading globals.
- RF-AR-8: THE SYSTEM SHALL NOT contain debug `console.log` in production paths; `console.error` is allowed in catch blocks.
- RF-AR-9: THE SYSTEM SHALL provide an automated architecture check that fails when RF-AR-1 or RF-AR-2 is violated.
- RF-AR-10: WHEN a new feature is added, THE SYSTEM SHALL require the same layer structure and boundary checks.

### Shared mapper and composition

- RF-AR-11: THE SYSTEM SHALL remove `src/shared/mappers/ProductToCart.mapper.js`.
- RF-AR-12: THE SYSTEM SHALL expose product-to-cart mapping from `src/composition/` without importing cart internals.
- RF-AR-13: WHEN `CartService.addToCart` receives raw data, THE SYSTEM SHALL construct the `CartItem` inside the cart feature and scale exactly once.
- RF-AR-14: THE SYSTEM SHALL keep product display formatting out of the cart domain.

RF-AR-11 removes the file, not the idea: the product-to-cart translation moves to `src/composition/` as a named adapter (`toCartLine`). It produces the cart's plain input line `{ id, name, price, quantity }`, not a `CartItem`; the cart application builds its own domain object. This keeps the dependency direction inward and gives future features a reusable example of a cross-feature adapter.

### Domain hygiene

- RF-AR-15: THE SYSTEM SHALL remove `picked` from the `Product` domain model; `picked` is a presentation projection supplied by the UI or application layer.
- RF-AR-16: THE SYSTEM SHALL remove `dimensions` from the `Product` domain model unless a future image-layout requirement proves it is needed.
- RF-AR-17: THE SYSTEM SHALL move `CartItemNumbersToRender` out of `cart/domain` into `src/shared/utils/moneyFormatter.js` as `formatCartItemNumbers`.
- RF-AR-18: THE SYSTEM SHALL move `correctCartTotalsForDisplay` out of `cart/domain` into `src/shared/utils/moneyFormatter.js` as `formatCartTotals`.
- RF-AR-19: THE SYSTEM SHALL define money scale constants in exactly one module and use them everywhere.
- RF-AR-20: THE SYSTEM SHALL remove the stale `cartItems: cartSignal.get()` property from `CartService`.
- RF-AR-21: THE SYSTEM SHALL use the existing `isDisabled` boolean as the only active/removed status; `isDisabled: false` means active and `isDisabled: true` means removed. No `status` field and no timestamps are added.
- RF-AR-22: WHEN a stored row with `isDisabled` is read, THE SYSTEM SHALL keep it as-is; no migration is required because the shape does not change.

### Naming and human-readable reasoning

- RF-AR-23: THE SYSTEM SHALL use full descriptive identifiers for functions, variables, components, and parameters; vague verbs (`handle`, `process`, `manage`, `do`) and cryptic abbreviations are forbidden.
- RF-AR-24: WHEN an existing identifier is abbreviated, THE SYSTEM SHALL rename it to the full descriptive form (`esc` → `escapeHTML`) and update every call site and test.
- RF-AR-25: THE SYSTEM SHALL explain each non-obvious decision in a comment: the problem, the chosen path, the trade-off, and how to debug or fix it, following the `CartService` comment style.
- RF-AR-26: WHEN a behavior changes, THE SYSTEM SHALL update the related comment in the same change, so the explanation never describes old behavior.
- RF-AR-27: THE SYSTEM SHALL keep one visible path from input to state change: input → controller → application → domain → adapter, with no hidden jumps, double writes, or duplicated ownership.

## Non-functional requirements

- The architecture check runs as an editor search or shell `grep`, with no runtime dependency.
- Boundary violations are reported with file and line.
- Domain modules remain pure functions/factories.
- No new runtime dependency is introduced.

## Current scorecard

| Rule | Status | Evidence |
|---|---|---|
| Feature never imports another feature | Pass | 0 imports; only `main.js` composes |
| Each feature works alone (delete test) | Pass | product, cart, checkout are independent |
| `domain` has no external dependencies | Pass | domain imports only local domain modules |
| `application` has no UI/infrastructure/DOM | Pass | only `console.*` debug remains |
| `ui` has no `infrastructure` imports | Pass | — |
| `shared` has no feature imports | Fail | `shared/mappers/ProductToCart.mapper.js:1` |
| Dependencies are injected | Partial | `HttpClient`/fetch/repos yes; `LocalCartRepository` uses global `localStorage` |
| One source of truth | Partial | cart owns active ids, but the bounce and legacy `lastPicked` path remain |
| Domain is UI-free | Fail | `Product.picked`, `Product.dimensions` remain; money formatting moved to `shared/utils/moneyFormatter.js` |

## Edge cases

- A feature test imports a helper from another feature: forbidden.
- A shared utility needs a cart type: define a local shape or move the mapping to composition.
- Legacy cart rows already use `isDisabled`: keep the shape, no migration is needed.
- Money scale used in a new feature: import the single constant; do not copy `100`/`10000`.
- `console.log` added for debugging: caught in review and architecture check.
- A new helper named `calc`, `btn`, or `doStuff`: rejected by review; use `calculateCartTotals`, `checkoutButton`, `removeCartItem`.
- A comment that explains only the syntax (`// loop over items`): rejected; explain the decision and the failure mode instead.
- The explanation in a comment no longer matches the code: the change is incomplete until the comment is updated.

## Out of scope

- Rewriting the feature folder structure.
- Adding a dependency-injection container.
- Enforcing boundaries at runtime; static checks are enough.
- Changing the UI design.

## Completion criteria

- The shared mapper file is gone; the translation lives in `src/composition/` and produces a plain line. The `shared → feature` grep is empty.
- Feature-to-feature grep is empty.
- Domain no longer contains `Product.picked`, `Product.dimensions`, or display formatting.
- Cart and checkout format money through `src/shared/utils/moneyFormatter.js`; no UI imports a domain formatter.
- One money constant module exists and is used by cart calculations and formatting.
- `cartItems` is removed.
- `isDisabled` is the only active/removed status; removed rows retain their quantity and subtotal for on-screen history.
- No abbreviated or vague public identifier remains; `esc` is renamed to `escapeHTML`.
- Every non-obvious decision has a comment that states the problem, the trade-off, and the fix path.
- A reader can trace one user action from input to adapter without guessing.
- An automated architecture check exists and fails on a deliberate violation.

## Traceability

| Finding | Requirements |
|---|---|
| F-01 | RF-AR-2, RF-AR-9, RF-AR-11, RF-AR-12 |
| F-05 | RF-AR-15 to RF-AR-19 |
| F-06 | RF-AR-20 |
| A-01 | RF-AR-21, RF-AR-22 |
| Constitution P8–P10 | RF-AR-23 … RF-AR-27 |

## Resolved decisions

- D2: `isDisabled` is the only active/removed status. `false` means active, `true` means removed. No `status` field, no timestamps, no schema migration.
- Money formatting lives in `src/shared/utils/moneyFormatter.js` as `formatCartItemNumbers` and `formatCartTotals`.
- D1: the `picked` projection is an application read model in `ProductService`. The cart connector is its only writer, and it emits only the ids whose membership changed so the UI can patch surgically.
- The product-to-cart translation is a composition adapter. `shared` never imports a feature, and `CartService` builds its own `CartItem` from the plain line.

## Open questions

None for this spec. The remaining work is implementation, not clarification.
