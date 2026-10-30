import { HttpClient } from "./shared/infrastructure/HttpClient.js";
import { ApiProductRespository } from "./features/product/infrastructure/ApiProductRepository.js";
import { ProductService } from "./features/product/application/ProductService.js";
import { ProductController } from "./features/product/ui/ProductController.js";
document.addEventListener('DOMContentLoaded', () => {
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
        const productRepo = ApiProductRespository({ httpClient: HttpClient });
        const productService = ProductService({ productRepo });
        const { productUI } = ProductController({
            dom: {
                productResults,
                productSearch
            },
            service: productService
        })
        productUI();

    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');