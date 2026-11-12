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
            const _productId = Number(productId);
            const isInList = pickedProductsIdList.includes(_productId);
            if (isPicked && !isInList) {
                pickedProductsIdList = [...pickedProductsIdList, _productId];
            }
            if (!isPicked && isInList) {
                pickedProductsIdList = pickedProductsIdList.filter((id) => id !== _productId);
            }
            const clickedProduct = productSignal.get().products.find((product) => product.id === _productId);
            console.dir({ _productId, isPicked, inList: pickedProductsIdList.includes(_productId), snapshotPicked: clickedProduct.picked });
            if (!clickedProduct) return;
            lastPickedProductSignal.set({ ...clickedProduct, picked: isPicked });
            console.dir({ productId, isPicked, pickedProductsIdList });
        },
        clearProducts: () => {
            pickedProductsIdList = [];
            lastQuery = '';
            ++reqId;
            productSignal.set(initialState);
        }
    }

}