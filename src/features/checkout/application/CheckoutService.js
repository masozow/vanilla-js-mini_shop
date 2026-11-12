import { createSignal } from "../../../shared/store/createSignal.js";
import { hasActiveItems, buildOrderWithActiveItems } from "../domain/Order.js";
export const CheckoutService = ({ onPurchaseDone, onClearIntent }) => {
    const error_prefix = '[Application Error] CheckoutService. ';
    const canPurchaseSignal = createSignal(false);
    const canClearSignal = createSignal(false);
    let _payload = [];
    return {
        onCanPurchaseChange: canPurchaseSignal.subscribe,
        onCanClearChange: canClearSignal.subscribe,
        setPayload: (payload) => {
            _payload = structuredClone(payload);
            canPurchaseSignal.set(hasActiveItems(_payload));
        },
        setCanClear: (payload) => {
            canClearSignal.set(payload.length > 0);
        },
        purchase: async () => {
            if (!canPurchaseSignal.get()) return;
            const order = buildOrderWithActiveItems(_payload);
            console.group('-------Payload------');
            console.log(order);
            console.groupEnd();
            onPurchaseDone();
        },
        clearCart: () => {
            if (!canClearSignal.get()) return;
            onClearIntent?.();
        }
    }
}