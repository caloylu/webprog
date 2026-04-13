import httpClient from "./HttpCommon";

export const listUsers = () => {
    return httpClient.get('/users')
}
