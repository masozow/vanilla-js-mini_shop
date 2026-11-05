import { List } from "./components/List.js";
import { CartRow } from "./components/CartRow.js";
export const CartView = () => {
    const error_prefix = '[UI Error] CartView. ';
    return {
        renderCartList: (items) => {
            return List({ items, Component: CartRow })
        }
    }
}