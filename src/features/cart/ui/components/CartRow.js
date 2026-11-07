import { esc } from "../../../../shared/utils/escapeHTML.js";
export const CartRow = (cartItem) => {
    const error_prefix = '[UI error] CartRow. ';
    if (!cartItem) throw new Error(error_prefix + 'cartItem element is required.');
    const presentationData = {
        dataComponent: 'cart-item',
        disabledClass: 'cart-row-disabled',
        dataAction: 'remove-from-cart',
        btnText: (isDisabled) => !isDisabled ? 'X' : '-'
    }
    const {
        id,
        quantity,
        name,
        price,
        subTotal,
        isDisabled
    } = cartItem;

    return `
    <article
        data-id='${esc(id)}'
        data-component="${presentationData.dataComponent}"
        class='cart-row ${isDisabled ? presentationData.disabledClass : ''}'
        data-disabled-class="${presentationData.disabledClass}"
    >
         <button
            data-action="${presentationData.dataAction}"
            data-active-text="${presentationData.btnText(false)}"
            data-inactive-text="${presentationData.btnText(true)}"
            ${isDisabled ? "disabled" : ""}
        >
            ${presentationData.btnText(isDisabled)}
        </button>
        <p class='cart-item-name'>${esc(name)}</p>
        <div class='numbers'>
            <p class='quantity'>
            <span data-item-display="quantity">${esc(quantity)}</span> * ${esc(price)}</p>
            <p data-item-display="sub-total">${esc(subTotal)}</p>
        </div>
    </article>
    `;
}