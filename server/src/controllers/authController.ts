import type { RequestHandler } from "express"
import bcrypt from "bcrypt"
import User from "../models/user.ts";
import jwt from "jsonwebtoken";
import { logger } from "../middlewares/logger.ts";

export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
}

// create token with user id and type; TODO: add more user info to token later if needed
const createToken = (_id: string, type = 'user') => {
    // expiresIn is set to 1 hour
    return jwt.sign({ _id, type }, process.env.JWT_SECRET ?? '', { expiresIn: "1h" });
};
const createRefreshToken = (_id: string, type = 'user') => {
    // expiresIn is set to 7 days
    return jwt.sign({ _id, type }, process.env.JWT_SECRET ?? '', { expiresIn: "7d" });
};

export const signIn: RequestHandler = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" })
    }
    const emailNorm = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: emailNorm })
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password" })
    }
    const isPasswordValid = await verifyPassword(password, user.password ?? '')
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" })
    }
    const userType = user.type || 'user'
    const token = createToken(user._id.toString(), userType)
    const refreshToken = createRefreshToken(user._id.toString(), userType)
    const session: any = {
        access_token: token,
        refresh_token: refreshToken,
        user: {
            id: user._id.toString(),
            email: user.email,
            type: userType,
        }
    }
    res.header('Authorization', token)
        .send(session)
    logger.info({
        message: 'Signin',
        email: email,
        //requestId: req.id,
        ip: req.ip,
        url: req.url,
    });
}

export const refresh: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Token is required" });
    }
    try {
        const decodedToken = jwt.verify(refreshToken, process.env.JWT_SECRET ?? '')
        //@ts-ignore
        const { _id, type } = decodedToken
        const token = createToken(_id, type || 'user')
        res.header('Authorization', token)
            .send(token);
        logger.info({
            message: 'Refresh Token',
            use_id: _id,
            //requestId: req.id,
            ip: req.ip,
            url: req.url,
        })
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
