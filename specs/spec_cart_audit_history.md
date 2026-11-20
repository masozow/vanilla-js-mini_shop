# SPEC — Cart On-Screen History

Status: Ready (decisions resolved, implementation pending)
Depends on: `spec_architecture`, `spec_unit_tests`
Gates: none
Findings: A-01, RF-AR-21, RF-AR-22, RF-UT-7 … RF-UT-10
Last updated: 2026-11-20

## Context and goal

The cart already keeps removed rows with `isDisabled: true`. That is enough for the product goal: show the user what was added and removed during the session. The current implementation is incomplete because `removeFromCart` zeroes `quantity` and `subTotal`, so the removed row no longer says what was removed.

Decision: `isDisabled` is the only status. `false` means the row counts; `true` means the row is history. No `status` field, no timestamps, and no schema version. The cart is a local, on-screen record; when the user purchases or clears, everything is deleted after the backend confirmation path.

This answers the domain question: **`CartItem` does not need a new property.** It already accepts `isDisabled`. The change is behavioral: retain the removed values and exclude disabled rows from totals and checkout.

## Users / actors

- Shopper reviewing what was added or removed.
- Developer implementing the cart behavior.
- Tester validating totals, persistence, and the removal path.

## User stories

- H1: As a shopper, I want removed lines to stay visible with what I removed.
- H2: As a shopper, I want totals and checkout to ignore removed lines.
- H3: As a shopper, I want re-adding a removed product to work without corrupting the history.
- H4: As a developer, I want one boolean, not a second status model.
- H5: As a maintainer, I want purchase and clear to delete the whole local cart because the backend confirms first.

## Model (normative)

```js
{
  id,
  name,
  price,        // scaled integer
  quantity,     // scaled integer; retained after removal
  subTotal,     // scaled integer; retained after removal
  isDisabled    // false = active, true = removed
}
```

Rules:

1. `isDisabled` is the only status. Do not add `status`, `addedAt`, `removedAt`, or `reason`.
2. `CartItem` keeps its current signature and shape; `isDisabled` already exists.
3. Active rows participate in totals, checkout, and the picked projection.
4. Removed rows are retained for display and excluded from every calculation.
5. Re-adding a removed product appends a new active row; the removed row is untouched.
6. Purchase and clear delete everything. This is safe because the complete cart is what would be sent to the backend, and the deletion happens after confirmation.

## Functional requirements (EARS)

### State

- RF-AH-1: THE SYSTEM SHALL use `isDisabled` as the only active/removed status.
- RF-AH-2: WHEN a line is added, THE SYSTEM SHALL set `isDisabled: false`.
- RF-AH-3: WHEN a line is removed, THE SYSTEM SHALL set `isDisabled: true` and SHALL retain `quantity`, `price`, and `subTotal`.
- RF-AH-4: THE SYSTEM SHALL NOT zero the quantity or subtotal of a removed line.
- RF-AH-5: WHEN the same product is added while an active row exists, THE SYSTEM SHALL merge into that row.
- RF-AH-6: WHEN the same product is added while only removed rows exist, THE SYSTEM SHALL append a new active row and SHALL NOT mutate the removed rows.
- RF-AH-7: WHEN a remove is requested for an id with no active row, THE SYSTEM SHALL do nothing and SHALL NOT throw.
- RF-AH-8: WHEN a remove is requested twice for the same active row, THE SYSTEM SHALL leave one removed row; the second call SHALL be a no-op.
- RF-AH-9: THE SYSTEM SHALL NOT add a new property to `CartItem` for this feature.

### Calculations

- RF-AH-10: WHEN totals are computed, THE SYSTEM SHALL sum only rows where `isDisabled` is `false`.
- RF-AH-11: WHEN a removed row is present, THE SYSTEM SHALL exclude its `subTotal` from `subTotal`, `discount`, and `total`.
- RF-AH-12: WHEN the cart has no active rows, THE SYSTEM SHALL report a zero total and `canPurchase: false` even if removed rows exist.
- RF-AH-13: WHEN checkout builds an order, THE SYSTEM SHALL include only active rows.
- RF-AH-14: WHEN the picked projection is derived, THE SYSTEM SHALL include only active, numeric ids.

### Persistence

