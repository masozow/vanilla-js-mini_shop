# SPEC — Verified Bug Fixes and Regression Guards

Status: In progress
Depends on: `spec_test_harness`
Gates: none
Findings: B-01 … B-08, F-06, F-04
Last updated: 2026-11-20

## Context and goal

The audit found eight verified bugs. One (`console.dir` before the guard) was fixed in commit `85b32cb`; it still needs a regression guard. The rest are open. Some are correctness bugs, some are security bugs, and some are test-quality bugs that hide the others.

Goal: one failing regression test per bug, one minimal fix, and no unrelated refactors in the same task.

## Users / actors

- End user affected by broken search, unsafe HTML, or a dead cart.
- Developer relying on a trustworthy test suite.

## User stories

- H1: As a user, I want a product title containing quotes/HTML not to execute code.
- H2: As a user, I want a search with `&` or spaces to reach the API as one query.
- H3: As a user, I want a corrupt cart in storage not to kill the cart panel.
- H4: As a user, I want product images not to render `undefined` dimensions.
- H5: As a developer, I want error messages to contain the HTTP status text.
- H6: As a screen-reader user, I do not want a static, misleading `aria-pressed`.

## Functional requirements (EARS)

### B-01 — Unescaped `alt`

- RF-BF-1: WHEN a product title contains quotes or HTML, THE SYSTEM SHALL escape it in the `alt` attribute and the visible card text.
- RF-BF-2: THE SYSTEM SHALL render `alt="${esc(title)}"` (or an equivalent escaped interpolation) in `ProductCard`.

### B-02 — `console.dir` before the guard

- RF-BF-3: WHEN the clicked product is not in the current results, THE SYSTEM SHALL return without reading `clickedProduct.picked`.
- RF-BF-4: THE SYSTEM SHALL keep a regression test that removes a cart item whose product is not in the current results and asserts no exception.
- RF-BF-5: THE SYSTEM SHALL NOT contain debug `console.dir` in `ProductService`.

### B-03 — Query trimming and encoding

- RF-BF-6: WHEN the user searches `"  iphone 5s & x  "`, THE SYSTEM SHALL pass the trimmed query to the repository.
- RF-BF-7: WHEN the repository builds the URL, THE SYSTEM SHALL encode the query with `encodeURIComponent` so `&` is not a new parameter.
- RF-BF-8: WHEN the query is empty after trimming, THE SYSTEM SHALL NOT call the repository.

### B-04 — Corrupt cart storage

- RF-BF-9: WHEN stored cart JSON is invalid, THE SYSTEM SHALL return an empty array and log the error.
- RF-BF-10: WHEN the parsed value is not an array, THE SYSTEM SHALL return an empty array.
- RF-BF-11: WHEN storage is missing or `null`, THE SYSTEM SHALL return an empty array.
- RF-BF-12: WHEN the cart boots with corrupt storage, THE SYSTEM SHALL keep the product feature and the cart panel usable.

### B-05 — Image dimensions

- RF-BF-13: THE SYSTEM SHALL NOT render `width` or `height` attributes derived from `Product.dimensions` on product images.
- RF-BF-14: THE SYSTEM SHALL rely on the CSS `height: 6rem` reservation for layout stability.
- RF-BF-15: THE SYSTEM SHALL NOT render `width="undefined"` or `height="undefined"`.

### B-06 — `HttpClient` error message

- RF-BF-16: WHEN an HTTP response is not ok, THE SYSTEM SHALL include `response.status` and `response.statusText` in the thrown error.
- RF-BF-17: THE SYSTEM SHALL NOT interpolate `response.text` (a function) into the message.

### B-07 — Product `aria-pressed`

Status: Resolved in `ProductCard` and the cart row update path; regression test pending.

