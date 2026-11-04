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
    let pickedProductsIdList = [];
    const productSignal = createSignal(initialState);
    const lastPickedProductSignal = createSignal({});
    let reqId = 0;
    let lastQuery = '';
    const viewState = () => {
        const currentProducts = productSignal.get().products;
        const pickedProductsIdSet = new Set(pickedProductsIdList);
        return currentProducts.map((product) => ({ ...product, picked: pickedProductsIdSet.has(product.id) }));
    }
    return {
        onProductChange: productSignal.subscribe,
        onProductPicked: lastPickedProductSignal.subscribe,
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
                productSignal.set({ products, status: SUCCESS });
                console.log(viewState());
            } catch (error) {
                if (currentReqId !== reqId) return;
                console.error(error_prefix, error);
                productSignal.set({ products: [], status: ERROR })
            }
        },
        pickProductQuantity: ({ productId, quantity, isPicked = true }) => {
            if (!productId) throw new Error(error_prefix + 'productId is required.');
            const currentProducts = productSignal.get().products;
            const indexOfProductId = currentProducts.findIndex(product => product.id === productId);
            if (indexOfProductId === -1) return;
            const clickedProduct = currentProducts[indexOfProductId];
            const pickedProduct = { ...clickedProduct, picked: isPicked, quantity };
            let currentPickedProductsList = pickedProductsIdList;
            if (pickedProduct.picked)
                currentPickedProductsList = pickedProductsIdList.filter((id) => id !== productId);
            else
                currentPickedProductsList = [...pickedProductsIdList, productId];
            pickedProductsIdList = [...currentPickedProductsList];
            console.log(pickedProductsIdList);
            lastPickedProductSignal.set(pickedProduct);
        }
    }

}