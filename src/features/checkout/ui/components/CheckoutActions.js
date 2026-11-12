import { esc } from "../../../../shared/utils/escapeHTML.js"
export const CheckoutActions = () => {
    return {
        ActionButton: ({ className, activeClass, actionName, actionId, activeText, inactiveText, isActive = true }) => {
            const presentationData = {
                btnText: (active) => active ? activeText : inactiveText,
            }
            return `
                    <button
                    data-action="${esc(actionName)}"
                    data-active-class="${esc(activeClass)}"
                    data-active-text="${esc(presentationData.btnText(true))}"
                    data-inactive-text="${esc(presentationData.btnText(false))}"
                    class='${esc(className)} ${isActive ? activeClass : ''}'
                    ${isActive ? '' : 'disabled'}
                    id="${esc(actionId)}"
                    >
                        ${esc(presentationData.btnText(isActive))}
                    </button>
                `
        },
    }
}
