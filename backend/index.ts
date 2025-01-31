import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import userRoutes from "./routes/userRoutes";
import messageRoutes from "./routes/messageRoutes";
import imageRoutes from "./routes/imageRoutes";

// Socket.IO setup
import { initializeSocket } from "./utils/socket";
import { cloudinaryConfig } from "./utils/cloudinary";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

// Middleware
app.use(cors({
    origin: [ FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/images", imageRoutes);

// Initialize Socket.IO
initializeSocket(server);

// Initialize Cloudinary
cloudinaryConfig(
    process.env.CLOUDINARY_CLOUD_NAME || "",
    process.env.CLOUDINARY_API_KEY || "",
    process.env.CLOUDINARY_API_SECRET || ""
);

// MongoDB connection and server start
mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
