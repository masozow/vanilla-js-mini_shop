import { createSignal } from "../../../shared/store/createSignal.js";
import { getCartTotals } from "../domain/CartCalculations.js";
export const CartService = ({ cartLocalRepo }) => {
    const error_prefix = "[Application error] CartService. ";
    const { getCart, setCart } = cartLocalRepo;
    const currentItems = getCart();
    const cartSignal = createSignal(currentItems);
    const discountSignal = createSignal(0);
    const lastRemovedItemIdSignal = createSignal(0);
    return {
        onCartChange: cartSignal.subscribe,
        onItemIdRemoved: lastRemovedItemIdSignal.subscribe,
        onTotalChange: (listener) => {
            const listenerWrapper = () =>
                listener(
                    getCartTotals({
                        items: cartSignal.get(),
                        discount: discountSignal.get()
                    })
                );
            cartSignal.subscribe(listenerWrapper);
            discountSignal.subscribe(listenerWrapper);
        }
        ,
        addToCart: ({ newItem }) => {
            if (!newItem) throw new Error(error_prefix + ' newItem is required.');
            const currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findLastIndex((item) => item.id === newItem.id && !item.isDisabled);
            let updatedCartItems;
            if (foundItemIndex === -1) {
                updatedCartItems = [...currentCartItems, structuredClone(newItem)];
            }
            else {
                updatedCartItems = currentCartItems.map((item, index) => {
                    if (index !== foundItemIndex) return item;
                    return {
                        ...item,
                        quantity: item.quantity + newItem.quantity,
                        subTotal: item.subTotal + newItem.subTotal
                    }
                })
            }
            cartSignal.set(updatedCartItems);
            setCart(updatedCartItems);
        },
        removeFromCart: (itemId) => {
            if (itemId === undefined) throw new Error(error_prefix + ' itemId is required.');
            const currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findLastIndex((item) => item.id === itemId);
            if (foundItemIndex === -1) return;
            const updatedCartItems = currentCartItems.map((item, index) => {
                if (index !== foundItemIndex) return item;
                return {
                    ...item,
                    quantity: 0,
                    subTotal: 0,
                    isDisabled: true
                }
            })
            cartSignal.set(updatedCartItems);
            lastRemovedItemIdSignal.set(itemId);
            setCart(updatedCartItems);
        },
        cleanCart: () => {
            lastRemovedItemIdSignal.set(0);
            cartSignal.set([]);
            setCart([]);
        }
    }
}