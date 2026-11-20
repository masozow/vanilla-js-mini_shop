# SPEC — Integration Tests and the Bounce

Status: Ready
Depends on: `spec_composition`
Gates: none (D3 resolved)
Findings: F-02, F-03, C-02, B-04
Last updated: 2026-11-20

## Context and goal

Unit tests prove that each function behaves when called. They cannot prove that one user action produces exactly one command across modules. The `removeFromCart` bounce is the clearest example: `CartService` writes once per call, `ProductService` emits when called, `CartController` calls both a command and an intent, and `ProductController` calls the intent back. The defect emerges only from their composition.

The bounce is also conditional: it occurs only when the removed product is still in the current search results and its card is in the DOM. A test of a single service cannot reproduce that condition.

Goal: an integration suite that uses real controllers, real services, and real wiring, fakes only I/O (network/storage), and asserts cross-module invariants such as "one click → one write" and "the card is patched, not re-rendered".

## Users / actors

- Developer reproducing a cross-module defect.
- Agent validating composition changes.
- Maintainer preventing regressions.

## User stories

- H1: As a user, I want one remove action to produce one cart write and one audit entry.
- H2: As a user, I want removing a product visible in results to unpick its card immediately.
- H3: As a user, I want removing a product that is not in results to keep working without errors.
- H4: As a user, I want the cart history to survive reload.
- H5: As a user, I want a corrupt cart in storage not to break the page.

## Definition of integration in this repo

A test is integration when it uses:

- real controllers (`CartController`, `ProductController`, `CheckoutController`),
- real services (`CartService`, `ProductService`, `CheckoutService`),
- real wiring (connectors or the composition root),
- fake I/O only: storage, `fetch`/repository responses.

If a test mocks the wiring or the card lookup, it is the wrong level for the bounce.

## Harness (D3 resolved)

There is no separate `test.html`. Integration cases live in the same browser suite as the unit tests and run when the developer uncomments the last line of `src/main.js`:

```js
// await import('./shared/test/index.js');
```

This gives the cases a real DOM, real events, and real `localStorage`. `report()` prints the final summary.

| Option | Status | Why |
|---|---|---|
| A. Existing browser suite via the commented `src/main.js` import | Chosen | Real DOM and no extra entry point; matches the unit-test workflow. |
| B. Manual browser checklist | Fallback | Useful for a quick demo, but not repeatable. |
| C. Playwright | Later | Only if CI automation is needed; it would add a dev dependency. |

Do not use a fake DOM in Node: the project has no Node.js runtime and the bounce depends on real DOM lookup.

## Functional requirements (EARS)

### Bounce

- RF-IT-1: WHEN a cart row is removed and its product is visible in the current results, THE SYSTEM SHALL call `removeFromCart` exactly once.
- RF-IT-2: WHEN a cart row is removed and its product is not in the current results, THE SYSTEM SHALL call `removeFromCart` exactly once and SHALL NOT throw.
- RF-IT-3: WHEN a cart row is removed, THE SYSTEM SHALL persist exactly one cart state update.
- RF-IT-4: WHEN a visible product card is removed from the cart, THE SYSTEM SHALL unpick that card.
- RF-IT-5: WHEN a cart row is removed, THE SYSTEM SHALL NOT emit a product intent that calls the cart back.
- RF-IT-6: WHEN a product is added from a card, THE SYSTEM SHALL call `addToCart` once with the explicit quantity.

### Surgical update

- RF-IT-7: WHEN the cart changes and the product grid is visible, THE SYSTEM SHALL patch only the affected cards.
- RF-IT-8: WHEN a card is patched, THE SYSTEM SHALL preserve the DOM node identity of every card, including the patched one.
- RF-IT-9: WHEN a card is patched, THE SYSTEM SHALL preserve the quantity input value of cards that were not affected.
- RF-IT-10: WHEN the same cart state is emitted again, THE SYSTEM SHALL NOT change the DOM a second time.

### Persistence and boot

- RF-IT-11: WHEN the page reloads with an existing cart, THE SYSTEM SHALL restore active rows and history.
- RF-IT-12: WHEN the stored cart is corrupt or not an array, THE SYSTEM SHALL boot with an empty cart and a usable product feature.
- RF-IT-13: WHEN a removed row exists in storage, THE SYSTEM SHALL render it as `isDisabled` history and exclude it from totals.

