import { ProductModule } from "./features/product/ProductModule.js";
import { mapProductToCartItem } from "./shared/mappers/ProductToCart.mapper.js";
import { CartModule } from "./features/cart/CartModule.js";
import { cartHasItems } from "./features/cart/domain/CartCalculations.js";
import { CheckoutController } from "./features/checkout/ui/CheckoutController.js";
import { CheckoutService } from "./features/checkout/application/CheckoutService.js";
document.addEventListener('DOMContentLoaded', async () => {
    const error_prefix = '[Main error] ';
    try {
        //#region DOM elements
        const productSearch = document.getElementById('product-search');
        const productResults = document.getElementById('product-results');
        const cartResults = document.getElementById('cart-results');
        const totalsResults = document.getElementById('totals-results');
        const checkoutActions = document.getElementById('checkout-actions');
        //#endregion
        //Glueing code
        const onRemoveItemIntent = (id) => {
            productService.pickProductQuantity({ productId: Number(id), isPicked: false });
        }
        const cartService = await CartModule({
            cartHtmlResultsElement: cartResults,
            totalsHtmlResultsElement: totalsResults,
            onRemoveItemIntent
        });
        const onProductPickedIntent = (data) => {
            if (data.picked) {
                const cartItem = mapProductToCartItem(data);
                cartService.addToCart({ newItem: cartItem });
            } else {
                cartService.removeFromCart(data.id);
            }
        }
        const productService = await ProductModule({ productResults, productSearch, onProductPickedIntent });
        const onPurchaseDone = () => {
            productService.clearProducts();
            cartService.cleanCart();
            console.log('Purchase made.');
        }
        const checkoutService = CheckoutService({ onPurchaseDone });
        const { onCanPurchaseChange, setCanPurchase, purchase } = checkoutService;
        const { renderButton, bindActions } = CheckoutController({ service: checkoutService, checkoutResults: checkoutActions })
        cartService.onCartChange((items) => {
            setCanPurchase(cartHasItems(items))
        })
        renderButton();
        bindActions({ payload: cartService.cartItems });
        // purchaseButton.addEventListener('click', (e) => {
        //     cartService.cleanCart();
        //     productService.clearProducts();
        // })
        //#region Cart
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');