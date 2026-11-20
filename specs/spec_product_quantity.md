# SPEC — Product Quantity Contract and Validation

Status: Ready (decisions resolved, implementation pending)
Depends on: `spec_composition`, `spec_unit_tests`
Gates: none (D4, D5 resolved)
Findings: F-04, Q-01, RF-UT-3, RF-UT-36
Last updated: 2026-11-20

## Context and goal

The original exercise adds one unit per click. This project intentionally keeps a quantity input on every product card, so the product behaves like a supermarket cart (L-01). The input exists and is rendered, but the value is not part of a real contract yet:

- `ProductCard` renders `min=${1}`, `value=${1}`, and `max=${stock}` with no label wiring beyond `for="quantity-${id}"`.
- `ProductController.pickProduct` reads `Number(input.value)` and calls `pickProductQuantity({ productId, quantity })`.
- `ProductService.pickProductQuantity` destructures only `productId` and `isPicked`; the quantity is dropped (F-04).
- The picked listener in `ProductController` reads the quantity from the DOM a second time and forwards it to `onProductPickedIntent`.
- `mapProductToCartItem` passes the quantity to `CartItem`, which scales it by `100` and computes `subTotal = scaledQuantity × scaledPrice`.
- There is no validation. `0`, `-3`, `1.5`, `NaN`, and an empty field all reach the cart and produce a zero, negative, or `NaN` line (Q-01).

Goal: one explicit quantity contract. The value is read once, validated in one place, capped by stock, carried in the intent payload, and scaled exactly once by the cart domain. The service never depends on the DOM to recover a number it already received.

## Users / actors

- Shopper typing a quantity before adding a product.
- Developer wiring the product card to the cart.
- Tester covering invalid input and stock limits.

## User stories

- H1: As a shopper, I want to choose how many units to add so I do not have to click repeatedly.
- H2: As a shopper, I want an invalid quantity to be corrected or rejected visibly, not silently added.
- H3: As a shopper, I want to add the same product twice and get one merged line with the summed quantity.
- H4: As a developer, I want the quantity to travel in the payload, not be re-read from the DOM.
- H5: As a maintainer, I want one validation function with tests, not scattered `Number()` calls.

## Quantity contract (normative)

| Aspect | Rule |
|---|---|
| Type | Positive integer number of units. |
| Default | `1` when the card renders. |
| Minimum | `1`. |
| Maximum | `product.stock`. |
| Storage | Integer units in the intent payload. The cart domain scales units by `100` exactly once. |
| Read point | Once, in `ProductController`, immediately before emitting the intent. |
| Validation owner | `ProductController` normalizes the value; `ProductService.requestAddToCart` validates the product, the integer quantity, and the stock cap. |
| Merge | `CartService.addToCart` sums units into the existing active row and recomputes the subtotal. |
| Invalid input (D4-B) | The UI clamps to `1` and keeps focus. `CartItem` rejects non-positive and non-integer quantities. |
| Stock cap (D5-A) | The UI caps the requested quantity at `product.stock` before emitting the intent. |

## Resolved policies

### D4-B — clamp at the UI, reject in the domain

- Empty, `0`, negative, `NaN`, and non-numeric input become `1` in the input field.
- A decimal is truncated to an integer before clamping.
- The UI keeps focus on the input and shows the accepted value; it does not emit an invalid intent.
- `CartItem` still rejects `0`, negative, `NaN`, and non-integer quantities, so the invariant holds below the UI.

### D5-A — enforce the stock cap

- The accepted quantity is `min(normalizedQuantity, product.stock)`.
- When `stock` is `0` or unavailable, no positive intent is emitted.
- The cap applies to the requested quantity. Whether units already in the cart should also count against stock remains an open, non-gating question.

### Add intent ownership (D1)

- `ProductController` reads and normalizes the input once, then calls `ProductService.requestAddToCart({ productId, quantity })`.
- `ProductService.requestAddToCart` validates the product, the integer quantity, and the stock cap, and emits `onAddToCartIntent({ product, quantity })`.
- The controller resets the input only when `requestAddToCart` returns `true`.

Rationale for scaling by `100`: the cart already scales price and quantity by `100`, so the scaled subtotal is exact for up to two decimal places. Quantity is an integer unit count, so the scale is inherited for consistency with `CartItem`; it is not a second rounding step.

## Functional requirements (EARS)

### Rendering

- RF-QT-1: WHEN a product card renders, THE SYSTEM SHALL render a number input with `min="1"`, `value="1"`, `max="<stock>"`, `data-input="product-quantity"`, and `data-default-value="1"`.
- RF-QT-2: WHEN a product card renders, THE SYSTEM SHALL associate the input with a visible label through matching `for` and `id` attributes.
- RF-QT-3: WHEN the product is out of stock, THE SYSTEM SHALL disable the add button and SHALL NOT allow a positive quantity to be added.
- RF-QT-4: WHEN a product has no usable `stock` value, THE SYSTEM SHALL treat the maximum as unavailable rather than rendering `max="undefined"` or `max="NaN"`.

### Reading and validating

