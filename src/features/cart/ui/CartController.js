import { CartItem } from "../domain/CartItem.js";
import { CartView } from "./CartView.js";
import { RenderStatuses } from "../../../shared/ui/components/RenderStatuses.js";
export const CartController = ({ cartResults, service }) => {
    const error_prefix = "[UI error] CartController. ";
    if (!cartResults) throw new Error(error_prefix + 'cartResults HTML element is required');
    if (!service) throw new Error(error_prefix + ' service is required.');
    const { onCartChange, handleCart } = service;
    const { isSuccess } = RenderStatuses(cartResults);
    const { renderCartList } = CartView();
    return {
        renderCart: (items) => {
            onCartChange((cart) => console.log(cart));
            const CartItems = items.map((item) => CartItem(item));
            const cartList = renderCartList(CartItems);
            isSuccess(cartList)
        }
    }
}