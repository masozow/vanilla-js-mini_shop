import { CartItem } from "../domain/CartItem.js";
import { CartRow } from "./components/CartRow.js";
import { List } from "./components/List.js";
export const CartController = ({ cartResults, service }) => {
    const error_prefix = "[UI error] CartController. ";
    if (!cartResults) throw new Error(error_prefix + 'cartResults HTML element is required');
    if (!service) throw new Error(error_prefix + ' service is required.');
    const { onCartChange, handleCart } = service;
    return {
        renderCart: (items) => {
            const CartItems = items.map((item) => CartItem(item));
            const cartList = List({ items: CartItems, Component: CartRow })
            cartResults.innerHTML = cartList;
        }
    }
}