export const CardsGrid = ({ data, Component }) => {
    return `
        <div class="grid">
            ${data.map((d) => Component(d)).join('')}
        </div > 
    `;
}