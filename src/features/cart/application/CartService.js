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
            let currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findIndex((item) => item.id === newItem.id);
            if (foundItemIndex !== -1) {
                currentCartItems[foundItemIndex].quantity += newItem.quantity;
                currentCartItems[foundItemIndex].subTotal += newItem.subTotal;
            }
            else {
                currentCartItems = [...currentCartItems, newItem];
            }
            cartSignal.set(currentCartItems);
            setCart(currentCartItems);
        },
        removeFromCart: ({ oldItem }) => {
            if (!oldItem) throw new Error(error_prefix + ' oldItem is required.');
            let currentCartItems = cartSignal.get();
            const foundItemIndex = currentCartItems.findIndex((item) => item.id === oldItem.id);
            if (foundItemIndex !== -1) {
                currentCartItems[foundItemIndex].quantity = 0;
                currentCartItems[foundItemIndex].subTotal = 0;
            }
            cartSignal.set(currentCartItems);
            setCart(currentCartItems);
        }
    }
}