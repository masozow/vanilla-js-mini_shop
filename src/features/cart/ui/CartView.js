import { List } from "./components/List.js";
import { CartRow, Totals } from "./components/index.js";

export const CartView = () => {
    const error_prefix = '[UI Error] CartView. ';
    return {
        renderCartList: (items) => {
            if (!items) throw new Error(error_prefix + 'Items is required');
            if (!Array.isArray(items)) throw new Error(error_prefix + 'Items must be an array.');
            return List({ items, Component: CartRow })
        },
        renderCartRowAtEnd: ({ item, cartResults }) => {
            if (!item) throw new Error(error_prefix + 'Item is required.');
            cartResults.insertAdjacentHTML('beforeend', CartRow(item));
        },
        updateSpecificRow: ({ card = { element, shouldDisable: true }, btn, quantity = { element, text }, subTotal = { element, text } }) => {
            if (!card || !btn || !quantity || !subTotal) throw new Error(error_prefix + 'All parameters ar required.');
            const disabledClass = card.element.dataset.disabledClass;
            const inactiveText = btn.dataset.inactiveText;
            btn.textContent = inactiveText;
            quantity.element.textContent = quantity.text;
            subTotal.element.textContent = subTotal.text;
            if (card.shouldDisable) {
                card.element.classList.add(disabledClass);
                card.element.setAttribute('disabled', 'true');
                btn.textContent = btn.dataset.inactiveText;
                btn.setAttribute('aria-pressed', 'false');
            } else {
                btn.textContent = btn.dataset.activeText;
                btn.setAttribute('aria-pressed', 'true');
            }
        },
        replaceCartRow: ({ card, item }) => {
            if (!card) throw new Error(error_prefix + 'card is required.');
            if (!item) throw new Error(error_prefix + 'item is required.');
            card.outerHTML = CartRow(item);
        },
        renderTotals: ({ data, totalsHTMLElement }) => {
            if (!data) throw new Error(error_prefix + 'data is required.');
            const { total, subTotal } = data;
            totalsHTMLElement.innerHTML = Totals({ total, subTotal })
        }
    }
}