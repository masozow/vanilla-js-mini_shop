import { CardsGrid } from "../../../shared/ui/components/CardsGrid.js";
import { ProductCard } from "./components/ProductCard.js";
export const ProductView = () => {
    return {
        renderProductsGrid: (data) => {
            return CardsGrid({ data, Component: ProductCard });
        }
    }
}