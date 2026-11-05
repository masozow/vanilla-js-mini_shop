import { CartItem } from "../../features/cart/domain/CartItem.js";
export const mapProductToCartItem = (pickedProductPayload) => {
    const { id, title, brand, category, price, quantity } = pickedProductPayload;
    const name = `${title} - ${brand ? brand : ' - '}${category}`;
    return CartItem({
        id,
        name,
        price,
        quantity
    })
}