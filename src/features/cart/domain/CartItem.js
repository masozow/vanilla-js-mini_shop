export const CartItem = ({ id, name, price, quantity }) => {
    const error_prefix = '[Domain error] CartItem. ';
    if (!id || !name || price === undefined || quantity === undefined)
        throw new Error(error_prefix + ' Some of the required fields is missing.');
    const _quantity = Number(quantity) * 100;
    const _price = Number(price) * 100;
    const item = {
        id,
        quantity: _quantity / 100,
        name,
        price: _price / 100,
        subTotal: Number(_quantity * _price) / 10000
    }
    return item;
}