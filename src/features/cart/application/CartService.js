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
        cartItems: cartSignal.get(),
        onItemIdRemoved: lastRemovedItemIdSignal.subscribe,
        // This function lets the outside world subscribe to "totals" changes.
        // `listener` is the function that'll be executed outside, with the data
        // we send to it.
        onTotalChange: (listener) => {
            // Wrapper: the function the signals will actually call.
            // It's a closure, so it remembers `listener`, and to that listener
            // is who we're sending the transformed data.
            // The listener is outside the service.
            const listenerWrapper = () => {
                // Getting the shape of the object we wanna send to whoever
                // is listening to this event.
                // Ignores the value the signal passes in; it reads both current
                // values with get(), because totals depend on cart AND discount
                const totals = getCartTotals({
                    items: cartSignal.get(),
                    discount: discountSignal.get()
                })
                // Calls the real listener and passes to it the raw totals
                // (subTotal, discount, total, still scaled)
                listener(
                    totals
                );
            }
            //We subscribe to both signals, by storing the 'listener wrapper' in both signals' registries.
            //So each signal will execute this function whenever there's a change
            //in its state. When that happens, we notify of the state change
            //to the real listener outside the service. But this time we don't send the
            //data that "set" will write in the signal, we send data we need outside,
            //which has to be recalculated whenever either signal is triggered by a "set" event
            const unsubscribeCart = cartSignal.subscribe(listenerWrapper);
            const unsubscribeDiscount = discountSignal.subscribe(listenerWrapper);
            //We store the unsubscribe function for both signals and package them
            //in a single function to send it back to whoever is listening to this event.
            //This function removes the wrapper from both signals,
            return () => {
                unsubscribeCart();
                unsubscribeDiscount();
            }
        },
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