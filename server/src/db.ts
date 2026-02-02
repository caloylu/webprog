import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const connectURI = process.env.DB_URI || ''

let mongodb: MongoMemoryServer

export async function connectToDatabase() {
  if (process.env.NODE_ENV === "test") {
    if(!mongodb) {
    mongodb = await MongoMemoryServer.create();
    }
    const uri = mongodb.getUri();

    await mongoose.connect(uri);

    console.log("Connected to in-memory database");

    return;
  }

  try {
    await mongoose.connect(connectURI);

    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

export async function disconnectFromDatabase() {
  if (process.env.NODE_ENV === "test") {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongodb.stop();
  }

  await mongoose.disconnect();

  console.log("Disconnected from database");
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;

  if (process.env.NODE_ENV !== "test") {
    throw new Error("clearCollections can only be used in test environment");
  }

  for (const key in collections) {
    const collection = collections[key];
    await collection?.deleteMany();
  }
}