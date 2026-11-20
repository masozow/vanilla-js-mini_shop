# SPEC — Composition Root, One-Way Projections, and Surgical Updates

Status: Ready
Depends on: `spec_architecture`
Gates: none (D1 resolved)
Findings: F-02, F-03, F-04, F-06
Last updated: 2026-11-20

## Context and goal

`main.js` contains cross-feature flow inside `DOMContentLoaded`. The cart and product features are synchronized in both directions:

- Removing a cart item calls `removeFromCart`, then `onRemoveItemIntent`, which asks Products to emit `lastPickedProductSignal`, which calls `onProductPickedIntent`, which calls `removeFromCart` again.
- `ProductService.setPickedIds` only updates a cache; it emits no UI update. The legacy `lastPickedProductSignal` is still the only channel that repaints a card.

This produces two truths, conditional double writes, a TDZ-risk closure, and a `main.js` that cannot be imported or tested.

Goal: one owner per fact, one-way projection from cart to product UI, explicit command/state/event/port channels, and surgical patches that update only affected cards without re-rendering the grid.

## Users / actors

- Maintainer wiring features.
- Agent implementing or testing cross-feature behavior.
- Future feature author copying the pattern.

## User stories

- H1: As a maintainer, I want `main.js` to contain only DOM lookup, module creation, and connector calls.
- H2: As a user, I want one remove click to produce one cart write and one history entry.
- H3: As a user, I want the product card to update when the cart changes without the grid re-rendering.
- H4: As a developer, I want the wiring testable with fake services and no browser.
- H5: As a future feature author, I want a clear rule for intents, state signals, events, and input ports.

## Design rules (normative)

The project uses four channels. They must not be mixed.

| Channel | Direction | Purpose | Example |
|---|---|---|---|
| Command / intent | UI → composition → owning feature | A user action that mutates state. | `onAddToCartIntent({ product, quantity })` |
| State signal | Owning feature → composition/UI | Full truth; drives render and reconciliation. | `onCartChange(items)` |
| Effect event | Owning feature → UI | A one-shot fact for a surgical patch or effect. | `onItemRemoved(id)` |
| Input port | Composition → consuming feature | A projection in the consumer's vocabulary. | `setPickedIds(ids)` |

Rules:

1. A feature never imports another feature. Only composition knows both.
2. An intent is not a state channel. Do not use an intent callback to notify the UI that state changed.
3. A state signal carries the full truth. A consumer may derive a projection from it.
4. An effect event carries only what changed and must be derivable from state. It is an optimization, not a second source of truth.
5. An event must never trigger a command back into the feature that emitted it. That is the bounce.
6. `lastTouched`/`lastPicked` is allowed only for ephemeral effects (highlight, scroll, focus, announcement). If losing all events but the last would make the UI wrong, it is state and must use a full set/state.
7. Patch functions are idempotent and defensive: applying twice is safe; a missing node is ignored.
8. A full render is allowed only when the set of keys changes (new search, first load, empty state). A field change patches existing nodes.

## Target flow

```
Product card click
  └─ intent add({ product, quantity })
       └─ composition handler
            └─ cartService.addToCart
                 └─ cart state signal
                      ├─ connectCartToCheckout → checkout.setPayload / setCanClear
                      └─ connectCartToProducts → productFeature.setPickedIds(activeIds)
                           └─ product UI patches visible cards by data-id

Cart row remove click
  └─ cartService.removeFromCart(id)
       └─ cart state signal
            └─ connectCartToProducts → productFeature.setPickedIds(activeIds)
                 └─ product UI patches visible cards by data-id
```

There is no return path from Products to the cart for removal.

## Functional requirements (EARS)

### Composition root

- RF-CO-1: THE SYSTEM SHALL expose `connectCartToProducts`, `connectCartToCheckout`, `createAddToCartHandler`, `createCheckoutHandlers`, and `toCartLine` from `src/composition/`.
- RF-CO-2: WHEN `main.js` runs, THE SYSTEM SHALL only look up DOM nodes, create modules, and call composition functions.
- RF-CO-3: THE SYSTEM SHALL NOT define purchase flow, cross-feature callbacks, or feature bridges inside `DOMContentLoaded`.
- RF-CO-4: WHEN `connectCartToProducts` subscribes to the cart, THE SYSTEM SHALL call `setPickedIds` with the active, numeric ids and exclude removed rows.
- RF-CO-5: WHEN `connectCartToCheckout` subscribes to the cart, THE SYSTEM SHALL call `setPayload` and `setCanClear` with the same cart snapshot.
- RF-CO-6: WHEN `createAddToCartHandler` receives `{ product, quantity }`, THE SYSTEM SHALL map it to a raw cart line and call `addToCart`.
- RF-CO-7: WHEN `createCheckoutHandlers` is used, purchase SHALL clear the cart and the product state; clear SHALL only clear the cart.
- RF-CO-8: WHEN `toCartLine` maps a product, THE SYSTEM SHALL NOT import cart internals.
- RF-CO-9: WHEN a connector subscribes, THE SYSTEM SHALL return its unsubscribe function.
- RF-CO-10: WHEN the cart changes, THE SYSTEM SHALL NOT call a product intent or a product state event that can loop back into the cart.

### Remove path

