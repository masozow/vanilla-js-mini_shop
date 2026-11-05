import { ProductModule } from "./features/product/ProductModule.js";
import { CartItem } from "./features/cart/domain/CartItem.js";
import { CartRow } from "./features/cart/ui/components/CartRow.js";
import { LocalCartRepository } from "./features/cart/infrastructure/LocalCartRepository.js";
import { CartService } from "./features/cart/application/CartService.js";
import { CartController } from "./features/cart/ui/CartController.js";
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
        const onProductPickedIntent = (data) => {
            console.log("Intent at main: ", data);
        }
        const productService = await ProductModule({ productResults, productSearch, onProductPickedIntent });
        //#region Cart
        const Items = [{
            id: 1,
            name: 'Apple MagSafe Battery Pack - Apple',
            price: '99.99',
            quantity: '5'
        },
        {
            id: 2,
            name: 'Beats Flex Wireless Earphones - Beats',
            price: '49.99',
            quantity: '50',
            isDisabled: true
        },
        {
            id: 3,
            name: 'Selfie Stick Monopod - SnapTech',
            price: '12.99',
            quantity: '11',
            isDisabled: true
        },
        {
            id: 4,
            name: 'iPhone X - Apple',
            price: '899.99',
            quantity: '37'
        },
        {
            id: 5,
            name: 'Essence Mascara Lash Princess - Essence',
            price: '9.99',
            quantity: '9'
        }

        ]
        const cartRepo = LocalCartRepository('cart');
        const cartService = CartService({ cartLocalRepo: cartRepo })
        const { renderCart } = CartController({ cartResults, service: cartService })
        renderCart(Items);
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
await import('./shared/test/index.js');