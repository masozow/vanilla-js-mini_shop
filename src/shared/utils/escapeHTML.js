export const esc = (value) => {
    const escapeHTML = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }
    return String(value).replaceAll(/[&<>"']/g, (char) => escapeHTML[char]);
}