import { CheckoutService } from "./application/CheckoutService.js";
import { CheckoutController } from "./ui/CheckoutController.js";
export const CheckoutModule = async ({ checkoutResults, onPurchaseDone, onClearIntent }) => {
    const error_prefix = '[Feature error] CheckoutModule. ';
    if (!checkoutResults) throw new Error(error_prefix + 'checkoutResults HTML element is required');
    const checkoutService = CheckoutService({ onPurchaseDone, onClearIntent });
    const { renderClearCartButton, renderPurchaseButton, bindActions } = CheckoutController({ service: checkoutService, checkoutResults });
    renderPurchaseButton();
    renderClearCartButton();
    bindActions();
    return checkoutService;
}