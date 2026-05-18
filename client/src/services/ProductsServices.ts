import type { ProductType } from "../pages/Products";
import authHeader from "./AuthHeader";
import httpClient from "./HttpCommon";

export function productImageUrl(imageUrl?: string | null): string | undefined {
    if (!imageUrl) {
        return undefined
    }
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl
    }
    const base = (import.meta.env.VITE_SERVER_BASE_URL || "").replace(/\/$/, "")
    return `${base}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
}

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

export const getProduct = (id: string) => {
    return httpClient.get(`/products/${id}`)
}

export const uploadProductImage = (id: string, file: File) => {
    const body = new FormData()
    body.append("image", file)
    return httpClient.post(`/products/${id}/image`, body, {
        headers: authHeader(),
    })
}
