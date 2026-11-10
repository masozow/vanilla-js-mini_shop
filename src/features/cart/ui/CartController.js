export const CartController = ({ cartResults, totalsResults, service, onRemoveItemIntent = undefined }) => {
    const error_prefix = "[UI error] CartController. ";
    if (!cartResults) throw new Error(error_prefix + 'cartResults HTML element is required');
    if (!service) throw new Error(error_prefix + ' service is required.');
    const compositeKey = (id, isDisabled) => `${Number(id)}-${!!isDisabled}`;
    const { onCartChange, removeFromCart, onItemIdRemoved, onTotalChange } = service;
    const shouldUpdateOrInsertRow = ({ item, cachedRenderedIds, updateRowFunction, insertRowAtLastFunction }) => {
        if (!item || !cachedRenderedIds || !updateRowFunction || !insertRowAtLastFunction)
            throw new Error(error_prefix + 'All parameters are required.');
        if (!Array.isArray(cachedRenderedIds))
            throw new Error(error_prefix + 'cachedRenderedIds must be an array like structure.');
        if (item.isDisabled) return;
        const lastRenderedIdPosition = cachedRenderedIds.lastIndexOf(compositeKey(item.id, false));
        lastRenderedIdPosition === -1 ? insertRowAtLastFunction() : updateRowFunction();
    }
    const getLastRowDataById = ({ id, htmlElementToSearchAt }) => {
        if (id === undefined) throw new Error(error_prefix + 'id is required.');
        if (!htmlElementToSearchAt) throw new Error(error_prefix + 'htmlElementToSearchAt is required');
        const cards = htmlElementToSearchAt.querySelectorAll(`[data-id="${id}"]`)
        if (cards.length === 0) return null;
        const card = Array.from(cards).at(-1);
        if (!card) return;
        const btn = card.querySelector('[data-action="remove-from-cart"]')
        if (!btn) return;
        const quantity = card.querySelector('[data-item-display="quantity"]');
        if (!quantity) return;
        const subTotal = card.querySelector('[data-item-display="sub-total"]');
        if (!subTotal) return;
        return { card, btn, quantity, subTotal }
    }
    return {
        renderCart: async () => {
            const { CartView } = await import("./CartView.js");
            const { RenderStatuses } = await import("../../../shared/ui/components/RenderStatuses.js");
            const {
                renderCartList,
                updateSpecificRow,
                replaceCartRow,
                renderCartRowAtEnd,
                renderTotals
            } = CartView();
            const { isSuccess, isEmpty } = RenderStatuses(cartResults);
            let renderedItemIDs = [];
            let isFirstRender = true;
            onTotalChange((data) => {
                renderTotals({ data, totalsHTMLElement: totalsResults })
            });
            onCartChange((cart) => {
                if (!Array.isArray(cart)) throw new Error(error_prefix + 'Cart must be an array.');
                if (cart.length === 0) {
                    renderedItemIDs = [];
                    isEmpty('Dare to add Items.');
                    isFirstRender = true;
                    return;
                }
                if (isFirstRender) {
                    isSuccess(renderCartList(cart));
                    cart.forEach((item) => renderedItemIDs.push(compositeKey(item.id, item.isDisabled)));
                    isFirstRender = false;
                    return;
                }
                cart.forEach((item) => {
                    const itemId = Number(item.id);
                    const updateRowFunction = () => {
                        const { card } = getLastRowDataById({ id: itemId, htmlElementToSearchAt: cartResults });
                        replaceCartRow({ card, item })
                    }
                    shouldUpdateOrInsertRow({
                        item,
                        cachedRenderedIds: renderedItemIDs,
                        updateRowFunction,
                        insertRowAtLastFunction: () => {
                            renderCartRowAtEnd({ item, cartResults });
                            renderedItemIDs.push(compositeKey(item.id, item.isDisabled));
                        }
                    });
                });
            });
            onItemIdRemoved((id) => {
                if (id === undefined) throw new Error(error_prefix + 'id is required.');
                const itemId = Number(id);
                const keyPosition = renderedItemIDs.lastIndexOf(compositeKey(itemId, false));
                if (keyPosition !== -1) renderedItemIDs[keyPosition] = compositeKey(itemId, true);
                const rowData = getLastRowDataById({ id: itemId, htmlElementToSearchAt: cartResults });
                if (!rowData) return;
                const { card, btn, quantity, subTotal } = rowData;
                updateSpecificRow({
                    card: {
                        element: card,
                        shouldDisable: true
                    },
                    btn,
                    quantity: {
                        element: quantity,
                        text: "0"
                    },
                    subTotal: {
                        element: subTotal,
                        text: "0"
                    }
                });
            });
        },
        removeItem: () => {
            const actions = {
                'remove-from-cart': (itemId) => removeFromCart(Number(itemId))
            }
            cartResults.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const card =
                    btn.closest('[data-component="cart-item"]:not(.disabled):not([disabled])');
                if (!card) return;
                const id = card.dataset.id;
                const action = actions[btn.dataset.action];
                if (!action) return;
                action(id)
                if (onRemoveItemIntent)
                    onRemoveItemIntent(Number(id));
            });
        }
    }
}