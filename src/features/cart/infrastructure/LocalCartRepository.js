export const LocalCartRepository = (key) => {
    const error_prefix = '[Infra error] LocalCartRepository. ';
    return {
        getCart: () => {
            try {
                return JSON.parse(localStorage.getItem(key)) || [];
            } catch (error) {
                console.error(error_prefix, error);
            }
        },
        setCart: (value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error(error_prefix, error);
            }
        }
    }
}