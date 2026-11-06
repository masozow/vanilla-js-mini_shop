import { CartService } from "./application/CartService.js";
import { LocalCartRepository } from "./infrastructure/LocalCartRepository.js";
import { CartController } from "./ui/CartController.js";
export const CartModule = ({ htmlResultsElement }) => {
    const error_prefix = '[CartModule Error] ';
    if (!htmlResultsElement) throw new Error(error_prefix + ' htmlResultsElement is required.');
    const cartRepo = LocalCartRepository('cart');
    const cartService = CartService({ cartLocalRepo: cartRepo });
    try {
        const { renderCart, removeItem } = CartController({ cartResults: htmlResultsElement, service: cartService });
        renderCart();
        removeItem();
    } catch (error) {
        console.error(error_prefix + error);
    }
    return cartService;
}