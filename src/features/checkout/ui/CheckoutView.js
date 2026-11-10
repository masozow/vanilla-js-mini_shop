import { CheckoutActions } from "./components/CheckoutActions.js";
export const CheckoutView = () => {
    const error_prefix = '[UI error] CheckoutView. ';
    return {
        renderPurchaseButton: ({ container, isActive }) => {
            if (!container) throw new Error(error_prefix + 'container is required.');
            const { PurchaseButton } = CheckoutActions();
            container.insertAdjacentHTML('beforeend', PurchaseButton({
                activeText: 'Buy',
                inactiveText: 'Nothing to buy',
                isActive
            }));
            return container.querySelector('[data-action="purchase"]');
        },
        setPurchaseButtonState: ({ button, isActive }) => {
            if (!button) throw new Error(error_prefix + 'button is required.');
            const { activeClass, activeText, inactiveText } = button.dataset;
            button.toggleAttribute('disabled', !isActive);
            button.classList.toggle(activeClass, isActive);
            button.textContent = isActive ? activeText : inactiveText;
        }
    }

}