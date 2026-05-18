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

function requestPathname(req: Request): string {
    const raw = req.originalUrl || req.url || ""
    const q = raw.indexOf("?")
    return (q === -1 ? raw : raw.slice(0, q)) || req.path || ""
}

// requireAuth middleware is applied to all routes except /signin, /refresh and other public routes
// to prevent unauthenticated users from accessing protected routes
interface AuthenticatedRequest extends Request {
    userId?: string
    userType?: string
}

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const pathname = requestPathname(req)
    const method = (req.method || "GET").toUpperCase()

    if (
        (method === "POST" && pathname === "/api/auth/signin") ||
        (method === "POST" && pathname === "/api/auth/refresh") ||
        (method === "POST" && pathname === "/api/users") ||
        pathname === "/" ||
        pathname === "/error" ||
        (method === "GET" && pathname.startsWith("/api/posts")) ||
        (method === "GET" && pathname.startsWith("/api/products")) ||
        (method === "GET" && pathname.startsWith("/api/comments")) ||
        (method === "GET" && pathname.startsWith("/uploads/"))
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
        const { _id, type } = decodedToken;
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
        req.userId = _id
        req.userType = type || 'user'
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