- RF-AH-15: WHEN the cart is written, THE SYSTEM SHALL persist all rows, including removed ones.
- RF-AH-16: WHEN the cart is read, THE SYSTEM SHALL restore all rows and preserve their order.
- RF-AH-17: WHEN a row already has `isDisabled`, THE SYSTEM SHALL read it as-is; no migration is required.

### Retention

- RF-AH-18: WHEN purchase completes, THE SYSTEM SHALL delete the local cart, including history.
- RF-AH-19: WHEN clear is clicked, THE SYSTEM SHALL delete the local cart, including history.
- RF-AH-20: WHEN the page reloads before purchase or clear, THE SYSTEM SHALL restore the retained history.

### UI

- RF-AH-21: WHEN `CartRow` renders a removed row, THE SYSTEM SHALL show its retained quantity, price, and subtotal.
- RF-AH-22: WHEN `CartRow` renders a removed row, THE SYSTEM SHALL render its remove action as disabled.
- RF-AH-23: WHEN the remove path updates the row, THE SYSTEM SHALL show the retained values, not hardcoded `0`.
- RF-AH-24: WHEN a row is removed, THE SYSTEM SHALL NOT include it in the active picked projection.
- RF-AH-25: WHEN the history is empty, THE SYSTEM SHALL render the empty state without `undefined` values.
- RF-AH-26: WHEN a removed row is re-added, THE SYSTEM SHALL render the new active row and the retained removed row without duplicating their active projection.
- RF-AH-27: WHEN the cart state changes, THE SYSTEM SHALL render removed rows from the state snapshot; it SHALL NOT depend on a separate removal event to paint the retained values.

## Non-functional requirements

- The model stays a boolean; no second status model.
- Totals remain exact integer arithmetic with the shared money formatter.
- Persistence stays in `LocalCartRepository` with injected storage.
- No new runtime dependency and no build step.
- No timestamps are stored; the UI shows order of addition, not clock time.

## Edge cases

- Remove the last active row → totals `0`, purchase disabled, history retained.
- Remove, re-add, remove again → one retained row per removal and one active row at a time.
- Two removes for the same id.
- Legacy row with `isDisabled: true` and `quantity: 0` from the old behavior: keep it as-is; it simply cannot show the old quantity.
- Stored values `'{bad'`, `'{}'`, `'null'`, `'[]'`, `'0'`, `'"text"'`.
- Purchase with active and removed rows.
- Clear with removed rows only.
- Cart quantity merge after a removed row exists.
- Removed row plus active row with the same id.
- Large history: the UI may render all rows; decide if a visual cap is needed later.

## Out of scope

- Timestamps, event sourcing, schema versions, or audit reasons.
- Server-side or cross-device history.
- Undo/restore of a removed line.
- Printing a receipt.
- Analytics over the history.

## Completion criteria

- `CartItem` has no new property; `isDisabled` is the only status.
- Removing a line retains its quantity, price, and subtotal.
- Totals exclude removed rows, proven with a non-zero removed subtotal.
- Checkout includes only active rows.
- `cleanCart` and purchase delete everything.
- Removed rows survive reload until purchase or clear.
- Re-adding after remove preserves the removed row and creates one active row.
- The cart panel shows removed rows with retained values and a disabled action.
- Removed rows are painted from the state signal, not from a separate removal event.
- The manual browser flow passes: add, remove, reload, re-add, purchase, clear.

## Traceability

| Finding | Requirements |
|---|---|
| A-01 | RF-AH-1 … RF-AH-9, RF-AH-18, RF-AH-19 |
| RF-AR-21 | RF-AH-1, RF-AH-3 |
| RF-AR-22 | RF-AH-17 |
| RF-UT-7 | RF-AH-3, RF-AH-4 |
| RF-UT-8 | RF-AH-6 |
| RF-UT-9 | RF-AH-10, RF-AH-11 |
| RF-UT-10 | RF-AH-18, RF-AH-19 |
| B-04 | RF-AH-15, RF-AH-17 |

## Resolved decisions

- D2: `isDisabled` boolean, no timestamps, no status field.
- D6: delete everything on purchase and clear; history is for the screen, not for a backend audit.
- Rows are rendered from the cart state signal. `onItemIdRemoved` is removed; the controller reconciles the active → disabled transition from `onCartChange`.

## Open questions

None. The remaining work is implementation, not clarification.
