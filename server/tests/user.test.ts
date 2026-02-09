import supertest from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { app } from "../src/server.ts";
import {
    connectToDatabase,
    disconnectFromDatabase,
    clearCollections,
} from "../src/db.ts";

// silence console
jest.spyOn(console, "log").mockImplementation(() => { });
jest.spyOn(console, "error").mockImplementation(() => { });

describe("User API CRUD", () => {

    beforeAll(async () => {
        await connectToDatabase();
    });

    afterAll(async () => {
        await disconnectFromDatabase();
    });

    beforeEach(async () => {
        await clearCollections();
    });

    it("should create user", async () => {
        const user = {
            user_name: "testuser",
            email: "test@email.com",
            password: "123456"
        }

        await supertest(app)
            .post("/api/users")
            .send(user)
            .expect(201);
    });

    it("should not create duplicate user", async () => {
        const user = {
            user_name: "testuser",
            email: "test@email.com",
            password: "123456"
        }

        await supertest(app).post("/api/users").send(user);
        await supertest(app).post("/api/users").send(user).expect(409);
    });

    it("should get users", async () => {
        await supertest(app)
            .get("/api/users")
            .expect(200);
    });

    it("should update user", async () => {

        const create = await supertest(app)
            .post("/api/users")
            .send({
                user_name: "updateuser",
                email: "update@email.com",
                password: "123"
            });

        const id = create.body._id;

        await supertest(app)
            .put("/api/users")
            .send({
                user_name: "updated",
                email: "updated@email.com",
                password: "456"
            })
            .expect(200);
    });

    it("should delete user", async () => {

        const create = await supertest(app)
            .post("/api/users")
            .send({
                user_name: "deleteuser",
                email: "delete@email.com",
                password: "123"
            });

        const id = create.body._id;

        await supertest(app)
            .delete("/api/users")
            .expect(200);
    });

});