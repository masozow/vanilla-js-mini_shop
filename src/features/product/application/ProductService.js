export const ProductService = async ({ productRepo }) => {
    const error_prefix = '[Application error] ProductService. ';
    const validStatuses = Object.freeze({
        IDLE: 'idle',
        ERROR: 'error',
        LOADING: 'laoding',
        SUCCESS: 'success',
        EMPTY: 'empty'
    })
    const { getItems } = productRepo;
    const { IDLE, ERROR, LOADING, SUCCESS, EMPTY } = validStatuses;
    const initialState = Object.freeze({
        products: [],
        status: IDLE
    })
    const state = { ...initialState };
    const setState = ({ products, status }) => {
        state.products = products;
        state.status = status;
    }
    const getState = () => state;
    let reqId = 0;
    let lastQuery = '';
    return {

        search: async (query) => {
            if (typeof query !== 'string') throw new Error(error_prefix, 'Query must be a string');
            const normalizedQuery = query.trim();
            if (normalizedQuery === '') {
                setState({ ...initialState });
                lastQuery = '';
                ++reqId;
                return;
            }
            if (lastQuery === normalizedQuery) return;
            lastQuery = normalizedQuery;
            setState({ products: [], status: LOADING });
            const currentReqId = ++reqId;
            try {
                products = await getItems(query);
                if (currentReqId !== reqId) return;
                if (products.length === 0 && !normalizedQuery) {
                    setState({ products: [...products], status: EMPTY })
                    return;
                }
                setState({ products, status: SUCCESS });
            } catch (error) {
                console.error(error_prefix, error);
                setState({ products: [], status: ERROR })
            }
        }
    }

}