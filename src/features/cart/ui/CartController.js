import { CartItem } from "../domain/CartItem.js";
import { CartRow } from "./components/CartRow.js";
export const CartController = ({ cartResults, service }) => {
    const error_prefix = "[UI error] CartController";
    const { addToCart } = service;
    return {
        renderCart: (items) => {
            const CartItems = items.map((item) => CartItem(item));
            const CartRows = CartItems.map((item) =>
                CartRow(item)
            );
            cartResults.innerHTML = CartRows.join('');
        }
    }
}