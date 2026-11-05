import { createSignal } from "../../../shared/store/createSignal.js";
export const CartService = ({ cartLocalRepo }) => {
    const error_prefix = "[Application error] CartService. ";
    const { getCart, setCart } = cartLocalRepo;
    const currentItems = getCart();
    const cartSignal = createSignal(currentItems);
    return {
        onCartChange: cartSignal.subscribe,
        handleCart: ({ newItem }) => {
            if (!newItem) throw new Error(error_prefix + ' newItem is required.');
            let currentCartItems = cartSignal.get();
            if (currentCartItems.find((item) => item.id === newItem.id))
                currentCartItems = currentCartItems.filter((item) => item.id !== newItem.id);
            else
                currentCartItems = [...currentCartItems, newItem];
            cartSignal.set(currentCartItems);
            setCart(currentCartItems);
        },
    }
}