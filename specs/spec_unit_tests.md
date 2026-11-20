# SPEC — Unit Tests

Status: Ready
Depends on: `spec_test_harness`
Gates: none (D1 resolved)
Findings: F-04, F-05, F-06, B-01 … B-08, C-01, Q-01, A-01
Last updated: 2026-11-20

## Context and goal

The product feature had no tests. The suite now covers the picked projection, but product search, infrastructure, UI rendering, quantity handling, and audit history are still uncovered. The existing tests cover escape, `HttpClient` happy/error, debounce, `CartItem`, `CartService`, and the `ProductService` projection.

Goal: a unit test per behavior at the lowest possible level. A unit test may use fakes for I/O and a minimal DOM only when the unit is a controller/component. Integration tests belong to `spec_integration_tests`.

## Users / actors

- Developer proving a single module's behavior.
- Agent doing test-first implementation.
- Maintainer reviewing regressions.

## User stories

- H1: As a developer, I want every domain calculation covered so money and quantities cannot regress.
- H2: As a developer, I want product search states, races, and query handling covered.
- H3: As a developer, I want infrastructure faults (URL, storage, HTTP) reproduced with fakes.
- H4: As a developer, I want UI output tested as strings for escaping and undefined values.
- H5: As a developer, I want signal re-entrancy covered.

## Functional requirements (EARS)

### Cart domain

- RF-UT-1: WHEN `CartItem` receives valid price and quantity, THE SYSTEM SHALL scale each exactly once and compute `subTotal = quantity × price` in integer units.
- RF-UT-2: WHEN a required field (`id`, `name`, `price`, `quantity`) is missing, THE SYSTEM SHALL throw a domain error.
- RF-UT-3: WHEN quantity is `0`, negative, `NaN`, or not an integer, THE SYSTEM SHALL reject it in the cart domain. The product UI clamps invalid values to `1` before emitting an intent.
- RF-UT-4: WHEN `getCartTotals` receives active and removed rows, THE SYSTEM SHALL sum only active rows and return an exact total.
- RF-UT-5: WHEN `addToCart` receives an item with the same id as an active row, THE SYSTEM SHALL merge quantity and subtotal into that row.
- RF-UT-6: WHEN `addToCart` receives an item whose id exists only in removed rows, THE SYSTEM SHALL create a new active row.
- RF-UT-7: WHEN `removeFromCart` is called for an active row, THE SYSTEM SHALL set `isDisabled: true` and preserve `quantity`, `price`, and `subTotal` for on-screen history.
- RF-UT-8: WHEN a removed row is re-added, THE SYSTEM SHALL preserve the removed row and append a new active row.
- RF-UT-9: WHEN cart values are displayed, THE SYSTEM SHALL format them through `src/shared/utils/moneyFormatter.js` and one scale.
- RF-UT-10: WHEN `cleanCart` or purchase runs, THE SYSTEM SHALL delete all rows, including history.

### Product application

- RF-UT-11: THE SYSTEM SHALL start the product state in `IDLE` with an empty list.
- RF-UT-12: WHEN `search` starts a valid query, THE SYSTEM SHALL set `LOADING`, then `SUCCESS` with products.
- RF-UT-13: WHEN the repository returns no products, THE SYSTEM SHALL set `EMPTY`.
- RF-UT-14: WHEN the repository rejects, THE SYSTEM SHALL set `ERROR` and keep the app alive.
- RF-UT-15: WHEN an older request resolves after a newer one, THE SYSTEM SHALL ignore the older response.
- RF-UT-16: WHEN the query is cleared while a request is in flight, THE SYSTEM SHALL ignore the in-flight response.
- RF-UT-17: WHEN `search` receives surrounding whitespace, THE SYSTEM SHALL pass the trimmed query to the repository.
- RF-UT-18: WHEN the query is empty after trimming, THE SYSTEM SHALL NOT call the repository.
- RF-UT-19: WHEN `clearProducts` runs, THE SYSTEM SHALL reset products, status, last query, and accept no stale response.
- RF-UT-20: WHEN `setPickedIds` receives a different id set, THE SYSTEM SHALL update the picked cache and emit only the ids whose membership changed. WHEN the set is unchanged, THE SYSTEM SHALL emit nothing. The controller test SHALL assert that only the changed visible cards are patched.

### Infrastructure

- RF-UT-21: WHEN `ApiProductRepository` builds the search URL, THE SYSTEM SHALL encode the query with `encodeURIComponent`.
- RF-UT-22: WHEN the API response lacks `products` or returns a non-array, THE SYSTEM SHALL throw an infrastructure error.
- RF-UT-23: WHEN `LocalCartRepository` reads invalid JSON, THE SYSTEM SHALL return `[]`.
- RF-UT-24: WHEN `LocalCartRepository` reads a non-array JSON value, THE SYSTEM SHALL return `[]`.
- RF-UT-25: WHEN `LocalCartRepository` is constructed, THE SYSTEM SHALL accept an injected storage object instead of reading global `localStorage`.
- RF-UT-26: WHEN `HttpClient` receives a non-ok response, THE SYSTEM SHALL throw an error containing `status` and `statusText`.
- RF-UT-27: WHEN `HttpClient` receives a JSON body option, THE SYSTEM SHALL send the JSON body and the `Content-Type` header.
- RF-UT-28: WHEN a fetch rejects, THE SYSTEM SHALL propagate the error.

### Shared

