import { CheckoutService } from "./application/CheckoutService.js";
import { CheckoutController } from "./ui/CheckoutController.js";
export const CheckoutModule = async ({ checkoutResults, onPurchaseDone }) => {
    const error_prefix = '[Feature error] CheckoutModule. ';
    if (!checkoutResults) throw new Error(error_prefix + 'checkoutResults HTML element is required');
    const checkoutService = CheckoutService({ onPurchaseDone });
    const { renderButton, bindActions } = CheckoutController({ service: checkoutService, checkoutResults });
    renderButton();
    bindActions();
    return checkoutService;
}