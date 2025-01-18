import { Request, Response, NextFunction, RequestHandler } from "express";
import Chat from "../models/Chat";
import User from "../models/User";


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

// Initiate a chat
export const initiateChat = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id; // ID of the authenticated user from the token
    const { userId: targetUserId } = req.body; // ID of the user to chat with
    console.log("Initiating chat with user:", targetUserId, "from user:", userId);

    if (!targetUserId) {
        res.status(400).json({ message: "Target user ID is required" });
        return;
    }

    try {
        // Ensure the target user exists
        const targetUser = await User.findOne({ _id: targetUserId });
        if (!targetUser) {
            res.status(404).json({ message: "Target user not found" });
            return;
        }
        console.log("Target user found:", targetUser);

        // Check if a chat already exists between the users
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        });

        // If no chat exists, create a new one
        const user = await User.findById(userId);
        const userName = user?.username;
        if (!chat) {
            chat = new Chat({
                title: {
                    [targetUserId as string]: { userName: userName, userId: userId },
                    [userId as string]: { userName: targetUser.username || "", userId: targetUserId },
                },
                participants: [userId, targetUserId],
                type: "private", // Set the required field value
                lastUpdated: new Date(),
            });
            await chat.save();
        }
        console.log("Initiated chat:", chat);

        // Respond with the chat ID
        res.status(200).json({ chat });
        return;
    } catch (error: unknown) {
        console.error("Error initiating chat:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};