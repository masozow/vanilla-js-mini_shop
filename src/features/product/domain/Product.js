export const Product = ({ id, title, price, thumbnail, stock, brand, rating, category, inCart = false, dimensions = {}, availabilityStatus = "In Stock" }) => {
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
        outOfStock: Number(stock) === 0 || availabilityStatus === 'Out of Stock',
        inCart,
        dimensions
    }
    return product;
}