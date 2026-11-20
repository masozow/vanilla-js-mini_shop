/**
 * Money scale used by the cart domain. Prices and subtotals are stored as
 * integers scaled by 100; a subtotal is the product of two scaled values, so it
 * is scaled by 100 * 100.
 */
const MONEY_SCALE = 100;
const MONEY_SCALE_SQUARED = MONEY_SCALE * MONEY_SCALE;

/**
 * Converts one scaled cart line into display numbers.
 *
 * Why this lives here: cart and checkout both format money, and the cart domain
 * must not know how values are rendered. Keeping the conversion in `shared`
 * avoids a second copy of the scale in the UI.
 *
 * @param {{ quantity: number, price: number, subTotal: number }} cartItemNumbers Scaled integers.
 * @returns {{ displayQuantity: number, displayPrice: number, displaySubTotal: number }} Display numbers.
 */
export const formatCartItemNumbers = ({ quantity, price, subTotal }) => ({
    displayQuantity: Number(quantity) / MONEY_SCALE,
    displayPrice: Number(price) / MONEY_SCALE,
    displaySubTotal: Number(subTotal) / MONEY_SCALE_SQUARED
});

/**
 * Converts scaled cart totals into fixed two-decimal strings.
 *
 * `discount` is already expressed in currency units, not in scaled integers,
 * because the cart service stores it that way. Subtotals and totals are scaled.
 *
 * @param {{ subTotal: number, discount?: number, total: number }} cartTotals Scaled subtotal and total, currency discount.
 * @returns {{ displaySubTotal: string, displayDiscount: string, displayTotal: string }} Formatted totals.
 */
export const formatCartTotals = ({ subTotal, discount = 0, total }) => ({
    displaySubTotal: (Number(subTotal) / MONEY_SCALE_SQUARED).toFixed(2),
    displayDiscount: Number(discount).toFixed(2),
    displayTotal: (Number(total) / MONEY_SCALE_SQUARED).toFixed(2)
});
