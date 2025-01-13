import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/Chat";

// Send a new message
import mongoose from "mongoose";
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId, senderId, content, type, metadata } = req.body;
        console.log("Sending message:", content, "from:", senderId, "to chat:", chatId);
        // Validate senderId
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            res.status(400).json({ message: "Invalid senderId" });
            return;
        }

        // Validate chat existence
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }
        console.log("Chat found:", chat);

        // Create and save the message
        const newMessage = new Message({
            chatId,
            senderId,
            content,
            type,
            metadata,
        });

        await newMessage.save();

        chat.messages.push(String(newMessage._id));
        chat.lastUpdated = new Date();
        await chat.save();
        res.status(200).json(newMessage);

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};


// Get all messages for a specific chat
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        console.log("Fetching messages for chat:", chatId);

        // Fetch all messages for the specified chat
        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};


export const saveImageMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId, senderId } = req.body;
        const { fileUrl } = req.body; // This is returned by `uploadImage`

        if (!chatId || !senderId || !fileUrl) {
            res.status(400).json({ message: "chatId, senderId, and fileUrl are required" });
            return;
        }

        const newMessage = await Message.create({
            chatId,
            senderId,
            content: fileUrl,
            type: "image",
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error saving image message:", error);
        res.status(500).json({ message: "Error saving image message", error });
    }
};