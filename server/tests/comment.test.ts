import supertest from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { app } from "../src/server.ts";
import {
  connectToDatabase,
  disconnectFromDatabase,
  clearCollections,
} from "../src/db.ts";
import { Types } from "mongoose";
import Comment from "../src/models/comment.ts";
import User from "../src/models/user.ts";
import Post from "../src/models/post.ts";

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

function authAs(userId: string) {
  const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET ?? "", { expiresIn: "1h" });
  return { Authorization: `Bearer ${token}` };
}

describe("Comment API", () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  let postId: string;
  let userId: string;
  let userName: string;

  beforeEach(async () => {
    await clearCollections();
    const user = await User.create({
      user_name: "commentuser",
      email: "comment@test.com",
      password: "testpassword",
    });
    userId = user._id.toString();
    userName = user.user_name;
    const post = await Post.create({
      title: "Post for comments",
      content: "body",
      user_id: userId,
      username: userName,
    });
    postId = post._id.toString();
  });

  it("should validate missing post_id when authenticated", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        content: "Test comment",
      });

    expect(result.status).toBe(422);
    expect(result.body.message).toBe("post_id is required");
  });

  it("should validate missing content when authenticated", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: postId,
      });

    expect(result.status).toBe(422);
    expect(result.body.message).toBe("content is required");
  });

  it("should reject unknown post", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: new Types.ObjectId().toString(),
        content: "x",
      });

    expect(result.status).toBe(404);
  });

  it("should create a root comment with author from JWT", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: postId,
        content: "Root comment",
      });

    expect(result.status).toBe(201);
    expect(result.body.content).toBe("Root comment");
    expect(result.body.user_name).toBe(userName);
    expect(result.body.user_id.toString()).toBe(userId);
    expect(result.body.comment_id).toBeFalsy();
  });

  it("should ignore spoofed user_id in body and use JWT subject", async () => {
    const other = await User.create({
      user_name: "otheru",
      email: "otheru@test.com",
      password: "pw",
    });
    const result = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: postId,
        user_id: other._id.toString(),
        content: "From JWT only",
      });

    expect(result.status).toBe(201);
    expect(result.body.user_id.toString()).toBe(userId);
    expect(result.body.user_name).toBe(userName);
  });

  it("should create a reply comment", async () => {
    const level1 = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: postId,
        content: "Root comment",
      });

    const level2 = await supertest(app)
      .post(`/api/comments`)
      .set(authAs(userId))
      .send({
        post_id: postId,
        content: "Reply comment",
        comment_id: level1.body._id,
      });

    expect(level2.status).toBe(201);
    expect(level2.body.comment_id.toString()).toBe(level1.body._id.toString());
  });

  it("should forbid editing another user's comment", async () => {
    const owner = await User.create({
      user_name: "owner",
      email: "owner@test.com",
      password: "p1",
    });
    const other = await User.create({
      user_name: "other",
      email: "other@test.com",
      password: "p2",
    });
    const ownerId = owner._id.toString();
    const otherId = other._id.toString();
    const post = await Post.create({
      title: "Post for comment updates",
      content: "body",
      user_id: ownerId,
      username: owner.user_name,
    });
    const pid = post._id.toString();

    const created = await Comment.create({
      post_id: pid,
      user_id: ownerId,
      user_name: "owner",
      content: "original",
    });

    const result = await supertest(app)
      .put(`/api/comments/${created._id}`)
      .set(authAs(otherId))
      .send({
        content: "hacked",
      });

    expect(result.status).toBe(403);
    const unchanged = await Comment.findById(created._id);
    expect(unchanged?.content).toBe("original");
  });

  it("should allow owner to edit their comment", async () => {
    const owner = await User.create({
      user_name: "owner2",
      email: "owner2@test.com",
      password: "p1",
    });
    const ownerId = owner._id.toString();
    const post = await Post.create({
      title: "Post for owner edit",
      content: "body",
      user_id: ownerId,
      username: owner.user_name,
    });
    const pid = post._id.toString();

    const created = await Comment.create({
      post_id: pid,
      user_id: ownerId,
      user_name: "owner2",
      content: "original",
    });

    const result = await supertest(app)
      .put(`/api/comments/${created._id}`)
      .set(authAs(ownerId))
      .send({
        content: "updated text",
      });

    expect(result.status).toBe(200);
    expect(result.body.content).toBe("updated text");
  });

  it("should require non-empty content on update", async () => {
    const created = await Comment.create({
      post_id: postId,
      user_id: userId,
      user_name: userName,
      content: "original",
    });

    const result = await supertest(app)
      .put(`/api/comments/${created._id}`)
      .set(authAs(userId))
      .send({
        content: "   ",
      });

    expect(result.status).toBe(422);
  });
});
