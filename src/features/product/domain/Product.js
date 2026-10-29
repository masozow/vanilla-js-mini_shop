export const Product = ({ id, title, price, thumbnail, stock, brand, rating, category }) => {
    const error_prefix = '[Domain error] Product';
    if (!id || !title || price === undefined || !thumbnail || stock === undefined)
        throw new Error(error_prefix + 'Some of the required fields are missing');
    const product = {
        id,
        title,
        price,
        thumbnail,
        stock,
        brand,
        rating,
        category,
        outOfStock: Number(stock) === 0
    }
    return product;
}