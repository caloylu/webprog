import httpClient from "./HttpCommon";

export const listOrders = (params: any) => {
    return httpClient.get('/orders', {
        params: params,
    })
};

export const getOrder = (id: string) => {
    return httpClient.get(`/orders/${id}`)
}

export const createOrder = (order: any) => {
    return httpClient.post('/orders', order)
}

export const updateOrder = (id: string, order: any) => {
    return httpClient.put(`/orders/${id}`, order)
}
