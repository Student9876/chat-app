import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getUserChats } from "../controllers/chatController";

const router = express.Router();

// Route to fetch user chats
router.get("/", authenticate, getUserChats);

export default router;
