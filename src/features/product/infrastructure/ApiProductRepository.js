import { Product } from "../domain/Product.js";
import { baseAPIUrl } from "../../../shared/dictionaries/ApiURLs.js";
export const ApiProductRespository = ({ httpClient }) => {
    const error_prefix = '[Infra error] ApiProductRepository';
    return {
        getItems: async (query) => {
            if (typeof query !== 'string') throw new Error(error_prefix, 'Query must be a string');
            if (!query.trim()) return;
            const url = baseAPIUrl + query;
            const response = await httpClient({ url });
            const { products } = response;
            if (!products)
                throw new Error(error_prefix + " Response didn't returned a product object.");
            if (!Array.isArray(products))
                throw new Error(error_prefix + ` Products isn't a valid array:${products}`);
            return products.map((product) => Product(product));
        }
    }
}