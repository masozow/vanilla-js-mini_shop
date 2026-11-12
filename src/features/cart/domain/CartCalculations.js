export const getCartTotals = ({ items, discount = 0 }) => {
    const subTotal = Number(items.reduce((acc, item) => acc + item.subTotal, 0));
    const total = Number(Math.max(subTotal - (discount * 100 * 100), 0));
    return { subTotal, discount, total };
};
export const correctCartTotalsForDisplay = ({ subTotal, discount, total }) => {
    return {
        correctedSubTotal: (subTotal / (100 * 100)).toFixed(2),
        correctedDiscount: Number(discount).toFixed(2),
        correctedTotal: (total / (100 * 100)).toFixed(2)
    }
}

export const cartHasItems = (items) => items.some(item => !item.isDisabled);