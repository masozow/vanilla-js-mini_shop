import { CheckoutView } from "./CheckoutView.js";
export const CheckoutController = ({ checkoutResults, service }) => {
    const error_prefix = '[UI Error] CheckoutController. ';
    if (!checkoutResults) throw new Error(error_prefix + 'checkoutResults HTML element is required.');
    if (!service) throw new Error(error_prefix + 'service is required.');
    const { renderPurchaseButton, renderClearCartButton, toggleActionButtonRender } = CheckoutView(checkoutResults);
    const { onCanPurchaseChange, purchase } = service;
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
            onCanPurchaseChange((canPurchase) => {
                if (!button) {
                    button = renderClearCartButton(canPurchase)
                    return;
                }
                toggleActionButtonRender({ button, isActive: canPurchase });
            })
        },
        bindActions: () => {
            const actions = {
                'purchase': async () => { await purchase() },
                'clear-cart': () => console.log('Clear cart')
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