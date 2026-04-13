import supertest from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { app } from "../src/server.ts";
import {
  connectToDatabase,
  disconnectFromDatabase,
  clearCollections,
} from "../src/db.ts";
import { Types } from "mongoose";
import Comment from "../src/models/comment.ts";

// silence logs
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("Comment API CREATE", () => {

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  const postId = new Types.ObjectId();
  const userId = new Types.ObjectId();


  it("should validate required fields", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({});

    expect(result.status).toBe(422);
    expect(result.body._message).toBe("Comment validation failed");
  });

  it("should validate missing post_id", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({
        user_id: userId,
        user_name: "John",
        content: "Test comment"
      });

    expect(result.status).toBe(422);
  });

  it("should validate missing user_id", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_name: "John",
        content: "Test comment"
      });

    expect(result.status).toBe(422);
  });

  it("should validate missing user_name", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_id: userId,
        content: "Test comment"
      });

    expect(result.status).toBe(422);
  });

  it("should validate missing content", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_id: userId,
        user_name: "John"
      });

    expect(result.status).toBe(422);
  });

  
  it("should create a root comment", async () => {
    const result = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_id: userId,
        user_name: "John",
        content: "Root comment"
      });

    expect(result.status).toBe(201);
    expect(result.body.content).toBe("Root comment");
    expect(result.body.comment_id).toBeFalsy();
  });

  it("should create a reply comment", async () => {
    const level1 = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_id: userId,
        user_name: "John",
        content: "Root comment"
      });

    const level2 = await supertest(app)
      .post(`/api/comments`)
      .send({
        post_id: postId,
        user_id: userId,
        user_name: "John",
        content: "Reply comment",
        comment_id: level1.body._id
      });

    expect(level2.status).toBe(201);
    expect(level2.body.comment_id.toString()).toBe(level1.body._id.toString());
  });
});
