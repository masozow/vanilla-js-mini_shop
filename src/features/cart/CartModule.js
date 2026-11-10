import { CartService } from "./application/CartService.js";
import { LocalCartRepository } from "./infrastructure/LocalCartRepository.js";
import { CartController } from "./ui/CartController.js";
export const CartModule = async ({ cartHtmlResultsElement, totalsHtmlResultsElement, onRemoveItemIntent = undefined }) => {
    const error_prefix = '[CartModule Error] ';
    if (!cartHtmlResultsElement) throw new Error(error_prefix + ' cartHtmlResultsElement is required.');
    const cartRepo = LocalCartRepository('cart');
    const cartService = CartService({ cartLocalRepo: cartRepo });
    try {
        const {
            renderCart,
            removeItem,
        } = CartController({
            cartResults: cartHtmlResultsElement,
            totalsResults: totalsHtmlResultsElement,
            service: cartService,
            onRemoveItemIntent
        });
        await renderCart();
        removeItem();
    } catch (error) {
        console.error(error_prefix + error);
    }
    return cartService;
}