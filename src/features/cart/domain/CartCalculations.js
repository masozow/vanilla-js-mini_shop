export const getCartTotals = ({ items, discount = 0 }) => {
    const subTotal = Number(items.reduce((acc, item) => acc + item.subTotal, 0));
    const total = Number(Math.max(subTotal - (discount * 100 * 100), 0));
    return { subTotal, discount, total };
};

export const cartHasItems = (items) => items.some(item => !item.isDisabled);