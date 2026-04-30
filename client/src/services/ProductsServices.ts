
import type { ProductType } from "../pages/Products";
import authHeader from "./AuthHeader";
import httpClient from "./HttpCommon";

export const listProducts = (params: any) => {
    //console.log(authHeader())
    return httpClient.get('/products', {
        params: params,
        //headers: authHeader()
    })
};


export const createProduct = (product: ProductType) => {
    return httpClient.post('/products', product, {
        headers: authHeader()
    });
}

export const updateProduct = (id: string, product: ProductType) => {
    return httpClient.put(`/products/${id}`, product, {
        headers: authHeader()
    });
}
