import type { PostType } from "../pages/Posts";
import httpClient from "./HttpCommon";

export const listPosts = (params: any) => {
    //console.log(authHeader())
    return httpClient.get('/posts', {
        params: params,
        //headers: authHeader()
    })
};


export const createPost = (post: PostType) => {
    return httpClient.post('/posts', post, {
        //headers: authHeader()
    });
}

export const updatePost = (id: string, post: PostType) => {
    return httpClient.put(`/posts/${id}`, post, {
        //headers: authHeader()
    });
}