- RF-CO-11: THE SYSTEM SHALL remove `onRemoveItemIntent` from `CartController`, `CartModule`, and `main.js`.
- RF-CO-12: WHEN a cart remove button is clicked, THE SYSTEM SHALL call `removeFromCart` exactly once.
- RF-CO-13: THE SYSTEM SHALL remove `lastPickedProductSignal`, `onProductPicked`, and `pickProductQuantity`.
- RF-CO-14: WHEN the product card is clicked, THE SYSTEM SHALL emit one add intent with the product and explicit quantity.
- RF-CO-15: WHEN a cart row is removed, THE SYSTEM SHALL update the product card only through the cart projection, not through a product intent.

### Surgical product update

- RF-CO-16: WHEN `setPickedIds` receives an id set, THE SYSTEM SHALL patch only cards present in `resultsHTMLComponent` and keyed by `data-id`.
- RF-CO-17: WHEN a card is patched, THE SYSTEM SHALL change only its picked class and button text; it SHALL NOT replace `innerHTML`, recreate nodes, reset inputs, or scroll.
- RF-CO-18: WHEN the same id set is applied twice, THE SYSTEM SHALL produce no additional DOM change.
- RF-CO-19: WHEN an id has no visible card, THE SYSTEM SHALL ignore it without throwing; the next full render SHALL use the current projection.
- RF-CO-20: WHEN a new search renders a grid, THE SYSTEM SHALL build the view model with the current `picked` projection so the initial render is correct.
- RF-CO-21: WHEN `setPickedIds` runs before the grid exists, THE SYSTEM SHALL store the projection and apply it on the next successful render.
- RF-CO-22: WHEN the cart is empty, THE SYSTEM SHALL clear the picked projection on all visible cards.
- RF-CO-23: WHEN `setPickedIds` receives the same set it already holds, THE SYSTEM SHALL NOT emit a change signal.
- RF-CO-24: WHEN `setPickedIds` receives a different set, THE SYSTEM SHALL emit only the ids whose membership changed, with their new `picked` value.
- RF-CO-25: THE SYSTEM SHALL write the picked cache only from `setPickedIds`; `search`, `clearProducts`, and the UI SHALL NOT write it.

## D1 resolved — projection owned by `ProductService`

`ProductService` owns the `pickedProductsIdList` cache as a **read model** of the cart's active ids. The cart connector is its only writer. The cache lets a new search render the correct picked state even when no card is on screen.

`setPickedIds` computes the symmetric difference between the previous cache and the incoming set, stores the new cache, and emits `onPickedProductsChange` with only the ids whose membership changed. An unchanged set emits nothing.

`ProductController` subscribes to `onPickedProductsChange` and patches only the visible cards keyed by `data-id`. It never re-renders the grid for a picked change.

Why this option: the cache is an optimization, not a second truth. The cart remains the owner of "what is selected"; the service keeps a derived projection in the application layer, which RF-AR-15 allows. The diff signal preserves the surgical update that a full state signal would destroy.

The rejected alternative (a controller-owned overlay) would move the cache to the UI and require `ProductModule` to expose `setPickedIds`. It is valid, but it adds a facade and keeps the projection out of the state that `search` already renders.

## Incremental execution (expand/contract)

1. Extract the composition root and its connectors with the current behavior, so the wiring becomes importable and testable.
2. Add the new projection and patch path while keeping the old path.
3. Switch the connector to the new path.
4. Verify add and remove in the browser, with the product visible and not visible.
5. Remove the old path and the remove intent.
6. Run the integration tests for both bounce cases and the reload projection.

Why the extraction comes first: the bounce test needs `wireApp` with fakes; while the wiring lives inside `DOMContentLoaded`, the test cannot exist. Extracting without changing behavior keeps the old path working until the new one is verified.

Do not remove the old path before the new one works; that leaves the card with no update channel.

## Edge cases

- Remove a product that is in the current results.
- Remove a product that is not in the current results.
- Add while a search request is in flight.
- Cart change while the product grid is loading or empty.
- Two rapid cart changes before the next paint.
- Empty cart / purchase.
- Subscription order when multiple connectors share `onCartChange`.
- A patch function throws; it must not break the cart notification chain.

## Out of scope

- Rewriting the product or cart feature internals.
- Changing the cart audit model.
- Adding a global event bus or state library.
- Browser E2E implementation; see `spec_integration_tests`.

## Completion criteria

- `main.js` contains no cross-feature closures.
- The remove intent and `lastPicked` channel are gone.
- Adding emits one intent; removing writes once.
- The product card updates via a keyed patch without replacing nodes.
- Both bounce cases (visible/not visible) pass.
- Connectors are unit-testable with fakes.
- `shared` still has no feature imports.

## Traceability

| Finding | Requirements |
|---|---|
| F-02 | RF-CO-10 … RF-CO-22 |
| F-03 | RF-CO-1 … RF-CO-9 |
| F-04 | RF-CO-6, RF-CO-14 |
| F-06 | RF-CO-9 (initial subscription), RF-CO-18 |

## Resolved decisions

- D1: `ProductService` owns the picked cache; the cart connector is its only writer; `setPickedIds` emits only the symmetric difference.
- The add intent carries `{ product, quantity }`; L-01 keeps the quantity input and D4/D5 define how it is normalized.

## Open questions

None. `ProductModule` keeps returning the `productService`, because `setPickedIds` and `onPickedProductsChange` live there under D1.
