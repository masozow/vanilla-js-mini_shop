export const CartService = ({ cartLocalRepo }) => {
    const error_prefix = "[Application error] CartService. ";
    const { getCart, setCart } = cartLocalRepo;
    return {
        addToCart: ({ product }) => {
            console.log(product);
        }
    }
}