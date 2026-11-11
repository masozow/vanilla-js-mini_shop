import { esc } from "../../../../shared/utils/escapeHTML.js"
export const CheckoutActions = () => {
    return {
        PurchaseButton: ({ activeText, inactiveText, isActive = true }) => {
            const presentationData = {
                btnText: (active) => active ? activeText : inactiveText,
                activeClass: 'active-button'
            }
            return `
                    <button
                    data-action="purchase"
                    data-active-class="${esc(presentationData.activeClass)}"
                    data-active-text="${esc(presentationData.btnText(true))}"
                    data-inactive-text="${esc(presentationData.btnText(false))}"
                    class='purchase-button ${isActive ? presentationData.activeClass : ''}'
                    ${isActive ? '' : 'disabled'}
                    id="purchase-button"
                    >
                        ${esc(presentationData.btnText(isActive))}
                    </button>
                `
        }
    }
}
