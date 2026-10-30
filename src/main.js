import { debounce } from "./shared/utils/debounce.js";
import { HttpClient } from "./shared/infrastructure/HttpClient.js";
import { ApiProductRespository } from "./features/product/infrastructure/ApiProductRepository.js";
import { ProductCard } from "./features/product/ui/components/ProductCard.js";
document.addEventListener('DOMContentLoaded', () => {
    const error_prefix = '[Main] ';
    try {
        //#region DOM elements
        const productResults = document.getElementById('product-results');
        const cartResults = document.getElementById('cart-results');
        const productSearch = document.getElementById('product-search');
        const subtotal = document.getElementById('subtotal');
        const discount = document.getElementById('discount');
        const total = document.getElementById('total');
        //#endregion
        //#region UI logic
        const renderGrid = (data) => {
            return `
            <div class="grid">
                ${data.map((d) => ProductCard(d)).join('')}
            </div > 
            `;
        }
        //#endregion
        //#region SearchLogic
        const { getItems } = ApiProductRespository({ httpClient: HttpClient });
        const handleSearch = async (query) => {
            const response = await getItems(query);
            productResults.innerHTML = renderGrid(response);
        }
        const debouncedSearch = debounce(async (query) => handleSearch(query), 500);
        productSearch.addEventListener('input', async (e) => {
            debouncedSearch(e.target.value)
        })
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});
// await import('./shared/test/index.js');