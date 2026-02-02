import supertest from "supertest";
import { afterAll, beforeAll, beforeEach, describe, it, jest } from "@jest/globals";
import { app } from "../src/server.ts";
import {
  connectToDatabase,
  disconnectFromDatabase,
  clearCollections,
} from "../src/db.ts";

// silence console.log and console.error
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("Product API PUT", () => {
  const productId = "c3fe7eb8076e4de58d8d87c5";

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  beforeEach(async () => {
    await clearCollections();
  });

  it("should create a product", async () => {
    const product = {
      name: "Test Product",
      description: "Test description",
      price: 100,
      qty: 5
    };

    await supertest(app)
      .post(`/api/products`)
      .send(product)
      .expect(200);
  });

  it("should return 404 if product is invalid/not found", async () => {
    const product = {
      name: "Test Product",
      description: "Test description",
      price: -1,
      qty: 0
    };

    await supertest(app)
      .put(`/api/products/${productId}`)
      .send(product)
      .expect(404);
  });
});