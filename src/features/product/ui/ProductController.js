export const ProductController = ({ service, resultsHTMLComponent }) => {
    const error_prefix = '[UI error] ProductController. ';
    const { search, onProductChange, onProductPicked, pickProductQuantity } = service;
    return {
        renderResults: async () => {
            if (!resultsHTMLComponent)
                throw new Error(error_prefix + 'HTML node to render results is required.');
            const { RenderStatuses } = await import("../../../shared/ui/components/RenderStatuses.js");
            const { validStatuses } = await import("../../../shared/dictionaries/validStatuses.js");
            const { ProductView } = await import("./ProductView.js");
            const { renderProductsGrid, transformSpecificProductCard } = ProductView();
            const { isLoading, isError, isEmpty, isIdle, isSuccess } = RenderStatuses(resultsHTMLComponent);
            const { IDLE, EMPTY, LOADING, ERROR, SUCCESS } = validStatuses;
            onProductChange((state) => {
                switch (state.status) {
                    case EMPTY: isEmpty(); break;
                    case LOADING: isLoading('products'); break;
                    case ERROR: isError(); break;
                    case SUCCESS: isSuccess(renderProductsGrid(state.products)); break;
                    case IDLE: isIdle('products'); break;
                }
            });
            onProductPicked((lastPickedProduct) => {
                if (!lastPickedProduct) return;
                const card = resultsHTMLComponent.querySelector(`[data-id="${lastPickedProduct.id}"]`)
                if (!card) return;
                const btn = card.querySelector("[data-action='pick']");
                if (!btn) return;
                transformSpecificProductCard({ product: lastPickedProduct, card, btn });
            });
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
                'pick': ({ id, quantity }) => pickProductQuantity({ productId: Number(id), quantity })
            }
            resultsHTMLComponent.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const card = btn.closest('[data-component="product-card"]')
                if (!card) return;
                const input = card.querySelector('[data-input="product-quantity"]');
                if (!input) return;
                const id = Number(card.dataset.id);
                const action = actions[btn.dataset.action];
                const quantity = Number(input.value);
                action({ id, quantity, isPicked: true });
            });
        }
    }
}