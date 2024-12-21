import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const authenticate: RequestHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Authentication token missing" });
        return; // Explicitly return to avoid further execution
    }

    try {
        console.log("Verifying token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "abcd") as { id: string; email: string };
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        next(); // Proceed to the next middleware/controller
    } catch (error) {
        console.error("JWT verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
        return; // Explicitly return to satisfy the RequestHandler type
    }
};
