import { esc } from "../../../../shared/utils/escapeHTML.js";
export const ProductCard = (product) => {
    const { id, title, thumbnail, picked, outOfStock, dimensions, ...rest } = product;
    const { width, height } = dimensions;
    const presentationData = {
        dataComponent: 'product-card',
        activeClass: 'picked',
        disabledClass: 'disabled-card',
        btnText: (noStock, picked) => noStock ? 'Out of stock' : (picked ? 'Add more' : 'Add')
    }
    return `
    <article 
        data-id="${esc(id)}"
        data-component="${presentationData.dataComponent}"
        data-active-class="${presentationData.activeClass}"
        data-disabled-class="${presentationData.disabledClass}"
        class='card 
        ${picked ? presentationData.activeClass : ''}
        ${outOfStock ? presentationData.disabledClass : ''}
        '>
        <h3>${esc(title)}</h3>
        ${rest.brand ? `<p>Brand</p><p>${esc(rest.brand)}</p>` : ''}
        ${rest.rating ? `<p>Rating</p><p>${esc(rest.rating)}</p>` : ''}
        ${rest.category ? `<p>Category</p><p>${esc(rest.category)}</p>` : ''}
        <p>Price</p><p>${esc(rest.price)}</p>
        <p>Stock</p><p>${esc(rest.stock)}</p>
        <img 
        loading="lazy" 
        src="${esc(thumbnail)}" 
        alt="${title}" 
        width="${esc(width)}"
        heigth="${esc(height)}"
        />
        <button 
        data-action='pick'
        data-active-text="${presentationData.btnText(false, true)}"
        data-inactive-text="${presentationData.btnText(false, false)}"
        data-outOfStock-text="${presentationData.btnText(true, false)}"
        aria-pressed="${picked ? 'true' : 'false'}"
        ${outOfStock ? 'disabled' : ''}
        >
        ${presentationData.btnText(outOfStock, picked)}
        </button>
    </article>
    `;
};