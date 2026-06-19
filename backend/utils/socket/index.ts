import { Server } from "socket.io";
import { Server as HTTPServer } from "http"; // Import the type for an HTTP server

let io: Server | null = null;

export const initializeSocket = (server: HTTPServer): void => {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000"
    ];
    if (process.env.FRONTEND_URL) {
        const url = process.env.FRONTEND_URL;
        allowedOrigins.push(url);
        if (url.endsWith("/")) {
            allowedOrigins.push(url.slice(0, -1));
        }
    }

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join a chat room
        socket.on("joinChat", (chatId: string) => {
            console.log(`User ${socket.id} joined chat ${chatId}`);
            socket.join(chatId);
        });

        // Handle sending a message
        socket.on("sendMessage", (data) => {
            console.log(`Message received: ${JSON.stringify(data)}`);
            io?.to(data.chatId).emit("messageReceived", data);
        });

        // Handle user disconnection
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    console.log("Socket.IO initialized");
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.IO instance is not initialized");
    }
    return io;
};
