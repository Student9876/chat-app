import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import Message from "../models/Message"; // Import your Message model

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
        const uniqueFileName = `${Date.now()}-${req.file.originalname}`;
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

        // Respond with success and the saved message
        res.status(200).json({
            message: "Image uploaded and message saved successfully",
            fileUrl,
            savedMessage: newMessage,
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Error uploading image", error });
    }
};
