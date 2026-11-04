export const ProductController = ({ service, resultsHTMLComponent }) => {
    const error_prefix = '[UI error] ProductController. ';
    const { search, onProductChange, togglePick } = service;
    return {
        renderResults: async () => {
            if (!resultsHTMLComponent)
                throw new Error(error_prefix + 'HTML node to render results is required.');
            const { RenderStatuses } = await import("../../../shared/ui/components/RenderStatuses.js");
            const { validStatuses } = await import("../../../shared/dictionaries/validStatuses.js");
            const { ProductView } = await import("./ProductView.js");
            const { isLoading, isError, isEmpty, isIdle, isSuccess } = RenderStatuses(resultsHTMLComponent);
            const { IDLE, EMPTY, LOADING, ERROR, SUCCESS } = validStatuses;
            const { renderProductsGrid } = ProductView();
            //#region UI logic
            onProductChange((state) => {
                switch (state.status) {
                    case EMPTY: isEmpty(); break;
                    case LOADING: isLoading('products'); break;
                    case ERROR: isError(); break;
                    case SUCCESS: isSuccess(renderProductsGrid(state.products)); break;
                    case IDLE: isIdle('products'); break;
                }
            })
        },
        searchProducts: async (searchInput) => {
            if (!searchInput)
                throw new Error(error_prefix, 'HTML search input element is required.');
            const { debounce } = await import("../../../shared/utils/debounce.js");
            const debouncedSearch = debounce(async (query) => await search(query), 500);
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value)
            })
        },
        pickProduct: () => {
            const actions = {
                'pick': (id) => console.dir(id)
            }
            resultsHTMLComponent.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]')
                if (!btn) return;
                console.dir(btn);
                const card = btn.closest('[data-component="product-card"]')
                if (!card) return;
                console.dir(card);
                const id = Number(card.dataset.id);
                const action = actions[btn.dataset.action];
                action(id);
            });
        }
    }
}