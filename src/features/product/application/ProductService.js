import { validStatuses } from "../../../shared/dictionaries/validStatuses.js";
export const ProductService = ({ productRepo }) => {
    const error_prefix = '[Application error] ProductService. ';
    const { getItems } = productRepo;
    const { IDLE, ERROR, LOADING, SUCCESS, EMPTY } = validStatuses;
    const initialState = Object.freeze({
        products: [],
        status: IDLE
    })
    const state = { ...initialState };
    const notify = () => {
        listeners.forEach((listener) => listener(getState()));
    }
    const setState = ({ products, status }) => {
        state.products = products;
        state.status = status;
        notify();
    }
    const getState = () => ({ ...state });
    let reqId = 0;
    let lastQuery = '';
    const listeners = new Set();

    return {
        subscribe: (listenerCallback) => {
            listeners.add(listenerCallback);
            listenerCallback(getState());
            return () => listeners.delete(listenerCallback);
        },
        search: async (query) => {
            if (typeof query !== 'string') throw new Error(error_prefix, 'Query must be a string');
            const normalizedQuery = query.trim();
            if (normalizedQuery === '') {
                setState({ products: [], status: IDLE });
                lastQuery = '';
                ++reqId;
                return;
            }
            if (lastQuery === normalizedQuery) return;
            lastQuery = normalizedQuery;
            setState({ products: [], status: LOADING });
            const currentReqId = ++reqId;
            try {
                const products = await getItems(query);
                if (currentReqId !== reqId) return;
                if (products.length === 0 && normalizedQuery) {
                    setState({ products: [], status: EMPTY })
                    return;
                }
                setState({ products, status: SUCCESS });
            } catch (error) {
                if (currentReqId !== reqId) return;
                console.error(error_prefix, error);
                setState({ products: [], status: ERROR })
            }
        },
        togglePick: (productId) => {
            if (!productId) throw new Error(error_prefix + 'productId is required.');
            let isProductPicked = state.products.filter(product => product.id === productId).picked;
            console.log(isProductPicked);
        }
    }

}