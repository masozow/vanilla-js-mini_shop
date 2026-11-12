
export const RenderStatuses = (results) => {
    const error_prefix = '[Shared UI] UIStates. ';
    if (!results) throw new Error(error_prefix + 'Results HTML element is required.');
    return {
        isLoading: (featureName = '') => {
            results.innerHTML = `
                <p class='loading'>
                    Loading${featureName ? ' ' + featureName : ''}...
                </p>`
        },
        isError: () => {
            results.innerHTML = `
                <p class='error'>
                    An error has ocurred, try again later.
                </p>`
        },
        isEmpty: (message = '') => {
            results.innerHTML = `
                <p class='empty'>
                    ${message !== '' ? message : 'No data found.'}
                </p>`
        },
        isIdle: (featureName = '') => {
            results.innerHTML = `
                <p class='idle'>
                    Search for some${featureName ? ' ' + featureName : 'thing'}.
                </p>`
        },
        isSuccess: (renderLayout) => {
            results.innerHTML = renderLayout;
        }
    }

}