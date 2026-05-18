import httpClient from "./HttpCommon";

export type CommentPayload = {
  post_id: string;
  content: string;
  comment_id?: string | null;
};

export const listCommentsForPost = (postId: string) => {
  return httpClient.get("/comments", { params: { post_id: postId } });
};

export const createComment = (body: CommentPayload) => {
  return httpClient.post("/comments", body);
};

export const updateComment = (id: string, body: { content: string }) => {
  return httpClient.put(`/comments/${id}`, body);
};
