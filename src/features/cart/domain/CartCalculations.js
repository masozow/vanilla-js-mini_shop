export const getCartTotals = ({ items, discount = 0 }) => {
    const subTotal = items.reduce((acc, item) => acc + item.subTotal, 0);
    const total = Math.max(subTotal - (discount * 100 * 100), 0);
    return { subTotal, discount, total };
};