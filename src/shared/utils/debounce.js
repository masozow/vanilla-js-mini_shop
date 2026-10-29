export const debounce = (fn, delay) => {
    const error_prefix = '[Utils] Debounce. ';
    if (typeof fn !== 'function') throw new Error(error_prefix + 'fn must be a function.');
    if (typeof delay !== 'number') throw new Error(error_prefix + 'delay must be a number.');
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    }
}