import { ProductModule } from "./features/product/ProductModule.js";
document.addEventListener('DOMContentLoaded', async () => {
    const error_prefix = '[Main] ';
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
        await ProductModule({ productResults, productSearch });

    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');