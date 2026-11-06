import { CartView } from "./CartView.js";
import { RenderStatuses } from "../../../shared/ui/components/RenderStatuses.js";
export const CartController = ({ cartResults, service, onRemoveItemIntent = undefined }) => {
    const error_prefix = "[UI error] CartController. ";
    if (!cartResults) throw new Error(error_prefix + 'cartResults HTML element is required');
    if (!service) throw new Error(error_prefix + ' service is required.');
    const { onCartChange, removeFromCart } = service;
    const { isSuccess } = RenderStatuses(cartResults);
    const { renderCartList } = CartView();
    return {
        renderCart: () => {
            onCartChange((cart) => {
                isSuccess(renderCartList(cart))
            })
        },
        removeItem: () => {
            const actions = {
                'remove-from-cart': (itemId) => removeFromCart(Number(itemId))
            }
            cartResults.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const card = btn.closest('[data-component="cart-item"]')
                if (!card) return;
                const id = card.dataset.id;
                const action = actions[btn.dataset.action];
                if (!action) return;
                action(id)
                if (onRemoveItemIntent)
                    onRemoveItemIntent(id);
            });
        }
    }
}