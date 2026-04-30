import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import { logger } from './logger.ts';

export const getAuthUserId = (authorization: string): string | null => {
    if (!authorization) {
        return null
    }
    const token = authorization.split(" ")[1] ?? ''
    const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET ?? ''
    );
    //@ts-ignore
    const { _id } = decodedToken
    return _id || null
}

// requireAuth middleware is applied to all routes except /signin, /refresh and other public routes
// to prevent unauthenticated users from accessing protected routes
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/api/auth/signin" ||
        req.path === "/api/auth/refresh" ||
        req.path === "/api/users" && req.method === 'POST' ||    // for register, TODO: no verification for now, will add later
        req.path === "/" ||
        req.path === "/error" ||
        req.path.startsWith("/api/posts") && req.method === 'GET' ||
        req.path.startsWith("/api/products") && req.method === 'GET'
    ) {
        return next();
    }
    // verify user is authenticated
    const { authorization } = req.headers;

    if (!authorization) {
        logger.error({
            error: "Authorization token required",
            ip: req.ip,
            url: req.url,
        });
        return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authorization.split(" ")[1] ?? ''

    try {
        // verify token
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET ?? ''
        );
        //@ts-ignore
        const { _id } = decodedToken;
        if (!_id) {
            logger.error({
                error: "Invalid token",
                ip: req.ip,
                url: req.url,
            });
            throw "Invalid token"
        }
        // can't do it here because body is not yet fully loaded so user_id is still undefined
        /*if (req.path.startsWith("/api/posts") && req.method === 'PUT' && _id !== req.body.user_id) {
            console.log("User ID from token:", _id);
            console.log("User ID from request body:", req.body.user_id);
            throw "User can only edit his/her own posts"
        }*/
        logger.info({
            message: "user is authenticated: " + _id,
            ip: req.ip,
            url: req.url,
        });
        next();
    } catch (error) {
        const message = "Request is not authorized. " + (error instanceof Error ? error.message : String(error))
        logger.error({
            error: message,
            ip: req.ip,
            url: req.url,
        });
        //console.log("Error while authenticating : ", error);
        return res.status(401).json({ error: message });
    }
}

export default requireAuth