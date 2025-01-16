import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import Message from "../models/Message"; // Import your Message model
import { nanoid } from "nanoid";
import Chat from "../models/Chat";

// Ensure a folder exists, create it if it doesn't
const ensureFolderExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};


// Handle image upload, save to public folder, and save as a message
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId, senderId } = req.body;
        console.log("This is image controller", chatId, senderId);

        const publicFolderPath = path.join(__dirname, "../../public");
        const chatFolderPath = path.join(publicFolderPath, chatId);

        // Ensure the chat folder exists
        ensureFolderExists(chatFolderPath);

        if (!req.file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }

        // Generate a unique file name (e.g., using timestamp + original name)
        const fileExtension = path.extname(req.file.originalname);
        const uniqueFileName = `${nanoid()}${fileExtension}`;
        const filePath = path.join(chatFolderPath, uniqueFileName);

        // Save the file to the chat folder
        fs.writeFileSync(filePath, req.file.buffer);

        const fileUrl = `/${chatId}/${uniqueFileName}`;

        const newMessage = new Message({
            chatId,
            senderId,
            content: fileUrl,
            type: "image",
        });
        await newMessage.save();
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }
        console.log("Chat found:", chat);

        chat.messages.push(String(newMessage._id));
        chat.lastUpdated = new Date();
        await chat.save();
        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image", error });
    }
};
