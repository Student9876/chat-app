import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/Chat";
import cloudinary from "../utils/cloudinary";
import { Readable } from "stream";
import { CloudinaryResource } from "@cloudinary-util/types";

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chatId, senderId } = req.body;
        console.log("This is image controller", chatId, senderId);

        if (!req.file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }

        // Create a stream from the buffer
        const stream = Readable.from(req.file.buffer);

        // Upload directly to Cloudinary using stream
        const streamUpload = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `chatapp/${chatId}/images`,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                stream.pipe(uploadStream);
            });
        };

        try {
            const result = await streamUpload();
            const cloudinaryResult = result as CloudinaryResource; // Type assertion for cloudinary result

            const newMessage = new Message({
                chatId,
                senderId,
                content: cloudinaryResult.secure_url,
                type: "image",
            });

            await newMessage.save();

            const chat = await Chat.findById(chatId);
            if (!chat) {
                res.status(404).json({ message: "Chat not found" });
                return;
            }

            chat.messages.push(String(newMessage._id));
            chat.lastUpdated = new Date();
            await chat.save();

            res.status(200).json(newMessage);
        } catch (error) {
            console.error("Error uploading image to cloudinary", error);
            res.status(500).json({ message: "Error uploading image", error });
        }
    } catch (error) {
        console.error("Error handling image upload:", error);
        res.status(500).json({ message: "Error handling image upload", error });
    }
};