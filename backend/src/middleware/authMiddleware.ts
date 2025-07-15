import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET!;

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
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;

        req.user = { userId: decoded.userId };

        next();

    }
    catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
}



