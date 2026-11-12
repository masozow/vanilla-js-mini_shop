import { CheckoutActions } from "./components/CheckoutActions.js";
export const CheckoutView = (resultsHTMLElement) => {
    const error_prefix = '[UI error] CheckoutView. ';
    if (!resultsHTMLElement) throw new Error('resultsHTMLElement is required.');
    const { ActionButton } = CheckoutActions();
    return {
        renderPurchaseButton: (isActive) => {
            resultsHTMLElement.insertAdjacentHTML('beforeend', ActionButton({
                className: 'purchase-button',
                activeClass: 'active-button',
                actionName: 'purchase',
                actionId: 'purchase-button',
                activeText: 'Buy',
                inactiveText: 'Nothing to buy',
                isActive
            }));
            const renderedButton = resultsHTMLElement.querySelector('[data-action="purchase"]');
            return renderedButton;
        },
        toggleActionButtonRender: ({ button, isActive }) => {
            if (!button) throw new Error(error_prefix + ' button is required.');
            const { activeClass, activeText, inactiveText } = button.dataset;
            button.toggleAttribute('disabled', !isActive);
            button.classList.toggle(activeClass, isActive);
            button.textContent = isActive ? activeText : inactiveText;
        },
        renderClearCartButton: (isActive) => {
            resultsHTMLElement.insertAdjacentHTML('beforeend', ActionButton({
                className: 'clear-cart-button',
                activeClass: 'active-button',
                actionName: 'clear-cart',
                actionId: 'clear-cart-button',
                activeText: 'Clear cart',
                inactiveText: 'All clean',
                isActive
            }));
            const renderedButton = resultsHTMLElement.querySelector('[data-action="clear-cart"]');
            return renderedButton;
        },
    }

}