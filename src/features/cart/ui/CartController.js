export const CartController = ({ cartResults, service, onRemoveItemIntent = undefined }) => {
    const error_prefix = "[UI error] CartController. ";
    if (!cartResults) throw new Error(error_prefix + 'cartResults HTML element is required');
    if (!service) throw new Error(error_prefix + ' service is required.');
    const { onCartChange, removeFromCart, onItemIdRemoved } = service;
    return {
        renderCart: async () => {
            const { CartView } = await import("./CartView.js");
            const { RenderStatuses } = await import("../../../shared/ui/components/RenderStatuses.js");
            const { renderCartList, renderCartRow, updateSpecificRow } = CartView();
            const { isSuccess, isEmpty } = RenderStatuses(cartResults);
            const renderedIds = new Set();
            let isFirstRender = true;
            onCartChange((cart) => {
                console.log(cart);
                if (!Array.isArray(cart)) throw new Error(error_prefix + 'Cart must be an array.');
                if (cart.length === 0) {
                    renderedIds.clear();
                    isEmpty('Dare to add Items.');
                    isFirstRender = true;
                    true;
                }
                if (isFirstRender) {
                    isSuccess(renderCartList(cart));
                    cart.forEach(item => renderedIds.add(item.id));
                    isFirstRender = false;
                    return;
                }
                cart.forEach((item) => {
                    if (!renderedIds.has(item.id)) {
                        cartResults.insertAdjacentHTML('beforeend', renderCartRow(item))
                        renderedIds.add(item.id);
                    }
                });
            });
            onItemIdRemoved((id) => {
                if (id === undefined) throw new Error(error_prefix + 'id is required.');
                const card = cartResults.querySelector(`[data-id="${id}"]`)
                if (!card) return;
                const btn = card.querySelector('[data-action="remove-from-cart"]')
                if (!btn) return;
                const quantity = card.querySelector('[data-item-display="quantity"]');
                if (!quantity) return;
                const subTotal = card.querySelector('[data-item-display="sub-total"]');
                if (!subTotal) return;
                updateSpecificRow({ card, btn, quantity, subTotal });
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