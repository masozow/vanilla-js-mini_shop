export const getActiveItems = (items) => items.filter((item) => !item.isDisabled);
export const hasActiveItems = (items) => getActiveItems(items).length > 0;
export const buildOrderWithActiveItems = (items) => ({ items: getActiveItems(items) });