import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import aboutRoutes from './routes/aboutRoutes.ts';
import productRoutes from './routes/productRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import { logger } from './middlewares/logger.ts';

process.loadEnvFile()

const app: Application = express();
const port = process.env.PORT || 3000;


// Middleware to log HTTP requests
app.use((req, res, next) => {
  logger.warn(`${req.method} ${req.url}`);
  //console.log(manual console log: ${req.method} ${req.url})
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).send('Internal Server Error');
});

//Routes
app.use('/about', aboutRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!');
});

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});