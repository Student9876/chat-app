import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/Chat";

// Send a new message
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId, senderId, content, type, metadata } = req.body;

        // Validate chat existence
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }

        const newMessage = new Message({
            chatId,
            senderId,
            content,
            type,
            metadata,
        });

        await newMessage.save();

        // Emit the message to connected clients via Socket.IO (real-time functionality handled in socket server)
        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

// Get all messages for a specific chat
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};
