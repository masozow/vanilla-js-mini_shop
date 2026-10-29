import { debounce } from "./shared/utils/debounce.js";
import { httpClient } from "./shared/utils/infrastructure/HttpClient.js";
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
        //#region SearchLogic
        const baseUrl = 'https://dummyjson.com/products/search?q='
        const error_prefix = '[Search] ';
        const handleSearch = async (query) => {
            if (!query.trim()) return;
            const url = baseUrl + query;
            const response = await httpClient({ url });
            console.log(response);
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