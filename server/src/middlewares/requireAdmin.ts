import { type NextFunction, type Request, type Response } from "express";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const userType = (req as unknown as { userType?: string }).userType || 'user'
    if (userType !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' })
    }
    next()
}

export default requireAdmin
