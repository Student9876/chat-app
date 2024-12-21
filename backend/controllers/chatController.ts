import { Request, Response, NextFunction, RequestHandler } from "express";
import Chat from "../models/Chat";

// Custom request type with user property
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

// Controller to get user chats
export const getUserChats: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        console.log("Fetching chats for user:", userId);
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return; // Explicitly return to avoid further execution
        }

        // Fetch chats where the user is a participant
        const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
        console.log("Fetched user chats:", chats);
        res.status(200).json({ success: true, chats });
    } catch (error) {
        console.error("Error fetching user chats:", error);
        next(error); // Pass error to the error-handling middleware
    }
};
