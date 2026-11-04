import { validStatuses } from "../../../shared/dictionaries/validStatuses.js";
import { createSignal } from "../../../shared/store/createSignal.js";

export const ProductService = ({ productRepo }) => {
    const error_prefix = '[Application error] ProductService. ';
    const { getItems } = productRepo;
    const { IDLE, ERROR, LOADING, SUCCESS, EMPTY } = validStatuses;
    const initialState = {
        products: [],
        status: IDLE
    }
    const productsSignal = createSignal(initialState);
    let reqId = 0;
    let lastQuery = '';

    return {
        onProductsChange: productsSignal.subscribe,
        search: async (query) => {
            if (typeof query !== 'string') throw new Error(error_prefix, 'Query must be a string');
            const normalizedQuery = query.trim();
            if (normalizedQuery === '') {
                productsSignal.set({ products: [], status: IDLE })
                lastQuery = '';
                ++reqId;
                return;
            }
            if (lastQuery === normalizedQuery) return;
            lastQuery = normalizedQuery;
            productsSignal.set({ products: [], status: LOADING });
            const currentReqId = ++reqId;
            try {
                const products = await getItems(query);
                if (currentReqId !== reqId) return;
                if (products.length === 0 && normalizedQuery) {
                    productsSignal.set({ products: [], status: EMPTY })
                    return;
                }
                productsSignal.set({ products, status: SUCCESS })
            } catch (error) {
                if (currentReqId !== reqId) return;
                console.error(error_prefix, error);
                productsSignal.set({ products: [], status: ERROR })
            }
        },
        togglePick: (productId) => {
            if (!productId) throw new Error(error_prefix + 'productId is required.');
            let isProductPicked = state.products.filter(product => product.id === productId).picked;
            console.log(isProductPicked);
        }
    }

}