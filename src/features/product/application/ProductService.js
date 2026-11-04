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
    const productSignal = createSignal(initialState);
    let reqId = 0;
    let lastQuery = '';

    return {
        onProductsChange: productSignal.subscribe,
        search: async (query) => {
            if (typeof query !== 'string') throw new Error(error_prefix, 'Query must be a string');
            const normalizedQuery = query.trim();
            if (normalizedQuery === '') {
                productSignal.set({ products: [], status: IDLE })
                lastQuery = '';
                ++reqId;
                return;
            }
            if (lastQuery === normalizedQuery) return;
            lastQuery = normalizedQuery;
            productSignal.set({ products: [], status: LOADING });
            const currentReqId = ++reqId;
            try {
                const products = await getItems(query);
                if (currentReqId !== reqId) return;
                if (products.length === 0 && normalizedQuery) {
                    productSignal.set({ products: [], status: EMPTY })
                    return;
                }
                productSignal.set({ products, status: SUCCESS })
            } catch (error) {
                if (currentReqId !== reqId) return;
                console.error(error_prefix, error);
                productSignal.set({ products: [], status: ERROR })
            }
        },
        togglePick: (productId) => {
            if (!productId) throw new Error(error_prefix + 'productId is required.');
            const products = productSignal.get();
            let isProductPicked = products.filter(product => product.id === productId).picked;
            console.log(isProductPicked);
        }
    }

}