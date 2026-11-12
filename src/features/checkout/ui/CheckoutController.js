import { CheckoutView } from "./CheckoutView.js";
export const CheckoutController = ({ checkoutResults, service }) => {
    const error_prefix = '[UI Error] CheckoutController. ';
    if (!checkoutResults) throw new Error(error_prefix + 'checkoutResults HTML element is required.');
    if (!service) throw new Error(error_prefix + 'service is required.');
    const { renderPurchaseButton, renderClearCartButton, toggleActionButtonRender } = CheckoutView(checkoutResults);
    const { onCanPurchaseChange, onCanClearChange, purchase, clearCart } = service;
    return {
        renderPurchaseButton: () => {
            let button = null;
            onCanPurchaseChange((canPurchase) => {
                if (!button) {
                    button = renderPurchaseButton(canPurchase);
                    return;
                }
                toggleActionButtonRender({ button, isActive: canPurchase });
            })
        },
        renderClearCartButton: () => {
            let button = null;
            onCanClearChange((canClear) => {
                if (!button) {
                    button = renderClearCartButton(canClear)
                    return;
                }
                toggleActionButtonRender({ button, isActive: canClear });
            })
        },
        bindActions: () => {
            const actions = {
                'purchase': async () => { await purchase() },
                'clear-cart': () => clearCart()
            }
            checkoutResults.addEventListener('click', async (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const action = actions[btn.dataset.action];
                if (!action) return;
                await action();
            });
        }
    }

}