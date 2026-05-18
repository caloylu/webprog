import type { UserType } from "../pages/SignUp";
import httpClient from "./HttpCommon";

export const signUp = (user: UserType) => {
    return httpClient.post('/users', {
        user_name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password,
    })
}

export const signIn = (email: string, password: string) => {
    return httpClient.post('/auth/signin', {
        email: email.trim().toLowerCase(),
        password: password,
    })
}