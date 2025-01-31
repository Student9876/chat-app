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
const PORT_FRONTEND = process.env.PORT_FRONTEND;
const PORT_BACKEND = process.env.PORT_BACKEND;

// Middleware
app.use(cors({
    origin: [`http://localhost:${PORT_FRONTEND}`, `http://192.168.29.227:3000`],
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

server.listen(PORT_BACKEND, () => {
    console.log(`Server running on port ${PORT_BACKEND}`);
});
