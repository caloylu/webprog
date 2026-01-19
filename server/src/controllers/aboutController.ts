import type { RequestHandler } from "express"
import { logger } from "../middlewares/logger.ts"

export const getAbout:RequestHandler = (req, res) => {
  res.send('This is the about page...')
}


export const getError:RequestHandler = (req, res) => {
  //throw new Error("Eror")
  logger.error("eror")
  res.status(500).send('Internal Server Error');
}