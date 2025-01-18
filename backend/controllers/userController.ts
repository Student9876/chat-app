import { Request, Response } from "express";
import User from "../models/User";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

export const searchUsers = async (req: Request, res: Response) => {
    const { query } = req.query;
    console.log("Searching for users with query:", query);

    try {
        const users = await User.find({ email: { $regex: query, $options: "i" } });
        console.log("Found users:", users);
        const users_ = users.map(user => ({
            id: String(user._id),
            username: user.username,
            email: user.email
        }))
        res.status(200).json({ results: users_ });
        return;
    } catch (error) {
        console.error("Failed to search users:", error);
        res.status(500).json({ message: "Failed to search users" });
    }
}


export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    console.log("Fetching current user:", userId);
    const user = await User.findById(userId);
    console.log("Current user:", user);
    const user_ = {
        id: String(user?._id),
        username: user?.username,
        email: user?.email
    }
    res.status(200).json({ user: user_ });
    return;
}