### Checkout flow

- RF-IT-13: WHEN a removed row exists in storage, THE SYSTEM SHALL render it as `isDisabled` history and exclude it from totals.
- RF-IT-14: WHEN purchase succeeds, THE SYSTEM SHALL delete all cart rows, including history.
- RF-IT-15: WHEN clear is clicked, THE SYSTEM SHALL delete all cart rows without clearing product search results.
- RF-IT-16: WHEN the cart is empty, THE SYSTEM SHALL disable purchase and clear actions.

### Harness

- RF-IT-17: THE SYSTEM SHALL run the integration cases from `src/shared/test/index.js` through the commented `src/main.js` import, with a real DOM and no separate test page.
- RF-IT-18: THE SYSTEM SHALL print PASS/FAIL per case and a final summary through `report()`.
- RF-IT-19: THE SYSTEM SHALL isolate cases: fresh services, fresh storage, and a reset DOM.
- RF-IT-20: THE SYSTEM SHALL allow running both bounce cases (visible/not visible) as separate named cases.
- RF-IT-21: WHEN the page reloads with an active cart and a card becomes visible, THE SYSTEM SHALL render it picked from the projection cache.

## Test design

### Bounce case — visible product

Arrange:

- fake cart storage with one active row,
- fake product repository returning that product,
- real `CartService`, `ProductService`, controllers, and wiring,
- product grid rendered with a card for the product,
- cart row rendered with a remove button.

Act: click the cart remove button.

Assert:

- `setCart`/persistence called once,
- `removeFromCart` called once (spy on the public method or count storage writes),
- product card is unpicked,
- no exception.

### Bounce case — hidden product

Same setup, but search results do not contain the removed product (or the card is absent). Assert one write and no exception. Current code passes this case; the visible case is the regression.

### No re-render case

Capture the card node reference before the cart change. After the cart change, assert the same node is still in the grid and its `data-id` is unchanged. Add a marker property to the node and assert it survives.

### Reload projection case

Arrange a persisted cart with one active row and a fake product repository that returns that product. Create the modules and run a search. Assert the card is rendered with the picked class and the active button text, without requiring a cart change after the search. This proves the projection cache is applied at render time, not only on a later cart event.

### Corrupt storage boot

Use a fake storage returning `'{}'` and `'{bad'`. Instantiate the cart feature and product feature. Assert the cart renders empty, no uncaught error, and a search still works.

## Edge cases

- Product visible vs hidden.
- Product removed while search is loading.
- Two cart changes before the next render.
- Removed history rows present.
- Empty cart and empty search.
- Corrupt storage values: `'{bad'`, `'{}'`, `'null'`, `'"text"'`.
- Purchase with history rows.
- Clear with history rows.

## Out of scope

- Real network calls to DummyJSON.
- Cross-browser matrix.
- Visual regression snapshots.
- Performance benchmarking.

## Completion criteria

- Both bounce cases exist and pass.
- The visible case fails on the current code and passes after `spec_composition`.
- No-re-render is asserted by node identity.
- Corrupt storage boot and reload are covered.
- Purchase and clear delete all cart rows, including history.
- The harness runs from the commented `src/main.js` import and prints the summary.

## Traceability

| Finding | Requirements |
|---|---|
| F-02 | RF-IT-1 … RF-IT-6 |
| F-03 | RF-IT-1, RF-IT-2, RF-IT-17 |
| C-02 | RF-IT-1 … RF-IT-19 |
| B-04 | RF-IT-12 |
| F-06 | RF-IT-10 |

## Resolved decisions

- D3: no test page; integration cases run from the same browser suite through the commented `src/main.js` import.
- D2/D6: removed rows are `isDisabled` history; purchase and clear delete everything.
- D1: the picked projection is owned by `ProductService`; the cart connector writes it and the UI patches only the cards whose id changed.

## Open questions

- [DECISION] Count persistence writes via a fake repository or spy on `removeFromCart`? Recommendation: both; they catch different regressions.
