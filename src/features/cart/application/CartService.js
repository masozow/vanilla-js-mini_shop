import { createSignal } from "../../../shared/store/createSignal.js";
export const CartService = ({ cartLocalRepo }) => {
    const error_prefix = "[Application error] CartService. ";
    const { getCart, setCart } = cartLocalRepo;
    const currentItems = getCart();
    const cartSignal = createSignal(currentItems);
    return {
        onCartChange: cartSignal.subscribe,
        addToCart: ({ newItem }) => {
            if (!newItem) throw new Error(error_prefix + ' newItem is required.');
            const currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findIndex((item) => item.id === newItem.id);
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
        removeFromCart: ({ oldItem }) => {
            if (!oldItem) throw new Error(error_prefix + ' oldItem is required.');
            const currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findIndex((item) => item.id === oldItem.id);
            if (foundItemIndex === -1) return;
            const updatedCartItems = currentCartItems.map((item, index) => {
                if (index !== foundItemIndex) return item;
                return {
                    ...item,
                    quantity: 0,
                    subTotal: 0
                }
            })
            cartSignal.set(updatedCartItems);
            setCart(updatedCartItems);
        },
        cleanCart: () => {
            cartSignal.set([]);
            setCart([]);
        }
    }
}