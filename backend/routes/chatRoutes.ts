import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { getUserChats, initiateChat } from "../controllers/chatController";

const router = express.Router();

// Route to fetch user chats
router.get("/", authenticate, getUserChats);
router.post("/initiate", authenticate, initiateChat);

export default router;
