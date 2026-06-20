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
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000"
];
if (FRONTEND_URL) {
    allowedOrigins.push(FRONTEND_URL);
    if (FRONTEND_URL.endsWith("/")) {
        allowedOrigins.push(FRONTEND_URL.slice(0, -1));
    }
}

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json());

// Health check route for cron pings / keeping server awake
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
});

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
