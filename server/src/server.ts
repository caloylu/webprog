import express, { type Application, type NextFunction, type Request, type Response } from "express";
import path from "path";
import cors from "cors";
import aboutRoutes from "./routes/aboutRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import productRoutes from "./routes/productRoutes.ts";
import { logger } from "./middlewares/logger.ts";
import { connectToDatabase, disconnectFromDatabase } from "./db.ts";
import postRoutes from "./routes/postRoutes.ts";
import orderRoutes from "./routes/orderRoutes.ts";
import commentRoutes from "./routes/commentRoutes.ts";
import requireAuth from "./middlewares/requireAuth.ts";
import authRoutes from "./routes/authRoutes.ts";

process.loadEnvFile()

export const app: Application = express()
const port = process.env.PORT || 3000

const corsOptions = {
  origin: ['http://localhost:4000', 'http://localhost:5173', 'https://www.deploymenthost.com'],
  credentials: true // if your app uses cookies/sessions
};

app.use(cors(corsOptions))
app.use(express.json())

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))

// Middleware to log HTTP requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  //console.log(`manual console log: ${req.method} ${req.url}`)
  next()
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).send('Internal Server Error');
});

app.use(requireAuth)

// Routes
app.use('/about', aboutRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/comments', commentRoutes)

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World with TypeScript and Express!!!");
});

console.log('Environment: ' + process.env.NODE_ENV)
if (process.env.NODE_ENV !== "test") {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  process.on("SIGINT", async () => {
    await disconnectFromDatabase();
    console.log("Server shutting down");
    process.exit(0);
  });
}
