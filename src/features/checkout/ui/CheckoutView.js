import { CheckoutActions } from "./components/CheckoutActions.js";
export const CheckoutView = () => {
    const error_prefix = '[UI error] CheckoutView. ';
    return {
        renderPurchaseButton: ({ resultsHTMLElement, isActive }) => {
            if (!resultsHTMLElement) throw new Error('resultsHTMLElement is required.');
            const { PurchaseButton } = CheckoutActions();
            resultsHTMLElement.insertAdjacentHTML('beforeend', PurchaseButton({
                activeText: 'Buy',
                inactiveText: 'Nothing to buy',
                isActive
            }));
            const renderedButton = resultsHTMLElement.querySelector('[data-action="purchase"]');
            return renderedButton;
        },
        togglePurchaseButtonActiveRender: ({ button, isActive }) => {
            if (!button) throw new Error(error_prefix + ' button is required.');
            const { activeClass, activeText, inactiveText } = button.dataset;
            button.toggleAttribute('disabled', !isActive);
            button.classList.toggle(activeClass, isActive);
            button.textContent = isActive ? activeText : inactiveText;
        }
    }

}