- RF-QT-5: WHEN the add button is clicked, THE SYSTEM SHALL read the quantity exactly once from the card input in `ProductController`.
- RF-QT-6: WHEN the input value is empty, THE SYSTEM SHALL set it to `1` before emitting an intent.
- RF-QT-7: WHEN the input value is `0`, negative, or `NaN`, THE SYSTEM SHALL set it to `1` and SHALL NOT emit an intent with the invalid value.
- RF-QT-8: WHEN the input value is a decimal, THE SYSTEM SHALL truncate it to an integer before clamping, and the cart domain SHALL reject a fractional unit count.
- RF-QT-9: WHEN the input value exceeds the product stock, THE SYSTEM SHALL cap it at `product.stock` before emitting an intent.
- RF-QT-10: WHEN the input value is valid, THE SYSTEM SHALL emit one add intent `{ product, quantity }` with an integer quantity.
- RF-QT-11: WHEN the UI clamps or normalizes a value, THE SYSTEM SHALL write the accepted value back to the input and SHALL keep focus on the input.

### Payload and service boundary

- RF-QT-12: WHEN `requestAddToCart` is called, THE SYSTEM SHALL accept and forward the `quantity` field; it SHALL NOT ignore it.
- RF-QT-13: WHEN `requestAddToCart` emits the intent, THE SYSTEM SHALL use the quantity from the payload and SHALL NOT re-read the input.
- RF-QT-14: WHEN the composition adapter builds the cart line, THE SYSTEM SHALL forward the integer `quantity` to `CartItem`.
- RF-QT-15: WHEN `CartItem` receives a quantity, THE SYSTEM SHALL scale it exactly once and compute `subTotal` from scaled quantity and scaled price.
- RF-QT-16: THE SYSTEM SHALL NOT perform any quantity scaling inside `ProductService`, `ProductController`, or `ProductCard`.
- RF-QT-17: WHEN `CartService.addToCart` receives a line with the same id as an active row, THE SYSTEM SHALL sum the quantities and recompute the subtotal once.
- RF-QT-18: WHEN a line is added to the cart, THE SYSTEM SHALL reset the card input to its default value only after a successful add.
- RF-QT-19: WHEN the product card is patched for a picked/unpicked change, THE SYSTEM SHALL NOT reset the quantity of unrelated cards.

### Stock

- RF-QT-20: WHEN a product is already in the cart, THE SYSTEM SHALL evaluate the stock cap against the requested quantity for now; counting units already in the cart against stock is explicitly deferred.
- RF-QT-21: WHEN the requested quantity exceeds stock, THE SYSTEM SHALL clamp it to `product.stock`, consistently for add and re-add.
- RF-QT-22: WHEN stock is `0` or unavailable, THE SYSTEM SHALL NOT emit an add intent.

## Non-functional requirements

- Validation is a pure function with no DOM access, so it is unit-testable.
- The controller is the only layer that reads the input element.
- No new dependency and no build step.
- Quantity rules are documented in the spec before the code changes.
- Test names state the behavior, in English.

## Edge cases

- Empty string, whitespace-only string, `"abc"`.
- `0`, `-1`, `1.5`, `2.0`, `1e3`, `Infinity`, `NaN`.
- Value greater than stock, value equal to stock, stock `0`, stock missing.
- Add 3, then add 2 for the same product → one active row with quantity 5.
- Remove the line, then add the same product again → new active row (see `spec_cart_audit_history`).
- Two rapid clicks with the same input value.
- Input value changed while a search request is in flight.
- Card patched while the input has focus.
- Product title or stock arrives as a string from the API.

## Out of scope

- Cart audit history and removed-row retention; see `spec_cart_audit_history`.
- Composition connectors and the remove bounce; see `spec_composition` and `spec_integration_tests`.
- A stepper UI (`+`/`-` buttons) or a quantity control in the cart.
- Editing the quantity of an existing cart line.
- Price discounts for bulk quantities.

## Completion criteria

- D4 and D5 are resolved and recorded in `AGENTS.md`.
- RF-QT-1 … RF-QT-22 each have at least one test.
- A failing test exists for `0`, negative, decimal, `NaN`, empty, and over-stock before the fix.
- The UI clamps invalid values to `1`, truncates decimals, and caps at stock.
- `CartItem` rejects non-positive and non-integer quantities.
- One add click produces one intent with an integer quantity.
- `pickProductQuantity` no longer ignores `quantity`.
- The controller reads the input once; the listener does not read the DOM.
- `CartItem` remains the only place that scales quantity and price.
- Adding the same product twice merges units into one active row.
- The manual browser check passes for valid, invalid, and over-stock quantities.

## Traceability

| Finding | Requirements |
|---|---|
| F-04 | RF-QT-5, RF-QT-10, RF-QT-12 … RF-QT-16 |
| Q-01 | RF-QT-6 … RF-QT-9, RF-QT-21, RF-QT-22 |
| RF-UT-3 | RF-QT-7, RF-QT-8 |
| RF-UT-36 | RF-QT-1, RF-QT-2 |

## Open questions

- [DECISION] Where does the pure validator live: `product/domain/Quantity.js` or `shared/utils/quantity.js`? Recommendation: `product/domain`, because stock is a product concept and the cart UI does not need it.
- [DECISION, non-gating] Should units already in the cart count against `stock`? Current scope caps only the requested quantity (RF-QT-20).
- [DECISION, non-gating] Should a clamped value show a short inline note, or only update the field? Current scope updates the field and keeps focus, with no error banner.
