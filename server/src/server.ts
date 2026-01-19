import express, { type Application, type Request, type Response } from 'express';
import aboutRoutes from './routes/aboutRoutes.ts';
import productRoutes from './routes/productRoutes.ts';
import userRoutes from './routes/userRoutes.ts';

process.loadEnvFile()

const app: Application = express();
const port = process.env.PORT || 3000;

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