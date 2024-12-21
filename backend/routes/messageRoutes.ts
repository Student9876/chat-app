import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController";

const router = Router();

// Route for sending a message
router.post("/send", sendMessage);

// Route for getting messages for a particular chat
router.get("/:chatId", getMessages);

export default router;
