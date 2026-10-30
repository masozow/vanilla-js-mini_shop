import { CardsGrid } from "../../../shared/ui/components/CardsGrid.js";
import { ProductCard } from "./components/ProductCard.js";
import { debounce } from "../../../shared/utils/debounce.js"
export const ProductController = ({ service, dom }) => {
    const error_prefix = '[UI error] ProductController. ';
    const { productResults, productSearch } = dom;
    const { search, subscribe } = service;
    if (!productResults) throw new Error(error_prefix + 'productResults is required.');
    const renderGrid = (state) => {
        productResults.innerHTML = CardsGrid({ data: state.products, Component: ProductCard });
    }
    return {
        productUI: () => {
            //#region UI logic
            subscribe((state) => {
                renderGrid(state);
            })
            //#endregion
            //#region SearchLogic
            const debouncedSearch = debounce(async (query) => await search(query), 500);
            productSearch.addEventListener('input', async (e) => {
                debouncedSearch(e.target.value)
            })
            //#endregion
        }
    }
}