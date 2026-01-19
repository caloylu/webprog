import type { RequestHandler } from "express"

export const getAbout:RequestHandler = (req, res) => {
  res.send('This is the about page...')
}

