export const Totals = ({ total, subTotal, discount = 0 }) => {
    const error_prefix = '[UI Error] TotalsComponent. ';
    if (total === undefined || subTotal === undefined) throw new Error(error_prefix + 'Both total and subTotal are required.')
    return `
        <div 
        data-component="totals"
        class="totals"
        >
          <p>Subtotal</p>
          <p data-id="subtotal">${subTotal}</p>
          ${discount !== 0
            ? `<p>Discount</p>
                <p data-id="discount">${discount}</p>`
            : ''}
          <p>Total</p>
          <p data-id="total">${total}</p>
        </div>
    `;
}