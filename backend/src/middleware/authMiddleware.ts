import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

interface JwtPayload {
    userId: number;
}

interface AuthRequest extends Request {
    user?: { userId: number };
}

export const authenticate = (
    req:AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try{
        if (!JWT_SECRET || typeof JWT_SECRET !== "string") {
            console.error("JWT_SECRET is not configured properly");
            return res.status(500).json({ error: "JWT secret is not configured" });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.user = { userId: decoded.userId };

        next();

    }
    catch (error) {
        console.error("JWT verification error:", error);
        return res.status(403).json({ error: "Invalid token" });
    }
}



