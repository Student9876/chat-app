import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for both Express and Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with frontend URL
        methods: ["GET", "POST"],
        credentials: true, // Allow cookies or credentials if needed
    },
});

// Middleware
app.use(cors({
    origin: "http://localhost:3000", // Allow frontend requests
    credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);

// Socket.IO real-time connection
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on("sendMessage", (data) => {
        console.log("Message received:", data);
        socket.broadcast.to(data.chatId).emit("messageReceived", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || "")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });



server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
