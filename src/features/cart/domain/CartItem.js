export const CartItem = ({ id, name, price, quantity, isDisabled = false }) => {
    const error_prefix = '[Domain error] CartItem. ';
    if (!id || !name || price === undefined || quantity === undefined)
        throw new Error(error_prefix + ' Some of the required fields is missing.');
    const _quantity = Math.round(Number(quantity) * 100);
    const _price = Math.round(Number(price) * 100);
    const item = {
        id,
        quantity: _quantity,
        name,
        price: _price,
        isDisabled,
        subTotal: Number(_quantity * _price)
    }
    return item;
}
export const CartItemNumbersToRender = ({ quantity, price, subTotal }) => {
    return { correctedQuantity: Number(quantity) / 100, correctedPrice: Number(price) / 100, correctedSubTotal: Number(subTotal) / (100 * 100) }
}