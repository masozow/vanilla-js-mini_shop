export const ProductCard = (product) => {
    const { id, thumbnail, ...rest } = product;
    return `
    <article data-id="${id}">
    <h3>${rest.title}</h3>
    </article>
    `;
};