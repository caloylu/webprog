import type { RequestHandler } from "express";

type UserType = {
    id: number,
    firstName: string,
    lastName: string,
}
const users: UserType[] = [
  { "id": 1, "firstName": "Jomin", "lastName": "Yu" },
  { "id": 2, "firstName": "Esmy", "lastName": "Yu" },
  { "id": 3, "firstName": "Friend Juan", "lastName": "Last Friend" },
  { "id": 4, "firstName": "Another Friend", "lastName": "Poe" }
];

function shuffleArray(array: UserType[]) {
    let currentIndex = array.length
    while (0 !== currentIndex) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1
        const temporaryValue = array[currentIndex]
        if (temporaryValue && array[randomIndex]) {
            array[currentIndex] = array[randomIndex]
            array[randomIndex] = temporaryValue
        }
    }
    return array
}

// Route to get all users
export const getUsers:RequestHandler = (req, res) => {
    shuffleArray(users);
  // Use res.json() to send the array as a JSON response
  res.status(200).json(users)
};