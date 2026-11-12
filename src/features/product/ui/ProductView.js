import { CardsGrid } from "../../../shared/ui/components/CardsGrid.js";
import { ProductCard } from "./components/ProductCard.js";
export const ProductView = () => {
    return {
        renderProductsGrid: (data) => {
            return CardsGrid({ data, Component: ProductCard });
        },
        transformSpecificProductCard: ({ product, card, btn, input }) => {
            const cardActiveClass = card.dataset.activeClass;
            const btnActiveText = btn.dataset.activeText;
            const btnInactiveText = btn.dataset.inactiveText;
            const defaultValue = Number(input.dataset.defaultValue);

            if (product.picked) {
                card.classList.add(cardActiveClass);
                btn.textContent = btnActiveText
            }
            else {
                btn.textContent = btnInactiveText;
                card.classList.remove(cardActiveClass);
            }
            input.value = defaultValue;
        }
    }
}