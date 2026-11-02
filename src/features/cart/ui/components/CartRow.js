import { esc } from "../../../../shared/utils/escapeHTML.js";
export const CartRow = (cartItem) => {
    const error_prefix = '[UI error] CartRow. ';
    if (!cartItem) throw new Error(error_prefix + 'cartItem element is required.');
    const presentationData = {
        dataComponent: 'cart-item',
        disabledClass: 'cart-row-disabled',
        btn: (isDisabled) => !isDisabled ? `
         <button
            data-action="remove-from-cart"
        >
            X
        </button>`: '<span>( - )</span>'
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
        ${presentationData.btn(isDisabled)}
        <p class='cart-item-name'>${esc(name)}</p>
        <div class='numbers'>
            <p class='quantity'>${esc(quantity)} * ${esc(price)}</p>
            <p>${esc(subTotal)}</p>
        </div>
        
    </article>
    `;
}