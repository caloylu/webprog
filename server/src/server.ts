import express, { type Application, type Request, type Response } from 'express';

process.loadEnvFile()


const app: Application = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World with TypeScript and Express!!!');
});


type UserType = {
    id: number,
    firstName: string,
    lastName: string,
}

const users: UserType[] = [
  { "id": 1, "firstName": "Caloy", "lastName": "Maboloc" },
  { "id": 2, "firstName": "Jb", "lastName": " Canotr" },
  { "id": 3, "firstName": "Jeromy", "lastName": "Soong" }
];

function shuffleArray(array: UserType[]) {
  let currentIndex = array.length
  while (0 !== currentIndex) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const temporaryValue = array[currentIndex];
    if (temporaryValue && array[randomIndex]) {
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        }
    }
    return array;
  }

app.get('/api/users', (req, res) => {
    shuffleArray(users);
  res.status(200).json(users);
});

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});

