import { List } from "./components/List.js";
import { CartRow } from "./components/CartRow.js";
export const CartView = () => {
    const error_prefix = '[UI Error] CartView. ';
    return {
        renderCartList: (items) => {
            if (!items) throw new Error(error_prefix + 'Items is required');
            if (!Array.isArray(items)) throw new Error(error_prefix + 'Items must be an array.');
            return List({ items, Component: CartRow })
        },
        renderCartRow: (item) => {
            if (!item) throw new Error(error_prefix + 'Item is required.');
            return CartRow(item);
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
                card.element.setAtribute('disabled', 'true');
                btn.textContent = btn.dataset.inactiveText;
                btn.setAttribute('aria-pressed', 'false');
            } else {
                btn.textContent = btn.dataset.activeText || 'Remove';
                btn.setAttribute('aria-pressed', 'true');
            }

        }
    }
}