import { debounce } from "../../../shared/utils/debounce.js"
import { RenderResults } from "../../../shared/ui/components/RenderResults.js";
import { validStatuses } from "../../../shared/dictionaries/validStatuses.js";
import { ProductCard } from "./components/ProductCard.js";

export const ProductController = ({ service, dom }) => {
    const error_prefix = '[UI error] ProductController. ';
    const { productResults, productSearch } = dom;
    if (!productResults) throw new Error(error_prefix + 'productResults is required.');
    if (!productSearch) throw new Error(error_prefix, 'productSearch is required.');
    const { search, subscribe } = service;
    const { isLoading, isError, isEmpty, isIdle, renderGrid } = RenderResults(productResults);
    const { IDLE, EMPTY, LOADING, ERROR, SUCCESS } = validStatuses;
    return {
        productUI: () => {
            //#region UI logic
            subscribe((state) => {
                switch (state.status) {
                    case EMPTY: isEmpty(); break;
                    case LOADING: isLoading('products'); break;
                    case ERROR: isError(); break;
                    case SUCCESS: renderGrid({ data: state.products, Component: ProductCard }); break;
                    case IDLE: isIdle('products'); break;
                }
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