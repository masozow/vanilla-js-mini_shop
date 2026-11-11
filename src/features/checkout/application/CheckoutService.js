import { createSignal } from "../../../shared/store/createSignal.js";
export const CheckoutService = ({ onPurchaseDone }) => {
    const error_prefix = '[Application Error] CheckoutService. ';
    const canPurchaseSignal = createSignal(false);
    return {
        onCanPurchaseChange: canPurchaseSignal.subscribe,
        setCanPurchase: (value) => canPurchaseSignal.set(value),
        purchase: async ({ payload = undefined }) => {
            if (!canPurchaseSignal.get()) return;
            if (payload) {
                console.group('-------Payload------');
                console.log(payload);
                console.groupEnd();
            }
            onPurchaseDone();
        }
    }
}