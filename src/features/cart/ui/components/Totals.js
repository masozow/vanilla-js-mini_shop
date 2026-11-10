import { correctCartTotalsForDisplay } from "../../domain/CartCalculations.js";
export const Totals = ({ total, subTotal, discount = 0 }) => {
  const error_prefix = '[UI Error] TotalsComponent. ';
  if (total === undefined || subTotal === undefined) throw new Error(error_prefix + 'Both total and subTotal are required.')
  const correctedTotals = correctCartTotalsForDisplay({ subTotal, total, discount });
  return `
        <div 
        data-component="totals"
        class="cart-totals"
        >
          <p>Subtotal</p>
          <p data-id="subtotal">${correctedTotals.correctedSubTotal}</p>
          ${discount !== 0
      ? `<p>Discount</p>
                <p data-id="discount">${correctedTotals.correctedDiscount}</p>`
      : ''}
          <p>Total</p>
          <p data-id="total">${correctedTotals.correctedTotal}</p>
        </div>
    `;
}