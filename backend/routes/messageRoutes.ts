import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Route for sending a message
router.post("/send", authenticate, sendMessage);

// Route for getting messages for a particular chat
router.get("/:chatId", getMessages);

export default router;
