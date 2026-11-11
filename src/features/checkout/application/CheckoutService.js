import { createSignal } from "../../../shared/store/createSignal.js";
import { hasActiveItems, buildOrderWithActiveItems } from "../domain/Order.js";
export const CheckoutService = ({ onPurchaseDone }) => {
    const error_prefix = '[Application Error] CheckoutService. ';
    const canPurchaseSignal = createSignal(false);
    let _payload = [];
    return {
        onCanPurchaseChange: canPurchaseSignal.subscribe,
        setPayload: (payload) => {
            _payload = structuredClone(payload);
            canPurchaseSignal.set(hasActiveItems(payload));
        },
        purchase: async () => {
            if (!canPurchaseSignal.get()) return;
            const order = buildOrderWithActiveItems(_payload);
            console.group('-------Payload------');
            console.log(order);
            console.groupEnd();
            onPurchaseDone();
        }
    }
}