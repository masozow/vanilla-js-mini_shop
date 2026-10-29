import { debounce } from "./shared/utils/debounce.js";
import { httpClient } from "./shared/utils/infrastructure/HttpClient.js";
import { ApiProductRespository } from "./features/product/infrastructure/ApiProductRepository.js";
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
        const { getItems } = ApiProductRespository({ httpClient });
        const handleSearch = async (query) => {
            const response = await getItems(query);
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