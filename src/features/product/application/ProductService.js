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
    const productsDisplayState = (data) => {
        const pickedProductsIdSet = new Set(pickedProductsIdList);
        const mergedProductsState = data.map((product) => ({ ...product, picked: pickedProductsIdSet.has(product.id) }));
        return mergedProductsState;
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
                const displayProducts = productsDisplayState(products);
                productSignal.set({ products: displayProducts, status: SUCCESS });
            } catch (error) {
                if (currentReqId !== reqId) return;
                console.error(error_prefix, error);
                productSignal.set({ products: [], status: ERROR })
            }
        },
        pickProductQuantity: ({ productId, isPicked = true }) => {
            if (!productId) throw new Error(error_prefix + 'productId is required.');
            const currentProducts = productSignal.get().products;
            const indexOfProductId = currentProducts.findIndex(product => product.id === productId);
            if (indexOfProductId === -1) return;
            const clickedProduct = currentProducts[indexOfProductId];
            let currentPickedProductsList = pickedProductsIdList;
            if (currentPickedProductsList.includes(productId)) {
                //Only remove from the list if the user wants to remove it,
                //we're not toggling since the product can only be picked or
                //unpicked explicitly.
                if (!isPicked) {
                    currentPickedProductsList = pickedProductsIdList.filter((id) => id !== productId);
                }
            }
            else {
                //We put a guard to not add a product that's already being picked
                if (!clickedProduct.picked)
                    currentPickedProductsList = [...pickedProductsIdList, productId];
            }
            pickedProductsIdList = [...currentPickedProductsList];
            const pickedProduct = { ...clickedProduct, picked: isPicked };
            lastPickedProductSignal.set(pickedProduct);
        }
    }

}