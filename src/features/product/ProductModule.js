import { ProductService } from "./application/ProductService.js";
import { ProductController } from "./ui/ProductController.js";
import { HttpClient } from "../../shared/infrastructure/HttpClient.js";
import { ApiProductRepository } from "./infrastructure/ApiProductRepository.js";
export const ProductModule = async ({ productResults, productSearch }) => {
    const error_prefix = '[Feature error] ProductModule. ';
    if (!productResults) throw new Error(error_prefix + 'productResults HTML element is required.');
    if (!productSearch) throw new Error(error_prefix + 'productSearch input type search is required.');
    const productRepo = ApiProductRepository({ httpClient: HttpClient });
    const productService = ProductService({ productRepo });
    try {

        const {
            searchProducts,
            renderResults,
            pickProduct
        } = ProductController({
            service: productService,
            resultsHTMLComponent: productResults
        })
        await searchProducts(productSearch);
        await renderResults(productResults)
        pickProduct();
    } catch (error) {
        console.error(error_prefix, error);
    }
    return productService;
}