- RF-BF-18: THE SYSTEM SHALL remove `aria-pressed` from the product add button because it is not a toggle.
- RF-BF-19: WHEN a product is in the cart, THE SYSTEM SHALL communicate that through the card class and button text, not through a static ARIA state.
- RF-BF-26: THE SYSTEM SHALL NOT set `aria-pressed` on the cart row remove button, because removal is an action, not a toggle.

### B-08 — `HttpClient` error test

- RF-BF-20: WHEN `HttpClient` does not throw on a failing response, THE SYSTEM SHALL fail the test.
- RF-BF-21: THE SYSTEM SHALL assert the full `Status: 500 - Server error` fragment, not only the error prefix.
- RF-BF-22: THE SYSTEM SHALL use `silenced()` only around the call and capture the error outside it.

### Related regression guards

- RF-BF-23: THE SYSTEM SHALL NOT contain a debug `console.log` in `CartService.removeFromCart`.
- RF-BF-24: WHEN `createSignal` notifies listeners, THE SYSTEM SHALL NOT deliver a stale captured value to a later listener. (See `spec_unit_tests` RF-UT-26.)
- RF-BF-25: THE SYSTEM SHALL remove the old product-picked channel (`lastPickedProductSignal`, `onProductPicked`, `pickProductQuantity`) and SHALL replace it with the cart projection; the regression guard SHALL assert the channel is absent. (See D1 in `spec_composition`.)

## Non-functional requirements

- Each bug has a test that fails on the current code and passes after the fix.
- The escaping test uses a payload such as `x" onerror="alert(1)`.
- The query test captures the URL passed to `fetch`/the HTTP client.
- The storage test uses an injected fake storage, not the real browser storage.
- The `HttpClient` test asserts both throwing and message content.

## Edge cases

- Query with leading/trailing spaces, `&`, `?`, `#`, `%`, and Unicode.
- Stored values: `'{bad'`, `'{}'`, `'null'`, `'[]'`, `'"text"'`, `'0'`.
- Product title with quotes, `<script>`, and `&`.
- Product without `dimensions` or with an empty object.
- HTTP error with empty `statusText`.
- A test that forgets to assert after a `try/catch`; the B-08 fix must catch that.

## Out of scope

- Refactoring the mapper or composition; see `spec_composition` and `spec_architecture`.
- Changing the cart audit model.
- Redesigning the product card.

## Completion criteria

- Each `RF-BF-*` is covered by a named test.
- The failing-before/passing-after evidence is recorded in this spec.
- No debug `console.dir`, `console.log`, or `width="undefined"` remains.
- No `aria-pressed` remains on the product add button or the cart remove button.
- The old `lastPicked` channel is gone; the picked projection comes from the cart.
- The `HttpClient` error test fails if the client stops throwing.
- The XSS payload does not execute and is visible as escaped text.

## Traceability

| Bug | Requirements | Test level |
|---|---|---|
| B-01 | RF-BF-1, RF-BF-2 | Unit: `ProductCard` |
| B-02 | RF-BF-3 … RF-BF-5 | Unit: `ProductService` + integration removal |
| B-03 | RF-BF-6 … RF-BF-8 | Unit: `ProductService`, `ApiProductRepository` |
| B-04 | RF-BF-9 … RF-BF-12 | Unit: `LocalCartRepository` + integration boot |
| B-05 | RF-BF-13 … RF-BF-15 | Unit: `ProductCard` |
| B-06 | RF-BF-16, RF-BF-17 | Unit: `HttpClient` |
| B-07 | RF-BF-18, RF-BF-19, RF-BF-26 | Unit: `ProductCard`, `CartView` |
| B-08 | RF-BF-20 … RF-BF-22 | Unit: `HttpClient` |
| Debug log | RF-BF-23 | Unit/architecture |
| Signal re-entrancy | RF-BF-24 | Unit: `createSignal` |
| Empty picked payload | RF-BF-25 | Unit/controller |

## Open questions

None. `aria-pressed` is removed, and D4 is resolved in `spec_product_quantity` as clamp-to-1 at the UI with domain rejection.
