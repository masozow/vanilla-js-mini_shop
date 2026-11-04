export const createSignal = (initialValue) => {
    const listeners = new Set();
    let value = initialValue;
    const notify = (currentValue) => {
        listeners.forEach(listener => listener(currentValue));
    }
    return {
        get: () => value,
        set: (newValue) => {
            value = newValue;
            notify(value);
        },
        subscribe: (listenerCallbackFn) => {
            listeners.add(listenerCallbackFn);
            listenerCallbackFn(value);
            return () => listeners.delete(listenerCallbackFn);
        }
    }
}