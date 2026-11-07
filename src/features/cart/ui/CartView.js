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
        updateSpecificRow: ({ card, btn, quantity, subTotal }) => {
            if (!card || !btn || !quantity || !subTotal) throw new Error(error_prefix + 'All parameters ar required.');
            const disabledClass = card.dataset.disabledClass;
            const inactiveText = btn.dataset.inactiveText;
            btn.textContent = inactiveText;
            quantity.textContent = "0";
            subTotal.textContent = "0";
            card.classList.add(disabledClass);
        }
    }
}