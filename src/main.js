
document.addEventListener('DOMContentLoaded', () => {
    const error_prefix = '[Main] ';
    try {
        //#region DOM elements
        const productResults = document.getElementById('product-results');
        console.dir(productResults);
        //#endregion
    } catch (error) {
        console.error(error_prefix, error);
    }
});