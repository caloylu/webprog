import type { RequestHandler } from "express"

export const getProducts:RequestHandler = (req, res) => {
  res.send('This is the products page!')
}