- RF-UT-29: WHEN a listener subscribes, THE SYSTEM SHALL call it immediately with the current value and return an unsubscribe function.
- RF-UT-30: WHEN a listener changes the same signal during notification, THE SYSTEM SHALL NOT deliver a stale value to a later listener.
- RF-UT-31: WHEN `escapeHTML` receives `& < > " '`, THE SYSTEM SHALL escape every character.
- RF-UT-32: WHEN `debounce` receives rapid calls, THE SYSTEM SHALL execute only the last call with its arguments.

### UI components (string-level)

- RF-UT-33: WHEN `ProductCard` renders a title with quotes or HTML, THE SYSTEM SHALL escape the visible title and the `alt` attribute.
- RF-UT-34: WHEN a product has no usable dimensions, THE SYSTEM SHALL NOT render `width`/`height` attributes or `undefined` values.
- RF-UT-35: THE SYSTEM SHALL NOT render `aria-pressed` on the product add button or the cart remove button.
- RF-UT-36: WHEN `ProductCard` renders the quantity input, THE SYSTEM SHALL include a label, `min`, `max`, `value`, and the data attribute used by the controller.
- RF-UT-37: WHEN optional brand, rating, or category fields are absent, THE SYSTEM SHALL NOT print `undefined`.
- RF-UT-38: WHEN `CartRow` renders a name from the API or storage, THE SYSTEM SHALL escape it and render active/removed states correctly.
- RF-UT-39: WHEN `Totals` renders totals, THE SYSTEM SHALL format them with the shared money formatter.
- RF-UT-40: WHEN `CheckoutActions` renders buttons, THE SYSTEM SHALL escape dynamic text and apply the disabled state.

## Non-functional requirements

- Unit tests use fakes, not the network or real browser storage.
- No test depends on another test's state or execution order.
- Each test name states the behavior, not the implementation.
- Tests run in the browser with the existing harness and no new dependency.
- Test files mirror the source layer: `test/features/...`, `test/shared/...`.

## Expected current failures

These are expected until the dependent spec is implemented; recording them is part of the audit.

| Requirement | Current result | Reason |
|---|---|---|
| RF-UT-3 | Fail | `CartItem` accepts `0` quantity |
| RF-UT-7 / RF-UT-8 / RF-UT-10 | Fail or partial | `removeFromCart` zeroes quantity; `cleanCart` deletes all |
| RF-UT-17 | Fail | `search` passes raw `query`, not `normalizedQuery` |
| RF-UT-21 | Fail | URL concatenates the raw query |
| RF-UT-23 / RF-UT-24 / RF-UT-25 | Fail | No array validation; global `localStorage` |
| RF-UT-26 | Fail | Error message uses `response.text` |
| RF-UT-30 | Fail | `notify` captures the value before the loop |
| RF-UT-33 | Fail | `alt="${title}"` |
| RF-UT-34 | Fail | `width`/`height` from `dimensions` |
| RF-UT-35 | Pass | `aria-pressed` removed from `ProductCard` and `CartView` |
| RF-UT-20 | Partial | The diff signal is covered; the controller patch is pending |

## Edge cases

- Empty string, whitespace-only query, `&`, `?`, `#`, `%`, Unicode.
- `0`, negative, decimal, `NaN`, and empty quantity.
- Duplicate ids, removed-then-readded ids, disabled rows in totals.
- Storage values `'{bad'`, `'{}'`, `'null'`, `'[]'`, `'"text"'`, `'0'`.
- HTTP error with empty `statusText`; fetch network rejection.
- Signal listener that unsubscribes itself or adds another listener during notification.
- Product title with `x" onerror="alert(1)` and `<script>`.
- Product with missing optional fields.

## Out of scope

- Controller wiring and the bounce; see `spec_integration_tests`.
- Composition extraction; see `spec_composition`.
- Browser E2E and persistence reload; see `spec_integration_tests`.
- Full on-screen history implementation; see `spec_cart_audit_history`.

## Completion criteria

- Every `RF-UT-*` has at least one test.
- A test fails before its dependent fix and passes after it.
- The suite is independent and order-agnostic.
- Coverage includes `ProductService`, `ApiProductRepository`, `LocalCartRepository`, `HttpClient`, `createSignal`, `ProductCard`, `CartRow`, `Totals`, and `CheckoutActions`.
- No test uses real `localStorage`, real `fetch`, or the network.

## Traceability

| Finding | Requirements |
|---|---|
| F-04 | RF-UT-3, RF-UT-36 |
| F-05 | RF-UT-1, RF-UT-4, RF-UT-9, RF-UT-34 |
| F-06 | RF-UT-29, RF-UT-30 |
| B-01 | RF-UT-33 |
| B-02 | RF-UT-11 … RF-UT-16 (removal with missing product) |
| B-03 | RF-UT-17, RF-UT-18, RF-UT-21 |
| B-04 | RF-UT-23 … RF-UT-25 |
| B-05 | RF-UT-34 |
| B-06 | RF-UT-26 |
| B-07 | RF-UT-35 |
| B-08 | RF-UT-26 |
| C-01 | RF-UT-11 … RF-UT-20 |
| Q-01 | RF-UT-3 |
| A-01 | RF-UT-7 … RF-UT-10 |

## Open questions

- [DECISION, non-gating] Should the quantity test suite also cover the clamp helper, or only `CartItem` rejection? Recommendation: cover both, because the UI policy and the domain invariant are separate.
