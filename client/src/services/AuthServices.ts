import type { UserType } from "../pages/SignUp";
import httpClient from "./HttpCommon";

export const signUp = (user: UserType) => {
    return httpClient.post('/users', user)
}

export const signIn = (email: string, password: string) => {
    return httpClient.post('/auth/signin', {
        email: email,
        password: password
    })
}