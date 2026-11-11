import { ProductModule } from "./features/product/ProductModule.js";
import { mapProductToCartItem } from "./shared/mappers/ProductToCart.mapper.js";
import { CartModule } from "./features/cart/CartModule.js";
import { CheckoutModule } from "./features/checkout/CheckoutModule.js";
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
        const checkoutService = await CheckoutModule({ checkoutResults: checkoutActions, onPurchaseDone });
        cartService.onCartChange((items) => {
            checkoutService.setPayload(items);
        })
        //#region Cart
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');