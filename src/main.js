import { ProductModule } from "./features/product/ProductModule.js";
import { mapProductToCartItem } from "./shared/mappers/ProductToCart.mapper.js";
import { CartModule } from "./features/cart/CartModule.js";
document.addEventListener('DOMContentLoaded', async () => {
    const error_prefix = '[Main error] ';
    try {
        //#region DOM elements
        const productSearch = document.getElementById('product-search');
        const productResults = document.getElementById('product-results');
        const cartResults = document.getElementById('cart-results');
        const subtotal = document.getElementById('subtotal');
        const discount = document.getElementById('discount');
        const total = document.getElementById('total');
        //#endregion
        //Glueing code
        const onRemoveItemIntent = (id) => {
            productService.pickProductQuantity({ productId: Number(id), isPicked: false });
        }
        const cartService = await CartModule({ htmlResultsElement: cartResults, onRemoveItemIntent });
        const onProductPickedIntent = (data) => {
            if (data.picked) {
                const cartItem = mapProductToCartItem(data);
                cartService.addToCart({ newItem: cartItem });
            } else {
                cartService.removeFromCart({ itemId: data.id });
            }
        }
        const productService = await ProductModule({ productResults, productSearch, onProductPickedIntent });
        //#region Cart
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');