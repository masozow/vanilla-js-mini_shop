import { debounce } from "./shared/utils/debounce.js";
import { HttpClient } from "./shared/infrastructure/HttpClient.js";
import { ApiProductRespository } from "./features/product/infrastructure/ApiProductRepository.js";
import { ProductService } from "./features/product/application/ProductService.js";
import { ProductCard } from "./features/product/ui/components/ProductCard.js";
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
        //#region UI logic
        const productRepo = ApiProductRespository({ httpClient: HttpClient });
        const { search, subscribe } = ProductService({ productRepo });
        const renderGrid = (data) => {
            return `
            <div class="grid">
                ${data.map((d) => ProductCard(d)).join('')}
            </div > 
            `;
        }
        subscribe((state) => {
            productResults.innerHTML = renderGrid(state.products);
        })
        //#endregion
        //#region SearchLogic
        const debouncedSearch = debounce(async (query) => await search(query), 500);
        productSearch.addEventListener('input', async (e) => {
            debouncedSearch(e.target.value)
        })
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');