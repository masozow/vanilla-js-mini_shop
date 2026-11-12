export const List = ({ items, Component }) => {
    return `
    <div class='list'>
        ${items.map((item) => Component(item)).join('')}
    </div >
    `;
}